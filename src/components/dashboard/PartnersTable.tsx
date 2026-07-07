'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { atualizarStatusParceiro } from '@/lib/actions/cliente'
import { useSort } from '@/lib/useSort'
import { SortableTh } from './SortableTh'

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  top: { bg: '#eef4ff', color: '#1d4ed8', label: 'Top performer' },
  ativo: { bg: '#ecfdf3', color: '#16a34a', label: 'Ativo' },
  baixa_conversao: { bg: '#fff1f3', color: '#e11d48', label: 'Baixa conversão' },
  inativo: { bg: '#f1f4f9', color: '#64748b', label: 'Inativo há 15 dias' },
  bloqueado: { bg: '#f1f4f9', color: '#64748b', label: 'Bloqueado' },
}

interface Partner {
  id: string
  nome: string
  codigo: string
  clicks: number
  sales: number
  revenue: number
  status: 'top' | 'ativo' | 'baixa_conversao' | 'inativo' | 'bloqueado'
  statusReal: 'ativo' | 'pendente' | 'bloqueado'
}

interface PartnersTableProps {
  parceiros: Partner[]
  searchQuery?: string
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function PartnersTable({ parceiros, searchQuery = '' }: PartnersTableProps) {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
  const [pendingId, setPendingId] = useState<string | null>(null)
  const q = searchQuery.toLowerCase()
  const filtered = q ? parceiros.filter(p => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)) : parceiros
  const { sorted, sortKey, direction, toggleSort } = useSort<Partner, keyof Partner>(filtered)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle(id: string, statusReal: string) {
    const novoStatus = statusReal === 'bloqueado' ? 'ativo' : 'bloqueado'
    setPendingId(id)
    startTransition(async () => {
      await atualizarStatusParceiro(id, novoStatus)
      router.refresh()
      setPendingId(null)
    })
  }

  if (parceiros.length === 0) {
    return (
      <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: 14, margin: 0 }}>Nenhum parceiro ainda.</p>
        <p style={{ fontSize: 12, margin: '6px 0 0' }}>Use "Convidar parceiro" para adicionar o primeiro afiliado.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Análise de parceiros</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Desempenho detalhado de todos os afiliados</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #cdd0d4' }}>
              <SortableTh label="PARCEIRO" sortKey="nome" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="CÓDIGO" sortKey="codigo" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="CLIQUES" sortKey="clicks" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="VENDAS" sortKey="sales" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="FATURADO" sortKey="revenue" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="STATUS" sortKey="status" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <th style={{ padding: '10px 12px' }} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
            <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Nenhum parceiro encontrado.</td></tr>
          )}
          {sorted.map((p) => {
              const s = statusConfig[p.statusReal === 'bloqueado' ? 'bloqueado' : p.status] ?? statusConfig.ativo
              const isBloqueado = p.statusReal === 'bloqueado'
              const isLoading = pendingId === p.id
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', opacity: isBloqueado ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {initials(p.nome)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0B081A' }}>{p.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>
                      {p.codigo}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, color: '#475569' }}>
                    {p.clicks.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#0B081A' }}>
                    {p.sales}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: '#0B081A' }}>
                    {fmt.format(p.revenue)}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <button
                      onClick={() => handleToggle(p.id, p.statusReal)}
                      disabled={isLoading}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        border: isBloqueado ? 'none' : '1px solid #fecdd3',
                        background: isBloqueado ? '#2563eb' : '#fff1f3',
                        color: isBloqueado ? 'white' : '#e11d48',
                        opacity: isLoading ? 0.6 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isLoading ? '...' : isBloqueado ? 'Ativar' : 'Bloquear'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
