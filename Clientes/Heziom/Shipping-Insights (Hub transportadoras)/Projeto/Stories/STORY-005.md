---
id: STORY-005
titulo: "Bugs confirmados e credenciais expostas"
fase: 1
modulo: "Correções"
status: concluido
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-005 — Bugs confirmados e credenciais expostas

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) confirmou bugs concretos e
credenciais expostas que devem ser corrigidos antes do sistema entrar em uso.

## Critérios de Aceite

- [x] CA1 — `logmanager-webhook` compila (removida declaração duplicada de
  `STATUS_LABELS` e o import não usado)
- [x] CA2 — Edição de lançamento (`useShippingData` / `Lancamentos.tsx`)
  SUBSTITUI os valores em vez de somar
- [x] CA3 — Importação de planilha (`Relatorios.tsx`) rejeita datas inválidas
- [x] CA4 — Logs de credenciais removidos de `_shared/correios-auth.ts`
- [x] CA5 — `AdminAmazonVendor.tsx`: LWA Client ID mascarado. `AdminMercadoLivre.tsx`
  já estava ok (Client ID mascarado; Seller ID é público, não é segredo)
- [x] CA6 — `logmanager-webhook` insere com `user_id` null (sem UUID hardcoded)
- [x] CA7 — `melhor-envio-sync` — parâmetro de data decorativo removido
- [x] CA8 — `AdminTray.tsx` monta a URL do webhook via `VITE_SUPABASE_PROJECT_ID`

## Implementação

**Commit:** `0f431c9` — `fix: bugs confirmados e credenciais expostas (STORY-005)`

**Edge Functions reimplantadas** (`supabase functions deploy`): logmanager-webhook,
melhor-envio-sync, correios-poll-rastreio, correios-scan-objects, vipp-sync,
vipp-track (as 4 últimas por dependerem de `_shared/correios-auth.ts`).

## QA

**Gate:** `PASS`

- [x] `npm run build` — passou (3,75s, sem erros)
- [x] Deploy das 6 Edge Functions confirmado no Supabase
- [x] `git pull --rebase` antes do push

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 2 (bugs) e itens S5, S6, S17

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
- `2026-05-22` — Concluída. Commit `0f431c9` na `main`. O `logmanager-webhook`
  estava com código que não compilava — o deploy bem-sucedido confirma a correção.
