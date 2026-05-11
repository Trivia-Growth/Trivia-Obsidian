---
status: pronto
tipo: feature
sprint: 3
prioridade: media
concluido: 2026-05-07
---

# STORY-009 — Dashboard do Cliente

## Descricao

Interface para o cliente acompanhar seus lancamentos, ver status de revisao, e ter visibilidade sobre o fluxo financeiro. O cliente nao precisa entender contabilidade — a interface mostra linguagem financeira simples.

## Criterios de Aceite

- [ ] Pagina inicial do cliente apos login
- [ ] Resumo do mes atual: total entradas, total saidas, saldo
- [ ] Contador de lancamentos por status (pendente, revisado, exportado, rejeitado)
- [ ] Indicador visual: lancamentos rejeitados com observacao do contador
- [ ] Lista dos ultimos 10 lancamentos com status
- [ ] Filtro por periodo (mes/ano)
- [ ] Evolucao mensal (grafico simples: entradas vs saidas)
- [ ] Notificacao visual de lancamentos rejeitados (badge/alert)
- [ ] Botao rapido para "Novo Lancamento" e "Importar Planilha"
- [ ] Responsivo (clientes podem acessar do celular)

## Interface

### Visao Principal

```
┌──────────────────────────────────────────────┐
│ Maio 2026                          [< >] mes │
├──────────────────────────────────────────────┤
│                                              │
│  Entradas        Saidas         Saldo        │
│  R$ 45.200       R$ 31.800     R$ 13.400     │
│                                              │
├──────────────────────────────────────────────┤
│ Status dos seus lancamentos                  │
│ ● 12 pendentes  ● 45 revisados  ● 380 exp.  │
│ ⚠ 2 rejeitados (ver detalhes)               │
├──────────────────────────────────────────────┤
│ Ultimos lancamentos                          │
│ 07/05 | Oferta Expansao | +R$ 150   | ✓     │
│ 06/05 | Material TENDA  | -R$ 3.200 | ⏳    │
│ 05/05 | Tarifa PIX      | -R$ 1,50  | ✓     │
│ ...                                          │
├──────────────────────────────────────────────┤
│ [+ Novo Lancamento]  [📎 Importar Planilha]  │
└──────────────────────────────────────────────┘
```

### Lancamentos Rejeitados

```
┌──────────────────────────────────────────────┐
│ ⚠ Lancamento rejeitado pelo contador         │
│ 03/05 | FULANO | R$ 500                      │
│ Motivo: "Categoria nao identificada.         │
│ Qual o tipo de servico prestado?"            │
│ [Corrigir e Reenviar]                        │
└──────────────────────────────────────────────┘
```

## Notas Tecnicas

- Todas as queries filtradas por client_id via RLS (cliente so ve seus dados)
- Usar agregacoes server-side (Edge Function ou view materializada) para resumos
- Evolucao mensal: query agrupada por mes nos ultimos 6 meses
- Status `rejeitado` inclui campo `observacao_rejeicao` na tabela transactions
- O cliente pode corrigir um lancamento rejeitado (volta para `pendente`)
- Grafico simples: pode ser feito com CSS puro ou lib leve (sem chart.js pesado)
- Mobile-first: maioria dos clientes (igrejas/ONGs) acessa pelo celular
