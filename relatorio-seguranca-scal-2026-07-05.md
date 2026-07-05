# Relatório de Segurança — SCAL
Data da revisão: 2026-07-05
Revisado por: IDsistemas

## Resumo
Revisão completa do código-fonte (não apenas o diff pendente, já que a árvore de trabalho está limpa e sincronizada com `origin/main` no commit `c0f5835`). Cobriu segredos expostos, controle de acesso, RLS, webhooks, autenticação e dependências. Foram encontrados **2 problemas críticos** que expõem o sistema em produção a acesso não autorizado, e alguns pontos de dureza recomendados antes da venda para clientes reais.

## Achados

### 🔴 Crítico

- **`/api/seed-dev` (GET, sem autenticação) está live em produção** — `src/app/api/seed-dev/route.ts`. Usa a `service_role` key para recriar/resetar as 3 contas de teste (admin, cliente, parceiro) com senha fixa `Scal@2024` e **retorna essas credenciais no corpo da resposta JSON**. Não há nenhum guard de ambiente (`NODE_ENV`, flag, IP allowlist). Qualquer pessoa que descubra a URL `https://scal-sigma.vercel.app/api/seed-dev` ganha acesso admin ao sistema. **Ação recomendada: remover a rota (ou protegê-la atrás de uma variável de ambiente que só existe em dev) antes de qualquer venda real.**

- **`/api/kiwify-webhook` não valida assinatura nenhuma** — `src/app/api/kiwify-webhook/route.ts`. Ao contrário do webhook de vendas (`/webhook/[cliente_id]`, que valida HMAC-SHA256), este endpoint aceita qualquer POST e usa `service_role` para: (a) ativar (`status: 'ativo'`) a assinatura de qualquer cliente cujo email seja informado no payload — bypass de pagamento; (b) suspender (`status: 'suspenso'`) a conta de qualquer cliente existente só sabendo o email dele — negação de serviço no negócio do irmão da usuária. **Ação recomendada: adicionar validação de assinatura do Kiwify (a Kiwify assina webhooks — checar docs deles) antes de ativar essa integração de verdade.**

### 🟠 Alto

- **Sem lockout progressivo no login** (`src/app/(auth)/login/page.tsx`) além do que o Supabase Auth oferece nativamente no plano Free. Sem rate limit próprio por email/IP na aplicação.
- **Rate limit em memória (`Map`), não distribuído** — `src/lib/security/ratelimit.ts`. Funciona por instância serverless da Vercel; não sobrevive a cold start nem é compartilhado entre instâncias. O limite de 100 req/min por cliente no webhook de vendas é, na prática, mais permissivo do que parece.

### 🟡 Médio

- **`/api/cadastrar-cliente` (self-signup público) sem rate limiting** — pode ser usado para spam de contas trial ou esgotar cota do Supabase Auth.
- **Política de senha fraca**: mínimo de 6 caracteres, validado só no client (`minLength={6}` no input do formulário de cadastro). O servidor aceita qualquer senha não vazia.
- **Enumeração de email no cadastro**: mensagem "Este email já está cadastrado" confirma existência de conta (risco baixo, mas é informação gratuita para um atacante).
- **`npm audit`**: 2 vulnerabilidades moderadas em `postcss <8.5.10` (XSS via stringify de CSS), trazidas transitivamente pelo Next.js. Corrigir exigiria downgrade do Next (`next audit fix --force` sugere voltar para `next@9.3.3`) — não recomendado. Risco real é baixo (ferramenta de build, não exposta a input do usuário em runtime), mas vale monitorar por uma atualização do Next que resolva sem downgrade.

### 🔵 Baixo / Boas práticas (já conhecidos, reforçando)

- Supabase ainda em plano **Free — zero backup automático**. Bloqueante antes de vender para clientes reais além do irmão.
- **LGPD**: política de privacidade, termos de uso e endpoint de exclusão/exportação de dados ainda não existem.
- **Cópia externa de backup (regra 3-2-1)** documentada em `docs/backup-e-continuidade.md` mas intencionalmente não implementada — usuária optou por estudar o assunto e implementar ela mesma.

## Correções aplicadas (antes / depois)

| Item | Arquivo/Regra alterada | Antes | Depois | Testado em dev? |
|---|---|---|---|---|
| — | — | — | Nenhuma correção aplicada nesta sessão (revisão apenas) | — |

> Nenhum item foi corrigido automaticamente. Os dois pontos 🔴 críticos envolvem decisão de produto (remover rota de seed vs. proteger por ambiente; como/quando validar o webhook real da Kiwify) — melhor confirmar com você antes de mexer, já que podem afetar o fluxo de teste que você ainda usa.

## O que foi verificado e está OK

- `.env*` corretamente listado no `.gitignore`; nenhum arquivo de ambiente ou segredo foi commitado (histórico do git checado, não só o estado atual)
- Nenhuma chave/token/senha hardcoded encontrada no código-fonte
- `SUPABASE_SERVICE_ROLE_KEY` usada apenas em `src/lib/supabase/admin.ts`, importado somente por Server Components, Server Actions (`'use server'`) e Route Handlers — nunca em componente client, nunca exposta no bundle público
- RLS habilitado nas 11 tabelas do schema (`clientes`, `parceiros`, `links`, `cliques`, `conversoes`, `alertas_plano`, `convites`, `audit_log`, `eventos`, `admins`, `materiais`)
- Webhook de vendas (`/webhook/[cliente_id]`) valida HMAC-SHA256 com comparação timing-safe, rate limit e idempotência por `pedido_externo_id`
- `/api/criar-convite` e `/api/webhook-test/[cliente_id]` validam que o usuário autenticado é dono do `cliente_id` antes de agir (sem IDOR)
- Middleware (`src/proxy.ts`) redireciona sessões ausentes ou com role incorreta para `/login` nas rotas de página
- Mensagens de erro de login genéricas ("Email ou senha inválidos"), sem stack trace nem detalhe técnico exposto
- Sem `console.log` vazando dados sensíveis
- Correção de XSS via `javascript:` em URL de materiais (aplicada na sessão anterior) confirmada em vigor em `src/lib/validarUrlMaterial.ts`, usada nas duas server actions de criação de material
- HTTPS garantido pelo deploy padrão da Vercel

## Observação
Esta revisão segue um checklist estruturado de segurança aplicável a aplicações web modernas (Next.js/Vercel/Supabase). Nenhum sistema é 100% imune a falhas — esta análise reduz significativamente o risco mas não constitui garantia absoluta.
