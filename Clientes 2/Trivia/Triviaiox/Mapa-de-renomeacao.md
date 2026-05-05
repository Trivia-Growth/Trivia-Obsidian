# Mapa de Renomeação — aiox → triviaiox

Este documento registra o mapeamento de equivalência entre o projeto upstream (`aiox-core`) e este fork (`Triviaiox`).

**Data do fork:** 2026-05-05  
**Versão upstream:** SynkraAI/aiox-core v5.0.3  
**Destino:** Trivia-Growth/Triviaiox

---

## Strings substituídas

| Original | Triviaiox |
|----------|-----------|
| `Synkra AIOX` | `TriviaGrowth Triviaiox` |
| `SynkraAI/aiox-core` | `Trivia-Growth/Triviaiox` |
| `SynkraAI` | `Trivia-Growth` |
| `Synkra` | `TriviaGrowth` |
| `synkra` | `triviagrowth` |
| `SYNKRA` | `TRIVIAGROWTH` |
| `AIOX` | `TRIVIAIOX` |
| `Aiox` | `Triviaiox` |
| `aiox-core` | `triviaiox-core` |
| `aiox` | `triviaiox` |

## Diretórios renomeados

| Original | Triviaiox |
|----------|-----------|
| `.aiox/` | `.triviaiox/` |
| `.aiox-core/` | `.triviaiox-core/` |
| `packages/aiox-install/` | `packages/triviaiox-install/` |
| `packages/aiox-pro-cli/` | `packages/triviaiox-pro-cli/` |
| `packages/gemini-aiox-extension/` | `packages/gemini-triviaiox-extension/` |
| `.codex/skills/aiox-*/` | `.codex/skills/triviaiox-*/` |
| `.claude/agent-memory/aiox-*/` | `.claude/agent-memory/triviaiox-*/` |
| `.gemini/rules/AIOX/` | `.gemini/rules/TRIVIAIOX/` |
| `docs/*/aiox-workflows/` | `docs/*/triviaiox-workflows/` |
| `docs/*/aiox-agent-flows/` | `docs/*/triviaiox-agent-flows/` |

## Arquivos renomeados (principais)

| Original | Triviaiox |
|----------|-----------|
| `bin/aiox.js` | `bin/triviaiox.js` |
| `bin/aiox-init.js` | `bin/triviaiox-init.js` |
| `bin/aiox-graph.js` | `bin/triviaiox-graph.js` |
| `bin/aiox-minimal.js` | `bin/triviaiox-minimal.js` |
| `bin/aiox-ids.js` | `bin/triviaiox-ids.js` |
| `*/aiox-master.md` | `*/triviaiox-master.md` |
| `*/aiox-*.toml` | `*/triviaiox-*.toml` |
| `*/aiox-*.md` (agents) | `*/triviaiox-*.md` (agents) |

## Nota sobre CHANGELOG

O `CHANGELOG.md` mantém o histórico original do upstream com nota de fork no topo. O histórico do Triviaiox começa a partir do commit inicial deste fork.

## Escopo da operação

- **Arquivos processados:** 2.647
- **Arquivos com conteúdo modificado:** 2.068
- **Arquivos/diretórios renomeados:** 122
- **Substituições totais estimadas:** ~25.000
