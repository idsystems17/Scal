# O que falta no SCAL — guia simples

Este documento reúne tudo que ainda falta ajustar ou decidir no sistema, explicado sem termos técnicos difíceis. Serve para quem for continuar cuidando do SCAL saber exatamente por onde seguir.

Cada item diz: **o que é**, **por que importa** e **o que precisa ser feito**.

---

## 1. Domínio próprio (scal.admw.com.br)

**O que é:** hoje o sistema funciona no endereço `scal-sigma.vercel.app`. A ideia é ele passar a abrir direto em `scal.admw.com.br`.

**Situação atual:** foi criado um subdomínio dentro do painel de hospedagem (cPanel) que já existia, e esse subdomínio ficou fazendo um "redirecionamento" para o endereço antigo. Isso funciona visualmente, mas não é a configuração certa — o ideal é que o domínio aponte diretamente para onde o sistema está hospedado (Vercel), sem passar por um servidor intermediário.

**O que precisa ser feito:**
1. Desfazer o subdomínio criado no cPanel (apagar os registros que foram gerados automaticamente ao criá-lo).
2. Criar, no lugar, um registro do tipo **CNAME** apontando `scal` para `cname.vercel-dns.com`.
3. Depois disso, adicionar o domínio nas configurações do projeto dentro da Vercel (isso é rápido, quem tiver acesso à conta da Vercel consegue fazer em minutos).

**Prioridade:** baixa. O sistema funciona normalmente sem isso — é só uma questão de endereço bonito, não trava nada.

---

## 2. Kiwify — cobrança da assinatura das empresas

**O que é:** cada empresa cliente paga R$ 349,00 por ano para usar o SCAL. Essa cobrança é feita pela Kiwify (plataforma de vendas), não pelo próprio SCAL.

**O que falta:**
1. Cadastrar o produto "SCAL — assinatura anual" na Kiwify, com o preço de R$ 349,00/ano.
2. Configurar, no painel da Kiwify, o aviso automático (webhook) que avisa o sistema quando alguém paga. Depois de configurado, é preciso copiar uma chave de segurança gerada pela Kiwify e colocar nas configurações do sistema (variável de ambiente `KIWIFY_WEBHOOK_TOKEN`).

**Enquanto isso não for feito:** essa parte específica (confirmação automática de pagamento da assinatura) fica bloqueada por segurança — o sistema recusa qualquer aviso que não venha com essa chave.

---

## 3. Upgrade do banco de dados (Supabase): plano gratuito → plano pago

**O que é:** o sistema guarda todos os dados (empresas, vendas, parceiros) em um serviço chamado Supabase. Hoje ele está no plano gratuito.

**Por que importa:** o plano gratuito **não tem nenhum tipo de cópia de segurança automática**. Se algo der errado — um erro no sistema, um comando errado, uma falha do próprio Supabase — os dados perdidos não têm como ser recuperados. O plano pago já inclui, sem custo extra além da mensalidade, uma cópia diária automática guardada por 7 dias.

**O que precisa ser feito:** antes de o sistema começar a valer com clientes reais pagando e vendendo de verdade, fazer o upgrade do plano gratuito para o plano pago (Pro) direto no painel do Supabase. É uma assinatura mensal, não precisa de nenhuma alteração no código.

**Prioridade:** alta — é um pré-requisito antes de operar com dados reais de vendas.

---

## 4. Dados legais para completar os Termos de Uso e a Política de Privacidade

**O que é:** o sistema já tem páginas prontas de Termos de Uso e Política de Privacidade (obrigatórias por lei), mas alguns campos ainda estão com texto de exemplo esperando informação real:

- Nome completo do responsável legal pelo sistema
- CPF ou CNPJ desse responsável
- Cidade/UF onde a empresa responsável está sediada
- E-mail de contato para questões de privacidade

**O que precisa ser feito:** assim que esses 4 dados forem informados, é só substituir o texto de exemplo pelo texto real nos dois arquivos (são as mesmas informações nos dois lugares).

**Prioridade:** média — o sistema funciona sem isso, mas é obrigação legal (LGPD) ter essa informação correta antes de operar com clientes reais.

---

## 5. Limpeza dos dados de teste

**O que é:** durante os testes, o sistema foi usado com 3 contas de exemplo (`admin@scal.dev`, `cliente@scal.dev`, `parceiro@scal.dev`) e algumas vendas fictícias. Antes de o sistema valer pra clientes reais, esses dados de teste devem ser apagados.

**O que precisa ser feito:** existe uma rota pronta no próprio sistema para isso (`/api/limpar-dados-teste`), protegida por uma chave (a mesma chave que já protege a criação dos dados de teste). Quem tiver essa chave acessa esse endereço uma vez e o sistema remove sozinho as 3 contas de teste e tudo que estava ligado a elas (empresa de exemplo, parceiro de exemplo, vendas de exemplo). Essa ação é **irreversível** — só deve ser feita quando tiver certeza de que os testes terminaram.

