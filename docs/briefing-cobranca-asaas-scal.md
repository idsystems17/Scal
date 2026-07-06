# Briefing: Cobrança variável do SCAL via Asaas

## Escopo de responsabilidade do SCAL (importante)

**O SCAL é uma ponte de rastreio de vendas — não um processador de
pagamento de comissões.**

- O pagamento da comissão entre e-commerce e representante acontece
  **fora do SCAL**, diretamente entre as duas partes. O SCAL nunca
  segura, processa ou faz custódia desse dinheiro.
- O único dinheiro que entra no caixa do SCAL é a **receita do próprio
  SCAL**: a assinatura fixa (Kiwify) e os 0,5% sobre o valor atribuído
  acima de R$ 50 mil (Asaas).
- Isso significa que o SCAL **não é** instituição de pagamento nem
  intermediário financeiro da comissão — é só o sistema que rastreia e
  atribui a venda. Essa distinção deve ficar clara em qualquer
  implementação ou documentação futura, especialmente na parte de
  cobrança e nos relatórios.

## Contexto de negócio

O SCAL cobra 0,5% sobre o valor **atribuído a representantes/afiliados**
faturado por cada e-commerce cliente, mas só depois que o e-commerce
ultrapassa R$ 50.000 em vendas atribuídas a representantes.

- A assinatura fixa do SCAL já roda na Kiwify — isso **não muda**.
- Essa nova cobrança é **separada e variável**, mês a mês, e precisa de
  um segundo gateway porque a Kiwify não gera cobrança de valor
  dinâmico/avulso.
- O sistema já detecta quando uma empresa ultrapassa R$ 50.000 e notifica
  o admin do SCAL (isso já está implementado).

**Falta implementar:** o passo entre "detectou que passou de 50 mil" e
"emitir a cobrança de 0,5% de fato".

## Status: aguardando validação

Esta integração é um **ponto para depois** — só entra em implementação
depois que o restante do SCAL (rastreio, atribuição, cobrança da
assinatura) estiver validado. Não é prioridade imediata.

## Gateway escolhido: Asaas

Motivo: API REST simples, sem custo fixo mensal (só cobra quando o
boleto é pago), gera boleto/Pix/cartão via endpoint de "cobrança
avulsa", aceita `externalReference` para linkar a cobrança a um
registro interno do SCAL, e envia webhook de confirmação de pagamento.

Referência da API: `POST /v3/payments` (criar cobrança) — usar o campo
`value` com o valor calculado e `externalReference` para gravar o ID
interno da cobrança no SCAL.

## Fluxo proposto

1. Admin do SCAL recebe notificação de que a empresa X passou de R$ 50 mil
   (já existe).
2. Sistema calcula o valor da cobrança: 0,5% sobre o valor **atribuído**
   (não sobre o faturamento total da loja) do período.
3. Sistema chama a API do Asaas e cria uma cobrança avulsa (boleto),
   vinculando `externalReference` a um registro interno
   (ex: `cobranca_scal:{empresa_id}:{mes_referencia}`).
4. Sistema grava localmente: empresa, mês de referência, valor
   atribuído, valor da cobrança, ID da cobrança no Asaas, link do
   boleto, status (pendente), data de vencimento.
5. Boleto é enviado (o próprio Asaas notifica o cliente por e-mail/SMS).
6. Webhook do Asaas confirma pagamento → sistema atualiza status para
   "pago" + data de pagamento.

## Perguntas em aberto para decidir antes de implementar

- [ ] A cobrança é gerada **automaticamente** assim que o limite é
      cruzado, ou o admin do SCAL precisa **aprovar** antes de emitir?
- [ ] Qual a regra de vencimento do boleto (ex: 7 dias corridos após
      emissão)?
- [ ] Se o boleto vencer sem pagamento, existe régua de cobrança
      automática (o Asaas já oferece lembretes) ou ação manual?
- [ ] O cálculo do 0,5% é sobre o acumulado do mês inteiro, ou sobre
      cada venda atribuída individualmente conforme ela acontece?

## Dados necessários para relatório do contador / Receita Federal

Precisa de uma exportação (CSV, por período) contendo, por cobrança:

| Campo | Descrição |
|---|---|
| Empresa (razão social / CNPJ) | Identificação do cliente cobrado |
| Mês de referência (competência) | Ex: 06/2026 |
| Valor faturado atribuído | Base de cálculo do 0,5% |
| Valor da cobrança | 0,5% aplicado |
| Status | Pago / pendente / vencido |
| Data de pagamento | Quando confirmado via webhook |
| ID da cobrança (Asaas) | Para conciliação |

Não precisa de dashboard bonito para isso — um botão de exportação CSV
por período no admin do SCAL já resolve.

## Observação de integração

Esta é uma **segunda integração de pagamento**, coexistindo com a
Kiwify (que continua responsável apenas pela assinatura fixa do SCAL).
Deixar isso explícito no código/documentação para evitar confusão
futura sobre "por que existem dois gateways diferentes".
