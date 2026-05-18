# SECURITY_DEBT — C. Brasil Financeiro

> Registro de vulnerabilidades conhecidas e debito de seguranca. Atualizar quando identificar ou resolver.

---

## Debito Ativo

| ID | Prioridade | Descricao | Status |
|----|------------|-----------|--------|
| SEC-001 | P1 | Confirmar RLS + FORCE em todas as tabelas criadas | Pendente |
| SEC-002 | P1 | CORS: fixar dominio Netlify em producao (remover `*`) | Pendente |
| SEC-003 | P2 | HTTP Security Headers no `netlify.toml` (X-Frame-Options, CSP, HSTS) | Pendente |
| SEC-004 | P2 | Rate limiting em todas as Edge Functions publicas | Pendente |
| SEC-005 | P1 | Regenerar service_role key do Supabase (exposta em conversa anterior) | Pendente |
| SEC-006 | P1 | RLS em transactions deve filtrar por client_id via client_users | Pendente |
| SEC-007 | P2 | Validacao de formato CNPJ/CPF no input (Zod custom) | Pendente |
| SEC-008 | P2 | Audit log de acoes administrativas (quem alterou o que) | Pendente |

---

## Resolvidos

| ID | Data | Descricao |
|----|------|-----------|
| (nenhum ainda) | | |

---

## Prioridades

- **P0 (Critico):** Corrigir imediatamente — bloqueia deploy em producao
- **P1 (Alto):** Corrigir em ate 1 semana
- **P2 (Medio):** Backlog — corrigir quando possivel
