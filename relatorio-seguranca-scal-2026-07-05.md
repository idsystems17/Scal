# Relatório de Segurança — SCAL
Data da revisão: 2026-07-05
Revisado por: IDsistemas

## Resumo
Revisão completa do código-fonte (não apenas o diff pendente, já que a árvore de trabalho estava limpa e sincronizada com `origin/main` no commit `c0f5835`). Cobriu segredos expostos, controle de acesso, RLS, webhooks, autenticação e dependências. Foram encontrados 2 críticos, 2 altos e 4 médios — **todos corrigidos, testados e em produção** ao final desta rodada (commits `bdde6ba`, `271eded`, `0cb94c7`). Restam apenas itens 🔵 de infraestrutura/compliance já conhecidos, que dependem de decisão da usuária/do irmão.

## Achados

### 🔴 Crítico — ✅ corrigido

- **`/api/seed-dev` (GET, sem autenticação) estava live em produção** — `src/app/api/seed-dev/route.ts`. Usava a `service_role` key para recriar/resetar as 3 contas de teste (admin, cliente, parceiro) com senha fixa `Scal@2024` e retornava essas credenciais no corpo da resposta JSON, sem nenhum guard. **Corrigido**: exige `?token=` batendo com `SEED_DEV_TOKEN` (env var), fail-closed (404) se não configurado.

- **`/api/kiwify-webhook` não validava assinatura nenhuma** — `src/app/api/kiwify-webhook/route.ts`. Aceitava qualquer POST e podia ativar ou suspender a assinatura de qualquer cliente só com o email no payload. **Corrigido**: exige token (query string ou body) batendo com `KIWIFY_WEBHOOK_TOKEN`, fail-closed (401). Token ainda não configurado de propósito — aguardando o irmão da usuária configurar o webhook real no painel da Kiwify primeiro.

### 🟠 Alto — ✅ corrigido

- **Sem lockout progressivo no login.** **Corrigido**: login passou a rodar via `/api/login` no servidor (antes chamava o Supabase direto do navegador), com rate limit de 10 tentativas/15min por IP.
- **Rate limit em memória (`Map`), não distribuído entre instâncias da Vercel.** **Corrigido**: `checkRateLimit` agora usa a tabela `rate_limits` + função `checar_rate_limit` no Postgres do Supabase (migration `011_rate_limit.sql`), compartilhado entre todas as instâncias.

### 🟡 Médio — ✅ corrigido

- **`/api/cadastrar-cliente` sem rate limiting.** **Corrigido**: 5 tentativas/hora por IP.
- **Senha mínima de 6 caracteres só validada no client.** **Corrigido**: mínimo 8, validado também no servidor.
- **Enumeração de email no cadastro.** **Corrigido**: mensagem genérica que não confirma existência da conta.
- **`npm audit`: 2 vulnerabilidades moderadas em `postcss` (transitiva do Next).** **Corrigido** via `overrides` no `package.json` forçando `postcss@^8.5.10` em toda a árvore, sem downgrade do Next. `npm audit` limpo (0 vulnerabilidades).

### 🔵 Baixo / Boas práticas (pendentes, dependem de decisão da usuária/irmão)

- Supabase ainda em plano **Free — zero backup automático**. Bloqueante antes de vender para clientes reais além do irmão.
- **LGPD**: política de privacidade, termos de uso e endpoint de exclusão/exportação de dados ainda não existem.
- **Cópia externa de backup (regra 3-2-1)** documentada em `docs/backup-e-continuidade.md` mas intencionalmente não implementada — usuária optou por estudar o assunto e implementar ela mesma.
- `KIWIFY_WEBHOOK_TOKEN` ainda não configurado — aguardando o irmão chegar nessa etapa do teste.

## Correções aplicadas (antes / depois)

| Item | Arquivo/Regra alterada | Antes | Depois | Testado em dev? |
|---|---|---|---|---|
| `/api/seed-dev` sem auth | `src/app/api/seed-dev/route.ts` | Qualquer GET executava, sem checagem | Exige `?token=` = `SEED_DEV_TOKEN`, senão 404 | Sim — sem/com token errado (404), com token certo (200), e em produção |
| `/api/kiwify-webhook` sem auth | `src/app/api/kiwify-webhook/route.ts` | Qualquer POST ativava/suspendia cliente pelo email | Exige token = `KIWIFY_WEBHOOK_TOKEN`, senão 401 | Sim — sem token, token errado, token no body (todos 401 fail-closed) |
| Cadastro sem rate limit | `src/app/api/cadastrar-cliente/route.ts` | Sem limite de tentativas | 5/hora por IP (`checkRateLimit`) | Sim — 5 passam, 6ª bloqueia (429) |
| Senha fraca | `src/app/api/cadastrar-cliente/route.ts`, `src/app/(auth)/cadastro/page.tsx` | Mín. 6 chars só no client | Mín. 8 chars, validado no servidor | Sim — senha curta rejeitada (400) |
| Enumeração de email | `src/app/api/cadastrar-cliente/route.ts` | "Este email já está cadastrado" | Mensagem genérica | Sim |
| `npm audit` postcss | `package.json` (`overrides`) | postcss 8.4.31 (Next interno) | postcss 8.5.16 forçado via override | Sim — `npm audit` = 0 vulnerabilidades, build ok |
| Rate limit em memória | `src/lib/security/ratelimit.ts` + migration `011_rate_limit.sql` | `Map` local, não distribuído | Tabela `rate_limits` + RPC `checar_rate_limit` no Postgres | Sim — testado nas 4 rotas que usam rate limit |
| Sem lockout no login | `src/app/(auth)/login/page.tsx` + novo `src/app/api/login/route.ts` | Login direto client→Supabase, sem limite | Login via servidor, 10 tentativas/15min por IP | Sim — bloqueio na 11ª tentativa; login e sessão validados nos 3 papéis (admin/cliente/parceiro), incluindo proteção cross-role |

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
