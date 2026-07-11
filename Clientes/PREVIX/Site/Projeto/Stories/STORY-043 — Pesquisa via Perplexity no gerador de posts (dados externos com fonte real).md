---
id: STORY-043
titulo: "Pesquisa via Perplexity no gerador de posts (enriquecer o tema com dados externos reais antes da copy)"
fase: 6
modulo: "Blog/CMS · Geração de Conteúdo IA"
status: rascunho
prioridade: alta
agente_responsavel: ""
criado: 2026-07-11
atualizado: 2026-07-11
depende_de: STORY-027
---

# STORY-043 — Pesquisa via Perplexity no gerador de posts

## Contexto

A STORY-027 entregou o gerador de post via IA (`supabase/functions/generate-post`, Claude
Sonnet 4.6 via OpenRouter): JG digita um tema, a IA preenche os 18 campos do post (lede,
conclusões, estatísticas, FAQ, corpo MDX) seguindo a Metodologia Jimmy 3.0 (STORY-009).

**Limitação atual:** o campo `estatisticas` só pode usar dados de uma lista fechada, montada
a partir das estatísticas **já publicadas em posts anteriores** (`buildSystemPrompt` em
`generate-post/index.ts:74`, comentário "CADA UM deve vir da LISTA DE ESTATÍSTICAS FORNECIDAS
abaixo (NÃO INVENTE)"). Isso protege contra invenção de dado (Article IV — No Invention), mas
trava o gerador em temas que já têm estatística catalogada. Qualquer tema novo (ex: o post de
Reforma Tributária criado manualmente em 01/07, que precisou de dados de alíquota de IVA, ISS
de serviços e mercado de facilities inéditos no corpus) hoje **não pode** ser feito pelo
gerador. Precisou de pesquisa manual e escrita manual, fora do fluxo do admin.

Esta story fecha esse gap: adiciona um passo de **pesquisa via Perplexity** antes da geração da
copy. A IA passa a poder citar dados novos e reais, sempre com `fonte`+`fonteUrl` verificável
extraído das citações que o próprio Perplexity retorna — mantendo o No Invention (nunca inventa,
porque a fonte é rastreável até o link real), mas destravando qualquer tema.

**Referência de implementação:** o repo Jimmy Studio (`triviadash-analytics`) já tem esse
padrão em produção — `supabase/functions/_shared/perplexity.ts` (`searchWithPerplexity`,
via OpenRouter, `perplexity/sonar`, retorna `{content, citations, tokens_used}`, fallback
silencioso em caso de falha) e `fetch-trending-topics/index.ts` como exemplo de uso. Portar o
mesmo padrão para o previx-site-app evita reinventar a integração — só adaptar o contexto
(serviços/marca/ICP da Previx em vez do de agências de marketing).

## Spec de Referência

- [[STORY-027 — Geração de post via IA + Figura ImagePicker]] — base que esta story estende
- [[STORY-009 — Gerador de Blog AEO_GEO (Metodologia Jimmy 3.0)]] — regras estruturais (H2 como
  pergunta, ≥3 `<Estatistica />`, pirâmide invertida) que continuam valendo, inalteradas
- `../../Triviaiox/Constitution.md` (ou equivalente) — Article IV, No Invention
- Repo `triviadash-analytics`, `supabase/functions/_shared/perplexity.ts` — implementação de
  referência do helper de pesquisa (a portar/adaptar, não copiar 1:1)

## Contexto Previx a injetar na busca (serviços, brand, ICP)

A query enviada ao Perplexity deve vir sempre acompanhada do contexto do Grupo Previx, para a
pesquisa vir relevante ao negócio e não genérica:

- **Serviços:** segurança patrimonial (vigilância armada/desarmada, CFTV, controle de acesso),
  portaria (presencial e virtual), limpeza e conservação, terceirização de mão de obra,
  facilities (gestão integrada de múltiplos serviços num contrato único)
- **Marca:** Grupo Previx, +15 anos de mercado, atuação em São Paulo (capital e região)
- **ICP:** síndicos e administradoras de condomínios residenciais, RH/facilities de empresas e
  indústrias, gestores públicos (quando aplicável)

## Critérios de Aceite

- [ ] CA1 — Novo módulo `supabase/functions/_shared/perplexity.ts` em previx-site-app, portado
  do padrão do Jimmy Studio: função `searchWithPerplexity({ query, model?, searchRecencyFilter?
  })` via OpenRouter (`perplexity/sonar` por padrão), retorna `{ content, citations }` ou `null`
  em caso de erro/timeout (fallback silencioso, nunca quebra a geração do post)
- [ ] CA2 — `generate-post/index.ts` monta a query de pesquisa a partir de `tema` + `briefing` +
  bloco fixo de contexto Previx (serviços/marca/ICP, ver seção acima), chama
  `searchWithPerplexity` **antes** de montar `buildSystemPrompt`
- [ ] CA3 — `buildSystemPrompt` ganha uma segunda lista permitida de estatísticas: além do
  corpus interno (posts já publicados), o bloco "PESQUISA EXTERNA (Perplexity)" com o
  `content` retornado e a lista de `citations`. Instrução explícita: toda `estatistica` cuja
  fonte vier da pesquisa externa DEVE usar como `fonteUrl` uma das citations retornadas
  (nunca uma URL fora dessa lista, nunca inventada)
- [ ] CA4 — Se a chamada ao Perplexity falhar ou retornar `null` (timeout, sem citations
  úteis, `OPENROUTER_API_KEY` ausente), a geração **continua** normalmente só com o corpus
  interno — comportamento idêntico ao da STORY-027 hoje. Nunca bloquear o post por falha de
  pesquisa
- [ ] CA5 — `validate-post` (lint Jimmy 3.0) continua validando `fonteUrl` como URL válida em
  toda `estatistica`, sem exceção — a fonte de dado (interna ou Perplexity) é irrelevante para
  essa checagem, ela já existe e não muda
- [ ] CA6 — Audit log (`site.audit_log`, tipo `post_generated`) passa a registrar também
  `perplexity_used: boolean` e `perplexity_tokens` (quando aplicável), para acompanhar custo
  incremental
- [ ] CA7 — Sem mudança de UI obrigatória em `GerarPostModal.tsx` — a pesquisa roda sempre
  (automática, no backend). Se o tempo total de geração (pesquisa + copy) ultrapassar ~90s,
  ajustar o timeout do fetch no modal e a mensagem de loading para refletir a etapa extra (ex:
  "Pesquisando dados atualizados..." → "Escrevendo o artigo...")
- [ ] CA8 — Validado ao vivo com um tema que **hoje falharia** por falta de estatística no
  corpus interno (ex: um tema de facilities/segurança sem precedente nos 5 posts publicados) —
  confirmar que o draft gerado traz estatística nova, com `fonteUrl` real e clicável, e passa
  no `validate-post` com 0 erros

---

## Implementação

> Preenchido pelo `@dev` após concluir. Piloto não edita esta seção.

**Status:** `em-progresso` | `concluido`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`. Piloto não edita esta seção.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Teste com tema sem estatística prévia no corpus (CA8)
- [ ] Teste com Perplexity indisponível/timeout (fallback gracioso, CA4)
- [ ] `validate-post` roda 0 erros no draft gerado com dado externo
- [ ] `npm run build` verde (lint:content + validate:schema)
- [ ] Custo de tokens documentado (Perplexity + Sonnet) no audit log

**Notas:**

---

## Notas e Decisões

- Reaproveitar OpenRouter (já configurado, mesma chave `OPENROUTER_API_KEY` da STORY-027) para
  o Perplexity também — sem novo secret a provisionar.
- Escopo desta story é só o **passo de pesquisa**. Não mexe nas regras estruturais Jimmy 3.0
  (H2 como pergunta, pirâmide invertida, etc.) — essas já estão implementadas e corretas desde
  a STORY-009.
