---
id: STORY-013
titulo: "Extrato e Filtros"
fase: 1
modulo: extrato
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-013 — Extrato e Filtros

## Descricao

O cliente precisa ver um extrato completo de suas movimentacoes com filtros poderosos. Deve funcionar como extrato bancario: listagem cronologica com saldo acumulado, filtros por conta, periodo, categoria e tipo.

## Criterios de Aceite

### Extrato
- [ ] Visao padrao: mes atual, todas contas
- [ ] Listagem cronologica (mais recente primeiro)
- [ ] Colunas: Data, Descricao (fornecedor ou item), Entrada, Saida, Saldo Acumulado
- [ ] Saldo acumulado calculado linha a linha
- [ ] Totalizado no final: Total Entradas, Total Saidas, Saldo Periodo
- [ ] Paginacao real (20 por pagina com "Carregar mais" ou paginas)
- [ ] Exibir badge de status em cada linha (pendente, revisado, exportado, rejeitado)

### Filtros
- [ ] Periodo: data inicio / data fim (datepicker)
- [ ] Conta bancaria (dropdown multi-select ou all)
- [ ] Tipo: Todos / Receitas / Despesas
- [ ] Categoria (dropdown com categorias do cliente)
- [ ] Fornecedor (campo texto com autocomplete baseado em lancamentos anteriores)
- [ ] Status: Todos / Pendente / Revisado / Exportado / Rejeitado
- [ ] Valor minimo / maximo
- [ ] Botao "Limpar filtros"
- [ ] Filtros persistem na URL (query params) para compartilhar/voltar

### Busca
- [ ] Campo de busca textual (pesquisa em fornecedor, observacao, documento)
- [ ] Busca funciona combinada com filtros

### Exportar Extrato
- [ ] Botao "Exportar CSV" com os filtros aplicados
- [ ] CSV em portugues com cabecalhos legíveis

## UI

```
┌─────────────────────────────────────────────────────────────┐
│ Extrato Financeiro                                          │
├─────────────────────────────────────────────────────────────┤
│ Periodo: [01/05/2026] a [31/05/2026]  Conta: [▼ Todas]     │
│ Tipo: [▼ Todos]  Categoria: [▼ Todas]  [🔍 Buscar...]      │
│                                          [Limpar] [CSV ↓]  │
├─────────────────────────────────────────────────────────────┤
│ Data   │ Descricao              │ Entrada  │ Saida    │Saldo│
├────────┼────────────────────────┼──────────┼──────────┼─────┤
│ 08/05  │ Oferta - Maria Silva   │ 100,00   │          │45.3k│
│ 08/05  │ CPFL Energia           │          │ 450,00   │45.2k│
│ 07/05  │ Tarifa PIX             │          │ 9,00     │45.6k│
│ 07/05  │ Material - HNL Concr.  │          │ 8.415,00 │45.6k│
├────────┼────────────────────────┼──────────┼──────────┼─────┤
│ TOTAL  │                        │12.450,00 │28.900,00 │     │
│ SALDO PERIODO: -R$ 16.450,00                                │
├─────────────────────────────────────────────────────────────┤
│ Mostrando 20 de 156       [← Anterior] [Proxima →]         │
└─────────────────────────────────────────────────────────────┘
```

## API

```typescript
interface ExtractFilters {
  client_id: string
  data_inicio?: string     // YYYY-MM-DD
  data_fim?: string
  bank_account_id?: string
  tipo?: 'entrada' | 'saida'
  categoria_id?: string
  fornecedor?: string      // ILIKE %term%
  status?: string
  valor_min?: number
  valor_max?: number
  search?: string          // busca textual
  page?: number
  per_page?: number        // default 20
}

interface ExtractResponse {
  transactions: Transaction[]
  totals: { entradas: number, saidas: number, saldo: number }
  pagination: { page: number, per_page: number, total: number }
}
```

## Notas

- Saldo acumulado precisa considerar TODOS lancamentos ate aquela data (nao so os da pagina)
- Performance: usar query com window function ou calcular no frontend com saldo inicial
- Autocomplete de fornecedor: query DISTINCT fornecedor WHERE client_id = X
- A rota pode ser /extrato (separada de /lancamentos) ou integrada — decidir na implementacao
- RLS garante que o cliente so ve seus proprios dados
