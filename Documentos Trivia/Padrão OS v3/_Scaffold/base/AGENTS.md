---
name: AGENTS
description: Quem produz/consome cada artefato SDD, autoridade de comando e mapa skill→agente Triviaiox. Puxe ao orquestrar o trabalho.
alwaysApply: false
---

# AGENTS.md — Agentes Triviaiox no Padrão OS

> **Codex (e qualquer agente que só leia este arquivo): leia `CLAUDE.md` antes de trabalhar.**
> Ele é a convenção base do projeto (tiers, spec como fonte da verdade, verificação de
> conhecimento, arquitetura em camadas). Este arquivo cobre só **quem faz o quê**.

O Padrão OS usa os agentes do **Triviaiox** para executar a **esteira SDD**. A regra de ouro:
**há um único conjunto de artefatos canônicos** — `product.md`, `domain.md`, `design.md`,
`spec.md`, `tasks.md` + ADR. Não existe "story" nem "epic" como artefatos paralelos; ambos são
**visões** dos artefatos canônicos (tabela de equivalência abaixo).

## Equivalência de vocabulário Triviaiox ⇄ Padrão OS
O core do Triviaiox pensa em `PRD → epic → story`; o Padrão OS pensa em
`product → spec → tasks`. É o **mesmo modelo** com nomes diferentes — use esta tabela, não
invente um artefato para "traduzir":

| Conceito Triviaiox | No Padrão OS | Onde vive |
|---|---|---|
| PRD | `product.md` | `specs/NNNN-*/product.md` (tier arquitetural) |
| **Epic** | **a feature: a pasta `specs/NNNN-<slug>/` inteira** | `spec.md` é o contrato do epic (AC) |
| Story | **uma task de `tasks.md`** (visão de execução) | linha da tabela de `tasks.md`, com `AC` e gate |
| Architecture doc | `design.md` + ADRs | `specs/NNNN-*/design.md`, `docs/adr/` |
| Epic context acumulado | `tasks.md` (status/notas) + `docs/STATE.md` | atualizados task a task |

> Quando um agente Triviaiox falar "crie o epic", entenda **"abra `specs/NNNN-<slug>/` pela skill
> `/nova-feature`"**. Quando falar "story", entenda **"task de `tasks.md`"**.

## Modelo de artefato canônico × agente
Cada artefato tem **um dono que produz** e **agentes que consomem**.

| Artefato (`specs/NNNN-*/`) | Responde | Produz (dono) | Consome | Quando |
|---|---|---|---|---|
| `product.md` | por quê / para quem | `@pm` (com `@analyst`) | todos | tier pequeno+ |
| `domain.md` | linguagem e modelo | `@architect` (com `@pm`) | `@dev`, `@qa` | quando há domínio novo |
| `design.md` | como (nível de sistema) | `@architect` | `@dev`, `@data-engineer`, `@qa` | **tier arquitetural** |
| `spec.md` | contrato (AC) | `@pm` | todos (oráculo de teste) | tier pequeno+ |
| `tasks.md` | decomposição + gates | `@sm` | `@dev`, `@qa` | tier pequeno+ |
| ADR (`docs/adr/`) | decisão durável | `@architect` | todos | decisão difícil de reverter |
| migrations/DDL | schema | `@data-engineer` | `@dev` | mudança de banco |

> O `@sm` **não cria um novo formato de story**: ele transforma a `spec.md` (AC) e o `design.md`
> em `tasks.md` — cada task mapeia um `AC-N` e tem um **gate executável**.

## Fluxo canônico (ciclo de uma feature)
```
@analyst/@pm  → product.md + spec.md (clarificar AC, fora-de-escopo)
@architect    → domain.md / design.md / ADR (só no tier que exige)
@sm           → tasks.md (AC → task → gate executável)
@dev          → implementa task a task (1 commit por task), local git só
@qa           → valida cada AC PELO GATE (não por inspeção); security gate
@devops       → único que faz git push / abre e faz merge de PR / CI/CD
```
Features de **IA/LLM** acrescentam `@prompt-engineer` (evals, versionamento de prompt, defesa
contra injection) e `@security`/`@qa` aplicam o **OWASP LLM Top 10** — ver `ia/`.
Trabalho que toca **auth/PII/financeiro/integração externa** exige threat model conduzido por
`@security` (`seguranca/threat-model.template.md`) antes do `@dev` começar.

