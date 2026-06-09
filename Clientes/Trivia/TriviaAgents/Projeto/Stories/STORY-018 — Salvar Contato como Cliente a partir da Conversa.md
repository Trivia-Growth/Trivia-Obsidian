---
id: STORY-018
titulo: "Salvar Contato como Cliente a partir da Conversa"
fase: 2
modulo: "conversations / customers"
status: backlog
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-018 — Salvar Contato como Cliente a partir da Conversa

## Contexto

Quando um atendente ou agente identifica que o contato de uma conversa é um lead qualificado, ele precisa conseguir salvar esse contato como um cliente na base, enriquecendo o registro com nome, e-mail, empresa e outras informações. Hoje o único vínculo é o `contact_phone` — não há forma de promover um contato a cliente diretamente pela tela da conversa.

## Critérios de Aceite

### CA1 — Botão "Salvar como Cliente" na conversa
- Na tela de detalhe da conversa, exibir botão "Salvar como Cliente" no header (ao lado do agente/status)
- Visível apenas quando `conversation.customer_id` for nulo
- Se já tiver `customer_id`, exibir chip com o nome do cliente (link para a ficha)

### CA2 — Modal de enriquecimento
- Ao clicar no botão, abrir modal com formulário:
  - **Nome** (pré-preenchido com `contact_name` da conversa) — obrigatório
  - **Telefone** (pré-preenchido com `contact_phone`) — somente leitura
  - **E-mail** — opcional
  - **Empresa** — opcional
  - **Observações** — textarea opcional
- Botão "Salvar Cliente"

### CA3 — Lógica de upsert
- Se já existe um `customer` com o mesmo `phone` no tenant → atualiza os campos preenchidos (não sobrescreve campos já preenchidos com vazio)
- Se não existe → cria novo registro em `customers`
- Após salvar: atualiza `conversations.customer_id` com o ID do cliente
- Atualiza também `conversations.contact_name` com o nome informado

### CA4 — Feedback
- Toast "Cliente salvo com sucesso!"
- O chip com nome do cliente aparece imediatamente no header da conversa

### CA5 — Sem nova Edge Function
- Operações diretas via Supabase client (RLS já cobre `customers`)

## Arquitetura

### Tabela `customers` (já existe)
Colunas relevantes: `id`, `tenant_id`, `name`, `phone`, `email`, `company`, `notes`, `created_at`

### Arquivos a criar/modificar
- `src/features/conversations/components/SaveCustomerModal.tsx` — modal com formulário
- `src/features/conversations/api/useSaveCustomer.ts` — mutation upsert + link conversa
- `src/routes/_app/conversations/$conversationId.tsx` — adicionar botão + chip no header

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
