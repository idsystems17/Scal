export interface KpiCard {
  label: string
  value: string
  delta: string
  deltaPositive: boolean
  sub: string
  icon: string
}

export interface ParceiroDashboard {
  pageTitle: string
  pageDesc: string
  kpis: KpiCard[]
  trendData: {
    labels: string[]
    cliques: number[]
    vendas: number[]
  }
  liveFeed: Array<{
    value: string
    channel: string
    time: string
    color: string
  }>
  channels: Array<{
    name: string
    abbr: string
    url: string
    clicks: number
    conversoes: number
    ctr: string
    ctrPositive: boolean
    volume: string
  }>
}

export interface ClienteDashboard {
  tenant_id: string
  webhook_status: 'connected' | 'disconnected'
  metrics: {
    faturamento_total_scal: number
    parceiros_ativos: number
    parceiros_totais: number
    taxa_conversao_media: number
    ticket_medio: number
  }
  top_parceiros: Array<{
    nome: string
    codigo: string
    vendas: number
    total_faturado: number
    pct: number
  }>
  canal_receita: Array<{
    label: string
    pct: number
    color: string
  }>
  alertas_performance: Array<{
    parceiro_id: string
    nome: string
    motivo: string
  }>
  parceiros: Array<{
    nome: string
    codigo: string
    clicks: number
    sales: number
    revenue: number
    status: 'top' | 'ativo' | 'baixa_conversao' | 'inativo'
  }>
}

export interface AdminDashboard {
  kpis: KpiCard[]
  alertas_plano: Array<{
    id: string
    cliente_nome: string
    tipo: 'limite_parceiros' | 'limite_faturamento'
    valor_atual: string
    limite: string
    resolvido: boolean
  }>
  tenants: Array<{
    nome: string
    plataforma: string
    parceiros: number
    limite_parceiros: number
    faturamento: number
    webhook_status: 'connected' | 'disconnected'
  }>
  anomalias: Array<{
    descricao: string
    tempo: string
    loja: string
  }>
  monitorData: {
    labels: string[]
    sucesso: number[]
    erros: number[]
  }
}
