---
id: STORY-047
titulo: "Parse resiliente do JSON da IA no gerador de post (fim do 'JSON inválido')"
fase: 6
modulo: "Blog/CMS · Gerador de Post (IA)"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-07-14
atualizado: 2026-07-14
epico: null
tipo: fix
relacionado: STORY-043
---

# STORY-047 — Parse resiliente do JSON da IA

> JG tentou gerar um post e recebeu: "IA retornou JSON inválido: Expected double-quoted
> property name in JSON at position 9305 (line 120 column 7)".

## Diagnóstico

Na edge `generate-post`, o Sonnet devolve o artigo como JSON (contrato GEO/AEO). O parse
(`index.ts` passo 6) só fazia `JSON.parse` do conteúdo (após remover fence e recortar
entre chaves). O Sonnet às vezes emite JSON **quase-válido** com **vírgula sobrando**
(trailing comma) antes de `}` ou `]` — falha clássica de LLM. O `JSON.parse` estoura
exatamente com "Expected double-quoted property name" (após a vírgula ele espera uma nova
chave `"..."` e encontra `}`), e a geração inteira falhava. Não havia nenhuma tolerância.

## Escopo

### ✅ Inclui
1. Módulo PURO `generate-post/json-repair.ts`:
   - `extractJsonPayload` (remove fence ```json e prosa em volta),
   - `stripTrailingCommas` (remove vírgula antes de `}`/`]` **respeitando strings** —
     scanner char-a-char com estado de string + escape, para NÃO corromper URLs
     `https://...` nem texto com vírgulas/chaves dentro de strings),
   - `parseJsonLoose` (tenta `JSON.parse`; se falhar, repara e tenta de novo; se ainda
     falhar, relança o erro ORIGINAL, mais informativo).
2. `index.ts` passa a usar `parseJsonLoose` no lugar do parse inline.
3. Reforço do system prompt: "JSON sintaticamente válido, sem trailing comma, sem comentários".
4. Testes deno (`json-repair.test.ts`, 7 casos), incluindo o cenário exato do JG e a
   preservação de URLs com vírgula dentro da string.

### ❌ NÃO inclui
- Retry de nova chamada ao modelo em caso de falha (risco de estourar o teto de tempo da
  Edge: pesquisa 25s + redação até 100s; um retry passaria dos ~150s). O reparo
  determinístico cobre o caso comum (trailing comma) sem custo extra.

## Critérios de Aceite

- [x] CA1 — JSON com trailing comma (o erro do JG) passa a parsear com sucesso.
- [x] CA2 — Reparo NÃO corrompe strings (URLs com vírgula/barra, aspas escapadas).
- [x] CA3 — JSON irreparável ainda retorna erro claro (relança o erro original).
- [x] CA4 — `deno test json-repair.test.ts` verde (7); `deno test mapper.test.ts` verde (29, regressão).
- [x] CA5 — Prompt instrui JSON válido sem trailing comma (reduz recorrência).

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/generate-post/json-repair.ts` | **Novo** — parse resiliente puro. |
| `supabase/functions/generate-post/json-repair.test.ts` | **Novo** — 7 testes. |
| `supabase/functions/generate-post/index.ts` | Usa `parseJsonLoose`; reforço do prompt. |

## Notas de Implementação (2026-07-14)

- Erro do JG (`position 9305 / line 120 col 7`) = trailing comma clássico do LLM.
- `stripTrailingCommas` respeita strings (não estraga `fonteUrl` com `https://`).
- Deploy: `supabase functions deploy generate-post` (bundla mapper + json-repair + _shared).
  CLI autenticado, projeto previx linkado. Sem migration.
