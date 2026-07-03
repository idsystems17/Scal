'use client'

import { useState } from 'react'
import { Icon } from './Icon'

interface WebhookBannerProps {
  status: 'connected' | 'disconnected'
  clienteId: string
  webhookUrl: string
}

export function WebhookBanner({ status, clienteId, webhookUrl }: WebhookBannerProps) {
  const isConnected = status === 'connected'
  const [copiado, setCopiado] = useState(false)
  const [testando, setTestando] = useState(false)
  const [resultado, setResultado] = useState<'ok' | 'erro' | null>(null)
  const [expandido, setExpandido] = useState(!isConnected)

  function copiarUrl() {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  async function testarWebhook() {
    setTestando(true)
    setResultado(null)
    try {
      const res = await fetch(`/api/webhook-test/${clienteId}`, { method: 'POST' })
      setResultado(res.ok ? 'ok' : 'erro')
    } catch {
      setResultado('erro')
    }
    setTestando(false)
    setTimeout(() => setResultado(null), 4000)
  }

  return (
    <div style={{
      borderRadius: 12,
      background: isConnected ? '#ecfdf3' : '#fffbeb',
      border: `1px solid ${isConnected ? '#bbf7d0' : '#fde68a'}`,
      overflow: 'hidden',
    }}>
      {/* Linha principal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isConnected ? '#16a34a' : '#d97706',
            boxShadow: isConnected ? '0 0 0 3px #bbf7d0' : '0 0 0 3px #fde68a',
          }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: isConnected ? '#15803d' : '#92400e', margin: 0 }}>
            {isConnected
              ? 'Webhook conectado — suas vendas estão sendo rastreadas automaticamente'
              : 'Rastreamento inativo — configure o webhook na sua plataforma de vendas'}
          </p>
        </div>
        <button
          onClick={() => setExpandido(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isConnected ? '#15803d' : '#92400e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {expandido ? 'Fechar' : (isConnected ? 'Ver detalhes' : 'Configurar')}
          <Icon name="chevron-down" size={14} />
        </button>
      </div>

      {/* Painel expandido */}
      {expandido && (
        <div style={{ borderTop: `1px solid ${isConnected ? '#bbf7d0' : '#fde68a'}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Instrução */}
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Cole esta URL no campo de webhook da sua plataforma (Kiwify, Hotmart, Eduzz, etc.):
          </p>

          {/* URL + copiar */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              readOnly
              value={webhookUrl}
              style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', color: '#475569', background: 'white', outline: 'none' }}
            />
            <button
              onClick={copiarUrl}
              style={{ padding: '9px 14px', background: copiado ? '#ecfdf3' : 'white', border: `1.5px solid ${copiado ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', color: copiado ? '#16a34a' : '#475569', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
            >
              <Icon name={copiado ? 'check' : 'copy'} size={14} />
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Botão de teste + feedback */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={testarWebhook}
              disabled={testando}
              style={{ padding: '9px 18px', background: testando ? '#e2e8f0' : '#0f172a', color: testando ? '#94a3b8' : 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: testando ? 'not-allowed' : 'pointer' }}
            >
              {testando ? 'Testando...' : 'Enviar teste'}
            </button>
            {resultado === 'ok' && (
              <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={14} /> Webhook funcionando!
              </span>
            )}
            {resultado === 'erro' && (
              <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
                Erro ao testar. Tente novamente.
              </span>
            )}
          </div>

          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
            O teste envia uma venda fictícia de R$ 99,90 para validar a conexão.
          </p>
        </div>
      )}
    </div>
  )
}
