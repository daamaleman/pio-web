import { usePageTitle } from '@/lib/usePageTitle'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  usePageTitle(title)
  return (
    <header className="px-5 pb-2 pt-6 lg:px-10 lg:pt-10">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      {subtitle && <p className="mt-1 text-tinta/70">{subtitle}</p>}
    </header>
  )
}