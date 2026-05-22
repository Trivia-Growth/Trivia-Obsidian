---
id: STORY-002
titulo: "Reconfigurar integrações no projeto Supabase novo (pós-migração)"
fase: 1
modulo: "Integrações"
status: em-progresso
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-002 — Reconfigurar integrações no projeto Supabase novo

## Contexto

Em 19/05/2026 o sistema foi migrado do Supabase antigo (`sjciabkjuqefponkfqan`,
Lovable Cloud) para o projeto oficial `eqsjvacbhrezlgqpwipv` (`hubtransportadorashzm`).
A migração levou só a estrutura (33 migrations) e os dados de cadastro — **não levou
envios, usuários nem as credenciais das integrações**.

Diagnóstico em 22/05 (via Supabase Management API):
- Banco novo: 0 envios, 0 pedidos, 0 usuários, 0 cron agendado.
- Só ~3 das 8 integrações têm credenciais (e parciais) configuradas.
- Os 2 projetos Supabase antigos estão vivos, mas são da Lovable Cloud (sem acesso).

**Decisão JG (22/05):** não recuperar os dados antigos; reconfigurar as integrações
e re-sincronizar pelas APIs. A operação não está sendo afetada no momento.

## Spec de Referência

- [[Projeto/Credenciais das Integrações]] — checklist de credenciais a coletar
- [[Projeto/Roadmap]] — Estado Atual e Fase 1.5
- [[00 - Índice]]

## Critérios de Aceite

- [ ] CA1 — Credenciais das 8 integrações coletadas e configuradas como secrets
  no projeto `eqsjvacbhrezlgqpwipv`
- [ ] CA2 — Webhooks dos marketplaces/transportadoras re-registrados na URL nova
  (`https://eqsjvacbhrezlgqpwipv.supabase.co/functions/v1/*-webhook`)
- [ ] CA3 — Polling automático (cron) agendado para as funções de rastreio
- [ ] CA4 — Variáveis de ambiente configuradas no Netlify
- [ ] CA5 — Usuários de acesso recriados (banco está sem usuários)
- [ ] CA6 — Sincronização validada: dados reais entrando no banco novo

---

## Implementação

**Status:** `em-progresso` — fase de diagnóstico concluída; aguardando coleta de credenciais.

**Feito até agora (22/05):**
- Diagnóstico completo do projeto novo (banco, secrets, cron, Edge Functions).
- Mapeadas as ~30 credenciais exigidas pelo código vs. as ~9 configuradas.
- Checklist de credenciais criado para o responsável pela logística.

**Próximo passo:** receber as credenciais do responsável pela logística e
configurá-las no Supabase.

---

## Pendências / Próximos Passos

1. **Credenciais** — coletar conforme [[Projeto/Credenciais das Integrações]].
   Atenção aos refresh tokens de Mercado Livre e Amazon (geração via OAuth).
2. **Webhooks** — re-registrar em cada plataforma após as credenciais.
3. **Cron** — agendar polling depois que as integrações responderem.
4. **Netlify** — configurar env vars (requer acesso ao Netlify — JG).
5. **Usuários** — recriar os acessos no projeto novo.

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico da migração de Supabase.
- `2026-05-22` — Decisão JG: re-sincronizar em vez de recuperar dados antigos.
- `2026-05-22` — Sugestão: começar validando o Melhor Envio (integração mais
  próxima de estar configurada) como prova de conceito.
