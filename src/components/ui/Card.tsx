import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

export function Card({ title, aside, children, className = '' }: {
  title?: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-card border border-linea bg-white p-5 ${className}`}>
      {(title || aside) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {aside && <div className="text-sm font-semibold text-tinta/60">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="rounded-card bg-rosa-suave p-5 text-rosa-profundo">
      <p className="font-bold">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-bold">
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}