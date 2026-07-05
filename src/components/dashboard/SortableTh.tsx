interface SortableThProps<K extends string> {
  label: string
  sortKey: K
  activeKey: K | null
  direction: 'asc' | 'desc'
  onSort: (key: K) => void
}

export function SortableTh<K extends string>({ label, sortKey, activeKey, direction, onSort }: SortableThProps<K>) {
  const active = activeKey === sortKey
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
        color: active ? '#2563eb' : '#94a3b8', letterSpacing: '0.05em',
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
      }}
    >
      {label} {active ? (direction === 'asc' ? '▲' : '▼') : ''}
    </th>
  )
}
