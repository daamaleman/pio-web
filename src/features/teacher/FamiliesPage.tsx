import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { t as tr, tLabels } from '@/i18n'
import type { PostgrestError } from '@supabase/supabase-js'
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ErrorCard } from '@/components/ui/Card'
import { EmotionDrop } from '@/components/EmotionDrop'
import { EMOTIONS, type Emotion } from '@/lib/emotions'
import { groupLabel, pickText, relativeDay } from '@/lib/format'
import { initials } from '@/features/auth/useMyProfile'
import { useGroupAssignments, useGroupStudents, useLessons, useMyGroups } from './api'
import { usePageTitle } from '@/lib/usePageTitle'

type Done = 'yes' | 'partly' | 'no'
type How = 'interest' | 'difficulty' | 'declined'

const DONE: Record<Done, { label: string; cls: string }> = {
  yes: { get label() { return tr('families.done.yes') }, cls: 'bg-[#E6F4DC] text-[#2E6B12]' },
  partly: { get label() { return tr('families.done.partly') }, cls: 'bg-[#FFF3D1] text-[#7A5600]' },
  no: { get label() { return tr('families.done.no') }, cls: 'bg-arena text-tinta/70' },
}
const HOW = tLabels('families.how', ['interest', 'difficulty', 'declined'] as const)

const SAVE_ERROR = tLabels('families.errors', ['ALREADY_SUBMITTED_IN_APP', 'LESSON_NOT_ASSIGNED', 'NOT_FOR_LEVEL', 'COMMENT_TOO_LONG'] as const) as Record<string, string>

function useFamilyData(studentIds: string[]) {
  return useQuery({
    queryKey: ['family-data', studentIds],
    enabled: studentIds.length > 0,
    queryFn: async () => {
      const [consents, sheets] = await Promise.all([
        supabase.from('family_consents').select('student_id, consent_version, accepted, recorded_at').in('student_id', studentIds),
        supabase.from('family_sheets')
          .select('student_id, lesson_id, challenge_done, how_responded, emotion_mentioned, comment, submitted_at, source')
          .in('student_id', studentIds),
      ])
      if (consents.error) throw consents.error
      if (sheets.error) throw sheets.error
      return { consents: consents.data, sheets: sheets.data }
    },
  })
}

