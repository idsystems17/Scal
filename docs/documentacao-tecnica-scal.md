# Documentação Técnica — SCAL

Data: 2026-07-05
Versão do sistema: MVP em produção

## 1. Visão geral

O SCAL é uma plataforma SaaS multi-tenant de **rastreamento de atribuição de vendas por parceiro/afiliado**. Uma empresa contrata o SCAL, convida parceiros (afiliados), cada parceiro gera links únicos de divulgação, e o sistema identifica automaticamente qual parceiro originou cada venda confirmada.

**O que o SCAL faz:**
- Gera links de rastreamento únicos por parceiro/canal
- Identifica a origem de uma venda via cookie de atribuição (30 dias) e/ou parâmetro de URL
- Recebe a confirmação da venda via webhook da plataforma de pagamento da empresa (ex: Kiwify)
- Exibe relatórios de volume de vendas por parceiro, por canal e por período
- Cobra automaticamente uma taxa de uso de 0,5% sobre o faturamento processado, acima de R$ 50.000 acumulados

**O que o SCAL não faz:**
- Não processa pagamentos
- Não calcula nem paga comissão a parceiros — isso é acordado e pago diretamente entre a empresa e o parceiro, fora da plataforma

## 2. Stack e arquitetura

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Hospedagem | Vercel |
| Banco de dados + Auth | Supabase (Postgres + Supabase Auth) |
| IA (Central de Ajuda) | Google Gemini (`gemini-3.5-flash`, com fallback) |
| Repositório | `github.com/idsystems17/Scal` |
| URL de produção | `https://scal-sigma.vercel.app` (domínio próprio `scal.admw.com.br` planejado, ainda não configurado) |

### Estrutura de pastas (resumida)

```
src/
  app/
    (auth)/          → login, cadastro (públicas)
    (legal)/          → política de privacidade, termos de uso (públicas)
    admin/            → painel do admin (dono do SCAL)
    dashboard/        → painel da empresa cliente
    minha-area/       → painel do parceiro/afiliado
    api/              → rotas de servidor (webhooks, login, cadastro, etc.)
    r/[codigo]/       → redirecionador de link de afiliado (rastreamento de clique)
    webhook/[cliente_id]/ → recebe confirmação de venda da plataforma de pagamento
  lib/
    actions/          → server actions por papel (admin, cliente, parceiro)
    supabase/         → clientes Supabase (browser, server, admin/service_role)
    security/         → HMAC, hash de IP, rate limit
  components/
    dashboard/        → componentes de gráficos, tabelas, paginação
    layout/           → Sidebar, Header
  proxy.ts            → middleware de autenticação/autorização por papel
supabase/migrations/  → histórico completo do schema do banco (SQL)
docs/                 → documentação de apoio (este arquivo, LGPD, backup)
```

## 3. Papéis de usuário

O SCAL tem três papéis, controlados por `user_metadata.role` no Supabase Auth e reforçados pelo middleware (`src/proxy.ts`):

| Papel | Quem é | Área |
|---|---|---|
| `admin` | Dono/operador do SCAL (seu irmão) | `/admin` |
| `cliente` | Empresa que contratou o SCAL | `/dashboard` |
| `parceiro` | Afiliado/parceiro de uma empresa | `/minha-area` |

Cada papel só acessa a própria área — o middleware redireciona para `/login` qualquer tentativa de acessar uma área de outro papel.

### 3.1 Admin — visão geral do sistema

Páginas: Overview, Alertas de plano, Empresas ativas, Materiais, Segurança, Infraestrutura, Financeiro, Suporte.

- Enxerga todas as empresas cadastradas, pode suspender/reativar
- Vê e resolve alertas de limite de faturamento/parceiros excedido
- Aplica a taxa de 0,5% quando uma empresa ultrapassa R$ 50.000
- Monitora cliques em tempo real e tentativas de webhook com assinatura inválida (página Segurança)
- Cadastra materiais de marketing globais (visíveis a todos os parceiros)

### 3.2 Cliente (empresa contratante)

Páginas: Dashboard, Parceiros, Vendas, Canais, Materiais, Integrações, Configurações, Suporte.

- Convida parceiros por link de convite com token (expira em 7 dias)
- Bloqueia/reativa parceiros
- Configura o webhook (URL + chave secreta) da sua plataforma de vendas
- Acompanha vendas, filtra por período e busca por pedido
- Cadastra materiais de marketing próprios (visíveis só aos parceiros dela)

### 3.3 Parceiro (afiliado)

Páginas: Visão geral, Meus links, Conversões, Comissões, Materiais, Suporte.

- Gera links de divulgação por canal (Instagram, WhatsApp, etc.)
- Acompanha cliques e vendas atribuídas a ele em tempo real
- Vê o volume gerado (não é o SCAL quem paga a comissão — isso é combinado com a empresa)

## 4. Fluxo principal (ponta a ponta)

