import { SkeletonHeader, SkeletonCard, SkeletonBlock } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SkeletonHeader />
      <SkeletonCard>
        <SkeletonBlock width={220} height={13} />
        <div style={{ marginTop: 12 }}><SkeletonBlock width={360} height={38} radius={8} /></div>
        <div style={{ marginTop: 12 }}><SkeletonBlock width={280} height={11} /></div>
      </SkeletonCard>
      <SkeletonCard>
        <SkeletonBlock width={260} height={15} />
        <div style={{ marginTop: 14 }}><SkeletonBlock height={90} radius={10} /></div>
      </SkeletonCard>
      <SkeletonCard>
        <SkeletonBlock width={220} height={15} />
        <div style={{ marginTop: 14 }}><SkeletonBlock height={70} radius={10} /></div>
      </SkeletonCard>
    </div>
  )
}
