import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { PostgrestError } from '@supabase/supabase-js'
import { ArrowLeft, KeyRound, Printer, Search, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ErrorCard } from '@/components/ui/Card'
import { initials } from '@/features/auth/useMyProfile'
import { groupLabel, norm } from '@/lib/format'
import { useGroupStudents, useMyGroups } from '@/features/teacher/api'
import { PinCard } from './PinCard'
import { usePageTitle } from '@/lib/usePageTitle'

type NewPin = { student_id: string; display_name: string; pin: string }

export default function StudentsPage() {
  const { t } = useTranslation()
  usePageTitle(t('groups.students'))
  const { groupId } = useParams()
  const groups = useMyGroups()
  const group = groups.data?.find((g) => g.id === groupId)
  const students = useGroupStudents(groupId)
  const [query, setQuery] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const reset = useMutation({
    mutationFn: async (studentId: string) => {
      const { data, error } = await supabase.rpc('reset_student_pin', { p_student_id: studentId })
      if (error) throw error
      return data as unknown as NewPin
    },
    onSuccess: () => setConfirmId(null),
  })

  if (groups.isLoading || students.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!group || students.error) {
    return <div className="p-5 lg:p-10"><ErrorCard message={t('students.loadError')} onRetry={() => students.refetch()} /></div>
  }

  const list = (students.data ?? []).filter((s) => norm(s.display_name).includes(norm(query)))

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2 print:hidden">
        <Link to="/docente/grupos" aria-label={t('common.back')} className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{t('groups.students')}</h1>
          <p className="text-sm text-tinta/60">{groupLabel(group)} · {t('common.students', { count: students.data?.length ?? 0 })} · {t('students.code', { code: group.class_code })}</p>
        </div>
        <Link to={`/docente/grupos/${group.id}/estudiantes/agregar`} className="flex items-center gap-2 rounded-full bg-azul px-4 py-2.5 font-bold text-white">
          <UserPlus size={18} /> <span className="hidden sm:inline">{t('students.add')}</span>
        </Link>
      </div>

      {/* New PIN, shown only once */}
      {reset.data && (
        <section className="mb-5 rounded-card bg-azul-suave p-4">
          <p className="mb-3 font-bold text-azul print:hidden">
            {t('students.newPinShown', { name: reset.data.display_name })}
          </p>
          <PinCard name={reset.data.display_name} groupText={groupLabel(group)} classCode={group.class_code} pin={reset.data.pin} level={group.level} />
          <div className="mt-3 flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-azul py-2.5 font-bold text-white">
              <Printer size={18} /> {t('common.print')}
            </button>
            <button onClick={() => reset.reset()} className="flex-1 rounded-full border-2 border-linea bg-white py-2.5 font-bold">{t('common.done')}</button>
          </div>
        </section>
      )}

      <div className="print:hidden">
        <label className="mb-3 flex items-center gap-2 rounded-full border-2 border-linea bg-white px-4 py-2.5 focus-within:border-azul">
          <Search size={18} className="text-tinta/50" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('students.search')} className="w-full bg-transparent outline-none" />
        </label>

        {reset.error && (
          <p role="alert" className="mb-3 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">
            {(reset.error as PostgrestError).code === '42501' ? t('students.pinPermission') : t('students.pinError')}
          </p>
        )}

        {students.data?.length === 0 ? (
          <div className="rounded-card border border-linea bg-white p-8 text-center">
            <p className="font-bold">{t('students.empty')}</p>
            <Link to={`/docente/grupos/${group.id}/estudiantes/agregar`} className="mt-3 inline-block rounded-full bg-azul px-5 py-2.5 font-bold text-white">
              {t('students.addMany')}
            </Link>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-card border border-linea bg-white">
            {list.map((s) => (
              <li key={s.id} className="border-b border-linea px-4 py-3 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cian text-sm font-extrabold text-white">{initials(s.display_name)}</span>
                  <Link to={`/docente/grupos/${group.id}/estudiantes/${s.id}`} className="flex-1 font-bold hover:text-azul hover:underline">
                    {s.display_name}
                  </Link>
                  {confirmId !== s.id && (
                    <button onClick={() => setConfirmId(s.id)} className="flex items-center gap-1.5 rounded-full border-2 border-linea px-3 py-1.5 text-sm font-bold">
                      <KeyRound size={16} /> {t('students.newPin')}
                    </button>
                  )}
                </div>
                {confirmId === s.id && (
                  <div className="mt-2 rounded-2xl bg-arena p-3">
                    <p className="text-sm font-bold">{t('students.confirmPin', { name: s.display_name })}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => reset.mutate(s.id)} disabled={reset.isPending} className="flex-1 rounded-full bg-azul py-2 font-bold text-white disabled:opacity-60">
                        {reset.isPending ? t('students.generating') : t('students.yesGenerate')}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="flex-1 rounded-full border-2 border-linea bg-white py-2 font-bold">{t('common.cancel')}</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}