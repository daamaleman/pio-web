import { Card } from '@/components/ui/Card'
import { EmotionDrop } from '@/components/EmotionDrop'
import { EMOTIONS } from '@/lib/emotions'
import type { Climate } from '@/features/teacher/api'

export function ClimateCard({ climate, title, aside }: { climate: Climate; title: string; aside?: string }) {
  return (
    <Card title={title} aside={aside}>
      {climate.hidden ? (
        <p className="text-sm text-tinta/70">
          Se muestra cuando al menos {climate.min_respondents} estudiantes hagan su check-in en la semana. Así nadie queda identificado.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-1">
            {climate.distribution.map((d) => (
              <div key={d.emotion} className="flex flex-col items-center gap-1">
                <EmotionDrop emotion={d.emotion} size={34} />
                <span className="text-sm font-extrabold">{d.pct}%</span>
                <span className="text-[11px] text-tinta/60">{EMOTIONS[d.emotion].label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-tinta/60">
            {climate.checkins} check-ins{climate.declined > 0 && ` · ${climate.declined} prefirieron no decirlo`} · sin nombres
          </p>
        </>
      )}
    </Card>
  )
}

// Compact version for a table row: one colored bar
export function ClimateBar({ climate }: { climate: Climate }) {
  if (climate.hidden) return <span className="text-xs text-tinta/50">Menos de 3 respuestas</span>
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-linea" role="img"
      aria-label={climate.distribution.map((d) => `${EMOTIONS[d.emotion].label} ${d.pct}%`).join(', ')}>
      {climate.distribution.filter((d) => d.pct > 0).map((d) => (
        <span key={d.emotion} style={{ width: `${d.pct}%`, background: EMOTIONS[d.emotion].color }} title={`${EMOTIONS[d.emotion].label} ${d.pct}%`} />
      ))}
    </div>
  )
}