---
tags: [story, infra, heziom-api, padrao-trivia]
status: em-progresso
fase: 1
prioridade: média
criado: 2026-05-28
atualizado: 2026-05-28
---

# STORY-010 — Padronização do repo heziom-api (Padrão Trivia)

## Objetivo

O repositório `heziom-api` foi criado fora do padrão Trivia (só `README.md`, `netlify.toml` e as functions). Esta story alinha o repo ao [[Documentos Trivia/Padrão Projetos/Leia me Antes de começar algo|Padrão Trivia]] para que as próximas features sigam o ciclo de story/Diff Plan/DoD.

> Como é um repo **backend-only** (Netlify Functions Node), o padrão foi **adaptado** — itens de frontend (Vite/React/Bulletproof, RLS por papel, JWT de usuário, `npm run build`/`dist`) não se aplicam. Decisão registrada como ADR-003 no `architecture.md` do repo.

---

## Spec de Referência

- [[heziom-api — Referência Técnica]]
- [[Tray - Webhook Deploy Guide]]
- [[Meta CAPI — Configuração Tray Ecommerce]]
- Padrão: `Documentos Trivia/Padrão Projetos/09 - Migrações/Migrar Projeto Lovable para Padrão Trivia`

---

## Critérios de Aceite

- [x] CA1 — Arquivos de padrão na raiz do repo: `CLAUDE.md`, `AGENTS.md`, `architecture.md`, `PROJECT_REQUIREMENTS.md`, `SECURITY_DEBT.md` (adaptados a backend)
- [x] CA2 — `specs/technical/` com `API_SPECIFICATION.md`, `BUSINESS_LOGIC.md`, `TROUBLESHOOTING.md`
- [x] CA3 — `netlify.toml` com security headers (sem quebrar os redirects de API)
- [x] CA4 — `README.md` refletindo as 4 funções + `.gitignore` com `.DS_Store`
- [x] CA5 — Verificação de segurança: `.env` no `.gitignore` e nunca commitado (`git log --all`)
- [ ] CA6 — AIOX instalado (`triviaiox-core install`) — **pendente** (framework não disponível nesta máquina; passo do Lucas/Perfil A)
- [ ] CA7 — Commit + push em `main` — **pendente de autorização do JG**

---

## Implementação

**Status:** `em-progresso`

**Arquivos criados (repo `heziom-api`):**
- `CLAUDE.md`, `AGENTS.md`, `architecture.md`, `PROJECT_REQUIREMENTS.md`, `SECURITY_DEBT.md`
- `specs/technical/API_SPECIFICATION.md`, `specs/technical/BUSINESS_LOGIC.md`, `specs/technical/TROUBLESHOOTING.md`

**Arquivos alterados (repo `heziom-api`):**
- `netlify.toml` (security headers), `.gitignore` (`.DS_Store`), `README.md`

**Notas de implementação:**
- Repo e vault **não** ficam lado a lado (repo em `Obsidian/Github/heziom-api`, vault em `Obsidian/Trivia-Obsidian/...`) → path relativo no `CLAUDE.md` é `../../`.
- 3 ADRs documentados: ADR-001 (token no Supabase), ADR-002 (CAPI server-side primário), ADR-003 (padrão adaptado a backend).

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL` — _pendente_

**Checklist:**
- [x] Sem segredo exposto no repositório (`.env` ignorado e nunca commitado)
- [ ] AIOX instalado e agentes disponíveis
- [ ] Build/deploy Netlify sem regressão após push

---

## Notas e Decisões

- **Host de teste:** `TRAY_API_HOST` aponta para `lojatesteintegracaotray...` (loja de teste). Registrado como Questão Aberta #1 em `PROJECT_REQUIREMENTS.md` e SEC no `SECURITY_DEBT.md` — confirmar com JG se é intencional.
- **`tray-capi.js`:** em standby desde o GTM v20 (sem consumidor). Mantido como fallback; decisão de remover fica para uma story futura.
- **Pendências externas:** instalar AIOX (precisa do framework `Trivia-Growth/Triviaiox`) e push (sem autorização de push direto registrada para `heziom-api`, diferente de outros repos Heziom/Trivia).
