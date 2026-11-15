import type { Database } from './database.types'

export type AppRole = Database['public']['Enums']['app_role']
export type StaffRole = Exclude<AppRole, 'student'>

export const STAFF_ROLES: StaffRole[] = ['teacher', 'director', 'counselor', 'admin']

export function isStaff(role: unknown): role is StaffRole {
  return typeof role === 'string' && (STAFF_ROLES as string[]).includes(role)
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  teacher: 'Docente',
  director: 'Dirección',
  counselor: 'Orientación',
  admin: 'Administración',
}

export function homeFor(role: StaffRole): string {
  if (role === 'teacher') return '/docente'
  if (role === 'admin') return '/admin'
  return '/escuela' // director and counselor
}