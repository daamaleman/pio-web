import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const COLUMNS =
  'id, student_id, group_id, origin, level, status, reason_code, details, opened_at, closed_at, attended_by, students(display_name), groups(level, grade, section)'

async function fetchAlerts(tab: 'active' | 'closed') {
  if (tab === 'active') {
    const { data, error } = await supabase
      .from('alerts')
      .select(COLUMNS)
      .in('status', ['open', 'in_attention'])
      .order('opened_at', { ascending: false })
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('alerts')
    .select(COLUMNS)
    .eq('status', 'closed')
    .order('closed_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export type AlertRow = Awaited<ReturnType<typeof fetchAlerts>>[number]

export function useAlerts(tab: 'active' | 'closed') {
  return useQuery({ queryKey: ['alerts', tab], queryFn: () => fetchAlerts(tab) })
}

export function useSetAlertStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'in_attention' | 'closed' }) => {
      const { data, error } = await supabase.from('alerts').update({ status }).eq('id', id).select('id')
      if (error) throw error
      if (!data?.length) throw new Error('NOT_UPDATED') // RLS hid the row: no permission
      return data[0]
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['group-alerts'] }) // panel badge and notice
    },
  })
}