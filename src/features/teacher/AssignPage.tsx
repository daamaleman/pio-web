import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PostgrestError } from '@supabase/supabase-js'
import { ArrowLeft, CalendarDays, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { classDates } from '@/lib/classDates'
import { EMOTIONS, type Emotion } from '@/lib/emotions'
import { groupLabel, pickText, shortDate } from '@/lib/format'
import { ErrorCard } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { initials } from '@/features/auth/useMyProfile'
import { useGroupAssignments, useGroupStudents, useLessons, useMyGroups } from './api'
import { useSelectedGroup } from './useSelectedGroup'
import { usePageTitle } from '@/lib/usePageTitle'

function assignError(e: PostgrestError): string {
  if (e.code === '23505') return 'Esta lección ya está asignada a este grupo.'
  if (e.code === '23514' && e.message.includes('assignments_dates')) return 'La fecha límite no puede ser antes de la clase.'
  if (e.code === '23514') return 'El mensaje puede tener como máximo 280 caracteres.'
  if (e.code === '42501') return 'No tenés permiso para asignar en este grupo.'
  if (e.code === 'P0001') return `No se pudo asignar: ${e.message}`
  return 'No pudimos asignar la lección. Revisá tu conexión e intentá de nuevo.'
}

export default function AssignPage() {
  usePageTitle('Asignar lección')
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const groups = useMyGroups()
  const [group] = useSelectedGroup(groups.data)
  const lessons = useLessons(group)
  const students = useGroupStudents(group?.id)
  const assigned = useGroupAssignments(group?.id)

  const lesson = lessons.data?.find((l) => l.id === lessonId)
  const existing = assigned.data?.find((a) => a.lesson_id === lessonId)
  const dates = useMemo(() => classDates(group?.class_weekday ?? null), [group?.class_weekday])

  const [dueDate, setDueDate] = useState<string | null>(null) // null = use the proposed date
  const [target, setTarget] = useState<'all' | 'some'>('all')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [notifyFamilies, setNotifyFamilies] = useState(true)
  const [remind, setRemind] = useState(true)

  const due = dueDate ?? dates.dueDate
  const total = students.data?.length ?? 0
  const count = target === 'all' ? total : picked.size

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('assign_lesson', {
        p_group_id: group!.id,
        p_lesson_id: lesson!.id,
        p_class_date: dates.classDate,
        p_due_date: due,
        p_message: message.trim() || undefined,
        p_student_ids: target === 'some' ? [...picked] : undefined,
        p_notify_families: notifyFamilies,
        p_remind_day_before: remind,
      })
      if (error) throw error
      return data
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['group-overview', group!.id] }),
        qc.invalidateQueries({ queryKey: ['group-assignments', group!.id] }),
      ])
      navigate('/docente', { state: { flash: `Asignaste «${pickText(lesson!.title)}» a ${count} estudiantes.` } })
    },
  })

  const back = (
    <Link to="/docente/lecciones" aria-label="Volver" className="rounded-full p-2 hover:bg-white">
      <ArrowLeft size={22} />
    </Link>
  )

  if (groups.isLoading || lessons.isLoading || assigned.isLoading) {
    return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  }
  if (!group || !lesson) {
    return (
      <div className="p-5 lg:p-10">
        {back}
        <ErrorCard message="No encontramos esa lección para este grupo." />
      </div>
    )
  }

  const e = lesson.emotion as Emotion | null
  const title = pickText(lesson.title)

  return (
    <div className="mx-auto max-w-xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        {back}
        <h1 className="text-2xl font-extrabold">Asignar lección</h1>
      </div>

      {/* 1. Preview (Figma pink card) */}
      <section className="relative overflow-hidden rounded-card bg-rosa p-5 text-white">
        <p className="text-xs font-extrabold uppercase tracking-wider text-white/85">
          {e ? EMOTIONS[e].label : 'Lección'} · Semana {lesson.week}
        </p>
        <h2 className="mt-1 max-w-[70%] text-2xl font-extrabold leading-tight">{title}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          {lesson.duration_min && <span className="rounded-full bg-white/25 px-3 py-1">{lesson.duration_min} min</span>}
          <span className="rounded-full bg-white/25 px-3 py-1">{lesson.parts_count} partes</span>
          <span className="rounded-full bg-white/25 px-3 py-1">{groupLabel(group)}</span>
        </div>
        <img src="/pio-mascota.png" alt="" className="absolute -bottom-2 right-2 h-24 w-24" />
      </section>

      {existing ? (
        <div className="mt-5 rounded-card bg-azul-suave p-5">
          <p className="font-bold text-azul">Esta lección ya está asignada (vence {shortDate(existing.due_date)}).</p>
          <Link to={`/docente/asignaciones/${existing.id}`} className="mt-2 inline-block font-bold underline">
            Ver avance
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(ev) => {
            ev.preventDefault()
            mutation.mutate()
          }}
          className="mt-5 flex flex-col gap-5"
        >
          {/* 2. Who */}
          <fieldset>
            <legend className="mb-2 text-xs font-extrabold uppercase tracking-wider text-tinta/60">¿A quién?</legend>
            <div className="flex flex-col gap-2">
              <Option checked={target === 'all'} onClick={() => setTarget('all')}>
                Todo el grupo · {groupLabel(group)} <span className="ml-auto text-tinta/50">{total}</span>
              </Option>
              <Option checked={target === 'some'} onClick={() => setTarget('some')}>
                Estudiantes específicos {target === 'some' && <span className="ml-auto text-tinta/50">{picked.size}</span>}
              </Option>
            </div>
            {target === 'some' && (
              <ul className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-linea bg-white">
                {students.data?.map((s) => {
                  const on = picked.has(s.id)
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setPicked((prev) => {
                            const next = new Set(prev)
                            if (on) next.delete(s.id)
                            else next.add(s.id)
                            return next
                          })
                        }
                        className="flex w-full items-center gap-3 border-b border-linea px-4 py-2.5 text-left last:border-0"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cian text-xs font-extrabold text-white">
                          {initials(s.display_name)}
                        </span>
                        <span className="flex-1 font-semibold">{s.display_name}</span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${on ? 'border-azul bg-azul text-white' : 'border-linea'}`}>
                          {on && <Check size={14} strokeWidth={3} />}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </fieldset>

          {/* 3. Due date */}
          <div>
            <label htmlFor="due" className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-tinta/60">
              Fecha límite
            </label>
            <div className="flex items-center gap-3 rounded-2xl border-2 border-linea bg-white px-4 py-3 focus-within:border-azul">
              <CalendarDays size={18} className="text-tinta/60" />
              <input
                id="due"
                type="date"
                value={due}
                min={dates.classDate}
                onChange={(ev) => setDueDate(ev.target.value)}
                className="w-full bg-transparent font-semibold outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-tinta/60">
              Clase del {shortDate(dates.classDate)}. Aparece en «Mi semana» del estudiante.
            </p>
          </div>

          {/* 4. Message */}
          <div>
            <label htmlFor="msg" className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-tinta/60">
              Mensaje para tus estudiantes (opcional)
            </label>
            <textarea
              id="msg"
              value={message}
              maxLength={280}
              rows={3}
              onChange={(ev) => setMessage(ev.target.value)}
              placeholder="¡Hola, chavalos! Esta semana practicamos…"
              className="w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 outline-none focus:border-azul"
            />
            <p className="text-right text-xs text-tinta/50">{message.length}/280</p>
          </div>

          {/* 5. Toggles */}
          <div className="rounded-2xl border border-linea bg-white px-4 py-1">
            <Toggle
              label="Avisar a las familias"
              hint="El reto en casa aparece en la página del QR del grupo"
              checked={notifyFamilies}
              onChange={setNotifyFamilies}
            />
            <div className="border-t border-linea" />
            <Toggle
              label="Recordatorio un día antes"
              hint="Solo a quienes no han terminado, nunca de noche"
              checked={remind}
              onChange={setRemind}
            />
          </div>

          {mutation.error && (
            <p role="alert" className="rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">
              {assignError(mutation.error as PostgrestError)}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || count === 0}
            className="rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-50"
          >
            {mutation.isPending ? 'Asignando…' : `Asignar a ${count} ${count === 1 ? 'estudiante' : 'estudiantes'}`}
          </button>
        </form>
      )}
    </div>
  )
}

function Option({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-full border-2 px-4 py-3 text-left font-bold ${
        checked ? 'border-azul bg-azul-suave text-azul' : 'border-linea bg-white'
      }`}
    >
      <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${checked ? 'border-[6px] border-azul' : 'border-linea'}`} />
      {children}
    </button>
  )
}