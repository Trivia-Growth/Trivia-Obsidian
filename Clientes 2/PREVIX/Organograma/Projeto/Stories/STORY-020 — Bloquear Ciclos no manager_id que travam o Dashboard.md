---
id: STORY-020
titulo: "Bloquear ciclos no manager_id (trigger DB + Edge Function obrigatória em todos os writes)"
fase: 1
modulo: "hierarquia"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-11
atualizado: 2026-05-11
---

# STORY-020 — Bloquear Ciclos no `manager_id` que Travam o Dashboard

## Contexto

> Em 2026-05-09, terceiro incidente da família "dado inválido em `pessoas` trava o `/dashboard` com `RangeError: Maximum call stack size exceeded`". Diferente dos incidentes de 2026-05-08 (que envolveram `secondary_manager_id` — Katia Moraes e Adriano Ferreira, cobertos parcialmente pelas STORY-019 + 4 camadas de hotfix), este caso envolveu o `manager_id` **primário**:
>
> - **Ricardo Prezia (CEO)** com `manager_id = Ana Carolina`
> - **Ana Carolina Sciarra Prezia (Sócia)** com `manager_id = Ricardo Prezia`
>
> Ciclo Ricardo↔Ana no `manager_id` primário. Quando o `OrganogramaView` roda o pass 1 do builder de edges, adiciona as duas edges sem checar ciclo (a defesa do commit `062fcef` só roda no pass 2, pra secondary). O dagre é DAG-only, recursão infinita, stack overflow, error boundary do `/dashboard` engole tudo com "Something went wrong".
>
> **Como o admin causou (timestamps de `atualizado_em`):**
> - `2026-05-08 20:17` — primeira edição via `/admin/pessoas` colocando um deles como gestor do outro
> - `2026-05-09 13:29` — segunda edição (na outra pessoa) fechando o ciclo
>
> Ricardo e Ana deveriam ser **sócios peers no topo** (ambos com `manager_id = NULL`), conforme commits `f0d107d` ("Ricardo + Ana são peers") e `d7cf181` ("Ricardo + Ana como unidade de sócios no topo"). O admin atribuiu hierarquia entre eles em vez de deixar peers.
>
> **Fix do dado:** JG aplicou manualmente em 2026-05-11 (`UPDATE pessoas SET manager_id = NULL WHERE id IN ('b208bff4...', '8b62b99c...')`).
>
> **Por que a defesa atual NÃO pegou:**
>
> | Camada | Cobre? | Motivo |
> |---|---|---|
> | Zod / CHECK `secondary_neq_primary` | Não | Só protege `secondary_manager_id` |
> | Trigger DB `tg_pessoas_secondary_no_cycle` (STORY-019, commit `51bfe90`) | Não | Só roda quando `secondary_manager_id IS NOT NULL`. `manager_id` puro não dispara. |
> | Edge Function `validate-and-set-manager` (STORY-006) | **Parcial** | Só é chamada em `/admin/hierarquia` (drag-and-drop). `/admin/pessoas` salva `manager_id` direto via `supabase.from('pessoas').update()` no `useUpdatePessoa`. |
> | Render defensivo `OrganogramaView` pass 1 | Não | Pass 1 adiciona edges primárias **sem** checagem de ciclo. A checagem foi adicionada só no pass 2 (secondary). |
>
> **Lacunas restantes que esta story endereça:**
> 1. Não há trigger DB no `manager_id` (apenas função SQL `check_hierarchy_loop` existe desde STORY-006, mas sem trigger).
> 2. `PessoasPage` salva `manager_id` por caminho que não passa pela Edge Function.
> 3. Pass 1 do `OrganogramaView` não tem defesa terminal contra ciclo primário (qualquer dado corrompido no DB explode o render).
> 4. **Bônus (não causou incidente ainda, mas o gap existe):** trigger STORY-019 só detecta ciclos secondary que envolvem a cadeia primary; ciclo entre dois ou mais `secondary_manager_id` em loop puro (X.secondary=Y, Y.secondary=X) passa pela detecção atual. Coberto pelo CA9.

