---
id: STORY-015
titulo: "Instalação e Configuração do TRIVIAIOX no Monorepo"
fase: 1
modulo: infra
status: concluido
prioridade: alta
agente_responsavel: "@devops"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-015 — Instalação TRIVIAIOX

## Contexto

O TRIVIAIOX é o framework de agentes IA que governa o desenvolvimento do HeziomOS. Sem ele instalado, não há agentes especializados (`@qa`, `@architect`, `@dev`, etc.), não há hooks de governance (git push authority, SQL validation, architecture-first) e o desenvolvimento fica sem as guardrails do framework.

Esta story cobre a instalação do TRIVIAIOX no monorepo `heziomos` e a verificação de que todos os componentes estão funcionando.

## Spec de Referência

- [[TRIVIAIOX — Setup e Agentes]]
- [[Monorepo — Estrutura e Setup]]
- [[STORY-013 — Setup Monorepo heziomos]]

## Critérios de Aceite

### Instalação

- [x] CA1 — TRIVIAIOX instalado em `.triviaiox-core/` (1156+ arquivos)
- [x] CA2 — `node /Users/lucasazevedo/Documents/GitHub/Triviaiox/bin/triviaiox.js doctor` passa: **12 PASS | 3 WARN | 0 FAIL** (warnings são opcionais e não bloqueiam o uso)

### Agentes

- [x] CA3 — 14 agentes disponíveis em `.claude/commands/TRIVIAIOX/agents/`:
  - [x] `@triviaiox-master` — coordenador geral
  - [x] `@dev` — implementação de features
  - [x] `@qa` — quality assurance
  - [x] `@architect` — arquitetura e ADRs
  - [x] `@sm` — Scrum Master
  - [x] `@pm` — Product Manager
  - [x] `@po` — Product Owner
  - [x] `@devops` — git push e deploy
  - [x] `@data-engineer` — banco de dados e migrations
  - [x] `@security` — segurança e hardening
  - [x] `@analyst` — análise de negócio e métricas
  - [x] `@ux` — design e UX
  - [x] `@reliability` — SRE e confiabilidade
  - [x] `@prompt-engineer` — engenharia de prompts

### Hooks de Governance

- [x] CA4 — Hooks instalados em `.claude/hooks/`:
  - [x] `enforce-architecture-first` — bloqueia implementação sem ADR
  - [x] `enforce-git-push-authority` — só `@devops` pode fazer git push
  - [x] SQL governance — valida migrations contra padrões de segurança
  - [x] `write-path-validation` — garante paths corretos no monorepo

### Configuração

- [x] CA5 — `CLAUDE.md` do TRIVIAIOX presente em `.claude/CLAUDE.md` com regras do framework
- [x] CA6 — Tudo commitado no GitHub (`Org-Heziom/heziomos`) — commit `b3c6bc2`

---

## Implementação

> ⚠️ Preenchido pelo @dev após concluir. Não editar manualmente.

**Status:** `concluido`
**Branch/PR:** `main` — commit `b3c6bc2`
**Arquivos alterados:**
- `.triviaiox-core/` (1156+ arquivos — framework completo)
- `.claude/commands/TRIVIAIOX/agents/` (14 arquivos de agentes)
- `.claude/hooks/enforce-architecture-first`
- `.claude/hooks/enforce-git-push-authority`
- `.claude/hooks/` (SQL governance, write-path-validation)
- `.claude/CLAUDE.md`

---

## QA

> ⚠️ Preenchido pelo @qa. Não editar manualmente.

**Gate:** `PASS`
**Checklist:**
- [x] Critérios de aceite validados — todos os 14 agentes acessíveis
- [x] Sem regressões em outras features do monorepo
- [x] Doctor: 12 PASS | 3 WARN | 0 FAIL — warnings são não-bloqueantes
- [x] Hooks de governance ativos e funcionando
- [x] Commit `b3c6bc2` verificado no GitHub

**Notas QA:**
- Os 3 WARNs do doctor são relacionados a configurações opcionais (não impactam funcionalidade).
- `@devops` é a única autoridade para git push — hook enforce-git-push-authority ativo.

---

## Notas e Decisões

- TRIVIAIOX instalado via `npx triviaiox-core install` na raiz do monorepo
- Os warnings do doctor são aceitáveis — relacionados a integrações opcionais não configuradas ainda
- O hook `enforce-git-push-authority` é crítico: impede que qualquer agente exceto `@devops` faça push para o repositório, protegendo o `main` branch
- `.triviaiox-core/` é versionado no monorepo para garantir reprodutibilidade — não depende de versão global instalada na máquina
- Agente `@ux-design-expert` está disponível como especialização avançada do `@ux`

## Dependências

- [[STORY-013 — Setup Monorepo heziomos]] — monorepo deve existir antes da instalação
- Node.js >= 20 instalado
- Acesso de escrita ao repositório `Org-Heziom/heziomos`
