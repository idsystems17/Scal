'use client'

import { useState } from 'react'
import { FaqItem } from '@/lib/faq'
import { Icon } from './Icon'

interface Mensagem {
  autor: 'usuario' | 'assistente'
  texto: string
}

interface AjudaChatProps {
  role: 'admin' | 'cliente' | 'parceiro'
  faq: FaqItem[]
}

export function AjudaChat({ role, faq }: AjudaChatProps) {
  const [faqAberto, setFaqAberto] = useState<number | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviarPergunta() {
    const pergunta = input.trim()
    if (!pergunta || enviando) return

    setMensagens(m => [...m, { autor: 'usuario', texto: pergunta }])
    setInput('')
    setEnviando(true)

    try {
      const res = await fetch('/api/central-ajuda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta, role }),
      })
      const data = await res.json()
      const texto = res.ok ? data.resposta : (data.error ?? 'Não consegui responder agora.')
      setMensagens(m => [...m, { autor: 'assistente', texto }])
    } catch {
      setMensagens(m => [...m, { autor: 'assistente', texto: 'Não consegui me conectar agora. Tente novamente em instantes.' }])
    } finally {
      setEnviando(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') enviarPergunta()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* FAQ */}
      <div style={{ background: 'white', border: '1px solid #dbe0e9', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Perguntas frequentes</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Clique para expandir</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faq.map((f, i) => {
            const aberto = faqAberto === i
            return (
              <div key={i} style={{ border: '1px solid #e5e9ed', borderRadius: 10, overflow: 'hidden' }}>
                <button
                  onClick={() => setFaqAberto(aberto ? null : i)}
                  style={{
                    width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0B081A' }}>{f.pergunta}</span>
                  <span style={{ color: '#94a3b8', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0, marginLeft: 12 }}>
                    <Icon name="chevron-down" size={16} />
                  </span>
                </button>
                {aberto && (
                  <div style={{ padding: '0 14px 14px' }}>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{f.resposta}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat */}
      <div style={{ background: 'white', border: '1px solid #dbe0e9', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Pergunte para o assistente</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Respostas baseadas no FAQ acima</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto', marginBottom: 16 }}>
          {mensagens.length === 0 && (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>Faça uma pergunta para começar.</p>
          )}
          {mensagens.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.autor === 'usuario' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.5,
                background: m.autor === 'usuario' ? '#2563eb' : '#f1f5f9',
                color: m.autor === 'usuario' ? 'white' : '#0B081A',
              }}
            >
              {m.texto}
            </div>
          ))}
          {enviando && (
            <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, fontSize: 13, background: '#f1f5f9', color: '#94a3b8' }}>
              Digitando...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            disabled={enviando}
            style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #d7dce4', borderRadius: 10, fontSize: 13, color: '#0B081A', outline: 'none' }}
          />
          <button
            onClick={enviarPergunta}
            disabled={enviando || !input.trim()}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: enviando || !input.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)',
              color: enviando || !input.trim() ? '#94a3b8' : 'white', fontWeight: 600, fontSize: 13,
              cursor: enviando || !input.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
