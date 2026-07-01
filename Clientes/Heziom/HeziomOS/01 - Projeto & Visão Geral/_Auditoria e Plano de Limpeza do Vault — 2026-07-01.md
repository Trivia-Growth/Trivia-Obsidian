---
tipo: auditoria
status: plano-aguardando-execução
data: 2026-07-01
autor: Claude Code (auditoria cirúrgica multi-agente)
escopo: 218 notas do vault HeziomOS cruzadas com o repo real (heziomos @ develop)
---

# Auditoria e Plano de Limpeza do Vault — HeziomOS

> **O que é isto:** varredura das 218 notas do vault, cada uma lida por inteiro, com as datas de criação/alteração (via git) e **toda afirmação de "pronto/substituído" cruzada com o código real** em `heziomos @ develop`. O objetivo é uma limpeza cirúrgica: separar o que é verdade viva, o que é conhecimento de domínio que não expira, e o que é legado de fases anteriores que hoje confunde quem implementa.
>
> **Nada foi movido/apagado ainda.** Este documento é o roteiro. A execução acontece só depois do seu aval.

---

## 1. O diagnóstico em uma página

O vault mistura **três fases históricas** do projeto sob a mesma estrutura, sem marcar qual é a vigente. Quem lê hoje não distingue o que já está em produção do que era plano de abril:

1. **Fase "Financeiro standalone / Raspberry Pi" (abr–mai/2026)** — dashboard financeiro sobre o Literarius, sync por Raspberry Pi, chat MCP. Numeração `STORY-001..009`. **Quase nada foi construído como especificado.**
2. **Fase "heziom-api" (mai–jun/2026)** — `STORY-010/011/012`. É **outro repositório** (`heziom-api`, Netlify Functions, ponte Tray↔Meta CAPI), não o sistema HeziomOS.
3. **Fase "monorepo heziomos" (15/06 em diante)** — `STORY-013..016` = fundação (Épico 1). Depois disso o vault **parou de registrar stories**, enquanto o repo seguiu até o Épico 18 (hoje). Resultado: os Épicos 2–18 (migração Flowbiz, atendimento omnichannel, agentes de IA, financeiro etc.) **não têm reflexo nenhum nesta pasta do vault.**

Além disso, três padrões de erro se repetem:

- **A pasta `Atendimento/Sales-Hzm/` inteira descreve um repositório antecessor** (`heziom-sales`, feito na Lovable, multi-tenant) que foi **reescrito e absorvido no monorepo atual** — todas as functions viraram `crm-*`. Isso não está documentado em lugar nenhum. **Risco real:** alguém "corrige" um bug de um repo morto, reabre trabalho concluído, ou aplica recomendação de segurança do schema antigo (incompatível) no novo.
- **Os índices de Atendimento e de Marketing/CRM erram por pessimismo:** marcam como "⬜ a criar" coisas que já estão **em produção** (painel de conversas = E16, agente IA com RAG = E17, campanhas/segmentação/réguas/ROI = E5). Confirmado function-a-function no código.
- **O Financeiro erra nos dois sentidos:** as notas de processo (KR1/KR3/Índice dos Processos) marcam como "🟢 Substituído" recursos que **não existem em produção** (conciliação automática, CNAB 240, captura Qive, aprovação por alçada — parte só existe numa branch não mergeada); e o `Índice Financeiro` erra no oposto, marcando como "⬜ não iniciado" o dashboard (Story 10.1) que **já está em produção**.

**Boa notícia:** quase nada precisa ser deletado. O grosso do que parece "velho" é conhecimento de domínio válido (schema do Literarius, APIs Tray/Mandaê, regras de negócio, fechamentos datados). O trabalho é **arquivar 3 clusters históricos**, **corrigir ~10 notas que enganam sobre o estado atual**, e **criar 1–2 notas-ponte** que faltam.

---

## 2. Estratégia de execução segura

- **Criar uma pasta `_Histórico/`** espelhando a estrutura (`_Histórico/Stories/`, `_Histórico/CEO Dashboard/`, `_Histórico/Decisões/`, `_Histórico/Sales-Hzm/`). No Obsidian os wikilinks resolvem **por nome único**, então **mover não quebra links** (foi assim na reorganização de 19/05).
- **Mover clusters inteiros de uma vez** (são internamente consistentes → os links entre eles continuam íntegros).
- **Antes de enterrar qualquer nota, extrair segredos expostos** (ver §3).
- **Nenhuma migração de conteúdo é destrutiva** — arquivar = mover, não apagar. Só há 1 deleção sugerida (dashboard Dataview quebrado) e 1 dedupe.

