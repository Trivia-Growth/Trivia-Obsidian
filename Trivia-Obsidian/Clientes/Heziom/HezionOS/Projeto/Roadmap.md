---
tags: [projeto, roadmap, fases]
---

# Roadmap — HeziomOS

Três fases progressivas de valor. Cada fase entrega algo utilizável antes de avançar para a próxima.

---

## Fase 1 — Visibilidade (atual)

**Objetivo:** Liderança enxerga os dados financeiros e identifica gaps operacionais.
**Postura do sistema:** Read-only. Humano interpreta, nada é automatizado ainda.
**Critério de saída:** CEO consegue responder "como estou hoje?" sem abrir o Literarius.

### Milestones

- [ ] **M1.1** — Infraestrutura pronta (Supabase + repo + Netlify + obsidian-git)
- [ ] **M1.2** — Sync Literarius → Supabase funcionando (títulos, contas, NFs, pedidos)
- [ ] **M1.3** — Dashboard CEO no ar com Posição Financeira e DRE MTD
- [ ] **M1.4** — Briefing diário automático no Teams às 7h

### Stories da Fase 1

| Story | Módulo | Status | Prioridade |
|-------|--------|--------|------------|
| [[STORY-001 — Setup Infraestrutura]] | Infra | pronto | alta |
| [[STORY-002 — Deno Sync TituloFinanceiro e ContaBancaria]] | Sync | backlog | alta |
| [[STORY-003 — Deno Sync NotaFiscal e PedidoVenda]] | Sync | backlog | alta |
| [[STORY-004 — Dashboard CEO Posição Financeira]] | Dashboard | backlog | alta |
| [[STORY-005 — Dashboard CEO DRE MTD]] | Dashboard | backlog | média |
| [[STORY-006 — Alertas Teams Briefing 7h]] | Alertas | backlog | média |

---

## Fase 2 — Inteligência Assistida

**Objetivo:** O sistema sugere ações; a equipe valida e aprova.
**Postura:** IA identifica, humano decide.
**Critério de saída:** 80% das sugestões do sistema são aceitas sem modificação.

### Módulos previstos

- Aprovação de Pagamentos (workflow de alçadas) — [[Aprovação de Pagamentos]]
- Conciliação Bancária automática (OFX × TituloFinanceiroBaixa) — [[Conciliação Bancária]]
- Alertas inteligentes (inadimplência, caixa crítico, repasse Tray) — [[Alertas e Notificações]]
- Faturamento por canal com receita líquida — [[Comissões e Repasses]]

*(Stories da Fase 2 serão criadas ao final da Fase 1)*

---

## Fase 3 — Autonomia

**Objetivo:** Processos recorrentes rodam sozinhos; humano monitora e excepciona.
**Postura:** IA age, humano monitora.
**Critério de saída:** Time financeiro reduz tempo operacional em >50%.

### Módulos previstos

- Geração e envio automático de CNAB 240
- Conciliação bancária com >95% de automação
- Gestão de estoque e CMV em tempo real
- Integração Mercado Livre e Amazon

*(Escopo detalhado da Fase 3 será definido durante a Fase 2)*

---

## Questões Abertas (bloqueadores potenciais)

1. **Threshold de alçada CEO:** R$ acima do qual CEO precisa aprovar pagamentos
2. **Prazo de repasse Tray:** D+? dias (define alerta de atraso)
3. **OFX Santander:** confirmar disponibilidade no internet banking
4. **PlanoConta.TipoCategoria:** equipe Literarius precisa corrigir ('A' em todos os 115 registros) para DRE real funcionar
5. **Views Literarius:** 6 views a solicitar para equipe Literarius (ver [[Views — Camada de Acesso HeziomOS]])
6. **Máquina Deno sync:** qual servidor/PC na rede da Heziom rodará o script de sincronização
