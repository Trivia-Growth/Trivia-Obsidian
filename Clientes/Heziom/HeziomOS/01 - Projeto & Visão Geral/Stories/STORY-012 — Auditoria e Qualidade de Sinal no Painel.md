---
id: STORY-012
titulo: "Auditoria e Qualidade de Sinal no Painel (Tray ↔ Meta)"
fase: 1
modulo: heziom-api / painel
status: ready
prioridade: alta
agente_responsavel: "@dev (Dex)"
depends_on: STORY-011
criado: 2026-06-01
atualizado: 2026-06-01
---

# STORY-012 — Auditoria e Qualidade de Sinal no Painel

## Status
`Review` — DDL aplicado (Management API, colunas `match_keys`/`currency` confirmadas), código implementado e validado localmente (node --check + teste de render do painel), docs no mesmo commit. **Aguardando:** push + deploy Netlify + confirmação visual no `/painel` com pedido real.

> Fluxo TRIVIAIOX: `@sm` (story) → `@dev` (Diff Plan + implementação) → `@qa` (gate) → push.
> Story mora no vault (padrão da STORY-010/011).

---

## Contexto e origem

Veio da leitura do relatório **"O Novo Modus Operandi do Meta Ads: Algoritmos, Automação e Melhores Práticas para 2026"** (25/05/2026) cruzado com o pedido do JG de tornar a tabela de Conciliação clicável, buscável, filtrável e ordenável.

Tese do documento aplicada ao nosso caso: a Meta entrega anúncios via IA (Andromeda, GEM, Lattice) e essa IA depende do **sinal de conversão server-side (CAPI)**. Evento que não chega, chega sem dados de identificação (match keys), ou chega duplicado, piora o casamento (Event Match Quality), a atribuição e a entrega. O checklist do doc para e-commerce é explícito: **Pixel + CAPI + dedup de event_id + dados limpos**. O Painel de Saúde é o vigia desse sinal no lado server-side.

O painel base (STORY-011) já cobre token, webhooks, compras rastreadas, aprovados sem rastreio, valor, latência e dedup. Faltam os indicadores de **qualidade do sinal** e as ferramentas de **auditoria por pedido**.

---

## Story

**Como** operação da Heziom (não-técnica),
**eu quero** poder clicar em cada pedido da Conciliação e ver tudo que foi sincronizado (incluindo a qualidade do sinal enviado ao Meta), além de buscar, filtrar e ordenar a tabela, e ser avisado quando a integração ficar muda ou um evento atrasar,
**para que** eu consiga auditar caso a caso "esse pedido foi rastreado com sinal bom?" e perceber falhas de coleta antes que prejudiquem a entrega das campanhas.

---

## Critérios de Aceite

### Onda 1 — Auditoria + qualidade de sinal
1. **CA1** — A tabela de Conciliação tem **busca** (por nº do pedido e status) que filtra ao vivo.
2. **CA2** — A tabela tem **filtro por resultado** (Todos / Rastreados / Falhas / Não dispara).
3. **CA3** — As colunas são **ordenáveis** ao clicar no cabeçalho (clique alterna asc/desc).
4. **CA4** — Clicar numa linha abre **detalhe do pedido** com: status na Tray, valor e moeda, webhook recebido em, CAPI disparado em, latência, resultado, erro (se houver), `event_id` (`tray_purchase_NN`), última atualização e o **índice de qualidade do sinal**.
5. **CA5** — O índice de qualidade do sinal mostra **quais dados de match foram enviados** ao Meta (e-mail, telefone, nome, sobrenome, CEP, cidade, estado, país) como presente/ausente, mais um percentual de completude. O navegador recebe **apenas a presença (booleano)**, nunca o hash em si.
6. **CA6** — `webhooks-tray.js` grava, em `tray_event_metrics`, o **hash SHA-256** de cada match key (o mesmo que já calcula hoje para enviar ao Meta) e a **moeda** do evento. Não grava PII em texto puro e não altera o comportamento atual do CAPI. Decisão JG (01/06): hash, não booleano, para permitir reexportação futura à Meta.
7. **CA7** — Migração Supabase entregue como SQL versionado (ALTER TABLE). **JG executa o DDL; o @dev não aplica.**

### Onda 2 — Saúde proativa
8. **CA8** — O painel exibe **alerta no topo** quando ficou mais de N horas sem nenhum webhook (sinal de integração muda). Limiar configurável no código (padrão sugerido: 6h).
9. **CA9** — Pedidos cujo evento demorou demais a chegar ao Meta são **marcados como "atrasado"** na tabela e no detalhe (limiar padrão sugerido: 300s).

### Transversais
10. **CA10** — Segurança mantida: nenhum segredo/PII vai ao navegador; `/api/health-stats` continua fail-closed; o detalhe usa só agregados não-sensíveis.
11. **CA11** — Documentação atualizada (`specs/technical/API_SPECIFICATION.md`, `architecture.md`) no mesmo commit.
12. **CA12** — Degrada bem: sem JS, a tabela continua renderizada server-side (busca/filtro/ordenação/detalhe são realce progressivo).

