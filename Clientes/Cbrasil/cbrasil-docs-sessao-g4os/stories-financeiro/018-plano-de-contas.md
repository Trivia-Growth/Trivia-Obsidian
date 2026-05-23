# Story 018 — Plano de Contas por Cliente

> ✅ **Concluída** — Deploy: 2026-05-08

## Objetivo
Permitir que cada cliente tenha seu próprio plano de contas cadastrado no sistema, refletindo exatamente o que está no Contmatic Phoenix. O Translation Engine passa a usar esse plano dinâmico ao invés de códigos hard-coded.

## Contexto
- Hoje os códigos de conta (18, 319, 105, 530 etc.) estão fixos nas categorias
- Cada cliente da C. Brasil tem um plano de contas diferente no Contmatic
- O plano precisa ser cadastrável manualmente e importável via planilha (formato XLS/CSV igual ao que já sai do Contmatic)
- Exemplo real: IPP tem ~400 contas (Ativo, Passivo, Receitas, Despesas) com códigos hierárquicos

## Escopo

### 1. Banco de Dados
- **Tabela `chart_of_accounts`**
  - `id` UUID PK
  - `client_id` UUID FK → clients
  - `codigo` TEXT (ex: "1.1.1.02.007") — código hierárquico da conta
  - `codigo_contmatic` INTEGER — código numérico no Contmatic (ex: 18)
  - `descricao` TEXT (ex: "BANCO BRADESCO - C/C 5632-4 - GALPÃO")
  - `natureza` TEXT — "D" ou "C" (débito/crédito)
  - `tipo` INTEGER — 1=Ativo, 2=Passivo, 3=PL, 4=Resultado, 9=Zeramento
  - `nivel` INTEGER — nível hierárquico (1-5), calculado do codigo
  - `is_analitica` BOOLEAN — se é conta analítica (pode receber lançamentos)
  - `ativo` BOOLEAN DEFAULT true
  - `created_at` TIMESTAMPTZ
  - UNIQUE(client_id, codigo)
  - UNIQUE(client_id, codigo_contmatic) WHERE codigo_contmatic IS NOT NULL
- **RLS**: mesma lógica multi-tenant (admin vê tudo, usuario vê do seu client_id)

### 2. Migração das Categorias
- Alterar `categories.conta_debito` e `categories.conta_credito` de INTEGER para UUID FK → chart_of_accounts (ou manter INT como codigo_contmatic e fazer JOIN)
- Decisão: manter como INTEGER (codigo_contmatic) por compatibilidade com exportação ODS — o plano serve como validação e lookup

### 3. Tela Admin — Plano de Contas (`/admin/plano-contas`)
- **Listagem**: Tabela hierárquica (indentada por nível) com busca
  - Colunas: Código | Código Contmatic | Descrição | Natureza | Tipo | Nível
  - Filtros: Tipo (Ativo/Passivo/Receita/Despesa), Só analíticas, Busca texto
- **Cadastro manual**: Modal com todos os campos
- **Importação de planilha**: Upload XLS/CSV no formato Contmatic
  - Parser inteligente que detecta as colunas (Conta, Descrição, NATUREZADC, NATUREZA)
  - Preview antes de confirmar (mostra quantas contas novas vs. existentes)
  - Upsert por (client_id, codigo) — atualiza descrição se já existir
- **Editar/Desativar** contas individuais

### 4. Integração com Categorias
- Ao criar/editar categoria, os campos conta_debito e conta_credito mostram um **autocomplete** que busca no plano de contas do cliente
- Mostra: código + descrição (ex: "18 — BANCO BRADESCO - C/C 5632-4")
- Valida que o código existe no plano

### 5. Edge Function — Import Plano de Contas
- `supabase/functions/import-chart-of-accounts/index.ts`
- Recebe arquivo XLS/CSV + client_id
- Parseia formato Contmatic (lida com colunas extras, pipes, etc.)
- Calcula `nivel` e `is_analitica` automaticamente
- Retorna { inserted, updated, errors }

### 6. Router e Sidebar
- Nova rota: `/admin/plano-contas`
- Item no sidebar (dentro da seção Admin): "Plano de Contas"

## Critérios de Aceite
- [x] Admin pode importar planilha XLS do Contmatic e ver plano carregado
- [x] Admin pode cadastrar conta manualmente
- [x] Plano é filtrado por cliente (multi-tenant)
- [x] Ao editar categoria, conta_debito/credito sugere do plano via autocomplete
- [x] Translation Engine continua funcionando com os códigos numéricos
- [x] Exportação ODS não é afetada (usa codigo_contmatic como sempre)

## Estimativa
- Complexidade: Alta
- Itens: migração SQL + Edge Function parser + página admin + integração categorias
- Prioridade: Sprint 5

## Dependências
- Tabela `clients` (já existe)
- Tabela `categories` (já existe, campo conta_debito/credito permanece INT)
- Formato de planilha do Contmatic (validado com PlContas IPP - IA.xls)
