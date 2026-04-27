---
id: STORY-008
titulo: "Compartilhamento via token público — link read-only para clientes finais"
fase: 2
modulo: "compartilhamento"
status: pronto
prioridade: alta
agente_responsavel: "@sm"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-008 — Compartilhamento via Token Público

## Contexto

> Primeira story da Fase 2. Materializa a segunda metade da proposta de valor: a Previx envia um **link público read-only** com o organograma para clientes finais sem precisar do designer. O link é controlado: tem expiração configurável, revogação manual, e **não vaza dados sensíveis** (e-mail e telefone ficam fora da resposta — ADR-006).

**Bloqueada por:** Fase 1 completa (STORY-007).
**Bloqueia:** STORY-009 (PDF export pode reaproveitar a Edge Function pública).

## Spec de Referência

- [[../../Briefing Inicial]] → seção "Compartilhamento externo"
- `architecture.md` → ADR-006 (acesso público via Edge Function dedicada — `anon` sem policy direta)
- `PROJECT_REQUIREMENTS.md` → Fase 2, "Compartilhamento Externo"

## Critérios de Aceite

### Schema

- [ ] **CA1 — Tabela `tokens_publicos`** criada com migration:
  - `id uuid PK default gen_random_uuid()`
  - `token uuid not null unique default gen_random_uuid()` (UUID v4)
  - `criado_por uuid not null references auth.users(id) on delete restrict`
  - `criado_em timestamptz not null default now()`
  - `expira_em timestamptz` (nullable — null = sem expiração)
  - `revogado_em timestamptz` (nullable — null = ativo)
  - `descricao text` (nullable — admin pode anotar pra que cliente é)
  - Índice em `token` (já vem do unique)
  - Índice parcial em `revogado_em` para listar ativos rápido

- [ ] **CA2 — RLS** habilitado + FORCE:
  - SELECT: `admin` apenas (gestão de tokens é privativa)
  - INSERT/UPDATE/DELETE: `admin` apenas
  - **anon SEM policy** (acesso vai via Edge Function dedicada)

### Backend — Edge Function pública

- [ ] **CA3 — Edge Function `get-organograma-public`** em `supabase/functions/get-organograma-public/index.ts`:
  - Configurada com **`verify_jwt = false`** (pública)
  - GET `/?token=<uuid>` ou POST `{ token }` no body
  - Valida UUID via Zod
  - Query: `SELECT * FROM tokens_publicos WHERE token=$1 AND revogado_em IS NULL AND (expira_em IS NULL OR expira_em > now())`
  - Se não encontrar → 404 `TOKEN_NOT_FOUND`
  - Se OK: query `pessoas` (somente colunas seguras: `id, nome, cargo, departamento_id, foto_url, manager_id`) + query `departamentos`
  - **NÃO retorna `email`, `telefone`, `data_admissao`, `inativado_em`** (PII)
  - Retorna `{ pessoas: [...], departamentos: [...], emitido_em: ISO, expira_em?: ISO }`
  - CORS aberto (`*` em dev, domínio Netlify em prod via `ALLOWED_ORIGIN`)
  - Logs com `reqId` + token mascarado (primeiros 8 chars)

- [ ] **CA4 — Rate limiting documentado:** SEC-007 já registrado. Esta story **não** implementa rate-limit (ainda P2). Cita no ADR / nota.

### Frontend — Admin

- [ ] **CA5 — Hooks TanStack Query** em `src/features/tokens/api/useTokens.ts`:
  - `useTokens()` lista tokens (admin only)
  - `useCreateToken({ descricao?, expiraEm? })` cria
  - `useRevogarToken(id)` seta `revogado_em = now()`

- [ ] **CA6 — Página `/admin/tokens`** (admin only via beforeLoad):
  - Lista de tokens com colunas: descrição, criado em, expira em (ou "sem expiração"), status (ativo/revogado/expirado), URL pública
  - Botão "Copiar link" (gera URL `https://organograma-previx.netlify.app/p/<token>` e copia para clipboard)
  - Dialog "Criar novo token": campos descrição (opcional), expira em (opcional date picker — sugestões: 7d, 30d, sem expiração)
  - Botão "Revogar" com confirmação. Após revogar, status fica vermelho.

- [ ] **CA7 — Header link "Tokens"** (apenas para admin), entre Hierarquia e Departamentos.

### Frontend — Público (sem auth)

- [ ] **CA8 — Rota `/p/$token`** **fora** do layout `_authenticated`:
  - Não exige login
  - Carrega via Edge Function pública
  - Renderiza organograma reaproveitando `OrganogramaView` (que não usa hooks de auth)
  - Header simples: "Organograma PREVIX" + texto "Visualização compartilhada · emitido em [data]"
  - Loading: skeleton
  - Error 404 → tela "Link inválido ou expirado" com texto explicativo
  - **Sem botões** de Editar / Desativar / Filtros administrativos
  - Mantém: zoom, pan, mini-mapa, busca por nome (filtro de depto opcional)

### Segurança e privacidade

- [ ] **CA9 — Nenhum dado sensível** retornado pela Edge Function pública. Confirmar via teste manual com curl: a resposta NÃO contém `email`, `telefone`, `data_admissao`, `inativado_em`.

- [ ] **CA10 — Token revogado** retorna 404 (não 401/403) — não vaza informação sobre se token existiu.

### Doc updates

- [ ] **CA11 — Documentação atualizada:**
  - `Roadmap.md` (vault): "Compartilhamento via token público" ✅
  - `architecture.md`: marcar STORY-008 ✅; ADR-006 marcado como implementado
  - `SECURITY_DEBT.md`: SEC-007 (rate limiting) reforçado se ainda pendente
  - `specs/technical/API_SPECIFICATION.md`: documentar contrato da nova Edge Function

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `supabase/migrations/<ts>_create_tokens_publicos.sql`
- `supabase/functions/get-organograma-public/index.ts`
- `supabase/config.toml` (configurar `verify_jwt = false` para a função)
- `src/features/tokens/api/useTokens.ts`
- `src/features/tokens/components/TokensPage.tsx`
- `src/features/tokens/components/CreateTokenDialog.tsx`
- `src/features/publico/components/OrganogramaPublico.tsx`
- `src/routes/_authenticated/admin/tokens.tsx`
- `src/routes/p.$token.tsx`
- `architecture.md`, `Roadmap.md`, `specs/technical/API_SPECIFICATION.md`

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA11 validados
- [ ] Token UUID válido → carrega organograma
- [ ] Token inválido → 404
- [ ] Token expirado → 404
- [ ] Token revogado → 404
- [ ] Resposta da Edge Function NÃO tem email/telefone
- [ ] Build OK, TS strict, lint, audit, vitest

---

## Notas e Decisões

- `2026-04-23` — Story refinada após Fase 1 concluída. Mantém ADR-006 como decisão arquitetural canônica.
- `2026-04-23` — Decidido NÃO logar IP do visitante na primeira versão. Log de acesso fica como melhoria futura quando houver necessidade de saber quem clicou no link.