## Spec de Referência

- [[STORY-006 — Hierarquia Anti-Loop Transitiva]] → padrão da Edge Function `validate-and-set-manager` + função SQL `check_hierarchy_loop`
- [[STORY-019 — Defesa Total Contra Ciclos no secondary_manager_id]] → padrão de trigger DB + Edge Function (replicar pro primary)
- `architecture.md` → ADR-004 (validação anti-loop no servidor)
- `supabase/migrations/20260427140000_check_hierarchy_loop_function.sql` → função SQL `check_hierarchy_loop` (já existe — só falta o trigger)
- `supabase/migrations/20260508220000_check_secondary_manager_no_cycle.sql` → padrão de trigger a replicar
- `supabase/functions/validate-and-set-manager/index.ts` → Edge Function que já valida (só precisa ser usada também em PessoasPage)
- `src/features/pessoas/components/PessoasPage.tsx:67-79` → `toDbInput` (caminho que hoje salva `manager_id` direto)
- `src/features/pessoas/components/PessoasPage.tsx:83-109` → `saveSecondaryManager` (padrão a replicar pra `manager_id`)
- `src/features/organograma/components/OrganogramaView.tsx:135-146` → pass 1 sem defesa de ciclo

## Critérios de Aceite

### Backend — Trigger DB no `manager_id`

- [ ] **CA1 — Trigger BEFORE INSERT OR UPDATE em `pessoas`** chamando `check_hierarchy_loop(NEW.id, NEW.manager_id)`:
  - Skip se `NEW.manager_id IS NULL` (topo da hierarquia — sempre válido).
  - Skip se `TG_OP = 'UPDATE' AND OLD.manager_id IS NOT DISTINCT FROM NEW.manager_id` (UPDATE em outros campos não revalida).
  - Se `check_hierarchy_loop` retorna `true` → `RAISE EXCEPTION 'manager_id criaria ciclo na hierarquia (pessoa=% manager=%)'` com `ERRCODE = 'check_violation'`.
  - Função trigger: `public.tg_pessoas_manager_no_cycle()`.
  - Nome do trigger: `trg_pessoas_manager_no_cycle`.
  - Coexiste com `trg_pessoas_secondary_no_cycle` da STORY-019.

- [ ] **CA2 — Sanity check antes do deploy** (DO bloco no topo da migration):
  - Detecta TODAS as `pessoas` ativas em ciclo `manager_id` via CTE recursiva (mesma query usada na investigação de 2026-05-11).
  - Se alguma viola: `RAISE EXCEPTION 'Migration bloqueada: N pessoas com manager_id em ciclo. Limpar antes via UPDATE.'` com lista de IDs.

- [ ] **CA3 — Smoke test inline** (DO bloco no fim da migration):
  - Cria 3 pessoas em cadeia temporária (topo → filho → neto).
  - Tenta `UPDATE topo SET manager_id = neto_id` → deve rejeitar com `check_violation`.
  - Tenta `UPDATE filho SET manager_id = neto_id` → deve rejeitar.
  - Caso válido: `UPDATE topo SET manager_id = NULL` → aceita.
  - Cleanup ao final.

### Frontend — `PessoasPage` passa pela Edge Function

- [ ] **CA4 — Refatorar `toDbInput`** em `src/features/pessoas/components/PessoasPage.tsx`:
  - Remover `manager_id` do retorno de `toDbInput` (mesma estratégia já aplicada a `secondary_manager_id` na STORY-019).
  - Criar `saveManager(pessoaId, newValue, oldValue)` análoga ao `saveSecondaryManager` existente, que chama `supabase.functions.invoke("validate-and-set-manager")`.
  - Skip se valor não mudou.
  - Tratar erro `HIERARCHY_CYCLE_LOOP` com toast "Esse gestor cria loop na hierarquia. Verifique se essa pessoa não está acima dele(a)."

