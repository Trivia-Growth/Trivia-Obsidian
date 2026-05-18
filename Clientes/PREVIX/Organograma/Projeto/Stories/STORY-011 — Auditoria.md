---
id: STORY-011
titulo: "Auditoria — audit_log + página /admin/auditoria com diff visual"
fase: 2
modulo: "auditoria"
status: pronto
prioridade: media
agente_responsavel: "@sm"
criado: 2026-04-27
atualizado: 2026-04-27
---

# STORY-011 — Auditoria

## Contexto

> Conclui a Fase 2. Toda criação, edição e remoção em `pessoas` e `departamentos` é registrada automaticamente em uma tabela `audit_log`. Admin tem uma página dedicada `/admin/auditoria` pra visualizar quem fez o quê e quando, com diff visual antes/depois.
>
> Atende ao item "Auditoria" do briefing (Fase 2): "Log de toda criação, edição e exclusão … visível apenas para admin em uma página dedicada."

## Spec de Referência

- [[../../Briefing Inicial]] → "Auditoria"
- `PROJECT_REQUIREMENTS.md` → "Auditoria" (Fase 2)
- ADR-008 → JWT claim `app_metadata.user_role` (admin only)
- STORY-002 → schema das tabelas auditadas (`pessoas`, `departamentos`)
- STORY-003 → RoleGuard component pra renderização condicional

## Decisões arquiteturais

### Trigger genérico (não duplicar lógica)

Uma única função `audit_trigger()` em PL/pgSQL serve as duas tabelas — usa `TG_OP` (insert/update/delete) e `TG_TABLE_NAME` (pessoa/departamento) pra rotear. Função é `SECURITY DEFINER` pra escrever na `audit_log` mesmo quando o caller não tem privilégio direto.

### Soft delete = UPDATE com semântica especial

`pessoas` usa soft delete (`status='inativo'` em vez de DELETE físico). Na UI da auditoria, vamos detectar `before.status='ativo' AND after.status='inativo'` e renderizar como "Inativado" em vez de "Atualizado". Trigger não precisa mudar — é só visual.

### `before` e `after` como JSONB completos

Salvamos o snapshot inteiro da linha (não só campos alterados). Diff é calculado no frontend comparando os dois jsonbs. Vantagem: troca de schema futuro não quebra a auditoria histórica.

### Permissão estrita

Apenas `user_role = 'admin'` pode `SELECT` da `audit_log`. INSERT só via trigger (caller direto bloqueado). UPDATE/DELETE bloqueados pra todo mundo (audit é imutável).

## Critérios de Aceite

### Banco de dados

- [ ] **CA1 — Migration `create_audit_log.sql`** cria tabela com colunas:
  - `id` uuid pk default `gen_random_uuid()`
  - `user_id` uuid references `auth.users(id)` (nullable — pode ser system action)
  - `action` text check `(action in ('insert','update','delete'))`
  - `entity_type` text check `(entity_type in ('pessoa','departamento'))`
  - `entity_id` uuid not null
  - `before` jsonb (null em insert)
  - `after` jsonb (null em delete)
  - `created_at` timestamptz default `now()`
  - índices: `(entity_type, entity_id)`, `(created_at desc)`, `(user_id)`

- [ ] **CA2 — Função `audit_trigger()`** SECURITY DEFINER, schema public, owner postgres. Captura `auth.uid()` (pode ser null se chamada via service role / sistema). Normaliza `TG_TABLE_NAME` pra `entity_type` (`pessoas`→`pessoa`, `departamentos`→`departamento`).

- [ ] **CA3 — Triggers `AFTER INSERT OR UPDATE OR DELETE`** em `pessoas` e `departamentos`, FOR EACH ROW, executando `audit_trigger()`.

- [ ] **CA4 — RLS na `audit_log`** com FORCE:
  - SELECT permitido apenas se `auth.jwt()->'app_metadata'->>'user_role' = 'admin'`
  - INSERT bloqueado (apenas via trigger SECURITY DEFINER)
  - UPDATE/DELETE bloqueados (auditoria é imutável)

- [ ] **CA5 — Smoke test SQL** (na própria migration ou em arquivo separado): faz INSERT em `departamentos`, UPDATE, DELETE, e verifica que 3 linhas apareceram em `audit_log` com `action`, `entity_type`, `before`, `after` corretos.

### UI (admin only)

- [ ] **CA6 — Rota `/admin/auditoria`** nova, em `src/routes/_authenticated/admin/auditoria.tsx`. `beforeLoad` redireciona pra `/dashboard` se `user_role !== 'admin'` (mesmo padrão de `tokens.tsx` e `usuarios.tsx`).

