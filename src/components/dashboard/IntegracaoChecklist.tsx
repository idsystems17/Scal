'use client'

import { useState } from 'react'
import { Icon } from './Icon'

interface Empresa {
  id: string
  nome: string
  webhookSecret: string
}

interface IntegracaoChecklistProps {
  empresas: Empresa[]
  appUrl: string
}

function CopyBlock({ texto, mono = false }: { texto: string; mono?: boolean }) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <pre style={{
        flex: 1, margin: 0, padding: '12px 16px', background: '#0B081A', borderRadius: 10,
        overflowX: 'auto', fontSize: 12, lineHeight: 1.7, color: '#e2e8f0',
        fontFamily: mono ? 'monospace' : 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>{texto}</pre>
      <button
        onClick={copiar}
        style={{ padding: '9px 14px', background: copiado ? '#ecfdf3' : 'white', border: `1.5px solid ${copiado ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', color: copiado ? '#16a34a' : '#475569', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        <Icon name={copiado ? 'check' : 'copy'} size={14} />
        {copiado ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
  )
}

export function IntegracaoChecklist({ empresas, appUrl }: IntegracaoChecklistProps) {
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id ?? '')
  const empresa = empresas.find(e => e.id === empresaId) ?? null

  const scriptTag = `<script src="${appUrl}/scal-tracker.js"></script>`
  const webhookUrl = empresa ? `${appUrl}/webhook/${empresa.id}` : `${appUrl}/webhook/SEU_CLIENTE_ID`
  const webhookSecret = empresa?.webhookSecret ?? 'SEU_WEBHOOK_SECRET'

  const mensagemCompleta = `Integração SCAL — rastreamento de vendas (checkout próprio)

Vocês não usam uma plataforma pronta (Kiwify/Hotmart/Eduzz), então a integração exige 3 passos simples do lado de vocês:

1) Adicione este script em todas as páginas do site (antes do </body>):
${scriptTag}

Ele captura o código de rastreio do link do parceiro (parâmetro "scal_click" na URL) e guarda no navegador do visitante por 30 dias.

2) No momento de fechar a compra, leiam o valor guardado com:
window.getScalClickId()

Salvem esse valor junto com o pedido (ele pode vir vazio se a pessoa não veio por um link de parceiro — nesse caso é só não enviar o campo).

3) Quando a venda for confirmada, enviem um POST para:
${webhookUrl}

Com o corpo (JSON):
{
  "pedido_id": "ID_DO_PEDIDO_DE_VOCES",
  "valor": 197.00,
  "status": "aprovado",
  "scal_click": "valor_lido_no_passo_2"
}

E o header:
X-Scal-Signature: HMAC-SHA256 do corpo usando a chave abaixo

Chave (webhook_secret), não compartilhar publicamente:
${webhookSecret}

Qualquer dúvida, é só chamar.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {empresas.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0B081A', display: 'block', marginBottom: 8 }}>
            Gerar instruções para qual e-commerce?
          </label>
          <select
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            style={{ width: '100%', maxWidth: 360, padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0B081A', background: 'white' }}
          >
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0' }}>
            A URL do webhook e a chave secreta abaixo já saem preenchidas com os dados reais desse e-commerce.
          </p>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: '0 0 6px' }}>Mensagem pronta para enviar ao dev</h3>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px' }}>
          Copie e cole no WhatsApp, e-mail ou onde for conversar com o time técnico do e-commerce.
        </p>
        <CopyBlock texto={mensagemCompleta} />
      </div>

      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: '0 0 6px' }}>Só o script (passo 1 isolado)</h3>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px' }}>
          Funciona em qualquer site, independente do gateway de pagamento usado (Mercado Pago, PagSeguro, Stripe, Yapay etc.) — é só captura no navegador.
        </p>
        <CopyBlock texto={scriptTag} mono />
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#475569' }}>Por que isso funciona pra qualquer e-commerce com checkout próprio:</strong> o script (passo 1) e o formato do webhook (passo 3) não dependem do gateway de pagamento — são sempre os mesmos. Só o passo 2 (onde no código deles eles leem <code>window.getScalClickId()</code> e salvam junto ao pedido) precisa do dev deles, mas é a mesma receita pra Mercado Pago, PagSeguro, Stripe ou qualquer outro.
        </p>
      </div>
    </div>
  )
}
