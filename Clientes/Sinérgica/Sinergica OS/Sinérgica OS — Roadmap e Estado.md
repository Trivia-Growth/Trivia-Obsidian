# Sinérgica OS — Roadmap e Estado

> Documento **volátil** — reflete o estado do projeto a cada sessão de trabalho.
> A fonte técnica autoritativa é `docs/STATE.md` e `docs/epics/ROADMAP.md` no repositório.
> Última atualização: 2026-06-29

---

## Status Geral

| Item | Detalhe |
|------|---------|
| **Fase** | Mês 1 concluído — casca + scaffold + specs iniciais |
| **Próxima fase** | Mês 2 — construção dos módulos (PCM, Comercial, Financeiro, Auvo, Atendimento) |
| **Gates ativos** | pnpm test ✅ · typecheck ✅ · lint ✅ · audit-esteira ✅ · eval-spec-fidelity ✅ |

---

## O que foi entregue no Mês 1

- ✅ Scaffold completo (Padrão OS v2): monorepo pnpm + Turborepo, Biome, Vitest, Husky
- ✅ 9 bounded contexts definidos e documentados (`docs/blueprint/`)
- ✅ Schemas de domínio: migration base com RLS FORCE e colunas de auditoria
- ✅ App shell: tela de login + home com cards dos módulos (`E00-S01`)
- ✅ Redesign home: sidebar + abas por módulo + dashboard PCM (`E00-S02`)
- ✅ Priorização de backlog por Matriz GUT — primeiro feature completo (`E01-S01`)
- ✅ ADR-0001: PCM como origin of truth; Auvo recebe `externalId` idempotente
- ✅ ADR-0002: Detecção determinística de menção ao Zé antes do LLM

---

## Roadmap por Mês

### Mês 2 — Construção (em andamento)

**Prioridade 1 — Loop operacional mínimo (PCM + Auvo + Zé)**

| Epic | Story | Descrição | Status |
|------|-------|-----------|--------|
| E01 | E01-S02 | Abertura de chamado via Agente Zé | Spec aprovada · aguarda implementação |
| E01 | E01-S03 | Ciclo de OS: kanban + sync Auvo | Planejado |
| E01 | E01-S04 | Visitas: agendamento + planejamento | Planejado |
| E01 | E01-S05 | Preventivo: plano por cliente + Auvo Service Orders | Planejado |
| E02 | E02-S01 | Agente Zé: webhook Evolution + fila + LLM | Planejado |
| E03 | E03-S01 | Propostas: 4 tipos migrados do v2 | Planejado |
| E04 | E04-S01 | Faturamento básico (OS finalizada → custo) | Planejado |

**Integração Auvo (fase 1 do hub):**

Ver [[Mapeamento Auvo x PCM como Hub (29-06-2026)]] — Roadmap do hub, seção 6.

| Função | O que faz | Fase |
|--------|-----------|------|
| `pcm-auvo-login` | Login `POST /login` + cache de token 30min | 1 |
| `pcm-auvo-create-task` | Cria task com `externalId = os.id` | 1 |
| `pcm-auvo-patch-task-orientation` | Atualiza descrição/orientação | 1 |
| `pcm-auvo-customers-sync` | PCM → Auvo: cria/atualiza clientes | 1 |
| `pcm-auvo-equipment-sync` | PCM → Auvo + espelho de cache | 1 |
| `pcm-auvo-webhook` | Recebe eventos + 7 camadas de segurança | 1 |

### Mês 3 — Ativação

| Módulo | O que entra |
|--------|-------------|
| Marketing | Conteúdo + automação multicanal |
| Growth | Análise Meta Ads / Google Ads |
| Área do Cliente | Portal do síndico |
| Cockpit | Dashboards gerenciais + SLA |
| **Go-live** | Supabase + Netlify produção + cutover do v2 |

---

## Bloqueios Ativos

| # | Bloqueio | Quem destrava |
|---|---------|---------------|
| B1 | Supabase ainda não provisionado (URL/anon key reais ausentes) | @devops · Lucas |
| B2 | Evolution API: webhook não apontado para Supabase Edge Function | @devops · Lucas |

---

## Specs no Repositório

| ID | Descrição | Status | AC verdes |
|----|-----------|--------|-----------|
| E00-S01 | Login + Home com cards dos módulos | ✅ Implementado | ✅ |
| E00-S02 | Redesign home: sidebar + abas + dashboard PCM | ✅ Implementado (SPEC_DEVIATION) | ✅ |
| E01-S01 | Priorização de backlog por Matriz GUT | ✅ Implementado | ✅ |
| E01-S02 | Abertura de chamado via Agente Zé | 📋 Spec aprovada | ⏳ |

---

## Backlog Técnico (adiado intencionalmente)

- Evals de laudo SPDA (comparação LLM × laudos validados por engenheiro) → após primeira geração em produção
- Repriorização por IA no backlog GUT → após 3 meses de histórico
- Modo do Zé por número de técnico (DM direto) → pedido explícito da Sinérgica
- CODEOWNERS configurado → quando o time de dev estiver definido

---

## Como Trabalhar nas Stories

1. Leia `docs/epics/ROADMAP.md` no repo — veja qual story está disponível (sem owner).
2. Marque-se como owner antes de codar.
3. Siga o ciclo: `@pm/@analyst` → `@architect` → `@sm` → `@dev` → `@qa` → `@devops`.
4. Nunca implemente sem `spec.md` + `tasks.md` existirem.
5. Ao concluir: atualize `ROADMAP.md` + `STATE.md` + este documento.
