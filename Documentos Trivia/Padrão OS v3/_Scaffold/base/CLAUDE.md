---
name: CLAUDE
description: Convenções do agente para o Padrão OS da Trivia (esteira SDD + Triviaiox). Sempre ativo.
alwaysApply: true
---

# CLAUDE.md — Padrão OS da Trivia (convenções para agentes de IA)

Este projeto segue o **Padrão OS v2** da Trivia: **Spec-Driven Development (SDD)** orquestrado
pelos agentes **Triviaiox**. Leia este arquivo antes de implementar qualquer coisa. **Ele é a
fonte da verdade que o agente lê em runtime** — a documentação no Obsidian (vault) é só espelho
humano.

> Idioma: **PT-BR com termos técnicos em inglês** (spec, AC, bounded context, story, gate, ADR,
> RLS, etc. não se traduzem).

## Perfil do projeto
Este scaffold serve a dois perfis. Confira em `docs/PROJECT.md` qual é o seu:
- **Single-repo (sistema isolado):** um repositório, uma funcionalidade/produto. Baseline de
  segurança mínimo (`seguranca/baseline-minimo.md`).
- **OS (monorepo multi-domínio):** N sistemas juntos. Aplica a `os-layer/` por cima desta base e
  segurança OS-grade (`os-layer/seguranca/os-grade.md`).

Comece **sempre** como single-repo; só **promova** para OS quando a fronteira de domínio exigir
(ver guia de promoção). Não monte monorepo "por precaução".

## Início de sessão — carregue o contexto base
**Garanta o contexto base antes da primeira tarefa — os docs `alwaysApply: true`:**
este `CLAUDE.md` · `docs/STATE.md` · `docs/PROJECT.md` · e a `spec.md` da feature ativa em
`specs/`.

Todos os outros docs são `alwaysApply: false` — **não os leia agora**. Puxe cada um **sob
demanda**, guiado pelo `description` no frontmatter dele.

## A spec é a fonte da verdade
- Implemente **a partir de** `specs/NNNN-*/spec.md`. Os critérios de aceite (`AC-N`, em
  Given/When/Then) são o contrato com o negócio e o oráculo de teste.
- Se a spec for ambígua ou estiver errada, **pare e pergunte** — não adivinhe. Atualizar a spec é
  decisão consciente, não efeito colateral do código.
- Nunca implemente além do escopo. **"Fora de escopo" é vinculante.**

## Verificação de conhecimento (nunca invente)
Antes de afirmar como algo funciona, siga esta ordem — pare assim que tiver a resposta:
1. **Padrões do próprio codebase** (como já é feito aqui).
2. **Docs do projeto** (`specs/`, `docs/`, ADRs, glossário).
3. **MCP** de referência (ex.: Context7, Supabase) quando conectado.
4. **Web/doc oficial** da tecnologia.
5. **Não encontrou? Diga "não sei" e sinalize.** Inventar API/padrão/comportamento causa falha em
   cascata. Incerteza explícita é melhor que chute confiante.

## Antes de codar — descubra o tier
Pergunta: *isso introduz decisão difícil de reverter ou nova fronteira de domínio?*
- **Trivial** (≤3 arquivos, sem decisão): só o PR (ou `specs/quick/` para deixar rastro).
- **Pequeno** (feature isolada, <10 tasks): exige `spec.md` + `tasks.md`.
- **Arquitetural** (novo bounded context, integração externa, decisão irreversível, mudança de
  schema com dado em produção): exige `design.md` aprovado **antes** de implementar. Se não
  existir, pare e sinalize.

> **Escalonamento dinâmico:** mesmo quando `tasks.md` é dispensado, **liste os passos atômicos
> antes de codar**. Se passar de ~5 passos ou tiver dependência complexa, **PARE e crie um
> `tasks.md` formal** — o tier real era maior do que parecia.

Antes de criar artefato, leia `ANTI-PADROES.md`: tem stop-conditions e "o que NÃO fazer".

## Quem faz o quê — agentes Triviaiox
O ciclo e a autoridade de cada agente estão em `AGENTS.md`. Resumo do fluxo canônico:
`@pm/@analyst` (product + clarificar) → `@architect` (design, ADR) → `@sm` (tasks executáveis) →
`@dev` (implementa por task) → `@qa` (valida AC pelo gate) → `@devops` (único com push).
Features de IA/LLM passam por `@prompt-engineer` (ver `ia/`).

## Linguagem ubíqua
- Use **exatamente** os termos de `docs/glossary.md` e do `domain.md` da feature. Mesmo nome no
  código, na spec e na conversa. Não invente sinônimos.
