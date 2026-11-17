import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { BookOpen, MapPin, Pencil, Plus, School, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorCard } from '@/components/ui/Card'
import { useAllSchools } from './api'

export default function AdminHome() {
  const { t } = useTranslation()
  const schools = useAllSchools()
  const list = schools.data ?? []
  const active = list.filter((s) => s.active)

  return (
    <div className="pb-10">
      <div className="flex items-end justify-between gap-3 pr-5 lg:pr-10">
        <PageHeader title={t('role.admin')} subtitle={t('admin.subtitle')} />
        <Link to="/admin/escuelas/nueva" className="mb-2 flex shrink-0 items-center gap-2 rounded-full bg-azul px-4 py-2.5 font-bold text-white">
          <Plus size={18} /> <span className="hidden sm:inline">{t('admin.newSchool')}</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 px-5 lg:px-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Total value={active.length} label={t('admin.activeSchools')} />
          <Total value={list.reduce((n, s) => n + s.groups, 0)} label={t('school.groups')} />
          <Total value={list.reduce((n, s) => n + s.staff, 0)} label={t('admin.staffPeople')} />
          <Link to="/admin/catalogo" className="flex flex-col items-center justify-center rounded-card border border-linea bg-white px-3 py-4 text-center hover:bg-azul-suave">
            <BookOpen size={22} className="text-azul" />
            <span className="mt-1 text-xs font-semibold text-tinta/60">{t('admin.catalog')}</span>
          </Link>
        </div>

        {schools.isLoading && <div className="h-40 animate-pulse rounded-card bg-linea" />}
        {schools.error && <ErrorCard message={t('admin.loadError')} onRetry={() => schools.refetch()} />}

        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((s) => (
            <li key={s.id} className={`rounded-card border bg-white p-5 ${s.active ? 'border-linea' : 'border-dashed border-linea opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold"><School size={18} className="text-azul" /> {s.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-tinta/60">
                    <MapPin size={14} /> {s.municipality}, {s.department}{s.region ? ` · ${s.region}` : ''}
                  </p>
                </div>
                {!s.active && <span className="rounded-full bg-arena px-3 py-1 text-xs font-bold text-tinta/60">{t('staff.inactive')}</span>}
              </div>
              <p className="mt-3 text-sm"><b>{s.groups}</b> {t('school.groups')} · <b>{s.staff}</b> {t('admin.ofStaff')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/admin/escuelas/${s.id}`} className="rounded-full bg-azul px-4 py-2 text-sm font-bold text-white">{t('admin.seePanel')}</Link>
                <Link to={`/admin/escuelas/${s.id}/personal`} className="flex items-center gap-1.5 rounded-full border-2 border-linea px-4 py-2 text-sm font-bold">
                  <Users size={16} /> {t('nav.staff')}
                </Link>
                <Link to={`/admin/escuelas/${s.id}/editar`} aria-label={t('groups.editAria', { group: s.name })} className="rounded-full border-2 border-linea p-2 text-tinta/70">
                  <Pencil size={16} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Total({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-card border border-linea bg-white px-3 py-4 text-center">
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold text-tinta/60">{label}</p>
    </div>
  )
}
