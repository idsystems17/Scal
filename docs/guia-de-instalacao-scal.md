# Guia de instalação — SCAL

Passo a passo para colocar o sistema no ar na sua própria conta, a partir do arquivo `scal-entrega.zip`. Não precisa entender de programação para seguir os passos — é só copiar e colar os comandos indicados.

---

## O que você vai precisar antes de começar

- Uma conta no **GitHub** (github.com) — gratuita. Se não tiver, crie uma antes de continuar.
- Uma conta na **Vercel** (vercel.com) — gratuita, e dá pra criar direto com login do GitHub.
- O **Git** instalado no computador — se não tiver, baixe em [git-scm.com/downloads](https://git-scm.com/downloads) e instale (próximo, próximo, concluir).
- Sua conta do **Supabase**, que já está configurada com os dados do sistema (não precisa mexer nela agora).

---

## Passo 1 — Extrair o arquivo

Descompacte o `scal-entrega.zip` em uma pasta no seu computador (ex: `Documentos\scal`). Dentro dela vão aparecer as pastas e arquivos do sistema.

## Passo 2 — Criar o repositório no GitHub

1. Entre em [github.com/new](https://github.com/new)
2. Dê um nome ao repositório (ex: `scal`)
3. Deixe marcado como **Private** (privado)
4. **Não** marque nenhuma opção de "adicionar README" ou ".gitignore" — o repositório precisa ficar vazio
5. Clique em "Create repository"
6. Na tela seguinte, copie o endereço que aparece (algo como `https://github.com/seu-usuario/scal.git`) — vai precisar dele no próximo passo

## Passo 3 — Subir os arquivos pro repositório

Abra o terminal (no Windows, procure por "PowerShell" ou "Prompt de Comando" no menu iniciar) dentro da pasta onde você extraiu os arquivos, e rode estes comandos, um de cada vez:

```
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/scal.git
git push -u origin main
```

Troque `https://github.com/seu-usuario/scal.git` pelo endereço que você copiou no passo anterior.

Se o terminal pedir login do GitHub, siga as instruções na tela (normalmente abre o navegador para você confirmar).

## Passo 4 — Criar o projeto na Vercel

1. Entre em [vercel.com/new](https://vercel.com/new) e faça login (pode usar a mesma conta do GitHub)
2. Clique em "Import" no repositório que você acabou de criar
3. **Antes de clicar em "Deploy"**, abra a seção "Environment Variables" (variáveis de ambiente) e cadastre estas (uma por linha, nome e valor):

| Nome | Onde conseguir o valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Painel do Supabase → Settings → API → "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Painel do Supabase → Settings → API → "anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | Painel do Supabase → Settings → API → "service_role" (cuidado: essa é secreta, não compartilhar) |
| `GEMINI_API_KEY` | A chave que você já gerou na sua conta Gemini |
| `WEBHOOK_HMAC_SALT` | Qualquer texto aleatório e longo (ex: peça pra alguém gerar com o comando `openssl rand -hex 32`, ou use qualquer gerador de senha grande) |
| `SEED_DEV_TOKEN` | Mesma ideia acima — um texto aleatório e longo, guarde ele anotado |
| `NEXT_PUBLIC_APP_URL` | Deixe em branco por enquanto — depois do primeiro deploy a Vercel mostra o endereço do site, aí você volta aqui e preenche com esse endereço |
| `KIWIFY_WEBHOOK_TOKEN` | Deixe em branco por enquanto — só preencher quando configurar o webhook da Kiwify (ver `docs/pendencias-scal.md`, item 2) |

4. Clique em **Deploy** e aguarde alguns minutos

## Passo 5 — Testar

Depois que o deploy terminar, a Vercel mostra o endereço do site (algo como `scal-xxxx.vercel.app`). Acesse esse endereço e teste o login com as contas de exemplo:

- `admin@scal.dev` / `Scal@2024`
- `cliente@scal.dev` / `Scal@2024`
- `parceiro@scal.dev` / `Scal@2024`

Se conseguir entrar normalmente nas três, o sistema está no ar e funcionando na sua conta.

## Passo 6 — Depois de confirmar que está tudo certo

- Volte na Vercel e preencha `NEXT_PUBLIC_APP_URL` com o endereço real do site (Settings → Environment Variables → editar → salvar → fazer um novo deploy pra aplicar)
- Quando terminar todos os seus próprios testes, existe uma limpeza automática dos dados de exemplo — veja o item 5 do arquivo `docs/pendencias-scal.md`
- O arquivo `docs/pendencias-scal.md` tem a lista completa de tudo que ainda falta ajustar ou decidir, com prioridade de cada item

---

Qualquer travamento nesses passos costuma ser resolvido copiando a mensagem de erro exata e pesquisando ou perguntando pra alguém com experiência técnica — não precisa refazer nada do zero.
