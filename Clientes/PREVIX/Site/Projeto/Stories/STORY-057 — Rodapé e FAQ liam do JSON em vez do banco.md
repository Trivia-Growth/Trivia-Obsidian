---
id: STORY-057
titulo: "Rodapé e FAQ liam do JSON em vez do banco"
fase: 6
modulo: "Site · Dados institucionais"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: bug
---

# STORY-057 — Rodapé e FAQ liam do JSON em vez do banco

> Dois usos de `getCollection` **escaparam da auditoria da STORY-056**. Foram encontrados
> ao varrer o repo depois de fechar aquela story — o CA3 dela cobria `institucional.ts`,
> não o projeto inteiro.

## Contexto / Diagnóstico (código real)

### 1. `SiteFooter.astro` — números do rodapé nunca refletiam o painel

```ts
// Números de credibilidade vêm da collection (mesma fonte da Home)
const numerosEntries = await getCollection('numeros');
```

O comentário dizia **"mesma fonte da Home"**, e um dia foi verdade. A Home migrou para
`site.numeros` (STORY-024) e o rodapé ficou para trás — comentário e código passaram a
mentir juntos. Efeito: número editado no painel mudava na Home e **não** no rodapé, nas
mesmas páginas, sem erro nenhum.

### 2. `faq.ts` — mesmo alçapão da STORY-056

```ts
if (!error && data && data.length > 0) { /* banco */ }
const entries = await getCollection('faq');   // ⚠️ NÃO filtra `ativo`
```

O `faq.json` **tem** o campo `ativo`, mas o fallback não o usava. Uma falha de leitura
publicaria pergunta desativada no painel. Hoje há 0 perguntas ocultas — o que só significa
que a armadilha nunca foi acionada, não que não existisse.

## Escopo

### ✅ Inclui

1. `SiteFooter` passa a usar `getNumeros()`.
2. `faq.ts` perde o fallback e adota a mesma regra da STORY-056.
3. `exigirDados` sai de `institucional.ts` para `src/lib/data/consulta.ts` — regra única,
   já que agora serve a dois módulos. Prefixo das mensagens vira `[conteudo]`.
4. Varredura: **nenhum** `getCollection` restante em `src/` fora de comentário.

### ❌ NÃO inclui

- Remover as Content Collections do `content.config.ts` (os JSONs seguem no repo como
  registro histórico da migração).

## Critérios de Aceite

- [x] CA1 — Número editado no painel muda no rodapé (mesma fonte da Home).
- [x] CA2 — FAQ não tem mais fallback que ignore `ativo`.
- [x] CA3 — Nenhum `getCollection` fora do `content.config.ts` e de comentários.
- [x] CA4 — `npm run typecheck` e `npm run build` verdes.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/lib/data/consulta.ts` | **novo** — `exigirDados` centralizado |
| `src/lib/data/institucional.ts` | passa a importar `exigirDados`; mensagens viram `[conteudo]` |
| `src/lib/data/faq.ts` | fallback removido; usa `exigirDados` |
| `src/components/layout/SiteFooter.astro` | `getCollection('numeros')` → `getNumeros()` |

## Notas de Implementação (2026-08-05)

Commit `7c26f18` na `main`.

### Verificação

- ✅ Rodapé do HTML gerado traz os **4 números do banco** (`+500`, `24h`, `+100`, `10+`).
- ✅ FAQ gera **16 perguntas**, batendo com as 16 visíveis no banco; pergunta real do banco
  ("Como solicitar um orçamento personalizado?") presente no HTML.
- ✅ `npm run build` verde; `typecheck` sem erro novo em `src/`.
- ✅ Varredura confirmou zero `getCollection` ativo em `src/`.

### Lição

A auditoria da STORY-056 parou no arquivo do defeito (`institucional.ts`) em vez de varrer
o padrão no repo inteiro. **Defeito de padrão pede busca por padrão**, não por arquivo —
foram necessários dois `grep` para achar o que a story anterior deu por encerrado. Mesma
família de [[feedback_gate_por_nome_casa_import_e_comentario]].
