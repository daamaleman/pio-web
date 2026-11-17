import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAllSchools() {
  return useQuery({
    queryKey: ['admin-schools'],
    queryFn: async () => {
      const [schools, groups, staff] = await Promise.all([
        supabase.from('schools').select('id, name, department, municipality, region, active').order('name'),
        supabase.from('groups').select('school_id'),
        supabase.from('staff_schools').select('school_id'),
      ])
      if (schools.error) throw schools.error
      if (groups.error) throw groups.error
      if (staff.error) throw staff.error
      const count = (rows: { school_id: string }[], id: string) => rows.filter((r) => r.school_id === id).length
      return schools.data.map((s) => ({ ...s, groups: count(groups.data, s.id), staff: count(staff.data, s.id) }))
    },
  })
}

export function useCatalog() {
  return useQuery({
    queryKey: ['admin-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, slug, level, grade, week, title, emotion, status, parts_count, version, is_month_closure, lesson_steps(count), lesson_contents(language, version)')
        .order('level')
        .order('grade')
        .order('week')
      if (error) throw error
      return data
    },
  })
}

export const DEPARTMENTS = [
  'Boaco', 'Carazo', 'Chinandega', 'Chontales', 'Estelí', 'Granada', 'Jinotega', 'León', 'Madriz',
  'Managua', 'Masaya', 'Matagalpa', 'Nueva Segovia', 'Río San Juan', 'Rivas',
  'Región Autónoma de la Costa Caribe Norte', 'Región Autónoma de la Costa Caribe Sur',
]
