---
id: STORY-003
epic: "01 — Hunter: Descoberta de Prospects"
titulo: "Edge Function hunter — Apify scraping + validação de presença digital"
sprint: 2
prioridade: P0
status: cancelado
tipo: 💻 Feature
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [security_review, zod_validation, rls_test, cost_tracking]
depende_de: ["STORY-001", "STORY-002"]
criado: 2026-05-06
atualizado: 2026-05-11
---

# Story 2.1: Edge Function Hunter — Apify + Validação HTTP

**Epic:** 01 — Hunter: Descoberta de Prospects
**Story ID:** 2.1
**Sprint:** 2
**Prioridade:** 🔴 Critical
**Points:** 8
**Esforço:** ~4h
**Status:** ⚪ Ready
**Tipo:** 💻 Feature

---

## 🔀 Cross-Story Decisions

| Decisão | Origem | Impacto |
|---------|--------|---------|
| Sem LLM no Hunter | architecture.md | Apenas scraping Apify + heurística regex — reduz custo |
| Comunicação via fila Supabase | architecture.md | Hunter não chama Qualifier diretamente; insert em `prospects` dispara trigger |
| Blocklist antes de qualquer insert | SECURITY_DEBT.md / LGPD | Verificar `blocklist` table antes de inserir prospect |

---

## 📋 User Story

**Como** sistema Trivia Hunter,
**Quero** que a Edge Function `hunter` busque SMBs via Apify Google Maps Scraper, valide se o site listado é Instagram/Linktree/Facebook/ausente, e insira os prospects no Supabase com status `discovered`,
**Para** alimentar o pipeline de prospecção automaticamente sem intervenção humana na descoberta.

---

## 🎯 Objetivo

Implementar `supabase/functions/hunter/index.ts` com:
1. Recebe `{ nicho, regiao, meta_dia }` via POST
2. Chama Apify Actor `compass/google-maps-scraper`
3. Para cada resultado: valida presença digital via HTTP
4. Verifica blocklist
5. Insere em `prospects` com status `discovered`
6. Registra execução e custo em `agent_executions`

---

## ✅ Tasks

### Phase 1: Estrutura e Validação de Input (45min)

- [ ] **1.1** Adicionar validação Zod no início da Edge Function:
  ```typescript
  import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
  
  const InputSchema = z.object({
    nicho: z.string().min(2).max(100),
    regiao: z.string().min(2).max(100),
    meta_dia: z.number().int().min(1).max(500),
  })
  ```
- [ ] **1.2** Validar JWT via `supabase.auth.getUser()` (apenas service_role bypassa)
- [ ] **1.3** Registrar início da execução em `agent_executions` com status `running`

### Phase 2: Integração Apify (1.5h)

- [ ] **2.1** Criar cliente Apify usando `APIFY_API_TOKEN` (Deno.env):
  ```typescript
  const APIFY_BASE = 'https://api.apify.com/v2'
  const actor = 'compass/google-maps-scraper'
  ```
- [ ] **2.2** Montar payload do Actor com `nicho`, `regiao`, `maxResults: meta_dia * 3` (margem para filtros)
- [ ] **2.3** Iniciar run do Actor e aguardar completion (polling com timeout 5min)
- [ ] **2.4** Buscar results do dataset gerado

### Phase 3: Validação de Presença Digital (1h)

Para cada resultado do Apify:
- [ ] **3.1** Extrair `website` do resultado (pode ser null, Instagram, Linktree, Facebook, site real)
- [ ] **3.2** Implementar `classifyWebPresence(url: string | null)`:
  - `null | ''` → `absent`
  - Match regex Instagram/Facebook/Linktree → `social_only`
  - Outra URL → fetch HEAD com timeout 5s → `has_site` (200-399) ou `broken_site` (erro/4xx/5xx)
- [ ] **3.3** Filtrar: só prosseguir com `absent` e `social_only`

### Phase 4: Blocklist e Insert (30min)

- [ ] **4.1** Para cada prospect filtrado:
  - Buscar em `blocklist` por `telefone` ou `email`
  - Se na blocklist → skip (logar mas não inserir)
- [ ] **4.2** Inserir em `prospects` com:
  ```typescript
  {
    nome, categoria: nicho, regiao,
    telefone, email, website_atual,
    fonte: 'apify_google_maps',
    raw_data: resultApify,
    status: 'discovered'
  }
  ```
- [ ] **4.3** Parar ao atingir `meta_dia` inserts bem-sucedidos

### Phase 5: Observabilidade e Resposta (30min)

- [ ] **5.1** Atualizar `agent_executions`:
  - `status: 'success'`, `finished_at`, `cost` (calcular via Apify billing API ou estimativa)
- [ ] **5.2** Retornar JSON com resumo:
  ```json
  { "discovered": 42, "skipped_blocklist": 3, "skipped_has_site": 15, "cost_usd": 0.12 }
  ```
- [ ] **5.3** Em caso de erro: atualizar `agent_executions` com `status: 'failed'`, `error: stack_trace`

---

## 🔍 Critérios de Aceite

- [ ] Input inválido retorna HTTP 422 com mensagem Zod clara
- [ ] Chamada sem auth retorna HTTP 401
- [ ] Apify Actor roda e retorna resultados para nicho de teste ("restaurante", "São Paulo")
- [ ] Apenas prospects sem site real são inseridos (`absent` ou `social_only`)
- [ ] Blocklist verificada — número/email em blocklist não é inserido
- [ ] `agent_executions` tem registro com custo após cada execução
- [ ] Meta `meta_dia` respeitada (não inserir mais do que o configurado)
- [ ] Resposta inclui contagem de descobertos, skipped e custo

---

## ⚠️ Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Apify timeout (>5min) | Polling com timeout configurável + fallback gracioso |
| Rate limit Apify | Implementar retry exponential backoff |
| Insert duplicado (mesmo telefone) | Constraint UNIQUE em `prospects.telefone` ou upsert |
| Custo Apify descontrolado | Validar `meta_dia` máximo no Zod (500/dia hard limit) |

---

## 🔒 Checklist de Segurança

- [ ] `APIFY_API_TOKEN` lida de `Deno.env` apenas (nunca hardcoded)
- [ ] Input validado com Zod antes de qualquer operação externa
- [ ] Dados pessoais (telefone, email) inseridos apenas após check de blocklist
- [ ] Edge Function usa `service_role` key (não anon)

---

## 📎 Arquivos Relevantes

- `supabase/functions/hunter/index.ts` — implementar aqui
- `supabase/migrations/20260506000000_init.sql` — schema de `prospects` e `blocklist`
- `architecture.md` — fluxo Hunter → insert → trigger Qualifier
- `SECURITY_DEBT.md` — LGPD e blocklist requirements

---

## 🤖 Dev Agent Record

- **Agent:** —
- **Iniciado em:** —
- **Branch:** —
- **Observações:** —

---

## Notas e Decisões

- Cancelada em 2026-05-11: escopo absorvido pela STORY-002 (Hunter completo)
- Escopo residual não coberto (blocklist check + classifyWebPresence) foi extraído para STORY-006

---

*🌊 Story criada por River (@sm) | Handoff de Morgan (@pm)*
