import { adminClient } from '@/lib/supabase/admin'
import { IntegracaoChecklist } from '@/components/dashboard/IntegracaoChecklist'

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'

export const dynamic = 'force-dynamic'

export default async function AdminIntegracaoPage() {
  const { data: clientes } = await adminClient
    .from('clientes')
    .select('id, nome_loja, webhook_secret')
    .order('nome_loja', { ascending: true })

  const empresas = (clientes ?? []).map(c => ({
    id: c.id as string,
    nome: (c.nome_loja as string) ?? 'E-commerce',
    webhookSecret: c.webhook_secret as string,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Integração — checkout próprio</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Para e-commerces que não usam Kiwify/Hotmart/Eduzz — gere e envie as instruções técnicas prontas para o dev deles
        </p>
      </div>

      <IntegracaoChecklist empresas={empresas} appUrl={appUrl} />
    </div>
  )
}
