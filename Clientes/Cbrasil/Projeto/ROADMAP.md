# Roadmap — C. Brasil Financeiro

> Sistema financeiro para os clientes da C. Brasil Contabilidade. Converte movimentações financeiras simples em lançamentos contábeis (partida dobrada) e exporta para o Contmatic Phoenix.

---

## Fase 1 — MVP Operacional *(atual)*

**Objetivo:** O cliente registra suas movimentações financeiras e o contador exporta para o Contmatic sem trabalho manual de classificação.

**Postura:** Operacional

**Módulos:**
- [x] Setup de infraestrutura — STORY-001
- [x] Auth e multi-tenancy — STORY-002
- [x] Categorias e mapeamento contábil — STORY-003
- [x] Registro de lançamentos — STORY-004, STORY-012
- [x] Importação de planilhas — STORY-005
- [x] Painel do contador / revisão — STORY-006
- [x] Exportação ODS Contmatic — STORY-007
- [x] Contas bancárias e caixa — STORY-011
- [x] Extrato e filtros — STORY-013
- [x] Motor de tradução contábil — STORY-014
- [x] Gestão de clientes e usuários — STORY-016
- [x] Design system e temas — STORY-017
- [~] Dashboard do cliente — STORY-009, STORY-015 *(gráficos pendentes — STORY-023)*

**Status:** `em andamento` — núcleo entregue e em uso (piloto IPP, 408 lançamentos exportados). Pendências de Fase 1: gráficos do dashboard (STORY-023), histórico de exportações (STORY-024), paginação das listas (STORY-025), hardening de segurança (STORY-022), limpeza de lint (STORY-021).

---

## Fase 2 — Integração API Contmatic *(futura)*

**Objetivo:** Eliminar o passo manual de importar o arquivo ODS no Contmatic — envio direto via API.

**Módulos planejados:** Envio de lançamentos via API REST Contmatic (STORY-008), sincronização do plano de contas, fallback para ODS. *(Stories detalhadas quando a Fase 1 estiver concluída.)*

**Status:** `planejada` — bloqueada pelo token da API Contmatic.

---

## Fase 3 — Inteligência e Relatórios *(futura)*

**Objetivo:** Automatizar a classificação e dar mais visibilidade financeira ao cliente.

**Módulos planejados:** Sugestão de categoria por IA, detecção de anomalias e duplicatas (STORY-010), relatórios comparativos, conciliação bancária. *(Escopo definido durante a Fase 2.)*

**Status:** `planejada`

---

## Milestones

| Marco | Data | Status |
|-------|------|--------|
| Primeiro deploy em produção | 2026-05-07 | ✅ concluído |
| Piloto IPP operando (408 lançamentos) | 2026-05 | ✅ concluído |
| Fase 1 concluída | a definir | pendente |
| Token API Contmatic obtido | a definir | pendente (bloqueador) |
| Fase 2 concluída | a definir | pendente |

---

## Bloqueadores e Dependências

| # | Descrição | Responsável | Impacto |
|---|-----------|-------------|---------|
| 1 | Token da API Contmatic (ConnectCont) | Contador C. Brasil | Bloqueia toda a Fase 2 (STORY-008) |
| 2 | Domínio próprio do sistema (app.cbrasil…) | JG | Necessário para produção definitiva |
| 3 | Validação do fluxo com clientes além da IPP | JG + C. Brasil | Pode revelar gaps no MVP |

---

## Decisões e Histórico

- `2026-05-07` — **ODS antes de API:** o MVP usa exportação ODS (funciona sem credenciais Contmatic); a API direta fica para a Fase 2.
- `2026-05-07` — **Conversão contábil no backend:** o cliente não precisa saber contabilidade; a tradução para débito/crédito acontece nas Edge Functions.
- `2026-05-07` — **Multi-tenancy via RLS** com `FORCE ROW LEVEL SECURITY` em todas as tabelas.
- `2026-05-08` — **Refactor de papéis:** `admin`→`superadmin`, `cliente`→`admin_cliente`, novo papel `operador`.
- `2026-05-22` — **Diagnóstico e estabilização:** o sistema estava fora do ar apenas porque o projeto Supabase (plano gratuito) havia sido pausado por inatividade. Reativado; correções aplicadas (STORY-018 a STORY-021). Auditoria do vault e migração ao padrão Trivia.

---

## Evolução Futura *(fora do escopo atual)*

- **Integra Contador (Serpro)** — APIs governamentais (DCTFWeb, PGDAS-D, e-CAC).
- **NFS-e Nacional** — API REST do sistema federal de notas de serviço.
- **OCR de documentos** — extrair dados de NFs escaneadas.
- **Multi-banco** — mais de uma conta bancária por cliente.
