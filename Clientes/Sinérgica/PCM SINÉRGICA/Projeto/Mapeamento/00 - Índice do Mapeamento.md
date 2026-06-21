# Mapeamento Completo — PCM Sinérgica

> Mapeamento detalhado de todo o sistema, feito pelos agentes do Triviaiox e **verificado contra a produção** (SQL direto, download das functions de prod, testes ao vivo na Evolution).
> Data: **2026-06-18** · Supabase `sfprfvltbtysvtsqutla` · Evolution `ze-pcm-v2` (Cloudfy)

## Documentos

| # | Documento | Conteúdo |
|---|---|---|
| 01 | [[01 - Frontend]] | SPA React/Vite, rotas, auth, 12 módulos, build/Netlify |
| 02 | [[02 - Banco de Dados]] | 63 tabelas, colunas/FKs/triggers, drift de migrations |
| 03 | [[03 - Edge Functions]] | 20 functions deployadas, gatilhos, secrets, verify_jwt |
| 04 | [[04 - Agente Ze e WhatsApp]] | pipeline do Zé, prompts, tools, estado ao vivo |
| 05 | [[05 - Integracoes Externas]] | Auvo, OpenRouter, Evolution |
| 06 | [[06 - Seguranca e Infra]] | RLS/FORCE, policies, buckets, IDOR, CORS, infra |
| 00b | [[00b - Verificacao]] | re-checagem adversarial dos fatos críticos em produção |

---

## Resumo executivo (verificado em produção)

**O sistema está vivo e em uso real:** 51 clientes, **517 chamados (OS)**, 172 mensagens do Zé, 76 itens de backlog. Frontend na Netlify, banco e lógica na Supabase, WhatsApp via Evolution no Cloudfy.

**Mas só uma fatia está realmente em operação:**
- ✅ **Núcleo PCM + Agente Zé:** funcionando (Zé conectado, fila saudável — 0 pendências, responde em ~7-9s).
- ⚠️ **Auvo: codificado mas NUNCA usado** — 0 webhooks recebidos, 0 equipamentos sincronizados.
- ⚠️ **Comercial/Inspeção pouco usado:** propostas = 0, inspeções = 1, plano preventivo = 1.
- ⚠️ **Papéis:** só existe **1 perfil (admin)** no banco — `escritorio`/`tecnico` nunca foram exercitados.

---

## Achados consolidados

### Segurança (ver `SECURITY_DEBT.md`)
| ID | Sev | Achado |
|---|---|---|
| SEC-001 | 🔴 P0 | **IDOR** confirmado na prod (ze-agent v21, linhas 606-611): `atualizar_chamado` faz UPDATE por `numero_os` sem `client_id` → um condomínio edita/cancela chamado de outro. |
| SEC-002 | 🟠 P1 | **0 de 63 tabelas** com `FORCE ROW LEVEL SECURITY`. |
| SEC-010 | 🟠 P1 | Buckets **`inspecao-fotos` e `pcm-relatorios` PÚBLICOS** (de 5 buckets). |
| SEC-012 | 🟠 P1 | **`laudos-agent` é função pública** (verify_jwt=false) e chama Claude Sonnet (caro) — risco de abuso de custo. |
| SEC-013 | 🟠 P1 | Webhook da Evolution autentica só com a **anon key (role=anon, pública)** — qualquer um com ela forja mensagens no pipeline do Zé. |
| SEC-006 | 🟠 P1 | `pcm-auvo-webhook` espera `AUVO_WEBHOOK_SECRET` que **não está configurado** → checagem de segredo pulada. |
| SEC-003/004/005 | 🟠 P1 | CORS `*`, sem validação Zod, sem `auth.getUser()` em código. |
| SEC-014 | 🟡 P2 | service_role JWT em texto no comando do cron (`cron.job`). |
| SEC-011 | 🟡 P2 | ~22 tabelas de outro sistema (CRM/"Nina") vazias no mesmo projeto. |

### Operacional / integridade
- **Drift de migrations:** 17 aplicadas vs 24 no repo. As 7 não-registradas já existem em produção → usar `supabase migration repair --status applied` (NÃO `db push` — 3 delas têm `CREATE POLICY` sem `IF NOT EXISTS` e quebrariam).
- **Auvo inativo:** automação pós-finalização e sync de equipamentos nunca rodaram.
- **Build pula `tsc`:** Netlify usa `npx vite build`; erros de tipo passam pro deploy.
- **Divergência de modelo LLM:** `models.ts` (gemini-3.1-flash-lite / Sonnet 4.6) vs runtime do Zé (gemini-2.5-flash).
- **Laudos SPDA:** maior superfície (motor NBR 5419 + agentes IA + PDF no cliente); usa tabelas `laudos_*` (não `pcm_`).
