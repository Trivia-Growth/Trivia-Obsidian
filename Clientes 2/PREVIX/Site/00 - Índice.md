---
projeto: "Site PREVIX"
cliente: "PREVIX"
status: "em desenvolvimento"
inicio: 2026-05-06
---

# Site PREVIX

> Site institucional novo do **Grupo Previx**, fora do WordPress, otimizado para mecanismos de busca de IA (**AEO** + **GEO**) com gerador de blog seguindo a **Metodologia Jimmy 3.0**. Será a porta de entrada para todo o ecossistema Previx (Organograma, Portal do Cliente, PX One, Postes IA). Briefing completo: [[Briefing Inicial]].

---

## Navegação

| Seção | Link |
|-------|------|
| Dashboard (status das stories) | [[Clientes 2/PREVIX/Site/Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Clientes 2/PREVIX/Site/Projeto/Roadmap]] |
| Stories | [[Projeto/Stories/]] |
| Decisões Arquiteturais (ADRs) | [[Decisões Arquiteturais]] |
| Custom Instructions Triviaiox | [[Custom Instructions Triviaiox]] |
| Referência: artigo Jimmy Studio (AEO/GEO 2026) | [[Referências/Jimmy Studio — AEO GEO 2026]] |
| Requisitos do sistema | *(no repositório de código: `PROJECT_REQUIREMENTS.md`)* |
| Arquitetura (final) | *(no repositório de código: `architecture.md`)* |
| Dívida de segurança | *(no repositório de código: `SECURITY_DEBT.md`)* |

---

## Repositório de Código

```
GitHub: https://github.com/Trivia-Growth/previx-site-app
Clone local: ~/Documents/Obsidian/Github/previx-site-app
Branch principal: main (push direto autorizado a Claude)
```

---

## Supabase

```
Projeto: compartilhado com TODOS os sub-projetos Previx (decisão cliente-wide)
Project URL: https://yqexjddpotlaqraljwvl.supabase.co
Reference ID: yqexjddpotlaqraljwvl
Schemas próprios do Site: site_leads, site_blog_admin
```

> **Decisão fechada:** este projeto Supabase é o único usado por toda a Previx (Organograma, Site, Portal futuro, apps de produto). Cada sub-projeto isola seus dados via prefixo de schema. Detalhe em [[Decisões Arquiteturais|ADR-003]] e em [[../00 - Índice PREVIX#Princípios cliente-wide|Princípios cliente-wide]].

---

## Netlify

```
Site ID: f95cfc51-9cf1-4f00-912b-a57755b7107f
URL temporária Netlify: https://previx-site-app.netlify.app
Admin: https://app.netlify.com/projects/previx-site-app
Domínio final: https://grupoprevix.com.br (cutover — STORY-010)
Account: Trívia (slug: triviastudio)
```

---

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| Frontend (LP + blog) | **Astro 4+** + React (ilhas) + TypeScript + Tailwind |
| Conteúdo | Astro Content Collections + Zod schema |
| Schema/SEO | JSON-LD (FAQPage, Article, LocalBusiness, Organization, Service, BreadcrumbList) |
| Forms (leads) | Supabase (PostgreSQL + RLS) + Edge Function de validação Zod |
| Deploy | Netlify (estático) |
| Agentes | **Triviaiox v4+** (instalado via `npx triviaiox-core install`) |

> **Por que Astro e não Vite:** crawlers de IA (ChatGPT, Perplexity, Google AI Overviews) precisam de HTML completo. SPA Vite entrega HTML vazio. Decisão formal em [[Decisões Arquiteturais|ADR-001]] e na seção "Stack negociável" do [[../../Documentos Trivia 2/Padrão Projetos/01 - Arquitetura/Stack Padrão|Stack Padrão Trívia]].

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| `admin-site` | Edita posts do blog, FAQ, configurações de SEO. Vê leads. |
| `editor-blog` | Cria e publica posts; não acessa leads nem configurações. |
| `público (sem login)` | Lê todo o site público. Envia formulário de orçamento. |

> Papéis de Portal do Cliente (cliente final) ficam **fora do escopo deste projeto** — vão para o sub-projeto Portal do Cliente quando priorizado.

---

## Identidade Visual

| Elemento | Cor |
|----------|-----|
| Azul primário (CTAs, destaques) | `#00AEEF` |
| Azul escuro (fundos, nav, dark sections) | `#0A1F3C` |
| Branco | `#FFFFFF` |
| Cinza claro (fundos alternados) | `#F5F5F5` |
| Texto principal | `#1A1A1A` |

**Tipografia:** Inter, sans-serif moderna. Títulos peso 700, corpo peso 400, labels peso 500.

**Logos:** `OneDrive/.../Site/WP/previx-assets/logos/` — versões horizontal/vertical, colorida/branca/negativa para fundo claro/escuro.

---

## Contatos do Projeto

| Papel | Nome | Contato |
|-------|------|---------|
| Piloto / Responsável | João Gabriel Novais | joaonovaisrs@gmail.com |
| Cliente / Stakeholder | [PREENCHER] | [PREENCHER] |
