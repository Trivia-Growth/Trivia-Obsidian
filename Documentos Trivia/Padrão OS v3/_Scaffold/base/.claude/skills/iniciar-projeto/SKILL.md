---
name: iniciar-projeto
description: Use no kickoff de um projeto novo que segue o Padrão OS — quando o pedido for "iniciar o projeto seguindo o padrão", "começar com essas especificações" ou "peça para os agentes do Triviaiox desenvolverem". Decide o perfil, preenche PROJECT.md, decompõe as especificações em features (epics) e aciona a cadeia de agentes na ordem canônica, anunciando cada etapa. Agente: @pm orquestra. Acione com /iniciar-projeto.
---

# Skill: Iniciar projeto (kickoff do Padrão OS)

Transforma um pedido de kickoff (uma frase + especificações) em um projeto rodando pela esteira
SDD, **sem depender de o humano saber comandos de cor**. **Dono:** `@pm` orquestra; cada etapa é
do agente dono dela (ver `AGENTS.md`).

> **Regra de transparência (vale para todas as fases):** antes de produzir qualquer artefato,
> anuncie `[@agente] vou produzir <artefato> porque <motivo>`; ao concluir, diga onde ficou e o
> que o próximo agente consome dele. O humano acompanha por esses anúncios — não trabalhe em
> silêncio.

## Fase 0 — Reconhecimento (gate: contexto confirmado)
1. Confirme que o scaffold está na raiz (`CLAUDE.md`, `specs/`, `docs/PROJECT.md`). Se não
   estiver, pare: instrua a copiar `_Scaffold/base/` primeiro (ver `README.md` do scaffold).
2. Leia o contexto base do `CLAUDE.md` (STATE, PROJECT, spec ativa se houver).
3. Liste **o que o usuário forneceu** (especificações, docs, links) e o que falta. Se as
   especificações não vieram, pare e peça — não invente requisito (stop-condition).

## Fase 1 — Perfil e fundação (`@pm` + `@architect`)
1. **Perfil:** todo projeto começa **single-repo**. Só proponha OS se as especificações já
   mostram fronteiras de domínio reais (`03`/`ANTI-PADROES.md`) — e mesmo assim **pergunte**,
   é decisão de negócio.
2. Preencha `docs/PROJECT.md` (nome, perfil, objetivo, stack se divergir da referência) e semeie
   `docs/glossary.md` com os termos que já aparecem nas especificações.
3. Anuncie: perfil escolhido e por quê.

## Fase 2 — Decompor as especificações em features/epics (`@pm` + `@analyst`)
1. Quebre as especificações em **features candidatas** — cada uma virará uma pasta
   `specs/NNNN-<slug>/` (no vocabulário Triviaiox: um **epic**; ver a tabela de equivalência em
   `AGENTS.md`).
2. Para cada feature, decida o **tier** (pergunta do `CLAUDE.md`: decisão difícil de reverter ou
   fronteira de domínio nova?) e a **ordem** (dependências primeiro; menor fatia que prova valor
   primeiro — `ANTI-PADROES.md`).
3. **Apresente o plano ao humano antes de executar:** lista de features, tier de cada uma, ordem,
   e quais agentes entram em cada etapa. Este é um **gate humano** — kickoff define a direção do
   projeto inteiro; espere confirmação (ou ajuste) antes da Fase 3.

## Fase 3 — Executar a esteira, feature a feature
Para cada feature aprovada, rode a `/nova-feature` respeitando os donos:
1. `@pm`/`@analyst` → `product.md` (tier arquitetural) e `spec.md` com AC testáveis. Ambiguidade
   ramificada → `/clarificar`.
2. `@architect` → `design.md`/`domain.md`/ADR **só no tier que exige**. Toda decisão difícil de
   reverter vira **ADR anunciado** (`docs/adr/`): o humano deve conseguir ler o porquê sem
   perguntar.
3. `@security` → threat model se a feature toca auth/PII/financeiro/integração externa.
4. `@sm` → `tasks.md` (cada task = uma *story* Triviaiox: mapeia `AC-N` por extenso + gate
   executável).
5. `@dev` → implementa task a task (1 commit por task, git local). Feature de IA/LLM soma
   `@prompt-engineer` (trilha `ia/`).
6. `@qa` → `/validar` (PASS/CONCERNS/FAIL pelos gates, não por inspeção).
7. `@devops` → **único** que faz push/PR quando o humano pedir entrega.

## Fase 4 — Fechar o kickoff
- Atualize `docs/STATE.md`: features abertas, próxima ação, decisões e bloqueios.
- Resuma para o humano: artefatos criados (com caminhos), decisões tomadas (ADRs) e o que
  depende dele.

## Stop-conditions específicas do kickoff
- Especificações ausentes, contraditórias ou que exigem decisão de negócio → **pare e pergunte**
  (não use modo autônomo para decidir escopo de produto).
- O plano da Fase 2 passou sem confirmação humana → não avance para a Fase 3.
- Tentação de criar monorepo/abstração "por precaução" → `ANTI-PADROES.md` vence.
