import { norm } from '@/lib/format'
import { t, tLabels } from '@/i18n'

export const MAX_ROWS = 60

// Primary: 4 drawings from a 3x3 grid → digits 1–9 (no 0). Secondary: any 4 digits.
export function validPin(pin: string, level: string): boolean {
  return level === 'primary' ? /^[1-9]{4}$/.test(pin) : /^\d{4}$/.test(pin)
}

export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

export type PreviewRow = {
  line: number
  display_name: string
  pin?: string
  problem?: string // the row will NOT be sent
  warning?: string // it will be sent, but take a look
}

// Same rules as import-students, checked before sending so the teacher fixes them first.
export function buildPreview(rows: { name: string; pin?: string }[], existing: string[], level: string): PreviewRow[] {
  const seen = new Set<string>()
  const taken = new Set(existing.map(norm))
  return rows.map((r, i) => {
    const display_name = cleanName(r.name)
    const pin = r.pin?.trim() || undefined
    const key = norm(display_name)
    const row: PreviewRow = { line: i + 1, display_name, pin }
    if (display_name.length < 2 || display_name.length > 60) row.problem = t('students.rules.nameLength')
    else if (seen.has(key)) row.problem = t('students.rules.repeated')
    else if (taken.has(key)) row.problem = t('students.rules.exists')
    else if (pin && !validPin(pin, level))
      row.problem = level === 'primary' ? t('students.rules.pinPrimary') : t('students.rules.pinSecondary')
    else if (display_name.split(' ').length > 2) row.warning = t('students.rules.long')
    seen.add(key)
    if (i >= MAX_ROWS) row.problem = t('students.rules.max', { max: MAX_ROWS })
    return row
  })
}

export const ROW_ERROR = tLabels('students.rowError', ['INVALID_NAME', 'DUPLICATE_IN_LIST', 'DUPLICATE_NAME', 'INVALID_PIN_FORMAT', 'GROUP_NOT_FOUND', 'INTERNAL_ERROR'] as const) as Record<string, string>