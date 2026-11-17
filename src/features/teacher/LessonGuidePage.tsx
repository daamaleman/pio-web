import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Clock, Eye, FileText, Lock, Printer, Target } from 'lucide-react'
import { ErrorCard } from '@/components/ui/Card'
import { EmotionDrop } from '@/components/EmotionDrop'
import { EMOTIONS, type Emotion } from '@/lib/emotions'
import { pickText, shortDate } from '@/lib/format'
import { usePageTitle } from '@/lib/usePageTitle'
import { useGroupAssignments, useLessonGuide, useMyGroups } from './api'
import { useSelectedGroup } from './useSelectedGroup'
import { PARTS, STEP_KIND, jsonToBlocks, templateLabel } from './lessonLabels'

export default function LessonGuidePage() {
  usePageTitle('Guía de la lección')
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const guide = useLessonGuide(lessonId)
  const groups = useMyGroups()
  const [group] = useSelectedGroup(groups.data)
  const assignments = useGroupAssignments(group?.id)

  if (guide.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (guide.error || !guide.data) return <div className="p-5 lg:p-10"><ErrorCard message="No pudimos cargar la guía." onRetry={() => guide.refetch()} /></div>

  const { lesson: l, minigames, steps } = guide.data
  const e = l.emotion as Emotion | null
  const lang = group?.language ?? 'es'
  const before = [...jsonToBlocks(l.learnings, lang), ...jsonToBlocks(l.teacher_guide, lang)]
  const home = pickText(l.home_challenge, lang)
  const note = pickText(l.family_note, lang)
  const assigned = assignments.data?.find((a) => a.lesson_id === l.id)
  const partNames = PARTS[l.level] ?? []
  const parts = [...new Set(steps.map((s) => s.part))].sort((a, b) => a - b)
  const gameName = (id: string | null) => pickText(minigames.find((m) => m.id === id)?.name ?? null, lang)

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-4 lg:pt-8 print:max-w-none print:p-0">
      <style>{'@media print { @page { size: letter portrait; margin: 12mm; } }'}</style>
      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></button>
        <span className="mr-auto" />
        {l.level === 'primary' && (
          <Link to={`/docente/lecciones/${l.id}/ficha`} className="flex items-center gap-2 rounded-full border-2 border-linea bg-white px-4 py-2 text-sm font-bold">
            <FileText size={16} /> Ficha para la familia
          </Link>
        )}
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full border-2 border-linea bg-white px-4 py-2 text-sm font-bold">
          <Printer size={16} /> Imprimir guía
        </button>
        {assigned ? (
          <Link to={`/docente/asignaciones/${assigned.id}`} className="rounded-full bg-azul px-4 py-2 text-sm font-bold text-white">Ver avance</Link>
        ) : (
          <Link to={`/docente/lecciones/${l.id}/asignar`} className="rounded-full bg-azul px-4 py-2 text-sm font-bold text-white">Asignar</Link>
        )}
      </div>

      <header className="relative overflow-hidden rounded-card bg-rosa p-6 text-white print:rounded-none print:border-b-4 print:border-rosa print:bg-white print:p-0 print:pb-3 print:text-tinta">
        <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">{e ? EMOTIONS[e].label : 'Lección'} · Semana {l.week}{l.is_month_closure ? ' · cierre del mes' : ''}</p>
        <h1 className="mt-1 max-w-[75%] text-3xl font-extrabold leading-tight">{pickText(l.title, lang)}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          {l.duration_min && <span className="rounded-full bg-white/25 px-3 py-1 print:bg-arena">{l.duration_min} min en casa</span>}
          <span className="rounded-full bg-white/25 px-3 py-1 print:bg-arena">{l.parts_count} partes · {steps.length} pasos</span>
          <span className="rounded-full bg-white/25 px-3 py-1 print:bg-arena">{minigames.length} mini-juegos</span>
          {assigned && <span className="rounded-full bg-white px-3 py-1 text-azul print:hidden">Asignada · vence {shortDate(assigned.due_date)}</span>}
        </div>
        {e && <span className="absolute right-4 top-4 print:hidden"><EmotionDrop emotion={e} size={64} /></span>}
      </header>

      <Section title="Antes de la clase">
        {before.length > 0 ? <Blocks blocks={before} /> : <p className="text-sm text-tinta/70">La guía detallada de esta lección está en preparación. Mientras tanto, usá el contenido y lo que hay que observar en cada mini-juego, que vienen del plan de la unidad.</p>}
      </Section>
      <Section title="Mini-juegos de la semana">
        <ol className="flex flex-col gap-3">
          {minigames.map((m) => (
            <li key={m.id} className="break-inside-avoid rounded-2xl border border-linea p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-lg font-bold">{m.number_in_unit}. {pickText(m.name, lang)}</p>
                <p className="flex items-center gap-1 text-xs font-bold text-tinta/60">{templateLabel(m.template)}{m.duration_min ? <><Clock size={12} className="ml-1" /> {m.duration_min} min</> : null}</p>
              </div>
              {m.plan_content && <Field label="Contenido">{m.plan_content}</Field>}
              {m.indicator && <Field label="Indicador de logro" icon={<Target size={14} />}>{m.indicator}</Field>}
              {m.teacher_evidence && <Field label="Qué observar en clase" icon={<Eye size={14} />}>{m.teacher_evidence}</Field>}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-tinta/60">En el progreso, cada indicador se muestra como Logrado · En proceso · Necesita apoyo. Nunca hay notas.</p>
      </Section>
      <Section title="La lección en la app">
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {parts.map((p) => (
            <div key={p} className="break-inside-avoid rounded-2xl bg-arena p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-azul">{l.level === 'primary' ? 'Parte' : 'Capítulo'} {p}{partNames[p - 1] ? ` · ${partNames[p - 1]}` : ''}</p>
              <ol className="mt-2 flex flex-col gap-1 text-sm">
                {steps.filter((s) => s.part === p).map((s) => (
                  <li key={s.position} className="flex items-start gap-2">
                    <span className="w-5 shrink-0 text-right font-bold text-tinta/40">{s.position}</span>
                    <span>
                      {STEP_KIND[s.kind] ?? s.kind}
                      {s.minigame_id && <span className="text-tinta/60"> · {gameName(s.minigame_id)}</span>}
                      {s.is_private && <Lock size={12} className="ml-1 inline text-tinta/50" aria-label="Privado" />}
                      {s.is_skippable && <span className="text-xs text-tinta/50"> (se puede saltar)</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        {steps.some((s) => s.is_private) && <p className="mt-2 flex items-center gap-1 text-xs text-tinta/60"><Lock size={12} /> Paso privado: lo que el estudiante escribe o dibuja ahí no sale de su celular.</p>}
      </Section>
      <Section title="En casa">
        {home || note ? <>{home && <Field label="Reto en casa">{home}</Field>}{note && <Field label="Nota para la familia">{note}</Field>}</> : <p className="text-sm text-tinta/70">El reto en casa de esta lección está en preparación.</p>}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-5 rounded-card border border-linea bg-white p-5 print:rounded-none print:border-0 print:px-0 print:py-2"><h2 className="mb-3 text-xl font-bold">{title}</h2>{children}</section>
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <div className="mt-2"><p className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-tinta/50">{icon}{label}</p><p className="whitespace-pre-line text-sm">{children}</p></div>
}

function Blocks({ blocks }: { blocks: { kind: 'p' | 'li'; text: string }[] }) {
  return <div className="flex flex-col gap-2 text-sm">{blocks.map((b, i) => b.kind === 'li' ? <p key={i} className="flex gap-2"><span className="text-rosa">●</span>{b.text}</p> : <p key={i}>{b.text}</p>)}</div>
}
