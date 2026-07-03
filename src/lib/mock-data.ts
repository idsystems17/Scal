import { ParceiroDashboard, ClienteDashboard, AdminDashboard } from '@/types/dashboard'

export const MOCK_PARCEIRO: ParceiroDashboard = {
  pageTitle: 'Olá, Marina',
  pageDesc: 'Acompanhe o desempenho dos seus links',
  kpis: [
    { label: 'Cliques totais', value: '8.432', delta: '15,5%', deltaPositive: true, sub: 'vs. anterior', icon: 'click' },
    { label: 'Vendas atribuídas', value: '214', delta: '8,4%', deltaPositive: true, sub: 'vs. anterior', icon: 'cart' },
    { label: 'Volume de vendas', value: 'R$ 48.720', delta: '11,2%', deltaPositive: true, sub: 'vs. anterior', icon: 'wallet' },
    { label: 'Taxa de conversão', value: '2,54%', delta: '0,30 pp', deltaPositive: false, sub: 'vs. anterior', icon: 'percent' },
  ],
  trendData: {
    labels: ['01', '05', '09', '13', '17', '21', '25', '29'],
    cliques: [774, 885, 821, 1058, 967, 1170, 1068, 1240],
    vendas: [12, 16, 14, 22, 19, 24, 21, 23],
  },
  liveFeed: [
    { value: 'R$ 289', channel: 'Instagram', time: 'há 4 minutos', color: '#db2777' },
    { value: 'R$ 132', channel: 'WhatsApp', time: 'há 12 minutos', color: '#16a34a' },
    { value: 'R$ 540', channel: 'Instagram', time: 'há 26 minutos', color: '#db2777' },
    { value: 'R$ 97', channel: 'YouTube', time: 'há 41 minutos', color: '#dc2626' },
    { value: 'R$ 214', channel: 'WhatsApp', time: 'há 1 hora', color: '#16a34a' },
  ],
  channels: [
    { name: 'Instagram', abbr: 'IG', url: 'scal.co/mel/ig', clicks: 3120, conversoes: 92, ctr: '2,95%', ctrPositive: true, volume: 'R$ 21.340' },
    { name: 'WhatsApp', abbr: 'WA', url: 'scal.co/mel/wa', clicks: 2180, conversoes: 68, ctr: '3,12%', ctrPositive: true, volume: 'R$ 15.870' },
    { name: 'YouTube', abbr: 'YT', url: 'scal.co/mel/yt', clicks: 1520, conversoes: 31, ctr: '2,04%', ctrPositive: true, volume: 'R$ 6.420' },
    { name: 'TikTok', abbr: 'TT', url: 'scal.co/mel/tt', clicks: 980, conversoes: 15, ctr: '1,53%', ctrPositive: false, volume: 'R$ 3.210' },
    { name: 'Bio Link', abbr: 'BL', url: 'scal.co/mel/bio', clicks: 632, conversoes: 8, ctr: '1,27%', ctrPositive: false, volume: 'R$ 1.880' },
  ],
}

