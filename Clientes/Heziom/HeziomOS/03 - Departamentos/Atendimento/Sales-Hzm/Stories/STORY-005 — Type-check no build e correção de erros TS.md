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

**Status:** `em-progresso` — **320 → 20 erros (94% reduzido); os 20 restantes BLOQUEADOS na STORY-004**

**Branch/PR:** commits `49309d3` … `db3bbe8` (15+ commits)

> [!success] Tudo o que era addressável foi corrigido
> Os **20 erros restantes são 100% no `APISettingsTab.tsx`**, todos `SelectQueryError` de colunas que **não existem** no schema (`api_tokens`: `name`/`token_prefix`/`permissions`/`last_used_at`/`expires_at`; `inbound_webhooks`: `field_mapping_json`). **Resolvem automaticamente quando a migration de hardening de `api_tokens`/`inbound_webhooks` for aplicada** ([[STORY-004 — Proteger segredos e dados sensíveis|STORY-004]] / `task_313ccf2f`) e o `types.ts` for regenerado. **Não há mais nada a tipar manualmente aqui.**
>
> **Sequência final para fechar a STORY-005:** (1) aplicar a STORY-004/`task_313ccf2f` → 20 → 0; (2) tornar o `typecheck` **bloqueante** no `ci.yml` (remover `continue-on-error`); (3) promover `no-explicit-any` para `error`.

**Arquivos alterados:**
- `src/integrations/supabase/types.ts` (regenerado), `package.json`, `eslint.config.js`, `tsconfig.app.json`, +20 arquivos

**Notas de implementação (o que já foi feito):**
- 🐛 **Bug crítico de config corrigido:** o `typecheck` usava `tsc --noEmit` **na raiz** (só tem `references`, **não checava o `src`** — confirmado com erro proposital não detectado). Corrigido para `tsc -p tsconfig.app.json --noEmit`. O gate do CI agora é honesto.
- ✅ **Regenerei `types.ts` do banco real** → 320 → 126 (194 erros eram colunas que o compilador achava inexistentes pelo types desatualizado).
- ✅ **Imports + variáveis não usados** (`eslint-plugin-unused-imports` + `--fix` + limpeza manual): toda a categoria `TS6133` zerada → 126 → 77.
- ✅ **Código morto do Analytics** (2 queries não usadas + consts) + **exclusão dos testes do typecheck** (usam APIs do Node, rodam no vitest) → 77 → 71.
- ⚠️ **Lição (regressão pega pelo próprio typecheck):** um `sed` global apagou um `const { user } = useAuth()` que **era usado** em 2 componentes do Settings (teria crashado em runtime). O `TS2552` pegou e foi corrigido (`9e3a58a`). **Moral: os erros restantes NÃO são deleção segura — exigem cuidado cirúrgico.**

---

## 🗺️ Mapa dos 71 erros restantes (para a sessão dedicada)

Por categoria: **29 `TS2339`** (propriedade não existe) · **27 `TS2322`** (tipo incompatível) · **7 `TS2345`** · **4 `TS18047`** (possivelmente null) · **1 cada** `TS7006`/`TS2769`/`TS2352`/`TS18048`.

Concentrados em poucos arquivos — atacar por cluster:

| Arquivo | Erros | Raiz | Abordagem |
|---|---|---|---|
| **`APISettingsTab.tsx`** | **20** | ⛔ **BLOQUEADO** — o código lê colunas de `api_tokens` (`name`, `token_prefix`, `permissions`, `last_used_at`, `expires_at`) que **não existem no schema atual** (`SelectQueryError`). É o achado #5/#6: a migration de hardening da `api_tokens` (STORY-016) nunca aplicou. | **Resolver via [[STORY-004 — Proteger segredos e dados sensíveis\|STORY-004]] / `task_313ccf2f`** (aplicar a migration + regenerar `types.ts`). Estes 20 somem sozinhos quando o schema for corrigido. **Não tentar tipar no escuro.** |
| **`Landing.tsx`** | **14** | Tipagem do `framer-motion` (`HTMLMotionProps`): `transition.ease: number[]` não casa com `Easing`. **Mesmo padrão repetido 14×.** | Tipar o `ease` como `Easing`/`as const`, ou extrair uma variant `motion` compartilhada e aplicar. 1 fix → resolve todos. |
| **`ContactDetailSheet.tsx`** | **14** | Objeto de dados tipado como `{}`/`unknown` → acesso a `churn_risk` etc. falha; `unknown` não atribuível a `ReactNode`. | Tipar o retorno da query/objeto (interface com `churn_risk`, `upsell_score`...); cast de `unknown` no JSX. |
| `PublicSelectionSessionChat.tsx` | 5 | Tipos de mensagem/sessão | Tipar o estado local. |
| `PersonasSettingsTab.tsx` | 4 | inclui 1 `TS7006` (param `p` implicit any) | Anotar tipos. |
| `RoleplayVoiceSession.tsx` | 3 | tipos de sessão/transcript | Tipar. |
| Outros (1-2 cada) | ~11 | `Admin`, `FeatureFlagsPanel`, `use-forecast` (`SelectQueryError` na relação `workspace_members↔profiles`), `use-flows`, `use-contacts`, `AISettingsTab`, `ContactProfilePanel`, `PipelineReview`, `PublicSelection` | Caso a caso. |

**Ordem sugerida para a sessão dedicada:**
1. **Primeiro a STORY-004 / `task_313ccf2f`** (migration `api_tokens`) → derruba ~20 de uma vez (e os `SelectQueryError` de relações).
2. **`Landing.tsx`** (14, padrão único — alto ROI).
3. **`ContactDetailSheet.tsx`** (14, tipar o objeto).
4. Resto, arquivo a arquivo.

⏭️ **Quando chegar a 0:** remover `continue-on-error` do passo `typecheck` no `ci.yml` (vira **bloqueante**) e promover `@typescript-eslint/no-explicit-any` de `warn` para `error`.

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
