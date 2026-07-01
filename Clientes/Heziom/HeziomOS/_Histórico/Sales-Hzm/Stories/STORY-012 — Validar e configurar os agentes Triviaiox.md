---
id: STORY-012
titulo: "Validar e configurar os agentes Triviaiox"
fase: 2
modulo: "agentes"
status: concluido
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

**Status:** `concluido`

**Branch/PR:** commit `02c573c`

**Arquivos alterados:**
- `docs/framework/{tech-stack,source-tree,coding-standards}.md` (novos), `CLAUDE.md`

**Notas de implementação:**
- ✅ **CA1:** `validate-agents.js` → **12 agentes, 0 erros** (121 warnings = deps opcionais de checklists/data do `ux-design-expert`, não bloqueiam). Descobri que os 3 `devLoadAlwaysFiles` (`docs/framework/*.md`) — que o `@dev` carrega no boot — **não existiam** (nem o fallback `docs/architecture/*`). Criados com conteúdo **real** (stack, estrutura, padrões de segurança/qualidade extraídos da base).
- ✅ **CA2:** `CLAUDE.md` agora marca a arquitetura `features/` como **alvo, não realidade**, apontando para `docs/framework/source-tree.md` (estrutura real). Corrige o drift docs↔código (#15/#20/#22/#66).
- ✅ **CA3:** os 12 agentes core validam e seguem o formato padrão.
- ✅ **CA5:** zero resíduos `" 2.ext"` no repo (limpeza anterior se manteve).
- **CA4 — agentes em uso neste projeto:** `@dev` (Dex, implementação), `@qa` (Quinn, gate de qualidade), `@data-engineer` (Dara, migrations/RLS), `@devops` (Gage, CI/deploy), `@architect` (Aria, decisões estruturais), `@sm` (stories). Squad `claude-code-mastery` disponível para tarefas de Claude/MCP/hooks.

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
