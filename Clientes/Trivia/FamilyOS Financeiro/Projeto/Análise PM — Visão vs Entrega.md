---
tags: [projeto, análise, pm]
criado: 2026-05-04
---

# Análise PM — Visão Original vs. Entrega Atual

> Documento gerado pelo @pm para avaliar aderência entre a ideia original do projeto e o que foi efetivamente implementado.

---

## Resumo Executivo

**Velocidade de entrega:** Excepcional. 12 stories implementadas em um único sprint de desenvolvimento.
**Cobertura funcional:** 91% dos módulos planejados têm código funcional.
**Qualidade técnica:** Build sem erros, 95% dos testes passando, RLS implementado em todas as tabelas.
**Gap principal:** Integração profunda entre o Agente e os módulos (tools) — o agente conversa mas ainda não "consulta" todos os módulos via ferramentas.

---

## Scorecard por Módulo

| Módulo | Visão Original | Status Atual | Cobertura | Nota |
|--------|---------------|--------------|-----------|------|
| M1 — Agente Core | Personalidade, memória LP, onboarding, tool registry, skills | Chat funcional, memória, personalidade | 70% | Tools pendentes |
| M2 — Extratos | Upload multi-formato, parser LLM, categorização, dedup | Tudo implementado | 95% | Falta tool `get_expenses` |
| M3 — Orçamento | Tetos por categoria, membros, calendário financeiro | Tetos por categoria implementados | 75% | Falta calendário financeiro |
| M4 — Metas | Criação conversacional, progresso, sugestões, compartilhadas | UI completa, contribuições, compartilhamento | 80% | Falta criação via agente |
| M5 — Investimentos | Cadastro, dashboard, análise agente, simulador | Cadastro + dashboard + simulador | 80% | Falta análise via agente |
| M6 — WhatsApp | Webhook, comandos, proativas, áudio | Webhook + comandos + config | 70% | Falta áudio e proativas |
| M7 — Notion/Obsidian | Sync bidirecional Notion, export Obsidian | Não implementado | 0% | Fase 3 |
| M8 — Config LLMs | BYOK, seleção por função, fallback, monitor custo | BYOK + seleção de modelo | 60% | Falta fallback e monitor |
| M9 — Dashboard | Cards, gráfico fluxo, feed agente, atalho chat | Tudo implementado | 95% | Completo |
| M10 — Proativo | Revisão mensal, detecção padrões, score decisão | Score saúde + anomalias + score decisão | 75% | Falta revisão mensal auto |
| M11 — Segurança | Auth, RLS, convites, permissões, logs | Auth + RLS + convites + permissões | 85% | Falta auditoria |

---

## O Que FOI Entregue (Ganhos)

### Funcionalidades Completas ✅

1. **Sistema de Auth completo** — Magic link, demo login, guard de rotas, roles admin/viewer
2. **Dashboard com gráficos** — Recharts AreaChart, métricas em tempo real, budget progress
3. **Upload de extratos** — Drag-and-drop, PDF/CSV/OFX, validação MIME, parser IA, dedup SHA-256
4. **Categorização inteligente** — Regras aprendidas + sugestão IA, edição em lote
5. **Orçamento mensal** — Limites por categoria, progresso visual, alertas de estouro
6. **Metas financeiras** — 6 tipos, contribuições, projeção de conclusão, compartilhamento
7. **Investimentos** — 8 tipos de ativos, dashboard alocação, simulador de aportes
8. **WhatsApp** — Webhook Z-API, comandos rápidos, config segura
9. **Inteligência Proativa** — Score de Saúde (gauge colorido), anomalias, Score de Decisão com parecer IA
10. **Config LLMs** — BYOK OpenRouter, seleção de modelo, key criptografada
11. **Agente IA** — Chat web, memória de longo prazo, personalidade configurável
12. **Design System** — Trívia editorial (Instrument Serif, Inter Tight, petrol/coral/paper)
13. **Isolamento RLS** — Cada família vê apenas seus dados, sem exceção
14. **15 migrations** — Schema completo com constraints, indexes e RLS
15. **17 Edge Functions** — Backend completo para todas as operações sensíveis

### Métricas de Qualidade

| Métrica | Valor |
|---------|-------|
| Rotas funcionais | 15 |
| Edge Functions | 17 |
| Migrations | 15 |
| Testes | 375 (95% passando) |
| Build | ✅ sem erros |
| Bundle (gzip) | ~410 KB total |
| TypeScript | strict mode |

---

## O Que NÃO Foi Entregue (Gaps)

### Gaps Críticos (bloqueiam valor central)

