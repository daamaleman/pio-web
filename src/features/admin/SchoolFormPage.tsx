import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { PostgrestError } from '@supabase/supabase-js'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ErrorCard } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { DEPARTMENTS, useAllSchools } from './api'
import { usePageTitle } from '@/lib/usePageTitle'

export default function SchoolFormPage() {
  const { t } = useTranslation()
  const { schoolId } = useParams()
  usePageTitle(schoolId ? t('admin.editSchool') : t('admin.newSchool'))
  const editing = !!schoolId
  const navigate = useNavigate()
  const qc = useQueryClient()
  const schools = useAllSchools()
  const current = schools.data?.find((s) => s.id === schoolId)

  const [name, setName] = useState<string | null>(null)
  const [department, setDepartment] = useState<string | null>(null)
  const [municipality, setMunicipality] = useState<string | null>(null)
  const [region, setRegion] = useState<string | null>(null)
  const [active, setActive] = useState<boolean | null>(null)

  const v = {
    name: name ?? current?.name ?? '',
    department: department ?? current?.department ?? 'Managua',
    municipality: municipality ?? current?.municipality ?? '',
    region: region ?? current?.region ?? '',
    active: active ?? current?.active ?? true,
  }

  const save = useMutation({
    mutationFn: async () => {
      const row = {
        name: v.name.trim(),
        department: v.department,
        municipality: v.municipality.trim(),
        region: v.region.trim() || null,
        active: v.active,
      }
      const { error } = editing
        ? await supabase.from('schools').update(row).eq('id', schoolId!)
        : await supabase.from('schools').insert(row)
      if (error) throw error
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin-schools'] })
      navigate('/admin')
    },
  })

  if (editing && schools.isLoading) return <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
  if (editing && !current) return <div className="p-5 lg:p-10"><ErrorCard message={t('admin.notFound')} /></div>

  const input = 'mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 font-semibold outline-none focus:border-azul'
  const err = save.error as PostgrestError | null

  return (
    <div className="mx-auto max-w-xl px-5 pb-10 pt-4 lg:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/admin" aria-label={t('common.back')} className="rounded-full p-2 hover:bg-white"><ArrowLeft size={22} /></Link>
        <h1 className="text-2xl font-extrabold">{editing ? t('admin.editSchool') : t('admin.newSchool')}</h1>
      </div>

      <form onSubmit={(e: FormEvent) => { e.preventDefault(); save.mutate() }} className="flex flex-col gap-4 rounded-card border border-linea bg-white p-5">
        <label className="text-sm font-bold">{t('admin.name')}
          <input required minLength={3} maxLength={120} value={v.name} onChange={(e) => setName(e.target.value)} className={input} placeholder={t('admin.namePlaceholder')} />
        </label>
        <label className="text-sm font-bold">{t('admin.department')}
          <select value={v.department} onChange={(e) => setDepartment(e.target.value)} className={input}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">{t('admin.municipality')}
          <input required minLength={2} maxLength={80} value={v.municipality} onChange={(e) => setMunicipality(e.target.value)} className={input} />
        </label>
        <label className="text-sm font-bold">{t('admin.region')}
          <input maxLength={80} value={v.region} onChange={(e) => setRegion(e.target.value)} className={input} />
        </label>
        {editing && (
          <div className="rounded-2xl border border-linea px-4 py-1">
            <Toggle label={t('admin.active')} hint={t('admin.activeHint')} checked={v.active} onChange={setActive} />
          </div>
        )}
        {err && (
          <p role="alert" className="rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">
            {err.code === '42501' ? t('admin.onlyAdmin') : t('admin.saveError')}
          </p>
        )}
        <button type="submit" disabled={save.isPending} className="rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-60">
          {save.isPending ? t('common.saving') : editing ? t('common.saveChanges') : t('admin.create')}
        </button>
      </form>
    </div>
  )
}
