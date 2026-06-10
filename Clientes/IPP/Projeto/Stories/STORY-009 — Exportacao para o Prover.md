---
id: STORY-009
titulo: "Exportação para o Prover"
fase: 1
modulo: exportacao
status: bloqueado
prioridade: alta
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-009 — Exportação para o Prover

## Contexto

Hoje o financeiro redigita os reembolsos no Prover. Esta story gera uma planilha **no formato padrão de importação do Prover**, com os reembolsos pagos já no plano de contas correto (categoria + item de cada departamento), eliminando a digitação manual. O Prover não aceita input por API — a entrada é por importação de planilha.

## Spec de Referência

- [[API Prover - Mapeamento Completo]]
- [[Orçamento 2026]] (mapeamento orçamento ↔ Prover)
- [[Departamentos (Sociedades e Ministérios)]]

## Critérios de Aceite

- [ ] Exporta os reembolsos `pagos` (por período) em Excel no **formato de importação do Prover**
- [ ] Cada reembolso mapeado para a **categoria + item** correta do departamento (plano de contas)
- [ ] Trata as divergências de agrupamento (Música e Coral, Mulher Esperança, grafias)
- [ ] Inclui todas as colunas exigidas pelo template do Prover (data, valor, conta, categoria, item, histórico, forma de pagamento, etc.)
- [ ] Camada de mapeamento `departamento → categoria/item Prover` configurável
- [ ] Geração no backend (Edge Function); arquivo baixável pelo financeiro

## Segurança 🔒

Exporta dados financeiros/PII → security-gate. Só financeiro/admin podem exportar.

## Bloqueio

⛔ **Bloqueada até receber o template padrão de importação do Prover** (JG vai enviar) — sem ele não dá para fixar as colunas nem o plano de contas.

## Dependências

STORY-005, STORY-006 + template do Prover.
