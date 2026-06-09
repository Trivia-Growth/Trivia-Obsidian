---
id: STORY-012
titulo: "Validar e configurar os agentes Triviaiox"
fase: 2
modulo: "agentes"
status: backlog
prioridade: média
agente_responsavel: "@triviaiox-master"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-012 — Validar e configurar os agentes Triviaiox

## Contexto

> O Triviaiox-core (5.0.3) foi reinstalado no projeto e o squad `claude-code-mastery` adicionado. Falta **garantir que os agentes operam corretamente neste repositório**: o `devLoadAlwaysFiles` do `core-config.yaml` aponta para arquivos de padrão de desenvolvimento que precisam existir e estar alinhados à realidade do código (o `@dev` os carrega no boot). Além disso, a auditoria mostrou **drift** entre o que o `CLAUDE.md`/docs descrevem e o que o código realmente é — o que induz humanos **e agentes** ao erro.

Relacionado aos achados **#15, #20, #22, #66, #64, #47, #12** (documentação aspiracional tratada como descritiva). Parte do pedido de "verificar a parte de agentes".

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — nota "Drift entre documentação e código"
- [[O que é o Triviaiox]] · [[Equipe de Agentes]] · [[Ciclo de uma Story]] · [[Instalação]]

## Critérios de Aceite

- [ ] CA1 — Conferir o `core-config.yaml`: `devLoadAlwaysFiles`, `squadsLocation` e paths apontam para arquivos existentes; rodar o validador de agentes (`validate-agents`) sem erros.
- [ ] CA2 — `CLAUDE.md` e `architecture.md` **atualizados para refletir o código real** (não a arquitetura aspiracional `features/`/`config/env.ts`/`lib/query-client.ts`/testes que ainda não existem) — ou marcar claramente o que é "alvo" vs "atual".
- [ ] CA3 — Os 12 agentes core ativam e exibem o status do projeto corretamente (greeting sem erro de git/greenfield).
- [ ] CA4 — Definir, no vault, quais agentes/squads são usados neste projeto e para quê (ex.: `@dev` Dex, `@qa` Quinn, `@data-engineer` Dara, `@devops` Gage; squad `claude-code-mastery` para tarefas de Claude/MCP).
- [ ] CA5 — Limpar resíduos de instalação se houver (duplicatas de sync), garantindo que nenhum arquivo `" 2.ext"` volte ao repo.

---

## Implementação

> Preenchido pelo agente responsável.

**Status:** `em-progresso` | `concluido`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] `validate-agents` sem erros
- [ ] Docs alinhadas ao código real
- [ ] Agentes ativam corretamente
- [ ] Sem resíduos de instalação no repo

**Notas:**

---

## Notas e Decisões
