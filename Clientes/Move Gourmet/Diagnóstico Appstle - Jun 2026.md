---
tags:
  - diagnóstico
  - appstle
  - shopify
  - assinatura
  - youmove
cliente: Move Gourmet
data: 2026-06-29
status: concluído
---

# Diagnóstico Appstle Subscription - Jun 2026

> Diagnóstico realizado em 29/06/2026 via acesso direto ao admin Shopify + Appstle (navegação real, sem capturas manuais).

---

## Contexto do negócio

O clube **YOUMOVE** funciona como assinatura mensal: o cliente assina e recebe um kit de produtos todo mês. No momento da assinatura, o cliente escolhe quais produtos quer receber no 1º kit — mas esses produtos ficam **fixos para todos os meses seguintes**. Para trocar os produtos do próximo mês, o cliente precisa avisar manualmente por **WhatsApp**, gerando trabalho operacional para a equipe.

**Objetivo da Fernanda:** permitir que o próprio cliente gerencie a troca de produtos pelo **portal do cliente do Appstle**, sem precisar contatar a equipe.

---

## 1. Status de pagamentos (Shopify Admin)

Acessado em: Configurações > Pagamentos

| Gateway | Tipo | Status |
|---|---|---|
| Mercado Pago Cartões | Provedor principal | ✅ Ativo |
| Mercado Pago Checkout Pro | Provedor adicional | ✅ Ativo |
| Mercado Pago Pix | Provedor adicional | ✅ Ativo |
| PayPal | Provedor adicional | ⚪ Inativo |

✅ **Banner vermelho de erro desapareceu** — o problema registrado em [[Problema - Pagamentos sem provedor principal]] foi resolvido pela Fernanda em 24/06.

---

## 2. Appstle — Dashboard

### ⚠️ Aviso crítico: gateway incompatível para cobranças recorrentes

O Appstle exibe um banner azul **permanente** no dashboard:

> "Subscriptions require one of these payment gateways to process recurring payments:
> - **Shopify Payments** (recommended)
> - Shop Pay, Apple Pay, or PayPal Express
> - **Stripe**, Authorize.net, or Adyen"

O **Mercado Pago Cartões NÃO está nessa lista**. O Mercado Pago não suporta a **Shopify Subscriptions API**, que é o mecanismo que o Appstle usa para autorizar e cobrar automaticamente os clientes mês a mês.

**Impacto real:** mesmo com o Mercado Pago como provedor principal, o Appstle **não consegue processar as cobranças recorrentes**. O gateway precisa ter capacidade de armazenar dados de pagamento e realizar cobranças futuras via API — o Mercado Pago, no modelo de integração atual com o Shopify, não oferece isso.

### Setup readiness

- **100% — 3 of 3 essentials ready**
- ✅ "Core launch setup looks ready"
- ✅ App is active — embed do Appstle habilitado no tema da loja

> O "100%" é enganoso: refere-se apenas à configuração técnica do app, não à compatibilidade do gateway.

---

## 3. Planos de assinatura configurados

Total: **3 planos**

| Plano | Produtos vinculados | Variantes |
|---|---|---|
| Plano Anual à vista | **0 produtos** ⚠️ | 0 |
| Plano Anual Parcelado | 23 produtos | 0 |
| Plano Semestral Parcelado | 23 produtos | 0 |

**Problemas:**
- O **Plano Anual à vista** está vazio — nenhum produto vinculado. Clientes não conseguem assinar por este plano.
- Nenhum plano tem variantes configuradas (pode ser intencional dependendo dos produtos).

---

## 4. Assinantes ativos

Total de assinaturas cadastradas: **1** (uma)

| Campo | Valor |
|---|---|
| Subscription ID | #31547228396 |
| Status | **CANCELADA** |
| Cliente | Fernanda Ferrari Possidio (diretoria@angioclam.com.br) |
| Plano | Pay As You Go Plan |
| Frequência | 1 mês |
| Primeiro pedido | #1112 |
| Criada em | 21/10/2025 |
| Valor total acumulado | **R$ 0,00** |
| Próxima cobrança | — (nenhuma agendada) |

