---
id: STORY-016
titulo: "DevOps — Commit, Deploy e Publicação em Produção"
fase: 1
modulo: "devops / infra"
status: backlog
prioridade: alta
agente_responsavel: "@devops"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-016 — DevOps: Commit, Deploy e Publicação em Produção

## Contexto

Após STORY-015 Gate PASS, o `@devops` garante que tudo esteja commitado, migrations aplicadas, Edge Functions deployadas e frontend publicado no Netlify, com smoke test final.

## Pré-condições

- STORY-014 + STORY-015 Gate: **PASS**
- `main` sem conflitos pendentes

## Checklist de Execução

### 1. Pré-deploy
```bash
git status && npm run build && npm run lint && npm audit
```
Qualquer falha: acionar `@dev` antes de continuar.

### 2. Banco
```bash
supabase db diff
supabase db push
supabase db advisors   # confirmar RLS
```

### 3. Edge Functions
```bash
supabase functions deploy <todas as funções>
supabase functions list
```

### 4. Secrets
```bash
supabase secrets list
```
Confirmar: `ENCRYPTION_KEY`, `ZAPI_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY_FALLBACK`, `MAX_TURNS_DEFAULT`, `LOG_LEVEL`, `TRANSCRIPTION_PROVIDER`, chave do provider de transcrição.

### 5. Frontend
```bash
git push origin main   # dispara Netlify CI/CD
```
Acompanhar até status: **Published**.

### 6. Smoke Test em produção
- [ ] Login funciona
- [ ] Dashboard, agentes, conversas, pipeline carregam
- [ ] Edge Function agent-runner responde
- [ ] Webhook Z-API acessível

## Critérios de Conclusão

- [ ] `git status` limpo
- [ ] Migrations aplicadas sem erro
- [ ] Todas Edge Functions na versão correta
- [ ] Secrets confirmados
- [ ] Netlify: Published
- [ ] Smoke test: PASS
- [ ] `PROJECT_REQUIREMENTS.md` atualizado

---

## Implementação

**Status:** `backlog` (aguarda STORY-015)

**Depende de:** STORY-014, STORY-015

**SHA do commit deployado:**

**URL produção:**

**Data:**

**Status final:** ⬜ Pendente / ✅ OK / ❌ Rollback
