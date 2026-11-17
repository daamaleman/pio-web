import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { Card, ErrorCard } from '@/components/ui/Card'
import { groupLabel, pickText, todayISO } from '@/lib/format'
import { useGroup, usePollContent, usePollLessons, usePollResult, useSelfAssessment, type SAPart } from './api'
import { usePageTitle } from '@/lib/usePageTitle'

const SCALE = [
  { key: '1', label: 'Todavía no', color: '#FFE3EE' },
  { key: '2', label: 'A veces', color: '#FFC20E' },
  { key: '3', label: '¡Sí!', color: '#6DBE45' },
] as const

function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`
}
function shiftMonth(first: string, delta: number) {
  const d = new Date(`${first}T12:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + delta)
  return d.toISOString().slice(0, 10)
}
function monthLabel(first: string) {
  return new Intl.DateTimeFormat('es-NI', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${first}T12:00:00Z`))
}

export default function WellbeingPage() {
  usePageTitle('Bienestar del grupo')
  const { groupId } = useParams()
  const navigate = useNavigate()
  const group = useGroup(groupId)
  const current = monthStart(todayISO())
  const [month, setMonth] = useState(current)
  const sa = useSelfAssessment(groupId, month)
  const secondary = group.data?.level === 'secondary'
  const polls = usePollLessons(groupId, secondary)

  if (group.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!group.data) return <div className="p-5 lg:p-10"><ErrorCard message="No encontramos el grupo." /></div>

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></button>
        <div>
          <h1 className="text-2xl font-extrabold">Bienestar del grupo</h1>
          <p className="text-sm text-tinta/60">{groupLabel(group.data)}</p>
        </div>
      </div>

      <p className="mb-4 flex items-center gap-2 rounded-2xl bg-azul-suave px-4 py-3 text-sm text-azul">
        <Lock size={16} className="shrink-0" /> Solo se ven totales del grupo, nunca respuestas de un estudiante. Con menos de 3 respuestas, no se muestra nada.
      </p>

      {/* Self-assessment */}
      <Card
        title="Autoevaluación del mes"
        aside={
          <span className="inline-flex items-center gap-1 rounded-full bg-arena p-1">
            <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mes anterior" className="rounded-full p-1 hover:bg-white"><ChevronLeft size={16} /></button>
            <span className="px-1 capitalize">{monthLabel(month)}</span>
            <button onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= current} aria-label="Mes siguiente" className="rounded-full p-1 hover:bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
          </span>
        }
      >
        {sa.isLoading && <div className="h-40 animate-pulse rounded-2xl bg-linea" />}
        {sa.error && <ErrorCard message="No pudimos cargar la autoevaluación." onRetry={() => sa.refetch()} />}
        {sa.data && <SelfAssessment start={sa.data.start} end={sa.data.end} lang={group.data.language} />}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-tinta/60">
          {SCALE.map((s) => (
            <span key={s.key} className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm" style={{ background: s.color }} /> {s.label}</span>
          ))}
        </div>
      </Card>

      {/* Polls (secondary only) */}
      {secondary && (
        <section className="mt-4">
          <h2 className="mb-2 text-lg font-bold">Encuestas anónimas</h2>
          {polls.isLoading && <div className="h-32 animate-pulse rounded-card bg-linea" />}
          {polls.error && <ErrorCard message="No pudimos cargar las encuestas." onRetry={() => polls.refetch()} />}
          {polls.data?.length === 0 && <p className="text-sm text-tinta/60">Todavía no hay encuestas en las lecciones asignadas.</p>}
          <div className="flex flex-col gap-3">
            {polls.data?.map((l) => (
              <PollCard key={l.id} lessonId={l.id} slug={l.slug} title={`Semana ${l.week} · ${pickText(l.title)}`} groupId={group.data!.id} language={group.data!.language} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SelfAssessment({ start, end, lang }: { start: SAPart; end: SAPart; lang: string }) {
  if (start.hidden && end.hidden) {
    return (
      <p className="text-sm text-tinta/70">
        Todavía no hay suficientes respuestas este mes (inicio: {start.respondents ?? 0}, cierre: {end.respondents ?? 0}; se necesitan 3).
      </p>
    )
  }
  const items = (!start.hidden ? start.items : !end.hidden ? end.items : []).map((i) => i.code)
  const find = (part: SAPart, code: string) => (part.hidden ? undefined : part.items.find((i) => i.code === code))

  return (
    <ul className="flex flex-col gap-5">
      {items.map((code) => {
        const s = find(start, code)
        const e = find(end, code)
        const statement = pickText((s ?? e)!.statement, lang)
        const delta = s && e ? e.average - s.average : null
        return (
          <li key={code}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className="font-bold">{statement}</p>
              {delta !== null && Math.abs(delta) >= 0.1 && (
                <span className={`shrink-0 text-xs font-bold ${delta > 0 ? 'text-[#2E6B12]' : 'text-rosa-profundo'}`}>
                  {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
                </span>
              )}
            </div>
            <Row label="Inicio" item={s} hidden={start.hidden} />
            <Row label="Cierre" item={e} hidden={end.hidden} />
          </li>
        )
      })}
    </ul>
  )
}

function Row({ label, item, hidden }: { label: string; item?: { average: number; distribution: Record<'1' | '2' | '3', number> }; hidden: boolean }) {
  const total = item ? item.distribution['1'] + item.distribution['2'] + item.distribution['3'] : 0
  return (
    <div className="mt-1 flex items-center gap-3 text-xs">
      <span className="w-12 shrink-0 font-bold text-tinta/60">{label}</span>
      {hidden || !item || total === 0 ? (
        <span className="text-tinta/40">Menos de 3 respuestas</span>
      ) : (
        <>
          <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-linea">
            {SCALE.map((sc) => {
              const n = item.distribution[sc.key]
              return n > 0 ? <span key={sc.key} style={{ width: `${(n / total) * 100}%`, background: sc.color }} title={`${sc.label}: ${n}`} /> : null
            })}
          </div>
          <span className="w-10 shrink-0 text-right font-bold">{item.average.toFixed(1)}</span>
        </>
      )}
    </div>
  )
}

function PollCard({ lessonId, slug, title, groupId, language }: { lessonId: string; slug: string; title: string; groupId: string; language: string }) {
  const result = usePollResult(slug, groupId)
  const content = usePollContent(lessonId, language)
  const optionText = (id: string) => content.data?.options?.find((o) => o.id === id)?.text ?? id

  return (
    <Card title={title}>
      {content.data?.question && <p className="mb-3 font-bold">{content.data.question}</p>}
      {result.isLoading && <div className="h-20 animate-pulse rounded-2xl bg-linea" />}
      {result.error && <p className="text-sm text-rosa-profundo">No pudimos cargar el resultado.</p>}
      {result.data?.hidden && (
        <p className="text-sm text-tinta/70">Se muestra con al menos {result.data.min_respondents} respuestas (van {result.data.total ?? 0}).</p>
      )}
      {result.data && !result.data.hidden && (
        <>
          <ul className="flex flex-col gap-2">
            {result.data.options.map((o) => (
              <li key={o.option_id}>
                <div className="mb-0.5 flex justify-between text-sm"><span>{optionText(o.option_id)}</span><span className="font-bold">{o.pct}%</span></div>
                <div className="h-2.5 rounded-full bg-linea"><div className="h-2.5 rounded-full bg-cian" style={{ width: `${o.pct}%` }} /></div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-tinta/50">{result.data.total} respuestas · anónimas</p>
        </>
      )}
    </Card>
  )
}