---
id: STORY-016
titulo: "Migração da base Flowbiz (96.718 contatos)"
fase: 2
modulo: "crm"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-016 — Migração da base Flowbiz (96.718 contatos)

## Contexto

> O Flowbiz será desligado (contrato vence **26/06/2026**). O backup já foi exportado (05–08/06/2026): **96.718 contatos**, 40 listas, 345 campos personalizados, 168 templates HTML. Precisamos importar a base para o `contacts` estendido (STORY-015), com deduplicação.

**Origem:** OneDrive `Editora Heziom / Heziom / Flowbiz / backup-2026-06-05` — arquivo principal `TODOS_CONTATOS_CONSOLIDADO.csv` (96.692 linhas com campos comportamentais).

## Spec de Referência
- [[Flowbiz — Análise e Substituição]] (inventário + backup)
- [[Flowbiz — Funcionalidades Mapeadas]] (campos da lista "Clientes")
- depende de [[STORY-015 — Customer cross-channel (estender contacts)|STORY-015]]

## Critérios de Aceite

- [ ] CA1 — Script ETL idempotente (re-rodável) que lê o CSV consolidado e insere/atualiza em `contacts`.
- [ ] CA2 — **Dedup** por `cpf_cnpj` (quando houver) e fallback por `email`; nunca duplicar contato existente.
- [ ] CA3 — Mapear campos: nome, email, telefone, cpf, data_nascimento, genero, cidade/estado/cep (em notes/jsonb), data_ultimo_pedido→`last_purchase_date`, quantidade_pedidos→`purchase_frequency`, receita_total→`lifetime_value`, ticket_medio→`average_order_value`. `source_channel='flowbiz'`.
- [ ] CA4 — As 40 listas viram **tags** (tabelas `tags`/`contact_tags` **já existem**), preservando o vínculo contato↔lista. *(A conversão dessas tags em `crm_segments` estáticos é um passo posterior, na [[STORY-018 — Segmentação dinâmica|STORY-018]], quando a tabela existir — evita acoplar 016 a 018.)*
- [ ] CA5 — Relatório pós-migração: nº importados, nº atualizados, nº duplicados ignorados, nº com erro.
- [ ] CA6 — Rodar primeiro em **dry-run** (conta sem gravar) e validar amostra antes do import real.
- [ ] CA7 — `is_active`/opt-out preservados (contatos descadastrados no Flowbiz não entram em régua).

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
- [ ] Dry-run validado em amostra
- [ ] Contagem bate (≈96.692) sem duplicatas
- [ ] Opt-outs preservados
- [ ] LGPD: dados sensíveis (CPF) protegidos por RLS

---

## Notas e Decisões
> Não usar "Claude" em nenhum dado de teste. Templates HTML (168) ficam para a STORY de campanhas (STORY-019).
