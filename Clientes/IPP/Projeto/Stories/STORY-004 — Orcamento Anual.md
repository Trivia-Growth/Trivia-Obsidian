---
id: STORY-004
titulo: "Orçamento Anual (importação + cadastro)"
fase: 1
modulo: orcamento
status: em-review
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-004 — Orçamento Anual (importação + cadastro)

## Contexto

Cada departamento tem uma verba anual orçada (valor mensal × 12). O financeiro cadastra/importa esse orçamento, que é a base do painel orçado vs. realizado. Os dados de 2026 já existem.

## Spec de Referência

- [[Orçamento 2026]]

## Critérios de Aceite

- [x] Tabela `orcamentos`: departamento, ano, valor mensal, valor anual (mensal × 12) — UNIQUE (departamento, ano)
- [x] Importação de CSV: casa por nome do departamento; aceita valor mensal ou anual (deriva mensal = anual/12); relatório de não encontrados
- [x] Cadastro/edição manual do orçamento pelo financeiro (página `/orcamento`)
- [x] Seed do orçamento 2026 (total anual R$ 2.680.551)
- [x] Cálculo no backend: `valor_anual` é coluna GENERATED (mensal × 12) — não vem do frontend
- [x] RLS+FORCE: financeiro/admin gerenciam; líder lê só os seus

## Implementação

**Commit:** `7ba5c85` · **Migration:** `supabase/migrations/20260610140000_orcamentos.sql`.

- Banco: `orcamentos` com `valor_anual` GENERATED; RLS via `sou_responsavel`. Seed 2026 (22 deptos).
- Frontend: `features/orcamento` (página com totais + edição + import CSV, `lib/format` BRL). Nav "Orçamento".

## Segurança / verificação

- [x] anon lê `[]`; `valor_anual` calculado no banco (UMP 16.472,68 → 197.672,16)
- [x] Totais conferem na UI (anual R$ 2.680.551,00)

## Dependências

STORY-003. Habilita 008.

## Notas

Planilha de orçado vs. realizado até abril será enviada por JG — o import já aceita coluna mensal ou anual; ajustar colunas quando vier o formato real.
