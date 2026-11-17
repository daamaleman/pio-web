import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { EmotionDrop } from '@/components/EmotionDrop'
import { EMOTIONS, type Emotion } from '@/lib/emotions'
import { groupLabel, pickText, shortDate } from '@/lib/format'
import type { Json } from '@/lib/database.types'
import { usePageTitle } from '@/lib/usePageTitle'

type FamilyWeek = {
  group: { level: string; grade: number; section: string; language: string; school_name: string }
  this_week: null | {
    lesson_slug: string
    title: Json
    week: number
    emotion: Emotion | null
    due_date: string
    home_challenge: Json
    family_note: Json
  }
}

const T = {
  es: {
    space: 'Espacio para la familia',
    thisWeek: 'Esta semana',
    week: 'Semana',
    until: 'hasta el',
    challenge: 'Reto en casa',
    note: 'Para la familia',
    howTitle: 'Cómo acompañar',
    how: [
      'Escuchen sin juzgar: todas las emociones están bien.',
      'Eviten frases como «no llores» o «eso no es nada».',
      'Son 5 a 10 minutos, sin presión. Si no se puede hoy, otro día.',
      'Si notan malestar que dura varios días, avísenle a la docente.',
    ],
    sheet: 'La ficha de la semana se llena en la app, en «Espacio para la familia».',
    none: 'Esta semana todavía no hay reto. Vuelvan después de la próxima clase.',
    notFound: 'Este enlace ya no funciona. Pídanle el código nuevo a la docente.',
    error: 'No pudimos cargar la página. Revisen la conexión e intenten de nuevo.',
    privacy: 'Esta página no pide ni guarda datos de su familia.',
  },
  en: {
    space: 'Family space',
    thisWeek: 'This week',
    week: 'Week',
    until: 'until',
    challenge: 'Challenge at home',
    note: 'For the family',
    howTitle: 'How to support',
    how: [
      'Listen without judging: every feeling is okay.',
      'Avoid phrases like "don’t cry" or "that’s nothing".',
      'It takes 5 to 10 minutes, no pressure. If not today, another day.',
      'If you notice distress that lasts several days, let the teacher know.',
    ],
    sheet: 'The weekly sheet is filled in the app, in "Family space".',
    none: 'There is no challenge yet this week. Come back after the next class.',
    notFound: 'This link no longer works. Ask the teacher for the new code.',
    error: 'We could not load the page. Check the connection and try again.',
    privacy: 'This page does not ask for or store any family data.',
  },
}

export default function FamilyPage() {
  usePageTitle('Espacio para la familia')
  const { token } = useParams()
  const week = useQuery({
    queryKey: ['family-week', token],
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('family_week', { p_token: token! })
      if (error) throw error
      return data as unknown as FamilyWeek | null
    },
  })

  const lang = week.data?.group.language === 'en' ? 'en' : 'es' // miq: falls back to es until translated
  const t = T[lang]

  if (week.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><img src="/pio-mascota.png" alt="" className="h-20 w-20 animate-pulse" /></div>
  }

  if (week.error || !week.data) {
    const notFound = !week.data || String((week.error as { message?: string })?.message).includes('NOT_FOUND')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <img src="/pio-mascota.png" alt="" className="h-24 w-24" />
        <p className="max-w-xs font-bold">{notFound ? T.es.notFound : T.es.error}</p>
      </div>
    )
  }

  const { group, this_week: w } = week.data

  return (
    <div className="mx-auto min-h-screen max-w-lg pb-10">
      <header className="rounded-b-[2rem] bg-rosa px-6 pb-8 pt-6 text-white">
        <img src="/logo-pio.png" alt="Pío" className="h-9 rounded-lg bg-white px-2 py-1" />
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/85">{t.space}</p>
        <h1 className="text-3xl font-extrabold">{groupLabel(group)}</h1>
        <p className="text-white/85">{group.school_name}</p>
      </header>

      <main className="flex flex-col gap-4 px-5 pt-5">
        {!w ? (
          <section className="rounded-card border border-linea bg-white p-6 text-center">
            <img src="/pio-mascota.png" alt="" className="mx-auto h-20 w-20" />
            <p className="mt-2 font-bold">{t.none}</p>
          </section>
        ) : (
          <>
            <section className="flex items-center gap-4 rounded-card border border-linea bg-white p-5">
              {w.emotion && (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${EMOTIONS[w.emotion].color}33` }}>
                  <EmotionDrop emotion={w.emotion} size={36} />
                </span>
              )}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-tinta/60">
                  {t.thisWeek} · {t.week} {w.week}
                </p>
                <h2 className="text-xl font-extrabold leading-tight">{pickText(w.title, lang)}</h2>
                <p className="text-sm text-tinta/60">{t.until} {shortDate(w.due_date)}</p>
              </div>
            </section>

            <section className="rounded-card bg-[#FFF3D1] p-5">
              <h3 className="text-lg font-bold">🏠 {t.challenge}</h3>
              <p className="mt-1">{pickText(w.home_challenge, lang)}</p>
            </section>

            <section className="rounded-card border border-linea bg-white p-5">
              <h3 className="text-lg font-bold">💬 {t.note}</h3>
              <p className="mt-1">{pickText(w.family_note, lang)}</p>
            </section>
          </>
        )}

        <section className="rounded-card border border-linea bg-white p-5">
          <h3 className="text-lg font-bold">{t.howTitle}</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {t.how.map((tip) => (
              <li key={tip} className="flex gap-2"><span className="text-rosa">●</span>{tip}</li>
            ))}
          </ul>
        </section>

        <p className="text-center text-sm text-tinta/70">{t.sheet}</p>
        <p className="text-center text-xs text-tinta/50">{t.privacy}</p>
      </main>
    </div>
  )
}