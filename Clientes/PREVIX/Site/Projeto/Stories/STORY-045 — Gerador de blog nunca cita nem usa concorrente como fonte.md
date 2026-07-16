---
id: STORY-045
titulo: "Gerador de blog nunca cita nem usa concorrente como fonte"
fase: 6
modulo: "Blog/CMS · Gerador de Post (IA)"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-07-14
atualizado: 2026-07-14
epico: null
tipo: guardrail
relacionado: STORY-043
---

# STORY-045 — Gerador de blog não cita nem usa concorrente como fonte

> JG gerou um post e ele citou o **Grupo MS** (concorrente) como fonte das estatísticas
> (+24% portaria remota, R$ 14 bi segurança eletrônica), inclusive com link. Precisa
> parar de buscar referência, usar como fonte e citar outras empresas de segurança.

## Contexto / Diagnóstico

Fluxo do gerador (STORY-043): tema -> Perplexity pesquisa (dados + `citations`) ->
Sonnet escreve JSON GEO/AEO -> mapeador determinístico valida proveniência
(`fonteUrl ∈ citations` E `valor` no texto da pesquisa) -> draft.

O concorrente vazou porque o Perplexity achou a estatística no blog do Grupo MS e
devolveu a URL nas `citations`; o Sonnet a usou como `fonte`/`fonteUrl`; o mapeador
validou (URL nas citations, valor no texto) e **passou**. Nenhuma camada bloqueava
concorrente.

## Escopo (correção em camadas)

### ✅ Inclui
1. **Prompt do Sonnet** (`generate-post/index.ts`): regra dura no CONTEXTO_MARCA e na
   regra de `statistics` — NUNCA nomear/citar/comparar com outra empresa de segurança,
   segurança eletrônica, portaria, limpeza, facilities ou terceirização; a única empresa
   citável é o Grupo Previx (âncoras Mackenzie/DASA/etc. são CLIENTES, ok); estatística só
   de fonte neutra/oficial (órgãos públicos, ABESE/FENAVIST/FEBRAC/SESVESP, imprensa,
   institutos), JAMAIS de prestadora concorrente.
2. **Query e prompt da pesquisa** (`index.ts` + `_shared/perplexity.ts`): priorizar
   fontes neutras/oficiais e não trazer dados de sites/blogs de concorrentes.
3. **Filtro de citations** (`index.ts`): remove URLs de concorrentes ANTES de mostrar ao
   redator e de validar proveniência (o que não vira "Fonte", o Sonnet não cita; e a
   proveniência já reprova o dado).
4. **Mapeador determinístico** (`generate-post/mapper.ts`): denylist de concorrentes
   (nomes + domínios, extensível pelo JG); `filterStatsByProvenance` descarta stat de
   concorrente mesmo com proveniência válida; gate "nem citar" rejeita o rascunho inteiro
   se o texto visível nomear um concorrente conhecido.

### ❌ NÃO inclui
- Enumerar TODOS os concorrentes na denylist (o prompt generaliza; a denylist é a
  garantia dos casos conhecidos e é extensível). Seed inicial: Grupo MS + alguns grandes.

## Critérios de Aceite

- [x] CA1 — Nenhuma estatística pode ter fonte/fonteUrl de concorrente (descartada no mapeador).
- [x] CA2 — URLs de concorrentes são removidas das citations antes da redação e da proveniência.
- [x] CA3 — Rascunho que nomeie um concorrente conhecido é REJEITADO (regenerar), não publicado.
- [x] CA4 — Prompt (Sonnet + pesquisa) proíbe citar/usar concorrente e prioriza fonte neutra/oficial.
- [x] CA5 — `deno test mapper.test.ts` verde (29 testes, +6 de concorrente).
- [x] CA6 — Denylist extensível pelo JG (`COMPETITOR_NAME_TOKENS` / `COMPETITOR_DOMAIN_TOKENS`).

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/generate-post/mapper.ts` | Denylist + `isCompetitorUrl`/`isCompetitorSource`/`findCompetitorMention`; descarte de stat concorrente em `filterStatsByProvenance`; gate "nem citar" no `mapGeoAeoToPost`. |
| `supabase/functions/generate-post/index.ts` | Regra anti-concorrente no CONTEXTO_MARCA e em `statistics`; query da pesquisa prioriza fonte neutra; filtro de citations de concorrente; audit `citations_concorrentes_removidas`. |
| `supabase/functions/_shared/perplexity.ts` | System prompt prioriza fonte neutra/oficial; regra "nem citar concorrente" no bloco de uso da pesquisa. |
| `supabase/functions/generate-post/mapper.test.ts` | +6 testes de concorrente. |

## Notas de Implementação (2026-07-14)

- Correção em 4 camadas (prompt generaliza; denylist determinística garante os conhecidos).
- `deno test`: 29/29 verde. Denylist seed: Grupo MS, Prosegur, Brink's, Gocil, Grupo GPS,
  Verzani & Sandrini, GranSegurança — JG pode acrescentar os que quiser.
- Deploy: `supabase functions deploy generate-post` (bundla mapper + _shared). Commit na `main`.
- Pegadinha: o deploy da EDGE é manual/separado do push (o push só publica o frontend).
