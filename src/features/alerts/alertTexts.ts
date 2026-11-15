import type { Json } from '@/lib/database.types'

type Details = Record<string, unknown>

const CHAT_CATEGORY: Record<string, string> = {
  self_harm: 'Posible autolesión',
  abuse: 'Posible abuso o maltrato',
  violence: 'Posible violencia',
  other: 'Otra situación de riesgo',
}

export const LEVEL = {
  support: { label: 'Apoyo', cls: 'bg-azul-suave text-azul' },
  risk_moderate: { label: 'Riesgo moderado', cls: 'bg-[#FFF3D1] text-[#7A5600]' },
  risk_high: { label: 'Riesgo alto', cls: 'bg-rosa-profundo text-white' },
} as const

export const STATUS = {
  open: { label: 'Nueva', cls: 'bg-rosa-suave text-rosa-profundo' },
  in_attention: { label: 'En atención', cls: 'bg-[#E6F4DC] text-[#2E6B12]' },
  closed: { label: 'Cerrada', cls: 'bg-arena text-tinta/60' },
} as const

// What happened, in plain words. Never a diagnosis, never the content.
export function reasonText(reason: string, detailsJson: Json): { title: string; detail: string; advice: string } {
  const d = (detailsJson ?? {}) as Details
  switch (reason) {
    case 'difficult_emotions_streak':
      return {
        title: 'Podría necesitar apoyo',
        detail: `Marcó emociones difíciles ${d.difficult_days ?? 3} de los últimos ${d.window_days ?? 7} días.`,
        advice: 'Buscá un momento a solas para preguntarle cómo está. Escuchá sin juzgar; no hace falta resolver nada en ese momento.',
      }
    case 'help_request':
      return {
        title: d.wants === 'counselor' ? 'Pidió hablar con orientación' : 'Pidió hablar con su profe',
        detail: 'Tocó «Quiero hablar con alguien» en la app.',
        advice: 'Respondé hoy si podés, aunque sea para acordar un momento. Que sepa que su pedido llegó.',
      }
    case 'chat_risk':
      return {
        title: CHAT_CATEGORY[String(d.category)] ?? 'Situación de riesgo',
        detail: 'Detectado en el chat «Pío te escucha». La conversación no se muestra a nadie.',
        advice: 'Seguí el protocolo de orientación: hablar hoy con el estudiante y contactar a la familia según el protocolo UNICEF/MINED.',
      }
    default:
      return { title: 'Alerta de apoyo', detail: '', advice: 'Conversá con el estudiante.' }
  }
}