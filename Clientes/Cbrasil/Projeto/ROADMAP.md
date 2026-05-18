# Roadmap — C. Brasil Financeiro

> Sistema financeiro para clientes da C. Brasil Contabilidade.  
> Converte movimentacoes financeiras em lancamentos contabeis (partida dobrada) e exporta para Contmatic Phoenix.

---

## Visao por Sprints

### Sprint 1 — Fundacao

| Story | Nome | Status | Bloqueadores |
|-------|------|--------|--------------|
| 001 | Setup Infraestrutura | 🟡 Em progresso | Criar repo GitHub dedicado |
| 002 | Auth e Multi-tenancy | ⬜ Backlog | — |
| 003 | Categorias e Mapeamento Contabil | ⬜ Backlog | Plano de contas completo do sogro |

**Entregavel:** Login funcional, isolamento de dados por cliente, categorias IPP mapeadas.

---

### Sprint 2 — Operacao

| Story | Nome | Status | Bloqueadores |
|-------|------|--------|--------------|
| 004 | Registro de Lancamentos | ⬜ Backlog | STORY-002, STORY-003 |
| 005 | Importacao de Planilhas | ⬜ Backlog | STORY-004 |
| 006 | Painel do Contador (Revisao) | ⬜ Backlog | STORY-004 |

**Entregavel:** Cliente registra lancamentos, importa planilha. Contador revisa e aprova.

---

### Sprint 3 — Exportacao + Visibilidade

| Story | Nome | Status | Bloqueadores |
|-------|------|--------|--------------|
| 007 | Exportacao ODS Contmatic | ⬜ Backlog | STORY-006 |
| 009 | Dashboard do Cliente | ⬜ Backlog | STORY-004 |

**Entregavel:** ODS pronto para importar no Contmatic. Cliente acompanha status dos lancamentos.

---

### Sprint 4 — Integracao Direta (Fase 2)

| Story | Nome | Status | Bloqueadores |
|-------|------|--------|--------------|
| 008 | Integracao API Contmatic | ⬜ Backlog | Token API (ConnectCont do sogro) |

**Entregavel:** Envio direto para Contmatic via API, com fallback ODS.

---

### Sprint 5+ — Inteligencia (Fase 3)

| Story | Nome | Status | Bloqueadores |
|-------|------|--------|--------------|
| 010 | Sugestao IA e Deteccao Anomalias | ⬜ Backlog | Volume de dados historicos |

**Entregavel:** Classificacao assistida por IA, alertas de anomalias.

---

## Bloqueadores Criticos

| # | Descricao | Responsavel | Impacto |
|---|-----------|-------------|---------|
| 1 | Plano de contas completo da IPP | Sogro | Bloqueia STORY-003 (seed data completo) |
| 2 | Token API Contmatic (ConnectCont) | Sogro | Bloqueia STORY-008 (toda Fase 2) |
| 3 | Dominio do sistema (app.cbrasil...) | JG | Bloqueia deploy producao |
| 4 | Validacao com outros clientes | JG + Sogro | Pode revelar gaps no MVP |

---

## Decisoes Tomadas

- **ODS antes de API** — entrega valor imediato sem depender de token
- **Conversao no backend** — cliente nao precisa saber contabilidade
- **Multi-tenancy via RLS** — isolamento impossivel de burlar pelo frontend
- **Triviaiox framework** — padrao de desenvolvimento Trivia com stories e DoD
- **Fase 1 = MVP funcional** — cobre 100% do trabalho manual atual do sogro

---

## Metricas de Sucesso

- [ ] IPP (cliente-piloto) usando o sistema para registrar lancamentos
- [ ] Reducao de >70% no tempo de classificacao contabil do sogro
- [ ] Zero erros de importacao no Contmatic (arquivo ODS valido)
- [ ] Pelo menos 2 clientes ativos alem da IPP ate fim da Fase 1

---

## Evolucao Futura (Fora do Escopo Atual)

- **Integra Contador (Serpro)** — APIs governamentais para DCTFWeb, PGDAS-D, e-CAC. Relevante quando C Brasil escalar para obrigacoes acessorias.
- **NFS-e Nacional** — API REST do novo sistema federal. Relevante para clientes que emitem notas de servico.
- **OCR de documentos** — Extrair dados de NFs escaneadas automaticamente (reduz input manual).
- **Reconciliacao bancaria** — Importar OFX/extrato e cruzar com lancamentos registrados.
- **Multi-banco** — Suportar mais de uma conta bancaria por cliente (hoje testado apenas com Bradesco 5632-4).
- **Alterdata/eBot** — Avaliar parceria com ecossistema Alterdata (dona da Contmatic) para IA contabil nativa.
