---
tags: [heziomos, mapa, organizacao, indice]
status: vigente
criado: 2026-05-19
autor: JG Novais (Trivia)
---

# 🗺️ Mapa do Vault — HeziomOS

Inventário estrutural completo do vault **HeziomOS** e registro da organização feita em 19/05/2026. Para navegação por links, use [[00 - Índice]]. Este documento serve para entender **o que existe e onde está**.

**Números:** 112 notas `.md` · raiz do vault Obsidian = pasta `HeziomOS/` · ~3,3 GB (a maior parte são vídeos de treinamento dos processos financeiros).

---

## Estrutura de pastas

```
HeziomOS/
├── 00 - Índice.md                 ← mapa de navegação por links (ponto de entrada)
├── HeziomOS — Arquitetura e Fluxos.md   ← ARQUITETURA VIGENTE
├── HeziomOS — Arquitetura.md            ← arquitetura histórica (referência)
├── Agente Financeiro — Prompt.md
├── DDL Banco de dados Literarius.md     ← schema bruto do ERP
├── PUML Tabelas Literarius.md           ← diagramas ER
│
├── CEO Dashboard/        → o produto: dashboard, KPIs, assistente IA (4 notas)
├── Financeiro/           → módulos e análises financeiras (15 notas)
│   └── Módulos/          → os 8 módulos do sistema
├── Fontes de Dados/      → documentação das integrações (54 notas)
│   ├── Literarius/        → ERP: APIs, schema do banco, views
│   │   ├── APIs/
│   │   └── Banco de Dados/  → 21 tabelas mapeadas
│   ├── Tray/              → e-commerce: 16 notas de endpoints
│   └── Mandae/            → logística
├── Integrações/          → Qive, Bancos CNAB/OFX, Alertas, Tray (4 notas)
├── Processos Financeiros/ → mapeamento dos processos do time + vídeos
│   └── KRs/               → KR1 Contabilidade, KR2 Consignação, KR3 Dia a Dia
├── Projeto/              → gestão: roadmap, backlog, stories, dashboards (20 notas)
│   └── Stories/           → STORY-001 a 009 + template
├── Decisões/             → ADRs (decisões de arquitetura)
├── Literarius/           → views da camada de acesso HeziomOS
├── Queries/              → CSVs de resultados de queries exploratórias
├── Financeiro HEziom 1-JANEIRO/ → fechamento de janeiro (planilhas, NFs, extratos)
└── .aiox-core/           → framework AIOX (NÃO é nota — código do método)
```

---

## Notas por área

### Raiz / Arquitetura
- [[00 - Índice]] — mapa de navegação
- [[HeziomOS — Arquitetura e Fluxos]] — **arquitetura vigente** (19/05)
- [[HeziomOS — Arquitetura]] — histórico (15/04)
- [[Agente Financeiro — Prompt]] · [[DDL Banco de dados Literarius]] · [[PUML Tabelas Literarius]]

### CEO Dashboard (o produto)
- [[Dashboard CEO]] · [[KPIs e Métricas]] · [[Assistente — Chat MCP]] · [[Memória do Assistente]]

### Financeiro — Módulos
- Existentes: [[Pedidos e Vendas]] · [[Contas a Receber]] · [[Contas a Pagar]] · [[DRE e Fluxo de Caixa]]
- Novos: [[Aprovação de Pagamentos]] · [[Conciliação Bancária]] · [[Gestão de Estoque e CMV]] · [[Comissões e Repasses]]

### Financeiro — Análises
- [[Mapa de Dados]] · [[Premissas e Entendimentos]] · [[Dúvidas para Insights do CEO]] · [[Análise dos Dados Extraídos]] · [[Análise Conexão Direta DB]] · [[Análise Planilhas Janeiro 2026]] · [[DRE Acumulado 2025-2026]]

### Fontes de Dados — Literarius (ERP)
- Visão geral: [[Mapeamento Completo de Tabelas]] · [[Schema Detalhado]] · [[Views SQL — Mapeamento e Uso]] · [[Réplica Supabase — Schema e Estratégia de Sync]] · [[Estoque Heziom — Análise Mai 2026]]
- APIs: [[Literarius-API-Documentacao]] · [[API-Produtos]] · [[API-Estoque]] · [[API-Pedidos-Venda]] · [[API-Nota-Fiscal]] · [[Endpoints-Produtos]]
- Banco de Dados (21 tabelas): [[_índice]] · [[TituloFinanceiro]] · [[TituloFinanceiroBaixa]] · [[TituloFinanceiroRateio]] · [[TituloFinanceiroBaixaRateio]] · [[TituloFinanceiroAgrupado]] · [[ContaBancaria]] · [[ContaBancariaLancamento]] · [[PlanoConta]] · [[CentroResultado]] · [[FormaPagto]] · [[CondicaoPagto]] · [[PedidoVenda]] · [[NotaFiscal]] · [[ComissaoParametro]] · [[Produto]] · [[Estoque]] · [[Entrada]] · [[Parceiro]] · [[Consignacao]] · [[DireitoAutoral]]

