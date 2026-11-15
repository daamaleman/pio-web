import { EMOTIONS, type Emotion } from '@/lib/emotions'

const INK = '#1D2A5C'

function Face({ emotion }: { emotion: Emotion }) {
  const eyes = <><circle cx="9" cy="17" r="1.3" fill={INK} /><circle cx="15" cy="17" r="1.3" fill={INK} /></>
  const stroke = { stroke: INK, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' as const }
  switch (emotion) {
    case 'joy':
      return <>{eyes}<path d="M9 20.5 Q12 23.5 15 20.5" {...stroke} /></>
    case 'sadness':
      return <>{eyes}<path d="M9.5 22.5 Q12 20 14.5 22.5" {...stroke} /></>
    case 'anger':
      return <>{eyes}<path d="M7.5 14.5 L10.5 15.5 M16.5 14.5 L13.5 15.5" {...stroke} /><path d="M9.5 22 L14.5 22" {...stroke} /></>
    case 'fear':
      return <>{eyes}<ellipse cx="12" cy="21.8" rx="1.6" ry="1.9" {...stroke} /></>
    case 'calm':
      return <><path d="M7.8 17 Q9 18.2 10.2 17 M13.8 17 Q15 18.2 16.2 17" {...stroke} /><path d="M9.5 20.8 Q12 22.8 14.5 20.8" {...stroke} /></>
    case 'love':
      return <>{eyes}<path d="M9 20.5 Q12 23.5 15 20.5" {...stroke} /><circle cx="7" cy="19.5" r="1.2" fill="#FF5C93" opacity=".6" /><circle cx="17" cy="19.5" r="1.2" fill="#FF5C93" opacity=".6" /></>
  }
}

export function EmotionDrop({ emotion, size = 36 }: { emotion: Emotion; size?: number }) {
  return (
    <svg width={size} height={size * (28 / 24)} viewBox="0 0 24 28" role="img" aria-label={EMOTIONS[emotion].label}>
      <path d="M12 1.5C12 1.5 3 11.8 3 18.2a9 9 0 0 0 18 0C21 11.8 12 1.5 12 1.5Z" fill={EMOTIONS[emotion].color} />
      <Face emotion={emotion} />
    </svg>
  )
}