---
id: STORY-004
titulo: "Orçamento Anual (importação + cadastro)"
fase: 1
modulo: orcamento
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-004 — Orçamento Anual (importação + cadastro)

## Contexto

Cada departamento tem uma verba anual orçada (valor mensal × 12). O financeiro cadastra/importa esse orçamento, que é a base do painel orçado vs. realizado. Os dados de 2026 já existem.

## Spec de Referência

- [[Orçamento 2026]]

## Critérios de Aceite

- [ ] Tabela `orcamentos`: departamento, ano, valor mensal, valor anual (mensal × 12) — UNIQUE (departamento, ano)
- [ ] Importação de planilha (CSV/Excel): departamento + ano + valor; validação e relatório de erros
- [ ] Cadastro/edição manual do orçamento pelo financeiro
- [ ] Seed do orçamento 2026 (dados já recebidos)
- [ ] Cálculo de valores no backend (nunca confiar no frontend)
- [ ] RLS: financeiro/admin gerenciam; líder lê o orçamento dos seus departamentos

## Dependências

STORY-003. Habilita 008.

## Notas

Planilha de orçado vs. realizado até abril será enviada por JG — pode ajustar o formato de importação.