---

## 3. ⚠️ Itens de SEGURANÇA que apareceram (tratar antes de arquivar)

Estes não são "limpeza", mas surgiram na varredura e não podem ser enterrados junto com as notas:

| Onde | O quê | Ação |
|---|---|---|
| `Sales-Hzm/Pendências JG — Operacional.md` | PAT Supabase `sbp_bd50…` e API key Resend `re_H3K…` colados em texto | Extrair para a trilha central de rotação e **rotacionar** antes de arquivar a pasta |
| `Marketing e CRM/Flowbiz_backup…/README.md` | API Key Flowbiz que esteve exposta (mascarada 27/06) | Confirmar rotação/invalidação (perde validade com o cancelamento do Flowbiz) |
| `Credenciais.md` | Alerta 🔴 de que todos os segredos já estiveram no GitHub | Confirmar se a rotação pendente foi feita |

---

## 4. Ledger de ações

### 4A. 🔴 CORRIGIR AGORA — notas que enganam sobre o estado atual (Prioridade Alta)

| Nota | Problema | Ação |
|---|---|---|
| `03 - Departamentos/Atendimento/Índice Atendimento.md` | Marca painel de conversas, agente IA, escalação como "⬜ a criar" e Unnichat como vigente. Tudo já em produção (E16/E17/E6). É a única nota de Atendimento com link vivo do `00 - Índice`. | ATUALIZAR: submódulos → ✅ em produção; remover 4 wikilinks quebrados; apontar para o BACKLOG do repo |
| `03 - Departamentos/Marketing e CRM/Índice Marketing e CRM.md` | CRM Unificado, Segmentação/Réguas, Campanhas, ROI de Tráfego como "⬜ a criar" — todos em produção (`crm-campaign-send`, `crm-segment-refresh`, `crm-flow-engine`, `crm-performance-calculator`) | ATUALIZAR tabela → ✅ em produção; "substitui Flowbiz" → "Flowbiz desligado (cutover 30/06)" |
| `03 - Departamentos/Financeiro/Índice dos Processos.md` | Índice-mestre propaga 🟢 "Substituído" inflado de KR1/KR3 | ATUALIZAR em sincronia com KR1/KR3 (rebaixar itens) |
| `03 - Departamentos/Financeiro/Índice Financeiro.md` | Erra no oposto: Dashboard CEO/DRE/Contas a Receber como "⬜ não iniciado" — Story 10.1 já em produção | ATUALIZAR: promover esses itens a ✅ (Fase 1 entregue); manter ⬜ em aprovação/conciliação (branch não mergeada) |
| `03 - Departamentos/Financeiro/KR1 — Contabilidade Mensal.md` | Marca 🟢 "Substituído" itens 06,08,11–16,19 que dependem de CNAB/conciliação-auto/Qive **inexistentes**; cita "STORY-002/003/004" fantasma | ATUALIZAR: rebaixar esses itens p/ backlog; trocar STORY-00X por "Epic 10" |
| `03 - Departamentos/Financeiro/KR3 — Dia a Dia.md` | Idem itens 04,05,07,08 (Qive/conciliação/CNAB inexistentes) | ATUALIZAR: rebaixar; manter 🟢 só no #06 (aging, entregue) |

> **Nota transversal do Financeiro:** hoje, em produção, o módulo é **só dashboards de leitura (Story 10.1)** sobre o espelho `lit_mirror_financeiro`. Conciliação automática, CNAB 240, captura Qive e aprovação por alçada **não estão em produção** — parte vive só na branch `feat/10-financeiro-fase2` (não mergeada, e mesmo lá sem CNAB, com conciliação virada read-only).

### 4B. 📦 ARQUIVAR — cluster "Financeiro standalone / Raspberry Pi" (mover em bloco p/ `_Histórico/`)

Todas legado da fase 1; internamente consistentes. Mover juntas:

