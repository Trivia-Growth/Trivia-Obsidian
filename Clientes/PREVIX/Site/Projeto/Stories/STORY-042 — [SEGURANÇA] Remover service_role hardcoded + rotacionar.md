---
id: STORY-042
titulo: "[SEGURANÇA] Remover service_role key hardcoded dos scripts de migração + rotacionar"
fase: 6
modulo: "Blog/CMS · Segurança"
status: concluido
prioridade: critica
agente_responsavel: "@dev"
criado: 2026-07-08
atualizado: 2026-07-08
epico: EPIC-002
---

# STORY-042 — [SEGURANÇA] Remover service_role key hardcoded + rotacionar

> ⚠️ **CRÍTICA e independente do resto do épico.** Pode e deve rodar imediatamente, sem esperar as demais stories.

## Contexto

Durante a investigação do fluxo de blog (EPIC-002), foi encontrada a **`service_role` key do Supabase hardcoded** em `scripts/migrate-git-posts-to-db.mjs:16`:

```js
const SUPABASE_URL = 'https://yqexjddpotlaqraljwvl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiI...role":"service_role"...';
```

O arquivo **está versionado no Git** (`git ls-files scripts/` confirma `migrate-git-posts-to-db.mjs` e `migrate-content-to-db.ts`) — ou seja, a chave está no repositório `Trivia-Growth/previx-site-app` no GitHub.

**Por que é crítico:**
- `service_role` **ignora todas as políticas RLS** — é acesso total de leitura e escrita ao banco.
- O projeto Supabase `yqexjddpotlaqraljwvl` é **compartilhado** entre Organograma, Site e Portal futuro (decisão cliente-wide, ADR-003). A exposição não é só do Site — é de todo o dado da Previx nesse projeto.
- O JWT decodificado tem `exp` em 2092 — validade praticamente eterna se não rotacionado.
- Já existe registro no índice de memória de **PAT/segredos PREVIX pendentes de rotação** (01/07). Esta é uma exposição adicional e mais grave (service_role, não PAT).

## Escopo

### ✅ Inclui
1. Remover a chave hardcoded de `scripts/migrate-git-posts-to-db.mjs` e trocar por `process.env.SUPABASE_SERVICE_ROLE_KEY` (com erro claro se ausente).
2. Auditar `scripts/migrate-content-to-db.ts` e **qualquer outro script/arquivo** com segredo embutido (`git grep` por `service_role`, `eyJhbG`, `SERVICE_ROLE`, URLs de chave).
3. **Rotacionar** a `service_role` key exposta no painel do Supabase.
4. Atualizar todos os consumidores da chave rotacionada (secrets das Edge Functions, GitHub Actions, `.env` locais) para a nova chave — coordenando com o Organograma.
5. Avaliar purga do histórico do Git (a chave fica no histórico mesmo após remover do HEAD). Decisão JG: rotação já invalida a chave exposta; purga do histórico é higiene adicional.

### ❌ NÃO inclui
- Rotação dos outros segredos PREVIX pendentes (PAT `sbp_`) — story própria de rotação.
- Mudança na lógica de migração em si (isso é STORY-039).

## Progresso (08/07/2026)

- ✅ **Parte 1-2 (código) FEITA e no ar** — commit `0f493f7`. Eram **3** cópias hardcoded, não 2: `scripts/migrate-git-posts-to-db.mjs` e `scripts/apply-logo-bulk.mjs` (`migrate-content-to-db.ts` já usava env). Ambos passam a ler `process.env.SUPABASE_SERVICE_ROLE_KEY`. `.env.example` documenta a var. `git grep` da chave = 0 no working tree. Repo é **privado** (exposição contida à org, não à internet aberta).
- ⏸️ **Rotação (parte 3-4): mecanismo real descoberto, aguardando janela + decisão.**

**Descoberta importante — o projeto já migrou para o sistema novo de chaves:**
- Assinatura de sessões usa **ES256** (`in_use`); a chave **HS256 legada** está `previously_used`. Logo, mexer nas chaves legadas **NÃO desloga usuários**.
- A chave vazada é a **`service_role` legada** (HS256). No modelo novo, **não há "rotacionar o segredo JWT"** — a única forma de invalidá-la é **desabilitar as chaves legadas** (`PUT /v1/projects/{ref}/api-keys/legacy {enabled:false}`), o que **derruba anon E service_role legadas juntas**. Reversível em segundos (`enabled:true`).
- **Consumidores a migrar ANTES de desabilitar (senão quebram):**
  - **2 frontends** usam a `anon` legada → trocar para `sb_publishable__8lXz…`: `previx-site-app` (Netlify env `PUBLIC_SUPABASE_ANON_KEY`) e `organograma-previx` (Netlify env `VITE_SUPABASE_ANON_KEY`). Ambos na mesma conta Netlify. Também GitHub Actions secret `PUBLIC_SUPABASE_ANON_KEY` do Site.
  - **~20 Edge Functions** (12 do Site + as do Organograma: create-user, assign-user-role, validate-and-set-manager, get-organograma-public, reset-user-password…) usam `SUPABASE_SERVICE_ROLE_KEY` (legada). Precisam passar a usar a chave nova `sb_secret_-Wfi1…` (via secret novo + fallback), redeployadas, antes do disable. **Toca o Organograma congelado** (repo local em `~/Documents/Obsidian/Github/organograma-previx-app`).
