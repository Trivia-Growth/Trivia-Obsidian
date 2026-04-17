---
id: STORY-004
titulo: "Dashboard CEO — Painel Posição Financeira"
fase: 1
modulo: dashboard-ceo
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-04-16
---

# STORY-004 — Dashboard CEO: Painel Posição Financeira

## Contexto
Primeiro painel visível do CEO ao abrir o HeziomOS. Responde à pergunta: "como estou financeiramente agora?" — caixa disponível, o que entra nos próximos 30 dias, o que sai, e a liquidez líquida resultante. É o painel de maior valor imediato da Fase 1.

## Spec de Referência
- [[Dashboard CEO]] — layout dos 4 painéis, KPIs do painel 1
- [[KPIs e Métricas]] — definições formais: saldo total, cobertura de caixa, liquidez líquida
- [[Contas a Receber]] — títulos a receber
- [[Contas a Pagar]] — títulos a pagar

## Critérios de Aceite
- [ ] CA1 — Card "Caixa Total" exibe soma dos saldos de `contas_bancarias` com atualização do último sync
- [ ] CA2 — Card "A Receber (30d)" exibe soma de `titulos_financeiros` WHERE `TipoTitulo='R'` AND `Pago=0` AND `Vencimento <= hoje+30`
- [ ] CA3 — Card "A Pagar (30d)" exibe soma de `titulos_financeiros` WHERE `TipoTitulo='P'` AND `Pago=0` AND `Vencimento <= hoje+30`
- [ ] CA4 — Card "Liquidez Líquida" exibe Caixa + A Receber − A Pagar
- [ ] CA5 — Indicador visual de status: verde (>R$500K), amarelo (R$200K–R$500K), vermelho (<R$200K)
- [ ] CA6 — Timestamp "Atualizado em HH:MM" visível em cada card
- [ ] CA7 — Painel responsivo, legível em tela de notebook e monitor
- [ ] CA8 — Dados lidos do Supabase (não diretamente do Literarius)

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
- Depende de STORY-001 (infra) e STORY-002 (sync de títulos e contas)
- Threshold de alerta (<R$500K) está em aberto — usar R$500K como padrão até CEO confirmar
- Referência: saldo Santander + carteiras CC + Stone conforme especificado no Dashboard CEO
