// Pío Excel template: every spreadsheet the portal downloads goes through here,
// so they all share the same brand design.
import type { Cell, PaperSize, Worksheet } from 'exceljs'

const FONT = 'Calibri'
const C = {
  rosa: 'FFFF5C93', rosaProfundo: 'FFD6336C', rosaSuave: 'FFFFE3EE',
  azul: 'FF374EA2', tinta: 'FF1D2A5C', arena: 'FFF7F5F2', linea: 'FFECE7E1',
  blanco: 'FFFFFFFF', gris: 'FF6B7290',
  okBg: 'FFE6F4DC', okFg: 'FF2E6B12', midBg: 'FFFFF3D1', midFg: 'FF7A5600',
}

export type Tone = 'good' | 'mid' | 'bad' | 'muted' | null

export type SheetSpec = {
  name: string
  title: string
  subtitle?: string
  meta?: [string, string][]
  columns: { header: string; width?: number }[]
  rows: (string | number | null)[][]
  tone?: (value: string | number | null, column: number) => Tone
  notes?: string[]
  freezeFirstColumn?: boolean
  tabColor?: 'rosa' | 'azul'
}

export function defaultTone(value: string | number | null): Tone {
  if (typeof value !== 'string') return null
  if (value === 'Logrado' || value.startsWith('Completó')) return 'good'
  if (value === 'En proceso') return 'mid'
  if (value === 'Necesita apoyo') return 'bad'
  if (value === 'Sin empezar' || value === 'No asignada' || value === '—') return 'muted'
  return null
}

const solid = (argb: string) => ({ type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb } })
const thin = { style: 'thin' as const, color: { argb: C.linea } }
const border = { top: thin, left: thin, bottom: thin, right: thin }

function paintTone(cell: Cell, tone: Tone, zebra: boolean) {
  const base = { name: FONT, size: 10, color: { argb: C.tinta } }
  if (tone === 'good') { cell.fill = solid(C.okBg); cell.font = { ...base, color: { argb: C.okFg } }; return }
  if (tone === 'mid') { cell.fill = solid(C.midBg); cell.font = { ...base, color: { argb: C.midFg } }; return }
  if (tone === 'bad') { cell.fill = solid(C.rosaSuave); cell.font = { ...base, bold: true, color: { argb: C.rosaProfundo } }; return }
  cell.fill = solid(zebra ? C.arena : C.blanco)
  cell.font = tone === 'muted' ? { ...base, color: { argb: C.gris } } : base
}

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch('/logo-pio.png')
    const bytes = new Uint8Array(await res.arrayBuffer())
    let binary = ''
    bytes.forEach((b) => { binary += String.fromCharCode(b) })
    return btoa(binary)
  } catch {
    return null
  }
}

function buildSheet(ws: Worksheet, s: SheetSpec, logoId: number | null) {
  const last = Math.max(s.columns.length, 4)
  s.columns.forEach((c, i) => { ws.getColumn(i + 1).width = Math.max(c.width ?? 16, i === 0 ? 16 : 0) })

  ws.mergeCells(1, 2, 1, last)
  ws.mergeCells(2, 2, 2, last)
  for (let r = 1; r <= 2; r++) for (let c = 1; c <= last; c++) ws.getCell(r, c).fill = solid(C.rosa)
  ws.getRow(1).height = 32
  ws.getRow(2).height = 20
  const title = ws.getCell(1, 2)
  title.value = s.title
  title.font = { name: FONT, size: 16, bold: true, color: { argb: C.blanco } }
  title.alignment = { vertical: 'middle' }
  const subtitle = ws.getCell(2, 2)
  subtitle.value = s.subtitle ?? ''
  subtitle.font = { name: FONT, size: 11, color: { argb: C.blanco } }
  subtitle.alignment = { vertical: 'top' }
  if (logoId !== null) ws.addImage(logoId, { tl: { col: 0.12, row: 0.2 }, ext: { width: 78, height: 40 }, editAs: 'oneCell' })

  let row = 4
  for (const [label, value] of s.meta ?? []) {
    const a = ws.getCell(row, 1)
    a.value = label
    a.font = { name: FONT, size: 10, bold: true, color: { argb: C.tinta } }
    a.fill = solid(C.arena)
    ws.mergeCells(row, 2, row, Math.min(last, 4))
    const b = ws.getCell(row, 2)
    b.value = value
    b.font = { name: FONT, size: 10, color: { argb: C.tinta } }
    row++
  }
  if (s.meta?.length) row++

  const headerRow = row
  s.columns.forEach((c, i) => {
    const cell = ws.getCell(row, i + 1)
    cell.value = c.header
    cell.font = { name: FONT, size: 10, bold: true, color: { argb: C.blanco } }
    cell.fill = solid(C.tinta)
    cell.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'center', wrapText: true }
    cell.border = border
  })
  ws.getRow(row).height = 34

  s.rows.forEach((values, ri) => {
    row++
    values.forEach((v, ci) => {
      const cell = ws.getCell(row, ci + 1)
      cell.value = v ?? '—'
      paintTone(cell, (s.tone ?? defaultTone)(v, ci), ri % 2 === 1)
      if (ci === 0) cell.font = { ...cell.font, bold: true }
      cell.alignment = { vertical: 'middle', horizontal: ci === 0 ? 'left' : 'center', wrapText: true }
      cell.border = border
    })
  })

  ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: headerRow, column: s.columns.length } }
  ws.views = [{ state: 'frozen', xSplit: s.freezeFirstColumn ? 1 : 0, ySplit: headerRow }]

  row += 2
  for (const note of [...(s.notes ?? []), 'Pío · Siento y Crezco — Universidad Americana (UAM) · UNICEF Nicaragua']) {
    ws.mergeCells(row, 1, row, last)
    const cell = ws.getCell(row, 1)
    cell.value = note
    cell.font = { name: FONT, size: 9, italic: true, color: { argb: C.gris } }
    cell.alignment = { wrapText: true, vertical: 'top' }
    ws.getRow(row).height = 26
    row++
  }

  ws.pageSetup = { orientation: 'landscape', paperSize: 1 as PaperSize, fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } }
  ws.pageSetup.printTitlesRow = `${headerRow}:${headerRow}`
}

export async function downloadPioWorkbook(fileName: string, sheets: SheetSpec[]) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Pío · Siento y Crezco'
  wb.created = new Date()

  const logo = await loadLogo()
  const logoId = logo ? wb.addImage({ base64: logo, extension: 'png' }) : null

  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31), {
      properties: { tabColor: { argb: s.tabColor === 'azul' ? C.azul : C.rosa } },
    })
    buildSheet(ws, s, logoId)
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
