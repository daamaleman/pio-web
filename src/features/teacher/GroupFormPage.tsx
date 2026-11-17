import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { t as tr } from "@/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostgrestError } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/auth-context";
import { ErrorCard } from "@/components/ui/Card";
import { groupLabel, todayISO } from "@/lib/format";
import { useMySchools } from "@/features/school/api";
import { useMyGroups } from "./api";
import { usePageTitle } from "@/lib/usePageTitle";

// MVP scope: the grades that have lessons
const OFFERS = [
  { key: "p3", level: "primary", grade: 3, labelKey: "groupForm.offerP3" },
  { key: "s1", level: "secondary", grade: 1, labelKey: "groupForm.offerS1" },
] as const;

const WEEKDAYS = [1, 2, 3, 4, 5, 6] as const;
const LANGS = ["es", "en", "miq"] as const;
const SECTIONS = "ABCDEFGHIJ".split("");

type Lang = (typeof LANGS)[number];

function groupError(e: PostgrestError): string {
  if (e.code === "23505") return tr("groupForm.errors.duplicate");
  if (e.code === "42501") return tr("common.noPermission");
  if (e.code === "23514") return tr("groupForm.errors.rules");
  return tr("groupForm.errors.generic");
}

export default function GroupFormPage() {
  const { t } = useTranslation();
  const { groupId } = useParams();
  usePageTitle(groupId ? t("groupForm.editTitle") : t("groups.new"));
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
        <ErrorCard message={t("groupForm.notFound")} />
      </div>
    );
  if (!editing && !school)
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard message={t("groupForm.noSchool")} />
      </div>
    );

  const select =
    "mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 font-semibold outline-none focus:border-azul";

  return (
    <div className="mx-auto max-w-xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/docente/grupos"
          aria-label={t("common.back")}
          className="rounded-full p-2 hover:bg-white"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold">
          {editing ? t("groups.editAria", { group: groupLabel(current!) }) : t("groups.new")}
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
                {t("groupForm.school")}
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
              <legend className="text-sm font-bold">{t("groupForm.grade")}</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {OFFERS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setOffer(o.key)}
                    aria-pressed={offer === o.key}
                    className={`rounded-2xl border-2 px-4 py-3 text-left font-bold ${offer === o.key ? "border-azul bg-azul-suave text-azul" : "border-linea"}`}
                  >
                    {t(o.labelKey)}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-tinta/60">
                {t("groupForm.gradeHint")}
              </p>
            </fieldset>
            <label className="block text-sm font-bold">
              {t("groupForm.section")}
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
          {t("groupForm.weekday")}
          <select
            value={day}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className={select}
          >
            {WEEKDAYS.map((n) => (
              <option key={n} value={n}>
                {t(`weekdayName.${n}`)}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-tinta/60">
            {t("groupForm.weekdayHint")}
          </span>
        </label>

        <label className="block text-sm font-bold">
          {t("groupForm.language")}
          <select
            value={lang}
            onChange={(e) => setLanguage(e.target.value as Lang)}
            className={select}
          >
            {LANGS.map((v) => (
              <option key={v} value={v}>
                {t(`language.${v}`)}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-tinta/60">
            {t("groupForm.languageHint")}
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
            ? t("common.saving")
            : editing
              ? t("common.saveChanges")
              : t("groupForm.create")}
        </button>
      </form>
    </div>
  );
}
