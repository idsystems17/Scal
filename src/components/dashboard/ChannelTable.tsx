'use client'

import { useState } from 'react'
import { Icon } from './Icon'

interface Channel {
  name: string
  abbr: string
  url: string
  clicks: number
  conversoes: number
  ctr: string
  ctrPositive: boolean
  volume: string
}

const abbrColors: Record<string, { bg: string; color: string }> = {
  IG: { bg: '#fce7f3', color: '#db2777' },
  WA: { bg: '#dcfce7', color: '#16a34a' },
  YT: { bg: '#fee2e2', color: '#dc2626' },
  TT: { bg: '#ede9fe', color: '#7c3aed' },
  BL: { bg: '#dbeafe', color: '#2563eb' },
}

function ctrColor(ctr: string): string {
  const val = parseFloat(ctr.replace(',', '.'))
  if (val >= 2.5) return '#16a34a'
  if (val >= 1.8) return '#d97706'
  return '#e11d48'
}

interface ChannelTableProps {
  channels: Channel[]
}

export function ChannelTable({ channels }: ChannelTableProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  function handleCopy(url: string, index: number) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Desempenho por canal</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Seus links de afiliado ativos</p>
      </div>

      {channels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: 14, margin: 0 }}>Nenhum link gerado ainda.</p>
          <p style={{ fontSize: 12, margin: '6px 0 0' }}>Seus links aparecerão aqui após serem criados pelo lojista.</p>
        </div>
      ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['CANAL / LINK', 'CLIQUES', 'CONVERSÕES', 'CTR', 'VOLUME', ''].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((ch, i) => {
              const colors = abbrColors[ch.abbr] || { bg: '#f1f5f9', color: '#64748b' }
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.bg, color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        {ch.abbr}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{ch.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>{ch.url}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {ch.clicks.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, color: '#475569' }}>
                    {ch.conversoes}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: ctrColor(ch.ctr) }}>
                      {ch.ctr}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {ch.volume}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <button
                      onClick={() => handleCopy(ch.url, i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #e6ecf5',
                        background: copiedIndex === i ? '#ecfdf3' : 'white',
                        color: copiedIndex === i ? '#16a34a' : '#475569',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Icon name={copiedIndex === i ? 'check' : 'copy'} size={14} />
                      {copiedIndex === i ? 'Copiado ✓' : 'Copiar link'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
