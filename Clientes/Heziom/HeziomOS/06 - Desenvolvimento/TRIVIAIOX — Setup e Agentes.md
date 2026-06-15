# TRIVIAIOX — Setup e Agentes

## O que é o TRIVIAIOX

TRIVIAIOX é um **framework de agentes IA** para orquestração de desenvolvimento full stack dentro do Claude Code. Ele instala um conjunto de agentes especializados no repositório, cada um com um papel bem definido no ciclo de desenvolvimento — desde arquitetura e implementação até QA, DevOps, segurança e UX.

O framework impõe um workflow estruturado: toda implementação começa com uma story, passa por quality gates e só vai para produção com aprovação do `@devops`. O objetivo é garantir qualidade, rastreabilidade e segurança em projetos de software complexos.

---

## Instalação no HeziomOS

| Campo | Valor |
|---|---|
| **Localização** | `heziomos/.triviaiox-core/` |
| **Arquivos instalados** | 1156+ arquivos |
| **Agentes disponíveis** | 14 agentes |
| **Doctor status** | ✅ 12 PASS \| ⚠️ 3 WARN \| 0 FAIL |

Os warnings do doctor são relacionados a configurações opcionais e não impactam o funcionamento do framework.

---

## Os 14 Agentes

### Coordenação

| Agente | Papel |
|---|---|
| `@triviaiox-master` | Coordenador geral do framework. Meta-agente que conhece todos os outros e pode delegar tasks. Ponto de entrada para dúvidas sobre o próprio TRIVIAIOX. |
| `@sm` | **Scrum Master** — facilita as cerimônias ágeis, remove impedimentos, garante que o processo é seguido. |
| `@pm` | **Product Manager** — cria stories, define roadmap, escreve especificações de produto. |
| `@po` | **Product Owner** — prioriza o backlog, define critérios de aceite, toma decisões de produto. |

### Desenvolvimento

| Agente | Papel |
|---|---|
| `@dev` | Implementação de features. Trabalha a partir das stories e só implementa o que os acceptance criteria pedem. |
| `@architect` | Decisões de arquitetura, criação de ADRs (Architecture Decision Records), revisão de design de sistema. |
| `@data-engineer` | Migrations de banco de dados, queries otimizadas, análise de performance, modelagem de dados. |
| `@prompt-engineer` | Engenharia de prompts para IA — refina prompts de agentes, LLMs e Edge Functions. |

### Qualidade e Segurança

| Agente | Papel |
|---|---|
| `@qa` | Quality Assurance — revisa código, valida critérios de aceite, roda quality gates, emite PASS/CONCERNS/FAIL. |
| `@security` | Análise de segurança, hardening de RLS, revisão de permissões, LGPD compliance. |
| `@reliability` | SRE — confiabilidade do sistema, SLOs, alertas, runbooks, análise de incidentes. |

### Operações e Design

| Agente | Papel |
|---|---|
| `@devops` | **Única autoridade para `git push` e deploy para produção**. Gerencia CI/CD, secrets, Netlify, GitHub Actions. |
| `@ux` | Design e UX — fluxos de usuário, wireframes conceituais, revisão de interfaces. |
| `@ux-design-expert` | Especialização avançada em UX — sistemas de design, acessibilidade, design tokens. |
| `@analyst` | Análise de negócio, métricas, KPIs, interpretação de dados para tomada de decisão. |

---

## Como Usar os Agentes

Basta mencionar o agente no chat do Claude Code:

```
@qa revise o componente TransportadoraCard para verificar RLS e tipagem

@architect preciso de um ADR para a decisão de usar React Query vs SWR

@data-engineer otimize essa query que está demorando mais de 2s

@devops faça o deploy do apps/hub para produção

@pm crie uma story para o módulo de relatórios financeiros
```

Os agentes conhecem o contexto do HeziomOS (monorepo, Supabase schemas, Netlify sites) e respondem dentro das regras do framework.

---

## Regras Invioláveis do Workflow TRIVIAIOX

### 1. Toda implementação começa com uma story

- Nenhum código é escrito sem uma story em `docs/stories/` (no monorepo) ou `01 - Projeto & Visão Geral/Stories/` (no vault)
- A story define o contexto, os acceptance criteria e o épico
- `@pm` ou `@po` cria a story; `@dev` implementa

### 2. Implementar apenas o que os acceptance criteria pedem

- `@dev` não adiciona features não especificadas ("gold-plating" é proibido)
- Qualquer escopo adicional vira uma nova story

### 3. Quality gates antes de concluir

```bash
pnpm lint && pnpm typecheck
```

- `@qa` valida todos os acceptance criteria
- Resultado: `PASS` (pode mergear), `CONCERNS` (mergear com ressalvas documentadas), `FAIL` (não mergear)

### 4. `@devops` é a única autoridade para git push e deploy

- Nenhum outro agente (nem `@dev`, nem `@qa`) faz `git push`
- Deploy para produção sempre passa por `@devops`
- Protege o `main` branch de pushes acidentais ou mal revisados

---

## Comandos Disponíveis

Os comandos do TRIVIAIOX ficam em `.claude/commands/TRIVIAIOX/agents/`. Cada agente tem seu próprio arquivo de comando que define seu comportamento, responsabilidades e limitações.

Para listar os comandos disponíveis:

```bash
ls heziomos/.claude/commands/TRIVIAIOX/agents/
```

---

## Hooks de Governance

Os hooks ficam em `.claude/hooks/` e são executados automaticamente durante as operações do Claude Code:

| Hook | O que faz |
|---|---|
| `enforce-architecture-first` | Bloqueia implementação sem ADR para decisões arquiteturais |
| `enforce-git-push-authority` | Impede `git push` por qualquer agente exceto `@devops` |
| SQL governance | Valida migrations contra padrões de segurança (RLS, nomenclatura) |
| `write-path-validation` | Verifica que arquivos são escritos nos paths corretos do monorepo |

---

## Como Rodar o Doctor

```bash
node /Users/lucasazevedo/Documents/GitHub/Triviaiox/bin/triviaiox.js doctor
```

Resultado esperado no HeziomOS:

```
✅ 12 PASS
⚠️  3 WARN  (opcionais — não impedem o uso)
❌  0 FAIL
```

---

## Referências

- [[STORY-015 — Instalação TRIVIAIOX]]
- [[Monorepo — Estrutura e Setup]]
- [GitHub — heziomos](https://github.com/Org-Heziom/heziomos)
