import { SkeletonHeader, SkeletonListCard } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonHeader />
      <SkeletonListCard rows={5} titleWidth={150} />
    </div>
  )
}
