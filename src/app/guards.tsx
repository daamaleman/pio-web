import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './auth-context'
import { homeFor, isStaff, type StaffRole } from '@/lib/roles'
import { useTranslation } from 'react-i18next'

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <img src="/pio-mascota.png" alt="" className="h-20 w-20 animate-pulse" />
    </div>
  )
}

export function RequireAuth() {
  const { loading, session } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function RequireRole({ roles }: { roles: StaffRole[] }) {
  const { role } = useAuth()
  if (!isStaff(role) || !roles.includes(role)) return <Navigate to="/" replace />
  return <Outlet />
}

export function HomeRedirect() {
  const { t } = useTranslation()
  const { role, signOut } = useAuth()
  if (isStaff(role)) return <Navigate to={homeFor(role)} replace />
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <img src="/pio-mascota.png" alt="" className="h-24 w-24" />
      <h1 className="text-2xl font-bold">{t('noAccess.title')}</h1>
      <p className="max-w-sm">{t('noAccess.text')}</p>
      <button onClick={signOut} className="rounded-full bg-azul px-6 py-3 font-display font-bold text-white">
        {t('common.exit')}
      </button>
    </div>
  )
}