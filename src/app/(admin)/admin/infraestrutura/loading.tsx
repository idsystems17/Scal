import { SkeletonHeader, SkeletonStatRow, SkeletonChart, SkeletonListCard } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonHeader />
      <SkeletonStatRow count={4} />
      <SkeletonChart height={240} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        <SkeletonListCard rows={2} titleWidth={120} />
        <SkeletonListCard rows={5} titleWidth={180} />
      </div>
      <SkeletonListCard rows={6} titleWidth={160} />
    </div>
  )
}
