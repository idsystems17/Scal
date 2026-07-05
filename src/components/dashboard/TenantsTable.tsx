'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { atualizarStatusTenant } from '@/lib/actions/admin'
import { useSort } from '@/lib/useSort'
import { SortableTh } from './SortableTh'

interface Tenant {
  id: string
  nome: string
  plataforma: string
  parceiros: number
  limite_parceiros: number
  faturamento: number
  webhook_status: 'connected' | 'disconnected'
  status: 'ativo' | 'suspenso' | 'trial' | 'cancelado'
}

interface TenantsTableProps {
  tenants: Tenant[]
  searchQuery?: string
}

export function TenantsTable({ tenants, searchQuery = '' }: TenantsTableProps) {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
  const [pendingId, setPendingId] = useState<string | null>(null)
  const q = searchQuery.toLowerCase()
  const filtered = q ? tenants.filter(t => t.nome.toLowerCase().includes(q) || t.plataforma.toLowerCase().includes(q)) : tenants
  const { sorted, sortKey, direction, toggleSort } = useSort<Tenant, keyof Tenant>(filtered)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleToggleStatus(id: string, statusAtual: string) {
    const novoStatus = statusAtual === 'suspenso' ? 'ativo' : 'suspenso'
    setPendingId(id)
    startTransition(async () => {
      await atualizarStatusTenant(id, novoStatus)
      router.refresh()
      setPendingId(null)
    })
  }

  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Empresas ativas</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Visão geral das empresas na plataforma</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <SortableTh label="CLIENTE" sortKey="nome" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="PLATAFORMA" sortKey="plataforma" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="PARCEIROS" sortKey="parceiros" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="FATURAMENTO" sortKey="faturamento" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="WEBHOOK" sortKey="webhook_status" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <SortableTh label="STATUS" sortKey="status" activeKey={sortKey} direction={direction} onSort={toggleSort} />
              <th style={{ padding: '10px 12px' }} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
            <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Nenhuma empresa encontrada.</td></tr>
          )}
          {sorted.map((t) => {
              const excedeu = t.parceiros > t.limite_parceiros
              const isSuspenso = t.status === 'suspenso'
              const isLoading = pendingId === t.id
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc', opacity: isSuspenso ? 0.65 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {t.nome}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', color: '#475569', fontWeight: 500 }}>
                      {t.plataforma}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: excedeu ? '#e11d48' : '#0f172a' }}>
                      {t.parceiros}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>/{t.limite_parceiros}</span>
                    {excedeu && <span style={{ marginLeft: 6, fontSize: 11, color: '#e11d48', fontWeight: 700 }}>(!)</span>}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {fmt.format(t.faturamento)}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: t.webhook_status === 'connected' ? '#ecfdf3' : '#f1f4f9',
                      color: t.webhook_status === 'connected' ? '#16a34a' : '#64748b',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {t.webhook_status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                      background: isSuspenso ? '#fff1f3' : t.status === 'trial' ? '#fef3c7' : '#ecfdf3',
                      color: isSuspenso ? '#e11d48' : t.status === 'trial' ? '#d97706' : '#16a34a',
                    }}>
                      {isSuspenso ? 'Suspenso' : t.status === 'trial' ? 'Trial' : 'Ativo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <button
                      onClick={() => handleToggleStatus(t.id, t.status)}
                      disabled={isLoading || t.status === 'cancelado'}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        cursor: isLoading || t.status === 'cancelado' ? 'not-allowed' : 'pointer',
                        border: isSuspenso ? 'none' : '1px solid #fecdd3',
                        background: isSuspenso ? '#2563eb' : '#fff1f3',
                        color: isSuspenso ? 'white' : '#e11d48',
                        opacity: isLoading ? 0.6 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isLoading ? '...' : isSuspenso ? 'Reativar' : 'Suspender'}
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
