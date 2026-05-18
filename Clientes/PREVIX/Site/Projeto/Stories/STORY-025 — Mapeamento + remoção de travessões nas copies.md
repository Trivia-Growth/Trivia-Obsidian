---
id: STORY-025
titulo: "Mapeamento completo do site + remoção de travessões nas copies"
fase: 5.5
modulo: "Conteúdo/Editorial"
status: done
prioridade: media
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-025 — Mapeamento completo do site + remoção de travessões nas copies

## Contexto

JG identificou que o site usa travessões (`—` em-dash e `–` en-dash) com frequência nas copies. Pediu para mapear **todas as ocorrências** e remover, padronizando a escrita.

Travessões aparecem em diversos contextos: títulos institucionais, descrições SEO, copies de página, frontmatter de posts, corpo MDX, FAQ, blocos modulares e Schema markup.

## Mapeamento prévio (executado em 2026-05-08)

### Hardcodes no código-fonte (`src/` + `public/`)

**Total: 63 ocorrências de `—` + 2 de `–` em 10+ arquivos.**

| Arquivo | Ocorrências |
|---|---|
| `src/content/paginas/sobre.md` | 12 |
| `src/content/blog/px-one.mdx` | 12 |
| `src/config/empresa.ts` | 11 |
| `src/content/blog/postes-ia.mdx` | 9 |
| `src/content/blog/monitoramento-24h-central-sao-paulo.mdx` | 9 |
| `src/content.config.ts` | 9 (comentários — pode ficar) |
| `src/content/blog/sky-vila-matilde.mdx` | 8 |
| `src/content/faq/faq.json` | 7 |
| `src/content/blog/kit-cameras.mdx` | 7 |
| `src/pages/noticias/[slug].astro` | 5 |
| `public/llms.txt` | 3 |
| Outros (.astro/.ts) | restante |

> **Observação:** os `src/content/blog/*.mdx` e `src/content/faq/faq.json` são **fallbacks** (Content Collections legacy). O DB já é a fonte real. Decisão: limpar mesmo assim por consistência (em caso de cair no fallback) ou aceitar drift.

### Banco de dados (Supabase `site.*`)

| Tabela.campo | Registros com travessão |
|---|---|
| `posts.titulo` | 1 |
| `posts.lede` | 3 |
| `posts.corpo_mdx` | 6 |
| `faq.resposta` | 7 |
| `paginas.blocos` (JSONB página Sobre) | 1 |
| `servicos.descricao_curta` | 3 |
| `depoimentos.texto` | 0 |
| `faq.pergunta` | 0 |

> **DB é fonte de verdade do site público.** Limpar aqui é o que reflete em produção.

## Critério de substituição

JG decide entre 3 padrões de substituição (proposta default):

### Padrão default (recomendado)

Substituir contexto-aware:

| Função do travessão | Substituir por |
|---|---|
| **Aposto/explicação** ("A Previx — empresa de SP — atua...") | Vírgulas: "A Previx, empresa de SP, atua..." |
| **Pausa enfática/conclusão** ("Resultado prático — menos falsos positivos") | Dois-pontos: "Resultado prático: menos falsos positivos" |
| **Lista/sequência** ("CFTV, alarmes, controle de acesso — tudo conectado") | Vírgulas + reescrita: "CFTV, alarmes, controle de acesso, tudo conectado" |
| **Atribuição** ("Disse Marcos — CEO") | Vírgula: "Disse Marcos, CEO" |
| **Razão social legal** ("Grupo Previx — Segurança e Serviços Ltda") | "Grupo Previx Segurança e Serviços Ltda" (omitir) |
| **Title page** ("Sobre — Grupo Previx") | "Sobre | Grupo Previx" (pipe) ou "Sobre · Grupo Previx" (middot) |

### Padrão alternativo conservador

Substituir 1:1 por hífen ` - ` (mais rápido, menos elegante).

### Padrão alternativo agressivo

Remover sem substituição quando possível (rever cada caso).

> **JG decidir qual padrão antes de executar.** Sugestão: default (contexto-aware) — preserva ritmo do texto.

## Critérios de Aceite

### Mapeamento

- [ ] CA1 — **Inventário completo gerado** em `docs/AUDIT_TRAVESSOES.md` com:
  - Caminho do arquivo OU `tabela.campo + id` do registro
  - Linha/posição da ocorrência
  - Texto antes e depois proposto
  - Categoria (aposto, pausa, lista, atribuição, etc.)

### Substituição em código