---

## Tasks / Subtasks

- [x] **T1 — Conciliação interativa (cliente)** *(AC: 1,2,3,4,12)*
  - [x] T1.1 — `health-panel.js`: embutir os dados da tabela como JSON escapado (anti `</script>`), com `data-*` nas linhas.
  - [x] T1.2 — Toolbar: input de busca + select de filtro; cabeçalho ordenável com indicador.
  - [x] T1.3 — Modal de detalhe (abre ao clicar na linha; fecha por X / overlay / Esc).
  - [x] T1.4 — JS puro: busca, filtro, ordenação (DOM), e popular o modal a partir do JSON por `order_id`.
- [x] **T2 — Qualidade de sinal (servidor + schema)** *(AC: 4,5,6,7,10)*
  - [x] T2.1 — DDL `ALTER TABLE tray_event_metrics`: `match_keys jsonb` (hashes SHA-256 por chave), `currency text`. JG roda.
  - [x] T2.2 — `webhooks-tray.js`: em `sendCAPIEvent`, persistir o **hash SHA-256** já calculado de cada match key (e a moeda) no `recordMetric`. Nunca PII em texto puro.
  - [x] T2.3 — `health-stats.js`: ler `match_keys`/`currency`/`error`; **derivar presença (booleano) e `match_pct` a partir dos hashes, sem nunca devolver o hash ao cliente**; expandir `conciliation` (campos extras + limite 200); derivar `event_id`.
- [x] **T3 — Saúde proativa (Onda 2)** *(AC: 8,9)*
  - [x] T3.1 — `health-stats.js`: calcular `last_webhook_at` (max `created_at`) e expor; marcar `late` por pedido quando `latency_s > LATE_THRESHOLD`.
  - [x] T3.2 — `health-panel.js`: banner de "integração muda há X" quando passar do limiar; tag "atrasado" na tabela e no detalhe.
- [x] **T4 — Documentação** *(AC: 11)*
  - [x] T4.1 — `API_SPECIFICATION.md`: novos campos do `conciliation`, `last_webhook_at`, `match_keys`/`currency` na tabela.
  - [x] T4.2 — `architecture.md`: ADR-007 (qualidade de sinal como insumo da IA da Meta; **match keys persistidas como hash SHA-256** — privacy by design, reexportável; painel só vê presença; proxy de EMQ via completude; EMQ real fica para fase 3).

---

## Dev Notes / Diff Plan

> ⚠️ Diff Plan obrigatório antes de implementar. Mudanças mínimas. Docs no mesmo commit. `git pull --rebase` antes do push. Zero dependências (só `crypto` + `fetch`).

### Arquivos no alvo
- `netlify/functions/webhooks-tray.js` — grava presença das match keys + moeda (sem PII).
- `netlify/functions/health-stats.js` — select e payload expandidos; `last_webhook_at`; flag `late`; `match_pct`; `event_id` derivado.
- `netlify/functions/health-panel.js` — toolbar, ordenação, modal, banner de alerta, tag "atrasado", JS + CSS.
- Docs: `specs/technical/API_SPECIFICATION.md`, `architecture.md`.

### Decisões de design (servidor)
- **event_id** é determinístico (`tray_purchase_{order_id}`) — derivado no painel, sem coluna nova.
- **match_keys**: `jsonb` com o **hash SHA-256** por chave (`{email:"<sha256>", phone:"<sha256>", ...}`). Decisão JG (01/06): hash, não booleano, para permitir reexportação futura à Meta (CAPI batch e Públicos Personalizados aceitam hash). O webhook **já gera** esses hashes hoje para o CAPI; a mudança é só persistir em vez de descartar. **Nunca** PII em texto puro.
- **Derivação para o painel**: `health-stats.js` calcula presença (chave existe e não-nula → `true`) e `match_pct` a partir dos hashes, e devolve **só os booleanos** ao cliente. O hash **nunca** sai do servidor pela rota do painel; fica no banco apenas para a exportação futura (server-side, protegida).
- **currency**: `text` (provável sempre `BRL`); exibido no detalhe.
- **last_webhook_at**: `max(created_at)` de `tray_webhook_log`; alimenta o alerta da Onda 2.
- **late**: derivado de `latency_s > 300` (sem coluna nova). Limiar constante no código.
- Conciliação passa de 12 → **200** pedidos recentes (continua leve, sem PII).

### Segurança (inegociável)
O detalhe e a busca operam **só sobre agregados não-sensíveis**. `match_keys` guarda hash SHA-256 (dado pseudonimizado), nunca PII em texto puro, e **o hash não trafega para o navegador** (o painel recebe só presença booleana). Nada de `access_token`, `refresh_token`, `raw_payload` ou PII legível vai ao cliente. `/api/health-stats` segue fail-closed (500 sem `PANEL_STATS_SECRET`, 401 sem header).

