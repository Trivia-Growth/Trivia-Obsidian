---
id: STORY-001
titulo: "Setup Astro + Triviaiox + Repo"
fase: 1
modulo: "Infraestrutura"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-001 — Setup Astro + Triviaiox + Repo

## Contexto

Story zero do projeto Site PREVIX. Cria toda a infraestrutura de código que as outras stories vão consumir: repositório no GitHub, scaffold Astro, integração Triviaiox, conexão com Supabase compartilhado, deploy Netlify, templates do padrão Trívia commitados. Sem essa story, nada mais avança.

## Spec de Referência

- [[../../Briefing Inicial]]
- [[../../Decisões Arquiteturais|ADR-001, ADR-002, ADR-003, ADR-004, ADR-006]]
- [[../../Custom Instructions Triviaiox]]
- `Documentos Trivia 2/Padrão Projetos/00 - Checklist de Início.md` — segue o checklist (Passos 1-6) **adaptado** (Lovable substituído por scaffold Astro manual; AIOX substituído por Triviaiox).

## Critérios de Aceite

- [ ] CA1 — Repositório `previx-site-app` criado no GitHub `Trivia-Growth`, privado, com README inicial
- [ ] CA2 — Repo clonado em `~/Documents/Obsidian/Github/previx-site-app/`
- [ ] CA3 — Scaffold Astro 4+ inicializado com `npm create astro@latest`, integrações `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/sitemap`, `@astrojs/mdx` adicionadas
- [ ] CA4 — `npx triviaiox-core install` rodado com sucesso; `.triviaiox-core/version.json` confirma versão `4.x` ou superior
- [ ] CA5 — 5 templates do padrão Trívia (`CLAUDE.md`, `architecture.md`, `PROJECT_REQUIREMENTS.md`, `SECURITY_DEBT.md`, `netlify.toml`) copiados de `Documentos Trivia 2/Padrão Projetos/07 - Templates de Código/` para a raiz, **preenchidos** com os 6 ADRs do projeto
- [ ] CA6 — Configurar `.env.example` com `PUBLIC_SUPABASE_URL=https://yqexjddpotlaqraljwvl.supabase.co` e `PUBLIC_SUPABASE_ANON_KEY=<obter no console>` (decisão fechada — [[../../Decisões Arquiteturais|ADR-003]] aceito: Supabase compartilhado com todos os sub-projetos Previx)
- [ ] CA7 — Cliente Supabase em `src/lib/supabase.ts` lendo `import.meta.env.PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` (não hardcoded). Confirmar que `supabase.auth` aponta ao mesmo provider do Organograma (mesma anon key)
- [ ] CA8 — Site Netlify `previx-site` criado e linkado ao repo, env vars configuradas, primeiro deploy passa (mesmo com página padrão do Astro)
- [ ] CA9 — Push inicial para `main` passa nos hooks (lint, typecheck, prettier do Triviaiox)
- [ ] CA10 — `Site/00 - Índice.md` atualizado com URLs reais (Netlify, Supabase, GitHub) substituindo os "(a criar)"

---

## Implementação

> Preenchido pelo `@dev` após concluir. Piloto não edita esta seção.

**Status:** `em-progresso` | `concluido`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`. Piloto não edita esta seção.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict
- [ ] Triviaiox instalado e funcional (testar `@dev *help`)
- [ ] Templates Trívia preenchidos (sem `[PREENCHER]` órfão exceto onde marcado intencionalmente)
- [ ] Netlify deploy verde
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões

> Registro de decisões tomadas durante a implementação.
