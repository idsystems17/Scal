'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'
import { gerarLink } from '@/lib/actions/parceiro'
import { useSort } from '@/lib/useSort'
import { SortableTh } from './SortableTh'

interface Channel {
  name: string
  abbr: string
  url: string
  clicks: number
  conversoes: number
  ctr: string
  ctrValue: number
  ctrPositive: boolean
  volume: string
  volumeValue: number
}

const abbrColors: Record<string, { bg: string; color: string }> = {
  IG: { bg: '#fce7f3', color: '#db2777' },
  WA: { bg: '#dcfce7', color: '#16a34a' },
  YT: { bg: '#fee2e2', color: '#dc2626' },
  TT: { bg: '#ede9fe', color: '#7c3aed' },
  BL: { bg: '#dbeafe', color: '#2563eb' },
  EM: { bg: '#fef3c7', color: '#d97706' },
  DI: { bg: '#f1f5f9', color: '#64748b' },
}

const CANAIS = ['Instagram', 'WhatsApp', 'YouTube', 'TikTok', 'Blog', 'Email', 'Outro']

function ctrColor(ctr: string): string {
  const val = parseFloat(ctr.replace(',', '.'))
  if (val >= 2.5) return '#16a34a'
  if (val >= 1.8) return '#d97706'
  return '#e11d48'
}

interface ChannelTableProps {
  channels: Channel[]
  parceiroId: string
  clienteId: string
  urlLojaDefault: string
}

export function ChannelTable({ channels, parceiroId, clienteId, urlLojaDefault }: ChannelTableProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const { sorted, sortKey, direction, toggleSort } = useSort<Channel, keyof Channel>(channels)
  const [modalAberto, setModalAberto] = useState(false)
  const [canal, setCanal] = useState('Instagram')
  const [destinoUrl, setDestinoUrl] = useState(urlLojaDefault)
  const [linkGerado, setLinkGerado] = useState<string | null>(null)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [erro, setErro] = useState('')
  const [gerando, startTransition] = useTransition()
  const router = useRouter()

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    })
  }

  function abrirModal() {
    setModalAberto(true)
    setLinkGerado(null)
    setErro('')
    setCanal('Instagram')
    setDestinoUrl(urlLojaDefault)
  }

  function fecharModal() {
    setModalAberto(false)
    setLinkGerado(null)
    setLinkCopiado(false)
    setErro('')
  }

  function handleGerar() {
    if (!destinoUrl.trim()) { setErro('Informe a URL de destino.'); return }
    setErro('')
    startTransition(async () => {
      try {
        const link = await gerarLink(parceiroId, clienteId, canal, destinoUrl.trim())
        setLinkGerado(link)
        router.refresh()
      } catch {
        setErro('Erro ao gerar link. Tente novamente.')
      }
    })
  }

  function copiarLinkGerado() {
    if (!linkGerado) return
    navigator.clipboard.writeText(linkGerado).then(() => {
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    })
  }

  return (
    <>
      {/* Modal */}
      {modalAberto && (
        <div
          onClick={fecharModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Gerar link de afiliado</h3>
              <button onClick={fecharModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                <Icon name="x" size={18} />
              </button>
            </div>

            {!linkGerado ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Canal de divulgação</label>
                  <select
                    value={canal}
                    onChange={e => setCanal(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#0f172a', background: 'white', outline: 'none' }}
                  >
                    {CANAIS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>URL de destino (página do produto)</label>
                  <input
                    type="url"
                    value={destinoUrl}
                    onChange={e => setDestinoUrl(e.target.value)}
                    placeholder="https://exemplo.com/produto"
                    style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${erro ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 8, fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {erro && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{erro}</p>}
                </div>

                <button
                  onClick={handleGerar}
                  disabled={gerando}
                  style={{ padding: '11px', borderRadius: 10, border: 'none', background: gerando ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: gerando ? '#94a3b8' : 'white', fontWeight: 700, fontSize: 14, cursor: gerando ? 'not-allowed' : 'pointer' }}
                >
                  {gerando ? 'Gerando...' : 'Gerar link'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 10, background: '#ecfdf3', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d', margin: '0 0 4px' }}>Link gerado com sucesso!</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Canal: <strong>{canal}</strong></p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    readOnly
                    value={linkGerado}
                    style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', color: '#475569', background: 'white', outline: 'none' }}
                  />
                  <button
                    onClick={copiarLinkGerado}
                    style={{ padding: '9px 14px', background: linkCopiado ? '#ecfdf3' : 'white', border: `1.5px solid ${linkCopiado ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', color: linkCopiado ? '#16a34a' : '#475569', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                  >
                    <Icon name={linkCopiado ? 'check' : 'copy'} size={14} />
                    {linkCopiado ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <button
                  onClick={() => { setLinkGerado(null); setCanal('Instagram'); setDestinoUrl(urlLojaDefault) }}
                  style={{ padding: '9px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  Gerar outro link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Desempenho por canal</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Seus links de afiliado ativos</p>
          </div>
          <button
            onClick={abrirModal}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <Icon name="plus" size={14} />
            Novo canal
          </button>
        </div>

        {channels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: 14, margin: 0 }}>Nenhum link gerado ainda.</p>
            <p style={{ fontSize: 12, margin: '6px 0 0' }}>Clique em "Novo canal" para criar seu primeiro link de afiliado.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <SortableTh label="CANAL / LINK" sortKey="name" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                  <SortableTh label="CLIQUES" sortKey="clicks" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                  <SortableTh label="CONVERSÕES" sortKey="conversoes" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                  <SortableTh label="CTR" sortKey="ctrValue" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                  <SortableTh label="VOLUME" sortKey="volumeValue" activeKey={sortKey} direction={direction} onSort={toggleSort} />
                  <th style={{ padding: '10px 12px' }} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((ch) => {
                  const colors = abbrColors[ch.abbr] || { bg: '#f1f5f9', color: '#64748b' }
                  return (
                    <tr key={ch.url} style={{ borderBottom: '1px solid #f8fafc' }}>
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
                          onClick={() => handleCopy(ch.url)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '6px 12px', borderRadius: 8, border: '1px solid #e6ecf5',
                            background: copiedUrl === ch.url ? '#ecfdf3' : 'white',
                            color: copiedUrl === ch.url ? '#16a34a' : '#475569',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            transition: 'all 0.2s', whiteSpace: 'nowrap',
                          }}
                        >
                          <Icon name={copiedUrl === ch.url ? 'check' : 'copy'} size={14} />
                          {copiedUrl === ch.url ? 'Copiado ✓' : 'Copiar link'}
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
    </>
  )
}
