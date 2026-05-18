---
id: STORY-005
titulo: "Dashboard CEO — Painel DRE Mês Atual (MTD)"
fase: 1
modulo: dashboard-ceo
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-04-16
---

# STORY-005 — Dashboard CEO: Painel DRE MTD

## Contexto
Segundo painel do CEO. Mostra o resultado do mês corrente: receita bruta, CMV estimado, e superávit projetado. Como a Heziom é entidade sem fins lucrativos, o termo correto é "Superávit" (não Lucro). O DRE completo está bloqueado por PlanoConta.TipoCategoria='A' em todos os registros do Literarius — este painel usa a receita calculável e CMV estimado a partir de dados disponíveis.

## Spec de Referência
- [[Dashboard CEO]] — layout painel 2 (DRE MTD)
- [[DRE e Fluxo de Caixa]] — estrutura do DRE
- [[KPIs e Métricas]] — faturamento bruto, CMV%, superávit
- [[DRE Acumulado 2025-2026]] — referência de valores reais para validação

## Critérios de Aceite
- [ ] CA1 — "Receita Bruta MTD": `SUM(notas_fiscais.TotalNota)` WHERE `DataEmissao` no mês corrente AND `EntSai='S'` AND `Cancelada=0` AND `GeraFinanceiro=1`
- [ ] CA2 — "CMV Estimado MTD": Receita Bruta × 40% (percentual histórico 2025 até PlanoConta ser corrigido no Literarius)
- [ ] CA3 — "Superávit Estimado MTD": Receita − CMV − Despesas Fixas médias (usar média mensal 2025 como placeholder)
- [ ] CA4 — Comparativo vs. mês anterior: seta para cima/baixo + percentual de variação
- [ ] CA5 — Nota de rodapé: "CMV e Superávit estimados — aguardando correção de PlanoConta no Literarius"
- [ ] CA6 — Dados lidos do Supabase (`notas_fiscais`)

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
- DRE real está bloqueado: PlanoConta.TipoCategoria='A' em todos os 115 registros — depende da equipe Literarius corrigir
- CMV 40% é a referência de 2025 — adequado como estimativa até a correção
- Depende de STORY-003 (sync NotaFiscal)
- Referência de validação: Receita 2025 = R$6.619.840, Superávit = R$821.614 (12,4%)
