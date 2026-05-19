---
id: STORY-003
titulo: "Deno Sync — NotaFiscal + PedidoVenda → Supabase"
fase: 1
modulo: sync
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-04-16
---

# STORY-003 — Deno Sync: NotaFiscal + PedidoVenda

## Contexto
Faturamento por canal e DRE dependem de NotaFiscal e PedidoVenda. Este sync complementa a STORY-002, trazendo os dados de vendas para o Supabase. A chave de conciliação com a Tray (`SiteIdPedido`) também deve ser preservada.

## Spec de Referência
- [[NotaFiscal]] — campos principais (TotalNota, DataEmissao, EntSai, GeraFinanceiro, SiteIdPedido, NFeChave)
- [[PedidoVenda]] — campos (SiteIdPedido, CanalVenda, DataPedido, ValorPedido)
- [[Mapa de Dados]] — chave de conciliação Tray ↔ Literarius
- [[Pedidos e Vendas]] — módulo de faturamento multi-canal

## Critérios de Aceite
- [ ] CA1 — Tabela `notas_fiscais` criada no Supabase com campos: idNotaFiscal, TotalNota, DataEmissao, EntSai, GeraFinanceiro, Cancelada, idPedidoVenda, SiteIdPedido, NFeChave
- [ ] CA2 — Tabela `pedidos_venda` criada no Supabase com campos: idPedidoVenda, SiteIdPedido, CanalVenda, DataPedido, ValorPedido
- [ ] CA3 — Filtro correto: apenas NFs com `EntSai='S'` e `Cancelada=0` e `GeraFinanceiro=1`
- [ ] CA4 — Sync incremental por `DataEmissao` — puxa últimos 90 dias no primeiro sync, depois só delta
- [ ] CA5 — Faturamento por canal calculável via query: `SUM(TotalNota) GROUP BY CanalVenda`
- [ ] CA6 — RLS igual à STORY-002
- [ ] CA7 — Script integrado ao mesmo `literarius-sync.ts` da STORY-002 (não criar arquivo separado)

---

## Implementação
> ⚠️ Preenchido pelo @dev após concluir. Não editar manualmente.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA
> ⚠️ Preenchido pelo @qa. Não editar manualmente.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem regressões em outras features
- [ ] Segurança verificada (dados financeiros, RLS Supabase)
- [ ] Performance aceitável (<2s para queries principais)

**Notas QA:**

---

## Notas e Decisões
- Depende de STORY-002 (mesmo script, mesma conexão)
- SiteIdPedido é a chave para conciliação Tray — preservar mesmo que nulo (pedidos não-Tray)
- Canal de venda do Literarius: verificar tabela CanalVenda para mapeamento de nomes
