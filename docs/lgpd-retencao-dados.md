# Política de retenção de dados — proposta

Status: rascunho para decisão da responsável pelo produto. Nenhum destes prazos está implementado ainda — hoje todas as tabelas acumulam dados indefinidamente.

| Tabela | Dado pessoal envolvido | Prazo proposto | Justificativa |
|---|---|---|---|
| `cliques` | `ip_hash`, `user_agent`, `referrer` | Excluir cliques sem conversão associada após **6 meses** | Cookie de atribuição já expira em 30 dias (`src/app/r/[codigo]/route.ts`). Depois disso o clique não tem mais função de atribuição — só teria valor estatístico. Já vem hasheado, então o risco é baixo, mas o volume é o maior do sistema. |
| `conversoes` | `webhook_payload_raw` (pode ter nome/email/telefone do comprador vindo da Kiwify) | Manter `valor_venda`, `status`, `pedido_externo_id` **por 5 anos** (obrigação fiscal no Brasil); expurgar/redigir `webhook_payload_raw` após **12 meses**, guardando só os campos financeiros já extraídos | A venda em si é dado comercial com obrigação de guarda fiscal. O payload bruto do webhook é o que carrega dado pessoal do comprador final e não precisa ficar acessível por 5 anos — é redundante depois que os campos relevantes já foram extraídos para as colunas da tabela. |
| `audit_log` | `ator_id`, `ip` (a partir de agora hasheado) | **12 meses** | Prazo comum de referência para logs de segurança/auditoria — tempo suficiente para investigar incidentes, sem acumular indefinidamente. |
| `eventos` | `payload_json`, `ator_id` | **90 dias** | Serve para debug operacional (erros, webhooks). Depois de 3 meses o valor de diagnóstico cai muito. |
| `convites` | `email_destinatario`, `token` | Excluir **7 dias após `expires_at`** (hoje o convite já expira em 7 dias, então ~14 dias após criação) | Convite não usado não tem mais função; manter o e-mail do destinatário depois disso é retenção sem finalidade. |
| `parceiros` | `nome`, `email` | Manter enquanto vínculo com a empresa estiver ativo; anonimizar/excluir **90 dias após desligamento** (status permanentemente diferente de `ativo`) | Dado necessário para operação do produto enquanto o parceiro está ativo. Sem prazo de guarda pós-desligamento, o parceiro nunca "sai" da base mesmo sem motivo para isso. |
| `admins` | `nome`, `email` | Excluir ao remover o acesso (sem prazo de retenção pós-remoção) | Conta interna do sistema, não do cliente final — sem necessidade de retenção após desligamento. |
| `clientes` | `nome_loja`, `url_loja` | Manter durante o contrato + prazo de guarda fiscal padrão (mesma lógica de `conversoes`, 5 anos) | Empresa é a parte contratante — retenção segue a mesma obrigação fiscal da relação comercial. |
| `links` | Sem dado pessoal direto (só código/URL de destino) | Sem prazo — ciclo de vida atrelado ao parceiro | Não carrega dado pessoal, risco de LGPD é baixo. |
| `alertas_plano` | Sem dado pessoal direto | Sem prazo — ciclo de vida atrelado ao cliente | Idem. |

## O que falta para isso funcionar de verdade

Hoje isso é só uma tabela de intenção — nada expira sozinho. Para sair do papel precisa de:

1. **Um job periódico** (cron) que rode as exclusões/expurgos acima. Não existe nenhum cron configurado no projeto hoje (nem Vercel Cron, nem Supabase Edge Function agendada) — precisaria ser criado do zero.
2. **Definir os prazos de verdade com o irmão da usuária** (principalmente o de 5 anos fiscal — vale confirmar com contador se está correto para o tipo de operação do SCAL).
3. Depois que os prazos estiverem confirmados, uma migration com função SQL (ou job em `src/app/api/`) fazendo o `DELETE`/anonimização de cada tabela.

## Referência legal

- LGPD art. 15/16 — eliminação dos dados após o fim da finalidade do tratamento, ressalvadas hipóteses de guarda obrigatória (ex.: obrigação legal/fiscal, exercício de direitos em processo).
- Retenção fiscal de 5 anos é o prazo geral de prescrição para questões tributárias/fiscais no Brasil — validar com contador se aplica integralmente ao modelo de negócio do SCAL.