### Fontes de Dados — Tray (e-commerce)
- [[Tray - Autenticação]] · [[Tray - Rate Limit e Paginação]] · [[Tray - Webhooks]] · [[Tray - Capacidades do Integrador]] · [[Tray - Pedidos]] · [[Tray - Pagamentos]] · [[Tray - Invoices]] · [[Tray - Clientes]] · [[Tray - Categorias e Marcas]] · [[Tray - Cupons e Promoções]] · [[Tray - Carrinho Abandonado e Scripts]] · [[Tray - Frete e Logística]] · [[Tray - Temas e Design]] · [[Tray - OpenCode — Desenvolvimento de Temas]] · [[Tray - Sync Agent — Endpoints e Estratégia]] · [[Tray — Correlação com Literarius]]
- Geral: [[Mapa Completo de APIs e Capacidades]] · [[Mandaê]]

### Integrações
- [[Qive — NF-e Automática]] · [[Bancos — CNAB e OFX]] · [[Alertas e Notificações]] · [[Tray — Conciliação de Repasses]]

### Processos Financeiros
- [[Índice dos Processos]] · [[KR1 — Contabilidade Mensal]] · [[KR2 — Consignação]] · [[KR3 — Dia a Dia]] · [[Mapa de Automação]] · [[Outros Processos]]

### Projeto (gestão)
- [[Dashboard do Projeto]] · [[Roadmap]] · [[Sprint Atual]] · [[Backlog]] · [[Setup João]] · [[Escopo Tecnico]] · [[Estudo de APIs — Capacidades e Gaps]] · [[Roadmap de Integração Tray × Literarius]] · [[Dashboard CEO — Análise Maio 2026]] · [[Dashboard CEO — Posição de Estoque]] · [[Sessão 2026-05-19 — Continuidade João]]
- Stories: STORY-001 a STORY-009 + [[_Template — Story]]

### Decisões / Literarius
- [[ADR-001 — Sync Agent no Raspberry Pi]] · [[ADR-002 — Segurança do Sync Agent]] · [[Views — Camada de Acesso HeziomOS]]

---

## Arquivos não-nota (anexos)

| Tipo | Qtd | Onde |
|------|-----|------|
| `.webm/.mkv/.mp4` (vídeos) | 41 | `Processos Financeiros/` — gravações de treinamento (~3 GB, mantidos por decisão) |
| `.xlsx/.xls` (planilhas) | 37 | Fechamento jan/2026 e processos contábeis |
| `.csv` | 19 | `Queries/` — resultados de queries exploratórias no Literarius |
| `.docx` | 16 | `Processos Financeiros/KRs/` — procedimentos do time |
| `.pdf` | 9 | Estoque, guias de recolhimento |

---

## Log de organização — 19/05/2026

Limpeza e padronização executadas (vault 5,9 GB → 3,3 GB):

1. **Removidas 5 pastas vazias de conflito de sincronização** (`Financeiro 2`, `Integrações 2`, `Literarius 2`, `Processos Financeiros 1`, `Financeiro HEziom 1-JANEIRO 2`) — artefatos do macOS, conforme convenção do vault.
2. **Removido `Processos Financeiros.zip` (2,6 GB)** — era cópia compactada redundante da pasta já extraída; inflava o sync sem necessidade.
3. **Removido `Bem-vindo.md`** — nota padrão do Obsidian.
4. **Removidos todos os `.DS_Store`** e a pasta vazia residual em KR2.
5. **Corrigidos ~308 wikilinks quebrados:** links com caminho `[[Clientes/Heziom/HeziomOS/...]]` (caminho inexistente a partir da raiz do vault) e o typo `HezionOS` foram reduzidos a `[[NomeDaNota]]`. Como todos os nomes de nota são únicos, o Obsidian resolve sozinho — links agora funcionam no Graph View.
6. **Resolvido conflito de merge do git** não finalizado em `Projeto/Roadmap.md` (tabela de Stories da Fase 1).
7. **Arquitetura:** mantidos os dois documentos; o índice e o cabeçalho do antigo agora deixam explícito qual é o vigente.

### Recomendações em aberto (não executadas)
- **`Queries/`**: os 19 CSVs têm o SQL inteiro como nome de arquivo (alguns com quebra de linha). Funciona, mas é frágil. Sugestão futura: renomear para `Q01-...`, `Q02-...` e mover o SQL para dentro de uma nota índice.
- **Vídeos (~3 GB)**: mantidos por sua decisão. Se o sync do vault ficar pesado, considerar movê-los para armazenamento externo deixando só o link.
