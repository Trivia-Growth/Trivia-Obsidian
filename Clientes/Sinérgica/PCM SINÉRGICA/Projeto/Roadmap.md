# Roadmap — PCM Sinérgica

---

## Fase 1 — Operação completa em produção *(atual)*

**Objetivo:** ciclo de manutenção predial ponta a ponta no sistema — da proposta ao relatório — com o Agente Zé atendendo os condomínios no WhatsApp.

**Postura:** Operacional (o sistema executa e integra com Auvo/WhatsApp).

**Módulos (todos já implementados):**
- [x] Clientes
- [x] Backlog (score GUT)
- [x] Cronograma / Visitas
- [x] Ordens de Serviço (Auvo bidirecional)
- [x] Inspeções (IA + import PDF/XLS)
- [x] Preventivo
- [x] Relatórios diário e mensal
- [x] Propostas (IA + DOCX)
- [x] Laudos SPDA
- [x] Agente Zé (WhatsApp)

**Status:** `em andamento` (estabilização e correção de débitos — ver `SECURITY_DEBT.md`)

---

## Fase 2 — Endurecimento e portal do cliente *(futura)*

**Objetivo:** fechar os débitos de segurança e dar visibilidade ao cliente.

**Itens planejados:** corrigir IDOR (SEC-001), `FORCE RLS` (SEC-002), validação de input/CORS; dashboard inicial; eventual portal/app do síndico. *(Stories criadas ao estabilizar a Fase 1)*

**Status:** `planejada`

---

## Fase 3 — Financeiro e indicadores *(futura)*

**Objetivo:** faturamento de contrato/serviços e indicadores gerenciais (SLA, multi-cliente).

**Status:** `planejada`

---

## Milestones

| Marco | Data | Status |
|-------|------|--------|
| Agente Zé funcionando em produção | 2026-06-17 | ✅ concluído |
| Projeto no Padrão Trívia (TRIVIAIOX + docs) | 2026-06-18 | ✅ concluído |
| Débitos de segurança P0/P1 resolvidos | (a definir) | pendente |

---

## Decisões e Histórico

- `2026-06-17` — Correção do Agente Zé (instância `ze-pcm-v2`, header do webhook) + otimização de latência (40-60s → ~7-9s) + resync das edge functions com produção.
- `2026-06-18` — Migração do projeto para o Padrão Trívia (instalação do TRIVIAIOX, docs de repo, vault e STORY-001). Mapeamento completo de status feito pelos agentes.
