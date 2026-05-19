# Roadmap — Sistema Angioclam

> Insumo herdado de [[Clientes/Angioclam/Sistema/30 - Roadmap]] (briefing).
> Aqui é a execução no padrão Trivia.

---

## Fase 1 — Fatia vertical: motor + upload + KPIs + HTML *(atual)*

**Objetivo:** subir B1/B2/B3 → motor TS calcula → painel de KPIs → gera HTML dos
9 slides, com paridade 100% provada contra `dados_relatorio.json`.

**Postura:** Operacional (sem parâmetros editáveis ainda).

**Módulos:**
- [x] Bootstrap do repo no padrão Trivia (STORY-001)
- [x] Porte do motor para TS + parsers + paridade (STORY-002) — 32/32 testes
- [x] UI tela única: upload + KPIs + HTML (STORY-005) — mockup validado
- [x] Edge Function `recompute-report` + Supabase (STORY-008) — código pronto, deploy pendente

**Status:** `Fase 1 concluída` — Netlify conectado ao GitHub (deploy automático).

> Feito: login Supabase + AuthGuard; wiring `useReport → recompute-report`
> (grava oficial); HTML de export no padrão REFINADO (9 slides). Único passo
> manual restante: criar o 1º superadmin (ver `supabase/seed_superadmin.sql`).

---

## Fase 2 — Parâmetros editáveis + audit log *(concluída — 2026-05-18)*

Custos/benchmarks editáveis por operadora; audit log imutável. Default ==
constantes (paridade preservada — 42 testes verdes).

**Status:** `concluída` — motor aceita `MotorParams`; tabelas
`report_parameters` (seed por operadora) + `report_audit_log` imutável (RLS+FORCE,
sem UPDATE/DELETE); tela `/parametros` (editar + pré-visualizar impacto + salvar
nova versão com auditoria). Deploy: commit `1e26714`, migration aplicada,
Netlify publicado. Taxonomia editável e edição manual de campos: backlog futuro.

**STORY-021 (ADR-007):** recálculo autoritativo movido para o backend via
agregado PII-free — a Edge Function aplica os `report_parameters` da operadora
no servidor (cliente não é mais fonte da economia). PII nunca trafega.
Verificado em produção. SEC-003/004/005/006 resolvidos.

## Fase 3 — Camada 2 IA *(backend concluído — 2026-05-18)*

Edge Functions `ai-audit` (alertas) e `ai-copywriter` (textos dos 9 slides) via
Claude API (`claude-opus-4-7`, structured outputs, prompt caching). IA nunca
calcula (schemas só-texto + sanitização). `buildHtml(k, textos?)` aplica textos
revisados; números só dos KPIs.

**Status:** `concluída` — STORY-030: backend + UI de revisão (seção inline na
tela do relatório: alertas + textos editáveis, aceitar → aplica no HTML).
Deploy ACTIVE, 51 testes, ADR-008. Único passo do JG: ativar a chave
(`supabase secrets set ANTHROPIC_API_KEY=...`) para a IA responder de verdade.

## Fase 4 — Aprovação + PDF *(concluída — 2026-05-18)*

Fluxo `rascunho→calculado→em_revisao→aprovado` (Edge Function
`set-report-status`, só superadmin aprova, audit por transição); export PDF =
impressão do HTML print-ready (ADR-009), habilita só aprovado; cor travada por
operadora. STORY-040, 52 testes, deploy + E2E OK. **Status:** `concluída`.

## Fase 5 — Multi-planilha + clínica + parâmetros extensíveis *(concluída — 2026-05-19)*

