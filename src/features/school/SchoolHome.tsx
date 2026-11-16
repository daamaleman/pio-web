import { useState } from "react";
import { Link } from "react-router";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/auth-context";
import { ClimateBar, ClimateCard } from "@/components/ClimateCard";
import { ErrorCard } from "@/components/ui/Card";
import { addDays, mondayOf } from "@/lib/classDates";
import { groupLabel, shortDate, todayISO } from "@/lib/format";
import { ROLE_LABEL, isStaff } from "@/lib/roles";
import { useMySchools, useSchoolOverview } from "./api";
import { ChatToggle, useSchoolGroupsChat } from "./ChatToggle";

export default function SchoolHome() {
  const { role } = useAuth();
  const schools = useMySchools();
  const currentMonday = mondayOf(todayISO());
  const [weekStart, setWeekStart] = useState(currentMonday);
  const schoolId = schools.data?.[0]?.school_id;
  const overview = useSchoolOverview(schoolId, weekStart);
  const chat = useSchoolGroupsChat(schoolId);
  const isCurrentWeek = weekStart === currentMonday;

  if (schools.isLoading)
    return (
      <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
    );
  if (schools.error)
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard
          message="No pudimos cargar tu escuela."
          onRetry={() => schools.refetch()}
        />
      </div>
    );
  if (!schoolId) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <img src="/pio-mascota.png" alt="" className="h-24 w-24" />
        <h1 className="text-2xl font-bold">
          Tu cuenta todavía no está unida a una escuela
        </h1>
        <p className="text-tinta/70">
          Pedile al equipo de administración que te agregue.
        </p>
      </div>
    );
  }

  const o = overview.data;

  return (
    <div className="pb-10">
      {/* Header */}
      <header className="rounded-b-[2rem] bg-azul px-5 pb-6 pt-6 text-white lg:mx-10 lg:mt-8 lg:rounded-[2rem] lg:px-8">
        <p className="text-sm text-white/75">
          {isStaff(role) ? ROLE_LABEL[role] : ""}
        </p>
        <h1 className="font-display text-3xl font-extrabold">
          {o?.school.name ?? "Mi escuela"}
        </h1>
        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 p-1 text-sm font-semibold">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            aria-label="Semana anterior"
            className="rounded-full p-1.5 hover:bg-white/20"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-2">
            {isCurrentWeek
              ? "Esta semana"
              : `Semana del ${shortDate(weekStart)}`}
          </span>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            disabled={isCurrentWeek}
            aria-label="Semana siguiente"
            className="rounded-full p-1.5 hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {overview.isLoading && (
        <div className="mx-5 mt-5 h-64 animate-pulse rounded-card bg-linea lg:mx-10" />
      )}
      {overview.error && (
        <div className="px-5 pt-5 lg:px-10">
          <ErrorCard
            message="No pudimos cargar el panel de la escuela."
            onRetry={() => overview.refetch()}
          />
        </div>
      )}

      {o && (
        <div className="flex flex-col gap-4 px-5 pt-5 lg:px-10">
          {/* Totals */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Total value={o.totals.groups} label="grupos" />
            <Total value={o.totals.teachers} label="docentes" />
            <Total value={o.totals.students} label="estudiantes" />
            <Total value={o.totals.badges_earned} label="sellos" />
            <Link
              to="/escuela/alertas"
              className={`col-span-2 rounded-card border px-3 py-4 text-center sm:col-span-1 ${o.totals.active_alerts > 0 ? "border-rosa bg-rosa-suave" : "border-linea bg-white"}`}
            >
              <p
                className={`flex items-center justify-center gap-1.5 font-display text-2xl font-extrabold ${o.totals.active_alerts > 0 ? "text-rosa-profundo" : ""}`}
              >
                <Bell size={20} /> {o.totals.active_alerts}
              </p>
              <p className="text-xs font-semibold text-tinta/60">
                alertas activas
              </p>
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <ClimateCard
              climate={o.climate}
              title="Cómo se sintió la escuela"
              aside={isCurrentWeek ? "Esta semana" : shortDate(weekStart)}
            />

            {/* Groups */}
            <section className="rounded-card border border-linea bg-white p-5">
              <h2 className="mb-4 text-lg font-bold">Grupos</h2>
              <ul className="flex flex-col gap-3">
                {o.groups.map((g) => {
                  const a = g.current_assignment;
                  const activeAlerts = g.alerts.open + g.alerts.in_attention;
                  return (
                    <li
                      key={g.id}
                      className="rounded-2xl border border-linea p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-bold">{groupLabel(g)}</p>
                          <p className="text-xs text-tinta/60">
                            {g.teacher_name ?? "Sin docente"} · {g.students}{" "}
                            estudiantes · {g.badges_earned} sellos
                          </p>
                        </div>
                        {activeAlerts > 0 && (
                          <span className="rounded-full bg-rosa-suave px-3 py-1 text-xs font-bold text-rosa-profundo">
                            {activeAlerts}{" "}
                            {activeAlerts === 1 ? "alerta" : "alertas"}
                            {g.alerts.in_attention > 0 &&
                              ` · ${g.alerts.in_attention} en atención`}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-tinta/50">
                            Lección actual
                          </p>
                          {a ? (
                            <>
                              <p className="text-sm font-semibold">
                                Semana {a.week} · vence {shortDate(a.due_date)}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-linea">
                                  <div
                                    className={`h-2 rounded-full ${a.completed_pct >= 50 ? "bg-[#6DBE45]" : "bg-alegria"}`}
                                    style={{ width: `${a.completed_pct}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-tinta/60">
                                  {a.completed}/{a.targeted}
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-tinta/50">
                              Sin lección asignada
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-tinta/50">
                            Clima
                          </p>
                          <ClimateBar climate={g.climate} />
                        </div>
                      </div>
                      {g.level === "secondary" && chat.data && (
                        <ChatToggle
                          groupId={g.id}
                          groupName={groupLabel(g)}
                          enabled={!!chat.data.get(g.id)}
                          canEdit={role === "director"}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <p className="text-center text-xs text-tinta/50">
            Este panel solo muestra números y agregados. Los nombres aparecen
            únicamente en Alertas, para quien tiene que atender cada caso.
          </p>
        </div>
      )}
    </div>
  );
}

function Total({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-card border border-linea bg-white px-3 py-4 text-center">
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold text-tinta/60">{label}</p>
    </div>
  );
}
