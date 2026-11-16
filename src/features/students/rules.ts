import { norm } from '@/lib/format'

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
    if (display_name.length < 2 || display_name.length > 60) row.problem = 'El nombre debe tener de 2 a 60 caracteres.'
    else if (seen.has(key)) row.problem = 'Está repetido en la lista.'
    else if (taken.has(key)) row.problem = 'Ya existe en el grupo.'
    else if (pin && !validPin(pin, level))
      row.problem = level === 'primary' ? 'El PIN deben ser 4 números del 1 al 9.' : 'El PIN deben ser 4 números.'
    else if (display_name.split(' ').length > 2) row.warning = 'Más de dos palabras: en la app se ve largo. Mejor nombre y un apellido.'
    seen.add(key)
    if (i >= MAX_ROWS) row.problem = `Máximo ${MAX_ROWS} estudiantes por carga.`
    return row
  })
}

export const ROW_ERROR: Record<string, string> = {
  INVALID_NAME: 'Nombre no válido.',
  DUPLICATE_IN_LIST: 'Repetido en la lista.',
  DUPLICATE_NAME: 'Ya existe en el grupo.',
  INVALID_PIN_FORMAT: 'PIN no válido.',
  GROUP_NOT_FOUND: 'El grupo no existe.',
  INTERNAL_ERROR: 'Error del servidor. Intentá de nuevo con este nombre.',
}