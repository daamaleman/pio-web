import type { Json } from '@/lib/database.types'
import { t, tLabels } from '@/i18n'

type Details = Record<string, unknown>

const CHAT_CATEGORY = tLabels('alerts.chatCategory', ['self_harm', 'abuse', 'violence', 'other'] as const) as Record<string, string>

export const OBS_CATEGORY = tLabels('alerts.obsCategory', ['emotional', 'social', 'participation', 'learning', 'family', 'other'] as const) as Record<string, string>

export const LEVEL = {
  support: { get label() { return t('alerts.level.support') }, cls: 'bg-azul-suave text-azul' },
  risk_moderate: { get label() { return t('alerts.level.risk_moderate') }, cls: 'bg-[#FFF3D1] text-[#7A5600]' },
  risk_high: { get label() { return t('alerts.level.risk_high') }, cls: 'bg-rosa-profundo text-white' },
} as const

export const STATUS = {
  open: { get label() { return t('alerts.status.open') }, cls: 'bg-rosa-suave text-rosa-profundo' },
  in_attention: { get label() { return t('alerts.status.in_attention') }, cls: 'bg-[#E6F4DC] text-[#2E6B12]' },
  closed: { get label() { return t('alerts.status.closed') }, cls: 'bg-arena text-tinta/60' },
} as const

// What happened, in plain words. Never a diagnosis, never the content.
export function reasonText(reason: string, detailsJson: Json): { title: string; detail: string; advice: string } {
  const d = (detailsJson ?? {}) as Details
  switch (reason) {
    case 'difficult_emotions_streak':
      return {
        title: t('alerts.reason.streak.title'),
        detail: t('alerts.reason.streak.detail', { days: d.difficult_days ?? 3, window: d.window_days ?? 7 }),
        advice: t('alerts.reason.streak.advice'),
      }
    case 'help_request':
      return {
        title: d.wants === 'counselor' ? t('alerts.reason.help.titleCounselor') : t('alerts.reason.help.titleTeacher'),
        detail: t('alerts.reason.help.detail'),
        advice: t('alerts.reason.help.advice'),
      }
    case 'chat_risk':
      return {
        title: CHAT_CATEGORY[String(d.category)] ?? t('alerts.reason.chat.title'),
        detail: t('alerts.reason.chat.detail'),
        advice: t('alerts.reason.chat.advice'),
      }
    case 'teacher_referral':
      return {
        title: t('alerts.reason.referral.title'),
        detail: t('alerts.reason.referral.detail', { category: OBS_CATEGORY[String(d.category)] ?? t('alerts.reason.referral.noCategory') }),
        advice: t('alerts.reason.referral.advice'),
      }
    default:
      return { title: t('alerts.reason.default.title'), detail: '', advice: t('alerts.reason.default.advice') }
  }
}
