---
name: seguranca-baseline-minimo
description: Baseline mínimo de segurança (todo projeto, inclusive single-repo). Puxe em feature que toca dado/auth/integração.
alwaysApply: false
---

# Segurança — Baseline mínimo (todo projeto)

> Vale para **qualquer** projeto do Padrão OS, inclusive single-repo. É o mínimo inegociável.
> Sistemas **OS** somam a isto o `os-layer/seguranca/os-grade.md` (não repita aqui o que é OS).
> Não faça over-engineering: aplique o que a feature realmente toca (ver `ANTI-PADROES.md`).

## Checklist por feature
- [ ] **Sem secret no client** nem em código versionado. Use `.env.local` + `config/env.ts`
      tipado. No client só entram chaves públicas (ex.: `VITE_SUPABASE_ANON_KEY`).
- [ ] **Input validado na borda** com Zod (request body, params, payload de webhook).
- [ ] **JWT validado** em toda função que toca dado (`auth.getUser()`), nunca confiar em id vindo do client.
- [ ] **RLS habilitada** em toda tabela com dado de usuário; policies por papel. Sem policy = sem acesso.
- [ ] **Erros não vazam stack/secret** para o cliente; logue o detalhe no servidor.
- [ ] **CORS** restrito ao domínio da app em produção (não `*`).
- [ ] **Dependências**: sem pacote com vuln conhecida bloqueante (`npm audit`).

## Variáveis de ambiente
| Pode no client (`VITE_*`)            | NUNCA no client                              |
|--------------------------------------|----------------------------------------------|
| `VITE_SUPABASE_URL`, `*_ANON_KEY`    | `service_role_key`, webhooks secrets, tokens |

## Dívida de segurança
Toda exceção consciente vai para `docs/SECURITY_DEBT.md` com prioridade e plano — **nunca** em
silêncio. Itens P0 são bloqueantes para produção.

## Quando subir para OS-grade
Ao virar sistema OS (multi-domínio) ou tocar PII/financeiro/integrações de terceiros, aplique
`os-layer/seguranca/os-grade.md` (RLS FORCE, audit append-only, Vault, validação de webhook HMAC).
