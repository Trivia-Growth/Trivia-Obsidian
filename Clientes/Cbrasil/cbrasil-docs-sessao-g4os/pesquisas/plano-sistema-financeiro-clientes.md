# Plano: Sistema Financeiro para Clientes da C. Brasil

## Visao Geral

Sistema web onde clientes da C. Brasil registram suas movimentacoes financeiras (entradas e saidas) de forma simplificada, e o sistema converte automaticamente para o formato contabil necessario para importacao no Contmatic Phoenix.

**Problema atual:** O contador recebe planilhas Excel dos clientes, elimina colunas desnecessarias, classifica manualmente cada lancamento (debito/credito), formata o historico, e exporta para ODS. Processo 100% manual, demorado, e sujeito a erros.

**Solucao:** O cliente preenche no sistema usando linguagem financeira simples (entrada/saida, categoria, fornecedor), e o sistema faz a conversao automatica para partida dobrada com os codigos do plano de contas.

---

## Arquitetura

### Stack Tecnica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | HTML/CSS/JS (mesmo padrao do site) | Consistencia visual, sem framework pesado |
| Backend | Supabase (PostgreSQL + Edge Functions + Auth) | Ja em uso, RLS por cliente |
| Exportacao | Edge Function (gera ODS ou envia via API) | Serverless, sob demanda |
| Hospedagem | Netlify (frontend) + Supabase (backend) | Ja configurado |

### Fluxo de Dados

```
Cliente registra movimentacao (interface simples)
         |
         v
Supabase (tabela transactions) — status: pendente
         |
         v
Contador revisa no painel admin — status: revisado
         |
         v
Exportacao: ODS para importacao manual OU API Contmatic direto
         |
         v
Status: exportado
```

---

## Modulo 1: Cadastro e Autenticacao

### 1.1 Usuarios

Cada cliente tera um login (email + senha via Supabase Auth). O contador (admin) cadastra o cliente e vincula ao `client_id` existente na tabela `clients`.

**Tabela adicional necessaria:**
```sql
CREATE TABLE client_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, client_id)
);
```

### 1.2 RLS por Cliente

Cada usuario so ve e edita transacoes do seu proprio `client_id`. O admin (seu sogro e voce) ve tudo.

```sql
CREATE POLICY "Cliente ve apenas seus lancamentos"
  ON transactions FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM client_users
    WHERE user_id = auth.uid()
  ));
```

---

## Modulo 2: Registro de Movimentacoes (Interface do Cliente)

### 2.1 Formulario Simplificado

O cliente NAO precisa saber contabilidade. Ele preenche:

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Data | Date picker | 01/04/2025 |
| Tipo | Toggle | ENTRADA / SAIDA |
| Categoria | Select (pre-configurado) | Ofertas, Construcao Civil, Tarifas... |
| Item/Subcategoria | Select (filtra por categoria) | Ofertas Expansao, Concreto, Aluguel... |
| Fornecedor/Pagador | Text | Nome da pessoa ou empresa |
| CPF/CNPJ | Text (opcional) | 12.345.678/0001-00 |
| Valor | Currency input | R$ 1.400,00 |
| Forma de pagamento | Select | PIX, TED, Boleto, Outros |
| Centro de custo | Select (opcional) | TENDA, ECC, GERAL |
| N. Documento | Text (opcional) | NFS 95, NF 7350 |
| Observacao | Text (opcional) | Descricao livre |

### 2.2 Categorias Pre-Configuradas (por cliente)

Cada cliente tera um conjunto de categorias e itens configurados pelo contador. Exemplo IPP:

**Entradas:**
- DIZIMOS E OFERTAS → Ofertas Expansao, Dizimos, Ofertas Gerais
- RENDIMENTOS → Aplicacao Invest Facil

**Saidas:**
- CONSTRUCAO CIVIL → Materiais, Servicos, Locacao
- SERVICOS → Arquitetura, Engenharia, Assessoria
- IMOVEIS → Parcelas de aquisicao
- TARIFAS BANCARIAS → PIX, QR Code, TED
- APLICACOES → Invest Facil

