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
| Dashboard (status das stories) | [[Projeto/Dashboard do Projeto]] |
| Roadmap (fases e milestones) | [[Projeto/Roadmap]] |
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
GitHub: https://github.com/Trivia-Growth/previx-site-app   (a criar — STORY-001)
Clone local: ~/Documents/Obsidian/Github/previx-site-app    (a criar — STORY-001)
```

---

## Supabase

```
Projeto: compartilhado com Organograma PREVIX (default — pendente confirmação JG)
Project URL: https://yqexjddpotlaqraljwvl.supabase.co
Reference ID: yqexjddpotlaqraljwvl
Schemas próprios do Site: site_leads, site_blog_admin
```

> **Pendência:** confirmar com JG se Site usa este projeto ou um novo. Decisão registrada em [[Decisões Arquiteturais|ADR-003]].

---

## Netlify

```
URL de produção: https://previx-site.netlify.app   (a criar — STORY-001)
Domínio final: https://grupoprevix.com.br          (cutover — STORY-010)
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
