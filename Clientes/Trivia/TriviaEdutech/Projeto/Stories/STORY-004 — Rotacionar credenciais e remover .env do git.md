---
id: STORY-004
titulo: Rotacionar credenciais e remover .env do git
fase: 1
modulo: Segurança
status: em-andamento
prioridade: P0-emergencial
agente_responsavel: "@devops + @dev"
criado: 2026-06-13
atualizado: 2026-06-17
seguranca: SEC-016
---

# STORY-004 — Rotacionar credenciais e remover .env do git

> **Progresso parcial (2026-06-17):** `.env` removido do *tracking* atual (`git rm --cached`) e confirmado no `.gitignore` (CA-03 ✅). **Ainda PENDENTE e P0:** rotação das chaves Supabase (CA-01), limpeza do `.env` do **histórico** git via BFG/filter-branch (CA-02 — as chaves ainda estão em commits antigos), config no Netlify/Supabase Secrets (CA-04, CA-05). Como as chaves preenchidas hoje são públicas de frontend, o risco é baixo, mas a rotação do service role key deve ser confirmada.

## Contexto

O arquivo `.env` foi commitado no repositório. Todas as chaves Supabase, Mercado Pago e APIs de AI estão no histórico git. **Executar antes de qualquer outro trabalho.**

## Critérios de Aceite

- [ ] CA-01: Todas as chaves Supabase rotacionadas (anon key + service role key)
- [ ] CA-02: `.env` removido do histórico git (git filter-branch ou BFG)
- [ ] CA-03: `.env` no `.gitignore` com verificação confirmada
- [ ] CA-04: Variáveis configuradas no Netlify UI (não no repositório)
- [ ] CA-05: Variáveis configuradas no Supabase Secrets (`supabase secrets list` confirma)
- [ ] CA-06: Build e deploy continuam funcionando após rotação
- [ ] CA-07: `.env.example` atualizado refletindo todas as variáveis necessárias

## Escopo

**IN:**
- Rotacionar VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (PUBLISHABLE_KEY), SUPABASE_SERVICE_ROLE_KEY
- Remover .env do histórico git
- Configurar variáveis no Netlify e Supabase

**OUT:**
- Não rotacionar chaves de terceiros (Mercado Pago, Panda Video) se não expostas — verificar antes
- Não mudar nomeação de variáveis neste sprint

## Passos de Implementação (@devops)

```bash
# 1. Rotacionar no Supabase Dashboard
# Settings > API > Regenerate anon key + service role key

# 2. Remover .env do histórico
# Instalar BFG Repo Cleaner ou usar git filter-branch
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (coordenar com @devops)
git push origin --force --all

# 4. Configurar no Netlify UI
# Site settings > Build & deploy > Environment variables

# 5. Configurar no Supabase
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=nova_chave
supabase secrets list  # verificar

# 6. Verificar .gitignore
grep ".env" .gitignore  # deve estar lá
```

## Testes

- [ ] `npm run build` OK com novas chaves
- [ ] Login funciona em produção
- [ ] Edge Functions respondem corretamente
- [ ] `git log --all -- .env` não retorna nada após limpeza
