# NotaFiscalEventos

> Eventos SEFAZ registrados para cada NF-e: autorizações, cancelamentos, cartas de correção (CC-e), inutilizações.

## Fonte SQL Server

| Banco | Literarius |
|---|---|
| Tabela | `NotaFiscalEventos` |
| Linhas | ~36.259 |
| PK | `idNotaFiscalEventos` (bigint) |
| Incremental | `DataRegistroEvento >= @since OR DataEvento >= @since` |

## Schema

| Coluna SQL | Tipo | Supabase | Descrição |
|---|---|---|---|
| `idNotaFiscalEventos` | bigint | `id_literarius` PK | Chave natural do registro |
| `idNotaFiscal` | bigint | `id_nota_fiscal` | FK → NotaFiscal |
| `Item` | int | `item` | Sequência do evento |
| `TipoEvento` | int | `tipo_evento` | Código SEFAZ do tipo de evento |
| `DescricaoTipoEvento` | varchar(50) | `descricao_tipo_evento` | Descrição legível |
| `SequenciaEvento` | int | `sequencia_evento` | Para múltiplos eventos do mesmo tipo |
| `DataEvento` | datetime | `data_evento` | Timestamp do evento no SEFAZ |
| `DataRegistroEvento` | datetime | `data_registro_evento` | Timestamp do registro local |
| `ProtocoloEvento` | varchar(50) | `protocolo_evento` | Número de protocolo SEFAZ |
| `TextoEvento` | text | `texto_evento` | XML ou texto do evento |

## Supabase

- Schema: `lit_mirror_fiscal`
- Tabela: `notas_fiscais_eventos`
- Job: `fiscal`
- Migração: `018_fase2_fiscal.sql`

## Tipos de Evento SEFAZ Comuns

| Código | Descrição |
|---|---|
| 110111 | Cancelamento |
| 110110 | Carta de Correção |
| 110140 | EPEC |
| 110150 | Inutilização |

## Uso no HeziomOS

Rastreamento de conformidade fiscal: quais NFs foram canceladas, quantas precisaram de CC-e, integração com timeline de entrega via [[LogisticaEtiqueta]].

Relaciona-se com [[NotaFiscal]] (cabeçalho).
