---
tags: [ceo, dashboard, kpi, financeiro]
status: especificação
criado: 2026-04-15
---

# Dashboard CEO

Visão unificada da saúde financeira da Heziom para tomada de decisão do CEO. Atualizado em tempo real (dados do Literarius lidos a cada 15 minutos). Acessível via web e resumo diário automático no Teams.

---

## Princípios de Design

1. **Uma tela, uma decisão** — cada painel responde a uma pergunta do CEO
2. **Semáforo de alertas** — verde/amarelo/vermelho imediatamente visível
3. **Sem cliques desnecessários** — os números mais importantes estão na primeira tela
4. **Drill-down quando necessário** — click em qualquer número abre o detalhe

---

## Layout Principal (4 Painéis)

```
┌────────────────────────────┬────────────────────────────┐
│  1. POSIÇÃO FINANCEIRA     │  2. DRE DO MÊS             │
│                            │                            │
│  Caixa total: R$ 3.95M ●  │  Receita:    R$  XXX.XXX   │
│                            │  CMV:        R$ -XXX.XXX   │
│  A receber (30d): R$XXX ● │  Lucro bruto: R$ XXX.XXX   │
│  A pagar (30d):   R$XXX ● │  Despesas:   R$ -XXX.XXX   │
│                            │                            │
│  Liquidez líq:    R$XXX   │  Superávit:  R$  XXX.XXX   │
│  Cobertura caixa: Xd      │  Margem:     XX.X%         │
│                            │                            │
│  Contas por banco:         │  vs. mês ant.: ▲/▼ X%     │
│  ■ Santander  R$3.401M    │  vs. meta:    ●  atingido  │
│  ■ CC Wallets R$0.523M    │                            │
│  ■ Stone      R$0.025M    │  [Ver DRE completo →]      │
├────────────────────────────┼────────────────────────────┤
│  3. FATURAMENTO POR CANAL  │  4. ALERTAS                │
│                            │                            │
│  ████ ECOMMERCE   39%      │  🔴 84% recebíveis vencidos│
│  ███  ATACADO     27%      │     R$2.0M há >30 dias    │
│  ██   LIVRARIA    20%      │                            │
│  █    MERCADO L   11%      │  🟡 5 pagamentos pendentes │
│  ·    Outros       3%      │     R$42.000 sem aprovação │
│                            │                            │
│  MTD: R$ XXX.XXX           │  🟡 3 NF-e sem fornecedor  │
│  vs. mês ant: ▲ X.X%      │     na fila Qive          │
│  Ticket médio: R$ XXX      │                            │
│                            │  ℹ Conciliação: 4 itens   │
│  [Ver faturamento →]       │     pendentes revisão      │
└────────────────────────────┴────────────────────────────┘
```

---

## Painel 1 — Posição Financeira

### O que responde
> "Qual é minha posição de caixa agora? Tenho dinheiro para pagar as contas?"

### KPIs

| KPI                        | Fonte                                                        | Atualização |
| -------------------------- | ------------------------------------------------------------ | ----------- |
| Saldo Santander            | `ContaBancaria` (conta principal)                            | 15 min      |
| Saldo total (todos contas) | `ContaBancaria` SUM                                          | 15 min      |
| A receber próximos 30 dias | `TituloFinanceiro` Pago=0, Vencimento ≤ +30d                 | 15 min      |
| A pagar próximos 30 dias   | `TituloFinanceiro` Pago=0, TipoTitulo='P', Vencimento ≤ +30d | 15 min      |
| Liquidez líquida           | A receber − A pagar (30 dias)                                | Calculado   |
| Cobertura de caixa         | Caixa total / (média despesas mensais / 30)                  | Calculado   |

### Semáforo

| Indicador | 🔴 Crítico | 🟡 Atenção | 🟢 OK |
|-----------|-----------|-----------|------|
| Caixa total | < R$500K | R$500K–R$1M | > R$1M |
| Liquidez líquida (30d) | Negativa | 0–R$200K | > R$200K |
| Cobertura caixa | < 30 dias | 30–60 dias | > 60 dias |

---

## Painel 2 — DRE do Mês

### O que responde
> "Estamos ganhando ou perdendo dinheiro este mês? Estamos no ritmo do ano passado?"

### Estrutura

