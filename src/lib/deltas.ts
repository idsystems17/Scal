export interface Delta {
  label: string
  positive: boolean
}

export function calcDelta(atual: number, anterior: number, higherIsBetter = true): Delta {
  if (anterior === 0) {
    if (atual === 0) return { label: '—', positive: true }
    return { label: 'novo', positive: higherIsBetter }
  }
  const pct = ((atual - anterior) / anterior) * 100
  const sign = pct > 0 ? '+' : ''
  return {
    label: `${sign}${pct.toFixed(1).replace('.', ',')}%`,
    positive: higherIsBetter ? pct >= 0 : pct <= 0,
  }
}

export function periodWindows(days: number) {
  const now = new Date()
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const sincePrevious = new Date(since.getTime() - days * 24 * 60 * 60 * 1000)
  return {
    now: now.toISOString(),
    since: since.toISOString(),
    sincePrevious: sincePrevious.toISOString(),
  }
}
