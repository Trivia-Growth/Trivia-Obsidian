---
id: STORY-008
titulo: "Correções de documentação do repositório"
fase: 1
modulo: "Documentação"
status: concluido
prioridade: media
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-008 — Correções de documentação do repositório

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) apontou documentação desatualizada
no repositório — em especial o `CLAUDE.md` apontando para o Supabase antigo, o que
pode levar a deploy no projeto errado. Ganho rápido e sem risco.

## Critérios de Aceite

- [x] CA1 — `CLAUDE.md`: referência ao Supabase corrigida para `eqsjvacbhrezlgqpwipv`
  (também corrigido em `docs/stories/STORY-001.md`)
- [x] CA2 — `README.md` reescrito com a identidade real do projeto
- [x] CA3 — Contagem de Edge Functions corrigida (21) em `CLAUDE.md` e `architecture.md`
- [x] CA4 — `SECURITY_DEBT.md` / `architecture.md`: escopo de `verify_jwt = false`
  corrigido (17 funções, não só webhooks)
- [x] CA5 — Novos itens de segurança do diagnóstico registrados no `SECURITY_DEBT.md`
  (SEC-008 a SEC-016)

## QA

**Gate:** `PASS` (mudanças apenas em documentação, sem impacto em build/runtime)

- [x] Nenhuma referência ao Supabase antigo (`sjciabkjuqefponkfqan`) resta no repo
- [x] `git pull --rebase` antes do push
- [x] Commit `97a3791` enviado para `origin/main`

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 5 (documentação)

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico. Primeira a ser
  executada por ser rápida e sem risco.
- `2026-05-22` — Concluída. Commit `97a3791` na `main`. O `AGENTS.md` foi deletado
  pela Lovable (commit `5722dcd`); as referências a ele foram removidas do
  `CLAUDE.md` e `architecture.md` em vez de recriar o arquivo — recriar geraria
  conflito recorrente com a Lovable.
- `2026-05-22` — O push incluiu 2 commits locais pendentes da migração de Supabase
  (`config.toml`, `netlify.toml`, `AdminTray.tsx`) que não haviam sido enviados.
