# Manual de Uso — SCAL

Data: 2026-07-05

## O que é o SCAL

O SCAL é o sistema que mostra, de forma automática, **quem vendeu o quê** para a sua empresa através de parceiros e afiliados. Cada parceiro recebe um link único; quando alguém compra usando esse link, o SCAL identifica e registra a venda para aquele parceiro.

**Importante:** o SCAL não processa pagamento e não paga comissão. Ele só mostra o relatório de quem vendeu quanto — o pagamento da comissão é combinado e feito diretamente entre a empresa e o parceiro.

## Como fazer login

1. Acesse a tela de login do SCAL
2. Informe seu e-mail e senha cadastrados
3. Você será direcionado automaticamente para a sua área: Admin, Empresa ou Parceiro, dependendo do seu papel

Por segurança, após 10 tentativas erradas seguidas o sistema bloqueia novas tentativas por alguns minutos — normal, é uma proteção contra invasão, não um bug.

---

## Guia da Empresa (cliente)

### Primeiros passos

1. **Configure o webhook**: vá em **Integrações**, copie a URL do webhook e a chave secreta, e cadastre isso na sua plataforma de vendas (ex: Kiwify). É assim que o SCAL fica sabendo quando uma venda acontece.
2. **Convide seus parceiros**: no **Dashboard**, clique em "Convidar parceiro", informe o e-mail (opcional) e envie o link gerado para a pessoa. Ela cria a própria conta a partir desse link.

### Página a página

- **Dashboard**: visão geral — total de vendas, parceiros ativos, gráfico de receita por canal, ranking dos parceiros que mais venderam
- **Parceiros**: lista de todos os parceiros, com opção de bloquear/reativar
- **Vendas**: histórico completo de vendas confirmadas, com filtro por período e busca por número do pedido
- **Canais**: desempenho por canal de divulgação (Instagram, WhatsApp, etc.)
- **Materiais**: cadastre links de materiais de marketing (banners, textos prontos) para seus parceiros usarem
- **Integrações**: URL e chave do webhook, teste de envio
- **Configurações**: dados da sua empresa

### Perguntas frequentes

**Como convido um novo parceiro?**
No dashboard, clique em "Convidar parceiro", informe o e-mail (opcional) e envie o link de convite gerado. O parceiro cria a conta dele a partir desse link.

**O que acontece quando minha empresa atinge o limite de faturamento?**
Ao ultrapassar R$ 50.000 em vendas confirmadas via SCAL, sua empresa passa a pagar uma taxa de 0,5% sobre o faturamento total gerado pela plataforma. Você recebe um alerta assim que isso acontece.

**Como bloqueio um parceiro?**
Na tabela de parceiros do seu dashboard, clique em "Bloquear" ao lado do parceiro desejado. Ele deixa de gerar novos links, mas o histórico de vendas dele permanece registrado.

**Por que uma venda não foi atribuída a nenhum parceiro?**
Vendas sem clique associado (compra direta, sem passar por um link de afiliado) são contabilizadas como "Direto" e não geram comissão para nenhum parceiro.

---

## Guia do Parceiro (afiliado)

### Primeiros passos

1. Acesse **Meus links** e clique em "Novo canal"
2. Escolha o canal (Instagram, WhatsApp, etc.) e informe a URL de destino (a página do produto, por exemplo)
3. O SCAL gera um link único — divulgue esse link, não o link original da loja

### Página a página

- **Visão geral**: resumo de cliques, vendas e volume gerado
- **Meus links**: seus links por canal, com opção de criar novos
- **Conversões**: histórico de vendas atribuídas a você
- **Comissões**: acompanhamento do volume gerado (o pagamento em si é combinado com a empresa, fora do SCAL)
- **Materiais**: banners e textos prontos disponibilizados pela empresa e pelo SCAL

### Perguntas frequentes

**Como funciona a atribuição de uma venda a mim?**
Quando alguém clica no seu link, o SCAL grava um cookie de atribuição válido por 30 dias. Se a compra acontecer dentro desse prazo, a venda é atribuída a você automaticamente quando a empresa confirma o pagamento.

**Uma venda não apareceu no meu painel, por quê?**
Isso pode acontecer se a compra ocorreu fora da janela de 30 dias do cookie, se a empresa ainda não confirmou o pagamento via webhook, ou se o cliente comprou sem passar pelo seu link.

**Como funciona minha comissão?**
O SCAL rastreia o volume de vendas gerado pelos seus links, mas não calcula nem paga comissão. O percentual é combinado diretamente com a empresa.

**Fui bloqueado, o que aconteceu?**
A empresa que você representa pode bloquear ou reativar parceiros a qualquer momento pelo painel dela. Fale diretamente com a empresa para entender o motivo.

---

## Guia do Admin

### Página a página

- **Overview**: visão geral de todas as empresas cadastradas no SCAL
- **Alertas de plano**: empresas que ultrapassaram o limite de faturamento (R$ 50.000) ou de parceiros incluídos no plano
- **Empresas ativas**: lista de todas as empresas, com opção de suspender/reativar
- **Materiais**: materiais de marketing globais, visíveis a todos os parceiros do sistema
- **Segurança**: cliques em tempo real e tentativas de webhook com assinatura inválida
- **Infraestrutura**: monitoramento técnico básico
- **Financeiro**: (em implementação) valores cobrados por empresa
- **Suporte**: central de ajuda com IA

### Perguntas frequentes

**Como suspendo uma empresa?**
Na página "Empresas ativas", clique em "Suspender" ao lado da empresa. Isso bloqueia o acesso dela sem apagar nenhum dado histórico.

**O que significa um alerta de limite excedido?**
Alerta de faturamento significa que a empresa ultrapassou R$ 50.000 em vendas via SCAL e deve começar a pagar 0,5% sobre o total. Alerta de parceiros significa que ela excedeu o número de parceiros incluído no plano.

**Como aplico a taxa excedente de uma empresa?**
No painel de alertas, clique em "Aplicar taxa 0,5%" no alerta correspondente. Isso marca o alerta como resolvido e registra a ação no log de auditoria.

**O que fazer se uma empresa tiver tentativas de webhook inválidas?**
Consulte a página "Segurança" — ela lista tentativas de webhook com assinatura HMAC inválida. Normalmente indica configuração incorreta da chave secreta do lado da plataforma de vendas do cliente.

---

## Central de Ajuda (chat com IA)

Todos os papéis têm uma página de **Suporte** com um chat de perguntas e respostas. Ele responde primeiro com base nas perguntas frequentes de cada papel (as mesmas listadas acima) e, se a pergunta for diferente, usa inteligência artificial para tentar ajudar. Não é necessário abrir chamado por e-mail para dúvidas simples de uso.
