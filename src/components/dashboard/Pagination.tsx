'use client'

import { Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  page: number
  totalPages: number
}

function PaginationInner({ page, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const btnStyle = (disabled: boolean) => ({
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #dbe0e9',
    background: disabled ? '#f8fafc' : 'white',
    color: disabled ? '#cbd5e1' : '#475569',
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
      <button onClick={() => goTo(page - 1)} disabled={page <= 1} style={btnStyle(page <= 1)}>
        Anterior
      </button>
      <span style={{ fontSize: 12, color: '#64748b' }}>Página {page} de {totalPages}</span>
      <button onClick={() => goTo(page + 1)} disabled={page >= totalPages} style={btnStyle(page >= totalPages)}>
        Próxima
      </button>
    </div>
  )
}

export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<div style={{ height: 32 }} />}>
      <PaginationInner {...props} />
    </Suspense>
  )
}
