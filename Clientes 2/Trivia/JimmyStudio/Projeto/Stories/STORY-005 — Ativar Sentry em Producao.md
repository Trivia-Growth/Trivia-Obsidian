---
id: STORY-005
titulo: "Ativar Sentry em Produção"
fase: 2
modulo: "infra"
status: backlog
prioridade: media
agente_responsavel: "@devops"
criado: 2026-04-29
atualizado: 2026-04-29
---

# STORY-005 — Ativar Sentry em Produção

## Contexto

O código de integração com Sentry já existe (`src/observability/sentry.ts`) mas só funciona se `VITE_SENTRY_DSN` estiver configurado no Netlify. Atualmente, sem DSN configurado, erros de produção que os usuários encontram são invisíveis — só aparecem se o usuário reportar.

Com produção sem staging, ter observabilidade de erros é crítico para detectar regressões após deploys.

## Spec de Referência

- `architecture.md` — seção Observabilidade
- `PROJECT_REQUIREMENTS.md` — item 8 da tabela de Questões Abertas

## Critérios de Aceite

- [ ] CA1 — Projeto criado no Sentry (sentry.io) para o Jimmy Studio
- [ ] CA2 — `VITE_SENTRY_DSN` configurado nas env vars do Netlify
- [ ] CA3 — Erros de JavaScript aparecem no dashboard Sentry após o próximo deploy
- [ ] CA4 — Filtros configurados: ignorar `ResizeObserver` e `Non-Error promise rejection` (já no código)
- [ ] CA5 — Sample rate configurado: 10% em produção (já no código — verificar se está aplicado)
- [ ] CA6 — Alert configurado no Sentry para erros novos (por e-mail ou Slack)

## Restrições

- Apenas configurar o DSN — não alterar o código de integração (já funciona)
- Não expor dados sensíveis de usuário no Sentry (verificar `beforeSend` hook)

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

**O que fazer:**
1. Criar projeto em sentry.io
2. Copiar o DSN
3. Configurar `VITE_SENTRY_DSN` no Netlify (Site Settings → Environment Variables)
4. Trigger deploy no Netlify

Nenhum arquivo de código precisa ser alterado se a integração já está correta.

---

## QA

> Preenchido pelo `@qa` após implementação.

**Gate:** —

**Checklist:**
- [ ] Erro de teste aparece no dashboard Sentry após deploy
- [ ] Nenhum dado sensível (senhas, tokens) aparece nos eventos
- [ ] Alert de e-mail configurado para erros novos

**Notas:** —