- [ ] CA2 — `src/config/empresa.ts` — 11 ocorrências (slogan, razão social, endereço formatado, comentários)
- [ ] CA3 — `src/lib/seo.ts` — verificar descrições padrão
- [ ] CA4 — `src/layouts/BaseLayout.astro` — title pattern `${title} — Grupo Previx`
- [ ] CA5 — `src/pages/*.astro` — todas as ~10 páginas (sobre, contato, servicos, etc.)
- [ ] CA6 — `src/components/**/*.astro` — Header/Footer/Hero etc.
- [ ] CA7 — `public/llms.txt` — 3 ocorrências
- [ ] CA8 — Comentários técnicos de `src/content.config.ts` ficam intactos (são docs, não copy de produção)

### Substituição em DB

- [ ] CA9 — `site.posts` — 6 títulos+lede+corpo MDX+FAQ atualizados via SQL
- [ ] CA10 — `site.faq` — 7 respostas atualizadas
- [ ] CA11 — `site.servicos.descricao_curta` — 3 atualizadas
- [ ] CA12 — `site.paginas.blocos` (Sobre) — 1 registro JSONB atualizado (parágrafos da intro)
- [ ] CA13 — `site.configs_seo.empresa` — campos com travessão (nome legal, endereço) revisados

### Content Collections legacy

- [ ] CA14 — Decisão JG: limpar `src/content/blog/*.mdx`, `src/content/faq/faq.json`, `src/content/paginas/sobre.md` (fallbacks) OU aceitar drift documentando

### Validação

- [ ] CA15 — `npm run build` passa (Schema validator + lint Jimmy 3.0)
- [ ] CA16 — Re-busca em produção: `curl /` `/sobre` `/servicos` `/noticias/*` `/faq` etc. e confirmar 0 ocorrências de `—` e `–` no HTML servido (validar com `grep -c`)
- [ ] CA17 — Schema markup intacto (Organization/LocalBusiness/BlogPosting/FAQPage continuam válidos pós-substituição — alguns campos como `legalName` permitem texto livre mas não devem perder semântica)

### Qualidade editorial

- [ ] CA18 — Revisão humana das 50+ substituições contextualizadas — não automatizar regex sed cego (vai destruir ritmo de frase). Cada bloco de 5-10 substituições passa por leitura ANTES do save.
- [ ] CA19 — Não introduzir vírgulas duplas, dois-pontos sucessivos ou frases truncadas — pontuação final deve ler bem em voz alta.

## Pendências externas

- **JG decide o padrão de substituição** (default contexto-aware vs hífen-1:1 vs remoção total)
- **JG decide sobre Content Collections legacy** (limpar pra consistência ou aceitar drift documentado)
- **JG aprova revisão editorial** dos 50+ trechos antes de UPDATE em DB

## Estratégia de execução sugerida

1. **Auditoria** (CA1) — gerar lista completa em arquivo Markdown
2. **Aprovação JG** do padrão e da lista revisada
3. **Substituições em código** (CA2-CA8) — push único disparando CI
4. **Substituições em DB via SQL UPDATE** (CA9-CA13) — script versionado em `scripts/remove-travessoes.ts` ou migration manual
5. **Disparo de rebuild** via webhook (já automatizado pela CI)
6. **Validação em produção** (CA16-CA17)

Tempo estimado: 3-4 horas (1h auditoria + 1h aprovação JG + 1h substituições + 1h validação).

---

## Implementação

> Preenchido pelo `@dev` quando rodar.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `docs/AUDIT_TRAVESSOES.md` (novo)
- `src/config/empresa.ts` (atualizado)
- `src/layouts/BaseLayout.astro` (title pattern)
- `src/pages/*.astro` (~10 páginas)
- `src/components/**/*.astro` (Header/Footer)
- `public/llms.txt`
- `scripts/remove-travessoes-db.ts` (novo — UPDATE SQL versionado)
- `src/content/**/*.{md,mdx,json}` (se decisão = limpar legacy)

---

## QA

> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] Mapeamento completo no `docs/AUDIT_TRAVESSOES.md`
- [ ] Substituições aprovadas pelo JG antes do UPDATE
- [ ] Build verde
- [ ] Produção: 0 ocorrências de `—` e `–` em rotas-chave (Home/Sobre/Servicos/Noticias/Faq/Contato/Privacidade)
- [ ] Schema markup íntegro (validator.schema.org sem erros novos)
- [ ] Revisão humana confirmou que pontuação alternativa lê bem
