import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { MessageCircleHeart, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/app/auth-context'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorCard } from '@/components/ui/Card'
import { initials } from '@/features/auth/useMyProfile'
import { groupLabel, relativeDay } from '@/lib/format'
import { LEVEL, STATUS, reasonText } from './alertTexts'
import { useAlerts, useSetAlertStatus, type AlertRow } from './api'

const LEVEL_ORDER = { risk_high: 0, risk_moderate: 1, support: 2 } as const
const STATUS_ORDER = { open: 0, in_attention: 1, closed: 2 } as const

export default function AlertsPage() {
  const { t } = useTranslation()
  const { role } = useAuth()
  const [tab, setTab] = useState<'active' | 'closed'>('active')
  const [groupFilter, setGroupFilter] = useState('all')
  const alerts = useAlerts(tab)

  const all = alerts.data ?? []
  const groups = [...new Map(all.filter((a) => a.groups).map((a) => [a.group_id, a.groups!])).entries()]
  const list = all
    .filter((a) => groupFilter === 'all' || a.group_id === groupFilter)
    .sort(
      (a, b) =>
        LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] ||
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        b.opened_at.localeCompare(a.opened_at),
    )

  return (
    <div className="pb-10">
      <PageHeader
        title={role === 'teacher' ? t('alerts.titleTeacher') : t('alerts.titleSchool')}
        subtitle={
          role === 'teacher'
            ? t('alerts.subtitleTeacher')
            : t('alerts.subtitleSchool')
        }
      />

      <div className="flex flex-col gap-4 px-5 lg:max-w-3xl lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" className="grid grid-cols-2 rounded-full bg-white p-1 text-sm font-bold">
            {(['active', 'closed'] as const).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`rounded-full px-5 py-2 ${tab === k ? 'bg-azul text-white' : 'text-tinta/60'}`}
              >
                {k === 'active' ? t('alerts.tabActive') : t('alerts.tabClosed')}
              </button>
            ))}
          </div>
          {groups.length > 1 && (
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              aria-label={t('common.filterByGroup')}
              className="rounded-full border border-linea bg-white px-4 py-2 text-sm font-bold"
            >
              <option value="all">{t('common.allGroups')}</option>
              {groups.map(([id, g]) => (
                <option key={id} value={id}>{groupLabel(g)}</option>
              ))}
            </select>
          )}
        </div>

        {alerts.isLoading && <div className="h-40 animate-pulse rounded-card bg-linea" />}
        {alerts.error && <ErrorCard message={t('alerts.loadError')} onRetry={() => alerts.refetch()} />}

        {alerts.data && list.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-card border border-linea bg-white p-8 text-center">
            <img src="/pio-mascota.png" alt="" className="h-20 w-20" />
            <p className="font-bold">{tab === 'active' ? t('alerts.emptyActive') : t('alerts.emptyClosed')}</p>
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {list.map((a) => <AlertCard key={a.id} a={a} />)}
        </ul>

        <p className="text-center text-xs text-tinta/50">
          {t('alerts.disclaimer')}
        </p>
      </div>
    </div>
  )
}

function AlertCard({ a }: { a: AlertRow }) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const setStatus = useSetAlertStatus()
  const [confirmClose, setConfirmClose] = useState(false)
  const text = reasonText(a.reason_code, a.details)
  const risk = a.level !== 'support'
  const Icon = a.origin === 'chat' ? ShieldAlert : MessageCircleHeart
  const mine = a.attended_by === session?.user.id

  return (
    <li className={`rounded-card border bg-white p-4 ${a.level === 'risk_high' ? 'border-rosa-profundo ring-1 ring-rosa-profundo' : 'border-linea'}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cian text-sm font-extrabold text-white">
          {initials(a.students?.display_name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{a.students?.display_name ?? t('common.student')}</p>
            {a.groups && <span className="text-xs text-tinta/60">{groupLabel(a.groups)}</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs font-bold">
            {risk && <span className={`rounded-full px-2.5 py-0.5 ${LEVEL[a.level].cls}`}>{LEVEL[a.level].label}</span>}
            <span className={`rounded-full px-2.5 py-0.5 ${STATUS[a.status].cls}`}>
              {STATUS[a.status].label}{a.status === 'in_attention' && mine ? ` · ${t('alerts.byYou')}` : ''}
            </span>
          </div>
        </div>
        <Icon size={22} className={risk ? 'text-rosa-profundo' : 'text-azul'} />
      </div>

      <div className="mt-3">
        <p className="font-bold">{text.title}</p>
        {text.detail && <p className="text-sm text-tinta/75">{text.detail}</p>}
        <p className="mt-1 text-xs text-tinta/50">
          {t('alerts.opened', { when: relativeDay(a.opened_at) })}
          {a.closed_at && ` · ${t('alerts.closedAt', { when: relativeDay(a.closed_at) })}`}
        </p>
      </div>

      {a.status !== 'closed' && (
        <>
          <p className="mt-3 rounded-2xl bg-arena px-3 py-2 text-sm">💡 {text.advice}</p>

          {setStatus.error && (
            <p role="alert" className="mt-2 text-sm font-bold text-rosa-profundo">
              {t('alerts.updateError')}
            </p>
          )}

          {confirmClose ? (
            <div className="mt-3 rounded-2xl border border-linea p-3">
              <p className="text-sm font-bold">{t('alerts.confirmClose')}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setStatus.mutate({ id: a.id, status: 'closed' })}
                  disabled={setStatus.isPending}
                  className="flex-1 rounded-full bg-azul py-2.5 font-bold text-white disabled:opacity-60"
                >
                  {t('alerts.yesClose')}
                </button>
                <button onClick={() => setConfirmClose(false)} className="flex-1 rounded-full border-2 border-linea py-2.5 font-bold">
                  {t('alerts.notYet')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              {a.status === 'open' && (
                <button
                  onClick={() => setStatus.mutate({ id: a.id, status: 'in_attention' })}
                  disabled={setStatus.isPending}
                  className="flex-1 rounded-full bg-azul py-2.5 font-bold text-white disabled:opacity-60"
                >
                  {t('alerts.attending')}
                </button>
              )}
              <button onClick={() => setConfirmClose(true)} className="flex-1 rounded-full border-2 border-linea py-2.5 font-bold">
                {t('alerts.close')}
              </button>
            </div>
          )}
        </>
      )}
    </li>
  )
}