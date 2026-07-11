---
tipo: espelho
status: vivo
data: 2026-07-11
fonte_de_verdade: docs/epics/README.md e docs/stories/BACKLOG.md no repo heziomos
---

# Estado Atual — Espelho dos Épicos (heziomos)

> **A fonte de verdade viva é o repositório**, não o vault: `docs/epics/README.md` e `docs/stories/BACKLOG.md` no monorepo `heziomos`. Esta nota é um espelho de referência rápida — pode defasar. Quando em dúvida, o repo manda.
>
> Por que isto existe: o vault registrava stories até a fundação do monorepo (STORY-001..016) e **parou**. Os Épicos 2–18 abaixo (o grosso do que está em produção) não têm nota própria no vault — esta nota fecha essa lacuna.

## Épicos (snapshot 2026-07-02)

| ID | Nome | Status |
|----|------|--------|
| E1 | Fundação do Monorepo | ✅ Concluído |
| E2 | Infraestrutura & Deploy | 🔄 Parcial |
| E3 | Design System & Frontend Shell | ✅ Concluído |
| E4 | Auth & Onboarding | ✅ Concluído |
| E5 | Migração Flowbiz → HeziomOS | 🔄 ~90% (80.098 contatos + 166 templates migrados; falta credenciais Meta/Google Ads — Story 5.6) |
| E6 | Atendimento + Vendas Omnichannel | ✅ Onda 3 fechada 24/06 (15/15); ativação operacional Meta em andamento |
| E7 | Literarius BFF & LGPD | 🔄 Em progresso (7.1/7.2 Done) |
| E8 | Resolução de Débito Técnico | 🔄 Reaberto |
| E9 | Atendimento como Módulo Próprio | ✅ Concluído (em prod) |
| E10 | Módulo Financeiro | 🔄 CORRIGIDO 05/07: **10.1–10.5 Done na main/prod** (dashboards, aging, aprovação, DRE, conciliação v1) — a nota anterior sobre "branch não mergeada" estava DEFASADA. Fase 2 planejada: 10.7–10.16 (PR #262) |
| E11 | SDD Process | ✅ Done |
| E12 | reqId em todas as functions | ✅ Done |
| E13 | Quality / Coverage / Splitting | 🔄 Em andamento |
| E14 | Instagram: Comentário → Direct | 📋 Planning (backend pronto, inerte — falta App Review Meta) |
| E15 | Canal E-mail (Outlook/Graph) | 📋 Planning |
| E16 | Painel Operacional de Atendimento | ✅ Em produção (PR #186) |
| E17 | Agentes de Atendimento Configuráveis (RAG, tool-use, catálogo Tray, agente de vendas) | ✅ Concluído, em produção (PR #187) |
| E18 | Envio de mídia no atendimento | 📋 Planning (em desenvolvimento) |
| E19 | Atendimento: correções pós-produção | ✅ Implementado (PR pendente) |
| E20 | Motor de envio de e-mail em escala (40k+) — fila + worker + rampa + circuit breaker | 📋 Planning (criado 02/07 — mapeamento do marketing; hoje campanha corta em 5k silenciosamente) |
| E21 | Construtor visual de e-mails (drag-and-drop) | 📋 Planning (mockup aprovado pelo JG 02/07 — condições: design system + mobile) |
| E22 | Construtor de landing pages | 📋 Planning (fase 2 — após E20/E21) |
| E29 | Comercial ERP — vendas do Literarius (canais, pace vs meta, funil, rankings, devoluções, consignação) | ✅ **MERGEADO 11/07 (PR #364)** — 4 telas Vendas ERP; revisão adversarial aplicada (3 achados). Pós-merge: carga one-shot + backfill feira + E2E prod |
| E30 | Editorial — catálogo, margem, preços c/ vigência, royalties, projetos | ✅ EM PROD 10/07 (PR #359) — 5 telas; resta CA6 30.4 (incorrido, fase 2) + walkthrough JG |
| E31 | Estoque & Operações — giro/ABC, inventário, transferências, snapshot, recebimento | ✅ Analítica EM PROD 10/07 (#362/#363); **Fase B (alertas + reabastecimento) MERGEADA 11/07 (PR #364)** |
| E32 | Liderança / Cockpit Executivo — reconstrói CEO+BI consolidando os módulos | 📋 Draft (PR #262, 05/07) |
| E33 | Acessos granulares do coordenador (por módulo) — admin define quais módulos cada coordenador acessa, com gestão dentro deles | 📋 Draft (spec pronta, PR #291, 06/07) — ver [[Epic 33 — Acessos Granulares do Coordenador]] |
| E38 | Integração Tray Completa (loja de teste → produção-ready) — fecha go-live seguro + camada estratégica | 📋 Draft (spec + 11 stories no vault, 08/07) — ver [[_Epic 37 — Integração Tray Completa (spec)]]. ✅ Nº CONFIRMADO **E38** no repo (09/07; E37 do repo = Operação de Vendas). Stories 38.1–38.11 em docs/stories. |
| E40 | Estúdio de Conteúdo IA (porte do Jimmy Studio) — Marca (voz: Editora+autores) × Lançamento (público por livro) × posts por intenção + imagem plugável + calendário + pontes (Helena/e-mail/pauta/LP) | 🚧 EM IMPLEMENTAÇÃO 11/07 — núcleo do motor PRONTO na branch feat/40-estudio-conteudo (7 commits, push de backup, SEM PR): 40.2 banco 38/38 ✔, ADR 0024 (Anthropic nativo + SSE), 40.5 edge+motor com goldens de paridade, 40.6 prompt editorial + brand-facts (Helena: paridade byte a byte), 40.7 guardrails recência+anti-mesmice, 42.1 Ficha Mestre, revisão adversarial 44 agentes → 18 achados corrigidos (5f96a1e). 388 testes deno + 238 vitest verdes. Bloqueios: chave de IA (baterias vivas) + mockups (telas) — ver [[Epic 40 — Estúdio de Conteúdo IA]] |
| E42 | Ficha Mestre do Livro (Book Info) — cadastro rico por título em `editorial.livros_ficha` (ISBN, sinopses, público do livro); fonte única p/ Estúdio, Amazon Vendor, Tray, LPs | 🚧 42.1 IMPLEMENTADA 11/07 (migration + RLS + bateria 5/5 + types, na branch do E40; achado da revisão: GRANT USAGE do schema corrigido). 42.2 aguarda mockup; 42.3 depende da 40.4 — ver [[Epic 42 — Ficha Mestre do Livro]] |

> Nota: a tabela acima é o snapshot de 02/07 e NÃO reflete os épicos abertos depois no repo (E35 Simulador de Frete, E36 Vindi Links de Pagamento). O E37 é o próximo trabalho registrado no vault.

## De onde vieram as stories antigas do vault

- `STORY-001..009` (fase "Financeiro standalone / Raspberry Pi") → arquivadas em `_Histórico/Stories/`. Superadas.
- `STORY-010..012` → eram do **outro repo** `heziom-api` (Tray↔Meta CAPI) → movidas para `_Histórico/heziom-api/`.
- `STORY-013..016` (fundação do monorepo) = **Épico 1**, concluído → arquivadas em `_Histórico/Stories/`.
- `Sales-Hzm/STORY-015..024` = viraram os Épicos 5/6/16/17 → ver `_Histórico/Sales-Hzm/`.

## Atualização 2026-07-05 — Cobertura total + reorganização em 5 módulos

- **`literarius-sync` atingiu COBERTURA TOTAL do ERP** (59 tabelas úteis das 188; 16 novas em
  05/07 com contagem fonte×espelho exata, incl. preços c/ vigência, inventários, transferências,
  NFS-e, numeração de NF, projetos editoriais). Motor declarativo: adicionar tabela = 1 entrada.
- **Agendador próprio** (Task Scheduler via pacote fechado) instalado na VMAPP01 na conta
  joao.novais; falta registrar as 2 tarefas (senha admin) e DESATIVAR o job antigo no Tactical.
- **Reorganização do consumo em 5 módulos** (diretriz JG): ver
  [[HeziomOS — Módulos Literarius (Plano 2026-07-05)]] — Financeiro (fiscal+contábil+financeiro),
  Comercial (+vendas ERP), Editorial (novo), Estoque (novo), Liderança (camada executiva).
  Epics E29–E32 + Epic 10 Fase 2 (10.7–10.16) com 28 stories profundas no PR #262.
- **Correção desta nota:** o status anterior do E10 ("10.2–10.6 em branch não mergeada") estava
  defasado — 10.1–10.5 estão Done na main/produção desde o cutover de 02/07.

## Atualização 2026-07-06 — Papel coordenador e acessos granulares (E33)

- **Papel `coordenador`** criado e em produção (stories 23.8–23.10, PRs #288/#290): vê todas as
  conversas, transfere atendimento, exclui tags, e o admin escolhe por pessoa quais **abas de
  Configurações de Atendimento** ele acessa. Hotfix da transferência incluído (WITH CHECK).
- **Epic 33 aberto** ([[Epic 33 — Acessos Granulares do Coordenador]], PR #291): admin define,
  por coordenador, quais **módulos do sistema** (Atendimento, Comercial, Logística, Marketing,
  Relatórios, Liderança, Financeiro) a pessoa acessa, com **acesso de gestão** dentro deles.
  Ponto-chave: Financeiro, Liderança/BI e gestão de Campanhas travam no backend (exigem gerência),
  então a liberação desce ao backend controlada pelo módulo liberado à pessoa (`can_manage_area`),
  nunca como passe geral. Stories 33.1–33.4 (dados+helpers → backend por área → frontend+gate →
  security gate). Aguardando implementação.

## Atualização 2026-07-08 — Auditoria Tray + Epic 37 (integração completa, produção-ready)

- **Auditoria exaustiva da integração Tray** (25 docs do vault × API oficial): ver
  [[Tray — Auditoria de Capacidades vs Produção]]. Conclusão: o que está no ar (ponte CAPI +
  sync CRM de leitura) é uma fatia do que a Tray oferece. Achou **6 endpoints errados** no vault
  (`/abandoned-carts`→`/carts`; `/coupons`→`/discount_coupons`; NF-e→`POST /orders/:id/invoices`;
  status/rastreio→`status_id`+`tracking_number`; B2B existe via `/customers/profiles`+`/price-lists`;
  webhooks só 9 escopos, sem transação/NF/carrinho → polling) e **1 risco crítico**: refresh token
  de uso único disputado entre `heziom-api` e HeziomOS na mesma loja. As 5 notas de origem já foram
  corrigidas com banner "⚠️ CORRIGIDO 08/07".
- **Epic 37 aberto (nº provisório)** — [[_Epic 37 — Integração Tray Completa (spec)]] + 11 stories
  (37.1–37.11) em `Stories/Epic 37 — Integração Tray Completa/`. Fase 0 (parametrização multi-loja,
  dono do refresh, correção de endpoints, webhook+polling+evidências de homologação) → Fase 2
  (conciliação financeira, carrinho abandonado via `/carts`, NF-e) → Fase 3 (preço B2B, sync de
  catálogo, estoque+Multi-CD, newsletter+scripts). Tudo validado na loja de teste **1501119** e
  parametrizado para o cutover à loja de produção **1345958** ser só config. Homologação Tray até
  **13/08/2026**.

## Atualização 2026-07-11 — E30 em prod, E31 Fase B + E29 implementados (PR #364)

- **E30 Editorial: EM PRODUÇÃO 10/07** (PR #359, épico inteiro em 1 dia): área Editorial com 5
  telas (catálogo+ficha, margem com limiar 2×, preços/desconto por canal, royalties manager+,
  projetos). Espelho `produtos_estoque` 8.381/8.381 exato. Resta: CA6 da 30.4 (incorrido, fase
  2/VPN) + walkthrough do JG.
- **E31 Estoque: analítica (5 telas) EM PRODUÇÃO 10/07** (PRs #362/#363). Achado: o "78% não
  gira" era por TÍTULO — em R$ parado são 15,4%. **Fase B implementada 10–11/07**: motor de
  alertas (latch + digest in-app/Teams + cron diário) e reabastecimento (sugestão por
  cobertura-alvo) — no PR #364.
- **E29 Comercial ERP: implementado 11/07** — 4 telas novas no módulo **Vendas ERP** (manager+):
  Vendas, Funil, Ranking, Consignação. Achados: consignação `C`=COMPRA (custódia recebida,
  R$ 1,21M — DEVEMOS) × `V`=VENDA (concedida, R$ 449k) — o "R$ 1,6M com clientes" somava os
  dois; R$ 253k concedidos há +90d sem acerto; 99,1% dos clientes sem tipo; NF tipo 6
  (devolução) estava FORA do espelho (spec corrigida no sync). Fixes pós-implementação já
  commitados: âncora das séries em `max(data_emissao)` (não `now()`) e corte de janela em
  meia-noite BRT (eliminou mês-fantasma na borda; commits 8fa2a67+727032a, validados em PG 17
  isolado com dados reais).
- **PRs abertos para merge conjunto (autorizado pelo JG)**: heziomos **#364** (E31 Fase B + E29)
  e literarius-sync **#3** (specs novas, incl. vwNotaFiscalVendaDevolucao).
- **Sync na VMAPP01: agendador próprio ATIVO 11/07** — pacote instalado com 3 tarefas
  (HeziomOS-Sync 15min, HeziomOS-Reconcile 03:15, HeziomOS-Snapshot 03:45), ciclos com 0 erros.
  A task do Tactical (`taskrunner -p 60`) é SEMANAL (segundas 08:00) e não conflita no dia a dia;
  pendente desativar (local + pedir exclusão à Intelinove) antes de segunda 13/07 08:00.
- **Pendências para a próxima sessão** (JG encerrou esta): revisão adversarial completa do
  E29 + Fase B (não rodou — limite de gastos da org; relançar do zero); pós-merge do #364:
  gerar pacote do sync atualizado c/ specs E29 + carga one-shot das tabelas novas + backfill
  `exposicao_feira` (726 NFs, CSV em `e29data/nf_feira_backfill.csv` no repo) + E2E prod nas
  6 telas novas + marcar stories Done.

## Atualização 2026-07-11 (tarde) — #364 MERGEADO + Estúdio de Conteúdo (E40) e Ficha Mestre (E42) planejados

- **PR #364 MERGEADO na `main`** (deploy automático de migrations + edges): E29 Comercial ERP
  (4 telas Vendas ERP) + E31 Fase B (alertas de cobertura + reabastecimento). A revisão
  adversarial do E29 (que não tinha rodado) **rodou nesta sessão** — 41 agentes, 3 achados
  confirmados e corrigidos antes do merge: (1) RLS de `crm.metas_comerciais` era FOR ALL +
  GRANT ALL (manager podia dar DELETE via PostgREST) → FOR SELECT; (2) faltava índice
  `idx_nf_exposicao_feira` (seq scan O(feiras×notas), 50ms→5,5ms); (3) `dataBr` do
  RankingComercial mostrava o dia anterior (day-shift UTC→BRT). CI verde, 228 testes.
  - **PENDENTE pós-merge (JG):** carga one-shot das tabelas novas via sync (VPN) + backfill
    `exposicao_feira` (726 NFs) + E2E prod nas telas novas + marcar stories Done. Smoke pós-deploy.
- **E40 Estúdio de Conteúdo IA + E42 Ficha Mestre do Livro planejados** (docs mergeados, PR #365):
  porte do motor de conteúdo do **Jimmy Studio** para a área Marketing, adaptado à Editora
  (Marca=voz Editora+autores × Lançamento=público por livro × Ficha Mestre=cadastro perene).
  Validado por cruzamento multi-agente com TODOS os módulos do OS + crítica adversarial (16
  fixes) + dossiê de porte linha-a-linha ([[Estúdio de Conteúdo — Dossiê de Porte (Jimmy)]],
  1.748 linhas). Snapshot das flags do Jimmy: todas ON (confirmado via Management API).
  Ver [[Epic 40 — Estúdio de Conteúdo IA]] e [[Epic 42 — Ficha Mestre do Livro]].
  - **PENDENTE JG p/ implementar:** mockups das telas + sessão de DNA da Editora + fichas de
    2-3 livros + rotacionar os 2 PATs `sbp_` do Jimmy expostos no chat. E41 (Jornada CTWA:
    anúncio→Helena→conversão) é a fase 2, reusa ~70% do que já existe.
- **Ordem de implementação:** #364 já mergeado (piso de timestamp das migrations do E40 fica
  fixo em > 20260727110000); E42 (42.1/42.2) antes da 40.4; caminho crítico p/ o 1º post:
  40.1 (spike provider/streaming — CA1 flags já feito) ‖ 40.2 (migração `crm.content_*`) →
  40.5 → 40.6 → 40.7 → 40.8.
