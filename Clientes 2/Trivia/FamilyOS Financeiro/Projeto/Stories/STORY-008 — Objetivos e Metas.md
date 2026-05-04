---
id: STORY-008
titulo: "Objetivos e Metas (criação conversacional, progresso, metas compartilhadas)"
fase: 2
modulo: M4 Metas
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-008 — Objetivos e Metas

## Contexto

Metas são criadas em conversa com o agente — não em formulário. O agente faz perguntas de refinamento (prazo, prioridade, fonte) e cria a meta estruturada. Progresso baseado no histórico real de poupança, não em números aspiracionais.

## Spec de Referência

- [[00 - Índice]] — Módulo M4
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M4
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Regras de metas

## Critérios de Aceite

> *(A detalhar ao final da Fase 1)*

- [ ] CA1 — Criação conversacional: "quero juntar 30k pra reserva de emergência" → agente refina → meta criada
- [ ] CA2 — Tipos: reserva de emergência, viagem, bem material, investimento, aposentadoria, livre
- [ ] CA3 — Progresso com projeção de conclusão baseada na média das últimas 3 contribuições mensais
- [ ] CA4 — Sugestão de ajuste: "cortar R$ 400 em delivery = meta 2 meses antes"
- [ ] CA5 — Metas compartilhadas: múltiplos membros contribuindo, histórico visível
- [ ] CA6 — Tool `get_goals_status` para o agente consultar progresso

---

## Notas e Decisões

- `current_amount` calculado somando `goal_contributions` — nunca editado diretamente
- Detalhamento completo desta story ocorre no início da Fase 2
