import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/auth-context'
import type { Climate } from '@/features/teacher/api'

export type SchoolOverview = {
  school: { id: string; name: string }
  totals: { groups: number; teachers: number; students: number; badges_earned: number; active_alerts: number }
  climate: Climate
  groups: {
    id: string
    level: string
    grade: number
    section: string
    teacher_name: string | null
    students: number
    badges_earned: number
    alerts: { open: number; in_attention: number }
    climate: Climate
    current_assignment: null | {
      assignment_id: string
      lesson_slug: string
      week: number
      due_date: string
      targeted: number
      completed: number
      completed_pct: number
    }
  }[]
}

export function useMySchools() {
  const { session } = useAuth()
  const uid = session?.user.id
  return useQuery({
    queryKey: ['my-schools', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('staff_schools').select('school_id').eq('profile_id', uid!)
      if (error) throw error
      return data
    },
  })
}

export function useSchoolOverview(schoolId: string | undefined, weekStart: string) {
  return useQuery({
    queryKey: ['school-overview', schoolId, weekStart],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('school_overview', { p_school_id: schoolId!, p_week_start: weekStart })
      if (error) throw error
      return data as unknown as SchoolOverview
    },
  })
}