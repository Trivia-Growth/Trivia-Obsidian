# Backup Flowbiz — Editora Heziom
**Data do backup:** 05/06/2026  
**Conta:** Editora Hez  
**Plano:** CORP 200 (vencimento: 26/06/2026)  
**API Key usada:** E1af-8687-71e0-34d0-e28e-7fb3-5b23-22e5

---

## Conteúdo do Backup

### 📋 `/listas/`
- `listas_completo.json` — JSON completo das 40 listas com todos os metadados
- `listas_resumo.csv` — Resumo das 40 listas (ID, nome, contatos, data criação)
- `campos_personalizados.json` — Todos os campos personalizados por lista (345 campos em 40 listas)
- `campos_personalizados.csv` — CSV de todos os campos

### 👥 `/contatos/`
- `TODOS_CONTATOS_CONSOLIDADO.csv` — **96.692 contatos** de todas as listas (campos básicos + comportamento de compra)
- `lista_XXXXX_NomeDaLista.json` — JSON completo por lista (31 arquivos)
- `lista_XXXXX_NomeDaLista.csv` — CSV com campos nomeados por lista (31 arquivos)
- `optouts_descadastros.csv` — Lista de descadastros históricos

### 📧 `/campanhas/`
- `campanhas_completo.json` — JSON de todas as 168 campanhas com estatísticas completas
- `campanhas_resumo.csv` — CSV resumido (nome, status, enviados, aberturas, cliques, bounces, datas)

### 🏷️ `/tags/`
- `tags_completo.json` — Tags da conta (2 tags registradas)

### 🔄 `/autoresponders/`
- `autoresponders_completo.json` — Autoresponders encontrados via API

---

## Estatísticas do Backup

| Item | Quantidade |
|------|-----------|
| Listas | 40 |
| Contatos exportados | 96.692 |
| Campanhas | 168 (148 enviadas, 19 rascunhos) |
| Total de envios históricos | 1.336.712 |
| Campos personalizados | 345 (em 40 listas) |
| Lista Clientes | 53.910 contatos |
| Lista Assinantes | 24.616 contatos |

---

## Campos Comportamentais (Lista Clientes)
A lista "Clientes" contém dados ricos sincronizados da Tray:
- Nome, Cidade, Estado, CEP, Data de Nascimento, Gênero
- ÚLTIMO PEDIDO: Categorias, Data, Marcas, Produtos, SKU, Quantidade, Status, Valor
- HISTÓRICO: Data Primeiro Pedido, Qt de Pedidos, Receita Total, Tempo Médio de Recompra, Ticket Médio
- Telefone, E-mail

---

## Próximos Passos
1. Cancelar Flowbiz antes de **26/06/2026** (vencimento do contrato anual)
2. Migrar base para HeziomOS + provedor de e-mail (Amazon SES / Resend)
3. Recriar automações: boas-vindas, recuperação de carrinho (lista carr.abando)
