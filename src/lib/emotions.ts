import { t } from '@/i18n'

export const EMOTIONS = {
  joy: { color: '#FFC20E', get label() { return t('emotion.joy') } },
  sadness: { color: '#8FD6F2', get label() { return t('emotion.sadness') } },
  anger: { color: '#FF8A80', get label() { return t('emotion.anger') } },
  fear: { color: '#C9A3D1', get label() { return t('emotion.fear') } },
  calm: { color: '#B8DC8E', get label() { return t('emotion.calm') } },
  love: { color: '#FF9EBF', get label() { return t('emotion.love') } },
} as const

export type Emotion = keyof typeof EMOTIONS