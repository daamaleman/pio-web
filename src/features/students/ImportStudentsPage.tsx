import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowLeft,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ErrorCard } from "@/components/ui/Card";
import { groupLabel } from "@/lib/format";
import { useGroupStudents, useMyGroups } from "@/features/teacher/api";
import { PinCard, PinCardSheet } from "./PinCard";
import { buildPreview, MAX_ROWS, ROW_ERROR } from "./rules";

type ImportResult = {
  created: { id: string; display_name: string; pin: string }[];
  errors: { row: number; display_name: string; code: string }[];
  warnings: unknown[];
};

const HEADER = /^(nombre|nombres|name|estudiante|student)/i;

function parseLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, pin] = l.split(/\t|;|,/);
      return { name: name ?? "", pin: pin?.trim() };
    })
    .filter((r, i) => !(i === 0 && HEADER.test(r.name)));
}

async function parseFile(file: File) {
  const XLSX = await import("xlsx"); // loaded only when a file is uploaded
  const wb = XLSX.read(await file.arrayBuffer());
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    blankrows: false,
    raw: false,
  });
  return rows
    .map((r) => ({
      name: String(r[0] ?? ""),
      pin: r[1] != null ? String(r[1]) : undefined,
    }))
    .filter((r, i) => r.name.trim() && !(i === 0 && HEADER.test(r.name)));
}

async function functionErrorCode(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const body = await error.context.json().catch(() => null);
    return body?.error?.code ?? "INTERNAL_ERROR";
  }
  return "NETWORK";
}

