---
id: STORY-002
titulo: "Modelo de dados inicial — pessoas e departamentos com RLS"
fase: 1
modulo: "data"
status: pronto
prioridade: alta
agente_responsavel: "@sm"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-002 — Modelo de Dados Inicial: pessoas e departamentos com RLS

## Contexto

> A STORY-001 entregou toda a infraestrutura (Lovable + Supabase + Netlify + AIOX), mas o banco está vazio. Esta story cria as duas tabelas fundacionais de Fase 1 — `pessoas` e `departamentos` — com RLS por papel, índices, triggers de timestamp, constraints de soft delete e seed inicial.
>
> **Tudo na Fase 1 depende destas tabelas existirem.** Sem elas, não dá pra implementar CRUD de colaboradores, hierarquia, visualização ou filtros. Por isso é prioridade alta e bloqueante.
>
> Decisões já tomadas em ADR (ver `architecture.md` no repo):
> - **ADR-004** validação anti-loop: constraint simples (`manager_id <> id`) nesta story; CTE recursiva fica para a story de hierarquia (STORY-006).
> - **ADR-005** soft delete via `status='inativo'` + `inativado_em`, não `DELETE` físico.
> - **ADR-006** acesso público (Fase 2) será via Edge Function dedicada — por isso `anon` **NÃO** tem policy de SELECT em `pessoas` ou `departamentos`.

## Spec de Referência

- [[../../Briefing Inicial]] → seções "Gestão de colaboradores", "Gestão de departamentos", "Permissões", "Identidade visual" (cores dos departamentos)
- `PROJECT_REQUIREMENTS.md` no repo → Fase 1, módulos "Gestão de Colaboradores" e "Gestão de Departamentos", seção "Fontes de Dados"
- `architecture.md` no repo → ADR-004, ADR-005, ADR-006; tabela "Cores por departamento (defaults)"
- [[../../../Documentos Trivia 2/Padrão Projetos/03 - Segurança/RLS Supabase — Template|RLS Supabase Template]]

## Critérios de Aceite

### Schema

- [ ] **CA1 — Tabela `departamentos`** criada com colunas:
  - `id uuid primary key default gen_random_uuid()`
  - `nome text not null unique`
  - `cor_hex text not null check (cor_hex ~ '^#[0-9A-Fa-f]{6}$')`
  - `ordem int not null default 0` (para ordenação visual no organograma)
  - `criado_em timestamptz not null default now()`
  - `atualizado_em timestamptz not null default now()`

- [ ] **CA2 — Tabela `pessoas`** criada com colunas:
  - `id uuid primary key default gen_random_uuid()`
  - `nome text not null`
  - `cargo text not null`
  - `departamento_id uuid references departamentos(id) on delete restrict`
  - `foto_url text`
  - `email text` (nullable, sem unique — pode haver convidados sem email)
  - `telefone text` (nullable)
  - `manager_id uuid references pessoas(id) on delete set null`
  - `status text not null default 'ativo' check (status in ('ativo', 'inativo'))`
  - `data_admissao date`
  - `inativado_em timestamptz` (preenchido por trigger quando status muda para inativo)
  - `criado_em timestamptz not null default now()`
  - `atualizado_em timestamptz not null default now()`
  - **Constraint anti-self-loop simples:** `check (manager_id is null or manager_id <> id)` — validação transitiva fica para STORY-006.

- [ ] **CA3 — Índices** criados para queries comuns:
  - `pessoas(departamento_id)` — filtro por depto
  - `pessoas(manager_id)` — recursão hierárquica
  - `pessoas(status)` — filtro padrão "só ativos"
  - `pessoas(nome) using gin (nome gin_trgm_ops)` — busca por nome com `ilike` (extensão `pg_trgm` habilitada)

- [ ] **CA4 — Triggers** criados:
  - `set_atualizado_em()` genérica que atualiza coluna `atualizado_em = now()` em update; aplicada via `BEFORE UPDATE` em ambas as tabelas
  - `set_inativado_em()` em `pessoas` que preenche `inativado_em = now()` quando `status` muda de `ativo` para `inativo` (e zera para null se voltar para `ativo`)

### Segurança (RLS)

- [ ] **CA5 — RLS habilitado + FORCE** em `departamentos` e `pessoas`:
  ```sql
  ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
  ALTER TABLE departamentos FORCE ROW LEVEL SECURITY;
  ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
  ALTER TABLE pessoas FORCE ROW LEVEL SECURITY;
  ```

- [ ] **CA6 — Policies por papel** (`auth.jwt() ->> 'user_role'`):
  - `SELECT` em ambas: `to authenticated` com `user_role in ('admin', 'editor', 'visualizador')`
  - `INSERT/UPDATE/DELETE` em ambas: `to authenticated` com `user_role in ('admin', 'editor')`
  - **`anon` NÃO tem nenhuma policy** — confirmado por teste explícito (CA9 abaixo)

