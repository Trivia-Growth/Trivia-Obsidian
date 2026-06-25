---
tags:
  - problema
  - omie
  - estoque
  - shopify
  - urgente
cliente: Move Gourmet
data_identificacao: 2026-06-25
status: aberto
---

# Problema - Omie sem Local de Estoque SP

> Identificado em: 25/06/2026
> Impacto: CRÍTICO - a localização São Paulo no Shopify nunca receberá estoque enquanto isso não for resolvido

---

## Achado

A seção **Configurações > Locais de Estoque** do Omie está completamente vazia — **nenhum registro encontrado**.

Isso significa que todo o inventário no Omie é gerenciado em um único local padrão (a própria empresa). A integração Shopify então envia estoque apenas para a localização padrão de Salvador.

```
Omie (1 local padrão)
    |
    v
Shopify - só alimenta Salvador (location_id: 85518483692)
    x
São Paulo (location_id: 92526051564) — NUNCA RECEBE DADOS
```

---

## Risco adicional

Qualquer estoque inserido manualmente no Shopify para a localização SP será **sobrescrito e zerado** na próxima sincronização do Omie, enquanto o mapeamento não for corrigido.

---

## Solução necessária

### Passo 1 - Criar Local de Estoque SP no Omie (Fernanda / time Omie)

Dentro do Omie:
> Configurações > Locais de Estoque > Incluir

Dados a preencher:
- Nome/Descrição: `Depósito São Paulo` (ou `Depósito SP`)
- Endereço: Rua Doutor João Toniolo, CEP 02969-000, São Paulo/SP
- Marcar: "Local de estoque disponível para Venda de Produto"
- Marcar: "Local de estoque disponível para Remessa de Produto"

### Passo 2 - Mapear Local de Estoque SP na integração Shopify (time técnico Omie)

A integração entre Omie e Shopify (via custom apps) precisa ser atualizada para:

| Omie | Shopify location_id |
|---|---|
| Local padrão (empresa) - Salvador | `85518483692` |
| Depósito São Paulo (novo) | `92526051564` |

Este passo exige o envolvimento do time técnico do Omie - é um ajuste na integração API, não uma configuração simples de tela.

---

## Impacto se não resolvido

- Localização SP no Shopify permanece com estoque zero
- Roteamento automático de pedidos para SP nunca funciona
- Regra "enviar do local mais próximo" não tem efeito prático para clientes de SP
- Todo o trabalho de configuração do Shopify fica bloqueado por esta dependência

---

## Histórico

| Data | Ação | Por |
|---|---|---|
| 2026-06-25 | Confirmado que Omie não tem Locais de Estoque configurados | G4 OS / João |

---

## Links

- [[Move Gourmet - Hub]]
- Omie - Locais de Estoque: https://app.omie.com.br/gestao/move-3y9kty30/#CFG
- Shopify - Localizações: https://admin.shopify.com/store/9ja6tr-1i/settings/locations
