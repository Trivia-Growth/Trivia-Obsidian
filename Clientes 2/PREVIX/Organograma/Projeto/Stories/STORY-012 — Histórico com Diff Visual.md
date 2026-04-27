---
id: STORY-012
titulo: "Histórico com diff visual — timeline por pessoa"
fase: 3
modulo: "auditoria"
status: pronto
prioridade: alta
agente_responsavel: "@sm"
criado: 2026-04-27
atualizado: 2026-04-27
---

# STORY-012 — Histórico com Diff Visual (por pessoa)

## Contexto

> Primeira story da Fase 3. Reaproveita a infraestrutura de auditoria da STORY-011 mas troca a perspectiva: em vez de lista cronológica geral pra admin (já entregue em `/admin/auditoria`), aqui é uma **timeline lateral por pessoa específica**. Use case: "abro a página da Maria, vejo as 5 últimas mudanças nela: quando trocou de cargo, quando o gestor mudou, quando inativou".
>
> Fica embutido no Sheet de edição de pessoa (via Tabs "Editar" | "Histórico") — usuário já está focado naquela pessoa, faz sentido ver o histórico dela ali mesmo sem navegar.

## Spec de Referência

- [[STORY-011 — Auditoria]] — entregou `audit_log` + filtros + DiffSheet (admin only)
- `PROJECT_REQUIREMENTS.md` — Fase 3, "Histórico de alterações com diff visual"
- Roadmap → STORY-012

## Decisões arquiteturais

### Escopo: só pessoas (não departamentos)

A STORY-012 entrega timeline **por pessoa** apenas. Departamentos podem virar feature futura (STORY-016?) — não há demanda imediata e a UX é diferente (não há "Sheet de edição de depto" — é uma listagem em popover).

### UX: Tabs no Sheet existente, não rota dedicada

Não criar `/admin/pessoas/$id/historico`. Em vez disso, adicionar `<Tabs>` no header do Sheet de edição:
- **"Editar"** (default) — form atual
- **"Histórico"** — timeline reverse-chronológica

Vantagens: zero refactor de roteamento, sem dupla-Sheet, contexto do user preservado, navigable com keyboard (atalhos do Tabs).

Desvantagem: criar nova pessoa não tem tab "Histórico" (sem audit_log ainda) — esconder a tab nesse caso.

### Permissão: não restringir além do existente

Se o user pode acessar `/admin/pessoas`, pode ver o histórico (admin/editor). Visualizadores não acessam essa rota — são guardadas pelo RoleGuard upstream. Política RLS da `audit_log` já restringe a admin via SELECT, mas como editor vai usar o mesmo endpoint via React Query… **importante:** hoje só admin lê audit_log. Pra editor ver, preciso ou afrouxar a policy ou criar uma policy adicional pra editor ler eventos da própria entidade.

**Decisão:** afrouxar a SELECT policy pra `admin OR editor`. Editor já pode editar pessoas — ver o histórico dessa edição é coerente. Visualizador continua sem acesso (não tem nem a rota).

Migration suplementar: `20260427180000_audit_log_allow_editor_read.sql`.

### Resumo curto vs diff completo

Timeline mostra resumo curto por evento (ex.: "Cargo: 'Diretora' → 'Diretora Comercial'"). Click em um item abre o DiffSheet existente da STORY-011 com diff completo. Reaproveita componente.

## Critérios de Aceite

### Banco

- [ ] **CA1 — Migration `20260427180000_audit_log_allow_editor_read.sql`:**
  - DROP + recreate da policy `leitura_admin` em `audit_log` pra incluir `editor`
  - Renomear pra `leitura_admin_editor` pra refletir o escopo

### Hook

- [ ] **CA2 — `useAuditLog` aceita `entityType` + `entityId` singulares:** estender o hook para opcionalmente filtrar por uma entidade específica (ex: `{ entityType: 'pessoa', entityId: 'uuid' }`). Mantém retrocompatibilidade com os filtros multi-entidade da AuditoriaPage existente.

### UI da Timeline

- [ ] **CA3 — `<HistoricoTimeline pessoaId>` em `src/features/auditoria/components/HistoricoTimeline.tsx`:**
  - Lista cronológica reversa, paginação 20/página
  - Cada item: ícone da ação (mesmo mapeamento da STORY-011), tempo relativo, resumo curto (1 linha) e botão "Ver detalhes"
  - Loading state com skeletons
  - Empty state ("Sem mudanças registradas ainda")

- [ ] **CA4 — Resumo curto via `summarizeChange(evento)`** em `audit-utils.ts`:
  - INSERT: "Cadastrada"
  - DELETE: "Removida"
  - soft-delete: "Inativada"
  - reactivate: "Reativada"
  - UPDATE com 1 campo: "Cargo: 'X' → 'Y'"
  - UPDATE com 2-3 campos: "Cargo, gestor e departamento alterados"
  - UPDATE com >3 campos: "X campos alterados"

- [ ] **CA5 — Click em item abre `DiffSheet`** existente (componente já criado na STORY-011) — reuso direto.

### Integração no Sheet de Pessoa

- [ ] **CA6 — Tabs no Sheet de edição:**
  - Tab "Editar" (default) com PessoaForm atual
  - Tab "Histórico" com `<HistoricoTimeline pessoaId={editing.id} />`
  - Tabs visíveis APENAS quando `editing != null` (criação não tem histórico)

### Qualidade

- [ ] **CA7 — Build + typecheck + lint** limpos
- [ ] **CA8 — Performance:** timeline carrega em < 300ms (paginação SQL já aplica)

### Doc updates

- [ ] **CA9:** `Roadmap.md` (vault): "Histórico com diff visual" ✅
- [ ] **CA10:** comentário na migration explicando porque editor pode ler audit_log

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `supabase/migrations/20260427180000_audit_log_allow_editor_read.sql`
- `src/features/auditoria/api/useAuditLog.ts` (estender)
- `src/features/auditoria/lib/audit-utils.ts` (adicionar `summarizeChange`)
- `src/features/auditoria/components/HistoricoTimeline.tsx` (novo)
- `src/features/pessoas/components/PessoasPage.tsx` (tabs no Sheet)

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA10
- [ ] Editor consegue ver o histórico de uma pessoa
- [ ] Visualizador (sem acesso a /admin/pessoas) é redirecionado upstream
- [ ] Timeline mostra os 3 últimos eventos quando há 3+
- [ ] Click em item abre DiffSheet com diff colorido
- [ ] Soft-delete aparece como "Inativada" e não como "1 campo alterado"

---

## Notas

- `2026-04-27` — Story refinada após STORY-011 (audit_log estabelecido). Decisão de UX: Tabs no Sheet vs rota dedicada — escolhida Tabs pelo overhead zero de roteamento e contexto preservado.
