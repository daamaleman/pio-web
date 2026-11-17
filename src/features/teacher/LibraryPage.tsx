import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, CalendarDays, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GroupSelect } from "@/components/GroupSelect";
import { EmotionDrop } from "@/components/EmotionDrop";
import { ErrorCard } from "@/components/ui/Card";
import { EMOTIONS, type Emotion } from "@/lib/emotions";
import { norm, pickText, shortDate, groupLabel } from "@/lib/format";
import { useGroupAssignments, useLessons, useMyGroups } from "./api";
import { useSelectedGroup } from "./useSelectedGroup";

export default function LibraryPage() {
  const { t } = useTranslation();
  const groups = useMyGroups();
  const [group, selectGroup] = useSelectedGroup(groups.data);
  const lessons = useLessons(group);
  const assigned = useGroupAssignments(group?.id);
  const [emotion, setEmotion] = useState<Emotion | "all">("all");
  const [query, setQuery] = useState("");

  const byLesson = useMemo(
    () => new Map((assigned.data ?? []).map((a) => [a.lesson_id, a])),
    [assigned.data],
  );
  const all = lessons.data ?? [];
  const emotionsInCatalog = [
    ...new Set(all.map((l) => l.emotion).filter(Boolean)),
  ] as Emotion[];
  const suggestedId = all.find((l) => !byLesson.has(l.id))?.id;
  const list = all.filter(
    (l) =>
      (emotion === "all" || l.emotion === emotion) &&
      norm(pickText(l.title)).includes(norm(query)),
  );

  return (
    <div className="pb-6">
      <PageHeader
        title={t("nav.lessons")}
        subtitle={group ? t("library.forGroup", { group: groupLabel(group) }) : undefined}
      />

      <div className="flex flex-col gap-4 px-5 lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          {groups.data && (
            <GroupSelect
              groups={groups.data}
              value={group?.id}
              onChange={selectGroup}
            />
          )}
          <Link
            to="/docente/plan"
            className="flex items-center gap-2 rounded-full border-2 border-linea bg-white px-4 py-2 text-sm font-bold"
          >
            <CalendarDays size={16} /> {t("library.monthPlan")}
          </Link>
        </div>

        <label className="flex items-center gap-2 rounded-full border-2 border-linea bg-white px-4 py-2.5 focus-within:border-azul">
          <Search size={18} className="text-tinta/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("library.search")}
            className="w-full bg-transparent outline-none"
          />
        </label>

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          <Chip active={emotion === "all"} onClick={() => setEmotion("all")}>
            {t("library.all")}
          </Chip>
          {emotionsInCatalog.map((e) => (
            <Chip key={e} active={emotion === e} onClick={() => setEmotion(e)}>
              <EmotionDrop emotion={e} size={16} /> {EMOTIONS[e].label}
            </Chip>
          ))}
        </div>

        {(lessons.isLoading || assigned.isLoading) && (
          <div className="h-40 animate-pulse rounded-card bg-linea" />
        )}
        {lessons.error && (
          <ErrorCard
            message={t("library.loadError")}
            onRetry={() => lessons.refetch()}
          />
        )}

        {lessons.data && (
          <>
            <p className="text-sm font-bold text-tinta/60">
              {t("library.count", { count: list.length })}
            </p>
            {list.length === 0 && (
              <p className="text-tinta/70">{t("library.noMatch")}</p>
            )}
            <ul className="grid gap-3 lg:grid-cols-2">
              {list.map((l) => {
                const a = byLesson.get(l.id);
                const e = l.emotion as Emotion | null;
                const title = pickText(l.title);
                const suggested = l.id === suggestedId;
                return (
                  <li
                    key={l.id}
                    className={`rounded-2xl border bg-white p-3 ${suggested ? "border-rosa ring-1 ring-rosa" : "border-linea"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: e ? `${EMOTIONS[e].color}33` : "#F7F5F2",
                        }}
                      >
                        {e ? (
                          <EmotionDrop emotion={e} size={26} />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-tinta/60">
                          {e ? EMOTIONS[e].label : t("library.lesson")} · {t("library.week", { week: l.week })}
                        </p>
                        <Link to={`/docente/lecciones/${l.id}`} className="block truncate font-bold hover:text-azul hover:underline">{title}</Link>
                        <p className="text-xs text-tinta/60">
                          {l.duration_min ? `${l.duration_min} min · ` : ""}
                          {t("library.parts", { count: l.parts_count })}
                          {l.is_month_closure ? ` · ${t("library.monthClosure")}` : ""}
                        </p>
                        {a && (
                          <p className="text-xs font-bold text-azul">
                            {t("library.assignedDue", { date: shortDate(a.due_date) })}
                          </p>
                        )}
                      </div>
                      {a ? (
                        <Link
                          to={`/docente/asignaciones/${a.id}`}
                          className="shrink-0 rounded-full border-2 border-linea px-3 py-1.5 text-sm font-bold"
                        >
                          {t("library.seeProgress")}
                        </Link>
                      ) : (
                        <Link
                          to={`/docente/lecciones/${l.id}/asignar`}
                          aria-label={t("library.assignAria", { title })}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azul text-white"
                        >
                          <Plus size={20} />
                        </Link>
                      )}
                    </div>
                    {suggested && (
                      <p className="mt-2 text-xs font-bold text-rosa-profundo">
                        {t("library.suggested")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-azul text-white"
          : "border border-linea bg-white text-tinta"
      }`}
    >
      {children}
    </button>
  );
}