> **Conclusão: o clube YOUMOVE nunca saiu do papel.** A única assinatura é um teste da própria Fernanda, com valor zero e cancelado. Nenhum cliente real assinou até hoje.

---

## 5. Customer Portal — levantamento completo

Acessado em: Appstle > Customer Portal > Configuration

### 5.1 Subscription Management

| Opção | Status |
|---|---|
| Allow customers to cancel subscriptions | ✅ Ativo |
| Allow customers to pause subscriptions temporarily | ✅ Ativo |
| Allow customers to resume subscriptions | ✅ Ativo |
| Allow customers to resume subscriptions after cancellation | ☐ Inativo |
| Allow customers to process their next subscription order immediately | ✅ Ativo |
| Allow customers to skip their upcoming subscription order | ✅ Ativo |
| Allow customers to modify prepaid separate subscription | ☐ Inativo |

### 5.2 Customer Portal Element Visibility

| Opção | Status |
|---|---|
| Hide Loyalty Table icon | ☐ (visível) |
| Hide Past Orders tab | ☐ (visível) |
| Hide Schedules tab | ☐ (visível) |
| Hide Edit Payment Method button | ☐ (visível) |
| Hide Resume Subscription button (ao atingir limite máximo de pedidos) | ☐ (visível) |

### 5.3 Order Customization

| Opção | Status |
|---|---|
| Let customers remove products from their subscriptions | ✅ Ativo |
| Let customers add notes to their orders | ☐ Inativo |
| Let customers skip individual fulfillment orders from the fulfillment tab | ☐ Inativo |

### 5.4 Billing Frequency Changes

| Opção | Status |
|---|---|
| Let customers change how often they receive orders | ✅ Ativo |
| **Frequency change method** | **Legacy list** ⚠️ |

> ⚠️ O método "Legacy list" está selecionado mas o Appstle marca "Compatible only" como **Recommended**. "Legacy list" mostra frequências de qualquer plano de venda do produto, mesmo que incompatível. "Compatible only" exibe apenas frequências que o produto realmente suporta.

### 5.5 Account Access And Security

| Opção | Status |
|---|---|
| Let customers return to their account page when clicking 'My Account' | ✅ Ativo |
| Let customers view full product details by clicking on product images or titles | ☐ Inativo |

### 5.6 Discounts And Promotions

| Opção | Status |
|---|---|
| Let customers apply discount codes to their subscriptions | ✅ Ativo |
| Limit customers to using only one discount code per subscription | ☐ Inativo |
| Let customers change product quantities | ✅ Ativo |

### 5.7 Next Order Management

| Opção | Status |
|---|---|
| Let customers reschedule their next upcoming delivery | ✅ Ativo |
| Let customers adjust the schedule for future deliveries | ☐ Inativo |

### 5.8 Product Configuration — ⭐ foco principal do problema

| Opção | Status |
|---|---|
| **Let customers exchange products in their subscription** | ✅ **ATIVO** |
| Let customers subscribe to out-of-stock products | ✅ Ativo |
| Let customers change quantities even when products are out of stock | ☐ Inativo |
| Let customers adjust quantities in their product bundles | ☐ Inativo |
| Let customers view line item attributes | ☐ Inativo |

**A opção de troca de produtos está habilitada.** O portal já está configurado para permitir que o cliente troque os produtos da assinatura sem precisar do WhatsApp.

> ⚠️ **Atenção importante:** a opção "exchange products" no Appstle faz uma troca **permanente** — ela substitui o produto para todos os pedidos futuros, não apenas para o próximo mês. Para o modelo YOUMOVE (onde o cliente escolheria produtos diferentes a cada mês), isso pode não ser o comportamento ideal. Precisa validar com a Fernanda se "troca permanente" atende ou se ela precisa de "troca apenas para o próximo pedido" (funcionalidade diferente, que o Appstle também suporta via configuração específica no plano).

### 5.9 Bundle Contract Management

| Opção | Status |
|---|---|
| Remove Min-Max Restrictions on Swap in Fixed Price Bundle | ☐ Inativo |
| Restrict Swap on Bundle Child Products | ☐ Inativo |

