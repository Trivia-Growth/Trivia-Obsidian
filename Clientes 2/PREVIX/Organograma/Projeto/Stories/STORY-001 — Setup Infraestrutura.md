---
id: STORY-001
titulo: "Setup de Infraestrutura — GitHub, Supabase, Netlify, Lovable, AIOX"
fase: 1
modulo: "infra"
status: concluido
prioridade: alta
agente_responsavel: "@piloto"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-001 — Setup de Infraestrutura

## Contexto

> Story inicial obrigatória pelo padrão Trivia. Configura toda a infraestrutura de base do projeto antes de qualquer feature: repositório de código, banco de dados, hospedagem, ferramenta de IA visual e agentes locais.

## Spec de Referência

- [[../../../../Documentos Trivia 2/Padrão Projetos/00 - Checklist de Início|Checklist de Início]]
- [[../../../../Documentos Trivia 2/Padrão Projetos/01 - Arquitetura/Dois Repositórios|Dois Repositórios]]

## Critérios de Aceite

- [x] CA1 — Estrutura local criada: vault `Clientes 2/PREVIX/Organograma/` + repo `organograma-previx-app/` lado a lado
- [x] CA2 — Templates de código preenchidos (`CLAUDE.md`, `PROJECT_REQUIREMENTS.md`, `architecture.md`, `SECURITY_DEBT.md`, `netlify.toml`)
- [x] CA3 — Repositório criado no GitHub (Trivia-Growth/organograma-previx-app) e push do commit inicial feito
- [x] CA4 — Projeto Supabase `organograma-previx` (ref `yqexjddpotlaqraljwvl`, região São Paulo), CLI v2.95.4 logada e linkada
- [x] CA5 — Projeto Lovable criado, Custom Instructions preenchidas com domínio PREVIX (paleta, papéis, anti-loop), GitHub conectado e repo recriado pela Lovable
- [x] CA6 — Site Netlify `organograma-previx` criado, env vars configuradas, CLI v25.6.1 logada e linkada, **primeiro deploy verde** (commit `4b508f4`, framework `tanstack-start`) em https://organograma-previx.netlify.app
- [x] CA7 — AIOX v5.0.7 instalado (22 agents, 205 tasks, 12/12 IDE-synced, 2 hooks Claude Code, npm deps OK com 0 critical/high). Doctor: 11 PASS / 3 WARN / 1 FAIL — warns são populadas pelo wizard interativo, não bloqueiam uso
- [x] CA8 — `00 - Índice.md` do vault preenchido com URLs reais: GitHub `Trivia-Growth/organograma-previx-app`, Supabase ref `yqexjddpotlaqraljwvl`, Netlify `organograma-previx.netlify.app`

---

## Implementação

> Preenchido pelo `@dev` após concluir. Piloto não edita esta seção.

**Status:** `concluido`

**Branch/PR:** main (commits `2595fe2`, `678ea1b`, `4b508f4` merge, `145f779` AIOX)

**Arquivos alterados:**
- `~/Documents/Obsidian/organograma-previx-app/CLAUDE.md`
- `~/Documents/Obsidian/organograma-previx-app/PROJECT_REQUIREMENTS.md`
- `~/Documents/Obsidian/organograma-previx-app/architecture.md`
- `~/Documents/Obsidian/organograma-previx-app/SECURITY_DEBT.md`
- `~/Documents/Obsidian/organograma-previx-app/netlify.toml`
- `Clientes 2/PREVIX/Organograma/00 - Índice.md`
- `Clientes 2/PREVIX/Organograma/Projeto/Dashboard do Projeto.md`
- `Clientes 2/PREVIX/Organograma/Projeto/Roadmap.md`

**Notas de implementação:**

Setup local concluído pelo Claude Code. Passos externos (GitHub/Supabase/Netlify/Lovable/AIOX) executados pelo piloto seguindo guia entregue na conversa.

---

## QA

> Preenchido pelo `@qa`. Piloto não edita esta seção.

**Gate:** —

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict (após Lovable scaffolding)
- [ ] `cat .aiox-core/version.json` retorna v5+
- [ ] `supabase projects list` mostra projeto Active
- [ ] `netlify status` mostra site linkado
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões

- `2026-04-23` — Decidido manter vault e repo de código como irmãos em `~/Documents/Obsidian/` em vez de mover para `~/Projetos/`.
- `2026-04-23` — Não fazer scaffold manual de Vite/React; deixar a Lovable gerar a estrutura inicial ao importar o repo do GitHub (padrão Trivia).
- `2026-04-23` — **Lovable não importa mais repos do GitHub.** A doc oficial confirma que o fluxo é só de exportação. O checklist do padrão Trivia (`Documentos Trivia 2/Padrão Projetos/00 - Checklist de Início.md`) foi atualizado nesta data com banner de aviso, Passo 1 marcado como opcional e Passo 4 reescrito (criar projeto Lovable → Custom Instructions → Connect GitHub que cria repo novo → Clone + 5 docs). Para este projeto, decidido deletar `Trivia-Growth/organograma-previx-app` (que tem só nosso commit inicial) e deixar a Lovable recriar com mesmo nome — Netlify e Supabase ficam preservados.
