---
tags:
  - shopify
  - frete
  - configuração
cliente: Move Gourmet
data: 2026-06-30
---

# Configuração de Frete Shopify - Move Gourmet

Realizado em 30/06/2026 como parte da entrega técnica do orçamento aprovado.

---

## Perfil "Avulsas" (ID 107128520940) ✅ EXCLUÍDO (01/07/2026)

Consolidado no Perfil Geral. 47 produtos migrados antes da exclusão.

**Comprovação da configuração anterior:** [[assets/avulsas-perfil-configurado.gif]]

---

## Perfil "Geral" (ID 106532569324) ✅ CONCLUÍDO (01/07/2026)

**Produtos:** todos os produtos da loja (exceto Frenet)

**Origens:** Salvador/BA + São Paulo/SP (2 de 3 locais — Shopping Barra é só retirada)

**Zonas e tarifas (estrutura final):**

### Norte e Nordeste — 16 estados (inclui Bahia)
Alagoas, Sergipe, Pernambuco, Paraíba, Rio Grande do Norte, Ceará, Piauí, Maranhão, Tocantins, Pará, Amazonas, Acre, Roraima, Amapá, Rondônia, Bahia

| Tarifa | Preço base | Grátis a partir de | Prazo |
|---|---|---|---|
| Frete grátis - Move Gourmet | R$25,00 | R$220,00 | 3 a 5 dias úteis |

### Sul e Sudeste — 11 estados (+ Centro-Oeste)
São Paulo, Rio de Janeiro, Minas Gerais, Espírito Santo, Paraná, Santa Catarina, Rio Grande do Sul, Mato Grosso do Sul, Goiás, Distrito Federal, Mato Grosso

| Tarifa | Preço base | Grátis a partir de | Prazo |
|---|---|---|---|
| Frete grátis - Move Gourmet | R$25,00 | R$220,00 | 3 a 5 dias úteis |

**Comprovação (perfil com as 2 zonas configuradas):** [[assets/perfil-geral-2zonas-configurado-01jul2026.png]]

**Comprovação (visão geral de Frete e entrega — 1 perfil, 2 formas de entrega adicionais):** [[assets/frete-e-entrega-visao-geral-01jul2026.png]]

---

## Perfis excluídos ✅

- AMIGAS (ID 108353618156) — excluído (0 produtos)
- BRASIL TESTE (ID 108354011372) — excluído (produto movido para perfil geral)

---

## Retirada na loja ✅ CONCLUÍDO (01/07/2026)

**Local:** Move Gourmet - Shopping Barra
**Endereço:** Avenida Centenário, 2992, Shopping Barra (Salvador), 40157-150 Salvador/BA
**Status:** Ativo

**Configuração:**
- Data de retirada prevista: **Normalmente pronto em 1 hora** (ajustado 01/07/2026 — produtos aquecem rápido, confirmado pela Nat)
- Transferência entre lojas: habilitada a partir de Rua Dr Gerino Silva (mantém a retirada disponível no checkout)

> ⚠️ **Ressalva importante (estoque da retirada):** a loja do Shopping Barra controla
> estoque em outro sistema (**Linx**), separado do Omie. Hoje a disponibilidade da retirada
> no site é um contorno técnico (empresta do saldo de Salvador via transferência).
> **Aconselhável:** se quiserem manter a função de retirada no site de forma confiável,
> o estoque da loja deveria ser **gerido pelo Omie** (ex.: depósito próprio "Loja Shopping
> Barra" no Omie, que sincroniza pro Shopify). Sem isso, a retirada fica "melhor esforço"
> amarrada ao estoque de Salvador. Detalhes em [[Omie - Mapeamento Estoque - Jul 2026]].

**Horário de funcionamento:**
- Segunda a sábado: 09h às 22h
- Domingo: 12h às 20h

**Notificação ao cliente:**
> Seu pedido está pronto para retirada na nossa loja no Shopping Barra. Funcionamos de segunda a sábado das 09h às 22h e domingo das 12h às 20h. IMPORTANTE: Traga este e-mail ao retirar.

**Exibição no checkout:** GRÁTIS / Normalmente pronto em 1 hora

**Comprovação:** [[assets/retirada-loja-pronto-1hora-01jul2026.png]]

---

## Frenet — MANTER (não configurar)

O Frenet é usado exclusivamente para produto congelado com entrega com hora marcada via transportadora especializada. Não mexer.

---

## Pendentes

- [x] **Retirada na loja** — configurado em 01/07/2026 no Shopping Barra (Salvador)
- [ ] Configurar Melhor Envio com CEP SP como origem para pedidos do SP
- [x] ~~Omie: criar "Depósito São Paulo" via API~~ — já existe (código 09, criado 15/05/2026). Detalhes em [[Omie - Mapeamento Estoque - Jul 2026]]
- [ ] Omie: remover app legado "Omie Move Gourmet" (ver [[Omie - Mapeamento Estoque - Jul 2026]])
