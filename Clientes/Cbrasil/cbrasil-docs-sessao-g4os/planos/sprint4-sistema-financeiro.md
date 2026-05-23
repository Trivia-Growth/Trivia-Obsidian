# Sprint 4 — Sistema Financeiro Completo

## Visão

Sistema financeiro completo, simples de usar e rico em dados. O cliente gerencia suas finanças com categorias, centros de custo, contas bancárias e dashboards gerenciais — tudo em linguagem simples. Por baixo dos panos, o motor de tradução resolve a contabilidade automaticamente.

---

## Ordem de Implementação

### 1. STORY-011 — Contas Bancárias e Caixa
- Migração: adicionar `saldo_inicial NUMERIC(14,2)` em `client_bank_accounts`
- API: CRUD contas (`getAccounts`, `createAccount`, `updateAccount`, `deactivateAccount`)
- Página `/contas`: cards com saldo calculado em tempo real
- Saldo = saldo_inicial + sum(entradas) - sum(saídas) filtrado por conta
- Form criar/editar: banco, agência, conta, descrição, saldo inicial
- Tipo "Caixa" (sem agência/número — dinheiro físico)
- RLS já existe na tabela

### 2. STORY-011B — Centros de Custo
- Nova tabela `client_cost_centers` (id, client_id, nome, descricao, ativo, created_at)
- RLS: mesmo padrão (admin ALL, contador ALL seus clientes, cliente SELECT)
- API: CRUD centros de custo
- Página `/centros-de-custo` ou seção dentro de configurações
- Exemplos: "Tenda", "Ministério ECC", "Projeto Expansão", "Administrativo"
- Campo centro_custo nos lançamentos passa a ser FK (não texto livre)
- Migração: converter campo `centro_custo TEXT` → `cost_center_id UUID FK`

### 3. STORY-012 — Lançamentos CRUD Completo
- Refatorar `TransactionForm`:
  - Labels: "Receita" / "Despesa" (nunca entrada/saída)
  - Campo **conta bancária** obrigatório (dropdown)
  - Campo **centro de custo** obrigatório (dropdown)
  - Campo **categoria > item** (dropdown hierárquico filtrado por tipo)
  - Máscara de valor BR (R$ 1.234,56)
  - Máscara CPF/CNPJ
  - Campos: data, tipo, categoria, item, conta, centro de custo, valor, fornecedor/pagador, CPF/CNPJ, forma pgto, nº documento, observação
- Nova Edge Function `update-transaction`: valida status pendente/rejeitado, recalcula tradução
- Botões editar/excluir por lançamento (só status=pendente ou rejeitado)
- Delete: valida status antes, confirmação modal
- Ao editar lançamento rejeitado: status volta para 'pendente'

### 4. STORY-014 — Motor de Tradução Contábil
- Módulo compartilhado `supabase/functions/_shared/translation-engine.ts`
- Função `resolveTranslation(input)` → `{conta_debito, conta_credito, complemento}`
- Regras:
  - Entrada → debito = conta_contabil do banco, credito = conta da categoria
  - Saída → debito = conta da categoria, credito = conta_contabil do banco
- Templates de histórico com variáveis: `{fornecedor}`, `{documento}`, `{item}`, `{categoria}`, `{forma_pagamento}`, `{centro_custo}`
- Fallbacks inteligentes (nunca placeholder residual):
  1. Fornecedor + documento: `"PG {forma_pgto} {doc}, {FORNECEDOR}, {Item}"`
  2. Só fornecedor: `"{FORNECEDOR}, {Item}"`
  3. Sem fornecedor: `"{Categoria} - {Item}"`
- UPPERCASE, truncar 200 chars, sem `{...}` no output final
- Integrar em: `register-transaction`, `import-spreadsheet`, `update-transaction`
- Import: respeita coluna Histórico quando preenchida

### 5. STORY-013 — Extrato e Filtros
- Nova rota `/extrato`
- Filtros combinados: período, conta, tipo, categoria, centro de custo, fornecedor, status, valor min/max
- Busca textual (fornecedor, observação, documento)
- Paginação real (20/página com navegação)
- Saldo acumulado linha a linha
- Totalizadores: total entradas, total saídas, saldo do período
- Exportar CSV (com filtros aplicados, cabeçalhos em PT-BR)
- Autocomplete fornecedor (DISTINCT do histórico do cliente)

### 6. STORY-015 — Dashboard Financeiro e Gerencial
- Substitui o DashboardPage atual para role=cliente
- **Resumo do mês:**
  - Cards: Receitas, Despesas, Saldo (com % variação vs mês anterior)
  - Navegação entre meses
- **Saldo por conta:**
  - Lista de contas com saldo atual
  - Total consolidado
