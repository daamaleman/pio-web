import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, QrCode, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorCard } from "@/components/ui/Card";
import { groupLabel } from "@/lib/format";
import { useMyGroups } from "./api";

export default function GroupsPage() {
  const { t } = useTranslation();
  const groups = useMyGroups();

  return (
    <div className="pb-10">
      <div className="flex items-end justify-between gap-3 pr-5 lg:pr-10">
        <PageHeader
          title={t("groups.title")}
          subtitle={t("groups.subtitle")}
        />
        <Link
          to="/docente/grupos/nuevo"
          className="mb-2 flex shrink-0 items-center gap-2 rounded-full bg-azul px-4 py-2.5 font-bold text-white"
        >
          <Plus size={18} />{" "}
          <span className="hidden sm:inline">{t("groups.new")}</span>
        </Link>
      </div>
      <div className="grid gap-3 px-5 lg:grid-cols-2 lg:px-10">
        {groups.isLoading && (
          <div className="h-40 animate-pulse rounded-card bg-linea" />
        )}
        {groups.error && (
          <ErrorCard
            message={t("teacherHome.groupsError")}
            onRetry={() => groups.refetch()}
          />
        )}
        {groups.data?.map((g) => (
          <section
            key={g.id}
            className="rounded-card border border-linea bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{groupLabel(g)}</h2>
                {g.class_weekday && (
                  <p className="text-sm text-tinta/60">
                    {t("groups.classOn", { day: t(`weekday.${g.class_weekday}`) })}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/docente/grupos/${g.id}/editar`}
                  aria-label={t("groups.editAria", { group: groupLabel(g) })}
                  className="rounded-full border-2 border-linea p-2.5 text-tinta/70 hover:bg-arena"
                >
                  <Pencil size={18} />
                </Link>
                <span className="rounded-full bg-azul-suave p-2.5 text-azul">
                  <Users size={20} />
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-tinta/60">
              {t("students.classCode")}
            </p>
            <p className="font-display text-4xl font-extrabold tracking-[0.2em] text-azul">
              {g.class_code}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/docente/grupos/${g.id}/qr`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-azul py-2.5 font-bold text-white"
              >
                <QrCode size={18} /> {t("groups.qr")}
              </Link>
              <Link
                to={`/docente/grupos/${g.id}/estudiantes`}
                className="flex flex-1 items-center justify-center rounded-full border-2 border-linea py-2.5 font-bold"
              >
                {t("groups.students")}
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-bold text-azul">
              <Link to={`/bienestar/${g.id}`} className="hover:underline">
                {t("groups.wellbeing")} →
              </Link>
              <Link
                to={`/docente/grupos/${g.id}/familias`}
                className="hover:underline"
              >
                {t("groups.families")} →
              </Link>
              <Link to={`/docente/reportes/${g.id}`} className="hover:underline">
                {t("groups.report")} →
              </Link>
              {g.level === "secondary" && (
                <Link
                  to={`/docente/grupos/${g.id}/preguntas`}
                  className="hover:underline"
                >
                  {t("groups.questions")} →
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
