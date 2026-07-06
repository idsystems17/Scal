import { SkeletonHeader, SkeletonCard, SkeletonBlock, SkeletonListCard } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonHeader />
      <SkeletonCard>
        <SkeletonBlock width={160} height={15} />
        <div style={{ marginTop: 8 }}><SkeletonBlock width={320} height={11} /></div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <SkeletonBlock width={260} height={36} radius={8} />
          <SkeletonBlock width={100} height={36} radius={8} />
        </div>
      </SkeletonCard>
      <SkeletonListCard rows={4} titleWidth={150} />
    </div>
  )
}
