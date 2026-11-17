import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { locale } from "@/i18n";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ErrorCard } from "@/components/ui/Card";
import { GroupSelect } from "@/components/GroupSelect";
import { EmotionDrop } from "@/components/EmotionDrop";
import { EMOTIONS, type Emotion } from "@/lib/emotions";
import { classDates, classDatesInMonth } from "@/lib/classDates";
import { groupLabel, pickText, shortDate, todayISO } from "@/lib/format";
import { useGroupAssignments, useLessons, useMyGroups } from "./api";
import { useSelectedGroup } from "./useSelectedGroup";
import { usePageTitle } from "@/lib/usePageTitle";

function shiftMonth(first: string, delta: number) {
  const d = new Date(`${first}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return d.toISOString().slice(0, 10);
}

export default function PlanPage() {
  const { t } = useTranslation();
  usePageTitle(t("library.monthPlan"));
  const groups = useMyGroups();
  const [group, selectGroup] = useSelectedGroup(groups.data);
  const lessons = useLessons(group);
  const assignments = useGroupAssignments(group?.id);
  const today = todayISO();
  const [month, setMonth] = useState(`${today.slice(0, 7)}-01`);

  const plan = useMemo(() => {
    if (!group?.class_weekday || !lessons.data || !assignments.data)
      return null;
    const dates = classDatesInMonth(month, group.class_weekday);
    const thisClass = classDates(group.class_weekday).classDate;
    const byDate = new Map(assignments.data.map((a) => [a.class_date, a]));
    const assignedIds = new Set(assignments.data.map((a) => a.lesson_id));
    const queue = lessons.data.filter((l) => !assignedIds.has(l.id));
    const lessonById = new Map(lessons.data.map((l) => [l.id, l]));

    const rows = dates.map((date) => {
      const a = byDate.get(date);
      if (a)
        return {
          date,
          kind: "assigned" as const,
          lesson: lessonById.get(a.lesson_id),
          assignment: a,
        };
      if (date < thisClass) return { date, kind: "past" as const };
      const next = queue.shift();
      if (!next) return { date, kind: "free" as const };
      return {
        date,
        kind: date === thisClass ? ("now" as const) : ("future" as const),
        lesson: next,
      };
    });
    // Assignments in this month whose class date is not on the class weekday (the day was changed)
    const other = assignments.data.filter(
      (a) =>
        a.class_date.startsWith(month.slice(0, 7)) &&
        !dates.includes(a.class_date),
    );
    return { rows, other, lessonById };
  }, [group, lessons.data, assignments.data, month]);

  if (groups.isLoading)
    return (
      <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
    );
  if (!group)
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard message={t("plan.noGroups")} />
      </div>
    );

  const monthName = new Intl.DateTimeFormat(locale(), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}T12:00:00Z`));

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/docente/lecciones"
          aria-label={t("common.back")}
          className="rounded-full p-2 hover:bg-white"
        >
          <ArrowLeft size={22} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{t("library.monthPlan")}</h1>
          <p className="text-sm text-tinta/60">
            {groupLabel(group)}
            {group.class_weekday
              ? ` · ${t("plan.classOn", { day: t(`weekday.${group.class_weekday}`) })}`
              : ""}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {groups.data && (
          <GroupSelect
            groups={groups.data}
            value={group.id}
            onChange={selectGroup}
          />
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-white p-1 text-sm font-bold">
          <button
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label={t("plan.prevMonth")}
            className="rounded-full p-1.5 hover:bg-arena"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-2 capitalize">{monthName}</span>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            aria-label={t("plan.nextMonth")}
            className="rounded-full p-1.5 hover:bg-arena"
          >
            <ChevronRight size={18} />
          </button>
        </span>
      </div>

      {!group.class_weekday && (
        <ErrorCard message={t("plan.noWeekday")} />
      )}
      {(lessons.isLoading || assignments.isLoading) && (
        <div className="h-64 animate-pulse rounded-card bg-linea" />
      )}

      {plan && (
        <ol className="flex flex-col gap-3">
          {plan.rows.map((r, i) => (
            <li
              key={r.date}
              className={`rounded-card border bg-white p-4 ${r.kind === "now" ? "border-rosa ring-1 ring-rosa" : "border-linea"}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-azul-suave text-azul">
                  <CalendarDays size={16} />
                  <span className="text-[11px] font-extrabold">
                    {t("plan.classN", { n: i + 1 })}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-tinta/60">
                    {shortDate(r.date)}
                  </p>
                  {"lesson" in r && r.lesson ? (
                    <p className="flex items-center gap-1.5 truncate font-bold">
                      {r.lesson.emotion && (
                        <EmotionDrop
                          emotion={r.lesson.emotion as Emotion}
                          size={16}
                        />
                      )}
                      {t("library.week", { week: r.lesson.week })} · {pickText(r.lesson.title)}
                    </p>
                  ) : (
                    <p className="font-bold text-tinta/50">
                      {r.kind === "past"
                        ? t("plan.noLesson")
                        : t("plan.freeWeek")}
                    </p>
                  )}
                  {"lesson" in r && r.lesson?.emotion && (
                    <p className="text-xs text-tinta/60">
                      {EMOTIONS[r.lesson.emotion as Emotion].label}
                      {r.lesson.is_month_closure ? ` · ${t("library.monthClosure")}` : ""}
                    </p>
                  )}
                </div>
                {r.kind === "assigned" && (
                  <Link
                    to={`/docente/asignaciones/${r.assignment.id}`}
                    className="shrink-0 rounded-full border-2 border-linea px-3 py-1.5 text-sm font-bold"
                  >
                    {t("library.seeProgress")}
                  </Link>
                )}
                {r.kind === "now" && r.lesson && (
                  <Link
                    to={`/docente/lecciones/${r.lesson.id}/asignar`}
                    className="shrink-0 rounded-full bg-azul px-4 py-2 text-sm font-bold text-white"
                  >
                    {t("plan.assignNow")}
                  </Link>
                )}
              </div>
              {r.kind === "assigned" && (
                <p className="mt-2 text-xs font-bold text-azul">
                  {t("library.assignedDue", { date: shortDate(r.assignment.due_date) })}
                </p>
              )}
              {r.kind === "now" && today < r.date && (
                <p className="mt-2 text-xs font-bold text-rosa-profundo">
                  {t("plan.afterToday")}
                </p>
              )}
              {r.kind === "future" && (
                <p className="mt-2 text-xs text-tinta/60">
                  {t("plan.proposed")}
                </p>
              )}
              {i === 0 && (
                <Hint text={t("plan.hintStart")} />
              )}
              {i === plan.rows.length - 1 && plan.rows.length > 1 && (
                <Hint text={t("plan.hintEnd")} />
              )}
            </li>
          ))}
        </ol>
      )}

      {plan && plan.other.length > 0 && (
        <section className="mt-4 rounded-card border border-dashed border-linea bg-white p-4">
          <p className="text-sm font-bold">{t("plan.otherTitle")}</p>
          <p className="text-xs text-tinta/60">
            {t("plan.otherText")}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {plan.other.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/docente/asignaciones/${a.id}`}
                  className="font-bold text-azul hover:underline"
                >
                  {shortDate(a.class_date)} ·{" "}
                  {pickText(plan.lessonById.get(a.lesson_id)?.title ?? "")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-arena px-3 py-1.5 text-xs">
      <Sparkles size={14} className="shrink-0 text-rosa-profundo" /> {text}
    </p>
  );
}
