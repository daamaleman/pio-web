import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { tLabels } from '@/i18n'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { Mail, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorCard } from '@/components/ui/Card'
import { initials } from '@/features/auth/useMyProfile'
import { ROLE_LABEL, isStaff } from '@/lib/roles'
import { relativeDay } from '@/lib/format'
import { useMySchools } from './api'
import { useAuth } from '@/app/auth-context'

const INVITE_ERROR = tLabels('staff.errors', ['INVALID_EMAIL', 'INVALID_NAME', 'INVALID_ROLE', 'ROLE_NOT_ALLOWED', 'FORBIDDEN', 'SCHOOL_NOT_FOUND', 'ROLE_MISMATCH', 'ALREADY_IN_SCHOOL', 'INVITE_FAILED', 'NETWORK'] as const) as Record<string, string>

const STATUS_TEXT = tLabels('staff.status', ['invited', 'added_to_school', 'profile_completed'] as const) as Record<string, string>

function useSchoolStaff(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school-staff', schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_schools')
        .select('profile_id, created_at, profiles(full_name, role, active)')
        .eq('school_id', schoolId!)
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

export default function StaffPage() {
  const { t } = useTranslation()
  const { schoolId: paramId } = useParams()
  const { role: myRole } = useAuth()
  const schools = useMySchools()
  const schoolId = paramId ?? schools.data?.[0]?.school_id
  const invitable = (myRole === 'admin' ? ['director', 'counselor', 'teacher'] : ['teacher', 'counselor']) as ('teacher' | 'counselor' | 'director')[]
  const staff = useSchoolStaff(schoolId)
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'teacher' | 'counselor' | 'director'>('teacher')

  const invite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('invite-staff', {
        body: { email: email.trim().toLowerCase(), full_name: fullName.trim(), role, school_id: schoolId },
      })
      if (error) {
        const code = error instanceof FunctionsHttpError
          ? ((await error.context.json().catch(() => null))?.error?.code ?? 'INTERNAL_ERROR')
          : 'NETWORK'
        throw new Error(code)
      }
      return data as { status: string; full_name: string }
    },
    onSuccess: () => {
      setEmail('')
      setFullName('')
      qc.invalidateQueries({ queryKey: ['school-staff', schoolId] })
      qc.invalidateQueries({ queryKey: ['school-overview'] })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    invite.mutate()
  }

  if (!paramId && schools.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />

  const sorted = [...(staff.data ?? [])].sort((a, b) => (a.profiles?.role ?? '').localeCompare(b.profiles?.role ?? ''))

  return (
    <div className="pb-10">
      <PageHeader title={t('nav.staff')} subtitle={t('staff.subtitle')} />
      <div className="grid gap-4 px-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-10">
        {/* List */}
        <section className="rounded-card border border-linea bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">{t('staff.team')} ({staff.data?.length ?? 0})</h2>
          {staff.error && <ErrorCard message={t('staff.loadError')} onRetry={() => staff.refetch()} />}
          <ul className="flex flex-col divide-y divide-linea">
            {sorted.map((s) => (
              <li key={s.profile_id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-azul text-sm font-extrabold text-white">
                  {initials(s.profiles?.full_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{s.profiles?.full_name ?? '—'}</p>
                  <p className="text-xs text-tinta/60">{t('staff.since', { when: relativeDay(s.created_at) })}</p>
                </div>
                {s.profiles && isStaff(s.profiles.role) && (
                  <span className="rounded-full bg-azul-suave px-3 py-1 text-xs font-bold text-azul">{ROLE_LABEL[s.profiles.role]}</span>
                )}
                {s.profiles && !s.profiles.active && (
                  <span className="rounded-full bg-arena px-3 py-1 text-xs font-bold text-tinta/50">{t('staff.inactive')}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Invite */}
        <form onSubmit={onSubmit} className="self-start rounded-card border border-linea bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><UserPlus size={20} /> {t('staff.invite')}</h2>
          <p className="mt-1 text-sm text-tinta/60">{t('staff.inviteHint')}</p>

          <label htmlFor="inv-name" className="mt-4 block text-sm font-bold">{t('staff.fullName')}</label>
          <input id="inv-name" required minLength={3} maxLength={80} value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-linea px-4 py-2.5 outline-none focus:border-azul" />

          <label htmlFor="inv-email" className="mt-3 block text-sm font-bold">{t('login.email')}</label>
          <input id="inv-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-linea px-4 py-2.5 outline-none focus:border-azul" />

          <p className="mt-3 text-sm font-bold">{t('staff.role')}</p>
          <div className={`mt-1 grid gap-2 ${invitable.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {invitable.map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)} aria-pressed={role === r}
                className={`rounded-full border-2 py-2.5 font-bold ${role === r ? 'border-azul bg-azul-suave text-azul' : 'border-linea'}`}>
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>

          {invite.error && (
            <p role="alert" className="mt-3 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">
              {INVITE_ERROR[invite.error.message] ?? t('staff.inviteError')}
            </p>
          )}
          {invite.data && (
            <p role="status" className="mt-3 rounded-2xl bg-[#E6F4DC] px-4 py-3 text-sm font-bold text-[#2E6B12]">
              ✓ {invite.data.full_name}: {STATUS_TEXT[invite.data.status] ?? t('common.done')}
            </p>
          )}

          <button type="submit" disabled={invite.isPending || !schoolId}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-azul py-3 font-display text-lg font-bold text-white disabled:opacity-60">
            <Mail size={18} /> {invite.isPending ? t('progress.sending') : t('staff.send')}
          </button>
        </form>
      </div>
    </div>
  )
}