1. Empresa se cadastra (`/cadastro`) → cria conta com papel `cliente`, status `trial`
2. Empresa convida um parceiro → parceiro recebe link de convite, cria conta com papel `parceiro`
3. Parceiro gera um link por canal (`/minha-area/links`) → sistema gera código único (`/r/CODIGO`)
4. Alguém clica no link → `src/app/r/[codigo]/route.ts` grava o clique (`cliques`), seta cookie de atribuição de 30 dias, redireciona para a URL de destino
5. Comprador finaliza a compra na plataforma de pagamento da empresa (ex: Kiwify)
6. A plataforma de pagamento envia um webhook para `src/app/webhook/[cliente_id]/route.ts`, assinado com HMAC-SHA256
7. O sistema valida a assinatura, identifica o parceiro pelo `click_id` (cookie ou parâmetro `scal_click` na URL), registra a conversão (`conversoes`) e atualiza o faturamento acumulado da empresa
8. Se o faturamento acumulado ultrapassar R$ 50.000, o sistema cria um alerta de plano automaticamente

## 5. Modelo de dados (tabelas principais)

| Tabela | Finalidade |
|---|---|
| `admins` | Contas com papel admin |
| `clientes` | Empresas contratantes — inclui `webhook_secret`, `faturamento_acumulado_scal`, `status` |
| `parceiros` | Afiliados vinculados a uma empresa |
| `links` | Links de rastreamento gerados por parceiro/canal |
| `cliques` | Registro de cada clique (IP hasheado, user-agent, referrer) |
| `conversoes` | Vendas confirmadas, vinculadas a clique/parceiro quando identificável |
| `alertas_plano` | Alertas de limite de faturamento/parceiros excedido |
| `convites` | Convites de parceiro com token e expiração |
| `materiais` | Materiais de marketing (links externos), globais ou por empresa |
| `audit_log` | Log de ações administrativas |
| `eventos` | Log operacional (webhooks recebidos, erros, conversões) |
| `rate_limits` | Contadores de limite de tentativas (login, cadastro, cliques, webhook) |

Todas as tabelas têm **Row Level Security (RLS)** habilitado — cada empresa só enxerga seus próprios dados, cada parceiro só os seus.

## 6. Segurança implementada

- Autenticação via Supabase Auth, sessão por cookie httpOnly
- RLS em todas as 12 tabelas
- Senhas nunca armazenadas em texto puro (Supabase Auth cuida disso)
- Webhook de vendas validado por assinatura HMAC-SHA256 com comparação *timing-safe*, com idempotência (mesma venda não é processada duas vezes)
- IP de visitantes armazenado apenas como hash (SHA-256 + sal), nunca em texto puro
- Rate limiting distribuído (via tabela `rate_limits` no Postgres) em: login (10 tentativas/15min por IP), cadastro (5/hora por IP), clique em link (60/min por IP), webhook (100/min por cliente)
- Rotas administrativas sensíveis (`/api/seed-dev`, `/api/kiwify-webhook`) protegidas por token compartilhado, fail-closed se não configurado
- Revisão de segurança completa realizada em 2026-07-05 (ver `relatorio-seguranca-scal-2026-07-05.md`) — todos os achados corrigidos

## 7. Integrações externas

| Serviço | Uso | Onde configurar |
|---|---|---|
| Supabase | Banco de dados, autenticação | `.env.local` / Vercel env vars |
| Vercel | Hospedagem, deploy automático a cada push no `main` | Painel Vercel |
| Kiwify | Origem dos webhooks de venda (por empresa) e, futuramente, webhook de assinatura do próprio SCAL | Painel de cada empresa cliente / painel do SCAL |
| Google Gemini | Chat de IA da Central de Ajuda | `GEMINI_API_KEY` |

## 8. Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexão pública com Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Acesso privilegiado (nunca exposto ao navegador) |
| `WEBHOOK_HMAC_SALT` | Sal usado no hash de IP |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação |
| `GEMINI_API_KEY` | Chave da IA da Central de Ajuda |
| `SEED_DEV_TOKEN` | Protege a rota de recriação de dados de teste |
| `KIWIFY_WEBHOOK_TOKEN` | Protege o webhook de assinatura da Kiwify (ainda não configurado) |

## 9. Deploy

O deploy é automático: todo push para `main` no GitHub dispara um build e deploy na Vercel. Migrations do banco (pasta `supabase/migrations/`) são aplicadas manualmente no SQL Editor do Supabase — não há pipeline automático de migration ainda.

## 10. Pendências conhecidas

- Webhook de assinatura da Kiwify (pagamento do próprio SCAL) — aguardando o irmão configurar no painel deles
- Domínio próprio `scal.admw.com.br` — aguardando configuração de DNS
- Página Financeiro (admin) — preço já definido (R$ 349,00/ano), falta implementar no painel
- Backup: Supabase em plano Free (zero backup automático) — upgrade para Pro é obrigatório antes de vender para clientes reais
- Cópia externa de backup (regra 3-2-1) e cron de exclusão por prazo de retenção LGPD — documentados, aguardando estudo/decisão da responsável técnica antes de implementar
- `/api/seed-dev` — remover ou manter protegido por token permanentemente antes do lançamento público
- Cobrança variável de 0,5% via Asaas (boleto/Pix sobre valor atribuído acima de R$ 50 mil) — briefing em `docs/briefing-cobranca-asaas-scal.md`, não é prioridade imediata, aguarda validação do restante do SCAL e decisão sobre 4 perguntas em aberto (cobrança automática vs. aprovação manual, prazo de vencimento, régua de atraso, cálculo mensal vs. por venda)
