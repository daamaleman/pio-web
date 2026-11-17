import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import { usePageTitle } from "@/lib/usePageTitle";

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
  const { t } = useTranslation();
  usePageTitle(t("students.addMany"));
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
        <ErrorCard message={t("groupForm.notFound")} />
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
            {t("students.import.done", { count: r.created.length })}
          </h1>
          <p className="mt-1 rounded-2xl bg-[#FFF3D1] px-4 py-3 text-sm font-bold">
            {t("students.import.printNow")}
          </p>
          {r.errors.length > 0 && (
            <div className="mt-3 rounded-2xl bg-rosa-suave p-4 text-sm text-rosa-profundo">
              <p className="font-bold">{t("students.import.notAdded")}</p>
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
              <Printer size={18} /> {t("students.import.printCards")}
            </button>
            <Link
              to={back}
              className="flex flex-1 items-center justify-center rounded-full border-2 border-linea bg-white py-3 font-bold"
            >
              {t("teacherHome.seeStudents")}
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
          aria-label={t("common.back")}
          className="rounded-full p-2 hover:bg-white"
        >
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">{t("students.addMany")}</h1>
          <p className="text-sm text-tinta/60">
            {groupLabel(group)} · {t("students.import.upTo", { max: MAX_ROWS })}
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-card border-2 border-dashed border-azul/40 bg-white p-5 hover:bg-azul-suave">
        <FileSpreadsheet size={28} className="text-azul" />
        <span className="flex-1">
          <span className="block font-bold">
            {fileName ?? t("students.import.upload")}
          </span>
          <span className="block text-xs text-tinta/60">
            {t("students.import.columns")}
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
            {t("students.import.orPaste")}
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
          {t("students.import.removeFile")}
        </button>
      )}

      {preview.length > 0 && (
        <section className="mt-5">
          <p className="mb-2 text-sm font-bold text-tinta/60">
            {t("students.import.preview", { count: toSend.length })}
            {preview.length > toSend.length &&
              ` · ${t("students.import.withProblems", { count: preview.length - toSend.length })}`}
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
                    {r.display_name || t("students.import.empty")}
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
                  {r.pin ? `PIN ${r.pin}` : t("students.import.autoPin")}
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
            ? t("students.import.forbidden")
            : mutation.error.message === "NETWORK"
              ? t("common.network")
              : t("students.import.failed", { code: mutation.error.message })}
        </p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={toSend.length === 0 || mutation.isPending}
        className="mt-5 w-full rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-50"
      >
        {mutation.isPending
          ? t("students.import.adding")
          : t("students.import.submit", { count: toSend.length })}
      </button>
    </div>
  );
}
