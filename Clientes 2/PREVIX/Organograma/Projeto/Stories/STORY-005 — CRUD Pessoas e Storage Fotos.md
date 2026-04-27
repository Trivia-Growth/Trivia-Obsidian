---
id: STORY-005
titulo: "CRUD UI de colaboradores + upload de foto via Supabase Storage"
fase: 1
modulo: "pessoas"
status: backlog
prioridade: alta
agente_responsavel: "@sm"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-005 — CRUD UI de Colaboradores + Upload de Foto

## Contexto

> Schema `pessoas` está em produção (STORY-002) com soft delete, anti-self-loop simples, índice trigram. Falta a UI completa: cadastro, edição, listagem com filtros, busca, e o item mais sensível desta story — **upload de foto com crop e armazenamento no Supabase Storage**.
>
> **Por que crop importa:** o briefing pede "Foto circular 60×60px no topo" do card de pessoa. Sem crop server-side ou client-side, a foto desproporcional vira problema visual. Vamos fazer crop client-side (`react-easy-crop`) antes do upload.
>
> **Importante:** hierarquia (`manager_id`) NÃO é foco desta story. Aqui o campo "Gestor" no form é um simples select opcional. Drag-and-drop + validação anti-loop transitiva ficam na STORY-006.
>
> **Bloqueia:** STORY-006, STORY-007.
> **Bloqueada por:** STORY-003, STORY-004.

## Spec de Referência

- [[../../Briefing Inicial]] → "Gestão de colaboradores", "Cards de pessoa" (60×60), "Tipografia"
- `PROJECT_REQUIREMENTS.md` → Fase 1, "Gestão de Colaboradores"
- `architecture.md` → tokens de design (`previx.*` e `dept.*`)
- ADR-005 (soft delete) já decidido

## Critérios de Aceite

### Storage Setup

- [ ] **CA1 — Migration adicional** `supabase/migrations/<ts>_create_storage_fotos_pessoas.sql`:
  - Cria bucket `fotos-pessoas` via SQL: `INSERT INTO storage.buckets (id, name, public) VALUES ('fotos-pessoas', 'fotos-pessoas', true) ON CONFLICT DO NOTHING;`
  - Policy de SELECT no bucket: `to authenticated, anon` (URL pública lê) — permitida porque foto não é dado sensível
  - Policy de INSERT/UPDATE/DELETE: `to authenticated` com `app_metadata.user_role IN ('admin', 'editor')`
  - Comentário com teste manual

### Listagem

- [ ] **CA2 — Página `/admin/pessoas`** com grid responsivo de cards:
  - Card visual estilo Previx: `bg-previx-accent`, foto circular 60×60 (ou avatar fallback com iniciais), nome bold, cargo abaixo, departamento como tag colorida, status (badge "ativo"/"inativo")
  - Filtros: dropdown multi-select de departamento, switch "Mostrar inativos" (default off — usa índice em status)
  - Busca por nome debounced 400ms (ilike + GIN trigram)
  - Listas > 100 itens: virtualizar com `@tanstack/react-virtual`
  - Loading skeleton, error state, empty state (com call-to-action "Cadastrar primeira pessoa")

### Criação

- [ ] **CA3 — Modal de criação** (form completo):
  - `nome` required text
  - `cargo` required text
  - `departamento_id` Select shadcn populado por `useDepartamentos()`
  - `foto` upload (ver CA5)
  - `email` opcional, validação de formato (Zod `.email().optional()`)
  - `telefone` opcional, máscara BR `(99) 99999-9999`
  - `manager_id` opcional Select (lista de outras pessoas ativas; sem validação de loop nesta story — vem em STORY-006)
  - `data_admissao` opcional date picker (`react-day-picker`)
  - `status` default `ativo` (oculto no create; aparece em edit)
  - Toast sucesso/erro

### Upload de Foto

- [ ] **CA4 — Componente `<UploadFoto>`** reutilizável:
  - Input file accept `image/*`
  - Ao selecionar, abre modal com `react-easy-crop`:
    - Crop 1:1 (square)
    - Zoom slider, drag pra reposicionar
    - Botão "Aplicar"
  - Após crop, gera `Blob` (resized via canvas pra max 600×600) e faz upload pro bucket `fotos-pessoas/<uuid>.jpg`
  - Atualiza `foto_url` no form com `supabase.storage.from('fotos-pessoas').getPublicUrl(path).data.publicUrl`
  - Loading durante upload + toast de erro

