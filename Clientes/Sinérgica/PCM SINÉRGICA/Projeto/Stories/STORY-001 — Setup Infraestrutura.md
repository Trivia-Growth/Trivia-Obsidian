---
id: STORY-001
titulo: "Setup de Infraestrutura e Migração para o Padrão Trívia"
fase: 1
modulo: "infra"
status: concluido
prioridade: alta
agente_responsavel: "@devops / @architect"
criado: 2026-06-18
atualizado: 2026-06-18
---

# STORY-001 — Setup de Infraestrutura e Migração para o Padrão Trívia

## Contexto

O PCM Sinérgica já existia e rodava em produção (frontend Netlify + Supabase + Evolution no Cloudfy), mas fora do Padrão Trívia. Esta story registra a estabilização do Agente Zé e a migração do projeto para o padrão (TRIVIAIOX + documentação estruturada), conforme o checklist `09 - Migrar Projeto Lovable para Padrão Trivia`.

## Critérios de Aceite

- [x] CA1 — Agente Zé recebendo e respondendo no WhatsApp em produção
- [x] CA2 — Edge functions ressincronizadas com produção (Git = fonte da verdade)
- [x] CA3 — TRIVIAIOX (Padrão Trívia) instalado e commitado
- [x] CA4 — Docs do repo criados: `CLAUDE.md`, `AGENTS.md`, `architecture.md`, `PROJECT_REQUIREMENTS.md`, `SECURITY_DEBT.md`
- [x] CA5 — `netlify.toml` com security headers/CSP
- [x] CA6 — Vault estruturado: `00 - Índice`, `Projeto/` (Dashboard, Roadmap, Status do Sistema, Stories)
- [x] CA7 — Supabase CLI linkado; functions e secrets confirmados

---

## Implementação

**Status:** `concluido`

**Correções do Agente Zé (2026-06-17):**
- `EVOLUTION_INSTANCE_ZE` corrigido de vazio → `ze-pcm-v2` (envio voltou a funcionar).
- Header `Authorization` (anon) adicionado ao webhook na Evolution (recebimento estava em 401).
- Detecção determinística de menção ("Zé"/@número) no `pcm-ze-agent` + rede de segurança contra SKIP indevido.
- Latência reduzida de 40-60s → ~7-9s (disparo via `EdgeRuntime.waitUntil` no webhook + agrupamento 8s → 3s).

**Migração para o padrão (2026-06-18):**
- TRIVIAIOX instalado (`.triviaiox-core` + integrações de IDE).
- Resync das ~20 edge functions com produção (corrigiu drift repo↔prod).
- Docs do repo criados e vault estruturado.
- Mapeamento completo de status produzido pelos agentes (`Status do Sistema.md` + `architecture.md` + `SECURITY_DEBT.md`).

**Arquivos alterados (repo):** `CLAUDE.md`, `AGENTS.md`, `architecture.md`, `PROJECT_REQUIREMENTS.md`, `SECURITY_DEBT.md`, `netlify.toml`, `.triviaiox-core/**`, `supabase/functions/**` (resync + fixes do Zé).

**Notas:** o token de acesso Supabase deploya functions e roda SQL, mas não escreve secrets (setados por JG).

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Agente Zé validado em produção (recebe + responde; teste no grupo "Teste Fluxo PCM")
- [x] Build do frontend via `npx vite build`
- [x] Docs e vault no padrão
- [ ] Débitos de segurança SEC-001 (IDOR) e SEC-002 (FORCE RLS) — **abertos**, próximas stories

> Esta story é de infraestrutura/migração. Os débitos de segurança identificados no mapeamento ficam registrados em `SECURITY_DEBT.md` e devem virar stories próprias na Fase 2.
