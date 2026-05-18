---
id: STORY-005
titulo: "Schema Markup + Sitemap + robots.txt + llms.txt"
fase: 1
modulo: "SEO/AEO/GEO Base"
status: concluido
prioridade: alta
agente_responsavel: "Claude (auto)"
criado: 2026-05-06
atualizado: 2026-05-07
---

# STORY-005 — Schema Markup + Sitemap + robots.txt + llms.txt

## Contexto

Fecha a Fase 1 plantando os sinais técnicos que IAs e crawlers usam para descobrir e categorizar o site. Estende os builders de Schema da STORY-002, configura o sitemap automático, escreve o `robots.txt` permitindo IAs explicitamente, e cria o `llms.txt` na raiz com sumário do site para LLMs.

Esta story é a fundação técnica de AEO/GEO **antes** de qualquer conteúdo de blog. Mesmo que o site só tenha páginas institucionais, ele já fica indexável e citável.

## Spec de Referência

- [[../../Referências/Jimmy Studio — AEO GEO 2026]] — fonte primária da Metodologia Jimmy 3.0
- [[../../Briefing Inicial]] (seção "SEO técnico")
- [[../../Decisões Arquiteturais|ADR-005]]

## Critérios de Aceite

- [x] CA1 — `public/robots.txt` com **12 user-agents de IA explícitos** (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, Bytespider, MistralAI-User) + Googlebot/Bingbot/DuckDuckBot + `User-agent: *`. Todos `Allow: /` + `Disallow: /admin/` + `Disallow: /styleguide`. Sitemap link no final.
- [x] CA2 — `@astrojs/sitemap` ativo desde STORY-001 com filter excluindo styleguide/admin (configurado em `astro.config.mjs`)
- [x] CA3 — `public/llms.txt` seguindo spec `llmstxt.org`: H1 + blockquote (resumo), 3 parágrafos de contexto, ## Páginas principais (9 links absolutos), ## Produtos exclusivos (PX One, Postes IA), ## Áreas atendidas (18 bairros), ## Política sobre uso por LLMs (autorização explícita), ## Sitemap, ## Optional (/noticias, /faq em construção).
- [x] CA4 — JSON-LD `LocalBusiness` injetado pelo BaseLayout em todas as páginas (STORY-002). Campos: `address` (rua/cidade/estado/cep/país), `telephone` E.164, `email`, `openingHours` "Mo-Fr 08:00-18:00", `areaServed` (18 Places), `priceRange` `$$`, `geo` (lat/lng aproximados de Av. Queiroz Filho 917).
- [x] CA5 — `Organization` injetado pelo BaseLayout: `name`, `legalName`, `url`, `logo`, `description`, `foundingDate`, `email`, `telephone`, `address`, `sameAs[]` (4 redes), `contactPoint[]` (comercial + 0800).
- [x] CA6 — `Service` Schema injetado em cada subpágina de `/servicos/[slug]` (STORY-004). `serviceType` lido do frontmatter da collection (`SecurityService` para patrimonial/eletronica; `BuildingMaintenanceService` para facilities). `provider` referencia `@id` da Organization. `areaServed` reaproveita os 18 Places. `hasOfferCatalog` lista os subserviços.
- [x] CA7 — `WebSite` injetado em todas com `SearchAction` apontando para `/buscar?q={search_term_string}` (placeholder até a busca interna ser implementada).
- [x] CA8 — `BreadcrumbList` em todas as internas: /sobre, /servicos, /servicos/[slug], /contato, /orcamento (STORY-004).
- [x] CA9 — Build valida runtime via `scripts/validate-schema.ts` (TypeScript + tsx). Encadeado com `astro build` no script `npm run build`. Verifica que cada página-alvo tem os `@type` obrigatórios e confirma `noindex` em /styleguide e /404. **Falha o build com exit 1** se algum schema esperado faltar — testado com remoção proposital de `Organization`.
- [~] CA10 — Validação manual no Schema Markup Validator e Rich Results Test fica como **TODO antes do cutover de domínio (STORY-010)** — tem que ser feita no browser; `validate-schema.ts` é o gate barato em CI/local.
- [x] CA11 — Headers de segurança em `netlify.toml` desde STORY-001: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin, Permissions-Policy bloqueando câmera/microfone/geo/payment, CSP completa com `connect-src` apontando para o Supabase compartilhado.

---

## Implementação

**Status:** `concluido` (2026-05-07)

**Branch/PR:** push direto na `main` — commit `adab236`

**Arquivos novos/alterados:**
- `public/robots.txt` (sobrescrito — versão completa com 16 user-agents)
- `public/llms.txt` (novo, formato llmstxt.org)
- `scripts/validate-schema.ts` (novo — postbuild gate)
- `src/pages/contato.astro` (atualizado — link "Ver no Google Maps")
- `package.json`/`package-lock.json` (devDep `tsx` + script `validate:schema` encadeado em `build`)

**Notas de implementação:**

1. **`robots.txt` é o sinal mais barato e mais visível** para conseguir Share of Answer em IA. 16 user-agents declarados explicitamente (12 de IA + 3 tradicionais + fallback) — alguns crawlers respeitam só Allow explícito (não herdam de `*`), por isso o detalhamento.
2. **`llms.txt` segue a spec emergente em llmstxt.org** — formato Markdown que LLMs leem para entender escopo do site. Inclui seção "Política sobre uso por LLMs" autorizando citação **com requisito de URL de origem** (mantém rastreabilidade).
3. **Validador runtime** — não substitui o Schema.org Validator manual, mas pega regressões cedo: schemas faltando, JSON-LD malformado, `noindex` removido por engano em /styleguide. Mensagens de erro são acionáveis (mostram path do arquivo, @type esperado, @types encontrados). Custo: 1 segundo por build.
4. **Mapa do Google Maps**: optei por **link externo** em vez de `iframe`. Razões: (a) iframe quebraria o `frame-src 'none'` da CSP, exigindo afrouxamento; (b) iframe carrega ~200KB de JS do Google e degrada Lighthouse; (c) link `target=_blank` resolve a UX (usuário que precisa do mapa abre num app nativo no mobile, mais útil). Trade-off documentado.
5. **Validação manual no Schema Validator** ficou como TODO da STORY-010 (cutover) — precisa ser no browser; o gate runtime cobre o caso comum.
6. **`tsx` adicionado** como devDep para rodar TypeScript direto sem build separado. Mais leve que `ts-node` no Astro 6.

**Validação em produção:**
```bash
curl https://previx-site-app.netlify.app/robots.txt        # 16 User-agents
curl https://previx-site-app.netlify.app/llms.txt          # formato llmstxt.org
curl https://previx-site-app.netlify.app/sitemap-index.xml # 8 URLs (excluindo styleguide/admin)
```

---

## QA

**Gate:**

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] `curl -A "GPTBot/1.0" https://[netlify-url]/robots.txt` mostra Allow correto
- [ ] `curl https://[netlify-url]/sitemap-index.xml` retorna XML válido
- [ ] `curl https://[netlify-url]/llms.txt` retorna texto legível
- [ ] Lighthouse SEO = 100 nas rotas-chave
- [ ] Schema Validator sem erros
- [ ] Headers de segurança visíveis em `curl -I`

**Notas:**

---

## Notas e Decisões
