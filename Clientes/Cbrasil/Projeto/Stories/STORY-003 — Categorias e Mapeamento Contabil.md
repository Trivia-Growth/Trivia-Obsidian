---
status: pronto
tipo: feature
sprint: 1
prioridade: alta
concluido: 2026-05-07
---

# STORY-003 — Categorias e Mapeamento Contabil

## Descricao

Criar o sistema de categorias financeiras por cliente, com mapeamento para contas contabeis (debito/credito) e template de historico. Isso e o coracao da conversao financeiro → contabil.

## Criterios de Aceite

- [ ] Tabela `client_categories` criada
- [ ] Tabela `client_bank_accounts` criada
- [ ] CRUD de categorias pelo admin/contador
- [ ] Cada categoria tem: tipo (entrada/saida), categoria, item, conta_debito, conta_credito, historico_template
- [ ] Cada conta bancaria tem: banco, agencia, conta, conta_contabil (codigo no plano de contas)
- [ ] Interface de gestao de categorias funcional
- [ ] Dados da IPP pre-populados como exemplo

## Banco de Dados

```sql
CREATE TABLE client_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL,
  item TEXT NOT NULL,
  conta_debito TEXT NOT NULL,
  conta_credito TEXT NOT NULL,
  historico_template TEXT,
  ativo BOOLEAN DEFAULT true
);

CREATE TABLE client_bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  banco TEXT NOT NULL,
  agencia TEXT,
  conta TEXT NOT NULL,
  conta_contabil TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true
);

ALTER TABLE client_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE client_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_bank_accounts FORCE ROW LEVEL SECURITY;
```

## Dados Iniciais (IPP — Bradesco 5632-4, conta contabil 18)

| Tipo | Categoria | Item | Debito | Credito | Template |
|------|-----------|------|--------|---------|----------|
| entrada | Dizimos e Ofertas | Ofertas Expansao | 18 | 319 | RECEB. OFERTA PROJ. EXPANSAO - {fornecedor} |
| entrada | Rendimentos | Aplicacao | 18 | 43 | RENTAB INVEST FACIL CRED, CF EXT BRADESCO |
| entrada | Rendimentos | Resgate Aplicacao | 18 | 43 | RESG APLIC INVEST FACIL, CF EXT BRADESCO |
| saida | Construcao Civil | Materiais | 250 | 18 | PG {documento}, {fornecedor}, {item} |
| saida | Construcao Civil | Servicos | 105 | 18 | PG {documento}, {fornecedor}, {item} |
| saida | Servicos | Arquitetura | 249 | 18 | PG {documento}, {fornecedor}, {item} |
| saida | Tarifas Bancarias | PIX | 530 | 18 | TARIFA BANCARIA {forma_pagamento} |
| saida | Aplicacoes | Invest Facil | 43 | 18 | APLIC INVEST FACIL, CF EXT BRADESCO |
| saida | Imoveis | Aquisicao | 61 | 18 | PG {documento}, {fornecedor}, PARC AQUISICAO |

### Estatisticas de referencia (IPP Abril/2025)

- Total de lancamentos no mes: 452
- Conta 18 como debito: 358x | como credito: 94x
- Conta 319 como credito: 318x (ofertas — maior volume)
- Conta 530 como debito: 32x (tarifas)
- Contas 105/249/250 como debito: 54x combinadas (construcao)

## Plano de Contas Identificado

| Codigo | Natureza | Funcao | Frequencia (abr/25) |
|--------|----------|--------|---------------------|
| 18 | Ativo | Banco Bradesco c/c 5632-4 (pivot) | 452x |
| 319 | Receita | Ofertas Projeto Expansao | 318x |
| 43 | Ativo | Aplicacao Invest Facil Bradesco | 44x |
| 105 | Despesa | Servicos de Terceiros / Construcao | 20x |
| 249 | Despesa | Projetos / Arquitetura / Engenharia | 11x |
| 250 | Despesa | Materiais / Compras | 23x |
| 530 | Despesa | Tarifas Bancarias | 32x |
| 61 | Ativo/Imobilizado | Imoveis / Aquisicoes | 4x |

## Notas Tecnicas

- O plano de contas completo ainda nao foi obtido (apenas 8 contas identificadas)
- A conta bancaria (18) e o "pivot" — sempre aparece como debito (entrada) ou credito (saida)
- O template de historico usa placeholders: {fornecedor}, {documento}, {item}, {forma_pagamento}
- Resgate de aplicacao (DB:18/CR:43) e cenario distinto de rendimento — mesmo par de contas, complemento diferente
- Centros de custo (CCDB/CCCR) e CNPJ existem no ODS mas nao sao preenchidos para IPP — manter campos opcionais para outros clientes
- Historico Padrao (campo Contmatic) vazio para IPP — outros clientes podem usar codigos padrao. Campo opcional.
- **Bloqueador:** precisamos do plano de contas completo do sogro para cobrir todos os casos
- **Validacao futura:** Verificar se fluxo e similar para empresas de servico e ONGs (alem de igrejas)
