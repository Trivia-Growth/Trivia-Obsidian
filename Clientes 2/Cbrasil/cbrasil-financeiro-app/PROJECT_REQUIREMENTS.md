# PROJECT_REQUIREMENTS — C. Brasil Financeiro

> Fonte da verdade de funcionalidades. Atualizar sempre que um modulo for adicionado, alterado ou removido. Commitar junto com o codigo.

---

## Identidade do Sistema

**C. Brasil Financeiro** e um sistema web onde clientes da C. Brasil Contabilidade registram suas movimentacoes financeiras (entradas e saidas) de forma simplificada. O sistema converte automaticamente os lancamentos para o formato contabil (partida dobrada) e exporta para importacao no Contmatic Phoenix ou via API direta.

**Entidade:** C. Brasil Contabilidade
**CNPJ:** (a confirmar)
**Natureza:** Sem fins lucrativos (maioria dos clientes) / Com fins lucrativos (empresas de servico)

---

## Stack Tecnico

| Componente | Tecnologia |
| ---------- | --------------------------------------- |
| Frontend | React + Vite + Tailwind + TypeScript |
| Backend | Supabase Edge Functions (Deno) |
| Banco | Supabase PostgreSQL |
| Deploy | Netlify (frontend) + Supabase (backend) |
| Auth | Supabase Auth |
| Agentes | Triviaiox v5+ |
| Exportacao | ODS (OpenDocument Spreadsheet) + API REST Contmatic |

---

## Papeis de Usuario

| Papel | Acesso |
|-------|--------|
| `admin` | Tudo: ver todos clientes, revisar lancamentos, configurar categorias, exportar, gerenciar usuarios |
| `contador` | Revisar lancamentos, exportar, configurar categorias dos seus clientes designados |
| `cliente` | Registrar lancamentos, importar planilha, ver seus proprios dados, baixar relatorios |

---

## Fases do Produto

### Fase 1 — MVP Operacional (atual)

**Objetivo:** Clientes registram movimentacoes e o contador exporta para Contmatic sem trabalho manual de classificacao.
**Postura:** Operacional

#### Modulos

**Auth e Multi-tenancy**
- Login com email/senha (Supabase Auth)
- Isolamento por client_id via RLS
- Convite de usuario pelo admin
- Papeis: admin, contador, cliente

**Registro de Lancamentos**
- Formulario simplificado (data, tipo, categoria, item, fornecedor, valor, forma pagamento)
- Categorias pre-configuradas por cliente (mapeadas para contas contabeis)
- Conversao automatica para partida dobrada (debito/credito)
- Formatacao automatica do historico/complemento
- Status: pendente > revisado > exportado

**Importacao de Planilhas**
- Upload de Excel (.xlsx) com validacao de estrutura
- Template padrao para download
- Mapeamento customizado de colunas por cliente (para planilhas existentes como a da IPP)
- Preview antes de confirmar importacao

**Painel do Contador (Admin)**
- Dashboard: lancamentos pendentes por cliente, alertas
- Revisao: aprovar/editar/rejeitar lancamentos
- Configuracao de categorias e mapeamento por cliente
- Gestao do plano de contas

**Exportacao Contmatic (ODS)**
- Gerar arquivo ODS no formato exato: Lancamento, Data, Debito, Credito, Valor, Historico Padrao, Complemento, CCDB, CCCR, CNPJ
- Nomenclatura: `{codigo_cliente}_{ano}_Lctos.ods`
- Numeracao sequencial continua
- Atualiza status para `exportado`

---

### Fase 2 — Integracao API Contmatic (futuro)

**Objetivo:** Eliminiar o passo manual de importacao do arquivo ODS no Contmatic.

Modulos previstos:
- Envio direto via `POST /v1/lancamentos/{apelido}/{ano}`
- Sync do plano de contas via `GET /v1/planocontas/{apelido}/{ano}`
- Fallback para ODS se API falhar
- Log de auditoria de envios