```
DEMONSTRATIVO DE RESULTADO — [MÊS/ANO]

Receita Bruta (Faturamento)        R$ XXX.XXX   100%
(-) CMV                           (R$ XXX.XXX)  -XX%
= Lucro Bruto                      R$ XXX.XXX    XX%

(-) Despesas Variáveis             (R$ XXX.XXX)  -XX%
   Frete e Logística
   Comissões Marketplace
   Gateway / Taxas de Cartão

= Margem de Contribuição           R$ XXX.XXX    XX%

(-) Despesas Fixas                 (R$ XXX.XXX)  -XX%
   Pessoal (CLT + autônomos)
   Marketing e Publicidade
   Sistemas e Tecnologia
   Aluguel e Infraestrutura
   Serviços Profissionais (jurídico, contábil)

= SUPERÁVIT LÍQUIDO                R$ XXX.XXX    XX%
```

**Nota:** DRE automático requer correção do `PlanoConta.TipoCategoria` no Literarius (atualmente 'A' em todas as contas — bloqueador). Enquanto não corrigido, DRE é calculado por agrupamento de contas pelo nome.

### Comparativos
- vs. mês anterior
- vs. mesmo mês do ano passado (referência 2025)
- vs. meta mensal (configurável no HeziomOS)

---

## Painel 3 — Faturamento por Canal

### O que responde
> "Qual canal está crescendo? Onde estou dependente demais?"

### Gráfico: Barras horizontais com % e valor

Canais (ordem por volume 2025):
1. ECOMMERCE / SITE (Tray) — 39%
2. ATACADO — 27%
3. LIVRARIA — 20%
4. MERCADO LIVRE — 11%
5. AMAZON + outros — 3%

### Métricas adicionais
- Ticket médio por canal (valor pedido / qtde pedidos)
- Crescimento MTD vs. mesmo mês 2025
- Receita líquida por canal (bruto − comissão marketplace)

---

## Painel 4 — Alertas Críticos

### O que responde
> "O que precisa da minha atenção agora?"

### Hierarquia de alertas

| Cor | Critério | Exemplo |
|-----|---------|---------|
| 🔴 Crítico | Requer ação hoje | Pagamento vencido, caixa abaixo do mínimo |
| 🟡 Atenção | Requer ação em 48h | Aprovação pendente, NF-e sem fornecedor |
| ℹ Info | Monitorar | Conciliação pendente, repasse atrasado |

### Fontes dos alertas
- [[Alertas e Notificações]] — engine de alertas centralizada
- Recebíveis vencidos: `TituloFinanceiro` Pago=0, Vencimento < HOJE
- Aprovações pendentes: HeziomOS `payment_approvals` status='pendente'
- NF-e fila: HeziomOS `nfe_queue` status='sem_fornecedor'
- Conciliação: HeziomOS `bank_reconciliations` pendentes

---

## Briefing Diário (Teams — 7h)

Mensagem automática enviada todo dia útil às 7h via Teams webhook:

```
📊 Heziom — Briefing Financeiro | 15 abr 2026 (quarta)

💰 CAIXA: R$ 3.948.320
   Santander: R$ 3.401.000 | CC: R$ 523.000 | Stone: R$ 25.000

📈 FATURAMENTO MTD (1–15/abr):
   R$ 289.450 | vs. abr/2025: ▲ 12,3%

📋 CONTAS:
   A receber (7d): R$ 142.300
   A pagar (7d):   R$ 87.200
   Liquidez líq:   R$ 55.100 ✅

⚠ ALERTAS:
   🔴 R$ 2.0M em recebíveis vencidos >30d (ação necessária)
   🟡 5 pagamentos aguardando aprovação → HeziomOS
   ℹ  Conciliação bancária: 4 itens manuais pendentes

→ Dashboard completo: [link HeziomOS]
```

---

## Acesso

| Papel | Acesso |
|-------|--------|
| CEO | Todos os painéis + aprovação de pagamentos |
| Coord. Financeiro | Todos os painéis operacionais (sem threshold CEO) |
| Analista | Painéis de leitura (sem aprovação) |

---

## Módulos Relacionados

- [[KPIs e Métricas]] — definições formais de cada indicador
- [[DRE e Fluxo de Caixa]] — fonte do painel DRE
- [[Contas a Receber]] — fonte do painel posição financeira
- [[Contas a Pagar]] — fonte do painel posição financeira
- [[Pedidos e Vendas]] — fonte do painel faturamento por canal
- [[Alertas e Notificações]] — engine de alertas do painel 4
- [[HeziomOS — Arquitetura]] — visão geral do sistema
