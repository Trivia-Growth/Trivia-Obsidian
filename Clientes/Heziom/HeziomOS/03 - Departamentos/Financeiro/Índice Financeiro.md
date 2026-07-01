---
tags: [heziom, financeiro, módulo]
status: em-desenvolvimento
criado: 2026-05-19
fase: 1 (prioridade máxima)
substitui: Power BI externo + planilhas Excel + processos manuais
---

# Financeiro — Índice do Módulo

> ⚠️ **ATUALIZADO 2026-07-01 — leia antes de usar os status abaixo.** O que está **em produção** hoje (Épico 10, Story 10.1, em `develop`) é o conjunto de **dashboards de LEITURA** sobre o espelho `lit_mirror_financeiro`: Dashboard CEO, DRE (por CentroResultado), Posição Financeira, Contas a Receber (aging), Estoque, Faturamento (`apps/web/src/features/financeiro`). **NÃO estão em produção:** conciliação bancária automática, CNAB 240, captura Qive de NF-e, aprovação de pagamentos por alçada — parte disso existe só na branch **não mergeada** `feat/10-financeiro-fase2` (e mesmo lá sem CNAB, com conciliação virada read-only). Onde este índice marcar esses itens como "⬜ Fase 1 / não iniciado", está **subestimando** (o dashboard já existe); onde as notas KR marcarem como "🟢 Substituído", está **inflando**. Fonte de verdade: `docs/epics/epic-10-financeiro.md`.

> _(Texto original:)_ Módulo prioritário do HeziomOS (definido pelo CEO). Absorve dashboards, DRE, fluxo de caixa, aprovação de pagamentos, conciliação bancária e agente financeiro autônomo.
> Referência: [[Mapeamento Completo da Operação Heziom]] §8

---

## Equipe

- 2 internos
- Meta do CEO: 1 pessoa gerencia tudo com suporte de agentes autônomos

---

## Estrutura de Custos 2025

| Item | % faturamento |
|---|---|
| CPV | 38% |
| Despesas fixas | 37,7% |
| Despesas variáveis | 11,5% |
| Resultado líquido | 12,7% |

---

## Dores Centrais

1. **Fluxo de caixa manual** — sem posição consolidada de todos os bancos
2. **Fechamento mensal moroso** — 30 dias para Contábil Ribeiro fechar DRE
3. **530+ tarefas acumuladas** no ClickUp financeiro
4. **Dupla digitação** entre Literarius, Tray e planilhas

---

## Módulos (já desenhados na Arquitetura)

| Módulo | Status | Nota |
|---|---|---|
| [[Dashboard CEO]] | ⬜ Fase 1 | Posição financeira, DRE MTD, faturamento/canal |
| [[DRE e Fluxo de Caixa]] | ⬜ Fase 1 | Auto-DRE mensal, projeção 90d |
| [[Contas a Receber]] | ⬜ Fase 1 | Aging, inadimplência |
| [[Contas a Pagar]] | ⬜ Fase 1 | Títulos, aprovação |
| [[Aprovação de Pagamentos]] | ⬜ Fase 2 | Alçadas + CNAB 240 |
| [[Conciliação Bancária]] | ⬜ Fase 2 | OFX × baixas (meta >95% auto) |
| [[Agente Financeiro — Prompt]] | ⬜ Fase 3 | Identifica obrigações, prepara fila |
| [[Comissões e Repasses]] | ⬜ Fase 2 | Receita líquida por canal |
| [[Gestão de Estoque e CMV]] | ⬜ Fase 2 | CMV real, cobertura, consignações |

---

## Fluxo de Pagamentos (5 camadas)

1. Agente HeziomOS identifica obrigações (padrões recorrentes)
2. Prepara fila → validação do responsável OU auto-aprovação (configurável)
3. Literarius centraliza lançamento + gera CNAB
4. Santander executa com dupla aprovação de diretores (fora do sistema)
5. Usuários operam com permissão de lançamento e consulta apenas

---

## Bancos e Recebimento

| Banco/Gateway | Função |
|---|---|
| Santander | Conta principal, CNAB, boletos |
| Stone | Maquininhas livraria + PIX |
| AppMax | Gateway D2C (via Tray) |
| Mercado Pago | Repasse ML |
| Vindi | Recorrência (futuro) |

---

## Fontes de Dados

- Literarius SQL: `TituloFinanceiro` (50k), `TituloFinanceiroBaixa` (30k), `ContaBancaria` (11), `PlanoConta` (115)
- Literarius REST: 🆕 `TTituloFinanceiroController/Receber` e `/Pagar` (liberado 15/05/2026)
- Tray: `GET /payments` (price_seller = receita líquida)
- OFX: extratos Santander (upload manual MVP → API Fase 2)
- Qive: NF-e recebidas (manter ou substituir — Fase 3)

---

## Processos Repetitivos a Automatizar

- Conciliação de boletos com NF-e
- Classificação de despesas
- Geração de DRE semanal
- Identificação de obrigações de pagamento recorrentes
- Preparo da fila de pagamentos
- Separação de documentação para contabilidade

---

*Fase: 1 (prioridade máxima) · CEO: "financeiro é a área prioritária"*
