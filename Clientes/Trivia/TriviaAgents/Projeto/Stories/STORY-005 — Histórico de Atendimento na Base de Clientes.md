---
id: STORY-005
titulo: "Histórico de atendimento dentro da base de clientes"
fase: 1
modulo: "customers"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-12
atualizado: 2026-05-12
---

# STORY-005 — Histórico de Atendimento na Base de Clientes

## Contexto

A base de clientes era uma lista simples de cards sem detalhamento. Ao clicar num cliente, abria um modal de edição básico. Precisávamos de uma visão completa do cliente com histórico de todas as conversas vinculadas a ele, para que os analistas tenham contexto antes de atender.

## Spec de Referência

- Plano executado: `/sessions/260511-bright-laurel/plans/v2-finalizacao.md` (Entrega 4)

## Critérios de Aceite

- [x] CA1 — Clicar em um cliente abre um Sheet (drawer lateral) em vez do modal simples
- [x] CA2 — Drawer tem aba "Dados" com formulário de edição inline
- [x] CA3 — Drawer tem aba "Histórico" com lista de conversas vinculadas via `customer_id`
- [x] CA4 — Cada conversa no histórico mostra: data, agente, status badge, contagem de mensagens e link direto
- [x] CA5 — Empty state no histórico com instrução de como vincular conversas
- [x] CA6 — Cards da lista são clicáveis (sem botões edit/delete separados — tudo no drawer)

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `351f977`

**Arquivos alterados:**
- `src/features/customers/api/useCustomerConversations.ts` — novo hook com join agents + count messages
- `src/features/customers/components/CustomerDetailDrawer.tsx` — novo componente Sheet + Tabs
- `src/features/customers/components/CustomerList.tsx` — reescrito: cards clicáveis abrem drawer; criação via modal separado

**Notas de implementação:**
- `useCustomerConversations` faz N+1 queries para contar mensagens (uma por conversa) — aceitável para até 50 conversas; otimizar com RPC se escalar
- Botão de criação separado abre `CustomerFormModal` (mantido sem alteração)
- Edição e exclusão agora ficam no drawer (sem botões no card da lista)

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict
- [x] Loading state no histórico (Loader2)
- [x] Empty state com instrução clara
- [x] Sem alteração de banco — usa `customer_id` em `conversations` já existente

**Notas:** N+1 documentado, aceitável para MVP.