| Gap | Impacto | Dependência | Prioridade |
|-----|---------|-------------|------------|
| Tools do agente para módulos | Agente não consulta dados de metas/investimentos/orçamento | Implementação de tool functions | 🔴 Alta |
| pg_cron automações | Sem alertas proativos automáticos | Supabase Pro plan | 🔴 Alta |

### Gaps Moderados (reduzem experiência)

| Gap | Impacto | Dependência | Prioridade |
|-----|---------|-------------|------------|
| Áudio via Whisper | WhatsApp só texto | Decisão de provider | 🟡 Média |
| Monitor de custo LLM | Família não sabe quanto está gastando | API billing OpenRouter | 🟡 Média |
| Calendário financeiro | Sem visão de vencimentos futuros | Implementação frontend | 🟡 Média |
| Revisão Mensal Guiada | Agente não inicia sessão mensal | pg_cron + tools | 🟡 Média |
| Fallback de modelos | Se modelo falha, não tenta outro | Implementação backend | 🟡 Média |

### Gaps Planejados (Fase 3 — não são dívida)

| Gap | Status |
|-----|--------|
| Sincronização Notion | Fase 3 — by design |
| Export Obsidian | Fase 3 — by design |
| Open Finance | Fase 3 — by design |
| Modelos locais (Ollama) | Fase 3 — by design |
| Export IR | Fase 3 — by design |

---

## Análise de Valor

### Proposta de Valor Original
> "Transformar a gestão financeira familiar de planilha estática em conversa contínua com um consultor que conhece a família, lembra de tudo, e age proativamente."

### Aderência à Proposta

| Dimensão | Prometido | Entregue | Nota |
|----------|-----------|----------|------|
| Conversa contínua | ✅ | Chat web funcional com memória | 9/10 |
| Conhece a família | ✅ | Memória LP + perfil + onboarding | 8/10 |
| Lembra de tudo | ✅ | agent_memories persistido | 8/10 |
| Age proativamente | ⚠️ | Score + anomalias, mas sem automação | 5/10 |
| Centraliza tudo | ✅ | Extratos, orçamento, metas, investimentos | 9/10 |
| Multi-superfície | ⚠️ | Web ✅, WhatsApp parcial, Notion ❌ | 5/10 |

**Score geral de aderência: 7.3/10**

---

## Princípios de Design — Aderência

| Princípio | Status | Evidência |
|-----------|--------|-----------|
| Conversa antes de tela | ⚠️ Parcial | Chat existe, mas features foram construídas como UI primeiro |
| Memória estrutural | ✅ | agent_memories com tipos, confidence, embeddings |
| Tools como esqueleto | ⚠️ Parcial | Agent-chat existe, mas tools específicas pendentes |
| Família como unidade | ✅ | RLS + family_id + roles + convites |
| Proatividade calibrada | ⚠️ Parcial | Detecção existe, automação pendente |
| Tudo em português | ✅ | UI, mensagens, labels tudo pt-BR |

---

## Recomendações do PM

### Sprint 4 — Prioridade Máxima (próximas 2 semanas)

1. **Implementar tools do agente** — `get_budget_status`, `get_goals_status`, `get_portfolio_summary`, `get_expenses_by_category`, `register_expense`. Isso transforma o agente de chatbot em consultor funcional.

2. **Criação de metas via conversa** — O agente deve poder criar metas quando o usuário pede (hoje precisa ir na UI).

3. **Registro de gastos via conversa** — "Gastei 50 no Uber" → agente cria a transação.

### Sprint 5 — Melhoria de Experiência

4. **pg_cron** — Upgrade para Supabase Pro e ativar automações semanais/mensais.

5. **Calendário financeiro** — Vencimentos visíveis no dashboard.

6. **Fallback de modelos** — Se Claude falha, tentar GPT-4o.

### Decisões Pendentes

- [ ] Provider de transcrição de áudio (Whisper via OpenRouter ou dedicado?)
- [ ] Upgrade Supabase para Pro (custo vs. benefício do pg_cron)
- [ ] Prioridade: tools do agente vs. WhatsApp proativo

---

## Conclusão

O FamilyOS está em **estado de MVP funcional**. Todas as telas existem, dados persistem, isolamento funciona, e o agente conversa com memória. O gap mais importante é a integração profunda entre o agente e os dados — quando o agente puder realmente "consultar" orçamento, metas e investimentos via tools, o produto atinge sua proposta de valor central.

**Recomendação:** Focar as próximas 2 semanas exclusivamente em tools do agente. Isso é o que transforma o produto de "app financeiro com chatbot" em "consultor financeiro inteligente com interface visual".