### Restrições do projeto (herança STORY-011)
- Tabelas Supabase geridas manualmente — @dev entrega SQL, **JG roda o DDL**.
- Homologação (loja de teste) até **13/08/2026**.
- TRIVIAIOX `frameworkProtection`: não editar `.triviaiox-core/core/**`.
- Memória: nunca usar "Claude" em dados de teste visíveis a terceiros; usar nomes neutros.

### Limite de escopo (honesto)
O painel vigia o lado server-side (Tray até o Purchase no CAPI). **Não** substitui o Events Manager para EMQ real, **não** enxerga eventos de Pixel no navegador (ViewContent, AddToCart, InitiateCheckout) e **não** faz triangulação Meta + GA4 + Literárius. O "índice de qualidade do sinal" é um **proxy local** de EMQ baseado na completude das match keys. EMQ real via Graph API = fase 3 (fora desta story).

### Exportação para a Meta (fase futura, fora desta story)
Decisão JG (01/06): **deixar o schema pronto agora, implementar a exportação depois.** Esta story só persiste os hashes em `match_keys`. A função de exportar (endpoint protegido server-side que gera o arquivo de hashes para CAPI batch ou upload de Público Personalizado) fica para uma STORY futura (candidata: STORY-013). Os hashes nunca passam pela rota do painel; só seriam lidos por essa função de export, server-side e autenticada.

---

## Migração Supabase (projeto `eqsjvacbhrezlgqpwipv`)

> ⏳ A aplicar por JG (Management API ou SQL editor). RLS já está ligado na tabela.

```sql
alter table tray_event_metrics
  add column if not exists match_keys jsonb,   -- hash SHA-256 por chave (sem PII em texto): {email:"<sha256>", phone:"<sha256>", ...}
  add column if not exists currency   text;     -- moeda do evento Purchase (ex.: 'BRL')
```

> `match_keys` guarda **hash**, não texto puro. O painel deriva presença/percentual a partir dele e nunca o expõe ao navegador. Os hashes existem no banco só para reexportação futura à Meta (fase futura).

---

## Compliance / LGPD

Decisão de guardar dados de match no painel (JG, 01/06). Postura adotada:

- **Base legal:** execução do contrato de compra + legítimo interesse para mensuração e marketing. Validar com jurídico/DPO da Heziom.
- **Minimização e privacy by design:** guardar **só hash SHA-256**, nunca PII em texto puro. Texto puro permanece no ERP/Literárius e na Tray (fontes de verdade). O painel não vira segundo banco de clientes legível.
- **Transparência:** a política de privacidade da loja deve declarar o compartilhamento com a Meta para publicidade/mensuração. Pendência a confirmar com JG/jurídico.
- **Acesso:** hashes acessíveis só via `service_role` server-side; nunca trafegam ao navegador.
- **Retenção:** definir prazo de descarte dos hashes. Sugestão inicial: 12 meses (cobre reexportação de Público Personalizado e análise de LTV), revisável com jurídico. Item de implementação futura (rotina de expurgo).
- **Direito de eliminação:** pedido de exclusão de um titular → localizar pelo hash do e-mail (recalculável) e apagar. Registrar procedimento quando a exportação for implementada.

> Ressalva: hash de e-mail/telefone é dado pessoal **pseudonimizado** (pode ser testado contra valores conhecidos), então as regras de transparência e descarte continuam valendo, com risco muito menor que texto puro. Não é parecer jurídico; é a postura técnica recomendada.

## Mockup / Design

- A validar (design-first): toolbar de busca/filtro, cabeçalho ordenável, modal de detalhe com índice de qualidade do sinal, banner de integração muda, tag "atrasado".
- Padrão visual: o mesmo da LP `LPplanobomba` / Painel STORY-011 (tema claro/escuro).

---

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-06-01 | 0.1 | Story criada a partir do relatório Meta Ads 2026 + pedido do JG. Escopo Onda 1 + Onda 2 aprovado. Aguardando validação de mockup. | @sm |
| 2026-06-01 | 0.2 | Decisão JG: match keys gravadas como **hash SHA-256** (não booleano), schema pronto para reexportação à Meta (export é fase futura). Seção Compliance/LGPD adicionada. CA5/CA6, T2, schema e ADR-007 atualizados. | @sm |
| 2026-06-01 | 0.3 | DDL aplicado (`match_keys`, `currency`). Implementadas as 4 frentes: webhook persiste hash + moeda; health-stats deriva presença/`match_pct` (hash não sai do servidor), `last_webhook_at`, flag `late`, conciliação 200; painel com busca/filtro/ordenação/modal/banner/tag atrasado. Docs (ADR-007, API_SPECIFICATION, PROJECT_REQUIREMENTS). Validado por node --check + teste de render (13/13 checks, hash não vaza). | @dev |
