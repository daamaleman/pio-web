import { todayISO } from "./format";

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 1 = Monday … 7 = Sunday (same convention as groups.class_weekday)
export function isoWeekday(iso: string): number {
  const d = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

// The teacher assigns AFTER class: class_date = the most recent class day
// (today included) and the proposed due date = the next class.
export function classDates(classWeekday: number | null, today = todayISO()) {
  if (!classWeekday) return { classDate: today, dueDate: addDays(today, 7) };
  const back = (isoWeekday(today) - classWeekday + 7) % 7;
  const classDate = addDays(today, -back);
  return { classDate, dueDate: addDays(classDate, 7) };
}

// Monday of the week that contains `iso` (weeks run Monday–Sunday, like group_climate)
export function mondayOf(iso: string): string {
  return addDays(iso, -(isoWeekday(iso) - 1));
}

// Every class date of a month ("YYYY-MM-01") for a given weekday (1 = Monday … 7 = Sunday)
export function classDatesInMonth(
  firstOfMonth: string,
  classWeekday: number,
): string[] {
  const offset = (classWeekday - isoWeekday(firstOfMonth) + 7) % 7;
  const dates: string[] = [];
  for (
    let d = addDays(firstOfMonth, offset);
    d.slice(0, 7) === firstOfMonth.slice(0, 7);
    d = addDays(d, 7)
  ) {
    dates.push(d);
  }
  return dates;
}