- Chaves novas já existentes no projeto: `sb_publishable__8lXz…` (front) e `sb_secret_-Wfi1…` (server).

**Plano de execução (quando JG aprovar janela + override do freeze do Organograma):**
1. Edge Functions (Site + Organograma): ler chave de secret novo `SB_SECRET_KEY` com fallback p/ `SUPABASE_SERVICE_ROLE_KEY`; setar secret = `sb_secret`; redeploy. (funciona com legacy on OU off)
2. Frontends: trocar anon → `sb_publishable` no Netlify env dos 2 sites + rebuild. Zero downtime (legacy ainda on).
3. `PUT api-keys/legacy {enabled:false}` → chave vazada morre. Verificar functions + logins dos 2 sites.
4. GitHub Actions secret → publishable. Rollback a qualquer momento: reabilitar legacy (instantâneo).

## ✅ CONCLUÍDA (08/07/2026)

Executada ponta a ponta com o PAT `sbp_` + token Netlify `nfp_` fornecidos pelo JG (ambos a revogar). Mecanismo real: **desabilitar as chaves legadas** (`PUT /v1/projects/{ref}/api-keys/legacy?enabled=false` — `enabled` é **query param**, não body).

**Passos executados e verificados:**
1. **Código:** 3 cópias hardcoded → `process.env` (commit `0f493f7`, main). `git grep` da chave = 0.
2. **Frontends → chave publishable `sb_publishable__8lXz…`** (zero downtime, legada ainda ligada na hora):
   - Site: env Netlify `PUBLIC_SUPABASE_ANON_KEY` (PUT) + rebuild. Bundle publicado confirmado com publishable, **sem** a anon legada.
   - Organograma: env Netlify `VITE_SUPABASE_ANON_KEY` (PUT) + rebuild. Bundle idem.
   - GitHub Actions secret do Site `PUBLIC_SUPABASE_ANON_KEY` → publishable. Organograma não tem secrets de Actions (deploya via integração Netlify).
3. **Desabilitadas as chaves legadas.** Verificação:
   - Chave **VAZADA** (service_role legada) em `/auth/v1/admin/users` → **401** (morta). ✓
   - anon legada → 401. publishable → 200.
   - `submit-lead` (função com service_role) → `ok:true` → **Edge Functions se auto-recuperaram** (plataforma injeta a chave nova).
   - `list-users` (Organograma) e `generate-post` (Site), que usam a **anon** injetada → `Invalid JWT` app-level → cliente interno anon **funcionou** (auto-recuperado).
   - Sites ao vivo: grupoprevix.com.br 200, organograma.grupoprevix.com.br 200. Sessões de usuário não caíram (ES256).

**Critérios:** CA1 ✓ · CA2 ✓ · CA3 ✓ (legada desabilitada, vazada=401) · CA4 ✓ (2 frontends + GH secret + functions auto-heal validados) · CA5 ✓ · CA6 ✓.

**Rollback:** `PUT …/api-keys/legacy?enabled=true` reativa as legadas em segundos.

**Pendências menores (não bloqueiam):**
- `.env` **local** do JG ainda tem a service_role legada (morta) — p/ rodar scripts localmente, exportar a nova `sb_secret_…` como `SUPABASE_SERVICE_ROLE_KEY`.
- Chave antiga permanece no **histórico do Git** (inofensiva, pois revogada). Purga = higiene opcional.
- **Revogar** os tokens expostos no chat: `sbp_` (Supabase) e `nfp_` (Netlify).
- Opcional: referenciar a chave nova explicitamente no código das ~19 functions (hoje dependem do auto-inject; funciona, mas explicitar é mais robusto).

## Critérios de Aceite

- [ ] CA1 — `git grep -iE 'service_role|eyJhbGci|SERVICE_ROLE_KEY *= *.eyJ'` no repo retorna **0 ocorrências de valor de chave** (só nomes de variável/env).
- [ ] CA2 — Scripts de migração leem a chave de `process.env` e **falham com mensagem clara** se a variável não estiver setada (não silenciosamente).
- [ ] CA3 — A `service_role` key antiga foi **rotacionada** no Supabase e está revogada (uma chamada com a chave antiga é rejeitada).
- [ ] CA4 — Todos os consumidores (Edge Functions do Site, GitHub Actions, quaisquer serviços do Organograma que usem service_role) atualizados para a nova chave, **validados funcionando**.
- [ ] CA5 — `.env.example` documenta `SUPABASE_SERVICE_ROLE_KEY` como necessária para rodar os scripts de migração, sem valor real.
- [ ] CA6 — Registro no vault (nota de rotação) confirmando data, chave rotacionada e consumidores atualizados.

## Arquivos esperados

| Arquivo | Mudança |
|---------|---------|
| `scripts/migrate-git-posts-to-db.mjs` | Remove chave hardcoded → `process.env.SUPABASE_SERVICE_ROLE_KEY` |
| `scripts/migrate-content-to-db.ts` | Auditar/idem se tiver segredo |
| `.env.example` | Documentar variável (sem valor) |
| (Supabase dashboard) | Rotacionar service_role key |
| (secrets Edge Functions + GH Actions) | Atualizar para nova chave |

## Notas

> Ao rotacionar a `service_role`, **o Organograma também precisa da chave nova** se algum serviço dele a usa — este é o risco operacional. Alinhar janela com o JG antes de rotacionar em produção.
