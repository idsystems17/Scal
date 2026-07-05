'use client'

import { useState } from 'react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { WebhookBanner } from '@/components/dashboard/WebhookBanner'
import { BarRanking } from '@/components/dashboard/BarRanking'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { PartnersTable } from '@/components/dashboard/PartnersTable'
import { ConviteModal } from '@/components/dashboard/ConviteModal'
import { Delta } from '@/lib/deltas'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const CANAL_COLORS = ['#6366f1', '#2563eb', '#16a34a', '#db2777', '#f59e0b', '#64748b']

interface CanalReceita {
  label: string
  pct: number
  color: string
}

interface Props {
  clienteId: string
  webhookUrl: string
  cliente: Record<string, unknown> | null
  parceiros: Record<string, unknown>[]
  alertas: Record<string, unknown>[]
  canalReceita: CanalReceita[]
  searchQuery?: string
  deltas: { faturamento: Delta; parceirosAtivos: Delta; conversaoMedia: Delta; ticketMedio: Delta }
  periodDays: number
}

export function ClienteDashboardClient({ clienteId, webhookUrl, cliente, parceiros, alertas, canalReceita, searchQuery = '', deltas, periodDays }: Props) {
  const [modalConvite, setModalConvite] = useState(false)

  const totalFaturado = parceiros.reduce((s, p) => s + Number(p.total_faturado ?? 0), 0)
  const totalVendas = parceiros.reduce((s, p) => s + Number(p.total_conversoes ?? 0), 0)
  const totalCliques = parceiros.reduce((s, p) => s + Number(p.total_cliques ?? 0), 0)
  const parceirosAtivos = parceiros.filter(p => p.status === 'ativo').length
  const taxaMedia = totalCliques > 0 ? (totalVendas / totalCliques * 100) : 0
  const ticketMedio = totalVendas > 0 ? totalFaturado / totalVendas : 0

  const kpis = [
    { label: 'Faturamento via SCAL', value: brl.format(totalFaturado), delta: deltas.faturamento.label, deltaPositive: deltas.faturamento.positive, sub: `total acumulado · receita ${periodDays}d`, icon: 'wallet' },
    { label: 'Parceiros ativos', value: `${parceirosAtivos}/${parceiros.length}`, delta: deltas.parceirosAtivos.label, deltaPositive: deltas.parceirosAtivos.positive, sub: `do total · vs ${periodDays}d anteriores`, icon: 'users' },
    { label: 'Conversão média', value: `${taxaMedia.toFixed(1).replace('.', ',')}%`, delta: deltas.conversaoMedia.label, deltaPositive: deltas.conversaoMedia.positive, sub: `cliques → vendas · ${periodDays}d`, icon: 'percent' },
    { label: 'Ticket médio', value: brl.format(ticketMedio), delta: deltas.ticketMedio.label, deltaPositive: deltas.ticketMedio.positive, sub: `por venda · ${periodDays}d`, icon: 'cart' },
  ]

  const maxFaturado = Math.max(...parceiros.map(p => Number(p.total_faturado ?? 0)), 1)
  const topParceiros = parceiros.slice(0, 5).map(p => ({
    nome: String(p.nome ?? ''),
    codigo: String(p.codigo_unico ?? ''),
    vendas: Number(p.total_conversoes ?? 0),
    total_faturado: Number(p.total_faturado ?? 0),
    pct: Math.round(Number(p.total_faturado ?? 0) / maxFaturado * 100),
  }))

  const donutData = canalReceita.length > 0
    ? canalReceita
    : [{ label: 'Sem dados', pct: 100, color: CANAL_COLORS[5] }]

  const parceirosMapeados = parceiros.map(p => ({
    id: String(p.parceiro_id ?? ''),
    nome: String(p.nome ?? ''),
    codigo: String(p.codigo_unico ?? ''),
    clicks: Number(p.total_cliques ?? 0),
    sales: Number(p.total_conversoes ?? 0),
    revenue: Number(p.total_faturado ?? 0),
    status: (Number(p.total_faturado ?? 0) > 10000 ? 'top' : p.status === 'bloqueado' ? 'inativo' : 'ativo') as 'top' | 'ativo' | 'baixa_conversao' | 'inativo',
    statusReal: (p.status ?? 'ativo') as 'ativo' | 'pendente' | 'bloqueado',
  }))

  const alertasPerformance = alertas.map(a => ({
    parceiro_id: String(a.cliente_id ?? ''),
    nome: 'Plano',
    motivo: a.tipo === 'limite_parceiros_excedido'
      ? `Limite de parceiros atingido: ${a.valor_no_momento}`
      : `Limite de faturamento atingido: ${a.valor_no_momento}`,
  }))

  const webhookStatus: 'connected' | 'disconnected' = cliente?.webhook_confirmado ? 'connected' : 'disconnected'

  return (
    <>
      {modalConvite && <ConviteModal clienteId={clienteId} onClose={() => setModalConvite(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setModalConvite(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Convidar parceiro
          </button>
        </div>

        <WebhookBanner status={webhookStatus} clienteId={clienteId} webhookUrl={webhookUrl} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {kpis.map((kpi, i) => <KpiCard key={i} data={kpi} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
          <BarRanking items={topParceiros} />
          <DonutChart data={donutData} />
        </div>

        {alertasPerformance.length > 0 && (
          <div style={{ padding: '14px 20px', borderRadius: 12, background: '#fff1f3', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#e11d48', margin: 0 }}>Alerta de plano</p>
              <p style={{ fontSize: 12, color: '#be123c', margin: '2px 0 0' }}>{alertasPerformance[0].motivo}</p>
            </div>
          </div>
        )}

        <PartnersTable parceiros={parceirosMapeados} searchQuery={searchQuery} />
      </div>
    </>
  )
}
