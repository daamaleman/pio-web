import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
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
  const { t } = useTranslation()
  usePageTitle(t('sheet.title'))
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const guide = useLessonGuide(lessonId)
  const groups = useMyGroups()
  const [group] = useSelectedGroup(groups.data)

  if (guide.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!guide.data) return <div className="p-5 lg:p-10"><ErrorCard message={t('sheet.notFound')} /></div>

  const l = guide.data.lesson
  const lang = group?.language ?? 'es'
  const home = pickText(l.home_challenge, lang)
  const note = pickText(l.family_note, lang)
  // The sheet goes home: printed in the group's language
  const tg = i18n.getFixedT(lang)

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8 print:max-w-none print:p-0">
      <style>{'@media print { @page { size: letter portrait; margin: 14mm; } }'}</style>
      <div className="mb-4 flex items-center gap-2 print:hidden">
        <button onClick={() => navigate(-1)} aria-label={t('common.back')} className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></button>
        <h1 className="mr-auto text-2xl font-extrabold">{t('sheet.title')}</h1>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-azul px-4 py-2 font-bold text-white"><Printer size={18} /> {t('common.print')}</button>
      </div>
      <p className="mb-4 rounded-2xl bg-azul-suave px-4 py-3 text-sm text-azul print:hidden">{t('sheet.hint')}</p>
      <article className="rounded-card border-2 border-dashed border-rosa bg-white p-6 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-4 border-b-2 border-rosa pb-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-rosa-profundo">{tg('sheet.kicker')}</p>
            <h2 className="text-2xl font-extrabold">{tg('library.week', { week: l.week })} · {pickText(l.title, lang)}</h2>
            {group && <p className="text-sm text-tinta/70">{groupLabel(group)}</p>}
          </div>
          <img src="/logo-pio.png" alt="Pío" className="h-10" />
        </header>
        <p className="mt-5 font-bold">{tg('sheet.studentName')} <span className="inline-block w-72 border-b border-tinta/40">&nbsp;</span></p>
        <div className="mt-5 rounded-2xl bg-[#FFF3D1] p-4 print:border print:border-tinta/20 print:bg-white"><p className="font-bold">🏠 {tg('guide.homeChallenge')}</p><p className="mt-1 text-sm">{home || tg('sheet.noHome')}</p></div>
        <ol className="mt-6 flex flex-col gap-6 text-sm">
          <li><p className="font-bold">1. {tg('sheet.q1')}</p><div className="mt-2 flex flex-wrap gap-6"><Box label={tg('sheet.yes')} /><Box label={tg('sheet.partly')} /><Box label={tg('sheet.no')} /></div></li>
          <li><p className="font-bold">2. {tg('sheet.q2')}</p><div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">{(Object.keys(EMOTIONS) as Emotion[]).map((e) => <span key={e} className="flex flex-col items-center gap-1"><EmotionDrop emotion={e} size={28} /><span className="text-xs">{tg(`emotion.${e}`)}</span><span className="inline-block h-5 w-5 rounded border-2 border-tinta/60" /></span>)}</div></li>
          <li><p className="font-bold">3. {tg('sheet.q3')}</p><div className="mt-2 flex flex-wrap gap-6"><Box label={tg('sheet.interest')} /><Box label={tg('sheet.difficulty')} /><Box label={tg('sheet.declined')} /></div></li>
          <li><p className="font-bold">4. {tg('sheet.q4')}</p><div className="mt-3 flex flex-col gap-5"><span className="block border-b border-tinta/30" /><span className="block border-b border-tinta/30" /><span className="block border-b border-tinta/30" /></div></li>
        </ol>
        {note && <p className="mt-6 rounded-2xl bg-arena p-4 text-sm print:border print:border-tinta/20 print:bg-white"><b>{tg('sheet.forFamily')}</b> {note}</p>}
        <p className="mt-6 text-xs text-tinta/60">{tg('sheet.footer')}</p>
      </article>
    </div>
  )
}
