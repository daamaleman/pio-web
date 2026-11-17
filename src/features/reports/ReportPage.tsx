import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQueries, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight, FileSpreadsheet, Lock, Printer } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ErrorCard } from '@/components/ui/Card'
import { groupLabel, pickText, shortDate, todayISO } from '@/lib/format'
import { defaultTone, downloadPioWorkbook } from '@/lib/excelTemplate'
import { useMyProfile } from '@/features/auth/useMyProfile'
import { useGroupOverview, useGroupStudents, useMyGroups, type AssignmentProgress } from '@/features/teacher/api'
import { usePageTitle } from '@/lib/usePageTitle'

const RESULT: Record<string, string> = {
  achieved: 'Logrado',
  in_progress: 'En proceso',
  needs_support: 'Necesita apoyo',
}
const STATUS: Record<string, string> = {
  completed: 'Completó',
  in_progress: 'En proceso',
  not_started: 'Sin empezar',
}

function shiftMonth(first: string, delta: number) {
  const d = new Date(`${first}T12:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + delta)
  return d.toISOString().slice(0, 10)
}

function useMonthAssignments(groupId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['month-assignments', groupId, month],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, class_date, due_date')
        .eq('group_id', groupId!)
        .gte('class_date', month)
        .lt('class_date', shiftMonth(month, 1))
        .order('class_date')
      if (error) throw error
      return data
    },
  })
}

type Column = { key: string; label: string; assignmentId: string; indicator?: number }

export default function ReportPage() {
  usePageTitle('Reporte del mes')
  const { groupId } = useParams()
  const groups = useMyGroups()
  const group = groups.data?.find((g) => g.id === groupId)
  const overview = useGroupOverview(groupId)
  const students = useGroupStudents(groupId)
  const { data: profile } = useMyProfile()
  const current = `${todayISO().slice(0, 7)}-01`
  const [month, setMonth] = useState(current)
  const assignments = useMonthAssignments(groupId, month)

  const progress = useQueries({
    queries: (assignments.data ?? []).map((a) => ({
      queryKey: ['assignment-progress', a.id],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('assignment_progress', { p_assignment_id: a.id })
        if (error) throw error
        return data as unknown as AssignmentProgress
      },
    })),
  })

  const loading = assignments.isLoading || progress.some((p) => p.isLoading)
  const failed = assignments.error || progress.some((p) => p.error)
  const reports = progress.map((p) => p.data).filter(Boolean) as AssignmentProgress[]
  const monthName = new Intl.DateTimeFormat('es-NI', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}T12:00:00Z`))

  // Columns: per lesson "completed?" + one per indicator
  const columns = useMemo<Column[]>(() => {
    const cols: Column[] = []
    for (const r of reports) {
      cols.push({ key: `${r.assignment_id}-done`, label: `S${r.week} · Lección`, assignmentId: r.assignment_id })
      const sample = r.students.find((s) => s.indicators.length > 0)
      for (const ind of sample?.indicators ?? []) {
        cols.push({ key: `${r.assignment_id}-${ind.number}`, label: `S${r.week} · ${pickText(ind.name)}`, assignmentId: r.assignment_id, indicator: ind.number })
      }
    }
    return cols
  }, [reports])

  // Rows: every student of the group (some lessons may target only some students)
  const rows = useMemo(() => {
    return (students.data ?? []).map((s) => {
      const cells: Record<string, string> = {}
      let lessonsDone = 0
      let achieved = 0
      let support = 0
      for (const r of reports) {
        const st = r.students.find((x) => x.id === s.id)
        cells[`${r.assignment_id}-done`] = st ? `${STATUS[st.status]}${st.status === 'completed' && st.on_time === false ? ' (tarde)' : ''}` : 'No asignada'
        if (st?.status === 'completed') lessonsDone++
        for (const ind of st?.indicators ?? []) {
          cells[`${r.assignment_id}-${ind.number}`] = ind.result ? RESULT[ind.result] : '—'
          if (ind.result === 'achieved') achieved++
          if (ind.result === 'needs_support') support++
        }
      }
      const targeted = reports.filter((r) => r.students.some((x) => x.id === s.id)).length
      return { id: s.id, name: s.display_name, cells, lessonsDone, targeted, achieved, support }
    })
  }, [students.data, reports])

  async function downloadExcel() {
    const label = group ? groupLabel(group) : ''
    const subtitle = `${label} · ${monthName}`
    const meta: [string, string][] = [
      ['Escuela', overview.data?.group.school_name ?? ''],
      ['Grupo', label],
      ['Docente', profile?.full_name ?? ''],
      ['Mes', monthName],
      ['Generado', shortDate(todayISO())],
    ]
    const notes = [
      'Escala cualitativa: Logrado · En proceso · Necesita apoyo. Pío no usa notas numéricas; los indicadores acompañan la observación de la docente.',
      'Este archivo contiene nombres y resultados de estudiantes. Guardalo y compartilo solo con quien corresponda.',
    ]

    await downloadPioWorkbook(`Pio_Reporte_${label.replace(/[^\p{L}\p{N}]+/gu, '_')}_${month.slice(0, 7)}.xlsx`, [
      {
        name: 'Resumen',
        title: 'Reporte de cierre de mes',
        subtitle,
        meta,
        columns: [
          { header: 'Semana', width: 16 }, { header: 'Lección', width: 40 }, { header: 'Clase', width: 14 },
          { header: 'Fecha límite', width: 14 }, { header: 'Estudiantes', width: 13 }, { header: 'Completaron', width: 13 },
          { header: '% completado', width: 14 },
        ],
        rows: reports.map((r) => [
          `Semana ${r.week}`, pickText(r.title), shortDate(r.class_date), shortDate(r.due_date),
          r.summary.students, r.summary.completed, `${r.summary.completed_pct}%`,
        ]),
        notes,
        tabColor: 'rosa',
      },
      {
        name: 'Lista de cotejo',
        title: 'Lista de cotejo por estudiante',
        subtitle,
        meta,
        columns: [
          { header: 'Estudiante', width: 26 },
          ...columns.map((c) => ({ header: c.label, width: 18 })),
          { header: 'Lecciones completas', width: 14 },
          { header: 'Indicadores logrados', width: 14 },
          { header: 'Necesita apoyo', width: 12 },
        ],
        rows: rows.map((r) => [r.name, ...columns.map((c) => r.cells[c.key] ?? '—'), `${r.lessonsDone}/${r.targeted}`, r.achieved, r.support]),
        tone: (v, col) => (col === columns.length + 3 ? (typeof v === 'number' && v > 0 ? 'bad' : null) : defaultTone(v)),
        freezeFirstColumn: true,
        notes,
        tabColor: 'azul',
      },
    ])
  }

  if (groups.isLoading || students.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!group) return <div className="p-5 lg:p-10"><ErrorCard message="No encontramos el grupo." /></div>

  return (
    <div className="px-5 pb-10 pt-4 lg:px-10 lg:pt-8 print:p-0">
      <style>{'@media print { @page { size: letter landscape; margin: 10mm; } }'}</style>

      {/* Toolbar (not printed) */}
      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <Link to="/docente/grupos" aria-label="Volver" className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></Link>
        <h1 className="mr-auto text-2xl font-extrabold">Reporte de cierre de mes</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-white p-1 text-sm font-bold">
          <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mes anterior" className="rounded-full p-1.5 hover:bg-arena"><ChevronLeft size={18} /></button>
          <span className="px-2 capitalize">{monthName}</span>
          <button onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= current} aria-label="Mes siguiente" className="rounded-full p-1.5 hover:bg-arena disabled:opacity-30"><ChevronRight size={18} /></button>
        </span>
        <button onClick={downloadExcel} disabled={loading || reports.length === 0}
          className="flex items-center gap-2 rounded-full border-2 border-linea bg-white px-4 py-2 font-bold disabled:opacity-50">
          <FileSpreadsheet size={18} /> Descargar Excel
        </button>
        <button onClick={() => window.print()} disabled={loading || reports.length === 0}
          className="flex items-center gap-2 rounded-full bg-azul px-4 py-2 font-bold text-white disabled:opacity-50">
          <Printer size={18} /> Imprimir / Guardar PDF
        </button>
      </div>
      <p className="mb-4 flex items-center gap-2 rounded-2xl bg-[#FFF3D1] px-4 py-3 text-sm print:hidden">
        <Lock size={16} className="shrink-0" /> Este reporte tiene nombres y resultados de tus estudiantes. Guardalo y compartilo solo con quien corresponda.
      </p>

      {loading && <div className="h-64 animate-pulse rounded-card bg-linea" />}
      {failed && <ErrorCard message="No pudimos armar el reporte." />}
      {!loading && !failed && reports.length === 0 && (
        <div className="rounded-card border border-linea bg-white p-8 text-center">
          <p className="font-bold">No hay lecciones con clase en {monthName}.</p>
        </div>
      )}

      {!loading && !failed && reports.length > 0 && (
        <article className="rounded-card border border-linea bg-white p-6 print:rounded-none print:border-0 print:p-0">
          {/* Header */}
          <header className="flex items-start justify-between gap-4 border-b-2 border-rosa pb-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-rosa-profundo">Reporte de cierre de mes</p>
              <h2 className="text-2xl font-extrabold capitalize">{groupLabel(group)} · {monthName}</h2>
              <p className="text-sm text-tinta/70">
                {overview.data?.group.school_name} · Docente: {profile?.full_name} · Generado el {shortDate(todayISO())}
              </p>
            </div>
            <img src="/logo-pio.png" alt="Pío" className="h-10" />
          </header>

          {/* Summary */}
          <h3 className="mt-5 text-lg font-bold">Lecciones del mes</h3>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="bg-tinta text-left text-white">
                <th className="px-3 py-2">Semana</th><th className="px-3 py-2">Lección</th><th className="px-3 py-2">Clase</th>
                <th className="px-3 py-2">Fecha límite</th><th className="px-3 py-2 text-right">Completaron</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.assignment_id} className={i % 2 ? 'bg-arena' : ''}>
                  <td className="px-3 py-1.5">{r.week}</td>
                  <td className="px-3 py-1.5 font-semibold">{pickText(r.title)}</td>
                  <td className="px-3 py-1.5">{shortDate(r.class_date)}</td>
                  <td className="px-3 py-1.5">{shortDate(r.due_date)}</td>
                  <td className="px-3 py-1.5 text-right font-bold">{r.summary.completed}/{r.summary.students} ({r.summary.completed_pct}%)</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Checklist */}
          <h3 className="mt-6 text-lg font-bold">Lista de cotejo por estudiante</h3>
          <div className="mt-2 overflow-x-auto print:overflow-visible">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-tinta text-left text-white">
                  <th className="sticky left-0 bg-tinta px-2 py-2">Estudiante</th>
                  {columns.map((c) => <th key={c.key} className="min-w-28 px-2 py-2 font-semibold">{c.label}</th>)}
                  <th className="px-2 py-2">Lecciones</th>
                  <th className="px-2 py-2">Necesita apoyo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-arena' : 'bg-white'}>
                    <td className={`sticky left-0 px-2 py-1.5 font-bold ${i % 2 ? 'bg-arena' : 'bg-white'}`}>{r.name}</td>
                    {columns.map((c) => {
                      const v = r.cells[c.key] ?? '—'
                      const tone = v === 'Logrado' || v.startsWith('Completó') ? 'text-[#2E6B12]' : v === 'Necesita apoyo' ? 'font-bold text-rosa-profundo' : 'text-tinta/70'
                      return <td key={c.key} className={`px-2 py-1.5 ${tone}`}>{v}</td>
                    })}
                    <td className="px-2 py-1.5 font-bold">{r.lessonsDone}/{r.targeted}</td>
                    <td className={`px-2 py-1.5 font-bold ${r.support > 0 ? 'text-rosa-profundo' : ''}`}>{r.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-tinta/60">
            Escala cualitativa: Logrado · En proceso · Necesita apoyo. Pío no usa notas numéricas. Los indicadores acompañan la observación de la docente; no la reemplazan.
          </p>
        </article>
      )}
    </div>
  )
}