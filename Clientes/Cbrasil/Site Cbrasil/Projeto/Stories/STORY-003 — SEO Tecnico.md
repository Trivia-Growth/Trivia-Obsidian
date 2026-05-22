---
id: STORY-003
titulo: "SEO tecnico — sitemap, robots, headers, JSON-LD, 404"
fase: 1
modulo: "seo"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-003 — SEO Tecnico

## Contexto

A home ja tem JSON-LD completo mas as paginas internas nao. Faltam sitemap.xml, robots.txt, pagina 404 customizada e headers de seguranca/cache no Netlify. Essencial para indexacao correta no Google e desempenho.

## Spec de Referencia

- Plano: `PLANO-EXECUCAO.md` item 2 (subsecoes 2.1 a 2.4)
- Dominio: cbrasilcontabilidade.com.br

## Criterios de Aceite

### sitemap.xml
- [ ] CA1 — `/sitemap.xml` com todas as paginas (home, servicos, terceiro-setor, sobre, contato, conteudo)
- [ ] CA2 — Priority definida (home 1.0, servicos/terceiro-setor 0.9, conteudo 0.8, sobre/contato 0.7)

### robots.txt
- [ ] CA3 — `/robots.txt` com `Allow: /`, `Disallow: /_v1/`, `Disallow: /uploads/`, `Sitemap:` referenciando o sitemap

### netlify.toml
- [ ] CA4 — Headers de seguranca: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- [ ] CA5 — Cache agressivo para `/css/*`, `/js/*`, `/assets/*` (1 ano, immutable)
- [ ] CA6 — Cache curto para HTML (1 hora)
- [ ] CA7 — Redirect www → sem www (ou vice-versa, consistente)

### 404.html
- [ ] CA8 — Pagina 404 customizada com mesma identidade visual
- [ ] CA9 — Redirect configurado no netlify.toml

### JSON-LD
- [ ] CA10 — BreadcrumbList em todas as paginas internas
- [ ] CA11 — `servicos.html`: OfferCatalog com os 10 servicos
- [ ] CA12 — `terceiro-setor.html`: FAQPage com as 5 perguntas
- [ ] CA13 — `sobre.html`: AboutPage + Organization
- [ ] CA14 — `contato.html`: ContactPage + ContactPoint
- [ ] CA15 — `conteudo.html`: Blog schema

---

## Implementacao

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementacao:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] Validar sitemap com Google Search Console
- [ ] Validar JSON-LD com https://validator.schema.org/
- [ ] Verificar robots.txt com ferramenta de teste
- [ ] Headers de seguranca validados (securityheaders.com)
- [ ] 404 funciona para URLs inexistentes

**Notas:**

---

## Notas e Decisoes

- Manter sitemap estatico (nao precisa de build script por ora)
- JSON-LD da home ja serve como base — adaptar para as demais
