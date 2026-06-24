---
tags:
  - problema
  - pagamentos
  - shopify
  - urgente
cliente: Move Gourmet
data_identificacao: 2026-06-24
status: resolvido
---

# Problema - Pagamentos sem provedor principal

> Identificado em: 24/06/2026
> Impacto: CRÍTICO - pode estar bloqueando vendas com cartão e assinaturas

---

## Sintoma

Banner vermelho visível em todo o admin Shopify:

> "Os pagamentos com cartão de crédito ou assinatura estão indisponíveis. Atualize a integração de cartão de crédito ou assinatura para voltar a aceitar pagamentos."

---

## Causa raiz

A seção **"Provedores de pagamento"** do Shopify está completamente vazia. Não existe nenhum gateway principal configurado para processar cartão de crédito.

O que existe hoje são apenas **"Formas de pagamento compatíveis"** (providers secundários):
- Mercado Pago Checkout Pro - Ativo
- Mercado Pago Pix - Ativo
- PayPal - Inativo

Essas formas secundárias NÃO suportam:
- Processamento de cartão de crédito como provedor principal
- Armazenamento de cartão para cobranças recorrentes (necessário para o Appstle Subscription)

### Por que o Mercado Pago Checkout Pro não resolve

Quando configurado em "Formas de pagamento compatíveis", o Mercado Pago redireciona o cliente para o ambiente MP para pagar. Isso impede que o Shopify armazene o cartão para cobranças futuras automáticas, que é o que o clube YOUMOVE necessita.

---

## Solução

Configurar um **provedor principal** em: Admin Shopify > Configurações > Pagamentos > "Escolher um provedor"

### Opções disponíveis para Brasil

| Provedor | Obs |
|---|---|
| **Mercado Pago Cartões** | Com 3DS - recomendado, integra com o que já existe |
| Pagar.me - Cartão de Crédito | Muito usado no Brasil, estável |
| PagBank - Cartão de Crédito | Opção nacional |
| PagBrasil - Cartão de crédito | Especializado em BR |
| Appmax - Cartão de Crédito | Focado em ecommerce BR |
| Stripe Card Payments | Com 3DS, internacional |

### Recomendação

Ativar o **Mercado Pago Cartões** como provedor principal. Mantém o ecossistema Mercado Pago já parcialmente configurado e suporta cobrança recorrente para assinaturas.

---

## Impacto se não resolvido

- Clientes não conseguem pagar com cartão de crédito
- Assinaturas YOUMOVE não processam cobranças mensais
- Appstle Subscription fica bloqueado para novos assinantes

---

## Histórico

| Data | Ação | Por |
|---|---|---|
| 2026-06-24 | Problema identificado na auditoria | G4 OS / João |
| 2026-06-24 | Mercado Pago Cartões ativado como provedor principal | Fernanda |

---

## Links úteis

- [[Move Gourmet - Hub]]
- Admin Pagamentos: https://admin.shopify.com/store/9ja6tr-1i/settings/payments