export default function FamiliesPage() {
  const { t } = useTranslation()
  usePageTitle(t('groups.families'))
  const { groupId } = useParams()
  const groups = useMyGroups()
  const group = groups.data?.find((g) => g.id === groupId)
  const students = useGroupStudents(groupId)
  const assignments = useGroupAssignments(groupId)
  const lessons = useLessons(group)
  const ids = useMemo(() => (students.data ?? []).map((s) => s.id), [students.data])
  const data = useFamilyData(ids)
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)

  const assignedLessons = (lessons.data ?? []).filter((l) => assignments.data?.some((a) => a.lesson_id === l.id))
  const currentLesson = lessonId ?? assignedLessons[assignedLessons.length - 1]?.id ?? null
  const primary = group?.level === 'primary'

  // Latest consent per student (versions are YYYY-MM, so they sort as text)
  const consentBy = useMemo(() => {
    const m = new Map<string, { consent_version: string; accepted: boolean; recorded_at: string }>()
    for (const c of data.data?.consents ?? []) {
      const prev = m.get(c.student_id)
      if (!prev || c.consent_version > prev.consent_version || (c.consent_version === prev.consent_version && c.recorded_at > prev.recorded_at)) m.set(c.student_id, c)
    }
    return m
  }, [data.data])

  const sheetBy = new Map(
    (data.data?.sheets ?? []).filter((s) => s.lesson_id === currentLesson).map((s) => [s.student_id, s]),
  )

  if (groups.isLoading || students.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (!group) return <div className="p-5 lg:p-10"><ErrorCard message={t('groupForm.notFound')} /></div>

  const withConsent = [...consentBy.values()].filter((c) => c.accepted).length
  const withdrawn = [...consentBy.values()].filter((c) => !c.accepted).length
  const sheetsCount = sheetBy.size
  const paperCount = [...sheetBy.values()].filter((s) => s.source === 'paper').length

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/docente/grupos" aria-label={t('common.back')} className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></Link>
        <div>
          <h1 className="text-2xl font-extrabold">{t('groups.families')}</h1>
          <p className="text-sm text-tinta/60">{groupLabel(group)} · {t('common.students', { count: ids.length })}</p>
        </div>
      </div>

      {/* Summary */}
      <div className={`grid gap-3 ${primary ? 'sm:grid-cols-2' : ''}`}>
        <section className="rounded-card border border-linea bg-white p-4">
          <p className="flex items-center gap-2 font-bold"><ShieldCheck size={18} className="text-azul" /> {t('families.consents')}</p>
          <p className="mt-1 text-sm">
            <b>{withConsent}</b> {t('families.withConsent')} · <b>{withdrawn}</b> {t('families.withdrawn')} · <b>{ids.length - consentBy.size}</b> {t('families.noAnswer')}
          </p>
          <p className="mt-1 text-xs text-tinta/60">{t('families.consentHint')}</p>
        </section>
        {primary && (
          <section className="rounded-card border border-linea bg-white p-4">
            <p className="flex items-center gap-2 font-bold"><FileText size={18} className="text-rosa-profundo" /> {t('families.sheets')}</p>
            <select value={currentLesson ?? ''} onChange={(e) => { setLessonId(e.target.value); setEditing(null) }}
              className="mt-2 w-full rounded-full border border-linea bg-white px-4 py-2 text-sm font-bold">
              {assignedLessons.map((l) => <option key={l.id} value={l.id}>{t('library.week', { week: l.week })} · {pickText(l.title)}</option>)}
            </select>
            <p className="mt-2 text-sm"><b>{sheetsCount}</b> {t('families.ofFamilies', { count: ids.length })}{paperCount > 0 && ` (${t('families.onPaper', { count: paperCount })})`}</p>
          </section>
        )}
      </div>
      {!primary && (
        <p className="mt-3 rounded-2xl bg-arena px-4 py-3 text-sm">
          {t('families.secondary')}
        </p>
      )}

      {data.error && <div className="mt-4"><ErrorCard message={t('families.loadError')} onRetry={() => data.refetch()} /></div>}

      {/* Per student */}
      <ul className="mt-4 flex flex-col gap-2">
        {students.data?.map((s) => {
          const c = consentBy.get(s.id)
          const sheet = sheetBy.get(s.id)
          return (
            <li key={s.id} className="rounded-2xl border border-linea bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cian text-sm font-extrabold text-white">{initials(s.display_name)}</span>
                <span className="min-w-0 flex-1 font-bold">{s.display_name}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${!c ? 'bg-arena text-tinta/60' : c.accepted ? 'bg-azul-suave text-azul' : 'bg-rosa-suave text-rosa-profundo'}`}>
                  {!c ? t('families.consentNone') : c.accepted ? t('families.consentYes', { version: c.consent_version }) : t('families.consentWithdrawn')}
                </span>
              </div>

              {primary && currentLesson && editing !== s.id && (
                sheet ? (
                  <div className="mt-3 rounded-2xl bg-arena p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${DONE[sheet.challenge_done as Done].cls}`}>{DONE[sheet.challenge_done as Done].label}</span>
                      <span className="text-xs font-bold text-tinta/70">{HOW[sheet.how_responded as How]}</span>
                      {sheet.emotion_mentioned && (
                        <span className="flex items-center gap-1 text-xs font-bold text-tinta/70">
                          · <EmotionDrop emotion={sheet.emotion_mentioned as Emotion} size={16} /> {EMOTIONS[sheet.emotion_mentioned as Emotion].label}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-tinta/50">{sheet.source === 'paper' ? t('families.paper') : t('families.inApp')} · {relativeDay(sheet.submitted_at)}</span>
                    </div>
                    {sheet.comment && <p className="mt-2 italic">“{sheet.comment}”</p>}
                    {sheet.source === 'paper' && (
                      <button onClick={() => setEditing(s.id)} className="mt-2 text-xs font-bold text-azul underline">{t('families.fix')}</button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setEditing(s.id)} className="mt-3 w-full rounded-full border-2 border-dashed border-linea py-2 text-sm font-bold text-tinta/60 hover:bg-arena">
                    {t('families.record')}
                  </button>
                )
              )}

              {primary && currentLesson && editing === s.id && (
                <PaperSheetForm studentId={s.id} lessonId={currentLesson} initial={sheet} onDone={() => setEditing(null)} />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PaperSheetForm({ studentId, lessonId, initial, onDone }: {
  studentId: string
  lessonId: string
  initial?: { challenge_done: string; how_responded: string; emotion_mentioned: string | null; comment: string | null }
  onDone: () => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [done, setDone] = useState<Done | null>((initial?.challenge_done as Done) ?? null)
  const [how, setHow] = useState<How | null>((initial?.how_responded as How) ?? null)
  const [emotion, setEmotion] = useState<Emotion | null>((initial?.emotion_mentioned as Emotion) ?? null)
  const [comment, setComment] = useState(initial?.comment ?? '')

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('record_family_sheet', {
        p_student_id: studentId,
        p_lesson_id: lessonId,
        p_challenge_done: done!,
        p_how_responded: how!,
        p_emotion_mentioned: emotion ?? undefined,
        p_comment: comment.trim() || undefined,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family-data'] })
      onDone()
    },
  })

  const pill = (active: boolean) => `rounded-full border-2 px-3 py-2 text-sm font-bold ${active ? 'border-azul bg-azul-suave text-azul' : 'border-linea bg-white'}`
  const err = save.error as PostgrestError | null

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-linea p-3">
      <p className="text-xs font-extrabold uppercase tracking-wider text-tinta/60">{t('families.paperSheet')}</p>
      <div>
        <p className="mb-1 text-sm font-bold">{t('sheet.q1')}</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DONE) as Done[]).map((d) => <button key={d} type="button" onClick={() => setDone(d)} className={pill(done === d)}>{t(`sheet.${d}`)}</button>)}
        </div>
      </div>
      <div>
        <p className="mb-1 text-sm font-bold">{t('families.whichEmotion')}</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EMOTIONS) as Emotion[]).map((e) => (
            <button key={e} type="button" onClick={() => setEmotion(emotion === e ? null : e)} aria-pressed={emotion === e}
              className={`flex items-center gap-1 ${pill(emotion === e)}`}>
              <EmotionDrop emotion={e} size={16} /> {EMOTIONS[e].label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-tinta/50">{t('families.emotionOptional')}</p>
      </div>
      <div>
        <p className="mb-1 text-sm font-bold">{t('sheet.q3')}</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(HOW) as How[]).map((h) => <button key={h} type="button" onClick={() => setHow(h)} className={pill(how === h)}>{HOW[h]}</button>)}
        </div>
      </div>
      <div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={280} rows={2}
          placeholder={t('families.commentPlaceholder')}
          className="w-full rounded-2xl border-2 border-linea px-3 py-2 text-sm outline-none focus:border-azul" />
        <p className="text-right text-xs text-tinta/50">{comment.length}/280</p>
      </div>
      {err && (
        <p role="alert" className="rounded-2xl bg-rosa-suave px-3 py-2 text-sm font-bold text-rosa-profundo">
          {SAVE_ERROR[err.message] ?? (err.code === '42501' ? t('families.errors.permission') : t('families.errors.generic'))}
        </p>
      )}
      <div className="flex gap-2">
        <button onClick={() => save.mutate()} disabled={!done || !how || save.isPending}
          className="flex-1 rounded-full bg-azul py-2.5 font-bold text-white disabled:opacity-50">
          {save.isPending ? t('common.saving') : t('families.saveSheet')}
        </button>
        <button onClick={onDone} className="flex-1 rounded-full border-2 border-linea py-2.5 font-bold">{t('common.cancel')}</button>
      </div>
    </div>
  )
}