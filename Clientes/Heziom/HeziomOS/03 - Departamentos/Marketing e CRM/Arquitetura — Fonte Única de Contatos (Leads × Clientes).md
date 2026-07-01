---
tags: [heziom, crm, arquitetura, contatos, fonte-unica, leads, decisao]
status: implementado
criado: 2026-06-18
atualizado: 2026-07-01
autor: JG Novais + Claude (Trivia)
relacionado: [HeziomOS — Arquitetura v3, Flowbiz — Funcionalidades Mapeadas, Tray - Clientes, ADR-0015]
adr-repo: docs/adr/0015-arquitetura-contatos-fonte-unica.md (Org-Heziom/heziomos)
---

# Arquitetura — Fonte Única de Contatos (Leads × Clientes)

> ✅ **ATUALIZADO 2026-07-01 — implementado.** Esta arquitetura foi aprovada e está em produção (Épico 5). As stories listadas abaixo como "abertas" já foram concluídas: **5.8** (`tray_mirror` — migration 0018), **5.10** (`contact_identities` — migration 0015), **5.11** (views higienizadas — migration 0017). A regra estrita lead×cliente também está em prod (migration `..._crm_lifecycle_strict_purchase.sql`). Ressalva: a Tray conectada é a **loja de teste** (não produção).

> Decisão de como a tabela de contatos do CRM (`crm.contacts`) serve o **sistema inteiro** (comercial, logística, marketing, financeiro), distingue **lead × cliente** e **preserva a riqueza de cada origem**. Espelho da [[ADR-0015]] no repo. Alinhado à [[HeziomOS — Arquitetura v3]].

## Estado atual (18/06/2026)
Consolidados em `crm.contacts`: **111.120 contatos** = 80.086 Flowbiz + 30.917 Literarius (B2B) + 117 Tray. Compras: 25.403 do Literarius (R$ 5,13M) + 332 Tray. Pipeline: agente Lucas (SQL) → `lit_mirror_*` → cron diário → `crm.contacts`. App lê via `crmSupabase`. **Decisão JG: `crm.contacts` é a fonte única do sistema (Caminho A).**

## Lacunas encontradas (auditoria)
1. **Lead × cliente não distinguidos** — `status='lead'` para os 111k; só dá pra inferir por `lifetime_value>0` (~26k clientes, ~85k só lead). Falta `lifecycle_stage`.
2. **Canal/origem raso** — `source_channel` guarda *o sistema* (flowbiz/tray/literarius), não *o canal de aquisição* (newsletter, LP, anúncio, B2B/offline) nem a campanha. `source` é redundante.
3. **Riqueza de cada origem achatada** numa linha só (ver tabela abaixo).
4. **`type` B2B/B2C errado** — 15.062 Flowbiz marcados B2B indevidamente (deve derivar de PF=CPF / PJ=CNPJ).
5. **`tray_mirror` não construído** — sync da Tray escreve direto no CRM, pulando a camada bruta → opt-in/carrinho da Tray não são guardados.
6. **Engajamento Flowbiz não capturado** — só no backup OneDrive; Flowbiz **morre 26/06**.

## ⚠️ Correção (18/06): Literarius NÃO é "fonte B2B"
O Literarius é o **ERP / sistema de registro de todas as vendas**, predominantemente **B2C/varejo**: 30.708 contatos CPF (PF) vs só 539 CNPJ (PJ). **94% dos pedidos têm `SiteIdPedido`** = vieram da **loja Tray (D2C)**. Ou seja, a maioria dos "clientes Literarius" são compradores individuais da loja online, registrados no ERP. B2B (igrejas, livrarias, distribuidoras) é uma fatia pequena. O `acquisition_channel` das identidades foi corrigido: `varejo` (46.993) vs `b2b` (667).

## Riqueza única por origem (o ponto central do JG)
| Dado | Tray | Literarius | Flowbiz (morrendo) |
|---|---|---|---|
| Opt-in newsletter | ✅ | ❌ | ✅ |
| Carrinho abandonado / comportamento | ✅ | ❌ | parcial |
| Endereços, data cadastro D2C | ✅ | ✅ end. | ❌ |
| Classificação B2B (7 tipos), crédito, vendedor | ❌ | ✅ | ❌ |
| Histórico pedidos offline+online | parcial | ✅ | ❌ |
| **Engajamento e-mail (abre/clique, 1,3M envios)** | ❌ | ❌ | ✅ **só aqui** |
| Listas de interesse (40) | ❌ | ❌ | ✅ → tags |

