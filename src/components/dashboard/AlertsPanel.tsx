'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'
import { resolverAlerta } from '@/lib/actions/admin'

interface Alerta {
  id: string
  cliente_nome: string
  tipo: 'limite_parceiros' | 'limite_faturamento'
  valor_atual: string
  limite: string
  resolvido: boolean
}

interface AlertsPanelProps {
  alertas: Alerta[]
}

export function AlertsPanel({ alertas }: AlertsPanelProps) {
  const [resolved, setResolved] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const alertasPendentes = alertas.filter(a => !resolved.has(a.id))

  function handleResolver(id: string) {
    setResolved(prev => new Set([...prev, id]))
    startTransition(async () => {
      await resolverAlerta(id)
      router.refresh()
    })
  }

  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Central de alertas de plano</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Lojas que excederam limites do plano</p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 700 }}>
          {alertasPendentes.length} pendentes
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alertas.map(alerta => {
          const isResolved = resolved.has(alerta.id)
          const isFat = alerta.tipo === 'limite_faturamento'
          return (
            <div
              key={alerta.id}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                border: `1px solid ${isResolved ? '#bbf7d0' : isFat ? '#fed7aa' : '#fecdd3'}`,
                background: isResolved ? '#f0fdf4' : isFat ? '#fff7ed' : '#fff5f6',
                opacity: isResolved ? 0.6 : 1,
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ color: isResolved ? '#16a34a' : isFat ? '#ea580c' : '#e11d48', flexShrink: 0 }}>
                  <Icon name={isResolved ? 'check' : isFat ? 'wallet' : 'users'} size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{alerta.cliente_nome}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                    {alerta.tipo === 'limite_parceiros' ? 'Limite de parceiros excedido' : 'Limite de faturamento excedido'}
                    {' — '}
                    <span style={{ fontWeight: 600, color: '#475569' }}>{alerta.valor_atual}</span> / {alerta.limite}
                  </p>
                </div>
              </div>
              {!isResolved && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleResolver(alerta.id)}
                    disabled={pending}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e6ecf5', background: 'white', color: '#475569', fontSize: 12, fontWeight: 500, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}
                  >
                    Resolver
                  </button>
                  <button
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Aplicar taxa 0,5%
                  </button>
                </div>
              )}
              {isResolved && (
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Resolvido</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
