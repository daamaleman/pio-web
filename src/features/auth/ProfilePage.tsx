import { LogOut } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/auth-context'
import { isStaff, ROLE_LABEL } from '@/lib/roles'
import { PageHeader } from '@/components/layout/PageHeader'
import i18n, { type Lang } from '@/i18n'
import { initials, useMyProfile } from './useMyProfile'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { session, role, signOut } = useAuth()
  const { data: profile, isLoading, error } = useMyProfile()
  const qc = useQueryClient()

  const setLang = useMutation({
    mutationFn: async (lang: Lang) => {
      const { error: e } = await supabase.from('profiles').update({ preferred_language: lang }).eq('id', session!.user.id)
      if (e) throw e
      return lang
    },
    onSuccess: async (lang) => {
      await qc.invalidateQueries({ queryKey: ['my-profile'] })
      i18n.changeLanguage(lang)
    },
  })

  const current = i18n.language
  const option = (lang: Lang | 'miq', label: string) => (
    <button
      key={lang}
      type="button"
      disabled={lang === 'miq' || setLang.isPending}
      aria-pressed={current === lang}
      onClick={() => lang !== 'miq' && setLang.mutate(lang)}
      className={`rounded-full border-2 px-4 py-2.5 text-sm font-bold disabled:opacity-50 ${current === lang ? 'border-azul bg-azul-suave text-azul' : 'border-linea bg-white'}`}
    >
      {label}
    </button>
  )

  return (
    <>
      <PageHeader title={t('profile.title')} />
      <div className="mx-5 mt-4 flex flex-col gap-4 lg:mx-10 lg:max-w-md">
        <section className="flex flex-col items-center gap-3 rounded-card border border-linea bg-white p-8 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-rosa text-2xl font-extrabold text-white">{initials(profile?.full_name)}</span>
          {isLoading && <p>{t('common.loading')}</p>}
          {error && <p className="text-rosa-profundo">{t('profile.loadError')}</p>}
          {profile && <p className="font-display text-2xl font-bold">{profile.full_name}</p>}
          <p className="text-tinta/70">{session?.user.email}</p>
          {isStaff(role) && <span className="rounded-full bg-azul-suave px-3 py-1 text-sm font-bold text-azul">{ROLE_LABEL[role]}</span>}
        </section>
        <section className="rounded-card border border-linea bg-white p-5">
          <h2 className="font-bold">{t('profile.language')}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {option('es', t('profile.spanish'))}
            {option('en', t('profile.english'))}
            {option('miq', t('profile.miskito'))}
          </div>
          <p className="mt-2 text-xs text-tinta/60">{t('profile.languageHint')}</p>
          {setLang.error && <p role="alert" className="mt-2 text-sm font-bold text-rosa-profundo">{t('profile.saveError')}</p>}
        </section>
        <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-linea bg-white py-3 font-display text-lg font-bold">
          <LogOut size={18} /> {t('common.signOut')}
        </button>
      </div>
    </>
  )
}
