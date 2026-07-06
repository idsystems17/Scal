export function SkeletonBlock({ width = '100%', height = 16, radius = 6 }: { width?: number | string; height?: number; radius?: number }) {
  return <div className="skeleton-pulse" style={{ width, height, borderRadius: radius, background: '#e6ecf5' }} />
}

export function SkeletonCard({ children, padding = 24 }: { children: React.ReactNode; padding?: number }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  )
}

export function SkeletonHeader() {
  return (
    <div>
      <SkeletonBlock width={220} height={22} />
      <div style={{ marginTop: 8 }}><SkeletonBlock width={320} height={13} /></div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <SkeletonCard padding={20}>
      <SkeletonBlock width={100} height={11} />
      <div style={{ marginTop: 10 }}><SkeletonBlock width={80} height={26} /></div>
      <div style={{ marginTop: 8 }}><SkeletonBlock width={130} height={11} /></div>
    </SkeletonCard>
  )
}

export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonStatCard key={i} />)}
    </div>
  )
}

export function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <SkeletonCard>
      <SkeletonBlock width={200} height={15} />
      <div style={{ marginTop: 8 }}><SkeletonBlock width={260} height={11} /></div>
      <div style={{ marginTop: 20 }}><SkeletonBlock height={height} radius={10} /></div>
    </SkeletonCard>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, titleWidth = 160 }: { rows?: number; cols?: number; titleWidth?: number }) {
  return (
    <SkeletonCard>
      <SkeletonBlock width={titleWidth} height={15} />
      <div style={{ marginTop: 8, marginBottom: 12 }}><SkeletonBlock width={titleWidth + 80} height={11} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16 }}>
            {Array.from({ length: cols }).map((_, j) => <SkeletonBlock key={j} height={14} />)}
          </div>
        ))}
      </div>
    </SkeletonCard>
  )
}

export function SkeletonListCard({ rows = 4, titleWidth = 160 }: { rows?: number; titleWidth?: number }) {
  return (
    <SkeletonCard>
      <SkeletonBlock width={titleWidth} height={15} />
      <div style={{ marginTop: 8, marginBottom: 16 }}><SkeletonBlock width={titleWidth + 60} height={11} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBlock key={i} height={44} radius={10} />
        ))}
      </div>
    </SkeletonCard>
  )
}
