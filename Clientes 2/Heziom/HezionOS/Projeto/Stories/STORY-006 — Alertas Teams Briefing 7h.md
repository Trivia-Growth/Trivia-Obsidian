---
id: STORY-006
titulo: "Alertas Teams — Briefing Diário CEO (7h)"
fase: 1
modulo: alertas
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-04-16
---

# STORY-006 — Alertas Teams: Briefing Diário CEO (7h)

## Contexto
Todo dia útil às 7h, o CEO recebe no canal `#ceo-briefing` do Teams um resumo financeiro do dia: posição de caixa, faturamento do mês, contas dos próximos 7 dias e alertas ativos. É o primeiro entregável de automação — o CEO começa a ver o valor do sistema antes mesmo de abrir o dashboard.

## Spec de Referência
- [[Alertas e Notificações]] — evento C1 (briefing diário), template de mensagem, Adaptive Card
- [[Dashboard CEO]] — seção Briefing Diário, conteúdo do card
- [[KPIs e Métricas]] — KPIs incluídos no briefing

## Critérios de Aceite
- [ ] CA1 — Supabase Scheduled Function dispara todo dia útil às 7h (horário de Brasília)
- [ ] CA2 — Card Teams enviado para webhook do canal `#ceo-briefing` com formato Adaptive Card
- [ ] CA3 — Card contém: Caixa Total, A Receber 7d, A Pagar 7d, Faturamento MTD, Alertas ativos (contagem)
- [ ] CA4 — Anti-spam: se já foi enviado hoje, não reenvia (verificar `alert_config.ultimo_disparo`)
- [ ] CA5 — Sábado e domingo: não envia
- [ ] CA6 — Webhook URL configurável via variável de ambiente Supabase (não hardcoded)
- [ ] CA7 — Falha no envio: log de erro no Supabase, não quebra silenciosamente
- [ ] CA8 — Template testável manualmente via endpoint `POST /functions/v1/briefing-ceo?force=true`

---

## Implementação
> ⚠️ Preenchido pelo @dev após concluir. Não editar manualmente.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA
> ⚠️ Preenchido pelo @qa. Não editar manualmente.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem regressões em outras features
- [ ] Segurança verificada (dados financeiros, RLS Supabase)
- [ ] Performance aceitável (<2s para queries principais)

**Notas QA:**

---

## Notas e Decisões
- Supabase Scheduled Functions (pg_cron) rodam em UTC — 7h Brasília = 10h UTC (ou 11h no horário de verão)
- Adaptive Card v1.4 conforme especificado em [[Alertas e Notificações]]
- Depende de STORY-002 (dados de títulos) e STORY-003 (dados de faturamento)
- Webhook URL do Teams a ser configurado pela Heziom