**Tabela:**
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
```

### 2.3 Mapeamento Automatico (Categoria → Conta Contabil)

Quando o cliente seleciona categoria + item + tipo, o sistema ja sabe:
- Qual conta debitar
- Qual conta creditar
- Como montar o complemento (historico)

**Exemplo de regras (IPP - Banco Bradesco 5632-4 = conta 18):**

| Tipo | Categoria | Item | Debito | Credito | Template Historico |
|------|-----------|------|--------|---------|-------------------|
| Entrada | Dizimos e Ofertas | Ofertas Expansao | 18 | 319 | RECEB. OFERTA PROJ. EXPANSAO - {fornecedor} |
| Saida | Construcao Civil | Materiais | 250 | 18 | PG {documento}, {fornecedor}, {item} |
| Saida | Servicos | Arquitetura | 249 | 18 | PG {documento}, {fornecedor}, {item} |
| Saida | Tarifas Bancarias | PIX | 530 | 18 | TARIFA BANCARIA {forma_pagamento} |
| Saida | Aplicacoes | Invest Facil | 43 | 18 | APLIC INVEST FACIL, CF EXT BRADESCO |

---

## Modulo 3: Importacao de Planilhas

### 3.1 Para Clientes que Preferem Excel

Funcionalidade para clientes que ja possuem controle em planilha e nao querem migrar para o sistema web.

**Fluxo:**
1. Cliente faz upload do arquivo Excel (.xlsx)
2. Sistema le e valida a estrutura (colunas esperadas)
3. Exibe preview dos dados encontrados
4. Cliente confirma
5. Sistema insere na tabela `transactions` com status `pendente`

### 3.2 Template de Importacao

Fornecer template Excel padrao para o cliente preencher:

| Coluna | Obrigatoria | Descricao |
|--------|-------------|-----------|
| Data | Sim | DD/MM/AAAA |
| Tipo | Sim | ENTRADA ou SAIDA |
| Categoria | Sim | Deve existir em client_categories |
| Item | Sim | Deve existir em client_categories |
| Fornecedor | Sim | Nome |
| CPF/CNPJ | Nao | Documento |
| Valor | Sim | Numerico |
| Forma Pagamento | Nao | PIX, TED, Boleto |
| Centro Custo | Nao | Codigo |
| N. Documento | Nao | Referencia |
| Observacao | Nao | Texto livre |

### 3.3 Importacao do Formato Atual (compatibilidade)

Para clientes que ja enviam no formato que usam hoje (como a planilha da IPP), criar mapeamento customizado:
- O contador configura quais colunas da planilha do cliente correspondem a quais campos
- Salva o mapeamento por cliente
- Proximas importacoes usam o mesmo mapeamento automaticamente

**Tabela:**
```sql
CREATE TABLE import_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  mapeamento JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Exemplo de `mapeamento`:
```json
{
  "data": "Data",
  "tipo": "Tipo de Lancamento",
  "categoria": "Categoria",
  "item": "Item",
  "fornecedor": "Fornecedor",
  "cpf_cnpj": "CPF/CNPJ",
  "valor": "Valor",
  "forma_pagamento": "Forma Pagamento",
  "centro_custo": "Centro",
  "documento": "N Documento",
  "observacao": "Historico"
}
```

---

## Modulo 4: Painel do Contador (Admin)

### 4.1 Dashboard

- Total de lancamentos pendentes de revisao (por cliente)
- Alertas: lancamentos sem categoria mapeada, valores atipicos
- Acesso rapido a exportacao por cliente/periodo

### 4.2 Revisao de Lancamentos

O contador visualiza os lancamentos ja convertidos em partida dobrada e pode:
- Aprovar em lote (tudo correto)
- Editar individualmente (corrigir classificacao)
- Rejeitar (devolver ao cliente com observacao)

### 4.3 Gestao de Categorias

- Cadastrar/editar categorias e itens por cliente
- Definir o mapeamento categoria → conta contabil
- Configurar templates de historico

### 4.4 Gestao do Plano de Contas

- Importar plano de contas do Contmatic via API (`GET /v1/planocontas/{apelido}/{ano}`)
- Manter sincronizado
- Vincular contas as categorias dos clientes

---

## Modulo 5: Exportacao para Contmatic

### 5.1 Caminho 1 — Arquivo ODS (Imediato)

Gera arquivo ODS no formato exato que o Contmatic importa:

