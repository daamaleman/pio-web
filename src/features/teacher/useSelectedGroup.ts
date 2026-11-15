import { useState } from 'react'

const KEY = 'pio.teacher.groupId'

// Remembers the last group the teacher chose (per browser).
export function useSelectedGroup<T extends { id: string }>(groups: T[] | undefined) {
  const [id, setId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  })

  const select = (next: string) => {
    setId(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage not available: keep it in memory only */
    }
  }

  const group = groups?.find((g) => g.id === id) ?? groups?.[0]
  return [group, select] as const
}