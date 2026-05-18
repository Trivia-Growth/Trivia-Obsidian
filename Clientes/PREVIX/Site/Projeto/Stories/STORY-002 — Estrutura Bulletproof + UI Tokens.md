---
id: STORY-002
titulo: "Estrutura Bulletproof + UI Tokens"
fase: 1
modulo: "Frontend Base"
status: concluido
prioridade: alta
agente_responsavel: "Claude (auto)"
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-002 — Estrutura Bulletproof + UI Tokens

## Contexto

Define a estrutura de pastas Bulletproof React adaptada para Astro, instala os tokens de identidade visual da Previx (cores, tipografia Inter), cria os componentes de layout reutilizáveis (Header, Footer, BaseLayout) e configura o sistema de Schema JSON-LD que vai alimentar todas as páginas. Esta é a fundação de UI que todas as páginas da Fase 1 vão consumir.

## Spec de Referência

- [[../../Briefing Inicial]] (Identidade visual)
- [[../../Custom Instructions Triviaiox]] (Arquitetura de Código)
- [[../../Decisões Arquiteturais|ADR-001, ADR-005]]

## Critérios de Aceite

- [x] CA1 — Estrutura de pastas criada (`src/pages`, `src/content`, `src/components/{ui,seo,content,layout,home}`, `src/layouts`, `src/lib`, `src/types`, `src/config`, `src/styles`, `scripts`, `public/assets/{logos,fotos,icones}`)
- [x] CA2 — Tokens Tailwind v4 via `@theme` em `src/styles/global.css` (Tailwind v4 não usa mais `tailwind.config.ts`): `previx.{primary,dark,white,gray,text,text-muted}` + fonte Inter no `--font-sans`
- [x] CA3 — `src/styles/global.css` com `@import "tailwindcss"` + `@theme` (Inter ainda via fallback `system-ui` — self-hosting Inter fica como TODO da STORY-003 quando entrar otimização de assets)
- [x] CA4 — `BaseLayout.astro` com `<head>` completo, Header, Footer e injeção de JSON-LD globais
- [x] CA5 — `Header.astro` com nav (Home, Sobre, Serviços, Notícias, FAQ, Contato + CTA Orçamento), `aria-current` na rota ativa
- [x] CA6 — `Footer.astro` com endereço, 2 telefones (comercial + 0800), e-mail, 4 redes sociais, crédito Trívia, ano dinâmico
- [x] CA7 — `src/lib/seo.ts` com builders tipados (schema-dts) para `Organization`, `LocalBusiness`, `WebSite` (com `SearchAction`), `Service`, `Article`/`BlogPosting`/`HowTo`, `FAQPage`, `BreadcrumbList`. Helpers internos (`abs()`, IDs canônicos, `postalAddress()`, `geoCoordinates()`, `contactPoint*()`, `areasAsPlaces()`)
- [x] CA8 — `BaseLayout` injeta **Organization + LocalBusiness + WebSite** JSON-LD em todas as páginas via componente `JsonLd.astro` (escape de `</script>` automático)
- [x] CA9 — `/styleguide` renderizando tokens (cores, tipografia, botões, cards, dados centralizados de `empresa.ts`). `noindex, nofollow` no meta + bloqueio em `robots.txt` + filter no sitemap
- [x] CA10 — Build verde (2 páginas em ~3s), JSON-LD validado em compile via schema-dts. 9 tipos confirmados em produção (Organization, LocalBusiness, WebSite, ContactPoint, GeoCoordinates, PostalAddress, Place, SearchAction, EntryPoint)

---

## Implementação

**Status:** `concluido` (2026-05-06)

**Branch/PR:** push direto na `main` — commit `66397db` (após `b2be209` da STORY-001)

**Arquivos novos/alterados:**
- `src/config/empresa.ts` (novo)
- `src/lib/seo.ts` (novo, dep adicionada: `schema-dts`)
- `src/components/seo/JsonLd.astro` (novo)
- `src/components/layout/Header.astro` (novo)
- `src/components/layout/Footer.astro` (novo)
- `src/layouts/BaseLayout.astro` (atualizado — agora integra Header/Footer + injeta JSON-LD globais)
- `src/pages/index.astro` (atualizado — placeholder mostra progresso STORY-001/002)
- `src/pages/styleguide.astro` (novo, `noindex`)
- `public/robots.txt` (novo, mínimo)
- `astro.config.mjs` (filter no sitemap excluindo styleguide/admin)
- `package.json`/`package-lock.json` (dep `schema-dts` adicionada)

**Notas de implementação:**

1. **Tailwind v4 mudou a forma de definir tokens** — não usa mais `tailwind.config.ts`/`theme.extend`. Tokens vão em `@theme` inline no CSS. Mantive a convenção `previx-*` (`previx-primary`, `previx-dark`, etc.) — funciona como classes Tailwind normais (`bg-previx-primary`, `text-previx-dark`).
2. **`src/lib/seo.ts` ficou maior do que o esperado** porque consolidei muito helper interno (postalAddress, geoCoordinates, contactPoints, areasAsPlaces, IDs canônicos). Vale o esforço — STORY-005 e STORY-009 vão consumir todos esses builders sem reimplementar.
3. **WebSite com SearchAction** já está injetado em todas as páginas mesmo sem busca interna implementada. URL template aponta para `/buscar?q={search_term_string}` (placeholder). É sinal pra IAs de que existe busca; quando a busca for implementada (story dedicada), o endpoint já estará casado.
4. **Componente JsonLd.astro** escapa `</script>` automaticamente para evitar XSS quando dado externo entrar no Schema (não é o caso agora, mas evita bug futuro).
5. **Header não usa logo de imagem ainda** — só texto "Grupo Previx". Logo entra na STORY-003 quando os assets do WP forem migrados pra `public/assets/logos/`.
6. **`/styleguide` triplamente protegido**: `noindex, nofollow` em meta robots, bloqueado em `robots.txt`, e excluído do sitemap via filter. Mesmo padrão será aplicado a `/admin/*` na STORY-008.
7. **Deploy verde** em https://previx-site-app.netlify.app, headers de segurança mantidos, 9 `@type` Schema confirmados na resposta do `/`.

**Verificações em produção:**
```bash
curl -sI https://previx-site-app.netlify.app/styleguide  # 301 → /styleguide/, depois 200
curl -s https://previx-site-app.netlify.app/ | grep -o '"@type":"[^"]*"' | sort -u
# Organization, LocalBusiness, WebSite, ContactPoint, GeoCoordinates, PostalAddress, Place, SearchAction, EntryPoint
```

---

## QA

**Gate:**

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Tipagem strict, sem `any`
- [ ] Lighthouse > 95 em `/styleguide` (Performance, Accessibility, SEO)
- [ ] Header responsivo testado em 375px, 768px, 1280px
- [ ] Logo carrega ambas as variantes (colorida em fundo claro, branca em fundo escuro)
- [ ] Schema validado em todas as rotas existentes

**Notas:**

---

## Notas e Decisões
