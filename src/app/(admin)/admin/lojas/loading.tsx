import { SkeletonHeader, SkeletonTable } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonHeader />
      <SkeletonTable rows={6} cols={7} titleWidth={150} />
    </div>
  )
}
