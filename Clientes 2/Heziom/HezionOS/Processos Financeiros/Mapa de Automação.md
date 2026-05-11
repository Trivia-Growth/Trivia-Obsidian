---
tags: [processos, automacao, priorizacao, roadmap]
criado: 2026-05-07
---

# Mapa de Automação — Processos Financeiros × HeziomOS

Visão consolidada de todos os processos financeiros, seu potencial de automação e em qual fase do HeziomOS cada um será endereçado.

---

## Priorização por Impacto

### 🔴 Alto Impacto — Fase 1 (já em desenvolvimento)

| Processo | KR | Frequência | Esforço atual | O que o HeziomOS entrega |
|----------|----|-----------|---------------|--------------------------|
| Faturamento setorizado por canal | KR1 #10 | Mensal | Alto (manual) | Dashboard em tempo real — STORY-004 |
| Boletos em aberto / aging | KR3 #06 | Diário | Médio | Aging visual no Dashboard CEO — STORY-004 |
| Fluxo de Caixa (posição atual) | Outros | Mensal | Alto | DFC automático — STORY-004/005 |
| Sync de títulos e contas bancárias | — | — | — | Base de dados do sistema — STORY-002 |
| Sync de NFs e pedidos | — | — | — | Base de dados do sistema — STORY-003 |

---

### 🟠 Alto Impacto — Fase 2

| Processo | KR | Frequência | Esforço atual | O que o HeziomOS entrega |
|----------|----|-----------|---------------|--------------------------|
| Cartões de crédito (3 cartões) | KR1 #06 | Mensal | **Muito alto** (ChatGPT manual) | Import automático de faturas → títulos |
| Levantamento por competência (5 canais) | KR1 #13 | Mensal | **Muito alto** (canal por canal) | Conciliação unificada de todos os canais |
| Contas a pagar | KR3 #08 | Diário | Alto | Fila de aprovação + CNAB 240 |
| OFX Santander e Stone | KR3 #07 | Diário | Médio | Conciliação automática >90% |
| Recepção de NFs (fornecedores) | KR3 #04 | Diário | Médio | Qive captura automático via SEFAZ |
| Verificar NFs no e-mail | KR3 #05 | Diário | Médio | Eliminado — Qive monitora SEFAZ |
| Extratos (APPMAX, Amazon, Stone, Mercado Pago, Santander) | KR1 #11–16 | Mensal | Alto | Sync via API de cada canal |
| Fornecedores a pagar | KR1 #08 | Mensal | Alto | Fila aprovação + CNAB |
| Comissões por vendas | KR1 #05 | Mensal | Médio | Cálculo automático via ComissaoParametro |

---

### 🟡 Médio Impacto — Fase 3

| Processo | KR | Frequência | Esforço atual | O que o HeziomOS entrega |
|----------|----|-----------|---------------|--------------------------|
| Consignação concedida (aging) | KR2 | Contínuo | Alto | Aging R$1,15M + alertas de prazo |
| Consignação recebida | KR2 | Contínuo | Médio | Visibilidade de estoque sob custódia |
| CMV e controle de estoques | KR1 #07/#09 | Mensal | Médio | CMV real via Qive + posição por setor |
| Faturamento Bookwire | Outros | Mensal | Alto (100% manual) | Upload relatório → sugestão de NFs |
| Antecipação Amazon | Outros | Eventual | Baixo | Alerta de recebível disponível |

---

### 🟢 Mantido no Literarius (fora do escopo de automação)

| Processo | Motivo |
|----------|--------|
| Emissão de boletos | Escrita no Literarius — não prevista nesta fase |
| Cancelamento/estorno | Escrita no Literarius |
| Direitos autorais | Literarius já automatiza nativo |
| Envio de movimentação física | Processo administrativo externo (contabilidade) |
| Despesas postais | Lançamento manual de baixo volume |
| Comprovante de vendas (NF) | Emissão de NF no Literarius |
| Devolução de compra | Escrita no Literarius |

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
