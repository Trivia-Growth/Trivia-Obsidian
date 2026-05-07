---
status: backlog
tipo: feature
sprint: 1
prioridade: alta
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
| saida | Construcao Civil | Materiais | 250 | 18 | PG {documento}, {fornecedor}, {item} |
| saida | Construcao Civil | Servicos | 105 | 18 | PG {documento}, {fornecedor}, {item} |
| saida | Servicos | Arquitetura | 249 | 18 | PG {documento}, {fornecedor}, {item} |
| saida | Tarifas Bancarias | PIX | 530 | 18 | TARIFA BANCARIA {forma_pagamento} |
| saida | Aplicacoes | Invest Facil | 43 | 18 | APLIC INVEST FACIL, CF EXT BRADESCO |
| saida | Imoveis | Aquisicao | 61 | 18 | PG {documento}, {fornecedor}, PARC AQUISICAO |

## Notas Tecnicas

- O plano de contas completo ainda nao foi obtido (apenas 7 contas identificadas)
- A conta bancaria (18) e o "pivot" — sempre aparece como debito (entrada) ou credito (saida)
- O template de historico usa placeholders: {fornecedor}, {documento}, {item}, {forma_pagamento}
- Bloqueador: precisamos do plano de contas completo do sogro para cobrir todos os casos
