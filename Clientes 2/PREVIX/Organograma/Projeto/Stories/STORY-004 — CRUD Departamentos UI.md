---
id: STORY-004
titulo: "CRUD UI de departamentos com seletor de cor"
fase: 1
modulo: "departamentos"
status: backlog
prioridade: média
agente_responsavel: "@sm"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-004 — CRUD UI de Departamentos

## Contexto

> Schema de `departamentos` já está em produção (STORY-002), com 6 deptos institucionais seedados. Falta a interface visual pra `admin`/`editor` poderem criar novos, editar (cor, nome, ordem) e deletar departamentos não usados.
>
> **Por que importa:** sem essa UI, pra criar um departamento novo o piloto precisa abrir o Supabase Studio — fricção alta e quebra a proposta de "autonomia total" do briefing. Esta story é UI puro (sem mexer em schema).
>
> **Bloqueia:** STORY-005 não consegue ser totalmente útil sem departamentos cadastráveis pelo cliente.
> **Bloqueada por:** STORY-003 (precisa de auth + papel atribuído pra RLS aceitar mutações).

## Spec de Referência

- [[../../Briefing Inicial]] → seção "Gestão de departamentos"
- `PROJECT_REQUIREMENTS.md` → Fase 1, módulo "Gestão de Departamentos"
- `architecture.md` → tokens de design Tailwind (paleta `dept.*`)
- [[../../Custom Instructions Lovable]] → padrões shadcn/ui + TanStack Query
- [[../../../Documentos Trivia 2/Padrão Projetos/02 - Qualidade/Componentes React|Componentes React]]

## Critérios de Aceite

### Listagem

- [ ] **CA1 — Página `/admin/departamentos`** acessível por `admin`, `editor` e `visualizador` (read-only para visualizador):
  - Tabela ou grid de cards: nome (peso 600), cor (chip visual com `bg-[cor_hex]`), ordem, contador de pessoas (computed via JOIN ou counter via SQL)
  - Ordenação: por `ordem` ASC default, switchável pra `nome` ou `criado_em`
  - Busca por nome (debounced 400ms) usando `ilike` (índice GIN trigram)
  - Estado vazio: "Nenhum departamento cadastrado" (não deve aparecer pois temos 6 seedados, mas tratar)
  - Loading: shadcn Skeleton em linhas
  - Error: shadcn Alert com botão `Tentar novamente` → `refetch()`
  - Error Boundary embrulhando a página

### Criação

- [ ] **CA2 — Modal/Sheet de criação** visível só pra `admin`/`editor`:
  - Form (`react-hook-form` + Zod resolver):
    - `nome` text required, min 2 chars, max 80
    - `cor_hex` via componente `<CorPicker>` (defaults da paleta institucional + custom)
    - `ordem` int opcional (default 0; UI mostra "deixe vazio para inserir no fim")
  - Botão "Criar" → `useCreateDepartamento` mutation
  - Toast sonner sucesso/erro
  - Fecha modal e invalida `['departamentos']` query

- [ ] **CA3 — Componente `<CorPicker>`** reutilizável (também útil pra STORY-005 se precisar):
  - Grid de 6 chips com cores institucionais (paleta `dept.*` definida em Tailwind theme)
  - Botão "Cor customizada" → abre `<input type="color">` ou Radix Popover com hex input
  - Validação: regex `^#[0-9A-Fa-f]{6}$` (mesma do CHECK do banco)
  - Mostra preview ao lado

### Edição

- [ ] **CA4 — Modal de edição** com os mesmos campos do criar, pré-preenchidos. `useUpdateDepartamento` chama `supabase.from('departamentos').update(...).eq('id', ...)`.

### Exclusão

- [ ] **CA5 — Botão Excluir** com confirmação Radix AlertDialog:
  - Antes de mostrar o dialog, fazer um SELECT count `pessoas` com `departamento_id = X`
  - Se houver pessoas, **bloquear delete** com mensagem: "Não é possível excluir: este depto tem N pessoas. Reatribua-as antes." (FK ON DELETE RESTRICT vai bloquear no banco também — isto é apenas UX preventiva)
  - Se vazio, confirmação genérica → `useDeleteDepartamento`
  - Toast sucesso/erro

### Hooks TanStack Query

- [ ] **CA6 — Hooks em `src/features/departamentos/api/`:**
  - `useDepartamentos(filtros)` → `useQuery`, queryKey `['departamentos', filtros]`, staleTime 5min
  - `useCreateDepartamento` → `useMutation` com optimistic update opcional
  - `useUpdateDepartamento`
  - `useDeleteDepartamento`
  - Todas tipadas com `Departamento`, `DepartamentoInsert`, `DepartamentoUpdate` de `src/types/departamento.ts`

### Permissões / RLS

- [ ] **CA7 — Visualizador é read-only:**
  - Botões "Criar", "Editar", "Excluir" não aparecem para `userRole === 'visualizador'`
  - Mesmo se aparecessem (DOM hack), RLS no banco bloqueia (defesa em profundidade)

### Validação manual

- [ ] **CA8 — Cenários testados:**
  - Como `admin`: criar depto novo → aparece na lista; editar cor → vê mudar visualmente; tentar excluir Diretoria → bloqueado por ter pessoas associadas (após STORY-005 popular dados)
  - Como `editor`: mesmas operações funcionam
  - Como `visualizador`: lista visível, sem botões de mutação
  - Sem login (anon): acesso negado pelo route guard de `_authenticated`

### Doc updates

- [ ] **CA9 — Documentação atualizada no mesmo PR:**
  - `Roadmap.md` (vault): "CRUD departamentos" ✅ (era `[~]`)
  - `architecture.md`: marcar STORY-004 ✅ em "Próximos Passos"
  - Sem necessidade de novos ADRs (decisões técnicas já cobertas)

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `src/features/departamentos/api/useDepartamentos.ts`
- `src/features/departamentos/components/DepartamentosPage.tsx`
- `src/features/departamentos/components/DepartamentoForm.tsx`
- `src/features/departamentos/components/DepartamentoCard.tsx` (ou linha de tabela)
- `src/features/departamentos/components/DeleteDepartamentoDialog.tsx`
- `src/features/departamentos/schemas/departamento.schema.ts` (Zod)
- `src/components/CorPicker.tsx` (reutilizável)
- `src/routes/admin/departamentos.tsx`
- `architecture.md`, `Roadmap.md`

**Notas de implementação:**

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA9 validados
- [ ] Build OK, TS strict
- [ ] Loading + Error + Empty states em todas as views
- [ ] Error Boundary presente
- [ ] Lista re-fetch após criar/editar/excluir
- [ ] `npm audit` sem Critical/High
- [ ] Acessibilidade básica: AlertDialog com `aria-*` (vem do Radix por default), color picker com label
- [ ] Lighthouse: LCP < 2.5s na página

---

## Notas e Decisões

- `2026-04-23` — Story criada. Decidido NÃO usar drag-and-drop pra reordenar departamentos nesta story (campo `ordem` editável manualmente em form é suficiente). Drag-and-drop pode virar feature futura se cliente pedir.
- `2026-04-23` — Componente `<CorPicker>` é compartilhado em `src/components/` (não em `features/departamentos/`) porque pode ser útil em STORY-005 (cor de avatar fallback) e em features futuras de UI customization.
