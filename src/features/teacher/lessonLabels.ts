import type { Json } from '@/lib/database.types'
import { pickText } from '@/lib/format'

export const STEP_KIND: Record<string, string> = {
  story: 'Cuento',
  concept: 'Aprendo',
  worked_example: 'Ejemplo resuelto',
  minigame: 'Mini-juego',
  quiz: 'Mini-quiz',
  poll: 'Encuesta anónima',
  application: 'Lo uso en mi vida',
  card: 'Mi tarjeta',
  home: 'Reto en casa',
  calm: 'Calma',
}

export const PARTS: Record<string, string[]> = {
  primary: ['Aprendo', 'Practico', 'Lo uso'],
  secondary: ['Entender', 'Ejemplos', 'Practicar', 'Aplicar'],
}

const TEMPLATE: Record<string, string> = {
  catch: 'Atrapar',
  drag_to_zones: 'Arrastrar a zonas',
  classify: 'Clasificar',
  sequence: 'Secuenciar',
  breathing: 'Respiración guiada',
  branching_story: 'Historia ramificada',
  cooperative: 'Cooperativo',
  builder: 'Constructor',
  true_or_myth: 'Verdadero o mito',
  trivia: 'Trivia',
  compare_images: 'Comparar imágenes',
  journal: 'Diario',
}

export function templateLabel(t: string | null): string {
  if (!t) return ''
  return TEMPLATE[t] ?? t.replace(/_/g, ' ')
}

export function jsonToBlocks(value: Json | null | undefined, lang = 'es'): { kind: 'p' | 'li'; text: string }[] {
  if (value == null) return []
  if (typeof value === 'string') return [{ kind: 'p', text: value }]
  if (Array.isArray(value)) return value.map((v) => ({ kind: 'li' as const, text: typeof v === 'string' ? v : pickText(v as Json, lang) }))
  if (typeof value === 'object') {
    const obj = value as Record<string, Json>
    if (lang in obj || 'es' in obj) return jsonToBlocks(obj[lang] ?? obj.es, lang)
    return Object.entries(obj).map(([k, v]) => ({ kind: 'li' as const, text: `${k}: ${typeof v === 'string' ? v : pickText(v, lang)}` }))
  }
  return [{ kind: 'p', text: String(value) }]
}
