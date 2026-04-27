---
id: STORY-006
titulo: "Hierarquia: validação anti-loop transitiva + drag-and-drop"
fase: 1
modulo: "hierarquia"
status: backlog
prioridade: alta
agente_responsavel: "@sm"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-006 — Hierarquia: Anti-Loop Transitivo + Drag-and-Drop

## Contexto

> A STORY-002 deixou apenas o auto-loop coberto (`CHECK manager_id <> id`). A STORY-005 permitiu setar `manager_id` via select simples no form. **Mas o problema real é o loop transitivo:** A reporta a B, B reporta a C, depois alguém tenta fazer C reportar a A. PostgreSQL não pega isso com `CHECK` — precisa de CTE recursiva.
>
> Esta story entrega:
> 1. **Edge Function `validate-and-set-manager`** com validação transitiva (CTE recursiva).
> 2. **Pré-check no cliente** para UX responsiva (bloqueia drag visualmente antes de chamar o servidor).
> 3. **Drag-and-drop** numa visualização hierárquica preliminar (não precisa ser bonita ainda — STORY-007 polirá).
>
> **Resolve:** SEC-006 (em SECURITY_DEBT.md).
> **Bloqueia:** STORY-007 (visualização final precisa do drag-and-drop funcionando).
> **Bloqueada por:** STORY-005.

## Spec de Referência

- [[../../Briefing Inicial]] → "Gestão de hierarquia: definição via formulário ou drag-and-drop, validação anti-loop"
- `architecture.md` → ADR-004 (decisão original sobre validação dupla cliente+servidor)
- `SECURITY_DEBT.md` → SEC-006 (esta story resolve)

## Critérios de Aceite

### Backend — Edge Function

- [ ] **CA1 — Edge Function `validate-and-set-manager`** em `supabase/functions/validate-and-set-manager/index.ts`:
  - POST com body `{ pessoaId: uuid, managerId: uuid | null }`
  - Validação Zod
  - Valida JWT via `auth.getUser()`
  - Verifica que o chamador é `admin` ou `editor` (consultando `app_metadata.user_role`)
  - Se `managerId === null`: simplesmente UPDATE pessoa SET manager_id = null
  - Se `managerId !== null`:
    - Executa CTE recursiva:
      ```sql
      WITH RECURSIVE chain AS (
        SELECT id, manager_id FROM pessoas WHERE id = $managerId
        UNION ALL
        SELECT p.id, p.manager_id FROM pessoas p
        JOIN chain c ON p.id = c.manager_id
      )
      SELECT 1 FROM chain WHERE id = $pessoaId LIMIT 1;
      ```
    - Se retorna linha → response 422 com `{ code: 'HIERARCHY_LOOP', detail: 'Atribuição cria loop hierárquico' }`
    - Se vazio → UPDATE pessoa SET manager_id = $managerId (executa via cliente service_role; RLS já validou autorização do chamador acima)
  - Retorna 200 com `{ success: true }`
  - CORS configurado
  - Rate limiting básico (defesa contra abuso): max 60 requisições / minuto / user (registrar SEC-007 se não implementar)

### Frontend — Pré-check e Hooks

- [ ] **CA2 — Utilitário cliente** `src/lib/hierarchy.ts`:
  - Função `wouldCreateLoop(pessoaId: string, novoManagerId: string | null, todasPessoas: Pessoa[]): boolean`
  - Percorre o grafo em memória (já carregado via `usePessoas`) seguindo `manager_id`
  - Retorna true se encontrar `pessoaId` na cadeia ascendente do novo manager
  - Testado com Vitest unit tests (cenários: sem loop, auto-loop, loop A→B→A, loop A→B→C→A)

- [ ] **CA3 — Hook `useUpdateManager`:**
  - Mutation que chama a Edge Function `validate-and-set-manager`
  - Antes de chamar, faz pré-check com `wouldCreateLoop` (se loop, rejeita imediatamente sem ir ao servidor)
  - Em caso de erro 422 do servidor (loop detectado), exibe toast amigável: "Não é possível: essa atribuição criaria loop hierárquico"
  - Invalida `['pessoas']` em sucesso
  - Optimistic update opcional