- `Backlog.md`, `Roadmap.md`, `Sprint Atual.md`, `Sessão 2026-05-19 — Continuidade João.md`
- `CEO Dashboard/` **(pasta inteira)**: Dashboard CEO, KPIs e Métricas, Assistente — Chat MCP, Memória do Assistente *(tabelas `assistant_memory`/`chat_sessions` nunca existiram; a ideia sobreviveu como `ceo-dashboard-summary`, arquitetura diferente)*
- `Decisões/ADR-001 — Sync Agent no Raspberry Pi.md` e `ADR-002 — Segurança do Sync Agent.md` *(superados pelo ADR-0005 real: Windows Server + Tailscale — adicionar header "SUPERADO")*
- `Stories/STORY-001` a `STORY-006` e `STORY-009` *(sync Deno/Pi; o sync real vive no repo externo `literarius-sync`)*
- `Stories/STORY-013` a `STORY-016` *(fundação do monorepo = Épico 1 concluído; registro fiel do momento — arquivar como histórico)*
- `Features Expandidas — APIs × Módulos HeziomOS.md`, `Roadmap de Integração Tray × Literarius.md`, `HeziomOS — Módulos e Escopo Completo.md` *(regras editoriais já preservadas no "Mapeamento Completo da Operação")*

### 4C. 📦 ARQUIVAR — cluster "Sales-Hzm" (repo antecessor absorvido)

Mover `03 - Departamentos/Atendimento/Sales-Hzm/` **inteira** para `_Histórico/Sales-Hzm/`. Antes:
1. **Criar nota-ponte** `_Histórico/Sales-Hzm/_LEIA — Sales-Hzm foi absorvido pelo monorepo.md` explicando: *"O Sales-Hzm (`heziom-sales`, Lovable, multi-tenant) foi reescrito no monorepo `heziomos` (feature `crm`, single-tenant, functions `crm-*`) em ~jun/2026. STORY-001..014 = débito do repo antigo (não aplicável). STORY-015..024 viraram os Épicos 5/6/16/17 — ver `docs/stories/BACKLOG.md`."* Incluir a tabela de-para `função antiga → crm-*`.
2. **Extrair os segredos** de `Pendências JG` (§3).
- Conteúdo: Índice, Arquitetura — Adaptação, Guia — Adaptação, Relatório Fase 2.2, Auditoria TRIVIAIOX, SECURITY_DEBT, Dashboard Stories, Próxima Sessão, e `Stories/STORY-001..024`.
- **Não usar `Auditoria TRIVIAIOX`/`SECURITY_DEBT` como premissa de segurança do sistema atual** (achados são de um schema que não existe mais; ex.: o "crm-deal-monitor sem auth" já está corrigido no repo real).

### 4D. 🚚 MOVER — cluster "heziom-api" (outro projeto, não é HeziomOS)

`Stories/STORY-010`, `STORY-011`, `STORY-012` são do repo `heziom-api` (Netlify, Tray↔Meta CAPI). Mover as três para uma pasta própria de subprojeto (ex.: `04 - Documentação & Testes/heziom-api/` ou fora do vault técnico) para não aparecerem como "stories do HeziomOS". São verdadeiras e concluídas — não deletar.

### 4E. ✏️ ATUALIZAR — arquitetura/estado obsoleto (Prioridade Média)

