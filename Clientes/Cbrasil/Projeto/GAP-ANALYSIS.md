---
data: 2026-05-08
versao: 1.0
---

# Gap Analysis — C. Brasil Financeiro

## Visao do Produto

Sistema financeiro multi-tenant onde:
- **Clientes** registram sua movimentacao financeira (manual ou planilha) em linguagem simples
- **Sistema** traduz automaticamente para padrao contabil (partida dobrada, contas, historicos Contmatic)
- **Contabilidade** exporta pronto para Contmatic sem trabalho manual de "de/para"

---

## O Que Ja Existe (Sprint 1-3)

| Modulo | Status | Detalhes |
|--------|--------|----------|
| Auth + Multi-tenancy | OK | Login, roles (admin/contador/cliente), RLS em todas tabelas |
| Lancamento Manual | Parcial | Form com 9 campos, mas sem edicao/exclusao |
| Importacao Planilha | OK | Upload .xlsx, mapeamento custom, historico direto, 408/408 IPP |
| Categorias + Contas | OK | CRUD categorias, seed IPP, conta_debito/credito |
| Revisao Contabil | OK | Aprovar/rejeitar com motivo, bulk approve |
| Export ODS | OK | Formato Contmatic validado, numeracao sequencial |
| Dashboard Cliente | Parcial | Resumo mensal, status, lancamentos recentes |
| Dashboard Contador | Basico | Cards com pendencias por cliente |

---

## O Que Falta (Gap)

### CAMADA CLIENTE — Sistema Financeiro Completo

#### 1. Gestao de Lancamentos (CRITICO)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| Editar lancamento | Alta | Cliente precisa corrigir dados antes de ir pro contador |
| Excluir lancamento | Alta | Soft delete (status='cancelado') com audit |
| Filtros avancados | Alta | Por data, tipo, categoria, fornecedor, status |
| Paginacao real | Media | Hoje limita a 50 rows, sem paginar |
| Busca por texto | Media | Pesquisar por fornecedor, complemento, documento |
| Anexar comprovante | Baixa | Upload de PDF/imagem vinculado ao lancamento |

#### 2. Contas Bancarias / Caixa (CRITICO)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| UI de contas | Alta | Cliente ve suas contas (Bradesco, Caixa, etc) |
| Saldo por conta | Alta | Entradas - saidas por conta bancaria |
| Extrato por conta | Alta | Filtrar lancamentos por conta |
| Transferencias entre contas | Media | Entrada numa = saida noutra |

#### 3. Dashboard Cliente (MELHORAR)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| Grafico fluxo de caixa | Media | Entradas vs saidas por dia/semana |
| Top categorias | Media | Maiores gastos/receitas do mes |
| Comparativo mensal | Baixa | Este mes vs anterior |
| Alertas/notificacoes | Baixa | "3 lancamentos rejeitados precisam correcao" |

---

### CAMADA ADMIN/CONTABILIDADE — Gestao Multi-tenant

#### 4. Gestao de Clientes (CRITICO)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| CRUD clientes | Alta | Criar, editar, desativar clientes |
| Vincular usuarios | Alta | Convidar usuario, atribuir role e client_id |
| Config Contmatic por cliente | Alta | Codigo, apelido, plano de contas |
| Overview de todos clientes | Media | Lista com status, ultimo lancamento, pendencias |

#### 5. Gestao de Usuarios (CRITICO)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| Convidar usuario | Alta | Email invite com role pre-definido |
| Alterar role | Media | Promover cliente → contador, etc |
| Desativar acesso | Alta | Sem deletar dados |
| Lista de usuarios por cliente | Media | Quem tem acesso a que |

#### 6. Mapeamento de Colunas (IMPORTANTE)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| UI criar mapeamento | Alta | Arrastar/selecionar colunas da planilha → campos do sistema |
| Editar mapeamento | Media | Ajustar mapeamento existente |
| Testar mapeamento | Baixa | Upload preview com mapeamento antes de importar de verdade |

#### 7. Historico de Exportacoes (IMPORTANTE)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| Lista de exports | Media | Tabela com data, periodo, qtd lancamentos, quem gerou |
| Re-download ODS | Media | Baixar novamente um export anterior |
| Desfazer export | Baixa | Voltar status de exportado → revisado |

---

### CAMADA SISTEMA — Traducao Automatica (CORE)

#### 8. Motor de Traducao Contabil (CRITICO — diferencial)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| Auto-classificacao | Alta | Lancamento manual → sistema resolve conta_debito/credito sem intervencao |
| Historico inteligente | Alta | Gerar complemento padrao Contmatic baseado em regras do cliente |
| Regras por categoria | Alta | Cada categoria ja sabe qual debito/credito/template usar |
| Preview da traducao | Media | Contador ve como vai ficar no Contmatic antes de exportar |
| Sugestao por IA | Baixa | Sugerir categoria baseado em fornecedor/descricao (STORY-010) |

> NOTA: Hoje isso ja funciona para IMPORTACAO (planilha → categorias → contas).
> Falta funcionar para LANCAMENTO MANUAL da mesma forma automatica.

#### 9. Consistencia de Dados

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| Detectar duplicatas | Media | Mesmo fornecedor + valor + data = alerta |
| Validacao CPF/CNPJ | Baixa | Formato correto |
| Conciliacao | Baixa | Comparar extrato bancario vs lancamentos |

---

### INFRAESTRUTURA & SEGURANCA

#### 10. RLS & Multi-tenancy (REFORCAR)

| Feature | Prioridade | Descricao |
|---------|-----------|-----------|
| Audit log | Media | Tabela de quem fez o que quando |
| Isolamento total | Alta | Garantir que nenhuma query vaza dados entre clientes |
| Backup por cliente | Baixa | Export de todos dados de um cliente |

---

## Prioridade de Implementacao (Sprints Sugeridos)

### Sprint 4 — Sistema Financeiro Cliente
- Editar/excluir lancamentos
- Filtros e paginacao
- Contas bancarias (UI + extrato)
- Traducao automatica no lancamento manual (mesmo motor da importacao)

### Sprint 5 — Admin Multi-tenant
- CRUD clientes
- Gestao usuarios (invite, roles)
- UI mapeamento de colunas
- Historico de exports

### Sprint 6 — Experiencia Avancada
- Dashboard graficos
- Detectar duplicatas
- Comparativo mensal
- Anexos/comprovantes

### Sprint 7 — Inteligencia
- Sugestao IA de categorias
- Conciliacao bancaria
- API Contmatic direto (STORY-008)

---

## Resumo Quantitativo

| Aspecto | Hoje | Meta |
|---------|------|------|
| Tabelas com RLS | 6 | 8+ (audit_log, attachments) |
| Features cliente | 4 (dashboard, lancar, importar, ver) | 10+ (editar, excluir, filtrar, contas, extrato, graficos) |
| Features admin | 3 (categorias, revisao, export) | 8+ (clientes, usuarios, mappings, historico, config) |
| Traducao automatica | Funciona na importacao | Funciona em TUDO (manual + import + edicao) |