Devolutiva do Sergio. Stories:
- ✅ STORY-050 multi-arquivo por slot + formatos (.csv ;/, e .xls=HTML)
- ✅ STORY-051 parseDt 2 formatos de data (ISO + DD/MM/AAAA)
- ✅ STORY-052 cadastro de clínicas (nome+CNPJ)
- ✅ STORY-053 clínica no relatório (seleção + capa/CNPJ)
- ✅ STORY-054 editar nome/cor da operadora
- ✅ STORY-055 parâmetros extensíveis (add/remover exame)
- ✅ STORY-056 verificação + deploy + E2E Bradesco
- ⏸️ STORY-057 (Fase 5.2, diferida) motor com indicadores configuráveis
- ⏸️ STORY-058 (diferida) integração API Klingo
- ⏸️ STORY-059 (diferida) anexar à plataforma da Lenira

Entrega: 67/67 testes verdes (gate SulAmérica intacto), build/lint ok,
commit `c453b45` (push main → Netlify), `supabase db push` (clinicas) +
`functions deploy recompute-report`.

**E2E completo Bradesco (2026-05-19, 9 arquivos):** mapeamento por schema —
B1 = `relatorio.csv` + `data (3).xls` + `data (4).xls`; B2 = `relatorio
(1).csv` + `data (8).xls` + `data (9).xls`; B3 = `data (5).xls` +
`data (6).xls` + `data (7).xls` (colunas de comorbidade haspacmed/dmiipacmed/
obespacmed…). Resultado: operadora "Bradesco Saúde", período 07/04/2025–
11/05/2026 (datas BR ok), 2.635 pacientes, 4.923 atendimentos, 19.116
procedimentos, faturamento R$ 3.405.235, econ. líquida (A) R$ 1.788.794,
cobertura B1/B2 97,1%/99,97%. HTML do relatório gerado em
`Sistema/Arquivos Bradesco/RELATORIO_Bradesco_E2E.html`.

Decisões: clínica = cadastrar+escolher no upload (cada lote = 1 clínica, sem
filtrar por coluna) + nome/CNPJ no relatório; novos exames = valores editáveis
agora, indicadores configuráveis depois. Paridade SulAmérica é gate.

**Status:** `concluída`. E2E backend com login real (superadmin) em
2026-05-19: recálculo autoritativo no servidor bateu 100% com o local
(econ. líq. A R$ 1.788.794), `reports` salvo com `clinica_id`+`operadora_id`,
`report_audit_log` registrado.

---

## Fase 6 — Histórico + usabilidade *(em andamento — 2026-05-19)*

Levantado no E2E Bradesco com o cliente:
- ✅ STORY-060 tela de histórico de relatórios — rotas `/historico`
  (lista + filtros operadora/clínica/período) e `/historico/:id`
  (detalhe reusa KpiDashboard + prévia HTML + painel de auditoria).
  `reports_read` já libera leitura → sem migration. 69 testes verdes,
  build/lint ok.
- ✅ Usabilidade: rótulos da área de upload indicam **como identificar**
  a planilha de cada slot pelo conteúdo (colunas).

- ✅ STORY-057 motor com indicadores configuráveis (Fase 5.2) — abordagem
  aditiva: os 5 indicadores fixos e o consolidado travado seguem intocados
  (paridade por construção); a operadora pode cadastrar indicadores extras
  opcionais (ParametersPage), que geram slide próprio + consolidado adicional
  no relatório e são recalculados no backend. migration aditiva
  `report_parameters.indicadores_extra` jsonb default `[]`. 75 testes verdes.
  Exame-base inédito (que exige recontar dados PII) segue diferido.

**Status:** `concluída` (STORY-060 + STORY-057). Diferidas: STORY-058
(API Klingo, aguardando externo), STORY-059 (fusão Lenira), exame-base
inédito da STORY-057.

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Bootstrap concluído | 2026-05-18 | concluído |
| Paridade do motor (STORY-004) | a definir | pendente |
| Primeiro deploy em produção | a definir | pendente |
| Fase 1 concluída | a definir | pendente |

---

## Decisões e Histórico

- `2026-05-18` — Decidido seguir o padrão Trivia à risca (app web React+Supabase),
  portando o motor Python v2 para TypeScript com paridade como gate. Repo em
  `github.com/Trivia-Growth/Angioclam`, código fora do vault.
