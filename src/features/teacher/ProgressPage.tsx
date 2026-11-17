import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { t as tr } from "@/i18n";
import { ArrowLeft, BellRing, ChevronDown } from "lucide-react";
import { ErrorCard } from "@/components/ui/Card";
import { EmotionDrop } from "@/components/EmotionDrop";
import { initials } from "@/features/auth/useMyProfile";
import { supabase } from "@/lib/supabase";
import { pickText, relativeDay, shortDate, todayISO } from "@/lib/format";
import {
  useAssignmentProgress,
  type AssignmentProgress,
  type IndicatorResult,
} from "./api";
import { usePageTitle } from "@/lib/usePageTitle";

const AVATAR = [
  "#374EA2",
  "#1CABE2",
  "#FF5C93",
  "#D6336C",
  "#3B7D23",
  "#7A4FA0",
];

const RESULT: Record<
  Exclude<IndicatorResult, null> | "none",
  { label: string; cls: string }
> = {
  achieved: { get label() { return tr("progress.result.achieved"); }, cls: "bg-[#E6F4DC] text-[#2E6B12]" },
  in_progress: { get label() { return tr("progress.result.in_progress"); }, cls: "bg-[#FFF3D1] text-[#7A5600]" },
  needs_support: {
    get label() { return tr("progress.result.needs_support"); },
    cls: "bg-rosa-suave text-rosa-profundo",
  },
  none: { get label() { return tr("progress.result.none"); }, cls: "bg-arena text-tinta/60" },
};

type Student = AssignmentProgress["students"][number];

type RemindResult = {
  pending: number;
  queued: number;
  without_app: number;
  already_reminded: number;
};

function remindMessage(r: RemindResult): string {
  const parts: string[] = [];
  if (r.queued > 0) parts.push(tr("progress.remind.queued", { count: r.queued }));
  if (r.already_reminded > 0)
    parts.push(tr("progress.remind.already", { count: r.already_reminded }));
  if (r.without_app > 0)
    parts.push(tr("progress.remind.withoutApp", { count: r.without_app }));
  return parts.join(" ") || tr("progress.remind.none");
}

