---
id: STORY-021
titulo: "Integração Literarius (parceiros B2B 47k + pedidos → CRM)"
fase: 2
modulo: "integrações"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-021 — Integração Literarius (parceiros B2B + pedidos → CRM)

## Contexto

> O Customer cross-channel precisa cruzar **3 fontes** por CPF/CNPJ: Tray (D2C — STORY-017), Flowbiz (histórico — STORY-016) e **Literarius (B2B)**. O Literarius é o ERP da Heziom e a fonte dos **~47.000 parceiros B2B** (igrejas, livrarias, distribuidoras) e do **histórico de pedidos offline**. Sem ele, o "unificado" fica só com o D2C.

**Acesso:** REST API (`http://200.187.66.71:1983/LiterariusAPI.dll/datasnap/rest`, HTTP Basic + header `USER_LITERARIUS`) **e** SQL Server read-only (`192.168.18.10:1433`, user `acessoExterno`) via sync Deno na rede Heziom. Esta story é **read-only** (criar pedido B2B via `PUT /PedidoVenda` fica no epic Comercial 2.3).

## Spec de Referência
- [[Mapa Completo de APIs e Capacidades]] (Literarius: TParceiroController, TPedidoVendaController, TipoCliente)
- [[Estudo de APIs — Capacidades e Gaps]] (gaps: sem paginação; datas null = 1899/1969; 93,7% sem tipo)
- depende de [[STORY-015 — Customer cross-channel (estender contacts)|STORY-015]]

## Critérios de Aceite

- [ ] CA1 — Conector lê **parceiros** (`TParceiroController` / SQL `Parceiro`) e faz upsert em `contacts` deduplicando por `cpf_cnpj` (= `Parceiro.CnpjCpf`); `source_channel='literarius'`, `type='B2B'`.
- [ ] CA2 — Mapear `TipoCliente` (7 tipos: Igrejas, Livrarias, Distribuidoras, ONGs, PF, Funcionários, Empresas) para `contacts.type`/`segment`. Tratar os **93,7% sem tipo** (deixar null, não inventar).
- [ ] CA3 — **Dedup cross-source:** um parceiro que já existe (vindo de Tray/Flowbiz pelo mesmo CPF/CNPJ) é **atualizado**, não duplicado — consolida o perfil único.
- [ ] CA4 — Conector lê **pedidos B2B** (`PedidoVenda`) → `crm_contact_purchases` (source='literarius', `source_order_id`=`PedidoVenda.Id`, dedup idempotente).
- [ ] CA5 — Recalcular LTV/frequência/last_purchase do contato após import (reusar a função da STORY-015).
- [ ] CA6 — **Tratar os gaps do Literarius:** sem paginação → buscar por ID/SQL com `TOP/OFFSET`; datas `1899-12-30`/`1969-12-31` → NULL; nunca chamar `GET` sem ID em volume (risco de timeout).
- [ ] CA7 — Credenciais em `workspace_integrations`/env do sync; **nunca no frontend**; conexão SQL só pela rede Heziom (Deno local) ou REST.
- [ ] CA8 — Sync agendado (cron) + execução manual; log de importados/atualizados/erros.

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**

**Notas de implementação:**

---

## QA
> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] parceiros importados sem duplicar (dedup CPF/CNPJ cross-source)
- [ ] pedidos B2B viram purchases idempotentes
- [ ] gaps tratados (paginação por ID, datas null)
- [ ] credenciais fora do frontend

---

## Notas e Decisões
> O `PUT /PedidoVenda` (lançar pedido B2B) **não** é desta story — pertence ao epic **Comercial (2.3)**. Aqui é só ingestão para o CRM. Bug conhecido `PlanoConta.TipoCategoria='A'` afeta DRE (track Financeiro), não este.
