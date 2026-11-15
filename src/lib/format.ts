import type { Json } from "./database.types";

const TZ = "America/Managua";
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
const timeFmt = new Intl.DateTimeFormat("es-NI", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const weekdayFmt = new Intl.DateTimeFormat("es-NI", {
  timeZone: TZ,
  weekday: "long",
});

// "2026-11-15" in Nicaragua time (not UTC)
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

// "2026-11-16" -> "lun 16 nov". Uses noon UTC so the day never shifts.
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("es-NI", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${iso}T12:00:00Z`))
    .replace(/\./g, "");
}

// "hoy, 7:12 p. m." · "ayer, 6:40 p. m." · "el lunes" · "el 2 nov"
export function relativeDay(timestamp: string): string {
  const d = new Date(timestamp);
  const day = dayFmt.format(d);
  const today = todayISO();
  const diff = Math.round(
    (Date.parse(`${today}T12:00:00Z`) - Date.parse(`${day}T12:00:00Z`)) /
      86_400_000,
  );
  if (diff === 0) return `hoy, ${timeFmt.format(d)}`;
  if (diff === 1) return `ayer, ${timeFmt.format(d)}`;
  if (diff > 1 && diff < 7) return `el ${weekdayFmt.format(d)}`;
  return `el ${shortDate(day).replace(/^\S+\s/, "")}`;
}

// Lesson titles come as { "es": "...", "en": "..." }
export function pickText(value: Json | undefined, lang = "es"): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, Json | undefined>;
    const text = obj[lang] ?? obj.es ?? Object.values(obj)[0];
    return typeof text === "string" ? text : "";
  }
  return "";
}

export function groupLabel(g: {
  level: string;
  grade: number;
  section: string;
}): string {
  if (g.level === "primary") return `${g.grade}.º grado ${g.section}`;
  return `${g.grade === 1 ? "1.er" : `${g.grade}.º`} año ${g.section}`;
}

// For searching without caring about accents or case ("enojo" finds "Enójo")
export function norm(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function publicBase(): string {
  return (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(
    /\/$/,
    "",
  );
}
