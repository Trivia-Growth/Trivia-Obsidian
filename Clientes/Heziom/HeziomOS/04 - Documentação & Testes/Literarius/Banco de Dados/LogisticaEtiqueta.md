# LogisticaEtiqueta

> Etiquetas de envio geradas pelo Literarius para cada volume de nota fiscal. Armazena dados de postagem (Correios, transportadora) e rastreamento.

## Fonte SQL Server

| Banco | Literarius |
|---|---|
| Tabela | `LogisticaEtiqueta` |
| Linhas | ~6.110 |
| PK | `idLogisticaEtiqueta` (bigint) |
| Incremental | `DataAlt >= @since` |

## Schema

| Coluna SQL | Tipo | Supabase | Descrição |
|---|---|---|---|
| `idLogisticaEtiqueta` | bigint | `id_literarius` PK | Chave natural |
| `idNotaFiscalVolume` | bigint | `id_nota_fiscal_volume` | FK → NotaFiscalVolume |
| `Empresa` | int | `empresa` | Código da empresa |
| `DataGeracao` | datetime | `data_geracao` | Data de geração da etiqueta |
| `Etiqueta` | varchar(50) | `etiqueta` | Código da etiqueta |
| `PesoPostagem` | int | `peso_postagem` | Peso em gramas |
| `Volume` | varchar(50) | `volume` | Identificação do volume |
| `EmbalagemDescricao` | varchar(50) | `embalagem_descricao` | Tipo de embalagem |
| `EmbalagemFormato` | char(1) | `embalagem_formato` | `1`=caixa, `2`=rolo, `3`=envelope |
| `EmbalagemPeso` | int | `embalagem_peso` | Peso da embalagem em gramas |
| `EmbalagemComprimento` | numeric(12,1) | `embalagem_comprimento` | cm |
| `EmbalagemLargura` | numeric(12,1) | `embalagem_largura` | cm |
| `EmbalagemAltura` | numeric(12,1) | `embalagem_altura` | cm |
| `EmbalagemDiametro` | numeric(12,1) | `embalagem_diametro` | cm (para rolos) |
| `Cancelada` | bit | `cancelada` | Se a etiqueta foi cancelada |
| `TipoFrete` | int | `tipo_frete` | Código do tipo de frete |
| `Entregue` | bit | `entregue` | Se o volume foi entregue |
| `LogisticaKey` | varchar(100) | `logistica_key` | Chave de integração com API da transportadora |
| `CodigoBarras` | varchar(100) | `codigo_barras` | Código de barras para rastreamento |
| `TipoLogistica` | int | `tipo_logistica` | 1=Correios, 2=transportadora, etc |
| `NFeChave` | varchar(50) | `nfe_chave` | Chave de acesso da NF-e (44 chars) — índice criado |
| `Observacao` | varchar(100) | `observacao` | Observações livres |
| `UsuarioAlt` | varchar(20) | `usuario_alt` | Usuário que alterou |
| `DataAlt` | datetime | `data_alteracao` | Timestamp de alteração |

## Supabase

- Schema: `lit_mirror_fiscal`
- Tabela: `logistica_etiquetas`
- Job: `fiscal`
- Migração: `018_fase2_fiscal.sql`
- Índice especial: `idx_le_nfe_chave` em `nfe_chave` (para lookup por chave NF-e)

## Uso no HeziomOS

Rastreamento de entregas: permite mostrar no app o status de entrega de pedidos, integrar com APIs dos Correios e transportadoras via `logistica_key` e `codigo_barras`.

Relaciona-se com [[NotaFiscal]] via `nfe_chave` e [[NotaFiscalEventos]] para timeline completo do ciclo de entrega.
