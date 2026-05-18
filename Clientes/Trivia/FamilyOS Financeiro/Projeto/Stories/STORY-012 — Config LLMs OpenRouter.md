---
id: STORY-012
titulo: "Config LLMs (OpenRouter BYOK por família, seleção de modelo, monitor de custo)"
fase: 2
modulo: M8 Config LLMs
status: done
prioridade: média
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-012 — Config LLMs (OpenRouter)

## Contexto

Cada família configura sua própria API key do OpenRouter (Bring Your Own Key). A UI permite selecionar o modelo padrão, inserir/atualizar a chave, e ver o status de conexão. A key é criptografada no banco — nunca exposta ao frontend.

## Critérios de Aceite

- [x] CA1 — UI de configuração: input para API key com máscara (mostra apenas últimos 4 chars)
- [x] CA2 — Seleção de modelo padrão via dropdown (anthropic/claude-sonnet-4-5, etc.)
- [x] CA3 — API key criptografada no banco via `pgcrypto` — nunca retornada ao client
- [x] CA4 — Validação: testar key contra OpenRouter antes de salvar (health check)
- [x] CA5 — Status visual: conectado/desconectado com última verificação
- [x] CA6 — RLS: apenas admin da família pode ver/editar config de LLM
- [x] CA7 — Edge Functions usam a key da família para chamadas ao OpenRouter
- [ ] CA8 — Monitor de custo: mostrar uso acumulado do mês (pendente — requer API de billing OpenRouter)

## Tabelas de Banco

```sql
CREATE TABLE llm_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'openrouter',
  api_key_encrypted TEXT NOT NULL,
  default_model TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4-5',
  last_verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, provider)
);
-- Ver migration 20260504000008_create_llm_config.sql
```

---

## Implementação

**Status:** Done (parcial: CA8 pendente — depende de API billing OpenRouter)
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000008_create_llm_config.sql`
- `src/features/llm-config/components/LLMConfigSection.tsx`
- `src/features/llm-config/api/useLLMConfig.ts`
- `src/features/llm-config/types/index.ts`
- `src/features/family/components/FamilySettingsPage.tsx` (integra LLMConfigSection)

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite core validados (CA1-CA7)
- [x] RLS validado (somente admin)
- [x] Key nunca retornada ao client (apenas flag `hasKey` + últimos 4 chars)
- [x] Build sem erros, TypeScript strict

**Notas QA:**
- Input usa `type="password"` com toggle de visibilidade parcial
- Dropdown de modelos com opções populares do OpenRouter
- Design editorial Trívia: border-bottom inputs, mono font para key

---

## Notas e Decisões

- BYOK garante que cada família controla seus custos diretamente
- Monitor de custo (CA8) depende de endpoint billing do OpenRouter — será implementado quando disponível
- Criptografia via `pgcrypto` com chave em variável de ambiente (`OPENROUTER_ENCRYPTION_KEY`)
- Config LLM foi movida de Fase 3 para Fase 2 por ser requisito para o Agente funcionar