**Atenção:** se alguma empresa de teste extra foi cadastrada manualmente (fora dessas 3 contas padrão, por exemplo pela tela de cadastro manual de empresas), ela **não** é apagada automaticamente — a rota mostra a lista de empresas que sobraram no banco pra conferência manual depois da limpeza.

**Prioridade:** fazer só depois que todos os testes tiverem terminado de verdade.

---

## 6. Cópia de segurança extra, fora do Supabase (backup 3-2-1)

**O que é:** mesmo com o plano pago do Supabase (item 3), a cópia de segurança fica guardada no mesmo lugar onde o sistema roda. Se o próprio Supabase tiver um problema grave (não um erro de uso, mas uma falha da empresa em si), tanto o banco quanto a cópia de segurança poderiam ser afetados juntos. A prática recomendada é ter também uma cópia guardada em outro lugar (ex: Google Drive, outro serviço de nuvem).

**O que falta decidir antes de implementar:**
- Com que frequência essa cópia externa deve ser feita (isso depende de quanto de dado a operação aceitaria perder no pior cenário — 1 dia, 1 semana?)
- Onde guardar essa cópia (a cópia carrega dados pessoais, então precisa ser guardada de forma protegida/criptografada, não solta em qualquer lugar)

**Prioridade:** baixa no começo, mas importante reavaliar assim que o sistema tiver clientes reais e volume de vendas relevante.

---

## 7. Regra de quanto tempo guardar cada dado (retenção / LGPD)

**O que é:** hoje o sistema guarda tudo para sempre — cliques, vendas, convites, logs — sem nenhum prazo de validade. A lei de proteção de dados (LGPD) recomenda guardar cada tipo de dado só pelo tempo necessário.

**O que já existe:** uma proposta de prazo para cada tipo de dado (ex: cliques sem venda associada apagados depois de 6 meses; vendas mantidas por 5 anos por exigência fiscal, mas com os dados pessoais do comprador removidos depois de 12 meses).

**O que falta:**
1. Confirmar com um contador se o prazo de 5 anos está correto para o tipo de operação do SCAL.
2. Construir uma rotina automática (que hoje não existe) que apague/anonimize cada tipo de dado no prazo certo.

**Prioridade:** média — vale reservar tempo para isso antes de o volume de dados crescer muito, mas não impede o sistema de funcionar hoje.

---

## 8. Cobrança variável de 0,5% acima de R$ 50 mil (via Asaas)

**O que é:** além da assinatura fixa de R$ 349/ano (item 2, cobrada pela Kiwify), o SCAL cobra 0,5% sobre o valor vendido pelos parceiros de cada empresa, mas só na parte que ultrapassa R$ 50.000 em vendas atribuídas. O sistema já **detecta** quando uma empresa passa desse limite e avisa — falta só a parte de gerar a cobrança de fato.

**Gateway escolhido para isso:** Asaas (é diferente da Kiwify, porque a Kiwify não gera cobrança de valor variável).

**O que falta decidir antes de implementar:**
- A cobrança deve ser gerada automaticamente assim que o limite é ultrapassado, ou alguém precisa aprovar antes?
- Qual o prazo de vencimento do boleto?
- Se o boleto vencer sem pagamento, isso é cobrado automaticamente de novo ou alguém precisa agir manualmente?
- O cálculo dos 0,5% é feito uma vez por mês (somando tudo) ou venda por venda, conforme acontece?

**Prioridade:** só entra em desenvolvimento depois que o resto do sistema estiver validado com clientes reais.

---

## 9. Recurso "Canais" — decisão pendente

**O que é:** hoje, quando um parceiro gera um link de divulgação, ele escolhe manualmente um canal (Instagram, WhatsApp, YouTube, TikTok, Blog, E-mail) e uma URL de destino. Isso permite depois ver quanto cada canal vendeu.

**Ponto em aberto:** foi levantada a dúvida se esse recurso realmente traz valor prático no dia a dia ou se é um passo a mais sem necessidade. **Ainda não foi decidido** se o recurso deve continuar como está, ser simplificado ou ser removido.

**Prioridade:** baixa — não afeta o funcionamento do resto do sistema, é só uma decisão de produto que fica em aberto.

---

## Resumo rápido — o que trava o quê

| Item | Trava o sistema funcionar? | Trava vender pra clientes reais? |
|---|---|---|
| 1. Domínio próprio | Não | Não |
| 2. Kiwify (produto + webhook) | Não | Sim, pra cobrar a assinatura de verdade |
| 3. Upgrade Supabase Pro | Não | Sim, é pré-requisito de segurança |
| 4. Dados legais (Termos/Política) | Não | Sim, é exigência legal |
| 5. Limpeza dos dados de teste | Não | Sim, antes de operar com dados reais |
| 6. Backup externo (3-2-1) | Não | Recomendado, não obrigatório no início |
| 7. Retenção de dados (LGPD) | Não | Recomendado, não obrigatório no início |
| 8. Cobrança Asaas (0,5%) | Não | Só quando o faturamento passar de R$ 50 mil |
| 9. Recurso "Canais" | Não | Não — é só decisão de produto |
