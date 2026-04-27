# Checklist de Segurança

Use este checklist **por feature** — antes de marcar qualquer story que envolva banco de dados ou Edge Functions como concluída.

---

## Por Feature (Banco de Dados)

- [ ] **RLS habilitado** na(s) tabela(s) criada(s)
  ```sql
  ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
  ALTER TABLE nome_tabela FORCE ROW LEVEL SECURITY;
  ```
- [ ] **Policies definidas** por papel (quem pode ler, escrever, deletar)
- [ ] **Nenhum dado sensível** acessível sem autenticação
- [ ] **Campos mínimos** no SELECT — nunca `select('*')` em dados sensíveis

---

## Por Feature (Edge Functions)

- [ ] **JWT validado** via `auth.getUser()` — nunca confiar em dados do body para identificar o usuário
- [ ] **Input validado** com Zod antes de qualquer processamento
- [ ] **Rate limiting** implementado para endpoints públicos ou de alto custo
- [ ] **CORS** configurado — em dev pode ser `*`; em produção deve ser o domínio Netlify
- [ ] **service_role key** usada apenas quando necessário (bypass de RLS) — nunca exposta

---

## Variáveis de Ambiente

| Variável | Pode ir no frontend? |
|----------|---------------------|
| `VITE_SUPABASE_URL` | Sim |
| `VITE_SUPABASE_ANON_KEY` | Sim (protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Nunca** |
| Webhook URLs | **Nunca** |
| Senhas, tokens, API keys externas | **Nunca** |

---

## Débito de Segurança Padrão (Todo Projeto Novo)

Ao iniciar um projeto, criar `SECURITY_DEBT.md` com estes itens pré-cadastrados:

| ID | Prioridade | Descrição |
|----|------------|-----------|
| SEC-001 | P1 | Confirmar RLS + FORCE em todas as tabelas criadas |
| SEC-002 | P1 | CORS: fixar domínio Netlify em produção (remover `*`) |
| SEC-003 | P2 | HTTP Security Headers no `netlify.toml` (X-Frame-Options, CSP, HSTS) |
| SEC-004 | P2 | Rate limiting em todas as Edge Functions públicas |

---

## Prioridades

- **P0 (Crítico):** Corrigir imediatamente — bloqueia deploy em produção
- **P1 (Alto):** Corrigir em até 1 semana
- **P2 (Médio):** Backlog — corrigir quando possível

---

## Referências Rápidas

- [[RLS Supabase — Template]] — SQL pronto para copiar
- [[Edge Functions Seguras]] — template completo de Edge Function
