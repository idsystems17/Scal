import { SkeletonStatRow, SkeletonChart, SkeletonListCard, SkeletonTable, SkeletonBlock, SkeletonCard } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonCard padding={16}>
        <SkeletonBlock width={260} height={13} />
      </SkeletonCard>
      <SkeletonStatRow count={4} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16, alignItems: 'start' }}>
        <SkeletonListCard rows={4} titleWidth={140} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonChart height={160} />
          <SkeletonListCard rows={3} titleWidth={140} />
        </div>
      </div>
      <SkeletonTable rows={5} cols={6} titleWidth={180} />
    </div>
  )
}
