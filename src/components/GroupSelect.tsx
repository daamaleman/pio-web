import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { groupLabel } from '@/lib/format'

type G = { id: string; level: string; grade: number; section: string }

export function GroupSelect({ groups, value, onChange }: { groups: G[]; value?: string; onChange: (id: string) => void }) {
  const { t } = useTranslation()
  if (groups.length <= 1) {
    const g = groups[0]
    return g ? <span className="rounded-full bg-azul-suave px-4 py-2 text-sm font-bold text-azul">{groupLabel(g)}</span> : null
  }
  return (
    <span className="relative inline-flex items-center rounded-full bg-azul-suave text-sm font-bold text-azul">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('common.chooseGroup')}
        className="cursor-pointer appearance-none bg-transparent py-2 pl-4 pr-9 outline-none"
      >
        {groups.map((g) => (
          <option key={g.id} value={g.id}>{groupLabel(g)}</option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3" />
    </span>
  )
}