- **Por Centro de Custo:**
  - Tabela/gráfico: quanto cada centro de custo gastou/recebeu no mês
  - Barras proporcionais (ex: "Tenda: R$120k — 65%", "Ministérios: R$15k — 8%")
  - Drill-down: clicar no centro abre extrato filtrado
- **Por Categoria:**
  - Top 5 despesas e top 5 receitas do mês
  - Barra de progresso com % do total
- **Fluxo de Caixa:**
  - Gráfico barras: entradas vs saídas por semana do mês
  - Simples, leve (barras CSS ou chart mínimo)
- **Alertas:**
  - Lançamentos rejeitados (link pra corrigir)
  - Pendentes de revisão (informativo)
- **Ações rápidas:**
  - + Lançamento, Importar Planilha, Ver Extrato

### 7. STORY-017 — Design System + Tema Claro/Escuro
- Definir identidade visual C. Brasil Financeiro (cores primárias, tipografia, espaçamentos)
- Implementar sistema de temas com CSS variables (light + dark)
- Toggle claro/escuro no header (salva preferência no localStorage)
- Respeitar `prefers-color-scheme` do sistema como default
- Tokens de design:
  - Cores: primary, primary-light, success, warning, error, surface, background, border, text, text-muted
  - Tipografia: font-family (Inter ou similar), tamanhos (xs a 2xl), pesos
  - Espaçamentos: padrão 4px grid (sm=8, md=16, lg=24, xl=32)
  - Bordas: radius (sm=4, md=8, lg=12), border colors
  - Sombras: elevation levels (sm, md, lg)
- Componentes base padronizados:
  - Button (primary, secondary, ghost, danger) com estados hover/disabled
  - Input, Select, Textarea com estilo consistente
  - Card, Badge, Alert reutilizáveis
  - Table estilizada (zebra, hover, responsive)
  - Modal/Dialog
  - Sidebar navigation com ícones
- Aplicar tema em todas as páginas existentes
- Dark mode: cores invertidas com contraste acessível (WCAG AA)
- Responsivo: breakpoints mobile (< 768px), tablet, desktop

### 8. STORY-016 — Gestão Clientes e Usuários (Admin)
- Rota `/admin/clientes` (só role=admin no menu)
- CRUD clientes: nome, CNPJ, código Contmatic, apelido
- Detalhe do cliente com abas: Geral, Usuários, Config Contmatic, Categorias, Contas, Centros de Custo
- Edge Function `invite-user`: cria conta Auth + vínculo client_users
- Alterar role, remover vínculo
- Migração: campos cnpj, email_contato, telefone em `clients`
- Menu admin só visível para role=admin

---

## Modelo de Dados (Novas Tabelas/Campos)

```sql
-- Centros de Custo
CREATE TABLE client_cost_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: admin ALL, contador seus clientes, cliente SELECT

-- Alterações em transactions
ALTER TABLE transactions ADD COLUMN cost_center_id UUID REFERENCES client_cost_centers(id);
-- (migrar dados existentes do campo centro_custo texto para a nova FK)

-- Alterações em client_bank_accounts
ALTER TABLE client_bank_accounts ADD COLUMN saldo_inicial NUMERIC(14,2) DEFAULT 0;

-- Alterações em clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email_contato TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS telefone TEXT;
```

---

## Navegação Final (Cliente)

```
Sidebar:
├── Dashboard (resumo + gerencial)
├── Lançamentos (CRUD)
├── Extrato (filtros + export)
├── Importar Planilha
├── Contas Bancárias
├── Centros de Custo
└── Categorias (visualização simples)
```

## Navegação Final (Admin/Contador)

```
Sidebar:
├── Painel Contador (pendências por cliente)
├── Revisão (aprovar/rejeitar)
├── Exportar ODS
├── Categorias (CRUD completo + templates)
├── Admin: Clientes (CRUD + config Contmatic)
└── Admin: Usuários (convites + roles)
```

---

## Princípios de UX

1. **Zero jargão contábil** para o cliente — ele vê Receita/Despesa, categorias em português, centros de custo com nomes que ele escolheu
2. **Dados ricos** — centro de custo, categoria, conta, fornecedor em todo lançamento → alimenta dashboards e relatórios
3. **Tradução invisível** — o motor resolve débito/crédito/histórico sem o cliente saber que existe
4. **Dashboard que responde perguntas** — "quanto gastei na Tenda?", "qual meu maior custo?", "como estou vs mês passado?"
5. **Multi-tenant seguro** — RLS em tudo, isolamento total, admin gerencia sem SQL
6. **Design consistente** — design system com tokens, componentes reutilizáveis, tema claro/escuro, identidade visual profissional
