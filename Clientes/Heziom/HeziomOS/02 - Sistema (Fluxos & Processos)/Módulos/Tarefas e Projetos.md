---
tags: [heziom, tarefas, projetos, módulo]
status: planejado
criado: 2026-05-19
fase: 2.1
substitui: ClickUp
---

# Tarefas e Projetos — Módulo Transversal

> Módulo que substitui o ClickUp em toda a operação. Boards por departamento, cross-triggers entre áreas, sprints pessoais, e tarefas automáticas geradas por eventos do sistema.
> Referência: [[Mapeamento Completo da Operação Heziom]] §11 e [[HeziomOS — Módulos e Escopo Completo]]

---

## Por que é prioridade (Fase 2.1)

- ClickUp acumula **530+ tarefas** só no financeiro
- É "board genérico, sem inteligência de processo"
- Avisos entre departamentos são **manuais** (vendedor avisa expedição, editorial avisa comercial)
- Substituir o ClickUp desbloqueia cross-triggers automáticos para todos os módulos

---

## Capacidades

| Funcionalidade | Descrição |
|---|---|
| Boards por departamento | Cada área tem seu kanban próprio |
| Cross-department triggers | "Editorial terminou → tarefa automática para Marketing" |
| Sprints pessoais | Coordenadores organizam suas próprias tarefas |
| Tarefas automáticas | Geradas por eventos (prazo editorial, pedido aprovado, alerta financeiro) |
| Visão CEO | Consolidada de todas as áreas |
| Prioridades e labels | Urgência + departamento + tipo |

---

## Cross-Triggers Mapeados

| Evento | Gera tarefa em | Conteúdo |
|---|---|---|
| Pedido atacado aprovado | Expedição | "Separar pedido #{num}" |
| Pedido atacado aprovado | Financeiro | "Gerar boleto para #{cliente}" |
| Plotter aprovado (editorial) | Editorial | "Solicitar orçamento gráfico de #{título}" |
| Arquivo editorial pronto | Comercial | "Iniciar pré-venda de #{título}" |
| Lançamento marcado (−30d) | Marketing | "Preparar campanha de #{título}" |
| Alerta financeiro | Financeiro | "Resolver: #{descrição do alerta}" |
| Atendimento escalou | Comercial | "Oportunidade de venda: #{cliente}" |

---

## Tabelas Supabase Propostas

```
tasks (id, title, description, department, board_id, status, assignee_id, due_date, priority, source_event, ...)
task_boards (id, name, department, columns_json, ...)
task_automations (id, trigger_event, action, target_board, template, conditions_json, ...)
task_comments (id, task_id, author_id, content, timestamp, ...)
```

---

## Integrações com Outros Módulos

- **Editorial:** Pipeline kanban de obras é um board especializado
- **Comercial:** Pipeline de vendas atacado
- **Financeiro:** Tarefas de conciliação, aprovação
- **Logística:** Separação e envio
- **Atendimento:** Tickets escalados
- **Pessoas:** Sprints individuais, tarefas de onboarding

---

*Fase: 2.1 · Prioridade: Máxima na Fase 2 (desbloqueia automações de todos os outros módulos)*
