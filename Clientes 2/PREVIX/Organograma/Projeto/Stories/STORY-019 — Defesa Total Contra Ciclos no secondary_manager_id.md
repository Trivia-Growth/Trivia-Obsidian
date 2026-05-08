---
id: STORY-019
titulo: "Defesa total contra ciclos no secondary_manager_id (DB trigger + Edge Function)"
fase: 1
modulo: "hierarquia"
status: backlog
prioridade: baixa
agente_responsavel: "@dev"
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-019 — Defesa Total Contra Ciclos no secondary_manager_id

## Contexto

> Em 2026-05-08, dois incidentes em sequência crashtearam `/dashboard` pra usuários novos (adriano.ferreira após reset de senha). Ambos foram causa raiz **dado inválido em `pessoas.secondary_manager_id`** que travava o `dagre.layout` no `OrganogramaView` em `RangeError: Maximum call stack size exceeded`:
>
> 1. **Caso Katia Moraes**: `secondary_manager_id == manager_id` (mesma pessoa nas duas colunas) → 2 edges idênticas no grafo → dagre overflow.
> 2. **Caso Adriano Ferreira (pessoa do organograma, não do auth)**: `secondary_manager_id` apontando pra Ana Carolina, e Ana é descendente do Adriano via cadeia primária (Ana reporta a Adriano) → ciclo transitivo `Adriano → Ana → Adriano` → dagre é DAG, não suporta ciclos.
>
> Os hotfixes aplicados em 2026-05-08 cobriram 4 camadas:
> 1. **UI** (`PessoaForm.tsx`, commit `d325476`): Select de "Gestor adicional" filtra o gestor primário escolhido. useEffect auto-limpa secundário se admin trocar primary pra ser igual.
> 2. **Schema Zod** (`pessoa.schema.ts`, commit `d325476`): refine cross-field rejeita `secondary == primary` no submit.
> 3. **DB CHECK constraint** (`20260508210000_pessoas_check_secondary_neq_primary.sql`): recusa `secondary == primary` ou `secondary == id` em qualquer caminho de write.
> 4. **Render defensivo** (`OrganogramaView.tsx`, commits `f5c956f` + `062fcef`): pula edges duplicadas E ciclos transitivos (computa descendentes via primary chain antes de adicionar secondary).
>
> **Lacunas restantes** que esta story endereça:
> - **CHECK constraint só vê uma linha**: não consegue detectar ciclo transitivo (precisaria de CTE recursiva, que CHECK não suporta).
> - **`validate-and-set-manager` Edge Function só protege `manager_id` primary**: não há proteção equivalente pra `secondary_manager_id` em caminhos de write fora do PessoaForm.
> - **Caminhos não cobertos hoje**: SQL direto via Dashboard, importação em lote, novas Edge Functions, automação externa.

## Spec de Referência

- [[STORY-006 — Hierarquia Anti-Loop Transitiva]] → padrão da Edge Function `validate-and-set-manager` + função SQL `check_hierarchy_loop` (CTE recursiva)
- `architecture.md` → ADR-004 (validação anti-loop no servidor)
- `supabase/migrations/20260427140000_check_hierarchy_loop_function.sql` → função SQL existente
- `supabase/functions/validate-and-set-manager/index.ts` → padrão de Edge Function que valida hierarquia
- `src/features/organograma/components/OrganogramaView.tsx:128-180` → render defensivo aplicado em 2026-05-08

## Critérios de Aceite

### Backend — Trigger de prevenção no DB

- [ ] **CA1 — Função SQL `check_secondary_manager_no_cycle`** em nova migration:
  - Recebe `p_pessoa_id uuid`, `p_secondary_id uuid`. Retorna `boolean` (true se OK, false se cria ciclo).
  - Implementação via CTE recursiva: a partir de `p_pessoa_id`, desce na cadeia primária (`children` por `manager_id`); se encontrar `p_secondary_id` na cadeia, é ciclo (false). Else true.
  - SECURITY DEFINER + search_path explícito (mesmo padrão de `check_hierarchy_loop`).
  - Testes unitários inline (DO bloco): cenário `Adriano → Ana → Adriano` retorna false; cenário válido (manager+secondary independentes) retorna true.

- [ ] **CA2 — Trigger BEFORE INSERT OR UPDATE em `pessoas`**:
  - Roda quando `secondary_manager_id IS NOT NULL` (skip se NULL — ninguém liga).
  - Chama `check_secondary_manager_no_cycle(NEW.id, NEW.secondary_manager_id)`.
  - Se false, `RAISE EXCEPTION` com mensagem amigável `'secondary_manager_id criaria ciclo na hierarquia'` + SQLSTATE específico (ex: `'23514'` check_violation).
  - Coexiste com a CHECK constraint `pessoas_secondary_neq_primary` da story de 2026-05-08 — CHECK pega ciclo depth-0, trigger pega depth>0.

- [ ] **CA3 — Sanity check antes do deploy**:
  - DO bloco no início da migration: roda a função em todas as `pessoas` ativas com `secondary_manager_id NOT NULL`. Se alguma já viola, RAISE EXCEPTION com lista de IDs (admin precisa corrigir antes de aplicar a migration).

### Backend — Edge Function `validate-and-set-secondary-manager`

