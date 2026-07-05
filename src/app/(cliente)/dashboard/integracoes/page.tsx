import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WebhookBanner } from '@/components/dashboard/WebhookBanner'

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'

const plataformas = [
  {
    nome: 'Kiwify',
    cor: '#f59e0b',
    passos: [
      'Acesse o painel da Kiwify → Configurações → Webhooks',
      'Clique em "Adicionar webhook"',
      'Cole a URL do webhook SCAL no campo "URL de destino"',
      'Em "Eventos", marque: Venda aprovada e Venda reembolsada',
      'Salve e clique em "Testar" — aparecerá uma venda de teste no SCAL',
      'No campo "Assinatura secreta", coloque o mesmo valor do campo webhook_secret (veja abaixo)',
    ],
    nota: 'O campo pedido_id da Kiwify é mapeado automaticamente. Nenhuma configuração extra é necessária.',
  },
  {
    nome: 'Hotmart',
    cor: '#ef4444',
    passos: [
      'Acesse o painel da Hotmart → Ferramentas → Webhooks',
      'Clique em "Novo webhook"',
      'Cole a URL do webhook SCAL',
      'Em "Eventos", marque: PURCHASE_APPROVED e PURCHASE_REFUNDED',
      'Salve e envie um evento de teste',
    ],
    nota: 'A Hotmart envia o campo order_id — o SCAL usa isso para idempotência.',
  },
  {
    nome: 'Eduzz',
    cor: '#8b5cf6',
    passos: [
      'Acesse Eduzz → Produtor → Ferramentas → Webhooks',
      'Adicione a URL do webhook SCAL',
      'Selecione os eventos: venda_aprovada e venda_estornada',
      'Salve e envie um teste',
    ],
    nota: 'Na Eduzz o campo é trans_cod — mapeado automaticamente como pedido_externo_id.',
  },
  {
    nome: 'Outra plataforma',
    cor: '#64748b',
    passos: [
      'Envie um POST para a URL do webhook SCAL com Content-Type: application/json',
      'O corpo deve conter pelo menos: { "pedido_id": "ID_ÚNICO", "valor": 99.90, "status": "aprovado" }',
      'Opcionalmente inclua "scal_click": "UUID_DO_CLICK" para atribuição manual',
      'O header X-Scal-Signature deve conter o HMAC-SHA256 do corpo com seu webhook_secret',
    ],
    nota: 'Qualquer plataforma que suporte webhooks POST JSON funciona com o SCAL.',
  },
]

export default async function IntegracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, webhook_secret, webhook_confirmado')
    .eq('user_id', user.id)
    .single()

  if (!cliente) redirect('/dashboard')

  const webhookUrl = `${appUrl}/webhook/${cliente.id}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Integrações</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Configure o webhook para receber notificações de vendas</p>
      </div>

      {/* Status e URL do webhook */}
      <WebhookBanner
        clienteId={cliente.id}
        webhookUrl={webhookUrl}
        status={cliente.webhook_confirmado ? 'connected' : 'disconnected'}
      />

      {/* Segredo do webhook */}
      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>Assinatura secreta (HMAC)</h3>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>
          Use esse valor para assinar os webhooks enviados pela plataforma. O SCAL valida cada requisição com HMAC-SHA256.
        </p>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: '#475569', wordBreak: 'break-all' }}>
          {cliente.webhook_secret}
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0' }}>
          Nunca compartilhe esse valor publicamente. Ele é único para sua conta.
        </p>
      </div>

      {/* Guias por plataforma */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Como configurar por plataforma</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {plataformas.map((p) => (
            <div
              key={p.nome}
              style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.cor, flexShrink: 0 }} />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{p.nome}</h4>
              </div>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.passos.map((passo, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{passo}</li>
                ))}
              </ol>
              {p.nota && (
                <p style={{ fontSize: 12, color: '#64748b', margin: '12px 0 0', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#475569' }}>Nota:</strong> {p.nota}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payload de exemplo */}
      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 12px' }}>Payload JSON aceito</h3>
        <pre style={{
          margin: 0, padding: '16px', background: '#0f172a', borderRadius: 10, overflowX: 'auto',
          fontSize: 12, lineHeight: 1.7, color: '#e2e8f0',
        }}>{`{
  "pedido_id": "KW-12345",       // obrigatório
  "valor": 97.00,                // obrigatório
  "status": "aprovado",          // aprovado | cancelado | reembolsado
  "scal_click": "uuid-do-click"  // opcional — atribuição manual
}`}</pre>
      </div>
    </div>
  )
}
