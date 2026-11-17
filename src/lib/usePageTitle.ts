import { useEffect } from 'react'
import { t } from '@/i18n'

// "Lecciones · Pío" while the page is open; back to the app title when it closes
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Pío` : t('app.title')
    return () => {
      document.title = t('app.title')
    }
  }, [title])
}
