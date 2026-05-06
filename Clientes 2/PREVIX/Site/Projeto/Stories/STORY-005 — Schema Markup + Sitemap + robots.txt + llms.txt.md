---
id: STORY-005
titulo: "Schema Markup + Sitemap + robots.txt + llms.txt"
fase: 1
modulo: "SEO/AEO/GEO Base"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
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

- [ ] CA1 — `public/robots.txt` com:
  - `User-agent: GPTBot` → `Allow: /` + `Disallow: /admin/`
  - `User-agent: PerplexityBot` → idem
  - `User-agent: Google-Extended` → idem
  - `User-agent: ClaudeBot` → idem
  - `User-agent: Googlebot` + `Bingbot` → idem
  - `User-agent: *` → `Allow: /` + `Disallow: /admin/`
  - `Sitemap: https://grupoprevix.com.br/sitemap-index.xml`
- [ ] CA2 — `@astrojs/sitemap` configurado em `astro.config.mjs` gerando `sitemap-index.xml` e `sitemap-0.xml` automaticamente
- [ ] CA3 — `public/llms.txt` com sumário em formato RFC informal (título do site, descrição em 2-3 frases, áreas atendidas em SP, lista das principais páginas com links absolutos, contato, política de uso de conteúdo por LLMs)
- [ ] CA4 — JSON-LD `LocalBusiness` no Home/Sobre/Contato com campos completos: `address` (endereço completo), `telephone` (`+55 11 3875 1148`), `email`, `openingHours`, `areaServed` listando bairros de atuação em SP, `priceRange` (placeholder `$$`), `geo` (lat/lng de Av. Queiroz Filho 917)
- [ ] CA5 — JSON-LD `Organization` no `BaseLayout` com `name`, `url`, `logo`, `sameAs[]` (Facebook, LinkedIn, Instagram, YouTube), `contactPoint`
- [ ] CA6 — JSON-LD `Service` em cada subpágina de serviço (3) com `serviceType`, `provider` (referência à `Organization`), `areaServed`, `description`
- [ ] CA7 — JSON-LD `WebSite` na raiz com `SearchAction` (mesmo que a busca interna ainda não exista — preparar para STORY futura)
- [ ] CA8 — `BreadcrumbList` JSON-LD em todas as páginas internas (não-home)
- [ ] CA9 — Build valida todos os JSON-LD com `schema-dts` — falha se houver inválido
- [ ] CA10 — Validação manual no [Schema Markup Validator](https://validator.schema.org/) e no [Rich Results Test](https://search.google.com/test/rich-results) para Home, Sobre, /servicos/patrimonial — sem erros
- [ ] CA11 — Headers de segurança em `netlify.toml`: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Content-Security-Policy` mínima

---

## Implementação

**Status:**

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

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
