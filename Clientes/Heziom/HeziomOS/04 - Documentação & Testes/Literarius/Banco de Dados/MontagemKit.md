# MontagemKit / MontagemKitItens

> Registro de montagem de kits compostos: um produto-kit formado por N produtos-componente. Usado para pacotes editoriais, caixas de livros, coleções.

## Fonte SQL Server

### MontagemKit

| Banco | Literarius |
|---|---|
| Tabela | `MontagemKit` |
| Linhas | ~148 |
| PK | `idMontagemKit` (bigint) |
| Incremental | `DataAlt >= @since` |

| Coluna SQL | Tipo | Supabase | Descrição |
|---|---|---|---|
| `idMontagemKit` | bigint | `id_literarius` PK | Chave natural |
| `Numero` | int | `numero` | Número sequencial da montagem |
| `DataMontagem` | datetime | `data_montagem` | Data de montagem física |
| `Produto` | int | `produto` | FK → Produto (produto-kit resultante) |
| `Descricao` | varchar(150) | `descricao` | Descrição do kit |
| `Observacao` | varchar(250) | `observacao` | Observações livres |
| `MontagemFisicaLogica` | varchar(1) | `montagem_fisica_logica` | `F`=física, `L`=lógica |
| `UsuarioAlt` | varchar(50) | `usuario_alt` | Usuário que alterou |
| `DataAlt` | datetime | `data_alteracao` | Timestamp de alteração |

### MontagemKitItens

| Banco | Literarius |
|---|---|
| Tabela | `MontagemKitItens` |
| Linhas | ~461 |
| PK | `idMontagemKitItens` (bigint) |
| Incremental | `mki.DataAlt >= @since OR mk.DataAlt >= @since` (JOIN fallback — ADR-007) |

| Coluna SQL | Tipo | Supabase | Descrição |
|---|---|---|---|
| `idMontagemKitItens` | bigint | `id_literarius` PK | Chave natural |
| `idMontagemKit` | bigint | `id_montagem_kit` | FK → MontagemKit |
| `Item` | int | `item` | Sequência do componente |
| `Produto` | int | `produto` | FK → Produto (componente) |
| `Descricao` | varchar(150) | `descricao` | Descrição do componente |
| `Qtde` | numeric(18,4) | `qtde` numeric(15,4) | Quantidade do componente no kit |
| `Valor` | money | `valor` numeric(19,4) | Valor do componente |
| `UsuarioAlt` | varchar(50) | `usuario_alt` | Usuário que alterou |
| `DataAlt` | datetime | `data_alteracao` | Timestamp de alteração |

## Supabase

- Schema: `lit_mirror_cadastro`
- Tabelas: `montagem_kits`, `montagem_kits_itens`
- Job: `cadastro`
- Migração: `017_fase2_cadastro.sql`

## Uso no HeziomOS

Permite exibir no app quais kits/coleções estão disponíveis e quais produtos os compõem. Útil para precificação de pacotes e controle de estoque de kits.

Relaciona-se com [[Produto]] (produto-kit e componentes).
