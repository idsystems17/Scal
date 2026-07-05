import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export function useSort<T, K extends keyof T>(items: T[], defaultKey: K | null = null) {
  const [sortKey, setSortKey] = useState<K | null>(defaultKey)
  const [direction, setDirection] = useState<SortDirection>('asc')

  function toggleSort(key: K) {
    if (sortKey === key) {
      setDirection(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDirection('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return items
    return [...items].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      let cmp: number
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv), 'pt-BR')
      return direction === 'asc' ? cmp : -cmp
    })
  }, [items, sortKey, direction])

  return { sorted, sortKey, direction, toggleSort }
}
