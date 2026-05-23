# Story 023 — Clientes: Visualizações Lista/Card + Filtros

> ✅ **Concluída** — Deploy: 2026-05-08

## Objetivo
Aprimorar a tela de Clientes com múltiplos modos de visualização, ordenação, filtro e pesquisa.

## Funcionalidades

### Modos de Visualização
- **Cards** (atual) — grid de cards com info resumida
- **Lista/Tabela** — tabela com colunas ordenáveis

### Filtros e Pesquisa
- Pesquisa por nome, CNPJ, responsável
- Filtro por status (ativo/inativo)
- Filtro por regime tributário (se houver)
- Ordenação: nome A-Z, Z-A, mais recente, mais antigo

### Toggle de Visualização
- Botão ícone no header (grid/list) que persiste no localStorage

### Informações na Tabela
| Coluna | Tipo |
|--------|------|
| Nome | texto, link |
| CNPJ | texto |
| Responsável | texto |
| Lançamentos pendentes | badge numérico |
| Status | badge ativo/inativo |
| Criado em | data |

## Critérios de Aceite
- [x] Toggle card/lista funciona
- [x] Pesquisa filtra em tempo real
- [x] Ordenação por qualquer coluna na tabela
- [x] Filtro por status
- [x] Preferência de visualização persiste
- [x] Build sem erros TypeScript