- [ ] **CA5 — Avatar fallback** quando `foto_url` é null:
  - Componente `<PessoaAvatar>` que renderiza:
    - Se `foto_url`: img circular 60×60 com `object-cover`
    - Se null: div circular 60×60 com `bg-[cor_do_departamento]` e iniciais (primeiras letras de nome+sobrenome) em branco
  - Compartilhado em `src/components/`

### Edição

- [ ] **CA6 — Modal de edição:**
  - Mesmo form pré-preenchido
  - Campo `status` visível: switch ativo/inativo
  - Quando muda pra inativo: trigger DB preenche `inativado_em` (não precisa enviar do client)
  - Campo `foto_url`: mostra atual + botão "Trocar foto" (mesmo `<UploadFoto>`)

### Soft Delete (Desativar)

- [ ] **CA7 — Botão "Desativar"** em vez de deletar:
  - AlertDialog confirma "Isso vai marcar a pessoa como inativa. Pode ser reativada depois. Continuar?"
  - Mutation `useUpdatePessoa({ status: 'inativo' })` (o trigger faz o resto)
  - Toast sucesso

- [ ] **CA8 — Reativar pessoas inativas:**
  - Switch "Mostrar inativos" no filtro principal
  - Pessoas inativas aparecem com card com opacidade reduzida + badge "Inativa"
  - Botão "Reativar" → `useUpdatePessoa({ status: 'ativo' })` (trigger zera `inativado_em`)

### Hooks TanStack Query

- [ ] **CA9 — Hooks em `src/features/pessoas/api/`:**
  - `usePessoas(filtros)` com optional `departamento_id`, `status`, `busca`
  - `usePessoa(id)` para detalhe
  - `useCreatePessoa`, `useUpdatePessoa`, `useDesativarPessoa` (helper que chama Update com status:'inativo')
  - Tipadas com `Pessoa`, `PessoaInsert`, `PessoaUpdate`

### Permissões

- [ ] **CA10 — `editor` e `admin` editam tudo;** `visualizador` vê lista mas sem botões de mutação. RLS já garante a defesa em profundidade.

### Doc updates

- [ ] **CA11 — Documentação atualizada no mesmo PR:**
  - `Roadmap.md` (vault): "CRUD colaboradores" ✅, "Upload de foto com crop" ✅
  - `architecture.md`: marcar STORY-005 ✅; eventual ADR-011 sobre escolha do `react-easy-crop` (se houver alternativa avaliada)
  - `PROJECT_REQUIREMENTS.md`: confirmar campos e regras de soft delete na seção "Regras de Negócio Críticas"

---

## Implementação

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `supabase/migrations/<ts>_create_storage_fotos_pessoas.sql`
- `src/features/pessoas/api/usePessoas.ts`
- `src/features/pessoas/components/PessoasPage.tsx`
- `src/features/pessoas/components/PessoaCard.tsx`
- `src/features/pessoas/components/PessoaForm.tsx`
- `src/features/pessoas/components/UploadFoto.tsx`
- `src/features/pessoas/components/DesativarPessoaDialog.tsx`
- `src/features/pessoas/schemas/pessoa.schema.ts` (Zod)
- `src/components/PessoaAvatar.tsx` (reutilizável)
- `src/routes/admin/pessoas.tsx`
- Dependências novas: `react-easy-crop`, talvez `@tanstack/react-virtual`

**Notas de implementação:**

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA11 validados
- [ ] Build OK, TS strict
- [ ] Bucket `fotos-pessoas` criado, policies funcionando (curl com token de cada papel)
- [ ] Upload + crop funcionando (foto < 600KB, formato JPG)
- [ ] Soft delete: status muda, `inativado_em` preenchido pelo trigger; reativar zera
- [ ] Lista virtualiza acima de 100 pessoas (testar com seed temporário)
- [ ] `npm audit` sem Critical/High
- [ ] Lighthouse na página de listagem

---

## Notas e Decisões

- `2026-04-23` — Story criada. Crop client-side (não server) por simplicidade — Edge Function de processamento de imagem só justifica se houver requisito de qualidade extrema (não é o caso).
- `2026-04-23` — Bucket `fotos-pessoas` será **público** para leitura. Decisão: fotos não são dado sensível como nome+telefone; URL pública não vaza nada que SELECT já não vaze (e SELECT é gated por RLS via Edge Function pública na Fase 2).
- `2026-04-23` — `manager_id` aqui é select simples sem validação transitiva. STORY-006 cobre validação completa + drag-and-drop.