*(Stories serao criadas ao concluir Fase 1)*

---

### Fase 3 — Inteligencia e Relatorios (futuro)

**Objetivo:** Automatizar classificacao e dar visibilidade financeira ao cliente.

Modulos previstos:
- Sugestao de categoria baseada em historico de fornecedor
- Deteccao de duplicatas e anomalias
- Dashboard financeiro do cliente (entradas vs saidas, evolucao mensal)
- Comparativo entre periodos

*(Escopo definido durante Fase 2)*

---

## Regras de Negocio Criticas

- **Partida dobrada obrigatoria:** Todo lancamento DEVE ter uma conta debito e uma conta credito
- **Conta bancaria como pivot:** Entradas = debito na conta banco; Saidas = credito na conta banco
- **Classificacao vem da categoria:** O par debito/credito e determinado pela combinacao tipo + categoria + item (tabela `client_categories`)
- **Complemento formatado:** Segue template configurado: entradas = "RECEB. {tipo} - {fornecedor}"; saidas = "PG {documento}, {fornecedor}, {item}"
- **Numeracao sequencial:** O campo Lancamento no ODS e sequencial global por cliente/ano, continuando de onde parou
- **Valores calculados no backend:** Nenhum calculo financeiro no frontend
- **Revisao obrigatoria:** Lancamento so vai para exportacao apos status = revisado (nunca direto de pendente para exportado)
- **Isolamento total:** Cliente A nunca ve dados do cliente B (RLS por client_id)

---

## Fontes de Dados

### Supabase (C. Brasil Financeiro DB)

Tabelas existentes (schema 001):
- `leads` — vindos do chat SDR
- `clients` — organizacoes ativas
- `deals` — pipeline comercial
- `client_services` — servicos contratados
- `chart_of_accounts` — plano de contas
- `transactions` — lancamentos financeiros
- `activities` — tarefas internas

Tabelas novas (Fase 1):
- `client_users` — vinculo usuario-cliente com papel
- `client_categories` — categorias financeiras por cliente com mapeamento contabil
- `client_bank_accounts` — contas bancarias do cliente (conta-caixa)
- `import_mappings` — mapeamento de colunas para importacao de planilha
- `export_logs` — historico de exportacoes ODS e API

### Contmatic Phoenix (via API REST — read-only por ora)

- **Base URL:** `https://api.contmatic.com.br/public`
- **Auth:** API Key no header `Authorization` (token gerado no Portal Developer)
- **Endpoints relevantes:**
  - `GET /v1/planocontas/{apelido}/{ano}` — consulta plano de contas
  - `POST /v1/lancamentos/{apelido}/{ano}` — envio de lancamentos (Fase 2)
  - `GET /v1/empresas` — consulta empresas

### Planilhas dos Clientes (Excel .xlsx)

- Formato variavel por cliente (cada um tem seu controle)
- Caso referencia: IPP (Igreja Presbiteriana de Pinheiros) — Bradesco 5632-4
- Colunas tipicas: Data, Conta, Fornecedor, Valor, Categoria, Item, Tipo de Lancamento

---

## Questoes Abertas (Bloqueadores Potenciais)

| # | Questao | Impacto |
|---|---------|---------|
| 1 | Plano de contas completo da IPP (apenas 7 contas identificadas ate agora) | Bloqueia configuracao completa de client_categories para o piloto |
| 2 | Token API Contmatic (sogro precisa gerar no Portal Developer com credenciais do responsavel financeiro) | Bloqueia Fase 2 inteira |
| 3 | Dominio do sistema (app.cbrasilcontabilidade.com.br ou financeiro.cbrasil...) | Nao bloqueia dev, mas necessario para deploy producao |
| 4 | Outros clientes alem da IPP para validar se o fluxo e similar | Pode revelar necessidades nao cobertas pelo MVP |