- Termo novo → adicione ao glossário no mesmo PR.

## Arquitetura em camadas (regra de dependência)
`src/` segue DDD tático. A dependência aponta **só para dentro**:

```
interfaces → application → domain ← infrastructure
```

- `domain/` não importa NADA de framework, I/O ou de outras camadas.
- `application/` orquestra casos de uso; depende só de `domain/`.
- `infrastructure/` implementa as portas definidas no domínio (repos, adapters).
- `interfaces/` é a borda (API/CLI/UI).

## Disciplina de contexto
Cada doc declara no frontmatter sua política de carregamento:
- `alwaysApply: true` — **contexto base**, leia em toda sessão.
- `alwaysApply: false` — **sob demanda**; o `description` diz **quando** puxá-lo.

### Orçamento de contexto (alvo)
- **Base (`alwaysApply: true`): ~15k tokens.** Se crescer, mova detalhe para docs on-demand.
- **Sob demanda: só o necessário.** Total carregado **< 40k**; reserve **160k+** para o trabalho.
- Estourou? **Delegue a subagente** (contexto isolado) em vez de inchar a sessão.

## Divergência da spec (SPEC_DEVIATION)
Se precisar fazer diferente do que a `spec.md` diz:
1. **Pare antes de seguir.** Marque no código/PR `// SPEC_DEVIATION: <motivo>` e registre em
   `tasks.md`.
2. Decida com o dono da spec: ou **corrige o código** (a spec vence) ou **atualiza a spec**
   conscientemente (e registra ADR se for difícil de reverter).
3. Nunca deixe código e spec divergentes em silêncio — é assim que a fonte da verdade apodrece.

## Segurança (por perfil)
- **Sempre:** sem secrets no client; validação de input com Zod na borda; JWT validado em toda
  função que toca dado; RLS habilitada em toda tabela. Ver `seguranca/baseline-minimo.md`.
- **OS-grade (monorepo multi-domínio):** RLS FORCE, schemas por domínio, `audit.*` append-only,
  secrets em Vault, refresh de OAuth. Ver `os-layer/seguranca/os-grade.md`.
- **Toda dívida de segurança aceita conscientemente** vai para `docs/SECURITY_DEBT.md`.

## Definition of Done e Padrão de Qualidade
Ver `Definition-of-Done.md` (gates executáveis). Resumo: AC verdes **pelo comando de teste** (não
por inspeção), análise estática limpa, sem `SPEC_DEVIATION` pendente, ADRs registrados, glossário
e `docs/STATE.md` atualizados. A **visão completa do que é garantido e como** (gate CI / hook /
checklist / guia) está em `PADRAO-DE-QUALIDADE.md`.

## Mapa de documentos sob demanda (puxe pelo `description`, não tudo de uma vez)
- **Qualidade:** `PADRAO-DE-QUALIDADE.md` (matriz), `testes/README.md`, `performance/README.md`.
- **Arquitetura/código:** exemplo de I/O em `specs/0002-registro-comissao/` (porta→adapter→
  caso de uso→borda→teste de integração→migration). Helpers: `src/shared/log.ts`,
  `src/interfaces/http/problem.ts`, `config/env.ts`.
- **Banco:** `db/README.md`, `db/rls.template.sql`, `db/rls-test.md` (single-repo: schema `public`).
- **Segurança:** `seguranca/baseline-minimo.md`, `seguranca/threat-model.template.md`,
  `os-layer/seguranca/os-grade.md` (OS).
- **Observabilidade/ops:** `observabilidade/README.md`, `observabilidade/slo-sli.template.md`,
  `runbooks/`, `docs/ENVIRONMENTS.md`.
- **Edge Functions (Supabase):** `supabase/functions/_template/index.ts` + `_shared/`.
- **IA/LLM:** `ia/` (só em feature com LLM).

## Memória de trabalho — `docs/STATE.md`
- **STATE.md é volátil** (em andamento, próximo passo, bloqueios); **ADR é durável** (decisão
  imutável). Decisão estrutural → ADR; estado do trabalho → STATE.
- Atualize ao pausar/encerrar; leia ao retomar. Use a skill `/handoff`.

## Onde escrever
- Decisão arquitetural durável → novo ADR em `docs/adr/` (nunca edite ADR antigo; crie um que o substitua).
- Estado do trabalho / próximo passo → `docs/STATE.md`.
- Termo de negócio → `docs/glossary.md`.
- Dívida de segurança → `docs/SECURITY_DEBT.md`.
