---
title: "13/04/2026 — Agencia Head: Saturação + Parametrização"
tags: [decisao, agencia-head, sessao, memory, jimmy-studio]
created: 2026-04-17
---

# Agencia Head — Saturação de Sessão + Parametrização Completa

## Parte 1: Reset de sessão saturada

**Problema:** `agencia-head` retornava `"pending"` em toda chamada do trivia. `contextTokens: 200000`.

**Fix:**
1. Transcript `0b1a0a8d-...jsonl` (240K) arquivado com `.reset.` no nome
2. Chave `agent:jimmy-agencia-head:main` removida de `sessions.json`
3. MEMORY.md estava com 20.867 chars (acima do limite de 20.000) → seções de 06-10/04 arquivadas em `memory/YYYY-MM-DD.md`

**Resultado:** respondeu em ~2s com `input: 80` tokens.

## Parte 2: Parametrização do AGENTS.md

- Colaboradores com WA/Teams IDs inline
- Notas sobre grupos mistos (cliente + colaborador)
- Tabela de correspondência de 11 marcas: CLI + colaborador responsável
- Skill `producao-trivia`: referência à tabela em vez de bloqueio por mapeamento ausente

## Parte 3: Fix sessionKey Canal Gestão

SessionKey stale `agent:main:msteams:channel:...` → `agent:jimmy-agencia-head:msteams:channel:19:mr1a9bdc...`. Corrigido em AGENTS.md, SKILL.md, BOOTSTRAP.md, TOOLS.md e nos dois crons.

**Descoberta:** incoming webhook do Teams é incompatível com bot framework → `sessions_history` do Canal Gestão sempre vazio.

## Parte 4: Fix API Jimmy Studio org target

Raiz: super admin key cai na org do admin (27 marcas de terceiros). Fix: `DEFAULT_TARGET_ORG_ID = "52327e6e-8c43-4086-bce7-cc8da7ab57ff"` como fallback no `jimmy-studio-api.js`.

## Partes 5-7: Diversas melhorias

- `full_production` como fonte oficial de relatórios
- Normalização de marcas mirror (metas dobradas no backend)
- `sync-all` com `mode: "full"` (500 posts) por padrão
- SLA de publicação cadence-aware (threshold dinâmico por marca)
- Template estruturado dos relatórios 07h com seções canônicas
- Crons 07h e SLA: modelo migrado para `openrouter/` prefix
- `agencia-head-sla-publicacoes` habilitado
