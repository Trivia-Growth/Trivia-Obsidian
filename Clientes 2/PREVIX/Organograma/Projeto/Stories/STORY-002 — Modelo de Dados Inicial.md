---
id: STORY-002
titulo: "Modelo de dados inicial — pessoas e departamentos com RLS"
fase: 1
modulo: "data"
status: em-review
prioridade: alta
agente_responsavel: "@dev"
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

- [x] **CA1 — Tabela `departamentos`** criada com colunas:
  - `id uuid primary key default gen_random_uuid()`
  - `nome text not null unique`
  - `cor_hex text not null check (cor_hex ~ '^#[0-9A-Fa-f]{6}$')`
  - `ordem int not null default 0` (para ordenação visual no organograma)
  - `criado_em timestamptz not null default now()`
  - `atualizado_em timestamptz not null default now()`

- [x] **CA2 — Tabela `pessoas`** criada com colunas:
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

- [x] **CA3 — Índices** criados para queries comuns:
  - `pessoas(departamento_id)` — filtro por depto
  - `pessoas(manager_id)` — recursão hierárquica
  - `pessoas(status)` — filtro padrão "só ativos"
  - `pessoas(nome) using gin (nome gin_trgm_ops)` — busca por nome com `ilike` (extensão `pg_trgm` habilitada)

- [x] **CA4 — Triggers** criados:
  - `set_atualizado_em()` genérica que atualiza coluna `atualizado_em = now()` em update; aplicada via `BEFORE UPDATE` em ambas as tabelas
  - `set_inativado_em()` em `pessoas` que preenche `inativado_em = now()` quando `status` muda de `ativo` para `inativo` (e zera para null se voltar para `ativo`)

### Segurança (RLS)

- [x] **CA5 — RLS habilitado + FORCE** em `departamentos` e `pessoas`:
  ```sql
  ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
  ALTER TABLE departamentos FORCE ROW LEVEL SECURITY;
  ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
  ALTER TABLE pessoas FORCE ROW LEVEL SECURITY;
  ```

- [x] **CA6 — Policies por papel** (ADR-008 fixou `auth.jwt() -> 'app_metadata' ->> 'user_role'`):
  - `SELECT` em ambas: `to authenticated` com `user_role in ('admin', 'editor', 'visualizador')`
  - `INSERT/UPDATE/DELETE` em ambas: `to authenticated` com `user_role in ('admin', 'editor')`
  - **`anon` NÃO tem nenhuma policy** — confirmado via curl (CA9 abaixo)
  - Wrap `(SELECT ...)` aplicado para caching do PG

- [x] **CA7 — Atribuição de papel documentada (ADR-008):** decidido `app_metadata.user_role` (server-only, via `auth.admin.updateUserById`). Justificativa em `architecture.md`. Edge Function admin para atribuição programática vem na STORY-003.

### Seed inicial

- [x] **CA8 — 6 departamentos default** inseridos via migration `20260423120200_seed_departamentos.sql` com `ON CONFLICT DO UPDATE` (idempotente):
  | Nome | cor_hex | ordem |
  |------|---------|-------|
  | Diretoria | `#1AB6E8` | 1 |
  | Operacional | `#C73E5C` | 2 |
  | DP e RH | `#2DB39A` | 3 |
  | Financeiro | `#7B5FB8` | 4 |
  | Analistas | `#8BC34A` | 5 |
  | Segurança Eletrônica e Portaria Remota | `#D946EF` | 6 |

### Validação e tipagem

- [x] **CA9 — Teste de bloqueio anônimo** validado via curl: SELECT anon retorna `[]` em ambas tabelas; POST anon retorna `{"code":"42501","message":"new row violates row-level security policy ..."}` em ambas. Documentado em comentário SQL no fim de cada migration:
  ```sql
  -- Teste manual após migration:
  -- 1. Conectar como anon (psql com chave anon ou via curl)
  -- 2. SELECT * FROM pessoas; → deve retornar 0 linhas (não erro, RLS bloqueia silenciosamente)
  -- 3. INSERT INTO pessoas → deve falhar com "new row violates row-level security policy"
  ```

- [x] **CA10 — Tipos TypeScript** gerados em `src/types/database.ts` (273 linhas; helpers `Tables<>`, `TablesInsert<>`, `TablesUpdate<>`). Derivados criados em `src/types/pessoa.ts` (`Pessoa`, `PessoaInsert`, `PessoaUpdate`, `StatusPessoa`) e `src/types/departamento.ts` (`Departamento`, `DepartamentoInsert`, `DepartamentoUpdate`). Cliente Supabase tipado como `SupabaseClient<Database>`. `npm run typecheck` passa.

