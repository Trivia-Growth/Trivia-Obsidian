# Roadmap — TriviaEdutech

---

## Fase 1 — MVP (Gerado via Lovable)

> Infraestrutura base e funcionalidades LMS. Plataforma funcional, migrando para padrão Trivia.

| Story | Módulo | Status |
|-------|--------|--------|
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-001 — Setup Infraestrutura]] | Infraestrutura | concluido |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-002 — Ajuste texto tela de login]] | Auth | concluido |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-003 — Blog melhorias de experiência]] | Blog | concluido |

---

## Sprint de Migração — Padrão Trivia (P0 Segurança)

> Brownfield Discovery realizado em 2026-06-13. 4 issues P0 identificadas — executar antes de novo feature.

| Story | Módulo | Status |
|-------|--------|--------|
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-004 — Rotacionar credenciais e remover .env do git]] | Segurança | pronto |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-005 — netlify.toml com security headers]] | Infra | pronto |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-006 — optimize-content e mp-webhook segurança]] | Edge Functions | pronto |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-024 — Remover todas as referências à Lovable]] | Infra/Limpeza | pronto |

---

## Sprint 2 — Qualidade Crítica (P1)

> TypeScript strict, lazy routes, Error Boundaries, CORS financeiro.

| Story | Módulo | Status |
|-------|--------|--------|
| STORY-007 — TypeScript strict mode | Qualidade | backlog |
| STORY-008 — Lazy routes + Suspense (49 páginas) | Performance | backlog |
| STORY-009 — Error Boundaries por feature | Resiliência | backlog |

---

## Sprint 3 — Segurança de Dados (P1)

> Tokens OAuth, storage RLS, FORCE RLS em tabelas críticas.

| Story | Módulo | Status |
|-------|--------|--------|
| STORY-010 — Supabase Vault para tokens MP OAuth | Segurança | backlog |
| STORY-011 — RLS storage policies (library-files) | Segurança | backlog |
| STORY-012 — FORCE RLS em profiles, user_roles, enrollments | Banco | backlog |

---

## Sprint Produto — Documentação e Landing Page

| Story | Módulo | Status |
|-------|--------|--------|
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-025 — Documentação Completa da Plataforma]] | Documentação | pronto |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-026 — Atualizar Landing Page com Features Reais]] | Marketing/Frontend | pronto |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-027 — Internacionalização i18n PT/EN]] | Frontend/UX | pronto |
| [[Clientes/Trivia/TriviaEdutech/Projeto/Stories/STORY-028 — Módulo de Atividades e Avaliações]] | Avaliações/Cursos | pronto |

---

## Sprint 4 — Qualidade de Código (P2)

> Refatorar componentes gigantes, eliminar any, rate limiting.

| Story | Módulo | Status |
|-------|--------|--------|
| STORY-013 — Refatorar Admin Dashboard (968→<300 linhas) | Manutenção | backlog |
| STORY-014 — Refatorar CourseDetail (780→<300 linhas) | Manutenção | backlog |
| STORY-015 — Eliminar 11 usos de `any` | Qualidade | backlog |
| STORY-016 — Rate limiting Edge Functions críticas | Segurança | backlog |

---

## Sprint 5 — Independência de Ferramentas (P2)

| Story | Módulo | Status |
|-------|--------|--------|
| STORY-017 — Migrar AI Gateway Lovable para provider direto | Infra | concluido |
| STORY-018 — Testes unitários (Edge Functions + hooks) | Testes | backlog |

---

## Sprint 6 — Mobile First (P1)

> Consumo de vídeo via celular é o caso de uso primário dos alunos. Experiência mobile deve ser perfeita.

| Story | Módulo | Status |
|-------|--------|--------|
| STORY-019 — Audit mobile completo (viewport 375px em todas as telas) | Mobile | backlog |
| STORY-020 — Player de vídeo responsivo + controles touch-friendly | Video/Mobile | backlog |
| STORY-021 — Bottom navigation bar para alunos no mobile | UX/Mobile | backlog |
| STORY-022 — Performance mobile (lazy images, bundle size, LCP) | Performance | backlog |
| STORY-023 — PWA: instalação + offline básico (conteúdo em cache) | PWA | backlog |

---

*Atualizar este roadmap sempre que uma nova fase ou milestone for definido.*
