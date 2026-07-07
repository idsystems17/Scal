'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'
import { urlEmbedGoogleDrive } from '@/lib/googleDriveEmbed'

export type TipoMaterial = 'link' | 'video' | 'audio'

export interface Material {
  id: string
  titulo: string
  url: string
  tipo: TipoMaterial
  criado_em: string
}

interface MateriaisManagerProps {
  titulo: string
  subtitulo: string
  materiais: Material[]
  onCreate?: (titulo: string, url: string, tipo: TipoMaterial) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  emptyText?: string
}

const PLACEHOLDER_URL: Record<TipoMaterial, string> = {
  link: 'Link (Google Drive, Dropbox, etc.)',
  video: 'Link de compartilhamento do vídeo no Google Drive',
  audio: 'Link de compartilhamento do áudio no Google Drive',
}

export function MateriaisManager({ titulo, subtitulo, materiais, onCreate, onDelete, emptyText }: MateriaisManagerProps) {
  const [tituloInput, setTituloInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [tipoInput, setTipoInput] = useState<TipoMaterial>('link')
  const [erro, setErro] = useState('')
  const [pending, startTransition] = useTransition()
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const router = useRouter()

  const canManage = Boolean(onCreate)

  function handleAdd() {
    if (!tituloInput.trim() || !urlInput.trim()) {
      setErro('Preencha título e link.')
      return
    }
    let parsed: URL
    try {
      parsed = new URL(urlInput.trim())
    } catch {
      setErro('Informe um link válido (com https://).')
      return
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      setErro('O link precisa começar com http:// ou https://.')
      return
    }
    setErro('')
    startTransition(async () => {
      try {
        await onCreate!(tituloInput.trim(), urlInput.trim(), tipoInput)
      } catch {
        setErro('Não foi possível salvar o material. Verifique o link e tente novamente.')
        return
      }
      setTituloInput('')
      setUrlInput('')
      setTipoInput('link')
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setExcluindo(id)
    startTransition(async () => {
      await onDelete!(id)
      router.refresh()
      setExcluindo(null)
    })
  }

  return (
    <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>{titulo}</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{subtitulo}</p>
      </div>

      {canManage && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              value={tipoInput}
              onChange={e => setTipoInput(e.target.value as TipoMaterial)}
              style={{ flex: '0 1 140px', padding: '9px 12px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 13, color: '#0B081A', outline: 'none', background: 'white' }}
            >
              <option value="link">Link / Doc</option>
              <option value="video">Vídeo</option>
              <option value="audio">Áudio</option>
            </select>
            <input
              value={tituloInput}
              onChange={e => setTituloInput(e.target.value)}
              placeholder="Título do material"
              style={{ flex: '1 1 160px', padding: '9px 12px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 13, color: '#0B081A', outline: 'none' }}
            />
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder={PLACEHOLDER_URL[tipoInput]}
              style={{ flex: '2 1 260px', padding: '9px 12px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 13, color: '#0B081A', outline: 'none' }}
            />
            <button
              onClick={handleAdd}
              disabled={pending}
              style={{
                padding: '9px 16px', borderRadius: 8, border: 'none',
                background: pending ? '#e2e8f0' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)',
                color: pending ? '#94a3b8' : 'white', fontWeight: 600, fontSize: 13,
                cursor: pending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Adicionar
            </button>
          </div>
          {(tipoInput === 'video' || tipoInput === 'audio') && (
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0' }}>
              No Google Drive: clique com o botão direito no arquivo → Compartilhar → Copiar link. Pra decidir se dá pra baixar, ajuste em &quot;Leitores podem baixar, imprimir e copiar&quot; nas configurações de compartilhamento do próprio arquivo.
            </p>
          )}
        </div>
      )}
      {erro && <p style={{ fontSize: 12, color: '#dc2626', margin: '-12px 0 16px' }}>{erro}</p>}

      {materiais.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{emptyText ?? 'Nenhum material ainda.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {materiais.map(m => {
            const embedUrl = (m.tipo === 'video' || m.tipo === 'audio') ? urlEmbedGoogleDrive(m.url) : null
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', borderRadius: 10, border: '1px solid #cdd0d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#d6e4fe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={m.tipo === 'video' ? 'video' : m.tipo === 'audio' ? 'audio' : 'link'} size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0B081A', margin: 0 }}>{m.titulo}</p>
                    {!embedUrl && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>
                        Abrir material ↗
                      </a>
                    )}
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={excluindo === m.id}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid #fecdd3',
                        background: '#ffe4e6', color: '#e11d48', fontSize: 12, fontWeight: 500,
                        cursor: excluindo === m.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {excluindo === m.id ? '...' : 'Remover'}
                    </button>
                  )}
                </div>
                {embedUrl && (
                  <div>
                    <iframe
                      src={embedUrl}
                      allow="autoplay"
                      style={{ width: '100%', height: m.tipo === 'video' ? 220 : 70, border: 'none', borderRadius: 8, display: 'block' }}
                    />
                    <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>
                      Abrir no Drive ↗
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
