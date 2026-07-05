# Backup — situação atual

Confirmado no painel do Supabase (2026-07-05): projeto está no **Plano Free**.

- Free Plan **não inclui backup de projeto** — mensagem oficial do Supabase: "Free Plan does not include project backups."
- Pro Plan já inclui, **sem custo extra**, backups diários automáticos com retenção de **7 dias**.
- PITR (Point-in-Time Recovery — restaurar o banco para um segundo exato) é um **add-on pago à parte do Pro Plan**, a partir de **$100/mês**. Não vem incluso nem no Pro.

## O que isso significa na prática

Hoje, se algo apagar ou corromper dados por engano — bug em migration, `DELETE` sem `WHERE`, erro humano no SQL editor, incidente na infraestrutura do Supabase — **não há como restaurar nada**. Perda é definitiva.

## Recomendação

- **Para a fase atual (MVP em teste, dados de seed/teste, sem cliente pagante real do irmão)**: Free é aceitável. Risco existe, mas o dado que se perderia hoje não tem valor comercial ainda.
- **Antes de o irmão começar a usar com vendas/parceiros reais**: fazer upgrade para o Pro Plan é pré-requisito, não opcional. É o mesmo raciocínio do item de LGPD (art. 46 exige medidas de segurança e continuidade) — sem isso, qualquer incidente zera a operação sem recurso.
- **PITR ($100/mês) não é necessário no lançamento**: o backup diário do Pro já cobre o cenário mais provável (erro humano descoberto no mesmo dia ou nos dias seguintes — restaura para a noite anterior). PITR só compensa quando o negócio já tem volume/faturamento alto o suficiente para que perder algumas horas de dados entre um backup diário e outro seja um problema real. Reavaliar quando o SCAL tiver clientes pagantes de verdade rodando vendas todo dia.

Marcar como item de bloqueio antes do lançamento real, junto com os demais itens já pendentes (webhook Kiwify, domínio, preço — ver `project_scal` na memória).

## Cópia externa (regra 3-2-1) — ideia em estudo, NÃO implementada

Discussão de 2026-07-05: o backup do Supabase (mesmo no Pro) protege contra erro humano/bug, mas não contra um incidente na própria Supabase (conta suspensa, falha de plataforma que afete banco e backup juntos). A regra 3-2-1 de backup recomenda pelo menos uma cópia fora do provedor principal.

**Ideia proposta**: job agendado (ex.: GitHub Actions com `pg_dump`) rodando com uma cadência baseada em quanto dado a usuária aceita perder no pior cenário (RPO) — não deve ser amarrado à janela de retenção do Supabase (isso é coincidência, não a lógica certa). Dump compactado e **criptografado** antes de subir para um storage externo (Google Drive, S3 etc.), já que o dump carrega dado pessoal (email, hash de IP, valores de venda) — a cópia externa também vira superfície de risco de LGPD se não for protegida.

**Decisão da usuária**: não implementar ainda. Ela quer estudar o assunto primeiro para entender de verdade — hoje a "agência" responsável por essa parte técnica do SCAL é ela + Claude Code (o irmão, dono do produto, ainda não contratou mais ninguém). Enquanto isso, manter isso como pendência ativa e visível a cada retomada do projeto.