| Nota | Correção |
|---|---|
| `01/HeziomOS — Arquitetura v3.md` | É a melhor da pasta. Trocar "Raspberry Pi" → "Windows Server + Tailscale (ADR-0005)"; anotar que CRM/Hub são `features/` de `apps/web` (não apps separados); apontar `docs/` do repo como fonte canônica de épicos/ADRs |
| `06/Monorepo — Estrutura e Setup.md` | Corrigir topologia `apps/crm`+`apps/hub` (subtrees) → `apps/web` único com `features/crm` e `features/hub`; status "planejado" → "implementado/histórico" |
| `06/Supabase — Configuração e Migrations.md` | As migrations 0000-0006 descritas **conferem 1:1 com o repo** (não deletar); só falta registrar que a convenção virou **timestamp a partir de 0007+**. Corrigir a linha "aplicadas em ordem sequencial" |
| `06/Monorepo — Estrutura e Setup.md` ⚠️ | **Maior risco do bloco Dev:** é a nota mais linkada (7 entradas) e descreve `apps/crm`/`apps/hub` como apps separados — o real é `apps/web` único com `features/`. Induz alguém a procurar pasta que não existe. ATUALIZAR topologia + remover "Deploy Isolado por App"; **não deletar** (quebraria os 7 links) |
| `06/Monorepo — Plano de Implementação.md` | Marcar CONCLUÍDO (fases 5/6 já feitas) → histórico |
| `06/Avaliação Multi Agent.md` | Snapshot de 16/06; vários achados HIGH já corrigidos (ex.: `crm-deal-monitor` **tem** auth hoje). Marcar como "snapshot histórico — não representa estado atual" |
| `06/Atendimento — Mapeamento de Arquitetura.md` | Proposta de criar área "Atendimento" no header **já foi implementada** (`nav.ts`) → virar histórico |
| `04/Literarius/Réplica Supabase — Schema e Estratégia de Sync.md` | "Raspberry Pi + tabelas `lit_*` soltas" → "servidor de sync + schema `lit_mirror`" (os dicionários de 18/06 na mesma pasta já usam o correto) |
| `04/Literarius/Banco de Dados/_índice.md` | Único da subpasta ainda linkando ADR-001(Pi); apontar `lit_mirror` |
| `04/Tray/Tray - Sync Agent — Endpoints e Estratégia.md` | "Pi/cron/Flask + `tray_orders`/`tray_payments`" → "edge functions + schema `tray_mirror`"; manter lista de endpoints |
| `03 - Departamentos/Marketing e CRM/Arquitetura — Fonte Única de Contatos.md` | Nota canônica de contatos (espelha ADR-0015). Marcar stories 5.8/5.10/5.11 como ✅ (migrations 0015/0017/0018 aplicadas); `status: proposto` → `implementado` |
| `03 - Departamentos/Logística e Expedição/Índice.md` | `status: parcial` (enganoso) → `planejado`; apontar que rastreio/transportadoras já vivem no módulo `hub` |
| `03 - Departamentos/Marketing e CRM/LP Coleções 2026….md` | Resíduo: captura de lead aponta p/ Flowbiz (desligado) → `crm-lead-intake` |
| `01/Estudo de APIs — Capacidades e Gaps.md`, `01/Mapa do Vault.md`, `01/Setup João.md` (typo `HezionOS`), `01/Setup do Repositório.md` (org `heziom`→`Org-Heziom`), `01/Agente Financeiro — Prompt.md` (datar snapshot de volumes) | Correções pontuais menores (Prioridade Baixa) |

### 4F. 🔀 DEDUPE / DELETAR

- **`01/Escopo Tecnico.md`** (texto bruto, formatação quebrada) é duplicata do **`01/HeziomOS — Complemento Técnico v2 (Conselho).md`** (versão limpa). Como `[[Escopo Tecnico]]` é o nome mais linkado (Arquitetura v3, Setup do Repositório, STORY-001): **renomear o Complemento para "Escopo Tecnico"** e descartar o bruto, preservando o alvo dos links. *(Prioridade Média)*
- **`01/Dashboard do Projeto.md`** — dashboard Dataview que aponta para pasta inexistente (`Projeto/Stories`); retorna vazio há tempos. **DELETAR** (sem link de entrada por wikilink). *(Prioridade Alta — lixo quebrado)*
- **`Sales-Hzm/Dashboard Stories.md`** e **`Sales-Hzm/Guia — Adaptação`** — utilitário Dataview quebrado + guia mais impreciso (já superado pela própria Arquitetura). DELETAR ou arquivar em bloco.
- **`04/DDL Banco de dados Literarius.md`** (2 linhas) e **`04/PUML Tabelas Literarius.md`** (1 linha) — stubs vazios, restos de import, sem wikilink de entrada. **DELETAR** (o schema real do Literarius está em `04/Literarius/Schema Detalhado.md`). *(Prioridade Baixa)*
- **`04/Ferramentas a Substituir/Unnichat — Funcionalidades Mapeadas.md`** — superada pela `Unnichat — Mapeamento Completo v2.md`. MESCLAR na v2 ou arquivar.

### 4I. 📦 ARQUIVAR — snapshots/planos concluídos de Desenvolvimento & Ferramentas

Mover para `_Histórico/` (todos concluídos ou superados; a maioria é órfã, risco baixo):

- `06/Monorepo — Plano de Implementação.md` *(decisões batem com o real; plano cumprido — 0 links de entrada)*
- `06/Avaliação Multi Agent.md` *(snapshot 16/06; achados HIGH já corrigidos — ex.: `crm-deal-monitor` HOJE tem auth; renomear com a data no título; valor forense)*
- `06/Atendimento — Mapeamento de Arquitetura e Modularização.md` *(propunha criar a área "Atendimento" no header — **já implementada** via Épico 9, confirmado em `nav.ts`; preservar o inventário técnico)*
- `06/Consulta de Acessos Meta — Stories 6.25 e 6.29.md` *(snapshot 24/06 superado pela "Meta App Review" de 30/06; **antes de arquivar, preservar os IDs Meta** — WABAs, System Users, IG ID — que a sucessora não repete)*
- `04/Ferramentas a Substituir/Atendimento + Vendas — Mapeamento e Backlog.md` *(é o documento-mãe que gerou o Épico 6, hoje 15/15 Done → histórico)*
- `04/Ferramentas a Substituir/Flowbiz — Análise e Substituição.md` *(Flowbiz desligado ~30/06 → histórico)*

