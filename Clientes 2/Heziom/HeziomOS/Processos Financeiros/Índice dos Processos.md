---
tags: [processos, financeiro, indice]
criado: 2026-05-07
---

# Índice dos Processos Financeiros — Heziom

Mapa central de todos os processos financeiros documentados pelo time da Heziom. Cada processo está classificado quanto ao seu status no HeziomOS.

**Legenda de status HeziomOS:**
- 🟢 **Substituído** — HeziomOS automatiza/substitui o processo manual
- 🟡 **Otimizado** — HeziomOS melhora o processo, mas mantém intervenção humana
- 🔵 **Mantido** — continua no Literarius, HeziomOS só lê/exibe os dados
- ⚪ **A definir** — ainda não decidido

---

## KR 1 — Contabilidade Mensal

→ [[KR1 — Contabilidade Mensal]] — detalhamento completo dos 19 subprocessos

| # | Processo | Frequência | Status HeziomOS | Fase |
|---|----------|-----------|-----------------|------|
| 01 | Relação de NFs emitidas por número | Mensal | 🟢 Substituído | 1 |
| 02 | Envio da movimentação física | Mensal | 🔵 Mantido | — |
| 03 | Direitos autorais | Mensal | 🔵 Mantido (Literarius nativo) | — |
| 04 | Despesas postais sobre mercadorias | Mensal | 🔵 Mantido | — |
| 05 | Comissões por vendas | Mensal | 🟡 Otimizado | 2 |
| 06 | Cartões de crédito (3 cartões) | Mensal | 🟢 Substituído | 2 |
| 07 | Custo de mercadorias vendidas (CMV) | Mensal | 🟡 Otimizado | 3 |
| 08 | Fornecedores a pagar | Mensal | 🟢 Substituído | 2 |
| 09 | Controle de estoques | Mensal | 🟡 Otimizado | 3 |
| 10 | Faturamento mensal setorizado e saldos | Mensal | 🟢 Substituído | 1 |
| 11 | Extrato Pagar.me / APPMAX | Mensal | 🟢 Substituído | 2 |
| 12 | Extrato Amazon | Mensal | 🟢 Substituído | 2 |
| 13 | Levantamento por competência (5 canais) | Mensal | 🟢 Substituído | 2 |
| 14 | Extrato Santander | Mensal | 🟢 Substituído | 2 |
| 15 | Extrato Stone | Mensal | 🟢 Substituído | 2 |
| 16 | Extrato Mercado Pago | Mensal | 🟢 Substituído | 2 |
| 17 | Extrato Aplicação Financeira Santander | Mensal | 🟡 Otimizado | 2 |
| 18 | Fluxo de Caixa com identificação das contas | Mensal | 🟢 Substituído | 1 |
| 19 | NFs recebidas e emitidas | Mensal | 🟢 Substituído | 2 |

---

## KR 2 — Consignação

→ [[KR2 — Consignação]] — detalhamento dos fluxos

| Processo | Frequência | Status HeziomOS | Fase |
|----------|-----------|-----------------|------|
| Consignação Concedida (envio + acerto) | Contínuo | 🟡 Otimizado | 3 |
| Consignação Recebida (troca de notas + acerto) | Contínuo | 🟡 Otimizado | 3 |

---

## KR 3 — Dia a Dia

→ [[KR3 — Dia a Dia]] — detalhamento dos 10 processos rotineiros

| Processo | Frequência | Status HeziomOS | Fase |
|----------|-----------|-----------------|------|
| Emissão de boletos | Diário | 🔵 Mantido | — |
| Cancelamento de boletos | Conforme necessidade | 🔵 Mantido | — |
| Estorno | Conforme necessidade | 🔵 Mantido | — |
| Recepção de NFs | Diário | 🟢 Substituído | 2 |
| Verificar NFs recebidas no e-mail | Diário | 🟢 Substituído | 2 |
| Boletos em aberto para cobrar | Diário | 🟢 Substituído | 1 |
| OFX Santander e Stone | Diário | 🟢 Substituído | 2 |
| Contas a pagar | Diário | 🟢 Substituído | 2 |
| Comprovante de vendas | Diário | 🔵 Mantido | — |

---

## Outros Processos

→ [[Outros Processos]] — processos sem KR definido

| Processo | Frequência | Status HeziomOS | Fase |
|----------|-----------|-----------------|------|
| Fluxo de Caixa (geral) | Mensal | 🟢 Substituído | 1 |
| Antecipação de recebíveis Amazon | Eventual | ⚪ A definir | — |
| Faturamento Bookwire | Mensal | 🟡 Otimizado | 3 |
| Devolução de compra | Conforme necessidade | 🔵 Mantido | — |

---

## Mapa de Automação

→ [[Mapa de Automação]] — priorização por impacto e fase

---

## Ver também

- [[HeziomOS — Arquitetura]] — stack técnico e decisões
- [[Mapa de Dados]] — módulos × fontes de dados
- [[Backlog]] — stories por fase
- [[Premissas e Entendimentos]] — o que está validado