- [ ] **CA7 — Hook `useAuditLog({ entity?, action?, dateFrom?, dateTo?, limit, offset })`** em `src/features/auditoria/api/useAuditLog.ts`. Usa react-query, retorna paginado.

- [ ] **CA8 — Lista de eventos** com 50 itens por página. Cada linha mostra:
  - Ícone da ação (➕ insert, ✏️ update, 🗑️ delete) — usar lucide
  - Tipo de entidade (Pessoa / Departamento)
  - Nome da entidade (resolvido de `after.nome` ou `before.nome`)
  - Quem fez (e-mail do usuário, ou "—" se `user_id` null)
  - Quando (relative time, ex: "há 2 minutos") + tooltip com timestamp absoluto
  - Botão "Ver diff" que abre painel lateral

- [ ] **CA9 — Detecção de soft delete:** se `action='update' AND before.status='ativo' AND after.status='inativo'`, renderiza como "Inativado" com ícone próprio. Se `before.status='inativo' AND after.status='ativo'`, renderiza como "Reativado".

- [ ] **CA10 — Painel lateral de diff:** Sheet (shadcn) que mostra `before` e `after` lado a lado. Campos alterados ficam com background colorido (verde/vermelho). Campos não alterados ficam normais. Para INSERT, só `after`. Para DELETE, só `before`.

- [ ] **CA11 — Filtros:**
  - Tipo de entidade (multi-select: Pessoa, Departamento)
  - Ação (multi-select: Inserção, Atualização, Remoção, Inativação, Reativação)
  - Range de datas (date pickers)
  - Botão "Limpar filtros"

- [ ] **CA12 — Link "Auditoria"** no header de `_authenticated.tsx`, ao lado de "Usuários", visível só para admin.

### Qualidade

- [ ] **CA13 — Tipos gerados:** após migration, rodar `npm run gen:types` e commitar `src/types/database.ts` atualizado.

- [ ] **CA14 — Performance:** lista carrega em < 500ms com 1000 eventos. Paginação SQL (não fetch tudo).

- [ ] **CA15 — Build + typecheck + lint** limpos.

### Doc updates

- [ ] **CA16 — Documentação:**
  - `architecture.md`: ADR-013 (proposta) — auditoria via trigger genérico SECURITY DEFINER, JSONB completo (não delta).
  - `Roadmap.md` (vault): "Auditoria" ✅; **Fase 2 marcada como concluída.**
  - `PROJECT_REQUIREMENTS.md`: tabela `audit_log` sai de "planejado" pra ✅.
  - `specs/technical/API_SPECIFICATION.md`: documentar a leitura de `audit_log` (admin only).

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `supabase/migrations/20260427170000_create_audit_log.sql` (tabela + função + triggers + RLS + smoke test)
- `src/types/database.ts` (regenerado)
- `src/features/auditoria/api/useAuditLog.ts` (hook react-query)
- `src/features/auditoria/lib/audit-utils.ts` (`detectSoftDelete`, `computeDiff`, `formatActionLabel`)
- `src/features/auditoria/components/AuditoriaPage.tsx` (componente principal)
- `src/features/auditoria/components/EventoRow.tsx` (linha da lista)
- `src/features/auditoria/components/DiffSheet.tsx` (painel lateral)
- `src/features/auditoria/components/AuditoriaFilters.tsx`
- `src/routes/_authenticated/admin/auditoria.tsx` (file route admin-guarded)
- `src/routes/_authenticated.tsx` (adicionar link "Auditoria" no nav admin)
- `architecture.md`, `Roadmap.md`, `PROJECT_REQUIREMENTS.md`, `specs/technical/API_SPECIFICATION.md`

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA16
- [ ] Smoke test SQL passa
- [ ] Editar uma pessoa → ver o evento em `/admin/auditoria` com diff correto
- [ ] Inativar uma pessoa → ver evento como "Inativado" (não "Atualizado")
- [ ] Filtros funcionam isoladamente e combinados
- [ ] Editor não-admin redirecionado pra `/dashboard` ao tentar acessar `/admin/auditoria`
- [ ] Tentar SELECT direto em `audit_log` como editor via supabase-js → 0 rows (RLS)

---

## Notas e Decisões

- `2026-04-27` — Story refinada após STORY-010. Decisões: trigger único genérico (não duplicar), `before`/`after` JSONB completos (resiliente a schema), soft delete detectado no frontend (não no trigger). ADR-013 a registrar.
- `2026-04-27` — `audit_log` é imutável: nenhuma policy de UPDATE/DELETE — INSERT só via trigger SECURITY DEFINER.