- [ ] **CA5 — Ordem de save em create + edit:**
  - **Create:** INSERT da pessoa (sem `manager_id`) → `saveManager` → `saveSecondaryManager` → unidades → campos.
  - **Edit:** UPDATE dos campos (exceto `manager_id` e `secondary_manager_id`) → `saveManager` (se mudou) → `saveSecondaryManager` (se mudou).
  - Se Edge Function falha por ciclo, **não desfazer** os campos já salvos (UX: melhor mostrar o erro e deixar admin corrigir o gestor que salvar tudo).

### Frontend — Render defensivo no `OrganogramaView`

- [ ] **CA6 — Pass 1 com cycle detection:**
  - Antes de adicionar cada edge primary, computar se já existe path `target → source` nas edges primárias adicionadas até então.
  - Se sim, **skip** a edge + `console.warn` com IDs envolvidos (defesa terminal: nunca crashea o render, mesmo com DB corrompido).
  - Algoritmo: BFS reverso curto a partir de `p.manager_id` seguindo edges primárias já adicionadas; se chegar em `p.id`, pula.
  - Complexidade aceitável (O(N²) pior caso, N = pessoas ativas ≈ dezenas; sub-milissegundo na prática).

- [ ] **CA7 — Toast/notificação no `/dashboard` quando edges são puladas:**
  - Após o useMemo do builder, se algum ciclo foi detectado e logado, mostrar Toast amigável "Encontramos inconsistência na hierarquia — alguns vínculos não foram desenhados. Avise um admin pra revisar."
  - Sem isso, admin vê o organograma "torto" sem entender por quê.

### Backend — Cobrir gap de secondary loop puro (bônus)

- [ ] **CA8 — Atualizar `check_secondary_manager_no_cycle`** (STORY-019):
  - Estender CTE pra considerar também `secondary_manager_id` da cadeia, não só `manager_id`.
  - Mantém a semântica: detectar se atribuir `secondary` ao `pessoa_id` formaria ciclo no grafo unificado (primary + secondary).
  - Sanity check inicial: rodar query mútua (`X.secondary=Y AND Y.secondary=X`) — 2026-05-11 retorna 0 linhas, então não bloqueia deploy hoje.

- [ ] **CA9 — Atualizar pass 2 do `OrganogramaView`** pra considerar secondary edges já adicionadas ao computar descendants:
  - Hoje `descendantsOf` em `OrganogramaView.tsx:159-172` usa só edges primárias. Estender pra incluir as secondary edges adicionadas em iterações anteriores do pass 2.
  - Garante consistência render ↔ trigger.

### Testes

- [ ] **CA10 — Teste manual em produção:**
  - Tentar via `/admin/pessoas`: editar Ricardo, escolher Ana como gestora → backend recusa com 422, toast aparece.
  - Tentar via SQL Editor (caminho fora do app): `UPDATE pessoas SET manager_id = ricardo_id WHERE id = ana_id` enquanto Ricardo aponta pra Ana → trigger DB recusa.
  - `/dashboard` carrega sem error boundary mesmo se inserir ciclo via SQL bypass (defesa render do CA6).

- [ ] **CA11 — Logs verificados:**
  - Supabase Dashboard → Edge Functions → Logs → `validate-and-set-manager` mostra rejeições com `reqId`.
  - Postgres logs mostram trigger rejeitando UPDATE direto.

### Doc updates

- [ ] **CA12 — Documentação atualizada no mesmo PR:**
  - `architecture.md`: documentar trigger `trg_pessoas_manager_no_cycle`; documentar que TODO write em `manager_id` deve passar por `validate-and-set-manager`.
  - `specs/technical/API_SPECIFICATION.md`: revisar contrato da Edge Function (sem mudança esperada, só confirmar).
  - `CLAUDE.md` do repo: nota na seção de Segurança sobre o trigger duplo (primary + secondary).
  - `Roadmap.md` no vault: bullet STORY-020 e marcar ✅ ao concluir.

