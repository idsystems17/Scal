import { SkeletonHeader, SkeletonStatRow, SkeletonListCard, SkeletonTable } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonHeader />
      <SkeletonStatRow count={3} />
      <SkeletonListCard rows={3} titleWidth={170} />
      <SkeletonTable rows={6} cols={5} titleWidth={140} />
    </div>
  )
}
