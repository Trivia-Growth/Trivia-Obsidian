---
status: backlog
tipo: feature
sprint: 4
prioridade: media
---

# STORY-015 — Dashboard Financeiro Cliente

## Descricao

Dashboard visual e informativo para o cliente acompanhar suas financas. Foco em clareza, nao em complexidade. O cliente precisa responder rapido: "quanto entrou?", "quanto saiu?", "como estou este mes vs o anterior?"

## Criterios de Aceite

### Resumo do Mes
- [ ] Cards: Total Receitas, Total Despesas, Saldo do Mes
- [ ] Saldo colorido: verde (positivo) / vermelho (negativo)
- [ ] Navegacao entre meses (< Abril 2026 >)
- [ ] Comparativo com mes anterior (ex: "+12% vs abril" ou "-8% vs abril")

### Saldo por Conta
- [ ] Lista de contas com saldo atual de cada uma
- [ ] Total consolidado
- [ ] Indicador visual se conta esta negativa

### Fluxo de Caixa (Grafico)
- [ ] Grafico de barras ou linhas: entradas vs saidas por dia ou semana
- [ ] Periodo: mes atual
- [ ] Simples e legivel (sem excesso de dados)

### Top Categorias
- [ ] Top 5 maiores despesas do mes (categoria + valor + %)
- [ ] Top 5 maiores receitas do mes
- [ ] Barra de progresso proporcional

### Lancamentos Pendentes / Alertas
- [ ] Contador de lancamentos pendentes de revisao
- [ ] Alerta se ha lancamentos rejeitados (com link pra corrigir)
- [ ] Ultimo lancamento registrado (data)

### Acoes Rapidas
- [ ] Botao "+ Novo Lancamento"
- [ ] Botao "Importar Planilha"
- [ ] Botao "Ver Extrato"

## UI

```
┌─────────────────────────────────────────────────────────────┐
│ Financeiro               < Maio 2026 >                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Receitas │  │ Despesas │  │  Saldo   │                 │
│  │ R$45.000 │  │ R$38.000 │  │ +R$7.000 │                 │
│  │ +12% ↑   │  │ -3% ↓    │  │          │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
├─────────────────────────────────────────────────────────────┤
│ Saldo por Conta                                             │
│  Bradesco 5632-4 .............. R$ 42.300,00               │
│  Caixa Fisico ................. R$  1.200,00               │
│  TOTAL ........................ R$ 43.500,00               │
├─────────────────────────────────────────────────────────────┤
│ Maiores Despesas                │ Maiores Receitas          │
│ ████████ Servicos  R$22k (58%) │ ████████ Ofertas R$40k    │
│ ████   Material    R$8k (21%)  │ ███    Rendim.  R$5k      │
│ ██     Bancarias   R$3k (8%)   │                           │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ 3 lancamentos rejeitados precisam de correcao  [Corrigir]│
│ ⏳ 45 lancamentos aguardando revisao do contador            │
├─────────────────────────────────────────────────────────────┤
│ [+ Lancamento]  [Importar Planilha]  [Ver Extrato]         │
└─────────────────────────────────────────────────────────────┘
```

## API

```typescript
// Novas funcoes necessarias
getAccountBalances(clientId) → { account_id, banco, descricao, saldo }[]
getTopCategories(clientId, month, year, tipo) → { categoria, item, total, percent }[]
getMonthComparison(clientId, month, year) → { entradas_atual, entradas_anterior, saidas_atual, saidas_anterior }
```

## Notas

- Nenhuma informacao contabil (debito/credito/conta Contmatic) aparece aqui
- O dashboard substitui o DashboardPage atual para role='cliente'
- Graficos podem usar Recharts (leve) ou apenas barras CSS (mais simples)
- Mobile-first: cards empilham em coluna no celular
