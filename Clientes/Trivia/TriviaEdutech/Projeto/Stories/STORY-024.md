# STORY-024 — Remover todas as referências à Lovable

**Módulo:** Infraestrutura / Limpeza  
**Sprint:** Migração  
**Prioridade:** P1  
**Status:** concluído  
**Estimativa:** 2h  
**Sincronizado:** 2026-06-17 — verificado no código (sem referências à Lovable no `src/`); entregue no commit de 13/06.

---

## Contexto

A plataforma foi gerada originalmente via Lovable. Agora opera exclusivamente via GitHub + Netlify + Supabase. Referências à Lovable poluem o código com dependências desnecessárias e podem confundir times futuros.

---

## Acceptance Criteria

- [ ] Nenhuma string `lovable.app`, `lovableproject.com`, `lovable.dev`, `LOVABLE_API_KEY` ou `ai.gateway.lovable.dev` no código-fonte após o merge
- [ ] CORS das Edge Functions não incluem mais origens Lovable
- [ ] `TenantContext.tsx` não faz resolução por hostname Lovable
- [ ] Fallback de AI no `ai-client.ts` usa `PLATFORM_API_KEY` (variável renomeada) apontando para OpenRouter diretamente, sem dependência de gateway Lovable
- [ ] Secret `LOVABLE_API_KEY` renomeado para `PLATFORM_API_KEY` no painel de secrets do Supabase
- [ ] Build TypeScript sem erros (`npx tsc --noEmit`)
- [ ] Deploy das Edge Functions afetadas executado com sucesso

---

## Arquivos a Modificar

### Edge Functions — remover CORS origins Lovable

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/manage-users/index.ts` | Remover `.lovable.app` e `.lovableproject.com` do CORS check |
| `supabase/functions/auto-enroll/index.ts` | Idem |
| `supabase/functions/panda-video/index.ts` | Idem |
| `supabase/functions/batch-enroll/index.ts` | Idem |
| `supabase/functions/manage-ai/index.ts` | Idem |
| `supabase/functions/optimize-content/index.ts` | Idem |
| `supabase/functions/generate-quiz/index.ts` | Idem |
| `supabase/functions/video-proxy/index.ts` | Idem |
| `supabase/functions/create-org/index.ts` | Idem |
| `supabase/functions/accept-invite/index.ts` | Idem |
| `supabase/functions/submit-quiz/index.ts` | Idem |

### Shared AI Client — renomear fallback

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/_shared/ai-client.ts` | Substituir `LOVABLE_API_KEY` → `PLATFORM_API_KEY`, atualizar endpoint do fallback para `https://openrouter.ai/api/v1/chat/completions`, renomear variável `lovableKey` → `platformKey`, atualizar comentários |

### Frontend — resolver tenant sem Lovable

| Arquivo | Mudança |
|---------|---------|
| `src/contexts/TenantContext.tsx` | Remover checks de `lovable.app`, `lovable.dev`, `lovableproject.com` da resolução de hostname |

---

## Passos de Execução

1. Editar todos os arquivos listados acima
2. `npx tsc --noEmit` — zero erros
3. `supabase functions deploy` das funções alteradas
4. No painel Supabase → Edge Functions → Secrets:
   - Adicionar `PLATFORM_API_KEY` com o valor atual de `LOVABLE_API_KEY` (chave OpenRouter)
   - Remover `LOVABLE_API_KEY`
5. Testar geração de quiz e AI tutor em produção

---

## Observações

- O `PLATFORM_API_KEY` deve conter uma chave **OpenRouter** válida (já temos a chave do usuário)
- As origens Lovable nunca foram produção — remoção não tem impacto em usuários reais
- `TenantContext.tsx`: a resolução de tenant para `localhost` e `lovable.app` hoje cai no mesmo branch (`slug = "default"`); remover o check Lovable mantém o comportamento para localhost

---

## File List

- [ ] `supabase/functions/_shared/ai-client.ts`
- [ ] `src/contexts/TenantContext.tsx`
- [ ] `supabase/functions/manage-users/index.ts`
- [ ] `supabase/functions/auto-enroll/index.ts`
- [ ] `supabase/functions/panda-video/index.ts`
- [ ] `supabase/functions/batch-enroll/index.ts`
- [ ] `supabase/functions/manage-ai/index.ts`
- [ ] `supabase/functions/optimize-content/index.ts`
- [ ] `supabase/functions/generate-quiz/index.ts`
- [ ] `supabase/functions/video-proxy/index.ts`
- [ ] `supabase/functions/create-org/index.ts`
- [ ] `supabase/functions/accept-invite/index.ts`
- [ ] `supabase/functions/submit-quiz/index.ts`