export default function ProgressPage() {
  const { t } = useTranslation();
  usePageTitle(t("progress.title"));
  const { id } = useParams();
  const progress = useAssignmentProgress(id);
  const [tab, setTab] = useState<"done" | "pending">("done");
  const remind = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("remind_pending", {
        p_assignment_id: id!,
      });
      if (error) throw error;
      return data as unknown as RemindResult;
    },
  });

  const back = (
    <Link
      to="/docente"
      aria-label={t("common.back")}
      className="rounded-full p-2 hover:bg-white"
    >
      <ArrowLeft size={22} />
    </Link>
  );

  if (progress.isLoading)
    return (
      <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
    );
  if (progress.error || !progress.data) {
    return (
      <div className="p-5 lg:p-10">
        {back}
        <ErrorCard
          message={t("progress.loadError")}
          onRetry={() => progress.refetch()}
        />
      </div>
    );
  }

  const p = progress.data;
  const done = p.students.filter((s) => s.status === "completed");
  const pending = p.students.filter((s) => s.status !== "completed");
  const overdue = p.due_date < todayISO();
  const list = tab === "done" ? done : pending;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-start gap-2">
        {back}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold">
            {pickText(p.title)}
          </h1>
          <p
            className={`text-sm ${overdue ? "font-bold text-rosa-profundo" : "text-tinta/60"}`}
          >
            {t(overdue ? "teacherHome.weekOverdue" : "teacherHome.weekDue", { week: p.week, date: shortDate(p.due_date) })}
          </p>
        </div>
      </div>

      {/* Ring + numbers */}
      <section className="flex items-center gap-6 rounded-card border border-linea bg-white p-5">
        <Ring pct={p.summary.completed_pct} />
        <dl className="grid flex-1 gap-2 text-sm">
          <Row label={t("progress.done")} value={p.summary.completed} />
          <Row label={t("progress.result.in_progress")} value={p.summary.in_progress} />
          <Row label={t("progress.notStarted")} value={p.summary.not_started} />
          <Row label={t("progress.badges")} value={p.summary.badges_earned} />
        </dl>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        className="mt-5 grid grid-cols-2 rounded-full bg-white p-1 text-sm font-bold"
      >
        <TabButton active={tab === "done"} onClick={() => setTab("done")}>
          {t("progress.done")} ({done.length})
        </TabButton>
        <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>
          {t("progress.pending")} ({pending.length})
        </TabButton>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-center text-tinta/60">
          {tab === "done"
            ? t("progress.noneDone")
            : t("progress.allDone")}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {list.map((s, i) => (
            <StudentRow key={s.id} s={s} color={AVATAR[i % AVATAR.length]} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-center text-xs text-tinta/50">
        {t("progress.emotionNote")}
      </p>
      {pending.length > 0 && (
        <div className="sticky bottom-24 mt-6 lg:bottom-6">
          {remind.data && (
            <p
              role="status"
              className="mb-2 rounded-2xl bg-[#E6F4DC] px-4 py-3 text-sm font-bold text-[#2E6B12]"
            >
              {remindMessage(remind.data)}
            </p>
          )}
          {remind.error && (
            <p
              role="alert"
              className="mb-2 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo"
            >
              {t("progress.remindError")}
            </p>
          )}
          <button
            onClick={() => remind.mutate()}
            disabled={remind.isPending || remind.isSuccess}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white shadow-lg disabled:opacity-60"
          >
            <BellRing size={20} />
            {remind.isPending
              ? t("progress.sending")
              : remind.isSuccess
                ? t("progress.sent")
                : t("progress.remindButton", { count: pending.length })}
          </button>
        </div>
      )}
    </div>
  );
}

function StudentRow({ s, color }: { s: Student; color: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const subtitle =
    s.status === "completed" && s.completed_at
      ? `${t("progress.finishedWhen", { when: relativeDay(s.completed_at) })}${s.on_time === false ? ` · ${t("progress.late")}` : ""}`
      : s.status === "in_progress"
        ? t("progress.inProgressStep", { step: s.current_position ?? 1 })
        : t("progress.notStarted");

  return (
    <li className="rounded-2xl border border-linea bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
          style={{ background: color }}
        >
          {initials(s.display_name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{s.display_name}</span>
          <span className="block text-xs text-tinta/60">{subtitle}</span>
        </span>
        {s.latest_emotion ? (
          <EmotionDrop emotion={s.latest_emotion} size={26} />
        ) : (
          <span
            className="h-6 w-6 rounded-full bg-linea"
            title={t("progress.noCheckin")}
          />
        )}
        <ChevronDown
          size={18}
          className={`text-tinta/40 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-linea px-4 py-3">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-tinta/60">
            {t("progress.indicators")}
          </p>
          {s.indicators.length === 0 ? (
            <p className="text-sm text-tinta/60">
              {t("progress.noIndicators")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {s.indicators.map((ind) => {
                const r = RESULT[ind.result ?? "none"];
                return (
                  <li
                    key={ind.number}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span>
                      <span className="font-bold">{pickText(ind.name)}</span>
                      <span className="block text-xs text-tinta/60">
                        {ind.indicator}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${r.cls}`}
                    >
                      {r.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      role="img"
      aria-label={tr("progress.ringAria", { pct })}
      className="shrink-0"
    >
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke="#ECE7E1"
        strokeWidth="12"
      />
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke="#6DBE45"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform="rotate(-90 55 55)"
      />
      <text
        x="55"
        y="62"
        textAnchor="middle"
        className="fill-tinta font-display text-[24px] font-extrabold"
      >
        {pct}%
      </text>
    </svg>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-tinta/70">{label}</dt>
      <dd className="font-extrabold">{value}</dd>
    </div>
  );
}

function TabButton({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full py-2.5 ${active ? "bg-azul text-white" : "text-tinta/60"}`}
    >
      {children}
    </button>
  );
}
