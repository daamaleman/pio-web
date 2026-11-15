export const EMOTIONS = {
  joy: { label: 'Alegría', color: '#FFC20E' },
  sadness: { label: 'Tristeza', color: '#8FD6F2' },
  anger: { label: 'Enojo', color: '#FF8A80' },
  fear: { label: 'Miedo', color: '#C9A3D1' },
  calm: { label: 'Calma', color: '#B8DC8E' },
  love: { label: 'Cariño', color: '#FF9EBF' },
} as const

export type Emotion = keyof typeof EMOTIONS