- [ ] **CA7 — Atribuição de papel** documentada: como o `user_role` chega no JWT do Supabase (custom claim via `raw_app_meta_data` ou via Auth Hook). Esta story **não** implementa o sign-up de usuários (vem na STORY-003 — Auth), mas precisa deixar claro qual mecanismo será usado para o claim no JWT, registrado em `architecture.md` como ADR-008.

### Seed inicial

- [ ] **CA8 — 6 departamentos default** inseridos na migration de seed, com cores da paleta institucional (de `architecture.md`):
  | Nome | cor_hex | ordem |
  |------|---------|-------|
  | Diretoria | `#1AB6E8` | 1 |
  | Operacional | `#C73E5C` | 2 |
  | DP e RH | `#2DB39A` | 3 |
  | Financeiro | `#7B5FB8` | 4 |
  | Analistas | `#8BC34A` | 5 |
  | Segurança Eletrônica e Portaria Remota | `#D946EF` | 6 |

### Validação e tipagem

- [ ] **CA9 — Teste de bloqueio anônimo** documentado em comentário SQL na migration:
  ```sql
  -- Teste manual após migration:
  -- 1. Conectar como anon (psql com chave anon ou via curl)
  -- 2. SELECT * FROM pessoas; → deve retornar 0 linhas (não erro, RLS bloqueia silenciosamente)
  -- 3. INSERT INTO pessoas → deve falhar com "new row violates row-level security policy"
  ```

- [ ] **CA10 — Tipos TypeScript** gerados em `src/types/database.ts` (via `supabase gen types typescript --linked > src/types/database.ts`) e arquivos derivados em `src/types/pessoa.ts` e `src/types/departamento.ts` re-exportando os types relevantes. Build TypeScript passa sem erro.

### Deploy

- [ ] **CA11 — Migration aplicada em produção** via `supabase db push`. Confirmar com `supabase migration list` que aparece como `Applied`.

- [ ] **CA12 — Documentação atualizada** no mesmo PR:
  - `architecture.md`: marcar tabelas `pessoas` e `departamentos` como ✅ na seção "Próximos Passos"; adicionar ADR-008 (mecanismo de `user_role` no JWT)
  - `PROJECT_REQUIREMENTS.md`: na seção "Fontes de Dados" → "Tabelas próprias", remover o `[PREENCHER — listar conforme forem criadas]` e listar `departamentos` e `pessoas` como concluídas
  - `Roadmap.md` no vault: marcar checklist ✅ dos itens "CRUD departamentos" e "CRUD colaboradores" — somente a parte de schema; a UI vem nas STORIES-004 e 005

---

## Implementação

> Preenchido pelo `@dev` após concluir. Piloto não edita esta seção.

**Status:** —

**Branch/PR:** —

**Arquivos alterados:**
- `supabase/migrations/<timestamp>_create_departamentos.sql`
- `supabase/migrations/<timestamp>_create_pessoas.sql`
- `supabase/migrations/<timestamp>_seed_departamentos.sql`
- `src/types/database.ts` (gerado)
- `src/types/pessoa.ts`
- `src/types/departamento.ts`
- `architecture.md`
- `PROJECT_REQUIREMENTS.md`
- `Projeto/Roadmap.md` (no vault)

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`. Piloto não edita esta seção.

**Gate:** —

**Checklist:**
- [ ] CA1 — schema `departamentos` correto e roda em ambiente limpo
- [ ] CA2 — schema `pessoas` correto, soft delete via status, anti-self-loop simples ativo
- [ ] CA3 — índices presentes (`pg_indexes` confirma)
- [ ] CA4 — triggers funcionando: update muda `atualizado_em`; mudar status para inativo preenche `inativado_em`
- [ ] CA5 — RLS habilitado + FORCE confirmado por `pg_class.relrowsecurity` e `relforcerowsecurity`
- [ ] CA6 — 4 policies presentes; anon explicitamente sem policy
- [ ] CA7 — ADR-008 documentado em `architecture.md`
- [ ] CA8 — 6 departamentos seedados com cores corretas
- [ ] CA9 — teste anon executado e documentado
- [ ] CA10 — types gerados e build TS passa
- [ ] CA11 — `supabase db push` executado, migration aparece em `migration list` como Applied
- [ ] CA12 — docs atualizadas e commitadas no mesmo PR
- [ ] Build sem erros (`npm run build`)
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões

> Registro de decisões tomadas durante a implementação. Qualquer pessoa pode adicionar aqui.

- `2026-04-23` — Story criada com base no Briefing Inicial e nos ADRs já documentados em `architecture.md`. Escopo intencionalmente limitado a schema + RLS + seed — sem CRUD UI (vem nas STORIES-004 e 005) e sem validação anti-loop transitiva (STORY-006, junto da hierarquia).
- `2026-04-23` — Decidido NÃO usar `unique` em `email` na tabela `pessoas`. Convidados / pessoas sem e-mail cadastrado precisam ser permitidos.
- `2026-04-23` — Extensão `pg_trgm` habilitada para suportar busca por nome com `ilike` performante (CA3). Vai ser usada na STORY-005 (CRUD pessoas) e STORY-007 (busca no organograma).