## Decisões já tomadas

- **2026-05-11 — Priorizar esta story sobre o congelamento do organograma** (JG): repo está congelado desde início de maio (foco em Site PREVIX), mas este bug causou crash em prod. JG autorizou retomada pontual.
- **2026-05-11 — Fix do dado aplicado manualmente** (JG): Ricardo e Ana com `manager_id = NULL` via SQL direto. Estado peers restaurado, `/dashboard` voltou a carregar.
- **2026-05-11 — Não criar Edge Function nova**: `validate-and-set-manager` já existe e funciona. O gap é que `PessoasPage` não a usa.
- **2026-05-11 — Render defensivo é obrigatório (CA6)**: STORY-019 acertou em adicionar defesa no render além do trigger. Replicar pro primary — terceira camada de proteção contra futuras lacunas em caminhos de write ainda não mapeados.

## Fora de Escopo

- Importação em lote de pessoas com hierarquia (CSV/JSON). Quando aparecer, esta story precisa estar fechada antes.
- Validação cross-row dentro da mesma transação (caso: admin atualiza Ricardo.manager=Ana E Ana.manager=NULL na mesma transação — trigger BEFORE pode rejeitar Ricardo antes do Ana ser comitado). Investigar se aparecer no fluxo real. Hoje os writes são sequenciais via REST/Edge Function, não em transação atômica do cliente.
- Substituir a Edge Function pela trigger (manter as duas — separação intencional: Edge Function dá feedback UX, trigger é defesa terminal).
- Migrar `useUpdatePessoa` inteiro pra Edge Function (só os campos `manager_id` e `secondary_manager_id` precisam — resto é UPDATE normal com RLS).

---

## Implementação

> Preenchido pelo `@dev` quando a story for retomada.

**Status:** `backlog`

**Branch/PR:** *(pendente)*

**Arquivos a criar:**
- `supabase/migrations/[timestamp]_check_manager_no_cycle_trigger.sql`

**Arquivos a modificar:**
- `src/features/pessoas/components/PessoasPage.tsx` (extrair `saveManager`, ajustar `toDbInput`, ordenar saves)
- `src/features/organograma/components/OrganogramaView.tsx` (pass 1 com cycle detection + pass 2 considerando secondaries já adicionadas)
- `supabase/migrations/[timestamp]_check_secondary_manager_no_cycle_v2.sql` (CA8 — opcional, podemos só atualizar a função via CREATE OR REPLACE numa migration nova)
- `architecture.md`
- `CLAUDE.md` (seção Segurança)
- Vault: `Roadmap.md`

**Deploy:**
- `supabase db push` (migration com trigger + sanity check)
- Frontend: `git push origin main` (Netlify auto-deploy)

---

## QA

> Preenchido pelo `@qa`.

**Gate:** *(pendente — story em backlog)*

---

## Notas e Decisões

- `2026-05-11` — Story criada após terceiro incidente da família "ciclo de hierarquia trava /dashboard com RangeError". Casos 1 e 2 (Katia + Adriano em 2026-05-08) foram em `secondary_manager_id` e foram cobertos pela STORY-019 + hotfix em 4 camadas. Caso 3 (Ricardo + Ana em 2026-05-09) foi em `manager_id` primário e revelou que a STORY-019 não cobriu o caminho equivalente. Esta story replica a defesa em camadas pro primary.
- `2026-05-11` — Investigação confirmou que o ciclo foi causado por edição manual em `/admin/pessoas`, fluxo que **não** passa pela Edge Function `validate-and-set-manager` (só `/admin/hierarquia` passa). Identificação em `src/features/pessoas/components/PessoasPage.tsx:67-79` (`toDbInput` salva `manager_id` direto via `useUpdatePessoa`).
- `2026-05-11` — Considerado e adiado: alarme/monitoramento que detecte automaticamente quando há ciclo no DB e notifique. Pode entrar em story futura de observabilidade — fora do escopo defensivo desta.
