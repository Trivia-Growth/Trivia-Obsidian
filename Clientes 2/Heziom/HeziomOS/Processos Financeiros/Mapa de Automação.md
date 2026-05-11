---
tags: [processos, automacao, priorizacao, roadmap]
criado: 2026-05-07
atualizado: 2026-05-11
---

# Mapa de Automação — Processos Financeiros × HeziomOS

Visão consolidada de todos os processos financeiros, seu potencial de automação e em qual fase do HeziomOS cada um será endereçado.

---

## Priorização por Impacto

### 🔴 Alto Impacto — Fase 1 (já em desenvolvimento)

| Processo | KR | Frequência | Esforço atual | O que o HeziomOS entrega | Link |
|----------|----|-----------|---------------|--------------------------|------|
| Faturamento setorizado por canal | KR1 #10 | Mensal | Alto (manual) | Dashboard em tempo real — STORY-004 | [[KR1 — Contabilidade Mensal#10 — Faturamento mensal setorizado e saldos\|→]] |
| Boletos em aberto / aging | KR3 #06 | Diário | Médio | Aging visual no Dashboard CEO — STORY-004 | [[KR3 — Dia a Dia#06 — Boletos em aberto para serem cobrados\|→]] |
| Fluxo de Caixa (posição atual) | Outros | Mensal | Alto | DFC automático — STORY-004/005 | [[Outros Processos#Fluxo de Caixa (geral)\|→]] |
| Sync de títulos e contas bancárias | — | — | — | Base de dados do sistema — STORY-002 | — |
| Sync de NFs e pedidos | — | — | — | Base de dados do sistema — STORY-003 | — |

---

### 🟠 Alto Impacto — Fase 2

| Processo | KR | Frequência | Esforço atual | O que o HeziomOS entrega | Link |
|----------|----|-----------|---------------|--------------------------|------|
| Cartões de crédito (3 cartões) | KR1 #06 | Mensal | **Muito alto** (ChatGPT manual) | Import automático de faturas → títulos | [[KR1 — Contabilidade Mensal#06 — Cartões de crédito\|→]] |
| Levantamento por competência (5 canais) | KR1 #13 | Mensal | **Muito alto** (canal por canal) | Conciliação unificada de todos os canais | [[KR1 — Contabilidade Mensal#13 — Levantamento por competência\|→]] |
| Contas a pagar | KR3 #08 | Diário | Alto | Fila de aprovação + CNAB 240 | [[KR3 — Dia a Dia#08 — Contas a pagar\|→]] |
| OFX Santander e Stone | KR3 #07 | Diário | Médio | Conciliação automática >90% | [[KR3 — Dia a Dia#07 — OFX Santander e Stone\|→]] |
| Recepção de NFs (fornecedores) | KR3 #04 | Diário | Médio | Qive captura automático via SEFAZ | [[KR3 — Dia a Dia#04 — Recepção de NFs\|→]] |
| Verificar NFs no e-mail | KR3 #05 | Diário | Médio | Eliminado — Qive monitora SEFAZ | [[KR3 — Dia a Dia#05 — Verificar NFs recebidas no e-mail\|→]] |
| Extratos (APPMAX, Amazon, Stone, Mercado Pago, Santander) | KR1 #11–16 | Mensal | Alto | Sync via API de cada canal | [[KR1 — Contabilidade Mensal#11 — Extrato Pagar.me / APPMAX\|→]] |
| Fornecedores a pagar | KR1 #08 | Mensal | Alto | Fila aprovação + CNAB | [[KR1 — Contabilidade Mensal#08 — Fornecedores a pagar\|→]] |
| Comissões por vendas | KR1 #05 | Mensal | Médio | Cálculo automático via ComissaoParametro | [[KR1 — Contabilidade Mensal#05 — Comissões por vendas\|→]] |
| NFs recebidas e emitidas | KR1 #19 | Mensal | Médio | Qive + sync STORY-003 | [[KR1 — Contabilidade Mensal#19 — NFs recebidas e emitidas\|→]] |
| Extrato Aplicação Financeira Santander | KR1 #17 | Mensal | Baixo | Exibe saldo consolidado | [[KR1 — Contabilidade Mensal#17 — Extrato de Aplicação Financeira Santander\|→]] |

---

### 🟡 Médio Impacto — Fase 3

| Processo | KR | Frequência | Esforço atual | O que o HeziomOS entrega | Link |
|----------|----|-----------|---------------|--------------------------|------|
| Consignação concedida (aging) | KR2 | Contínuo | Alto | Aging R$1,15M + alertas de prazo | [[KR2 — Consignação#Fluxo 1 — Consignação Concedida\|→]] |
| Consignação recebida | KR2 | Contínuo | Médio | Visibilidade de estoque sob custódia | [[KR2 — Consignação#Fluxo 2 — Consignação Recebida\|→]] |
| CMV e controle de estoques | KR1 #07/#09 | Mensal | Médio | CMV real via Qive + posição por setor | [[KR1 — Contabilidade Mensal#07 — Custo de mercadorias vendidas\|→]] |
| Faturamento Bookwire | Outros | Mensal | Alto (100% manual) | Upload relatório → sugestão de NFs | [[Outros Processos#Faturamento Bookwire\|→]] |
| Antecipação Amazon | Outros | Eventual | Baixo | Alerta de recebível disponível | [[Outros Processos#Antecipação de Recebíveis Amazon\|→]] |

---

### 🟢 Mantido no Literarius (fora do escopo de automação)

| Processo | Motivo | Link |
|----------|--------|------|
| Emissão de boletos | Escrita no Literarius — não prevista nesta fase | [[KR3 — Dia a Dia#01 — Emissão de Boletos\|→]] |
| Cancelamento/estorno | Escrita no Literarius | [[KR3 — Dia a Dia#02 — Cancelamento de Boletos\|→]] |
| Direitos autorais | Literarius já automatiza nativo | [[KR1 — Contabilidade Mensal#03 — Direitos autorais\|→]] |
| Envio de movimentação física | Processo administrativo externo (contabilidade) | [[KR1 — Contabilidade Mensal#02 — Envio da movimentação física\|→]] |
| Despesas postais | Lançamento manual de baixo volume | [[KR1 — Contabilidade Mensal#04 — Despesas postais sobre mercadorias\|→]] |
| Comprovante de vendas (NF) | Emissão de NF no Literarius | [[KR3 — Dia a Dia#09 — Comprovante de vendas\|→]] |
| Devolução de compra | Escrita no Literarius | [[Outros Processos#Devolução de Compra\|→]] |

---

## Ganho Estimado por Fase

```
Fase 1 — Visibilidade
  CEO tem resposta para "como estou hoje?" em 10 segundos
  Elimina: 1 relatório manual mensal de faturamento + montagem do DFC
  Tempo economizado: ~4–6h/mês

Fase 2 — Inteligência Assistida
  Maiores impactos: cartões (ChatGPT manual), 5 extratos mensais, OFX diário, contas a pagar
  Elimina: ~20–30h/mês de trabalho manual repetitivo
  Reduz erros de digitação e conciliação manual

Fase 3 — Autonomia
  Consignação, estoque/CMV, Bookwire
  Visibilidade dos R$1,15M em consignação → redução de receita travada
  Elimina: 8–12h/mês adicionais
```

---

## Decisões Pendentes

| Decisão | Impacto | Para quem |
|---------|---------|-----------|
| Threshold de alçada CEO para aprovação de pagamentos | Define o workflow de aprovação (Fase 2) | Heziom CEO |
| Prazo de repasse Tray/APPMAX | Define o trigger de alerta de atraso | Heziom Financeiro |
| Bookwire: formato do relatório | Define como parsear automaticamente (Fase 3) | Heziom + Bookwire |
| Antecipação Amazon: valor mínimo para alerta | Define o trigger de alerta | Heziom CEO |

---

Ver também: [[Índice dos Processos]] · [[Backlog]] · [[HeziomOS — Arquitetura]] · [[Roadmap]]
