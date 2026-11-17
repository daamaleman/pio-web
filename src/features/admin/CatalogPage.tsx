import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { ErrorCard } from '@/components/ui/Card'
import { EmotionDrop } from '@/components/EmotionDrop'
import type { Emotion } from '@/lib/emotions'
import { pickText } from '@/lib/format'
import { useCatalog } from './api'
import { usePageTitle } from '@/lib/usePageTitle'

const LANGS = ['es', 'en', 'miq'] as const

export default function CatalogPage() {
  const { t } = useTranslation()
  usePageTitle(t('nav.catalog'))
  const catalog = useCatalog()
  const lessons = catalog.data ?? []
  const groups = [
    { key: 'primary', title: t('groupForm.offerP3'), items: lessons.filter((l) => l.level === 'primary') },
    { key: 'secondary', title: t('groupForm.offerS1'), items: lessons.filter((l) => l.level === 'secondary') },
  ]

  return (
    <div className="mx-auto max-w-4xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/admin" aria-label={t('common.back')} className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></Link>
        <div>
          <h1 className="text-2xl font-extrabold">{t('admin.catalog')}</h1>
          <p className="text-sm text-tinta/60">{t('catalog.subtitle')}</p>
        </div>
      </div>

      {catalog.isLoading && <div className="h-64 animate-pulse rounded-card bg-linea" />}
      {catalog.error && <ErrorCard message={t('catalog.loadError')} onRetry={() => catalog.refetch()} />}

      {groups.map((g) => g.items.length > 0 && (
        <section key={g.key} className="mb-6">
          <h2 className="mb-2 text-lg font-bold">{g.title}</h2>
          <div className="overflow-x-auto rounded-card border border-linea bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-tinta text-left text-white">
                  <th className="px-3 py-2">{t('report.col.week')}</th><th className="px-3 py-2">{t('report.col.lesson')}</th><th className="px-3 py-2">{t('catalog.status')}</th>
                  <th className="px-3 py-2 text-center">{t('catalog.steps')}</th>
                  {LANGS.map((lang) => <th key={lang} className="px-3 py-2 text-center">{t(`language.${lang}`)}</th>)}
                </tr>
              </thead>
              <tbody>
                {g.items.map((l, i) => {
                  const steps = (l.lesson_steps as unknown as { count: number }[])[0]?.count ?? 0
                  return (
                    <tr key={l.id} className={i % 2 ? 'bg-arena' : ''}>
                      <td className="px-3 py-2 font-bold">{l.week}</td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-1.5 font-semibold">
                          {l.emotion && <EmotionDrop emotion={l.emotion as Emotion} size={16} />}
                          {pickText(l.title)}
                        </span>
                        <span className="text-xs text-tinta/50">{l.slug} · {t('library.parts', { count: l.parts_count })}{l.is_month_closure ? ` · ${t('library.monthClosure')}` : ''}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${l.status === 'published' ? 'bg-[#E6F4DC] text-[#2E6B12]' : 'bg-arena text-tinta/60'}`}>
                          {l.status === 'published' ? t('catalog.published') : l.status === 'draft' ? t('catalog.draft') : l.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">{steps}</td>
                      {LANGS.map((lang) => {
                        const versions = l.lesson_contents.filter((c) => c.language === lang).map((c) => c.version)
                        return (
                          <td key={lang} className="px-3 py-2 text-center">
                            {versions.length ? (
                              <span className="rounded-full bg-azul-suave px-2.5 py-0.5 text-xs font-bold text-azul">v{Math.max(...versions)}</span>
                            ) : (
                              <span className="text-xs text-tinta/40">{t('catalog.missing')}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
