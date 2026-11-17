import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PostgrestError } from '@supabase/supabase-js'
import { ArrowLeft, Lock, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/auth-context'
import { ErrorCard } from '@/components/ui/Card'
import { OBS_CATEGORY } from '@/features/alerts/alertTexts'
import { initials } from '@/features/auth/useMyProfile'
import { groupLabel, pickText, shortDate, todayISO } from '@/lib/format'
import { useGroupAssignments, useLessons, useMyGroups } from '@/features/teacher/api'

function useStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('id, display_name, group_id').eq('id', studentId!).single()
      if (error) throw error
      return data
    },
  })
}

function useObservations(studentId: string | undefined) {
  return useQuery({
    queryKey: ['observations', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_observations')
        .select('id, category, note, observed_on, referred, author_id, lessons(week, title)')
        .eq('student_id', studentId!)
        .order('observed_on', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

const SAVE_ERROR: Record<string, string> = {
  DATE_OUT_OF_RANGE: 'La fecha tiene que estar entre hoy y los últimos 60 días.',
}

export default function StudentPage() {
  const { groupId, studentId } = useParams()
  const { session } = useAuth()
  const qc = useQueryClient()
  const groups = useMyGroups()
  const group = groups.data?.find((g) => g.id === groupId)
  const student = useStudent(studentId)
  const observations = useObservations(studentId)
  const lessons = useLessons(group)
  const assignments = useGroupAssignments(groupId)
  const assignedLessons = (lessons.data ?? []).filter((l) => assignments.data?.some((a) => a.lesson_id === l.id))

  const today = todayISO()
  const [day, setDay] = useState(today)
  const [category, setCategory] = useState('emotional')
  const [note, setNote] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [refer, setRefer] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const add = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('add_observation', {
        p_student_id: studentId!,
        p_category: category,
        p_note: note.trim(),
        p_lesson_id: lessonId || undefined,
        p_observed_on: day,
        p_refer: refer,
      })
      if (error) throw error
      return data as { id: string; alert: 'none' | 'created' | 'already_open' }
    },
    onSuccess: () => {
      setNote('')
      setLessonId('')
      setRefer(false)
      qc.invalidateQueries({ queryKey: ['observations', studentId] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['group-alerts'] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('teacher_observations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      setConfirmDelete(null)
      qc.invalidateQueries({ queryKey: ['observations', studentId] })
    },
  })

  if (student.isLoading || groups.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!student.data || !group) return <div className="p-5 lg:p-10"><ErrorCard message="No encontramos al estudiante." /></div>

  const err = add.error as PostgrestError | null

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-3">
        <Link to={`/docente/grupos/${group.id}/estudiantes`} aria-label="Volver" className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></Link>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cian font-extrabold text-white">{initials(student.data.display_name)}</span>
        <div>
          <h1 className="text-2xl font-extrabold">{student.data.display_name}</h1>
          <p className="text-sm text-tinta/60">{groupLabel(group)}</p>
        </div>
      </div>

      <p className="mb-4 flex items-start gap-2 rounded-2xl bg-azul-suave px-4 py-3 text-sm text-azul">
        <Lock size={16} className="mt-0.5 shrink-0" />
        Solo vos ves estas notas. Ni el estudiante, ni su familia, ni dirección. Si pedís apoyo, orientación recibe un aviso con la categoría, no tu texto.
      </p>

      {/* New observation */}
      <form
        onSubmit={(e: FormEvent) => { e.preventDefault(); add.mutate() }}
        className="flex flex-col gap-3 rounded-card border border-linea bg-white p-5"
      >
        <h2 className="text-lg font-bold">Nueva observación</h2>

        <div className="flex flex-wrap gap-2">
          {Object.entries(OBS_CATEGORY).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setCategory(key)} aria-pressed={category === key}
              className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${category === key ? 'border-azul bg-azul-suave text-azul' : 'border-linea'}`}>
              {label}
            </button>
          ))}
        </div>

        <textarea value={note} onChange={(e) => setNote(e.target.value)} required minLength={3} maxLength={500} rows={4}
          placeholder="Qué observaste, en palabras concretas. Por ejemplo: «Hoy no quiso participar en el juego y estuvo aparte en el recreo»."
          className="w-full rounded-2xl border-2 border-linea px-4 py-3 outline-none focus:border-azul" />
        <p className="-mt-2 text-right text-xs text-tinta/50">{note.length}/500</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold">Fecha
            <input type="date" value={day} max={today} onChange={(e) => setDay(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-linea px-4 py-2.5 font-semibold outline-none focus:border-azul" />
          </label>
          <label className="text-sm font-bold">Lección (opcional)
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-2.5 font-semibold outline-none focus:border-azul">
              <option value="">Ninguna</option>
              {assignedLessons.map((l) => <option key={l.id} value={l.id}>Semana {l.week} · {pickText(l.title)}</option>)}
            </select>
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-arena p-3 text-sm">
          <input type="checkbox" checked={refer} onChange={(e) => setRefer(e.target.checked)} className="mt-1 h-4 w-4 accent-[#374EA2]" />
          <span><b>Pedir apoyo de orientación.</b> Orientación recibe una alerta con el nombre del estudiante y la categoría.</span>
        </label>

        {err && (
          <p role="alert" className="rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">
            {SAVE_ERROR[err.message] ?? (err.code === '42501' ? 'No tenés permiso para este estudiante.' : 'No pudimos guardar la observación.')}
          </p>
        )}
        {add.data && (
          <p role="status" className="rounded-2xl bg-[#E6F4DC] px-4 py-3 text-sm font-bold text-[#2E6B12]">
            ✓ Observación guardada.
            {add.data.alert === 'created' && ' Orientación recibió el aviso.'}
            {add.data.alert === 'already_open' && ' Ya había un pedido de apoyo abierto para este estudiante.'}
          </p>
        )}

        <button type="submit" disabled={add.isPending || note.trim().length < 3}
          className="rounded-full bg-azul py-3 font-display text-lg font-bold text-white disabled:opacity-50">
          {add.isPending ? 'Guardando…' : 'Guardar observación'}
        </button>
      </form>

      {/* History */}
      <h2 className="mb-2 mt-6 text-lg font-bold">Historial</h2>
      {observations.error && <ErrorCard message="No pudimos cargar las observaciones." onRetry={() => observations.refetch()} />}
      {observations.data?.length === 0 && <p className="text-sm text-tinta/60">Todavía no hay observaciones.</p>}
      <ul className="flex flex-col gap-2">
        {observations.data?.map((o) => (
          <li key={o.id} className="rounded-2xl border border-linea bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-tinta/60">{shortDate(o.observed_on)}</span>
              <span className="rounded-full bg-azul-suave px-2.5 py-0.5 font-bold text-azul">{OBS_CATEGORY[o.category] ?? o.category}</span>
              {o.lessons && <span className="text-tinta/60">Semana {o.lessons.week} · {pickText(o.lessons.title)}</span>}
              {o.referred && <span className="rounded-full bg-rosa-suave px-2.5 py-0.5 font-bold text-rosa-profundo">Pediste apoyo de orientación</span>}
              {o.author_id === session?.user.id && confirmDelete !== o.id && (
                <button onClick={() => setConfirmDelete(o.id)} aria-label="Borrar observación" className="ml-auto rounded-full p-1.5 text-tinta/40 hover:bg-arena hover:text-rosa-profundo">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="mt-2 whitespace-pre-line">{o.note}</p>
            {confirmDelete === o.id && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-arena p-2 text-sm">
                <span className="flex-1 font-bold">¿Borrar esta observación? No se puede deshacer.</span>
                <button onClick={() => remove.mutate(o.id)} disabled={remove.isPending} className="rounded-full bg-rosa-profundo px-3 py-1.5 font-bold text-white">Borrar</button>
                <button onClick={() => setConfirmDelete(null)} className="rounded-full border-2 border-linea bg-white px-3 py-1.5 font-bold">Cancelar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}