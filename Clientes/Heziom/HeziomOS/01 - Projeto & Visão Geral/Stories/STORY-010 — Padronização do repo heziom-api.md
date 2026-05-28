---
tags: [story, infra, heziom-api, padrao-trivia]
status: concluido
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
- [x] CA6 — TRIVIAIOX (AIOX) v5.0.3 instalado em `.triviaiox-core/` (1106 arquivos, 14 pastas; 746 entidades no registry)
- [x] CA7 — Commit + push em `main` (autorizado pelo JG)

---

## Implementação

**Status:** `concluido`

**Commits:** `b109f40` (docs do padrão) + commit do TRIVIAIOX/ajustes.

**Arquivos criados (repo `heziom-api`):**
- `CLAUDE.md`, `AGENTS.md`, `architecture.md`, `PROJECT_REQUIREMENTS.md`, `SECURITY_DEBT.md`
- `specs/technical/API_SPECIFICATION.md`, `specs/technical/BUSINESS_LOGIC.md`, `specs/technical/TROUBLESHOOTING.md`
- TRIVIAIOX: `.triviaiox-core/`, `.claude/` (10 comandos extras + agentes), `.github/agents/`, `.codex/`, `.cursor/`, `.gemini/`, `.antigravity/`

**Arquivos alterados (repo `heziom-api`):**
- `netlify.toml` (security headers), `.gitignore` (`.DS_Store` + seções TRIVIAIOX), `README.md`, `.env.example`

**Notas de implementação:**
- Repo e vault **não** ficam lado a lado (repo em `Obsidian/Github/heziom-api`, vault em `Obsidian/Trivia-Obsidian/...`) → path relativo no `CLAUDE.md` é `../../`.
- 3 ADRs documentados: ADR-001 (token no Supabase), ADR-002 (CAPI server-side primário), ADR-003 (padrão adaptado a backend).
- **Instalação do TRIVIAIOX:** framework local em `Trivia-Obsidian/Triviaiox-main` (não em `~/Documents/GitHub/Triviaiox`). Comando: `node .../Triviaiox-main/bin/triviaiox.js install --quiet --merge`. Os modos interativos travam neste ambiente sem TTY — usar **sempre `--quiet`**. Foi lento (~15 min) por leitura dos arquivos do vault (cloud sync).
- ⚠️ O merge do instalador **sobrescreveu o `.env.example`** com o template TRIVIAIOX, removendo as 9 vars da Heziom. **Restauradas** numa seção própria ("heziom-api (aplicação)"). CLAUDE.md e AGENTS.md foram preservados.

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Sem segredo exposto no repositório (`.env` ignorado e nunca commitado)
- [x] TRIVIAIOX instalado e agentes disponíveis
- [x] `.env.example` da Heziom restaurado após o merge do instalador
- [ ] Confirmar deploy Netlify sem regressão após o push (security headers passam a valer)

---

## Notas e Decisões (confirmadas por JG em 28/05/2026)

- **Host de teste é intencional:** integração em **homologação até 13/08/2026**. Migrar para produção (`www.editoraheziom.com.br`, store ID **1345958**) trocando host, credenciais e re-seed do token. Aviso ⚠️ mantido como boa prática.
- **`tray-capi.js` fica como fallback manual** (útil para testes). Remover só quando o webhook estiver comprovadamente estável por tempo suficiente.
- **Próxima feature já entra no ciclo TRIVIAIOX:** `/sm` cria a story → `/dev` implementa com Diff Plan → `/qa` → push.
