---
id: STORY-002
titulo: "Estrutura Bulletproof + UI Tokens"
fase: 1
modulo: "Frontend Base"
status: backlog
prioridade: alta
agente_responsavel: ""
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

- [ ] CA1 — Estrutura de pastas criada conforme [[../../Custom Instructions Triviaiox|spec]] (`src/pages`, `src/content`, `src/components/{ui,seo,content,layout,home}`, `src/layouts`, `src/lib`, `src/types`, `src/config`, `src/styles`, `scripts`)
- [ ] CA2 — `tailwind.config.ts` com tokens `previx.{primary,dark,white,gray,text,text-muted}` e fonte Inter configurada
- [ ] CA3 — `src/styles/globals.css` importando Tailwind base/components/utilities + Inter via `@font-face` (woff2 self-hosted preferencial, ou Google Fonts com `display=swap`)
- [ ] CA4 — `BaseLayout.astro` com `<head>` completo (charset, viewport, meta description dinâmica, Open Graph, Twitter Card, favicon), Header e Footer
- [ ] CA5 — Componente `Header.astro` com logo Previx (variante colorida), nav (Home, Sobre, Serviços, Notícias, Contato, Orçamento) responsivo
- [ ] CA6 — Componente `Footer.astro` com endereço, telefones, e-mail, redes sociais, crédito Trívia Studio, ano dinâmico
- [ ] CA7 — `src/lib/seo.ts` com builders tipados de JSON-LD para `Organization`, `LocalBusiness`, `Service`, `Article`, `BlogPosting`, `FAQPage`, `BreadcrumbList`, `WebSite` (validados por `schema-dts`)
- [ ] CA8 — `BaseLayout` injeta `Organization` + `LocalBusiness` JSON-LD em todas as páginas
- [ ] CA9 — Página de teste `/styleguide` (não publicada — bloqueia em `robots.txt`) renderizando todos os tokens, tipografia e componentes UI básicos para revisão manual
- [ ] CA10 — Build (`npm run build`) gera `dist/` sem erros, todos os JSON-LD passam no [Schema Validator](https://validator.schema.org/)

---

## Implementação

> Preenchido pelo `@dev` após concluir.

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
- [ ] Tipagem strict, sem `any`
- [ ] Lighthouse > 95 em `/styleguide` (Performance, Accessibility, SEO)
- [ ] Header responsivo testado em 375px, 768px, 1280px
- [ ] Logo carrega ambas as variantes (colorida em fundo claro, branca em fundo escuro)
- [ ] Schema validado em todas as rotas existentes

**Notas:**

---

## Notas e Decisões