### 5.10 Currency Settings

| Opção | Status |
|---|---|
| Enable support for multiple currencies | ✅ Ativo |

### 5.11 Subscription List Settings

| Opção | Status |
|---|---|
| Skip the subscription list page if there is only one contract | ✅ Ativo |

### 5.12 Minimum Order Settings

| Opção | Status |
|---|---|
| Lock subscription changes until minimum order count is reached | ☐ Inativo |
| Allow product swaps before minimum order count is reached | ☐ Inativo |

### 5.13 One-time Product

| Opção | Status |
|---|---|
| Let customers add one-time purchases to their subscription orders | ☐ Inativo |
| Allow one-time purchases with prepaid subscriptions | ☐ Inativo |
| Let customers remove one-time products from their next order | ☐ Inativo |

---

## 6. Problemas identificados (resumo priorizado)

| # | Problema | Criticidade | Status |
|---|---|---|---|
| 1 | Gateway Mercado Pago não suporta Shopify Subscriptions API — cobranças recorrentes não funcionam | 🔴 Crítico | **Pendente** |
| 2 | Zero assinantes reais — clube YOUMOVE nunca foi ao ar de fato | 🔴 Crítico | Consequência do #1 |
| 3 | Plano Anual à vista com 0 produtos vinculados | 🟡 Médio | **Pendente** |
| 4 | Processo manual de troca de produtos via WhatsApp | 🟡 Médio | Portal OK — bloqueado pelo gateway (#1) |
| 5 | Método de frequência "Legacy list" (recomendado: "Compatible only") | 🟢 Baixo | **Pendente** |
| 6 | Validar se "swap permanente" vs "swap por pedido" atende o modelo YOUMOVE | 🟡 Médio | A definir com Fernanda |

---

## 7. Solução recomendada

### 7.1 Gateway — passo bloqueador

Para o YOUMOVE funcionar, precisa de um gateway compatível com a Shopify Subscriptions API. Para o Brasil:

| Gateway | Suporta BRL | Complexidade | Taxas aprox. | Recomendação |
|---|---|---|---|---|
| **Stripe** | ✅ | Baixa | ~3,4% + R$0,40/transação | ✅ Recomendado |
| Adyen | ✅ | Alta | Variável (negociado) | ❌ Para grandes volumes |
| Shopify Payments | ❌ | — | — | Não disponível no BR |

**Ação:** instalar o Stripe como gateway. Manter o Mercado Pago para compras avulsas (MP Checkout Pro + Pix). No checkout de assinaturas, o Stripe assume. Nos pedidos normais da loja, o MP continua.

### 7.2 Plano Anual à vista

Vincular os produtos ao plano. Provavelmente os mesmos 23 produtos dos outros planos.

### 7.3 Validar comportamento de swap com a Fernanda

Explicar a diferença:
- **Swap permanente** (atual — já habilitado): o cliente troca o produto e ele muda para todos os meses seguintes.
- **Swap por pedido** (precisa configurar): o cliente entra no portal antes de cada cobrança e escolhe o que quer receber *só naquele mês* — no mês seguinte volta ao padrão.

Para o modelo "kit mensal personalizado", provavelmente o ideal é o "swap por pedido". Isso se configura dentro de cada plano de assinatura no Appstle (não no Customer Portal).

### 7.4 Ajustar Frequency Change Method

Mudar de "Legacy list" para "Compatible only" para evitar que frequências incompatíveis apareçam para o cliente.

---

## 8. Próximos passos sugeridos (em ordem)

1. [ ] Instalar e configurar **Stripe** como gateway de assinaturas
2. [ ] Fazer teste de assinatura completo com Stripe (criar, cobrar, renovar)
3. [ ] Vincular produtos ao **Plano Anual à vista**
4. [ ] Alinhar com Fernanda: "swap permanente" vs "swap por pedido"
5. [ ] Configurar o tipo de swap nos planos conforme decisão acima
6. [ ] Mudar Frequency Change Method para "Compatible only"
7. [ ] Fazer teste do portal do cliente: assinar → entrar no portal → trocar produto → confirmar que o próximo pedido reflete a troca
8. [ ] Lançar o YOUMOVE para clientes reais

---

## Links úteis

- [[Move Gourmet - Hub]]
- [[Problema - Pagamentos sem provedor principal]]
- Admin Shopify Pagamentos: https://admin.shopify.com/store/9ja6tr-1i/settings/payments
- Admin Appstle Dashboard: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard
- Planos de assinatura: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard/subscription-plan
- Assinantes: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard/subscriptions
- Customer Portal: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard/customer-portal-settings
- Billing / Planos Appstle: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard/billing

---

## 9. Modelos de assinatura disponíveis no Appstle

O Appstle suporta 3 tipos de billing, com características distintas:

### 9.1 Pay As You Go (PAYG)

- O cliente paga a cada entrega, no ciclo de cobrança configurado (ex: mensal)
- Cobrança automática recorrente — sem necessidade de ação do cliente
- Se cancelar, para de pagar e de receber imediatamente
- Ideal para assinaturas simples onde o cliente quer flexibilidade de cancelamento
- **Não usado nos planos atuais da Move Gourmet**

### 9.2 Prepaid (Auto-renew) ← usado atualmente

- O cliente paga vários meses de uma só vez (ex: 6 ou 12 meses antecipados)
- A assinatura renova automaticamente ao fim do período
- As entregas acontecem no ciclo de fulfillment configurado (ex: mensal)
- Mais comprometimento do cliente, desconto maior como incentivo
- **Todos os 3 planos atuais usam este modelo**

> Subtipo: **Prepaid (Auto-renew)** = o contrato inteiro é um único pedido de assinatura, com entregas parceladas dentro dele. Quando o cliente faz swap de produto, ele troca para todos os pedidos futuros do contrato.

### 9.3 Prepaid (Separate Orders) ← NÃO disponível no Business

- Igual ao Prepaid Auto-renew em estrutura de cobrança
- **Diferença crítica:** cada entrega é gerada como um **pedido separado e independente**
- Isso permite personalização produto a produto: o cliente escolhe itens diferentes em cada entrega antes dela acontecer
- É o modelo ideal para "kit mensal personalizado por mês"
- **Requer plano Business Premium ($100/mês) — não está disponível no plano atual ($30/mês)**

### 9.4 Build-A-Box ← disponível no Business ⭐

- Recurso separado que funciona em cima dos tipos de billing acima
- Permite que o **cliente monte o kit que quer receber** ao assinar — escolhe X produtos de um catálogo definido pela loja
- O cliente pode retornar ao portal antes de cada entrega e **remontar o kit** para o próximo mês
- O Appstle pode enviar email de lembrete antes da próxima entrega
- Não depende de "Prepaid Separate Orders" — funciona com Prepaid Auto-renew
- **Este é o recurso mais relevante para o modelo YOUMOVE no plano atual**

---

## 10. Análise detalhada dos planos configurados

### 10.1 Tabela comparativa

| Plano | Entrega | Billing | Tipo | Desconto 1º pedido | Após 1º pedido | Produtos |
|-------|---------|---------|------|--------------------|----------------|----------|
| Anual à vista | 1 mês | 12 meses | Prepaid Auto-renew | 30% | — | **0 ⚠️** |
| Anual Parcelado | 1 mês | 12 meses | Prepaid Auto-renew | 20% | 0% | 23 |
| Semestral Parcelado | 1 mês | 6 meses | Prepaid Auto-renew | 10% | 0% | 23 |

### 10.2 Problemas identificados nos planos

**"Anual Parcelado" está configurado igual ao "Anual à vista"**
- Ambos têm billing every 12 months — cobram o ano inteiro de uma vez
- "Parcelado" em português implica pagamento em parcelas (mensais), mas a configuração real é idêntica ao "à vista"
- Se a intenção era criar um plano anual com **pagamento mensal em 12 parcelas**, a billing frequency deveria ser "Every 1 Month" — o que tornaria o billing type de "Prepaid" para "Pay As You Go"
- **Recomendação:** alinhar com Fernanda o que cada plano deveria fazer e corrigir a configuração

**"Anual à vista" tem 0 produtos**
- Nenhum produto vinculado — clientes não conseguem assinar por este plano
- Provavelmente deveria ter os mesmos 23 produtos dos outros planos

**Desconto após 1º pedido zerado**
- Nos planos Anual Parcelado e Semestral Parcelado, o desconto é 20%/10% **apenas no 1º pedido**
- A partir do 2º ciclo de billing, o desconto vai para 0%
- Isso significa que após a primeira assinatura, o cliente paga o preço cheio em todas as renovações
- Pode causar estranheza ("por que meu desconto sumiu?") e aumento de churn no momento da renovação

---

## 11. Plano Business — o que está disponível

Plano atual: **Business — $30/mês** (ativo)
Quota de receita: até **$30.000/mês** em assinaturas processadas

### 11.1 Recursos disponíveis no Business (✅)

**Core:**
- Subscriber Customer Portal
- Pay As You Go & Prepaid Plans
- Cobrança recorrente automática
- Custom Shipping Profiles para assinaturas
- Customer Portal Settings Management
- Passwordless Login no portal
- Manual Subscription Creation (criar assinatura pelo admin)
- Immediate Order Placement
- Loyalty Features (produto grátis e mais)
- **Advanced Subscription Plans**
- Widget Design Options
- **Custom Subscription Widget Locations**
- Subscriber Activity Logs and Timelines
- **Build-A-Box** ⭐
- **Build-A-Box Inventory Sync**
- **Inventory Management**
- **Product Page Bundling**
- **Cart Page Subscription Widget**
- Storefront Analytics Forwarding
- **Advanced Customer Portal Options**

**Email:**
- Unlimited Email Engagements
- Resend Emails + notificações admin
- Klaviyo Mailing List Connect
- Custom Email HTML

**Analytics:**
- Performance Analytics
- Weekly Summary Reports
- Inventory forecasting

**Revenue / Retenção:**
- One-time Product upsells (no portal)
- Split contract
- Cancellation management tools
- Offer discounts on cancellation attempt
- Quick view/collection page widget
- Failed Payment Recovery to Reduce Churn

### 11.2 Recursos NÃO disponíveis no Business — precisariam Business Premium ($100/mês)

| Recurso | Por que importa para o YOUMOVE |
|---------|-------------------------------|
| **Prepaid (Separate Orders)** | Permite personalização produto a produto por entrega — modelo ideal para "kit diferente todo mês" |
| **Automatic Product Swap** | Troca automática de produtos em massa para todos os assinantes (ex: mudar o kit padrão de julho para todos) |
| Automatic Frequency Swap | Troca automática de frequência de entrega |
| Payment Method Update Auto-Retry | Re-tenta atualizar cartão expirado automaticamente |
| Backup Payment Recovery | Tenta cobrar em método de pagamento alternativo se o principal falhar |
| Phased Retry | Tentativas progressivas de cobrança em caso de falha |
| Customer Portal Product Upsell | Sugere produtos adicionais dentro do portal do cliente |
| Quick Cart & Checkout Links | Links diretos para assinar com um clique |
| Campaigns | Campanhas para assinantes (ex: "atualize seu kit", "aproveite este produto") |
| Custom Email Domain | Email com domínio da loja (ex: ola@movegourmet.com.br) |
| Dedicated Merchant Success Manager | Suporte dedicado da Appstle |

---

## 12. Fluxos de gestão e experiência do cliente

### 12.1 Fluxo admin (gestão das assinaturas)

```
Dashboard Appstle
├── Subscription Plans → criar/editar planos (produtos, frequência, desconto)
├── Subscriptions → listar todas as assinaturas, ver status, intervir manualmente
├── Subscription Widget → configurar aparência do widget no checkout
├── Customer Portal → configurar o que o cliente pode fazer no portal
│   ├── Cancelar, pausar, pular entrega
│   ├── Trocar produto (swap)
│   ├── Alterar frequência
│   └── Aplicar cupom
└── Billing → ver plano Appstle, quota de uso, mudar plano
```

**Ações manuais que o admin pode fazer:**
- Criar assinatura manualmente para um cliente
- Cancelar, pausar ou reativar assinaturas
- Ver histórico de pedidos e cobranças de cada assinante
- Alterar produtos ou frequência de assinaturas específicas
- Ver timeline de atividade por assinante

### 12.2 Fluxo do cliente — estado atual (sem gateway, bloqueado)

```
1. Cliente acessa movegourmet.com.br
2. Acessa página de produto com assinatura disponível
3. Widget Appstle exibe as opções de plano (Anual à vista / Anual Parcelado / Semestral)
4. Cliente escolhe produtos e plano
5. Vai para o checkout
   ❌ FALHA AQUI: Mercado Pago não suporta Shopify Subscriptions API
   → Cobrança recorrente não processa
   → Assinatura não é criada
```

### 12.3 Fluxo do cliente — com Stripe + portal (swap permanente)

```
1. Cliente acessa movegourmet.com.br
2. Escolhe produtos do kit inicial
3. Seleciona plano (ex: Semestral — paga 6 meses, 10% off)
4. Paga no checkout via Stripe (cartão salvo)
5. Appstle cria assinatura → gera pedido #1
6. No mês 2: Appstle gera pedido automaticamente com os mesmos produtos
7. Se cliente quiser trocar:
   → Acessa portal.movegourmet.com.br/account (ou link enviado por email)
   → "Manage Subscription" → Exchange Products
   → Escolhe novo produto → confirma
   → Swap é PERMANENTE: todos os meses futuros terão o novo produto
8. Para trocar no próximo mês e voltar depois: precisa fazer outro swap
```

> Problema do swap permanente: o cliente que quer "Kit A em julho, Kit B em agosto, Kit A em setembro" teria que fazer 2 swaps por mês. Trabalhoso e confuso.

### 12.4 Fluxo do cliente — com Stripe + Build-A-Box (ideal para YOUMOVE)

```
1. Cliente acessa movegourmet.com.br
2. Acessa a página do "Kit YOUMOVE"
3. Widget Build-A-Box: escolhe 5 produtos de uma lista de 23 disponíveis
4. Seleciona plano (mensal, semestral, anual)
5. Paga no checkout via Stripe
6. Recebe kit #1 com os produtos escolhidos

A cada mês, antes da próxima entrega:
7. Recebe email: "Seu próximo kit sai em X dias — personalize agora!"
8. Clica no link → portal do cliente → seção Build-A-Box
9. Escolhe novos produtos para o kit do próximo mês
10. Salva → pedido do mês é gerado com esses produtos
11. Se não personalizar: pedido sai com a seleção anterior (ou padrão)
```

> Este fluxo elimina completamente o WhatsApp. O cliente tem autonomia total.

---

## 13. Comparativo de modelos para o YOUMOVE

| Modelo | Gateway | Swap por pedido | Custo Appstle | Esforço de config | Recomendação |
|--------|---------|----------------|--------------|-------------------|--------------|
| **Swap manual no portal** | Stripe | Não (permanente) | $30/mês (atual) | Baixo | ⚠️ Resolve parcialmente |
| **Build-A-Box** | Stripe | Sim (por entrega) | $30/mês (atual) | Médio | ✅ Recomendado |
| **Prepaid Separate Orders** | Stripe | Sim (nativo) | $100/mês (upgrade) | Alto | ⭐ Ideal mas caro |

### Recomendação final

**Solução em 2 etapas:**

**Etapa 1 — resolver o bloqueador:** instalar Stripe como gateway (obrigatório independente do modelo escolhido)

**Etapa 2 — configurar Build-A-Box:** é o caminho com melhor custo-benefício no plano atual. Permite que o cliente monte e remonte o kit a cada mês sem precisar contatar a equipe, usando o plano Business que já está pago.

Se o volume de assinantes crescer e houver necessidade de automações avançadas (campanhas, swap automático em massa, pagamento com retry avançado), avaliar upgrade para Business Premium ($100/mês) — o adicional de $70/mês se justifica com ~7 assinantes ativos no plano mais barato (R$250–400/mês de margem por kit).
