import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'

// ---- Shapes returned by the RPCs ----
type Hidden = { hidden: true; reason: string; min_respondents: number; respondents?: number; total?: number }

export type SAPart =
  | Hidden
  | {
      hidden: false
      respondents: number
      items: { code: string; statement: Json; average: number; distribution: Record<'1' | '2' | '3', number> }[]
    }

export type SASummary = { month: string; start: SAPart; end: SAPart }

export type PollResult =
  | Hidden
  | { hidden: false; total: number; options: { option_id: string; count: number; pct: number }[] }

export type PollContent = { question?: string; options?: { id: string; text: string }[]; anonymity_note?: string }

// ---- Queries ----
export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: ['group', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, level, grade, section, language')
        .eq('id', groupId!)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useSelfAssessment(groupId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['self-assessment', groupId, month],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('self_assessment_summary', { p_group_id: groupId!, p_month: month })
      if (error) throw error
      return data as unknown as SASummary
    },
  })
}

// Assigned lessons of the group that have a poll step
export function usePollLessons(groupId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['poll-lessons', groupId],
    enabled: !!groupId && enabled,
    queryFn: async () => {
      const [steps, assignments] = await Promise.all([
        supabase.from('lesson_steps').select('lesson_id').eq('kind', 'poll'),
        supabase.from('assignments').select('lesson_id, lessons(id, slug, week, title)').eq('group_id', groupId!),
      ])
      if (steps.error) throw steps.error
      if (assignments.error) throw assignments.error
      const withPoll = new Set(steps.data.map((s) => s.lesson_id))
      return assignments.data
        .filter((a) => withPoll.has(a.lesson_id) && a.lessons)
        .map((a) => a.lessons!)
        .sort((a, b) => b.week - a.week)
    },
  })
}

export function usePollResult(slug: string, groupId: string) {
  return useQuery({
    queryKey: ['poll-result', slug, groupId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('poll_results', { p_lesson_slug: slug, p_group_id: groupId })
      if (error) throw error
      return data as unknown as PollResult
    },
  })
}

// Question and option texts from the lesson content (latest version in the group's language)
export function usePollContent(lessonId: string, language: string) {
  return useQuery({
    queryKey: ['poll-content', lessonId, language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_contents')
        .select('payload, version')
        .eq('lesson_id', lessonId)
        .eq('language', language as never)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      const steps = (data?.payload as { steps?: { kind: string }[] } | null)?.steps ?? []
      return (steps.find((s) => s.kind === 'poll') as PollContent | undefined) ?? null
    },
  })
}