| Coluna | Fonte | Regra |
|--------|-------|-------|
| Lancamento | Gerado | Sequencial (continua de onde parou) |
| Data | transactions.data | Formato DD/MM/AAAA |
| Debito | client_categories.conta_debito | Codigo numerico |
| Credito | client_categories.conta_credito | Codigo numerico |
| Valor | transactions.valor | Formato BR (virgula decimal) |
| Historico Padrao | (vazio ou configuravel) | — |
| Complemento | Template preenchido | Ex: "RECEB. OFERTA PROJ. EXPANSAO - FULANO" |
| CCDB | transactions.centro_custo ou vazio | — |
| CCCR | transactions.centro_custo ou vazio | — |
| CNPJ | transactions.cpf_cnpj ou vazio | — |

**Nomenclatura do arquivo:** `{codigo_cliente}_{ano}_Lctos.ods`
(Ex: `507_2025_Lctos.ods` — conforme padrao descrito pelo sogro)

**Edge Function:** `generate-ods`
- Recebe: client_id, periodo (mes/ano)
- Consulta transactions com status = revisado
- Gera ODS (formato ZIP + XML do OpenDocument)
- Atualiza status para `exportado`
- Retorna arquivo para download

### 5.2 Caminho 2 — API Contmatic (Futuro)

Integrar via `POST /v1/lancamentos/{apelido}/{ano}`:

```json
[
  {
    "data": "2025-04-01T00:00:00Z",
    "lancamentosCreditos": [
      { "contaContabilId": 319, "historicoId": 0, "valor": 1400.00 }
    ],
    "lancamentosDebitos": [
      { "contaContabilId": 18, "historicoId": 0, "valor": 1400.00 }
    ],
    "valor": 1400.00
  }
]
```

**Pre-requisitos para ativar:**
1. Gerar token no Portal Developer (credenciais do responsavel financeiro)
2. Consultar plano de contas via API para obter os `contaContabilId` corretos
3. Testar com lancamentos de exemplo antes de usar em producao

**Edge Function:** `export-contmatic-api`
- Mesma logica do ODS, mas envia direto via API
- Salva log de resposta para auditoria
- Fallback para ODS se API falhar

---

## Modulo 6: Inteligencia e Automacao

### 6.1 Classificacao Automatica (Regras)

Para lancamentos importados de planilha sem categoria pre-selecionada:
- Buscar por fornecedor ja utilizado anteriormente → sugerir mesma categoria
- Buscar por palavras-chave no historico → sugerir categoria
- Se nao encontrar: marcar como "classificacao pendente" para o contador

### 6.2 Deteccao de Anomalias

- Valor muito acima da media para aquela categoria
- Lancamento duplicado (mesma data + valor + fornecedor)
- Data fora do periodo esperado

### 6.3 Relatorios para o Cliente

- Resumo mensal: entradas vs saidas por categoria
- Grafico de evolucao
- Comparativo com meses anteriores

---

## Cronograma de Implementacao

### Fase 1 — MVP (2-3 semanas)

| Entrega | Descricao |
|---------|-----------|
| Auth + RLS | Login do cliente, isolamento de dados |
| Formulario de lancamento | Interface simples de registro |
| Categorias por cliente | Cadastro pelo admin, uso pelo cliente |
| Exportacao ODS | Gerar arquivo no formato Contmatic |
| Painel admin basico | Ver lancamentos, aprovar, exportar |

### Fase 2 — Importacao (1-2 semanas)

| Entrega | Descricao |
|---------|-----------|
| Upload de Excel | Importar planilha do cliente |
| Template padrao | Download do template para preenchimento |
| Mapeamento customizado | Configurar colunas por cliente |

### Fase 3 — Integracao API (1 semana)

| Entrega | Descricao |
|---------|-----------|
| Conexao API Contmatic | Token + envio de lancamentos |
| Sync plano de contas | Importar contas automaticamente |
| Fallback ODS | Se API falhar, gerar arquivo |

### Fase 4 — Inteligencia (1-2 semanas)

| Entrega | Descricao |
|---------|-----------|
| Sugestao de categoria | Baseado em historico |
| Deteccao de duplicatas | Alertas automaticos |
| Relatorios do cliente | Dashboard financeiro simplificado |

---

## Schema Completo (Alteracoes no Banco)

Alem das tabelas ja existentes (`transactions`, `chart_of_accounts`, `clients`), criar:

