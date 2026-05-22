---
id: STORY-022
titulo: "Hardening de Seguranca (SEC-001 a SEC-008)"
fase: 1
modulo: seguranca
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-022 — Hardening de Seguranca (SEC-001 a SEC-008)

## Contexto

O arquivo `SECURITY_DEBT.md` do repositorio lista 8 dividas de seguranca em
aberto (3 de prioridade P1, 5 de P2). Nenhuma foi resolvida ate hoje. Esta
story agrupa o tratamento dessas pendencias antes do deploy definitivo em
producao. Os itens P1 sao bloqueadores de producao.

## Spec de Referencia

- `SECURITY_DEBT.md` (repositorio de codigo)
- [[Documentos Trivia/Padrão Projetos/03 - Segurança/Checklist de Segurança]]

## Criterios de Aceite

- [ ] SEC-001 (P1) — RLS + FORCE confirmado em todas as tabelas
- [ ] SEC-002 (P1) — CORS das Edge Functions fixado no dominio Netlify (remover `*`)
- [ ] SEC-005 (P1) — service_role key do Supabase regenerada (havia sido exposta)
- [ ] SEC-006 (P1) — RLS de `transactions` filtrando por `client_id` via `client_users`
- [ ] SEC-003 (P2) — HTTP Security Headers no `netlify.toml` (X-Frame-Options, CSP, HSTS)
- [ ] SEC-004 (P2) — rate limiting nas Edge Functions publicas
- [ ] SEC-007 (P2) — validacao de formato CPF/CNPJ no input (Zod custom)
- [ ] SEC-008 (P2) — audit log de acoes administrativas
- [ ] `SECURITY_DEBT.md` atualizado, movendo os itens resolvidos para "Resolvidos"

## Implementacao

> Preenchido pelo `@dev` apos concluir.

## QA

> Preenchido pelo `@qa`.

## Notas e Decisoes

- Priorizar os 4 itens P1 — sao bloqueadores de producao.
- SEC-005: regenerar a `service_role key` invalida a chave atual; atualizar o
  secret nas Edge Functions imediatamente apos, senao o backend para.
