---
title: Rotação do MEMORY.md
tags: [memory, rotacao, contexto, agentes]
created: 2026-04-17
updated: 2026-06-05
---

# Rotação do MEMORY.md

## Por que é necessário

O gateway trunca `MEMORY.md` ao atingir **20.000 chars**. Sem rotação, logs diários acumulam até o limite e o agente perde contexto ao inicializar.

## Verificar tamanho atual

```bash
wc -c /root/.openclaw/workspace-jimmy-agencia-head/MEMORY.md
wc -c /root/.openclaw/workspace-jimmy-sales-head/MEMORY.md
```

## Scripts de rotação

| Agente | Script | Crontab |
|--------|--------|---------|
| agencia-head | `workspace-jimmy-agencia-head/tools/memory-rotate.cjs` | Dom 23h30 BRT (seg 02h30 UTC) |
| sales-head | `workspace-jimmy-sales-head/tools/memory-rotate.cjs` | Dom 00h BRT (seg 03h UTC) |

## O que o script faz

1. **Arquiva arquivos diários antigos:** `memory/YYYY-MM-DD.md` com mais de 14 dias → `memory/archive/`
2. **Rotaciona seções datadas do MEMORY.md:** seções `## Relatório 07h DD/MM/YYYY` (e variantes) com mais de 2 dias → `memory/YYYY-MM-DD.md` (append se já existir)
3. **Reescreve o MEMORY.md** sem as seções arquivadas

## Execução manual

```bash
# Dry-run (só mostra o que faria)
node /root/.openclaw/workspace-jimmy-agencia-head/tools/memory-rotate.cjs --dry-run
node /root/.openclaw/workspace-jimmy-sales-head/tools/memory-rotate.cjs --dry-run

# Execução real
node /root/.openclaw/workspace-jimmy-agencia-head/tools/memory-rotate.cjs
node /root/.openclaw/workspace-jimmy-sales-head/tools/memory-rotate.cjs
```

## Estrutura de arquivos de memória

```
memory/
├── YYYY-MM-DD.md     ← logs diários dos últimos 14 dias
├── archive/
│   └── YYYY-MM-DD.md ← logs com mais de 14 dias
└── transcripts-seen.json  ← (sales-head) controle de transcrições processadas
```

## Incidente de referência

Em 13/04/2026 o `jimmy-agencia-head` ficou saturado com `contextTokens: 200000`. Reset de sessão + rotação manual do MEMORY.md (era 20.867 chars) resolveram. Ver [[Sessoes-Reset]] e [[2026-04-13-Agencia-Head-Parametrizacao]].