### UI — Drag-and-drop

- [ ] **CA4 — Visualização hierárquica preliminar** `/admin/hierarquia`:
  - Lista em árvore (nested ul/li ou tree component shadcn)
  - Cada nó exibe nome + cargo + depto (sem foto detalhada — STORY-007 cuida da visualização rica)
  - Drag-and-drop com `@dnd-kit/core`:
    - Arrastar um nó pra outro = setar manager_id
    - Pré-check com `wouldCreateLoop` durante drag (highlights visuais: zonas válidas em verde, inválidas em vermelho)
    - Drop válido → chama `useUpdateManager`
  - Loading inline durante mutation
  - Em erro do servidor: rollback visual + toast

- [ ] **CA5 — Form de pessoa atualizado:**
  - Em `src/features/pessoas/components/PessoaForm.tsx`, ao escolher manager via Select:
    - Opções vêm filtradas por `wouldCreateLoop` (não mostrar pessoas que criariam loop)
    - Mensagem de tooltip explicando o filtro

### Permissões

- [ ] **CA6 — `admin`/`editor` reorganizam;** `visualizador` vê a árvore mas drag-and-drop está desabilitado (cursor `not-allowed`).

### Validação manual

- [ ] **CA7 — Cenários testados:**
  - **Cenário A** — A reporta a null (top); B reporta a A; criar C reportando a B → ok
  - **Cenário B** — Tentar fazer A reportar a B (criando loop A→B→A) → bloqueado pelo cliente sem ida ao servidor
  - **Cenário C** — Tentar fazer A reportar a C (criando loop A→C→B→A) → bloqueado pelo cliente
  - **Cenário D (proteção servidor):** simular request malicioso direto no Edge Function (curl com payload de loop) → 422 com `HIERARCHY_LOOP`
  - **Cenário E** — Mudar manager para null → ok
  - **Cenário F** — Pré-check cliente válido mas estado mudou: outro user fez mudança que tornaria loop. Servidor pega via CTE → 422. UI rollback.

### Doc updates

- [ ] **CA8 — Documentação atualizada:**
  - `architecture.md`: ADR-004 confirmado/marcado como implementado; eventual ADR-012 se houver decisão sobre `@dnd-kit` vs `react-dnd`
  - `SECURITY_DEBT.md`: SEC-006 marcado como resolvido; SEC-007 (rate limiting Edge Function) registrado se não implementado nesta story
  - `Roadmap.md` (vault): "Hierarquia + drag-and-drop" ✅
  - `specs/technical/API_SPECIFICATION.md`: documentar contrato da Edge Function

---

## Implementação

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `supabase/functions/validate-and-set-manager/index.ts`
- `src/features/hierarquia/api/useUpdateManager.ts`
- `src/features/hierarquia/components/HierarquiaPage.tsx`
- `src/features/hierarquia/components/ArvoreNode.tsx`
- `src/lib/hierarchy.ts`
- `src/lib/__tests__/hierarchy.test.ts` (Vitest)
- `src/features/pessoas/components/PessoaForm.tsx` (atualizar)
- `src/routes/admin/hierarquia.tsx`
- Dependências novas: `@dnd-kit/core`, `@dnd-kit/sortable`, `vitest` (devDep)

**Notas de implementação:**

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA8 validados (incluindo todos os cenários A-F)
- [ ] Edge Function deployed e testada via curl
- [ ] Vitest unit tests do `wouldCreateLoop` passam
- [ ] Build OK, TS strict
- [ ] Drag-and-drop acessível (teclado-friendly via @dnd-kit handlers)
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- `2026-04-23` — Decisão arquitetural: validação **dupla** (cliente para UX, servidor como source of truth). Se cliente burlado, servidor bloqueia. ADR-004 já registrava isso.
- `2026-04-23` — Decidido NÃO permitir bulk re-parent (mover subtree inteira) nesta story. Drag move só um nó por vez. Bulk pode virar feature futura.
- `2026-04-23` — Visualização nesta story é **preliminar** (lista em árvore). A visualização rica com cards estilizados, zoom, pan e mini-mapa vem na STORY-007.
