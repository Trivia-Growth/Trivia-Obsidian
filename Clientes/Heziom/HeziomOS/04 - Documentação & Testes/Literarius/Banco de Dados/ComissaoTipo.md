# ComissaoTipo

> Tabela de enum com os tipos de comissão disponíveis no Literarius. 3 linhas. Sem DataAlt — full sync a cada execução.

## Fonte SQL Server

| Banco | Literarius |
|---|---|
| Tabela | `ComissaoTipo` |
| Linhas | 3 |
| PK | `Codigo` (int) |
| Incremental | Full sync (sem DataAlt) |

## Schema

| Coluna SQL | Tipo | Supabase | Descrição |
|---|---|---|---|
| `Codigo` | int | `id_literarius` PK | Código do tipo |
| `Descricao` | varchar(50) | `descricao` | Descrição do tipo |
| `Tabela` | varchar(50) | `tabela` | Tabela de referência para a comissão |
| `CodigoEspecifico` | varchar(50) | `codigo_especifico` | Código da tabela referenciada |

## Supabase

- Schema: `lit_mirror_cadastro`
- Tabela: `comissoes_tipos`
- Job: `cadastro`
- Migração: `017_fase2_cadastro.sql`

## Uso no HeziomOS

Lookup para exibição das comissões de vendedores e representantes. Complementa `ComissaoParametro` que define os percentuais.

Relaciona-se com [[ComissaoParametro]].
