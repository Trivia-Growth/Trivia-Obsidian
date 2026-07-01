---
id: STORY-007
titulo: "Corrigir features quebradas e bugs de runtime"
fase: 1
modulo: "qualidade"
status: em-review
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-007 — Corrigir features quebradas e bugs de runtime

## Contexto

> A auditoria encontrou funcionalidades que **simplesmente não funcionam** em produção e bugs que falham em silêncio (o usuário acha que deu certo, mas nada acontece).

Achados **#14, #40, #41, #42, #43/44, #45, #46, #55, #58, #59**. Independe de tenancy.

- **#14** — front chama Edge Functions que **não existem** (`preparation-quiz`, `roleplay-import`): o quiz nunca gera e a importação sempre falha.
- **#40** — sessão de voz não encerra o stream do microfone (mic fica ligado depois da sessão).
- **#41** — parser SSE frágil pode corromper o streaming em respostas longas.
- **#42** — drag-and-drop do pipeline sem optimistic update gera "snap-back" e race com o polling.
- **#43/44** — vários `catch {}` vazios engolem erros no módulo roleplay (insert do quiz falha em silêncio).
- **#45** — respostas de erro sem `Content-Type: application/json` nas funções admin.
- **#46** — chamadas de IA sem checar `response.ok` antes de parsear.
- **#55** — parêntese extra no `.select` de `use-deals.tsx:162` (risco de derrubar o Kanban).
- **#58** — `markRead` sem `onError` (badge de não-lidas pode nunca zerar).
- **#59** — `NotificationBell` faz `window.location.href` sem validar o link (open redirect).

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #14, #40–#46, #55, #58, #59
- [[Componentes React]] · [[Definition of Done]]

## Critérios de Aceite

- [ ] CA1 — `preparation-quiz` e `roleplay-import`: criar as Edge Functions **ou** corrigir as chamadas para a função correta (`roleplay-import` provavelmente → `knowledge-import`/`ingest-knowledge-document`). Quiz e importação passam a funcionar de ponta a ponta.
- [ ] CA2 — `RoleplayVoiceSession`: ao encerrar/cleanup, parar todas as tracks (`getTracks().forEach(t => t.stop())`) — mic não fica ligado.
- [ ] CA3 — Substituir `catch {}` vazios por log + toast no módulo roleplay; o insert da tentativa de quiz reporta falha ao usuário.
- [ ] CA4 — `markRead` ganha `onError`; `NotificationBell` valida que o link é interno (começa com `/`) ou usa `navigate`.
- [ ] CA5 — Corrigir o parêntese extra em `use-deals.tsx:162`; chamadas de IA checam `response.ok`; funções admin retornam erro com `Content-Type: application/json`.
- [ ] CA6 — Drag-and-drop do pipeline com optimistic update + rollback; sem snap-back perceptível.
- [ ] CA7 — Smoke test que cruza os nomes de função invocados no `src/` com os diretórios em `supabase/functions/` (pega chamada a função inexistente).

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `em-review` (parcial — ver carve-outs)

**Branch/PR:** commit `9481a77` em `main`

**Arquivos alterados:**
- `src/hooks/use-deals.tsx` (#55), `src/hooks/use-conversations.tsx` (#58)
- `src/components/NotificationBell.tsx` (#59), `src/components/roleplay/RoleplayVoiceSession.tsx` (#40)
- `src/components/roleplay/PreparationQuiz.tsx` (#43/44)
- `src/test/edge-functions-exist.test.ts` (novo — smoke test CA7)

**Notas de implementação:**
- ✅ **Entregue:** parêntese do Kanban (#55), microfone encerra no fim/cleanup (#40), links só internos (#59), `markRead` com `onError` (#58), insert do quiz não falha em silêncio (#43/44), e **smoke test** que cruza funções invocadas × diretórios (CA7).
- 🔎 **O smoke test revelou que o #14 é maior:** **8 funções** referenciadas no front não existem (`api-token-create`, `inbound-webhook-create`, `inbound-webhook-receive`, `preparation-audio`, `preparation-quiz`, `preparation-visual`, `roleplay-import`, `roleplay-voice-save`) — são **features de IA/integração não construídas**, não bugs. → **task `task_7dfbc955`** pra construí-las (allowlist no teste enquanto isso).
- ➡️ **Movidos para [[STORY-008 — Endurecer Edge Functions restantes|STORY-008]]:** `Content-Type` nos erros das funções admin (#45) e checar `response.ok` antes de parsear IA (#46) — são de backend/edge.
- ⏳ **Remanescente (follow-up menor):** parser SSE frágil (#41) e optimistic update do drag-and-drop do pipeline (#42, CA6) — médio esforço, exigem cuidado; não bloqueiam.

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Quiz/importação funcionam ponta a ponta
- [ ] Mic encerra ao fim da sessão
- [ ] Sem catch vazio engolindo erro
- [ ] Build sem erros, TypeScript strict

**Notas:**

---

## Notas e Decisões
