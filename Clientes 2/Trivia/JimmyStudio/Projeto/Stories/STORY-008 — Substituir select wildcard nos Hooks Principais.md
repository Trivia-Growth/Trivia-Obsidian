---
id: STORY-008
titulo: "Substituir select('*') nos Hooks Mais Críticos"
fase: 2
modulo: "infra"
status: backlog
prioridade: media
agente_responsavel: "@dev"
criado: 2026-04-29
atualizado: 2026-04-29
---

# STORY-008 — Substituir select('*') nos Hooks Mais Críticos

## Contexto

119 arquivos usam `select('*')` nas queries Supabase, buscando todas as colunas de cada tabela. Isso causa:
1. **Performance**: transferência de dados desnecessária (ex: tabelas com 30+ colunas quando só 5 são usadas)
2. **Segurança**: dados sensíveis que passam pelo RLS chegam ao cliente mesmo sem ser exibidos
3. **Exposição**: tokens, hashes, dados internos ficam no payload de resposta

A mudança é simples por hook mas impacta o código que consome os dados. Requer testes antes de cada alteração.

**Pré-requisito:** STORY-002 (testes) — cada hook alterado precisa ter teste cobrindo os campos que são de fato usados.

## Spec de Referência

- `PROJECT_REQUIREMENTS.md` — item 5 da tabela de Questões Abertas

## Critérios de Aceite (Fase 1 — 10 hooks prioritários)

- [ ] CA1 — `useBrandPayments` usa colunas específicas (id, brand_id, amount, status, due_date, paid_at)
- [ ] CA2 — `useGoogleAds` usa colunas específicas (id, account_id, campaign_id, impressions, clicks, cost, conversions)
- [ ] CA3 — `useGoogleSearchTerms` usa colunas específicas
- [ ] CA4 — `BrandContext` (contexto global) usa colunas específicas de `brands`
- [ ] CA5 — `useICPProfiles` usa colunas específicas
- [ ] CA6 — `useMetaSyncIncremental` usa colunas específicas
- [ ] CA7 — Nenhuma funcionalidade quebra após as mudanças (testes E2E passam)
- [ ] CA8 — Documentar quais colunas são usadas por cada hook no arquivo de hook (comentário ou tipo explícito)

## Restrições

- Alterar um hook por vez — commitar e verificar antes de passar para o próximo
- Verificar todos os componentes que consomem o dado do hook antes de remover uma coluna
- Se uma coluna é usada em algum lugar — mantê-la, mesmo que pareça desnecessária
- NÃO alterar hooks de tabelas com dados financeiros (billing_info, payment_events) sem aprovação explícita

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

**Arquivos a modificar (fase 1):**
- `src/hooks/useBrandPayments.ts`
- `src/hooks/useGoogleAds.ts`
- `src/hooks/useGoogleSearchTerms.ts`
- `src/contexts/BrandContext.tsx`
- `src/hooks/useICPProfiles.ts`
- `src/hooks/useMetaSyncIncremental.ts`

---

## QA

> Preenchido pelo `@qa` após implementação.

**Gate:** —

**Checklist:**
- [ ] Cada hook alterado tem tipos TypeScript explícitos para o retorno (não `any`)
- [ ] Funcionalidades que usam cada hook continuam funcionando
- [ ] Testes E2E das páginas afetadas passam
- [ ] Nenhum `undefined` em campos que eram usados antes da mudança

**Notas:** —
