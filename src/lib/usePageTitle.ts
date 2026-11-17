import { useEffect } from 'react'

export const APP_TITLE = 'Pío · Aprendo a sentir, un día a la vez'

// "Lecciones · Pío" while the page is open; back to the app title when it closes
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Pío` : APP_TITLE
    return () => {
      document.title = APP_TITLE
    }
  }, [title])
}
