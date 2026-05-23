# Story 024 — Componente DataTable Global

> ✅ **Concluída** — Deploy: 2026-05-08

## Objetivo
Criar um componente `DataTable` reutilizável que toda tabela do sistema possa usar, com ordenação, filtro, pesquisa e paginação built-in.

## API do Componente

```tsx
<DataTable
  data={items}
  columns={[
    { key: 'nome', label: 'Nome', sortable: true, searchable: true },
    { key: 'valor', label: 'Valor', sortable: true, type: 'currency' },
    { key: 'status', label: 'Status', filterable: true, options: ['ativo', 'inativo'] },
    { key: 'data', label: 'Data', sortable: true, type: 'date' },
  ]}
  searchPlaceholder="Buscar..."
  pageSize={25}
  emptyMessage="Nenhum item encontrado"
  onRowClick={(item) => ...}
  actions={(item) => <button>...</button>}
/>
```

## Features
1. **Pesquisa global** — input que busca em todas as colunas `searchable`
2. **Ordenação** — click no header alterna asc/desc, indicador visual
3. **Filtros por coluna** — dropdown para colunas `filterable` com opções
4. **Paginação** — navegação por páginas com tamanho configurável
5. **Formatação automática** — currency (R$), date (dd/mm/yyyy), badge
6. **Responsivo** — scroll horizontal em telas pequenas
7. **Estado vazio** — mensagem customizável
8. **Contagem** — "Mostrando X de Y resultados"

## Tipos de Coluna
| Tipo | Renderização |
|------|-------------|
| `text` | Texto simples (default) |
| `currency` | R$ formatado com cor verde/vermelho |
| `date` | dd/mm/yyyy |
| `badge` | Chip colorido por valor |
| `custom` | render function |

## Integração
Substituir tabelas manuais em:
- Lançamentos (TransactionsPage)
- Extrato (ExtratoPage)
- Categorias (CategoriesPage)
- Centros de Custo (CostCentersPage)
- Plano de Contas (ChartOfAccountsPage)
- Clientes (ClientsPage)
- Usuários (UsersPage)
- Revisão (ReviewPage)

## Critérios de Aceite
- [x] Componente genérico funciona standalone
- [x] Pesquisa global filtra corretamente
- [x] Ordenação asc/desc com indicador visual
- [x] Filtros dropdown por coluna
- [x] Paginação com navegação
- [x] Formatação automática por tipo
- [x] Pelo menos 3 páginas migradas para usar DataTable
- [x] Build sem erros TypeScript