export const MOCK_CLIENTE: ClienteDashboard = {
  tenant_id: 'uuid-loja-verao',
  webhook_status: 'connected',
  metrics: {
    faturamento_total_scal: 312480,
    parceiros_ativos: 42,
    parceiros_totais: 58,
    taxa_conversao_media: 3.1,
    ticket_medio: 227,
  },
  top_parceiros: [
    { nome: 'Marina Alves', codigo: 'SCAL-MAL', vendas: 118, total_faturado: 48720, pct: 100 },
    { nome: 'João Prado', codigo: 'SCAL-JPR', vendas: 94, total_faturado: 39140, pct: 80 },
    { nome: 'Bianca Costa', codigo: 'SCAL-BCO', vendas: 71, total_faturado: 31560, pct: 65 },
    { nome: 'Diego Ramos', codigo: 'SCAL-DRA', vendas: 12, total_faturado: 24980, pct: 51 },
    { nome: 'Lucas Pinto', codigo: 'SCAL-LPI', vendas: 41, total_faturado: 18640, pct: 38 },
  ],
  canal_receita: [
    { label: 'Instagram', pct: 46, color: '#2563eb' },
    { label: 'WhatsApp', pct: 27, color: '#0ea5e9' },
    { label: 'YouTube', pct: 15, color: '#7c3aed' },
    { label: 'TikTok', pct: 12, color: '#14b8a6' },
  ],
  alertas_performance: [
    { parceiro_id: 'uuid-3', nome: 'Diego Ramos', motivo: 'Baixa conversão: 5.620 cliques e apenas 12 vendas' },
  ],
  parceiros: [
    { nome: 'Marina Alves', codigo: 'SCAL-MAL', clicks: 4210, sales: 118, revenue: 48720, status: 'top' },
    { nome: 'João Prado', codigo: 'SCAL-JPR', clicks: 3980, sales: 94, revenue: 39140, status: 'ativo' },
    { nome: 'Bianca Costa', codigo: 'SCAL-BCO', clicks: 3120, sales: 71, revenue: 31560, status: 'ativo' },
    { nome: 'Diego Ramos', codigo: 'SCAL-DRA', clicks: 5620, sales: 12, revenue: 24980, status: 'baixa_conversao' },
    { nome: 'Lucas Pinto', codigo: 'SCAL-LPI', clicks: 1240, sales: 41, revenue: 18640, status: 'ativo' },
    { nome: 'Rafa Nunes', codigo: 'SCAL-RNU', clicks: 90, sales: 0, revenue: 0, status: 'inativo' },
  ],
}

export const MOCK_ADMIN: AdminDashboard = {
  kpis: [
    { label: 'MRR (recorrente)', value: 'R$ 84.200', delta: '6,3%', deltaPositive: true, sub: 'do SaaS', icon: 'mrr' },
    { label: 'GMV rastreado', value: 'R$ 4,82M', delta: '12,1%', deltaPositive: true, sub: 'todas as lojas', icon: 'globe' },
    { label: 'Cliques (24h)', value: '182.400', delta: '4,8%', deltaPositive: true, sub: 'requisições', icon: 'activity' },
    { label: 'Alertas de plano', value: '7', delta: 'ação manual', deltaPositive: false, sub: 'pendentes', icon: 'alert' },
  ],
  alertas_plano: [
    { id: 'a1', cliente_nome: 'Loja Verão', tipo: 'limite_parceiros', valor_atual: '23 parceiros', limite: '20 parceiros', resolvido: false },
    { id: 'a2', cliente_nome: 'Loja Y', tipo: 'limite_faturamento', valor_atual: 'R$ 104.500', limite: 'R$ 100.000', resolvido: false },
    { id: 'a3', cliente_nome: 'Loja Tech', tipo: 'limite_parceiros', valor_atual: '19 parceiros', limite: '20 parceiros', resolvido: false },
  ],
  tenants: [
    { nome: 'Loja Verão', plataforma: 'Shopify', parceiros: 23, limite_parceiros: 20, faturamento: 104500, webhook_status: 'connected' },
    { nome: 'Loja Tech', plataforma: 'WooCommerce', parceiros: 19, limite_parceiros: 20, faturamento: 88200, webhook_status: 'connected' },
    { nome: 'Loja Kids', plataforma: 'Nuvemshop', parceiros: 12, limite_parceiros: 20, faturamento: 41900, webhook_status: 'disconnected' },
    { nome: 'Loja Fit', plataforma: 'Shopify', parceiros: 31, limite_parceiros: 50, faturamento: 156300, webhook_status: 'connected' },
    { nome: 'Loja Pet', plataforma: 'VTEX', parceiros: 8, limite_parceiros: 20, faturamento: 22400, webhook_status: 'disconnected' },
  ],
  anomalias: [
    { descricao: 'IP [a3f9…] gerou 500 cliques no link do Parceiro X em menos de 1 minuto', tempo: 'há 3 min', loja: 'Loja Verão' },
    { descricao: '312 cliques do mesmo device/UA no Parceiro Z', tempo: 'há 18 min', loja: 'Loja Fit' },
    { descricao: '4 vendas atribuídas ao mesmo cartão em 2 min', tempo: 'há 44 min', loja: 'Loja Tech' },
  ],
  monitorData: {
    labels: ['00h', '', '06h', '', '12h', '', '18h', '24h'],
    sucesso: [7840, 9184, 6944, 10080, 9520, 11200, 8736, 10528],
    erros: [96, 77, 576, 128, 102, 179, 115, 90],
  },
}