## Arquitetura-alvo: 3 camadas
```
BRONZE (espelho bruto por origem, fidelidade total, RLS restrito)
  lit_mirror_*   ← agente Deno (SQL Server)         [EXISTE]
  tray_mirror.*  ← webhooks Tray + reconcile (R3)    [A CONSTRUIR]
  flowbiz        ← carga única do backup antes 26/06 [PARCIAL]
        ▼ transform por origem (dedup + merge, agendado)
PRATA (canônico — 1 pessoa)
  crm.contacts            — ficha única (fonte do sistema)
  crm.contact_identities  — 1→N: pacote de cada origem [NOVO, peça que falta]
  crm.crm_contact_purchases
        ▼ views (sempre frescas)
OURO (consumo higienizado — sem PII sensível/IA, filtra LGPD)
  views mascaradas → comercial, logística, marketing, financeiro
```
**Correção de premissa:** schema `pessoas` é para **gente interna** (funcionários/comissões), NÃO clientes. Higienizado = **views mascaradas** (já previstas na Arquitetura v3).

### `crm.contact_identities` (a peça que falta)
1 contato → N origens; guarda o pacote de cada sistema sem achatar: `contact_id, source_system, external_id, acquisition_channel, acquisition_campaign/utm(jsonb), first_seen_at, raw(jsonb)`.

## Plano de ação
**Baixo risco / imediato (não dependem do Lucas):**
1. ✅ **FEITO (18/06)** `lifecycle_stage` (`lead`/`customer`/`churned`) por trigger — migration 0013. Resultado: ~26k clientes vs ~85k leads.
2. ✅ **FEITO (18/06)** `type` PF/PJ por documento (CPF=B2C, CNPJ=B2B) — corrigiu 45.439 B2C / 657 B2B; reverteu os 15k Flowbiz + ~30k Literarius marcados B2B errado.

### ⚠️ Ajuste pós-revisão do JG (cliente Literarius = customer)
A primeira contagem mostrava "Literarius: 22.639 leads" — **errado**. Dois motivos:
- **`source_channel` é só a 1ª origem** → 13.083 compradores Literarius estavam arquivados sob `flowbiz` (entraram primeiro por lá). Relatório por origem engana → a tabela `contact_identities` (item 4) é o fix real.
- **O Literarius só tem pedidos 2025+** porque a Heziom migrou pra ele em 2025; pedidos anteriores ficam em outro sistema que **não será integrado** (decisão JG). Logo, faltar pedido no espelho NÃO significa que não é cliente.
- **Regra adotada:** parceiro `is_cliente=true` no Literarius = **customer** (a classificação do ERP é a verdade). Migration 0014 reclassificou. **Resultado final: 50.255 clientes / 60.865 leads** (Literarius praticamente 100% customer, como o JG apontou).

**Estrutural / stories abertas (confirmado c/ Lucas 18/06):**
3. ⏰ **Story 5.7** — Capturar engajamento Flowbiz antes de 26/06 (CRÍTICA, prazo).
4. **Story 5.8** — Espelho bruto da Tray (`tray_mirror`) + rerotear sync (opt-in/carrinho).
5. **Story 5.9** — Ampliar histórico de pedidos Literarius (2025→hoje; pré-2025 fora de escopo — vive no legado, não será integrado).

6. **Story 5.10** — `crm.contact_identities` (resolve de vez o viés de `source_channel` — multi-origem por pessoa).
7. **Story 5.11** — Camada Ouro: views mascaradas + filtro LGPD.

**Todas as stories abertas (18/06):** 5.7 (Flowbiz⏰), 5.8 (Tray mirror), 5.9 (histórico Literarius), 5.10 (identidades), 5.11 (views higienizadas) — épico 5 no PR #26.

## Decisões a confirmar (JG + Lucas)
- Aprovar modelo 3 camadas + `contact_identities`.
- Higienizado = VIEW (recomendado) vs materializada.
- Prioridade do engajamento Flowbiz (prazo 26/06).
- Construir `tray_mirror` agora.

## Referências
- [[HeziomOS — Arquitetura v3]] (schemas espelho/domínio/governança)
- [[Flowbiz — Funcionalidades Mapeadas]] · [[Flowbiz — Automações e Fluxos Mapeados]]
- [[Tray - Clientes]] · [[Tray - Carrinho Abandonado e Scripts]]
- ADR no repo: `docs/adr/0015-arquitetura-contatos-fonte-unica.md`
