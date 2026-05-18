---
id: STORY-051
titulo: "Esconder templates *_legacy do marketplace público + liberar leitura por user dono"
fase: 3
modulo: assinatura
status: done
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-051 — Esconder *_legacy do marketplace + liberar leitura

## Contexto

Hotfix em cima da STORY-050 (gating em `payment_failed`). Cliente CDI tem
subscription apontando pro template `profissional_legacy` (preço
grandfathered R$ 897, limites antigos do Profissional). Esse template foi
criado com `is_public=false` pra não vazar na seleção pública de planos.

Mas a RLS de `plan_templates` filtra `is_public=true` para usuários comuns,
então o cliente CDI **não conseguia ler o próprio template**. O fluxo
"Atualizar forma de pagamento" da STORY-050 caía em "Plano não encontrado"
ao tentar carregar `/faturamento?plano=a9919a4c-...`.

Decisão: marcar legacy como `is_public=true` no DB (libera RLS para
authenticated users) e esconder visualmente do marketplace via convenção
de nome `*_legacy` no frontend. Convenção em vez de coluna nova porque a
solução com `CREATE POLICY` específica exigiria DDL que não foi possível
aplicar sem `SUPABASE_ACCESS_TOKEN` na sessão.

## Critérios de Aceite

- [x] CA1 — Template `profissional_legacy` no DB com `is_public=true`
- [x] CA2 — `OfferSection.tsx` (landing) filtra `.not('name', 'ilike', '%_legacy')`
- [x] CA3 — `usePlanTemplates.publicTemplates` (página /assinatura, /faturamento)
  filtra `.not('name', 'ilike', '%_legacy')`
- [x] CA4 — Cliente CDI consegue ler template legacy via fallback
  `templates` (sem filtro `is_public`) já existente em `Faturamento.tsx`
- [x] CA5 — Marketplace público (landing, /assinatura) não exibe legacy
  para novos clientes
- [x] CA6 — `npx tsc --noEmit` exit 0
- [x] CA7 — `npm run build` exit 0

## Out of scope

- **Coluna dedicada `is_marketplace_visible`** — solução mais limpa que
  convenção de naming. Adiar até refactor maior de planos.
- **Outros templates legacy** — só profissional_legacy hoje. Se surgirem
  mais grandfathereds, a convenção `_legacy` cobre.
- **RLS policy específica para "ler template referenciado pela própria
  subscription"** — abordagem original; descartada porque não havia
  como aplicar DDL sem acesso ao SQL Editor ou access token.

## Implementação

**Status:** `done` (deploy 2026-05-07, commit `4b129663`)

**Arquivos modificados:**
- `src/components/landing/OfferSection.tsx` — filtro `_legacy`
- `src/hooks/usePlanTemplates.ts` — filtro `_legacy` em `publicTemplates`

**Mudança fora do código (via REST + service role):**
- `UPDATE plan_templates SET is_public = true WHERE id = 'a9919a4c-45a4-449b-bb15-462299b4460d'`

**Validações:**
- `tsc --noEmit` exit 0
- `npm run build` exit 0 em 19s
- Smoke via REST anon: agora retorna 5 templates com `is_public=true`
  (4 públicos + legacy); `OfferSection` query filtra legacy fora

## Riscos

| Risco | Mitigação |
|---|---|
| Filtro por nome quebra se renomearem o template | Convenção documentada; se surgir necessidade migrar pra coluna `is_marketplace_visible` |
| Outro user descobre o `id` legacy via REST público (já que `is_public=true`) e tenta usar no checkout | Tratado em STORY-053 (validação de elegibilidade na Edge Function) |
| Listagem `templates` (sem filtro) usada em admin UI mostra legacy junto com outros | Comportamento desejado em admin |

## QA

**Gate:** PASS

**Checklist:**
- [x] CA1-CA7 validados
- [x] Cliente CDI consegue ver/aplicar plano legacy no /faturamento
- [x] Novos clientes não veem legacy na landing nem em /assinatura
