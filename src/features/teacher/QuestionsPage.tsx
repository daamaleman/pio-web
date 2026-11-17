import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, EyeOff, Inbox, RotateCcw, ShieldQuestion } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ErrorCard } from '@/components/ui/Card'
import { groupLabel, pickText, shortDate } from '@/lib/format'
import { useMyGroups } from './api'
import { usePageTitle } from '@/lib/usePageTitle'

type Status = 'new' | 'answered' | 'hidden'

const TABS: { key: Status; label: string }[] = [
  { key: 'new', label: 'Nuevas' },
  { key: 'answered', label: 'Respondidas' },
  { key: 'hidden', label: 'Ocultas' },
]

function useQuestions(groupId: string | undefined) {
  return useQuery({
    queryKey: ['anonymous-questions', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anonymous_questions')
        .select('id, body, status, created_on, lessons(week, title)')
        .eq('group_id', groupId!)
        .order('created_on', { ascending: false })
        .order('id') // random ids: never arrival order inside a day
      if (error) throw error
      return data
    },
  })
}

export default function QuestionsPage() {
  usePageTitle('Buzón de preguntas')
  const { groupId } = useParams()
  const qc = useQueryClient()
  const groups = useMyGroups()
  const group = groups.data?.find((g) => g.id === groupId)
  const questions = useQuestions(groupId)
  const [tab, setTab] = useState<Status>('new')

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.rpc('set_question_status', { p_question_id: id, p_status: status })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anonymous-questions', groupId] }),
  })

  if (groups.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!group) return <div className="p-5 lg:p-10"><ErrorCard message="No encontramos el grupo." /></div>

  const all = questions.data ?? []
  const list = all.filter((q) => q.status === tab)
  const count = (s: Status) => all.filter((q) => q.status === s).length

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/docente/grupos" aria-label="Volver" className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></Link>
        <div>
          <h1 className="text-2xl font-extrabold">Buzón de preguntas</h1>
          <p className="text-sm text-tinta/60">{groupLabel(group)}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-3 rounded-2xl bg-azul-suave p-4 text-sm text-azul">
        <ShieldQuestion size={20} className="shrink-0" />
        <div>
          <p className="font-bold">Las preguntas son anónimas: Pío no guarda quién las escribió, ni a qué hora.</p>
          <p className="mt-1">Respondelas en clase para todo el grupo. Si alguna te preocupa, hablá con orientación y tratá el tema con el grupo, sin buscar quién la escribió.</p>
        </div>
      </div>

      {group.level !== 'secondary' && (
        <p className="rounded-2xl bg-arena px-4 py-3 text-sm">El buzón de preguntas anónimas es para secundaria.</p>
      )}

      <div role="tablist" className="mb-4 grid grid-cols-3 rounded-full bg-white p-1 text-sm font-bold">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`rounded-full py-2 ${tab === t.key ? 'bg-azul text-white' : 'text-tinta/60'}`}>
            {t.label} ({count(t.key)})
          </button>
        ))}
      </div>

      {questions.isLoading && <div className="h-40 animate-pulse rounded-card bg-linea" />}
      {questions.error && <ErrorCard message="No pudimos cargar el buzón." onRetry={() => questions.refetch()} />}
      {setStatus.error && <p role="alert" className="mb-3 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">No se pudo cambiar el estado.</p>}

      {questions.data && list.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-card border border-linea bg-white p-8 text-center">
          <Inbox size={32} className="text-tinta/30" />
          <p className="font-bold">{tab === 'new' ? 'No hay preguntas nuevas.' : tab === 'answered' ? 'Todavía no marcaste preguntas como respondidas.' : 'No hay preguntas ocultas.'}</p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {list.map((q) => (
          <li key={q.id} className="rounded-card border border-linea bg-white p-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-tinta/50">
              {shortDate(q.created_on)}{q.lessons ? ` · Semana ${q.lessons.week} · ${pickText(q.lessons.title)}` : ''}
            </p>
            <p className="mt-2 text-lg font-semibold">“{q.body}”</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.status !== 'answered' && (
                <button onClick={() => setStatus.mutate({ id: q.id, status: 'answered' })} disabled={setStatus.isPending}
                  className="flex items-center gap-1.5 rounded-full bg-azul px-4 py-2 text-sm font-bold text-white">
                  <CheckCircle2 size={16} /> La respondí en clase
                </button>
              )}
              {q.status === 'new' && (
                <button onClick={() => setStatus.mutate({ id: q.id, status: 'hidden' })} disabled={setStatus.isPending}
                  className="flex items-center gap-1.5 rounded-full border-2 border-linea px-4 py-2 text-sm font-bold">
                  <EyeOff size={16} /> Ocultar
                </button>
              )}
              {q.status !== 'new' && (
                <button onClick={() => setStatus.mutate({ id: q.id, status: 'new' })} disabled={setStatus.isPending}
                  className="flex items-center gap-1.5 rounded-full border-2 border-linea px-4 py-2 text-sm font-bold">
                  <RotateCcw size={16} /> Volver a nuevas
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}