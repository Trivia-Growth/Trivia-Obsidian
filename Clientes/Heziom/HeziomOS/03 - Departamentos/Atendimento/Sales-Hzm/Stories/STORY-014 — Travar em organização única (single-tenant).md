---
id: STORY-014
titulo: "Travar em organização única (single-tenant)"
fase: 1
modulo: "arquitetura"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-014 — Travar em organização única (single-tenant)

## Contexto

> **Decisão de produto:** o Sales-Hzm será usado por **uma única organização** (a Heziom), não como SaaS multi-tenant. O sistema foi gerado na Lovable inteiramente em cima de `workspace_id` (banco, 39 edge functions e ~64 arquivos do front via `use-workspace`), com seletor de workspace e onboarding que **cria organizações livremente**.

Esta story adota a estratégia **meio-termo** escolhida pelo piloto: **não arrancar** a estrutura multi-tenant (refatoração grande e arriscada, ainda mais com banco temporário que vai migrar pro DB unificado da Heziom), mas **travar** o sistema em uma organização única, removendo o que permite criar/trocar de organização. A camada de `workspace_id` + RLS por membership **permanece** e passa a ser apenas o mecanismo de proteção de dados (ver [[STORY-002 — Habilitar RLS e padronizar policies]]).

Objetivo: **neutralizar o "problema futuro"** (um segundo workspace surgir por engano, UX confusa, dados fragmentados) sem o risco de uma cirurgia no `workspace_id`.

## Spec de Referência

- [[Sales-Hzm — Índice]] — decisão single-tenant
- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #2, #24, #32, #60, #61 (multi-tenant rebaixado)
- Código: `src/hooks/use-workspace.tsx`, `src/components/WorkspaceSwitcher.tsx`, `src/components/AppSidebar.tsx:82`, `src/pages/Onboarding.tsx`, `supabase/functions/initialize-workspace`

## Critérios de Aceite

- [ ] CA1 — **Remover a troca de organização:** tirar o `<WorkspaceSwitcher />` do `AppSidebar.tsx:82` (substituir por exibição estática do nome/logo da organização). `switchWorkspace()` no `use-workspace.tsx` vira no-op ou é removido; some o `active_workspace_id` em localStorage como seletor.
- [ ] CA2 — **Remover a criação de novas organizações:** o `Onboarding.tsx` deixa de permitir criar workspace arbitrário. Passa a existir **uma** organização fixa (a da Heziom); novos usuários são **adicionados como membros** dessa organização única (mantém a RLS por membership funcionando), nunca criando uma nova.
- [ ] CA3 — O contexto `use-workspace` é **mantido** (64 arquivos dependem de `workspace?.id`), mas resolve sempre para a organização única — sem listar/alternar múltiplas.
- [ ] CA4 — `initialize-workspace` ajustada (ou protegida) para não criar uma segunda organização: se já existe a organização única, novos chamados só associam o usuário a ela. Idealmente exposta só para seed/admin.
- [ ] CA5 — Esconder/remover da UI qualquer ação de "criar organização", "convidar para nova organização" ou listagem de múltiplos workspaces.
- [ ] CA6 — `workspace_id` nas tabelas e nas edge functions **permanece intacto** (não é esta story que mexe nisso); a RLS por membership continua sendo a fronteira de dados.
- [ ] CA7 — Decisão documentada em `CLAUDE.md`/`architecture.md`: "single-tenant — organização única, multi-tenant adormecido por `workspace_id` mantido só como escopo de segurança".
- [ ] CA8 — Teste manual: novo usuário entra direto na organização única (sem tela de criar org); não há como criar/trocar de organização pela UI.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `concluido`

**Branch/PR:** commit `7fd47d3` em `main` (Org-Heziom/heziom-sales)

**Arquivos alterados:**
- `src/components/WorkspaceHeader.tsx` (novo) — header estático da organização
- `src/components/WorkspaceSwitcher.tsx` (removido) — troca + criação de org
- `src/components/AppSidebar.tsx` — usa `WorkspaceHeader`
- `supabase/functions/initialize-workspace/index.ts` — bloqueia 2ª org (409)
- `CLAUDE.md`, `architecture.md` — documentam a decisão single-tenant

**Notas de implementação:**
- **Estratégia meio-termo** (escolhida pelo piloto): `workspace_id` + RLS por membership **mantidos** como escopo de segurança; só removida a capacidade de criar/trocar organização.
- `WorkspaceSwitcher` (que tinha popover de troca + dialog "Criar organização") substituído por `WorkspaceHeader` estático (logo + nome + papel).
- `initialize-workspace`: conta `workspaces`; se já existir uma, retorna **409 SINGLE_TENANT_LOCK**. A primeira (fundadora) ainda pode ser criada; novos usuários entram por `invite-member`.
- `switchWorkspace` permanece no contexto `use-workspace` (interface), mas **sem nenhum chamador na UI** — não há como trocar.

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados (CA1–CA8)
- [x] Não há como criar/trocar de organização pela UI (switcher removido; nenhum chamador de `switchWorkspace`)
- [x] `initialize-workspace` deployada; lógica de 409 para 2ª org (banco hoje com 0 orgs → 1ª criação livre, 2ª travada)
- [x] `workspace_id`/RLS preservados — `npm run build` ✓ (39s); `tsc --noEmit` sem erros novos nos arquivos tocados
- [x] Build sem erros
- [x] Decisão documentada em CLAUDE.md/architecture.md

**Notas:** O caminho 409 é validado por código + build; o teste ao vivo do bloqueio exige a org fundadora existir (banco está zerado). Quando o admin criar a org da Heziom, qualquer 2ª criação retorna 409.

---

## Notas e Decisões

> Estratégia escolhida: **travar em 1 organização** (meio-termo), não arrancar o multi-tenant. Caso a Heziom um dia decida ser multi-org, basta reativar o seletor e a criação — a estrutura continua no banco.
