import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import i18n from '@/i18n'
import { supabase } from '@/lib/supabase'
import { EmotionDrop } from '@/components/EmotionDrop'
import { EMOTIONS, type Emotion } from '@/lib/emotions'
import { pickText } from '@/lib/format'
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

export default function FamilyPage() {
  // The page follows the group's language (miq falls back to es), not the visitor's portal setting
  const groupLang = browserLang()
  const t = i18n.getFixedT(groupLang)
  usePageTitle(t('familyQr.space'))
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

  const lang = week.data?.group.language ?? 'es'
  const tg = i18n.getFixedT(lang)
  const dateLocale = lang === 'en' ? 'en-US' : 'es-NI'
  const date = (iso: string) =>
    new Intl.DateTimeFormat(dateLocale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
      .format(new Date(`${iso}T12:00:00Z`))
      .replace(/\./g, '')

  if (week.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><img src="/pio-mascota.png" alt="" className="h-20 w-20 animate-pulse" /></div>
  }

  if (week.error || !week.data) {
    const notFound = !week.data || String((week.error as { message?: string })?.message).includes('NOT_FOUND')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <img src="/pio-mascota.png" alt="" className="h-24 w-24" />
        <p className="max-w-xs font-bold">{notFound ? t('family.notFound') : t('family.error')}</p>
      </div>
    )
  }

  const { group, this_week: w } = week.data
  const label =
    group.level === 'primary'
      ? tg('group.primary', { grade: group.grade, section: group.section })
      : group.grade === 1
        ? tg('group.secondaryFirst', { section: group.section })
        : tg('group.secondary', { grade: group.grade, section: group.section })

  return (
    <div className="mx-auto min-h-screen max-w-lg pb-10">
      <header className="rounded-b-[2rem] bg-rosa px-6 pb-8 pt-6 text-white">
        <img src="/logo-pio.png" alt="Pío" className="h-9 rounded-lg bg-white px-2 py-1" />
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/85">{tg('familyQr.space')}</p>
        <h1 className="text-3xl font-extrabold">{label}</h1>
        <p className="text-white/85">{group.school_name}</p>
      </header>

      <main className="flex flex-col gap-4 px-5 pt-5">
        {!w ? (
          <section className="rounded-card border border-linea bg-white p-6 text-center">
            <img src="/pio-mascota.png" alt="" className="mx-auto h-20 w-20" />
            <p className="mt-2 font-bold">{tg('family.none')}</p>
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
                  {tg('climate.thisWeek')} · {tg('library.week', { week: w.week })}
                </p>
                <h2 className="text-xl font-extrabold leading-tight">{pickText(w.title, lang)}</h2>
                <p className="text-sm text-tinta/60">{tg('family.until', { date: date(w.due_date) })}</p>
              </div>
            </section>

            <section className="rounded-card bg-[#FFF3D1] p-5">
              <h3 className="text-lg font-bold">🏠 {tg('guide.homeChallenge')}</h3>
              <p className="mt-1">{pickText(w.home_challenge, lang)}</p>
            </section>

            <section className="rounded-card border border-linea bg-white p-5">
              <h3 className="text-lg font-bold">💬 {tg('sheet.forFamily').replace(/:$/, '')}</h3>
              <p className="mt-1">{pickText(w.family_note, lang)}</p>
            </section>
          </>
        )}

        <section className="rounded-card border border-linea bg-white p-5">
          <h3 className="text-lg font-bold">{tg('family.howTitle')}</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {(['how1', 'how2', 'how3', 'how4'] as const).map((k) => tg(`family.${k}`)).map((tip) => (
              <li key={tip} className="flex gap-2"><span className="text-rosa">●</span>{tip}</li>
            ))}
          </ul>
        </section>

        <p className="text-center text-sm text-tinta/70">{tg('family.sheet')}</p>
        <p className="text-center text-xs text-tinta/50">{tg('family.privacy')}</p>
      </main>
    </div>
  )
}

// Before the data arrives, use the browser language (en or es)
function browserLang(): string {
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}