```sql
-- Usuarios vinculados a clientes
CREATE TABLE client_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- Categorias financeiras por cliente (de-para com plano de contas)
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

-- Contas bancarias do cliente (para definir conta-caixa)
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

-- Mapeamentos de importacao de planilha
CREATE TABLE import_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  mapeamento JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Historico de exportacoes
CREATE TABLE export_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  tipo TEXT CHECK (tipo IN ('ods', 'api')),
  periodo TEXT NOT NULL,
  total_lancamentos INTEGER,
  arquivo_url TEXT,
  api_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indices
CREATE INDEX idx_client_users_user ON client_users(user_id);
CREATE INDEX idx_client_users_client ON client_users(client_id);
CREATE INDEX idx_client_categories_client ON client_categories(client_id);
CREATE INDEX idx_export_logs_client ON export_logs(client_id);
```

---

## Alteracao na Tabela Transactions Existente

Adicionar campos para rastreabilidade:

```sql
ALTER TABLE transactions ADD COLUMN tipo TEXT CHECK (tipo IN ('entrada', 'saida'));
ALTER TABLE transactions ADD COLUMN categoria_id UUID REFERENCES client_categories(id);
ALTER TABLE transactions ADD COLUMN bank_account_id UUID REFERENCES client_bank_accounts(id);
ALTER TABLE transactions ADD COLUMN fornecedor TEXT;
ALTER TABLE transactions ADD COLUMN cpf_cnpj TEXT;
ALTER TABLE transactions ADD COLUMN forma_pagamento TEXT;
ALTER TABLE transactions ADD COLUMN import_batch_id UUID;
ALTER TABLE transactions ADD COLUMN created_by UUID REFERENCES auth.users(id);
```

---

## Edge Functions Necessarias

| Funcao | Descricao |
|--------|-----------|
| `register-transaction` | Recebe dados do formulario, resolve categoria → contas, insere na tabela |
| `import-spreadsheet` | Recebe arquivo Excel, valida, parseia, insere em lote |
| `generate-ods` | Gera arquivo ODS no formato Contmatic para download |
| `export-contmatic-api` | Envia lancamentos revisados para a API Contmatic |
| `sync-chart-of-accounts` | Consulta plano de contas na API e sincroniza local |
| `suggest-category` | Busca historico de fornecedor e sugere classificacao |

---

## Dependencias e Pre-Requisitos

### Para comecar (Fase 1):
- [x] Supabase configurado (ja temos)
- [x] Tabelas base criadas (transactions, chart_of_accounts, clients)
- [ ] Plano de contas completo de pelo menos 1 cliente (IPP) para popular client_categories
- [ ] Definir categorias e itens para o primeiro cliente-piloto

### Para API Contmatic (Fase 3):
- [ ] Gerar token de acesso no Portal Developer (seu sogro precisa fazer login com as credenciais do responsavel financeiro)
- [ ] Consultar plano de contas via API para validar mapeamento de IDs
- [ ] Testar endpoint de lancamentos com dados reais

---

## Decisoes de Design

1. **Cliente preenche em linguagem financeira, nao contabil** — Ele escolhe "Entrada > Ofertas > Ofertas Expansao" em vez de "Debito 18, Credito 319". A conversao e invisivel.

2. **Dois caminhos de saida (ODS + API)** — O ODS funciona imediatamente sem depender de credenciais da Contmatic. A API e o upgrade futuro que elimina o passo manual de importacao.

3. **Revisao obrigatoria pelo contador** — Nenhum lancamento vai para o Contmatic sem passar pela aprovacao. Isso protege contra erros de classificacao.

4. **Importacao de planilha como ponte** — Clientes que ja tem controle em Excel nao precisam mudar de habito. Importam a planilha e o sistema faz o resto.

5. **Categorias configuradas por cliente** — Cada organizacao tem realidade diferente (igreja vs ONG vs empresa). O plano de categorias e individual.

---

## Proximo Passo Imediato

Para iniciar a Fase 1, preciso de voce:

1. **Plano de contas da IPP (ou outro cliente-piloto)** — Pode ser exportado do Contmatic ou listado pelo seu sogro. Preciso dos codigos e descricoes das contas mais usadas.

2. **Lista de categorias/itens** — Baseado na planilha da IPP que ja analisamos, posso montar uma versao inicial e voce valida com seu sogro.

3. **Decisao sobre dominio do sistema** — Vai ficar em `app.cbrasilcontabilidade.com.br`, `financeiro.cbrasilcontabilidade.com.br`, ou como subpagina do site?
