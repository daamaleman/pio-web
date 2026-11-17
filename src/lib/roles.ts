import type { Database } from './database.types'
import { t } from '@/i18n'

export type AppRole = Database['public']['Enums']['app_role']
export type StaffRole = Exclude<AppRole, 'student'>

export const STAFF_ROLES: StaffRole[] = ['teacher', 'director', 'counselor', 'admin']

export function isStaff(role: unknown): role is StaffRole {
  return typeof role === 'string' && (STAFF_ROLES as string[]).includes(role)
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  get teacher() { return t('role.teacher') },
  get director() { return t('role.director') },
  get counselor() { return t('role.counselor') },
  get admin() { return t('role.admin') },
}

export function homeFor(role: StaffRole): string {
  if (role === 'teacher') return '/docente'
  if (role === 'admin') return '/admin'
  return '/escuela' // director and counselor
}