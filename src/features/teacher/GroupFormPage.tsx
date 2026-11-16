import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostgrestError } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/auth-context";
import { ErrorCard } from "@/components/ui/Card";
import { groupLabel, todayISO } from "@/lib/format";
import { useMySchools } from "@/features/school/api";
import { useMyGroups } from "./api";

// MVP scope: the grades that have lessons
const OFFERS = [
  { key: "p3", level: "primary", grade: 3, label: "3.º grado · primaria" },
  { key: "s1", level: "secondary", grade: 1, label: "1.er año · secundaria" },
] as const;

const WEEKDAYS: [number, string][] = [
  [1, "Lunes"],
  [2, "Martes"],
  [3, "Miércoles"],
  [4, "Jueves"],
  [5, "Viernes"],
  [6, "Sábado"],
];
const LANGS = [
  ["es", "Español"],
  ["en", "Inglés"],
  ["miq", "Miskito"],
] as const;
const SECTIONS = "ABCDEFGHIJ".split("");

type Lang = (typeof LANGS)[number][0];

function groupError(e: PostgrestError): string {
  if (e.code === "23505")
    return "Ya existe un grupo con ese grado y sección en tu escuela este año.";
  if (e.code === "42501") return "No tenés permiso para hacer este cambio.";
  if (e.code === "23514")
    return "Revisá los datos: algo no cumple las reglas del grupo.";
  return "No pudimos guardar el grupo. Intentá de nuevo.";
}

export default function GroupFormPage() {
  const { groupId } = useParams();
  const editing = !!groupId;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session } = useAuth();
  const schools = useMySchools();
  const groups = useMyGroups();
  const current = groups.data?.find((g) => g.id === groupId);

  const [offer, setOffer] = useState<(typeof OFFERS)[number]["key"]>("p3");
  const [section, setSection] = useState("A");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [weekday, setWeekday] = useState<number | null>(null);
  const [language, setLanguage] = useState<Lang | null>(null);

  const school = schoolId ?? schools.data?.[0]?.school_id;
  const day = weekday ?? current?.class_weekday ?? 1;
  const lang = language ?? (current?.language as Lang | undefined) ?? "es";

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { data, error } = await supabase
          .from("groups")
          .update({ class_weekday: day, language: lang })
          .eq("id", groupId!)
          .select("id");
        if (error) throw error;
        if (!data?.length) throw { code: "42501" } as PostgrestError;
        return groupId!;
      }
      const o = OFFERS.find((x) => x.key === offer)!;
      const { data, error } = await supabase
        .from("groups")
        .insert({
          school_id: school!,
          teacher_id: session!.user.id,
          level: o.level,
          grade: o.grade,
          section,
          class_weekday: day,
          language: lang,
          school_year: Number(todayISO().slice(0, 4)),
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: async (id) => {
      await qc.invalidateQueries({ queryKey: ["my-groups"] });
      navigate(
        editing
          ? "/docente/grupos"
          : `/docente/grupos/${id}/estudiantes/agregar`,
      );
    },
  });

  if (schools.isLoading || groups.isLoading)
    return (
      <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
    );
  if (editing && !current)
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard message="No encontramos ese grupo." />
      </div>
    );
  if (!editing && !school)
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard message="Tu cuenta no está unida a una escuela." />
      </div>
    );

  const select =
    "mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 font-semibold outline-none focus:border-azul";

  return (
    <div className="mx-auto max-w-xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/docente/grupos"
          aria-label="Volver"
          className="rounded-full p-2 hover:bg-white"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold">
          {editing ? `Editar ${groupLabel(current!)}` : "Nuevo grupo"}
        </h1>
      </div>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          save.mutate();
        }}
        className="flex flex-col gap-4 rounded-card border border-linea bg-white p-5"
      >
        {!editing && (
          <>
            {(schools.data?.length ?? 0) > 1 && (
              <label className="block text-sm font-bold">
                Escuela
                <select
                  value={school}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className={select}
                >
                  {schools.data!.map((s) => (
                    <option key={s.school_id} value={s.school_id}>
                      {s.schools?.name ?? s.school_id}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <fieldset>
              <legend className="text-sm font-bold">Grado</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {OFFERS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setOffer(o.key)}
                    aria-pressed={offer === o.key}
                    className={`rounded-2xl border-2 px-4 py-3 text-left font-bold ${offer === o.key ? "border-azul bg-azul-suave text-azul" : "border-linea"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-tinta/60">
                Por ahora Pío tiene lecciones para estos dos grados.
              </p>
            </fieldset>
            <label className="block text-sm font-bold">
              Sección
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={select}
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className="block text-sm font-bold">
          Día de la clase de Siento y Crezco
          <select
            value={day}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className={select}
          >
            {WEEKDAYS.map(([n, label]) => (
              <option key={n} value={n}>
                {label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-tinta/60">
            Pío propone la fecha límite de cada lección según este día.
          </span>
        </label>

        <label className="block text-sm font-bold">
          Lengua del grupo
          <select
            value={lang}
            onChange={(e) => setLanguage(e.target.value as Lang)}
            className={select}
          >
            {LANGS.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-tinta/60">
            Se usa para las lecciones y la página de las familias. Cada
            estudiante puede cambiar la suya en la app.
          </span>
        </label>

        {save.error && (
          <p
            role="alert"
            className="rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo"
          >
            {groupError(save.error as PostgrestError)}
          </p>
        )}

        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-60"
        >
          {save.isPending
            ? "Guardando…"
            : editing
              ? "Guardar cambios"
              : "Crear grupo"}
        </button>
      </form>
    </div>
  );
}
