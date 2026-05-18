---
sprint: 4
titulo: Sistema Financeiro Completo
inicio: 2026-05-08
status: em_andamento
---

# SPRINT 4 — Sistema Financeiro Completo

## Objetivo

Entregar um sistema financeiro funcional e completo para o cliente, com UI simples e intuitiva. O cliente gerencia suas financas sem saber nada de contabilidade. A traducao contabil acontece automaticamente nos bastidores e fica invisivel para ele.

## Principios

1. **UI simples** — linguagem de leigo, zero jargao contabil
2. **Multi-tenant** — RLS em tudo, isolamento total entre clientes
3. **Traducao robusta** — motor automatico resolve debito/credito/historico sem intervencao humana
4. **Minimo trabalho do contador** — so conferir, nunca refazer

## Stories

| # | Story | Prioridade | Estimativa |
|---|-------|-----------|------------|
| 011 | Contas Bancarias e Caixa | Alta | M |
| 012 | Lancamentos CRUD Completo | Alta | L |
| 013 | Extrato e Filtros | Alta | M |
| 014 | Motor de Traducao Contabil | Alta | L |
| 015 | Dashboard Financeiro Cliente | Media | M |
| 016 | Gestao Clientes + Usuarios | Alta | L |

---

## Dependencias

```
STORY-011 (Contas) ──┐
                     ├──→ STORY-013 (Extrato por conta)
STORY-012 (CRUD)  ───┤
                     └──→ STORY-014 (Motor Traducao) ──→ STORY-015 (Dashboard)
STORY-016 (Gestao) — independente
```

## Entrega Esperada

Ao final do Sprint 4, o cliente deve conseguir:
- Cadastrar suas contas bancarias
- Registrar receitas e despesas (manual ou planilha)
- Ver extrato por conta, por periodo, por categoria
- Editar/excluir lancamentos pendentes
- Ver dashboard com fluxo de caixa e totais

E o contador deve:
- Ver lancamentos ja traduzidos automaticamente
- Apenas conferir e aprovar (trabalho minimo)
- Exportar para Contmatic sem retrabalho
