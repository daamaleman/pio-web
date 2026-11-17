import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

const INVITE_ERROR: Record<string, string> = {
  INVALID_EMAIL: 'Revisá el correo.',
  INVALID_NAME: 'El nombre debe tener de 3 a 80 caracteres.',
  INVALID_ROLE: 'Elegí un rol.',
  ROLE_NOT_ALLOWED: 'Dirección solo puede invitar docentes y orientación.',
  FORBIDDEN: 'No tenés permiso para invitar en esta escuela.',
  SCHOOL_NOT_FOUND: 'La escuela no existe.',
  ROLE_MISMATCH: 'Esa persona ya tiene otro rol en Pío. Pedile ayuda al equipo de administración.',
  ALREADY_IN_SCHOOL: 'Esa persona ya es parte de la escuela.',
  INVITE_FAILED: 'No pudimos enviar el correo. Intentá más tarde.',
  NETWORK: 'No pudimos conectar con el servidor.',
}

const STATUS_TEXT: Record<string, string> = {
  invited: 'Le enviamos un correo con un enlace para crear su contraseña (vale 24 horas).',
  added_to_school: 'Ya tenía cuenta en Pío: la agregamos a la escuela.',
  profile_completed: 'Ya tenía cuenta: completamos su perfil y la agregamos a la escuela.',
}

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
      <PageHeader title="Personal" subtitle="Quién usa Pío en tu escuela." />
      <div className="grid gap-4 px-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-10">
        {/* List */}
        <section className="rounded-card border border-linea bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">Equipo ({staff.data?.length ?? 0})</h2>
          {staff.error && <ErrorCard message="No pudimos cargar el personal." onRetry={() => staff.refetch()} />}
          <ul className="flex flex-col divide-y divide-linea">
            {sorted.map((s) => (
              <li key={s.profile_id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-azul text-sm font-extrabold text-white">
                  {initials(s.profiles?.full_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{s.profiles?.full_name ?? '—'}</p>
                  <p className="text-xs text-tinta/60">En la escuela desde {relativeDay(s.created_at)}</p>
                </div>
                {s.profiles && isStaff(s.profiles.role) && (
                  <span className="rounded-full bg-azul-suave px-3 py-1 text-xs font-bold text-azul">{ROLE_LABEL[s.profiles.role]}</span>
                )}
                {s.profiles && !s.profiles.active && (
                  <span className="rounded-full bg-arena px-3 py-1 text-xs font-bold text-tinta/50">Inactiva</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Invite */}
        <form onSubmit={onSubmit} className="self-start rounded-card border border-linea bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><UserPlus size={20} /> Invitar</h2>
          <p className="mt-1 text-sm text-tinta/60">Le llega un correo para crear su contraseña.</p>

          <label htmlFor="inv-name" className="mt-4 block text-sm font-bold">Nombre completo</label>
          <input id="inv-name" required minLength={3} maxLength={80} value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-linea px-4 py-2.5 outline-none focus:border-azul" />

          <label htmlFor="inv-email" className="mt-3 block text-sm font-bold">Correo</label>
          <input id="inv-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-linea px-4 py-2.5 outline-none focus:border-azul" />

          <p className="mt-3 text-sm font-bold">Rol</p>
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
              {INVITE_ERROR[invite.error.message] ?? 'No pudimos invitar. Intentá de nuevo.'}
            </p>
          )}
          {invite.data && (
            <p role="status" className="mt-3 rounded-2xl bg-[#E6F4DC] px-4 py-3 text-sm font-bold text-[#2E6B12]">
              ✓ {invite.data.full_name}: {STATUS_TEXT[invite.data.status] ?? 'Listo.'}
            </p>
          )}

          <button type="submit" disabled={invite.isPending || !schoolId}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-azul py-3 font-display text-lg font-bold text-white disabled:opacity-60">
            <Mail size={18} /> {invite.isPending ? 'Enviando…' : 'Enviar invitación'}
          </button>
        </form>
      </div>
    </div>
  )
}