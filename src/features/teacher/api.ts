import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/auth-context'
import type { Json } from '@/lib/database.types'
import type { Emotion } from '@/lib/emotions'

// ---- Response shapes of the RPCs (they come back as Json) ----
export type Climate =
  | { week_start: string; hidden: true; reason: string; min_respondents: number }
  | {
      week_start: string
      hidden: false
      checkins: number
      declined: number
      distribution: { emotion: Emotion; count: number; pct: number }[]
    }

export type OverviewAssignment = {
  assignment_id: string
  lesson_slug: string
  title: Json
  week: number
  due_date: string
  targets_all: boolean
  targeted: number
  completed: number
}

export type GroupOverview = {
  group: {
    id: string
    level: string
    grade: number
    section: string
    class_code: string
    class_weekday: number
    ai_chat_enabled: boolean
    school_name: string
  }
  students: number
  badges_earned: number
  climate: Climate
  assignments: OverviewAssignment[]
}

// ---- Queries ----
export function useMyGroups() {
  const { session } = useAuth()
  const uid = session?.user.id
  return useQuery({
    queryKey: ['my-groups', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, level, grade, section, class_code')
        .eq('teacher_id', uid!)
        .order('grade')
        .order('section')
      if (error) throw error
      return data
    },
  })
}

export function useGroupOverview(groupId: string | undefined) {
  return useQuery({
    queryKey: ['group-overview', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('group_overview', { p_group_id: groupId! })
      if (error) throw error
      return data as unknown as GroupOverview
    },
  })
}

export function useGroupAlerts(groupId: string | undefined) {
  return useQuery({
    queryKey: ['group-alerts', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('id, student_id, reason_code, status')
        .eq('group_id', groupId!)
        .in('status', ['open', 'in_attention'])
      if (error) throw error
      return data
    },
  })
}