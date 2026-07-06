import { adminClient } from '@/lib/supabase/admin'
import { getEvolucaoFaturamentoMensal } from '@/lib/actions/admin'
import { FaturamentoChart } from '@/components/dashboard/FaturamentoChart'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { BarRanking } from '@/components/dashboard/BarRanking'

const PRECO_ANUAL_ASSINATURA = 349.0
const LIMITE_FATURAMENTO_TAXA = 50000
const PERCENTUAL_TAXA = 0.005

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
const brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

function statTileStyle(): React.CSSProperties {
  return { background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
}

export default async function FinanceiroPage() {
  const [{ data: tenants }, evolucaoMensal, { data: vendasConfirmadas }] = await Promise.all([
    adminClient
      .from('vw_admin_dashboard')
      .select('cliente_id, nome_loja, status, faturamento_acumulado_scal')
      .order('faturamento_acumulado_scal', { ascending: false }),
    getEvolucaoFaturamentoMensal(),
    adminClient.from('conversoes').select('cliente_id').eq('status', 'confirmada'),
  ])

  const vendasPorCliente = new Map<string, number>()
  for (const v of vendasConfirmadas ?? []) {
    const id = v.cliente_id as string
    vendasPorCliente.set(id, (vendasPorCliente.get(id) ?? 0) + 1)
  }

  const empresas = tenants ?? []
  const empresasPagantes = empresas.filter(e => e.status === 'ativo')
  const receitaAssinaturasAno = empresasPagantes.length * PRECO_ANUAL_ASSINATURA
  const receitaAssinaturasMes = receitaAssinaturasAno / 12

  const empresasComTaxa = empresas.map(e => {
    const faturamento = Number(e.faturamento_acumulado_scal ?? 0)
    const excedente = Math.max(0, faturamento - LIMITE_FATURAMENTO_TAXA)
    const taxaDevida = excedente * PERCENTUAL_TAXA
    return { ...e, faturamento, taxaDevida }
  })

  const taxaAcumuladaTotal = empresasComTaxa.reduce((s, e) => s + e.taxaDevida, 0)

  const totalVendasConfirmadas = evolucaoMensal.reduce((s, m) => s + m.vendas, 0)
  const totalVendasCanceladas = evolucaoMensal.reduce((s, m) => s + m.canceladas, 0)
  const totalVendas = totalVendasConfirmadas + totalVendasCanceladas
  const donutStatusVendas = totalVendas === 0 ? [] : [
    { label: 'Confirmadas', pct: Math.round((totalVendasConfirmadas / totalVendas) * 100), color: '#9B6AFF' },
    { label: 'Canceladas', pct: Math.round((totalVendasCanceladas / totalVendas) * 100), color: '#C2A4FF' },
  ]

  const maiorFaturamento = Math.max(1, ...empresasComTaxa.map(e => e.faturamento))
  const rankingEmpresas = empresasComTaxa.slice(0, 8).map(e => ({
    nome: e.nome_loja ?? 'E-commerce',
    codigo: e.status === 'suspenso' ? 'Suspenso' : e.status === 'trial' ? 'Trial' : e.status === 'cancelado' ? 'Cancelado' : 'Ativo',
    vendas: vendasPorCliente.get(String(e.cliente_id)) ?? 0,
    total_faturado: e.faturamento,
    pct: Math.round((e.faturamento / maiorFaturamento) * 100),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Financeiro</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Assinatura anual de {brl.format(PRECO_ANUAL_ASSINATURA)} por e-commerce (cobrada via Kiwify) + taxa de {(PERCENTUAL_TAXA * 100).toFixed(1)}% sobre o faturamento processado acima de {brl0.format(LIMITE_FATURAMENTO_TAXA)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={statTileStyle()}>
          <span style={{ fontSize: 13, color: '#64748b' }}>E-commerces pagantes</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0B081A', marginTop: 8 }}>{empresasPagantes.length}</div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>de {empresas.length} cadastradas no total</span>
        </div>
        <div style={statTileStyle()}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Assinaturas (ARR estimado)</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0B081A', marginTop: 8 }}>{brl0.format(receitaAssinaturasAno)}</div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{brl0.format(receitaAssinaturasMes)}/mês equivalente</span>
        </div>
        <div style={statTileStyle()}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Taxa de uso acumulada</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0B081A', marginTop: 8 }}>{brl.format(taxaAcumuladaTotal)}</div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>0,5% sobre excedente de todos os e-commerces</span>
        </div>
        <div style={statTileStyle()}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Faturamento total processado</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0B081A', marginTop: 8 }}>
            {brl0.format(empresasComTaxa.reduce((s, e) => s + e.faturamento, 0))}
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>via todos os e-commerces no SCAL</span>
        </div>
      </div>

      <FaturamentoChart data={evolucaoMensal} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <DonutChart data={donutStatusVendas} />
        <BarRanking
          items={rankingEmpresas}
          titulo="Top e-commerces por faturamento"
          subtitulo="Ranking pelo faturamento acumulado processado via SCAL"
        />
      </div>

      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Taxa de uso por e-commerce</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Calculada sobre o faturamento acumulado processado via SCAL</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>E-COMMERCE</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>STATUS</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>FATURAMENTO PROCESSADO</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>TAXA DEVIDA</th>
              </tr>
            </thead>
            <tbody>
              {empresasComTaxa.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Nenhum e-commerce cadastrado.</td></tr>
              )}
              {empresasComTaxa.map(e => (
                <tr key={e.cliente_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#0B081A' }}>{e.nome_loja}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: e.status === 'suspenso' ? '#fff1f3' : e.status === 'trial' ? '#fef3c7' : '#ecfdf3',
                      color: e.status === 'suspenso' ? '#e11d48' : e.status === 'trial' ? '#d97706' : '#16a34a',
                    }}>
                      {e.status === 'suspenso' ? 'Suspenso' : e.status === 'trial' ? 'Trial' : e.status === 'cancelado' ? 'Cancelado' : 'Ativo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: '#0B081A' }}>{brl0.format(e.faturamento)}</td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: e.taxaDevida > 0 ? '#0B081A' : '#94a3b8' }}>
                    {e.taxaDevida > 0 ? brl.format(e.taxaDevida) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