- [ ] **CA4 — Edge Function nova** em `supabase/functions/validate-and-set-secondary-manager/index.ts`:
  - Endpoint POST: `{ pessoaId: uuid, secondaryManagerId: uuid | null }`
  - Validação Zod no input.
  - Apenas `admin` ou `editor` (mesma regra de `validate-and-set-manager`).
  - Pré-check: `secondaryManagerId !== pessoaId` E `secondaryManagerId !== pessoa.manager_id` (UI já valida, mas servidor é fonte de verdade).
  - Chama `check_secondary_manager_no_cycle` via RPC. Se false → 422 `code: HIERARCHY_CYCLE_LOOP`.
  - Se OK, faz UPDATE em `pessoas.secondary_manager_id`.
  - Padrão `_shared/cors.ts` + `_shared/problem.ts` + `Deno.serve`.
  - Logs com `reqId`, `caller_id`, `pessoa_id`, `secondary_manager_id`.
  - Deploy via `supabase functions deploy validate-and-set-secondary-manager`.

### Frontend — Migrar PessoaForm pra usar a Edge Function

- [ ] **CA5 — Mutation pra secondary_manager_id passa pela Edge Function**:
  - Atualmente o save de pessoa em `PessoasPage.tsx` faz UPDATE direto via `supabase.from('pessoas').update()`. Após esta story, separar a parte de `secondary_manager_id` num `supabase.functions.invoke("validate-and-set-secondary-manager")` paralelo (igual o `validate-and-set-manager` é chamado quando admin arrasta na tela de Hierarquia).
  - **Trade-off**: 2 round-trips em vez de 1 quando admin edita pessoa que tem secondary. Aceitável (operação rara).
  - Erro 422 `HIERARCHY_CYCLE_LOOP` → toast amigável "Esse gestor adicional cria loop na hierarquia".

### Testes

- [ ] **CA6 — Teste manual em produção:**
  - Tentar criar Adriano (pessoa) com `secondary = Ana` (Ana descendente de Adriano via primary). Backend recusa com 422.
  - Tentar via SQL Editor (caminho fora do app): `UPDATE pessoas SET secondary_manager_id = ana_id WHERE id = adriano_id`. **Trigger deve recusar com EXCEPTION**.
  - Caso válido: editar pessoa qualquer com secondary independente (não no caminho primary). Salva normal.

- [ ] **CA7 — Logs verificados:**
  - Supabase Dashboard → Edge Functions → Logs → `validate-and-set-secondary-manager` mostra reqId.
  - Trigger não aparece em logs explícitos, mas tentativa de UPDATE inválido retorna ERROR no Postgres logs.

### Doc updates

- [ ] **CA8 — Documentação atualizada no mesmo PR:**
  - `architecture.md`: adicionar Edge Function `validate-and-set-secondary-manager` na lista; documentar trigger.
  - `specs/technical/API_SPECIFICATION.md`: contrato da nova Edge Function.
  - `Roadmap.md` no vault: bullet STORY-019 e marcar ✅ ao concluir.

## Decisões já tomadas

- **2026-05-08 — Diferimento intencional** (JG): após resolver os 2 incidentes do dia com 4 camadas de proteção (UI + schema + CHECK + render), JG decidiu que o risco residual (write direto via SQL ou novo caminho não-coberto) é baixo o suficiente pra deixar essa story em backlog. Reavaliar se aparecer um terceiro caso no futuro ou se houver requisito de importação em lote.
- **2026-05-08 — Não migrar `manager_id` pra trigger também**: a Edge Function `validate-and-set-manager` já protege o caminho de drag-and-drop (Hierarquia). Outros caminhos de write pra `manager_id` são raros (a checkbox transitivo já roda na criação via PessoaForm). Não vale duplicar a validação. STORY futura se aparecer regressão similar com primary.

## Fora de Escopo

- Migrar TODA a hierarquia pra usar triggers (substituir Edge Functions). A separação Edge Function (UX + business logic) vs Trigger (defesa terminal) é intencional — manter.
- Validação de ciclo via secondary_manager APENAS no momento de adicionar (não no momento de mover gestor primary). Caso edge: admin altera Ana.manager_id pra ser Adriano DEPOIS que Adriano já tem Ana como secondary. Trigger pega isso? Sim — INSERT OR UPDATE em qualquer linha que envolva o relacionamento. Mas se ambos os updates estão na mesma transação... investigar com mais cuidado quando a story for retomada.
- Importação em lote de pessoas com hierarquia (CSV/JSON). Quando aparecer, esta story precisa estar fechada antes pra prevenir ciclos no batch.

---

## Implementação

> Preenchido pelo `@dev` quando a story for retomada.

**Status:** `backlog`

**Branch/PR:** *(pendente)*

**Arquivos a criar:**
- `supabase/migrations/[timestamp]_check_secondary_manager_no_cycle.sql`
- `supabase/functions/validate-and-set-secondary-manager/index.ts`

**Arquivos a modificar:**
- `src/features/pessoas/components/PessoasPage.tsx` (mutation passa pela Edge Function quando secondary muda)
- `architecture.md`
- `specs/technical/API_SPECIFICATION.md`
- Vault: `Roadmap.md`

**Deploy:**
- `supabase db push` (migration com função + trigger)
- `supabase functions deploy validate-and-set-secondary-manager`

---

## QA

> Preenchido pelo `@qa`.

**Gate:** *(pendente — story em backlog)*

---

## Notas e Decisões

- `2026-05-08` — Story criada após dois incidentes consecutivos com `secondary_manager_id` (Katia + Adriano) crashtearem `/dashboard`. JG decidiu deixar em backlog porque as 4 camadas aplicadas no dia (UI/schema/CHECK/render) cobrem o fluxo normal da Previx. Esta story só importa pra defesa em caminhos fora-do-app (SQL direto, novas integrações).
- `2026-05-08` — Considerada e descartada: TRIGGER que valida via primary chain ANTES de cada update parcial. Issue: trigger BEFORE INSERT OR UPDATE não enxerga estado pós-trigger de outros UPDATEs na mesma transação. Pra validar batch import corretamente, talvez melhor um DEFERRABLE constraint trigger ou validação na Edge Function. Decidir na implementação.