export default function ImportStudentsPage() {
  const { groupId } = useParams();
  const qc = useQueryClient();
  const groups = useMyGroups();
  const group = groups.data?.find((g) => g.id === groupId);
  const existing = useGroupStudents(groupId);
  const [text, setText] = useState("");
  const [fileRows, setFileRows] = useState<
    { name: string; pin?: string }[] | null
  >(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const source = fileRows ?? parseLines(text);
  const preview = useMemo(
    () =>
      group
        ? buildPreview(
            source,
            (existing.data ?? []).map((s) => s.display_name),
            group.level,
          )
        : [],
    [source, existing.data, group],
  );
  const toSend = preview.filter((r) => !r.problem);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "import-students",
        {
          body: {
            group_id: group!.id,
            students: toSend.map((r) =>
              r.pin
                ? { display_name: r.display_name, pin: r.pin }
                : { display_name: r.display_name },
            ),
          },
        },
      );
      if (error) throw new Error(await functionErrorCode(error));
      return data as ImportResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-students", groupId] });
      qc.invalidateQueries({ queryKey: ["group-overview", groupId] });
    },
  });

  if (groups.isLoading)
    return (
      <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
    );
  if (!group)
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard message="No encontramos el grupo." />
      </div>
    );

  const back = `/docente/grupos/${group.id}/estudiantes`;

  // ---- Result ----
  if (mutation.data) {
    const r = mutation.data;
    return (
      <div className="mx-auto max-w-3xl px-5 pb-10 pt-4 lg:pt-8">
        <div className="mb-4 print:hidden">
          <h1 className="text-2xl font-extrabold">
            Listo: {r.created.length}{" "}
            {r.created.length === 1
              ? "estudiante agregado"
              : "estudiantes agregados"}
          </h1>
          <p className="mt-1 rounded-2xl bg-[#FFF3D1] px-4 py-3 text-sm font-bold">
            Imprimí o anotá los PIN ahora: después no se pueden volver a ver. Si
            alguien pierde el suyo, generale uno nuevo.
          </p>
          {r.errors.length > 0 && (
            <div className="mt-3 rounded-2xl bg-rosa-suave p-4 text-sm text-rosa-profundo">
              <p className="font-bold">No se agregaron:</p>
              <ul className="mt-1 list-inside list-disc">
                {r.errors.map((e) => (
                  <li key={`${e.row}-${e.display_name}`}>
                    {e.display_name}: {ROW_ERROR[e.code] ?? e.code}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-azul py-3 font-bold text-white"
            >
              <Printer size={18} /> Imprimir tarjetas
            </button>
            <Link
              to={back}
              className="flex flex-1 items-center justify-center rounded-full border-2 border-linea bg-white py-3 font-bold"
            >
              Ver estudiantes
            </Link>
          </div>
        </div>
        <PinCardSheet>
          {r.created.map((s) => (
            <PinCard
              key={s.id}
              name={s.display_name}
              groupText={groupLabel(group)}
              classCode={group.class_code}
              pin={s.pin}
              level={group.level}
            />
          ))}
        </PinCardSheet>
      </div>
    );
  }

  // ---- Input + preview ----
  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link
          to={back}
          aria-label="Volver"
          className="rounded-full p-2 hover:bg-white"
        >
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">Agregar estudiantes</h1>
          <p className="text-sm text-tinta/60">
            {groupLabel(group)} · hasta {MAX_ROWS} por vez
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-card border-2 border-dashed border-azul/40 bg-white p-5 hover:bg-azul-suave">
        <FileSpreadsheet size={28} className="text-azul" />
        <span className="flex-1">
          <span className="block font-bold">
            {fileName ?? "Subir Excel o CSV"}
          </span>
          <span className="block text-xs text-tinta/60">
            Columna A: nombre y apellido. Columna B (opcional): PIN.
          </span>
        </span>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setFileName(f.name);
            setFileRows(await parseFile(f));
          }}
        />
      </label>

      {!fileRows && (
        <>
          <p className="my-3 text-center text-sm font-bold text-tinta/50">
            o pegá la lista, un estudiante por línea
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={"Ana Morales\nLuis Rivas, 2468"}
            className="w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 outline-none focus:border-azul"
          />
        </>
      )}
      {fileRows && (
        <button
          onClick={() => {
            setFileRows(null);
            setFileName(null);
          }}
          className="mt-2 text-sm font-bold text-azul underline"
        >
          Quitar archivo
        </button>
      )}

      {preview.length > 0 && (
        <section className="mt-5">
          <p className="mb-2 text-sm font-bold text-tinta/60">
            Vista previa: {toSend.length} se van a agregar
            {preview.length > toSend.length &&
              ` · ${preview.length - toSend.length} con problemas`}
          </p>
          <ul className="overflow-hidden rounded-card border border-linea bg-white text-sm">
            {preview.map((r) => (
              <li
                key={r.line}
                className={`flex items-start gap-3 border-b border-linea px-4 py-2.5 last:border-0 ${r.problem ? "bg-rosa-suave/60" : ""}`}
              >
                <span className="w-6 shrink-0 text-tinta/40">{r.line}</span>
                <span className="flex-1">
                  <span
                    className={`font-bold ${r.problem ? "line-through opacity-60" : ""}`}
                  >
                    {r.display_name || "(vacío)"}
                  </span>
                  {r.problem && (
                    <span className="block text-xs font-bold text-rosa-profundo">
                      {r.problem}
                    </span>
                  )}
                  {r.warning && (
                    <span className="flex items-center gap-1 text-xs text-[#7A5600]">
                      <AlertTriangle size={12} /> {r.warning}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-tinta/60">
                  {r.pin ? `PIN ${r.pin}` : "PIN automático"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {mutation.error && (
        <p
          role="alert"
          className="mt-4 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo"
        >
          {mutation.error.message === "FORBIDDEN"
            ? "No tenés permiso para agregar estudiantes a este grupo."
            : mutation.error.message === "NETWORK"
              ? "No pudimos conectar con el servidor. Revisá tu conexión."
              : `No se pudo agregar (${mutation.error.message}).`}
        </p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={toSend.length === 0 || mutation.isPending}
        className="mt-5 w-full rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-50"
      >
        {mutation.isPending
          ? "Agregando…"
          : `Agregar ${toSend.length} ${toSend.length === 1 ? "estudiante" : "estudiantes"}`}
      </button>
    </div>
  );
}
