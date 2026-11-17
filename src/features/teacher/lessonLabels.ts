import type { Json } from '@/lib/database.types'
import { pickText } from '@/lib/format'
import { contentLang, t, tLabels } from '@/i18n'

export const STEP_KIND = tLabels('lesson.stepKind', ['story', 'concept', 'worked_example', 'minigame', 'quiz', 'poll', 'application', 'card', 'home', 'calm'] as const) as Record<string, string>

export const PARTS: Record<string, string[]> = {
  get primary() { return [t('lesson.parts.learn'), t('lesson.parts.practice'), t('lesson.parts.use')] },
  get secondary() { return [t('lesson.parts.understand'), t('lesson.parts.examples'), t('lesson.parts.practiceSec'), t('lesson.parts.apply')] },
}

const TEMPLATE = tLabels('lesson.template', ['catch', 'drag_to_zones', 'classify', 'sequence', 'breathing', 'branching_story', 'cooperative', 'builder', 'true_or_myth', 'trivia', 'compare_images', 'journal'] as const) as Record<string, string>

export function templateLabel(tpl: string | null): string {
  if (!tpl) return ''
  return TEMPLATE[tpl] ?? tpl.replace(/_/g, ' ')
}

export function jsonToBlocks(value: Json | null | undefined, lang = contentLang()): { kind: 'p' | 'li'; text: string }[] {
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
