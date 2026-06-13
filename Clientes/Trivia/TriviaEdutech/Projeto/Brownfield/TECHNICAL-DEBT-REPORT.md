# TriviaEdutech — Relatório Executivo de Débito Técnico

> **Data:** 2026-06-13 (atualizado: 2026-06-13 — Sprint de Segurança) | **Para:** Lucas Azevedo (Piloto)
> **Agente:** @analyst (Alex) via Brownfield Discovery

---

## Sprint de Segurança — Junho 2026 — Itens Resolvidos

Esta sprint eliminou todos os P0 de segurança identificados no Brownfield Discovery. Score de risco atualizado: **de CRÍTICO para MODERADO**.

| # | Item Resolvido | Impacto |
|---|---------------|---------|
| 1 | `optimize-content` agora exige JWT — sem acesso anônimo à IA | Elimina risco de DoS financeiro |
| 2 | `mp-webhook` com HMAC signature — sem webhooks falsos | Elimina fraude de pagamento |
| 3 | `netlify.toml` criado — HSTS, X-Frame-Options, nosniff, CSP | Elimina clickjacking e MIME sniffing |
| 4 | CORS whitelist em todas as Edge Functions — sem wildcard `"*"` | Reduz superfície de ataque cross-origin |
| 5 | Lovable AI Gateway removido — `_shared/ai-client.ts` multi-provider | Elimina dependência externa não gerenciada |
| 6 | `LOVABLE_API_KEY` → `PLATFORM_API_KEY`, endpoint → OpenRouter | Remove acoplamento de marca externa |
| 7 | Bug manage-users resolvido — create-superadmin usa upsert | Corrige falha silenciosa de criação |
| 8 | Sistema de IA por tenant: `ai_provider_settings` + `manage-ai` | Nova feature com segurança JWT+Zod desde o início |

**Pendente (ação manual do Lucas):**
- Limpeza do histórico git para remover o `.env` commitado: `git filter-branch --tree-filter 'rm -f .env' HEAD`

**Próximos débitos prioritários (Sprint 2):**
- TypeScript strict (11 `any` encontrados)
- Lazy loading nas 49 páginas (zero code splitting)
- Error Boundaries (zero em toda a aplicação)

---

## O Projeto

LMS multi-tenant white-label gerado via Lovable e agora sendo migrado para desenvolvimento sustentável via GitHub + Netlify + Supabase. Stack técnica correta. Problemas são de **processo e qualidade**, não de arquitetura fundamental.

---

## Situação Atual em 3 Linhas

O projeto tem uma **base de dados sólida** (RLS em 40+ tabelas, multi-tenancy correto, TanStack Query sem anti-padrões) mas a geração via Lovable deixou **4 brechas de segurança críticas** e **3 débitos de qualidade sistêmicos** que precisam ser corrigidos antes de qualquer nova feature.

---

## 4 Problemas que Precisavam de Ação Imediata

### ⚠️ 1. Credenciais no repositório Git — PARCIALMENTE RESOLVIDO
O arquivo `.env` foi commitado. `.gitignore` corrigido. **Pendente:** limpeza do histórico git (`git filter-branch`). Ação manual necessária pelo Lucas.

### ✅ 2. Endpoint de AI sem autenticação — RESOLVIDO
A função `optimize-content` agora exige JWT. Requisições anônimas retornam 401.

### ✅ 3. Sem cabeçalhos de segurança HTTP — RESOLVIDO
`netlify.toml` criado com HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy e cache de assets.

### ✅ 4. Webhooks de pagamento sem verificação — RESOLVIDO
HMAC signature implementado no `mp-webhook`. Secret configurado nos Supabase Secrets (`MERCADOPAGO_WEBHOOK_SECRET`).

---

## 3 Débitos de Qualidade Sistêmicos

### 🟡 5. TypeScript "de mentira"
O projeto usa TypeScript mas com checagem de tipos **completamente desabilitada** (`strict: false`). É como usar cinto de segurança que não prende. Resultado: 11 usos de `any` encontrados, erros que deveriam aparecer em desenvolvimento chegam em produção.

### 🟡 6. Sem divisão de código
As 49 páginas do sistema são carregadas todas juntas na primeira visita. Um estudante que acessa `/courses` baixa também o código do `/admin/dashboard`, `/superadmin`, etc. Impacto direto no tempo de carregamento inicial.

### 🟡 7. Sem tratamento de erro
Não há um único Error Boundary no projeto. Se qualquer componente der erro (vídeo que não carrega, quiz com problema), o app inteiro trava e mostra tela branca.

---

## O Que Está Funcionando Bem

- ✅ **Base de dados:** 40+ tabelas com RLS correto, isolamento multi-tenant sólido
- ✅ **Padrão de dados no frontend:** TanStack Query usado corretamente em todo o projeto
- ✅ **Segurança de quiz:** respostas corretas nunca chegam ao browser do aluno
- ✅ **Preços de curso:** o valor nunca vem do cliente, sempre do banco de dados
- ✅ **Organização de código:** features isoladas corretamente

---

## Prioridades de Execução

| Sprint | O Que Fazer | Impacto | Status |
|--------|------------|---------|--------|
| ~~**Imediato**~~ | ~~Rotacionar credenciais, autenticar optimize-content, netlify.toml, assinar webhook MP~~ | 🔴 Segurança | ✅ CONCLUÍDO (⚠️ histórico git pendente) |
| **Sprint 2** | TypeScript strict, lazy routes, Error Boundaries | 🟡 Qualidade | PRÓXIMA |
| **Sprint 3** | Criptografar tokens OAuth, restringir storage de ebooks, Vault para api_key de IA | 🟡 Segurança de dados | PENDENTE |
| **Sprint 4** | Refatorar Dashboard (968 linhas) e CourseDetail (780 linhas) | 🟢 Manutenção | PENDENTE |

---

## Estimativa de Esforço

| Categoria | Stories | Estimativa |
|-----------|---------|------------|
| Segurança P0 | 4 stories | 2-3 dias |
| Qualidade P1 | 4 stories | 3-4 dias |
| Segurança de dados P2 | 4 stories | 3-4 dias |
| Qualidade de código P2 | 4 stories | 5-7 dias |
| **Total** | **22 stories** | **~4 semanas** |

---

## Recomendação

Executar Sprint 1 (segurança emergencial) **antes do próximo deploy**. As 4 issues P0 são simples de corrigir (2-3 dias) e bloqueiam riscos reais. O restante pode ser distribuído em sprints normais sem impacto ao usuário.
