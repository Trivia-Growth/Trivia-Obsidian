# SECURITY_DEBT — [Nome do Projeto]

Documento vivo para rastrear vulnerabilidades conhecidas e débitos de segurança. Atualizar sempre que uma vulnerabilidade for identificada ou resolvida.

## Prioridades

- **P0 (Crítico):** Corrigir imediatamente — bloqueia deploy
- **P1 (Alto):** Corrigir em até 1 semana
- **P2 (Médio):** Backlog — corrigir quando possível

---

## Itens Pendentes

| ID | Prioridade | Descrição | Data | Responsável |
|----|------------|-----------|------|-------------|
| SEC-001 | P1 | Confirmar RLS + FORCE em todas as tabelas criadas no Supabase | [data] | — |
| SEC-002 | P1 | CORS: fixar domínio Netlify em produção (remover `*`) | [data] | — |
| SEC-003 | P2 | HTTP Security Headers configurar no netlify.toml (X-Frame-Options, CSP, HSTS) | [data] | — |
| SEC-004 | P2 | Rate limiting: implementar para todas as Edge Functions públicas | [data] | — |

---

## Itens Resolvidos

| ID | Descrição | Data Resolução | Solução |
|----|-----------|----------------|---------|
| — | — | — | — |

---

## Checklist de Segurança (Por Feature)

Antes de marcar qualquer story como concluída que envolva banco de dados ou Edge Functions:

- [ ] RLS habilitado + FORCE na(s) tabela(s) criada(s)
- [ ] Policies definidas por papel
- [ ] Nenhum segredo exposto no client-side (`VITE_` apenas URL e anon key)
- [ ] Edge Function: JWT validado via `auth.getUser()` (nunca confiar no body)
- [ ] Edge Function: input validado com Zod
- [ ] Edge Function: rate limiting implementado
- [ ] Valores financeiros/sensíveis calculados no backend (nunca vindos do frontend)
- [ ] `npm audit` sem vulnerabilidades Critical ou High

---

## Como Adicionar um Item

1. Copiar uma linha da tabela "Itens Pendentes"
2. Preencher: ID sequencial (SEC-XXX), prioridade, descrição clara, data de descoberta, responsável
3. Commitar junto com o código que gerou o débito

## Como Resolver um Item

1. Implementar a correção
2. Mover a linha de "Itens Pendentes" para "Itens Resolvidos"
3. Preencher data de resolução e descrever a solução
4. Commitar junto com o código de correção