> **Sobre a subpasta `Ferramentas a Substituir/`:** o restante (mapeamentos de Unnichat, Flowbiz, ClickUp, Qive, WABA) é **referência de migração válida → MANTER como histórico** — documenta o que o HeziomOS precisou replicar. Duas notas dessa pasta são ATUAIS/vivas: `Captura de Leads das LPs no HeziomOS` (Story 5.23 cutover InProgress) e `Flowbiz — Landing Pages (Inventário)` (insumo do cutover) e `Meta App Review — Advanced Access` na raiz (ação pendente, a nota mais recente do vault).

### 4G. 🚚 MOVER PARA FORA DO VAULT TÉCNICO (peso/ruído)

- **`Marketing e CRM/Flowbiz_backup-2026-06-05/`** (~130 arquivos, dump de 96k contatos já ingeridos no CRM) — mover para fora (OneDrive), guardando só o README como rastreabilidade.
- **`Bíblia 120 anos - Claude Design/`** e **`TRIBE Criativo Lab/`** — material de marketing/projeto satélite; manter em pasta própria ou mover. *(Prioridade Baixa)*
- **`04/Ferramentas a Substituir/LPs-Deploy-Bundle/` e `LPs-HTML-Export/`** — bundles de HTML estático (artefatos, não notas).

### 4H. ✅ MANTER — verdade viva ou conhecimento de domínio (sem ação)

Resumo dos grandes baldes que **ficam como estão** (a maioria das 218 notas):

- **Conhecimento de domínio do Literarius:** todos os dicionários de `04/Literarius/Banco de Dados/` (25), `Schema Detalhado`, `APIs/` (8), `Mapeamento Completo de Tabelas`, `Views SQL` *(só corrigir a moldura "Pi")*
- **APIs externas:** `04/Tray/` (13 refs), `04/Mandae/Mandaê.md`, `04/Comercial/Amazon Seller & Vendor Central`
- **Referência de negócio:** `01/Mapeamento Completo da Operação Heziom.md`, `01/Complemento Técnico v2`, `02/Premissas e Entendimentos`, `02/Dúvidas para Insights do CEO`
- **Specs de backlog corretamente rotuladas** (`status: especificação/planejado`): `02/Módulos/*` e `02/Integrações/*` financeiros, índices de Comercial/Editorial/Pessoas *(só 3 com escopo revisto — Conciliação, CNAB/OFX, Aprovação — ganham um callout "escopo revisto na Story 10.5")*
- **Registros históricos datados:** `05 - Dados & Fechamentos/` inteira, análises datadas do CEO Dashboard, `STORY-007/008` (docs concluídas), snapshots de estoque
- **Vivas e bem-mantidas:** `06/Diário de Bordo`, `06/TRIVIAIOX — Setup e Agentes`, `04/heziom-api — Referência Técnica`, `04/Meta App Review — Advanced Access` (a mais recente, 01/07), `01/Credenciais.md`

---

## 5. A lacuna a preencher

Nenhuma nota do vault menciona os **Épicos 2–18**. Quem lê só o vault não sabe que migração Flowbiz (E5), atendimento omnichannel (E6/E9/E16/E17) e financeiro (E10) existem. **Sugestão:** criar uma nota única `01/Estado Atual — Espelho dos Épicos.md` que resuma/aponte para `docs/epics/README.md` e `docs/stories/BACKLOG.md` do repo (fonte de verdade viva), em vez de duplicar stories manualmente.

---

## 6. Ordem sugerida de execução

1. **Segurança primeiro** (§3): extrair e rotacionar segredos expostos.
2. **Corrigir as 6 notas que enganam** (§4A) — maior impacto, menor esforço.
3. **Criar `_Histórico/` + notas-ponte** (Sales-Hzm §4C, Espelho dos Épicos §5).
4. **Arquivar os 3 clusters** (§4B Financeiro-standalone, §4C Sales-Hzm, §4D heziom-api).
5. **Atualizar arquitetura/estado** (§4E) e **dedupe/deletar** (§4F).
6. **Mover peso morto para fora** (§4G).
