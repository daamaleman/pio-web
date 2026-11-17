import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { ErrorCard } from '@/components/ui/Card'
import { EmotionDrop } from '@/components/EmotionDrop'
import { EMOTIONS, type Emotion } from '@/lib/emotions'
import { groupLabel, pickText } from '@/lib/format'
import { usePageTitle } from '@/lib/usePageTitle'
import { useLessonGuide, useMyGroups } from './api'
import { useSelectedGroup } from './useSelectedGroup'

function Box({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 rounded border-2 border-tinta/60" /> {label}</span>
}

export default function FamilySheetPrintPage() {
  usePageTitle('Ficha para la familia')
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const guide = useLessonGuide(lessonId)
  const groups = useMyGroups()
  const [group] = useSelectedGroup(groups.data)

  if (guide.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!guide.data) return <div className="p-5 lg:p-10"><ErrorCard message="No encontramos la lección." /></div>

  const l = guide.data.lesson
  const lang = group?.language ?? 'es'
  const home = pickText(l.home_challenge, lang)
  const note = pickText(l.family_note, lang)

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8 print:max-w-none print:p-0">
      <style>{'@media print { @page { size: letter portrait; margin: 14mm; } }'}</style>
      <div className="mb-4 flex items-center gap-2 print:hidden">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></button>
        <h1 className="mr-auto text-2xl font-extrabold">Ficha para la familia</h1>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-azul px-4 py-2 font-bold text-white"><Printer size={18} /> Imprimir</button>
      </div>
      <p className="mb-4 rounded-2xl bg-azul-suave px-4 py-3 text-sm text-azul print:hidden">Para familias sin celular: imprimí una por estudiante. Cuando la devuelvan, cargala en Grupos → Familias → «Registrar ficha en papel».</p>
      <article className="rounded-card border-2 border-dashed border-rosa bg-white p-6 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-4 border-b-2 border-rosa pb-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-rosa-profundo">Ficha de la semana para la familia</p>
            <h2 className="text-2xl font-extrabold">Semana {l.week} · {pickText(l.title, lang)}</h2>
            {group && <p className="text-sm text-tinta/70">{groupLabel(group)}</p>}
          </div>
          <img src="/logo-pio.png" alt="Pío" className="h-10" />
        </header>
        <p className="mt-5 font-bold">Nombre del estudiante: <span className="inline-block w-72 border-b border-tinta/40">&nbsp;</span></p>
        <div className="mt-5 rounded-2xl bg-[#FFF3D1] p-4 print:border print:border-tinta/20 print:bg-white"><p className="font-bold">🏠 Reto en casa</p><p className="mt-1 text-sm">{home || 'La docente les contará el reto de esta semana.'}</p></div>
        <ol className="mt-6 flex flex-col gap-6 text-sm">
          <li><p className="font-bold">1. ¿Hicieron el reto en casa?</p><div className="mt-2 flex flex-wrap gap-6"><Box label="Sí" /><Box label="En parte" /><Box label="No" /></div></li>
          <li><p className="font-bold">2. ¿Qué emoción mencionó su hijo o hija? (si mencionó alguna)</p><div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">{(Object.keys(EMOTIONS) as Emotion[]).map((e) => <span key={e} className="flex flex-col items-center gap-1"><EmotionDrop emotion={e} size={28} /><span className="text-xs">{EMOTIONS[e].label}</span><span className="inline-block h-5 w-5 rounded border-2 border-tinta/60" /></span>)}</div></li>
          <li><p className="font-bold">3. ¿Cómo respondió?</p><div className="mt-2 flex flex-wrap gap-6"><Box label="Con interés" /><Box label="Con dificultad" /><Box label="Prefirió no hacerlo" /></div></li>
          <li><p className="font-bold">4. Comentario (opcional)</p><div className="mt-3 flex flex-col gap-5"><span className="block border-b border-tinta/30" /><span className="block border-b border-tinta/30" /><span className="block border-b border-tinta/30" /></div></li>
        </ol>
        {note && <p className="mt-6 rounded-2xl bg-arena p-4 text-sm print:border print:border-tinta/20 print:bg-white"><b>Para la familia:</b> {note}</p>}
        <p className="mt-6 text-xs text-tinta/60">Escuchen sin juzgar: todas las emociones están bien. Son 5 a 10 minutos, sin presión. Devuelvan esta hoja a la docente. No escriban teléfonos ni direcciones.</p>
      </article>
    </div>
  )
}
