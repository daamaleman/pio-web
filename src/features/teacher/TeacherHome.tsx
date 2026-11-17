import { Link, useLocation } from "react-router";
import { Bell, BookOpen, ChevronDown } from "lucide-react";
import { Card, ErrorCard } from "@/components/ui/Card";
import { EmotionDrop } from "@/components/EmotionDrop";
import { EMOTIONS } from "@/lib/emotions";
import {
  greeting,
  groupLabel,
  pickText,
  shortDate,
  todayISO,
} from "@/lib/format";
import { initials, useMyProfile } from "@/features/auth/useMyProfile";
import {
  useGroupAlerts,
  useGroupOverview,
  useMyGroups,
  type GroupOverview,
  type OverviewAssignment,
} from "./api";
import { useSelectedGroup } from "./useSelectedGroup";
import { usePageTitle } from "@/lib/usePageTitle";

function currentAssignment(
  list: OverviewAssignment[],
): OverviewAssignment | undefined {
  const today = todayISO();
  const upcoming = list
    .filter((a) => a.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  return (
    upcoming[0] ??
    [...list].sort((a, b) => b.due_date.localeCompare(a.due_date))[0]
  );
}

export default function TeacherHome() {
  usePageTitle("Inicio");
  const groups = useMyGroups();
  const [group, selectGroup] = useSelectedGroup(groups.data);
  const overview = useGroupOverview(group?.id);
  const alerts = useGroupAlerts(group?.id);
  const { data: profile } = useMyProfile();
  const openAlerts = alerts.data ?? [];
  const flash = (useLocation().state as { flash?: string } | null)?.flash;

  if (groups.isLoading) return <PanelSkeleton />;
  if (groups.error)
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard
          message="No pudimos cargar tus grupos."
          onRetry={() => groups.refetch()}
        />
      </div>
    );

  if (!groups.data?.length) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <img src="/pio-mascota.png" alt="" className="h-24 w-24" />
        <h1 className="text-2xl font-bold">Todavía no tenés grupos</h1>
        <p className="text-tinta/70">
          Cuando la dirección te asigne un grupo, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Blue header (Figma) */}
      <header className="rounded-b-[2rem] bg-azul px-5 pb-6 pt-6 text-white lg:mx-10 lg:mt-8 lg:rounded-[2rem] lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rosa font-extrabold">
            {initials(profile?.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/75">{greeting()},</p>
            <p className="truncate font-display text-xl font-bold">
              Prof. {profile?.full_name ?? ""}
            </p>
          </div>
          <Link
            to="/docente/alertas"
            aria-label="Alertas"
            className="relative rounded-full bg-white p-2.5 text-azul"
          >
            <Bell size={20} />
            {openAlerts.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-rosa ring-2 ring-azul" />
            )}
          </Link>
        </div>

        <div className="relative mt-4 inline-flex max-w-full items-center rounded-full bg-white/15 text-sm font-semibold">
          {groups.data.length > 1 ? (
            <>
              <select
                value={group?.id}
                onChange={(e) => selectGroup(e.target.value)}
                aria-label="Elegir grupo"
                className="cursor-pointer appearance-none truncate bg-transparent py-2 pl-4 pr-9 outline-none"
              >
                {groups.data.map((g) => (
                  <option key={g.id} value={g.id} className="text-tinta">
                    {groupLabel(g)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3"
              />
            </>
          ) : (
            <span className="px-4 py-2">{group && groupLabel(group)}</span>
          )}
          {overview.data && (
            <span className="truncate pr-4 text-white/75">
              · {overview.data.group.school_name}
            </span>
          )}
        </div>
      </header>

      {flash && (
        <p
          role="status"
          className="mx-5 mt-4 rounded-2xl bg-[#E6F4DC] px-4 py-3 font-bold text-[#2E6B12] lg:mx-10"
        >
          ✓ {flash}
        </p>
      )}

      {overview.isLoading && <PanelSkeleton body />}
      {overview.error && (
        <div className="px-5 pt-5 lg:px-10">
          <ErrorCard
            message="No pudimos cargar el panel del grupo."
            onRetry={() => overview.refetch()}
          />
        </div>
      )}
      {overview.data && <PanelBody data={overview.data} alerts={openAlerts} />}
    </div>
  );
}

function PanelBody({
  data,
  alerts,
}: {
  data: GroupOverview;
  alerts: { student_id: string; reason_code: string }[];
}) {
  const current = currentAssignment(data.assignments);
  const today = todayISO();
  const streak = new Set(
    alerts
      .filter((a) => a.reason_code === "difficult_emotions_streak")
      .map((a) => a.student_id),
  ).size;
  const helpRequests = new Set(
    alerts
      .filter((a) => a.reason_code === "help_request")
      .map((a) => a.student_id),
  ).size;
  const climate = data.climate;

  return (
    <div className="grid gap-4 px-5 pt-5 lg:grid-cols-2 lg:px-10">
      <div className="flex flex-col gap-4">
        {/* 3 numbers */}
        <div className="grid grid-cols-3 gap-3">
          <Stat
            value={current ? `${current.completed}/${current.targeted}` : "—"}
            label="terminaron"
          />
          <Stat
            value={String(data.assignments.length)}
            label={data.assignments.length === 1 ? "tarea" : "tareas"}
          />
          <Stat value={String(data.badges_earned)} label="sellos" />
        </div>

        {/* Group climate */}
        <Card title="Cómo se sintió el grupo" aside="Esta semana">
          {climate.hidden ? (
            <p className="text-sm text-tinta/70">
              Se muestra cuando al menos {climate.min_respondents} estudiantes
              hagan su check-in esta semana. Así nadie queda identificado.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-1">
                {climate.distribution.map((d) => (
                  <div
                    key={d.emotion}
                    className="flex flex-col items-center gap-1"
                  >
                    <EmotionDrop emotion={d.emotion} size={34} />
                    <span className="text-sm font-extrabold">{d.pct}%</span>
                    <span className="text-[11px] text-tinta/60">
                      {EMOTIONS[d.emotion].label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-tinta/60">
                {climate.checkins} check-ins
                {climate.declined > 0 &&
                  ` · ${climate.declined} prefirieron no decirlo`}{" "}
                · sin nombres
              </p>
            </>
          )}
        </Card>

        {/* Support notice */}
        {(streak > 0 || helpRequests > 0) && (
          <section className="flex gap-3 rounded-card bg-[#FFF3D1] p-4">
            <img src="/pio-mascota.png" alt="" className="h-12 w-12 shrink-0" />
            <div className="text-sm">
              {streak > 0 && (
                <>
                  <p className="font-bold">
                    {streak === 1
                      ? "1 estudiante podría necesitar apoyo"
                      : `${streak} estudiantes podrían necesitar apoyo`}
                  </p>
                  <p className="mt-0.5 text-tinta/75">
                    Marcaron tristeza, miedo o enojo 3 días o más esta semana.
                    Considerá una conversación individual.
                  </p>
                </>
              )}
              {helpRequests > 0 && (
                <p className={`font-bold ${streak > 0 ? "mt-2" : ""}`}>
                  {helpRequests === 1
                    ? "1 estudiante pidió hablar con vos"
                    : `${helpRequests} estudiantes pidieron hablar con vos`}
                </p>
              )}
              <Link
                to="/docente/alertas"
                className="mt-1 inline-block font-bold text-azul underline-offset-2 hover:underline"
              >
                Ver estudiantes
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Active assignments */}
      <Card title="Tareas activas" className="self-start">
        {data.assignments.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-tinta/70">
              No hay tareas activas en este grupo.
            </p>
            <Link
              to="/docente/lecciones"
              className="mt-3 inline-block rounded-full bg-azul px-5 py-2.5 font-display font-bold text-white"
            >
              Asignar la lección de la semana
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {data.assignments.map((a) => {
              const pct = a.targeted
                ? Math.round((a.completed / a.targeted) * 100)
                : 0;
              const overdue = a.due_date < today;
              return (
                <li key={a.assignment_id}>
                  <Link
                    to={`/docente/asignaciones/${a.assignment_id}`}
                    className="flex items-center gap-3 rounded-2xl border border-linea p-3 transition hover:bg-arena"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rosa-suave text-rosa-profundo">
                      <BookOpen size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{pickText(a.title)}</p>
                      <p
                        className={`text-xs ${overdue ? "font-bold text-rosa-profundo" : "text-tinta/60"}`}
                      >
                        Semana {a.week} · {overdue ? "venció" : "vence"}{" "}
                        {shortDate(a.due_date)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-linea">
                          <div
                            className={`h-2 rounded-full ${pct >= 50 ? "bg-[#6DBE45]" : "bg-alegria"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-tinta/60">
                          {a.completed}/{a.targeted}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-linea bg-white px-3 py-4 text-center">
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold text-tinta/60">{label}</p>
    </div>
  );
}

function PanelSkeleton({ body = false }: { body?: boolean }) {
  return (
    <div className="animate-pulse px-5 pt-5 lg:px-10">
      {!body && <div className="mb-5 h-36 rounded-[2rem] bg-azul/20" />}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-card bg-linea" />
        <div className="h-64 rounded-card bg-linea" />
      </div>
    </div>
  );
}
