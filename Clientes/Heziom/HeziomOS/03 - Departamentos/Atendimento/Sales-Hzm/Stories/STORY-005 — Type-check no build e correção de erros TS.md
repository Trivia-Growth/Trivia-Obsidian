---
id: STORY-005
titulo: "Type-check no build e correção de erros TS"
fase: 1
modulo: "qualidade"
status: em-progresso
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-005 — Type-check no build e correção de erros TS

## Contexto

> O `tsconfig` está com `strict: true`, mas o build (`vite build`) **não roda o compilador TypeScript** — então **316 erros de tipo passam direto para produção**. Vários deles são queries Supabase contra colunas que o compilador acha que não existem (bugs de schema mascarados). É "strict de fachada".

Achados **#12, #68, #69, #70** (e o falso-positivo #13). Independe de tenancy. Habilitar o type-check é o gate que transforma muitos achados em barreira automática.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #12, #68, #69, #70
- [[TanStack Query e TypeScript]] · [[Definition of Done]]

## Critérios de Aceite

- [ ] CA1 — O build passa a rodar type-check: `"build": "tsc -b && vite build"` (ou script `typecheck` obrigatório). Build **falha** se houver erro de tipo.
- [ ] CA2 — Regenerar `src/integrations/supabase/types.ts` a partir do schema real do banco e corrigir os `TS2339` de coluna inexistente.
- [ ] CA3 — Zerar os 316 erros, atacando por categoria (começar por `TS6133` imports/vars não usados e `TS2339` de schema).
- [ ] CA4 — Reduzir o uso de `any`/`as any` (121 + 34 ocorrências): substituir pelos tipos do `types.ts` onde o schema cobre; registrar como dívida incremental o que sobrar.
- [ ] CA5 — `npx tsc --noEmit` retorna **0 erros**.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `em-progresso` — **320 → 96 erros (70% reduzido)**

**Branch/PR:** commits `49309d3`, `2175529`

**Arquivos alterados:**
- `src/integrations/supabase/types.ts` (regenerado), `package.json`, `eslint.config.js`, +16 arquivos (auto-fix)

**Notas de implementação:**
- 🐛 **Bug descoberto (importante):** o `npm run typecheck` (e o passo do CI) usava `tsc --noEmit` **na raiz** — que só tem `references` e **não checa o `src`** (confirmei com erro proposital não detectado). Corrigido para `tsc -p tsconfig.app.json --noEmit`. O gate do CI agora é honesto.
- ✅ **Alta alavancagem:** regenerei o `src/integrations/supabase/types.ts` do banco real → **320 → 126** (194 erros eram colunas que o compilador achava inexistentes por causa do types desatualizado — #2 da auditoria sobre schema).
- ✅ **Imports não usados:** `eslint-plugin-unused-imports` + `--fix` → **126 → 96** (16 arquivos).
- ⏳ **Restam 96** (correções de tipo manuais): 29 `TS2339`, 27 `TS2322`, 21 `TS6133` (vars não usadas), 7 `TS2345`, 4 `TS18047` (null-check)... Trabalho dedicado, arquivo a arquivo.
- ⏭️ **Quando chegar a 0:** remover `continue-on-error` do `typecheck` no `ci.yml` (vira bloqueante) e promover `no-explicit-any` para erro.

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] `npx tsc --noEmit` sem erros
- [ ] Build roda type-check e falha com erro de tipo
- [ ] `types.ts` regenerado do banco
- [ ] Redução de `any` documentada

**Notas:**

---

## Notas e Decisões