### Deploy

- [x] **CA11 — Migrations aplicadas em produção** via `supabase db push --linked --include-all`. `supabase migration list --linked` confirma 3 linhas (`20260423120000`, `120100`, `120200`) com timestamps preenchidos na coluna Remote.

- [x] **CA12 — Documentação atualizada** no mesmo PR:
  - `architecture.md`: ADR-008 inserido com justificativa completa (`app_metadata` vs `user_metadata`); seção "Próximos Passos" com STORY-001/002 marcadas ✅
  - `PROJECT_REQUIREMENTS.md`: tabela `Tabelas próprias` agora lista `departamentos` ✅ e `pessoas` ✅ com colunas reais
  - `SECURITY_DEBT.md`: SEC-005 (Edge Function admin para atribuir papel — depende de STORY-003) e SEC-006 (validação anti-loop transitiva — STORY-006)
  - `Roadmap.md` no vault: itens "CRUD departamentos" e "CRUD colaboradores" marcados como `[~]` (schema feito, UI pendente nas STORIES-004 e 005); decisão registrada no histórico

---

## Implementação

> Preenchido pelo `@dev` após concluir. Piloto não edita esta seção.

**Status:** `em-review` (aguardando @qa via PR)

**Branch/PR:** `feat/story-002-modelo-dados` → PR a ser aberto após commit

**Arquivos criados:**
- `supabase/config.toml` (gerado por `supabase init`)
- `supabase/.gitignore` (gerado por `supabase init`)
- `supabase/migrations/20260423120000_create_departamentos.sql` (87 linhas — schema + RLS + 4 policies + trigger)
- `supabase/migrations/20260423120100_create_pessoas.sql` (118 linhas — schema + soft delete + 4 índices + 2 triggers + RLS + 4 policies)
- `supabase/migrations/20260423120200_seed_departamentos.sql` (16 linhas — 6 deptos institucionais com `ON CONFLICT`)
- `src/types/database.ts` (273 linhas — gerado via `supabase gen types typescript --linked`)
- `src/types/departamento.ts` (`Departamento`, `DepartamentoInsert`, `DepartamentoUpdate`)
- `src/types/pessoa.ts` (`Pessoa`, `PessoaInsert`, `PessoaUpdate`, `StatusPessoa`)
- `.env.local` (gitignored — vars locais para dev/curl)

**Arquivos modificados:**
- `src/lib/supabase.ts` — tipado como `SupabaseClient<Database>`
- `package.json` — scripts `typecheck`, `db:diff`, `db:push`, `db:reset`, `db:backup`, `gen:types`
- `eslint.config.js` — ignores adicionados para `.aiox-core/`, `.codex/`, etc. e `database.ts`/`routeTree.gen.ts` gerados
- `architecture.md` — ADR-008 (`app_metadata.user_role`) + checklist "Próximos Passos"
- `PROJECT_REQUIREMENTS.md` — seção "Fontes de Dados" com tabelas reais
- `SECURITY_DEBT.md` — SEC-005 e SEC-006 adicionados
- `Projeto/Roadmap.md` (no vault) — checklist parcial + entrada no histórico

**Notas de implementação:**

- **Sem Docker local:** `supabase db lint` e `supabase db diff` exigem Postgres local em Docker. Ambiente de dev do piloto não tem Docker instalado. Validação foi feita aplicando direto em produção (DB estava vazio, migrations idempotentes, baixo risco) e validando RLS via curl anon. Sugerido em `architecture.md` instalar Docker Desktop a partir da STORY-005 quando schema ficar mais complexo.
- **DB push aplicou os 3 arquivos sem erro.** NOTICEs durante apply (ex: "trigger does not exist, skipping") foram esperados pelos `DROP IF EXISTS` idempotentes.
- **Validação RLS por curl** (CA9):
  - `GET /rest/v1/pessoas` (anon) → `[]` (silent block ok)
  - `GET /rest/v1/departamentos` (anon) → `[]` (silent block — mesmo com 6 linhas no DB)
  - `POST /rest/v1/pessoas` e `/departamentos` (anon) → `{"code":"42501","message":"new row violates row-level security policy ..."}`
- **Atribuição manual de papel para futuros testes auth:** até STORY-003 entregar Edge Function admin, atribuir via Supabase Dashboard → Authentication → Users → Edit user → "Raw user app metadata" = `{"user_role": "admin"}`.
- **Lovable preview:** `.env.local` foi criada localmente. A Lovable já tinha as vars no preview cloud delas. Sync bidirecional GitHub vai puxar nossos commits sem conflitar.

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