### Transparência declarativa (requisito, não cerimônia)
A cada passo do fluxo, o agente **declara o que vai produzir e por quê** antes de produzir:
- ao assumir uma etapa: `[@agente] vou produzir <artefato> porque <tier/AC/decisão que o exige>`;
- ao concluir: onde o artefato ficou e o que o próximo agente deve consumir dele;
- decisão tomada de forma autônoma: registrada **no artefato** (ADR se durável; nota em
  `tasks.md`/`docs/STATE.md` se volátil) — nunca só no chat.
O humano acompanha o trabalho por esses anúncios e pelos artefatos — silêncio sobre "quem decidiu
o quê" é regressão, mesmo que o código saia certo.

## Autoridade de comando (do Triviaiox — respeitar)
- **`@devops` (Gage) — EXCLUSIVO:** `git push`, `git push --force`, `gh pr create/merge`,
  gestão de MCP, CI/CD, release. Todos os outros são **bloqueados** nestas operações.
- **`@dev` (Dex):** pode `git add/commit/status/branch/checkout/merge` **local**,
  `stash/diff/log`; **não** faz push nem mexe em AC/escopo/título da spec.
- **`@pm` (Morgan):** requirements, escrita de spec, épicos.
- **`@po` (Pax):** validação de story-draft (checklist), priorização de backlog.
- **`@sm` (River):** criação de `tasks.md`/draft a partir de spec/design.
- **`@architect` (Aria):** decisões de arquitetura, seleção de tecnologia, ADR; delega DDL
  detalhado a `@data-engineer`.
- **`@data-engineer` (Dara):** schema, migrations, otimização de query, RLS.

## Mapa skill (esteira SDD) → agente
As skills da esteira ficam em `.claude/skills/` e roteiam para os donos de comando:

| Skill | Faz | Agente |
|---|---|---|
| `/iniciar-projeto` | kickoff de projeto novo: perfil → PROJECT.md → cadeia de agentes → 1ª feature | `@pm` orquestra |
| `/clarificar` | entrevista para afiar spec ambígua (1 pergunta por vez) | `@pm` |
| `/nova-feature` | loop tier → spec → tasks → implementação | `@sm` + `@dev` |
| `/validar` | UAT local: roda gates (AC→teste), checa DoD | `@qa` |
| `/revisar-pr` | gate de conformidade SDD no PR | `@qa` |
| `/auditar` | valida integridade da esteira (frontmatter, links, rastreabilidade) | `@architect` |
| `/handoff` | pausa/retoma via `docs/STATE.md` | qualquer |

> Pedido tipo *"seguindo o padrão, vamos iniciar o projeto com essas especificações — peça para
> os agentes do Triviaiox desenvolverem"* → é o gatilho da `/iniciar-projeto`. Não pule para
> código: o kickoff decide perfil e tier e **anuncia** a cadeia de agentes antes de executar.
>
> **Codex:** as skills são playbooks em markdown puro — leia e siga
> `.claude/skills/<nome>/SKILL.md` (ex.: `.claude/skills/iniciar-projeto/SKILL.md` para o
> kickoff). Não dependem de mecanismo do Claude Code; valem para qualquer agente.

## Quadro completo de agentes (15)
`@triviaiox-master` (orquestra), `@pm`, `@po`, `@sm`, `@analyst`, `@architect`,
`@data-engineer`, `@dev`, `@qa`, `@security`, `@reliability`, `@prompt-engineer`,
`@ux-design-expert`, `@devops`, `@squad-creator`.

## Extensão da Trivia
Os ajustes da Trivia (config, rules, mapa de artefatos, subagentes Claude e hook de autoridade)
vivem no squad `squads/trivia-os/` — **nunca** no core do Triviaiox (`.triviaiox-core/`) dentro de
um projeto. Ver o README do squad. A autoridade do `@devops` é aplicada **tecnicamente** pelo
hook `enforce-git-push-authority.sh` (instalado pelo squad) — não dependa só desta prosa.
