import { SkeletonHeader, SkeletonStatRow, SkeletonChart, SkeletonListCard, SkeletonTable } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonHeader />
      <SkeletonStatRow count={4} />
      <SkeletonChart height={240} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SkeletonChart height={140} />
        <SkeletonListCard rows={4} titleWidth={150} />
      </div>
      <SkeletonTable rows={5} cols={4} titleWidth={170} />
    </div>
  )
}
