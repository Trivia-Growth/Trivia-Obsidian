# PedidoVendaHistorico

> Audit log imutável de status dos pedidos de venda. Cada troca de status gera uma linha nova.

## Fonte SQL Server

| Banco | Literarius |
|---|---|
| Tabela | `PedidoVendaHistorico` |
| Linhas | ~214.541 |
| PK | `idPedidoVendaHistorico` (bigint) |
| Incremental | `DataAlt >= @since` |

## Schema

| Coluna SQL | Tipo | Supabase | Descrição |
|---|---|---|---|
| `idPedidoVendaHistorico` | bigint | `id_literarius` PK | Chave natural do registro |
| `idPedidoVenda` | bigint | `id_pedido_venda` | FK → PedidoVenda |
| `Item` | int | `item` | Sequência do evento no pedido |
| `Status` | int | `status` | Código do status (ver tabela abaixo) |
| `UsuarioAlt` | varchar(20) | `usuario_alt` | Usuário que alterou |
| `DataAlt` | datetime | `data_alteracao` | Timestamp da troca de status |

## Supabase

- Schema: `lit_mirror_fiscal`
- Tabela: `pedidos_venda_historico`
- Job: `fiscal`
- Migração: `018_fase2_fiscal.sql`

## Códigos de Status Conhecidos

| Código | Significado |
|---|---|
| 1 | Aberto |
| 2 | Em separação |
| 3 | Separado |
| 4 | Faturado |
| 5 | Cancelado |

> ⚠️ Confirmar com equipe Literarius — pode haver outros.

## Uso no HeziomOS

Permite rastrear o ciclo de vida completo de pedidos: quanto tempo cada pedido ficou em separação, taxa de cancelamento, gargalos operacionais.

Relaciona-se com [[PedidoVenda]] (cabeçalho).
