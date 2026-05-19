---
id: STORY-001
titulo: "Migrar projeto Lovable para o Padrão Trivia (setup de infraestrutura)"
fase: 1
modulo: "Infraestrutura"
status: concluido
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-001 — Migrar projeto Lovable para o Padrão Trivia

## Contexto

O `shipping-insights` foi construído inteiramente na Lovable, fora do Padrão Trivia.
Esta story registra o setup de infraestrutura que integra o projeto ao padrão
(documentação, governança, segurança de env, protocolo de sync Lovable+Claude),
seguindo o checklist "09 - Migrar Projeto Lovable para Padrão Trivia".

## Spec de Referência

- [[Documentos Trivia/Padrão Projetos/09 - Migrações/Migrar Projeto Lovable para Padrão Trivia]]
- [[Documentos Trivia/Padrão Projetos/10 - Sync Lovable e Claude]]
- [[00 - Índice]]

## Critérios de Aceite

- [x] CA1 — `.env` no `.gitignore`, removido do tracking, `.env.example` criado
- [x] CA2 — `src/config/env.ts` validando env em startup (importado em `main.tsx`)
- [x] CA3 — `CLAUDE.md` e `AGENTS.md` na raiz, preenchidos com dados reais
- [x] CA4 — `PROJECT_REQUIREMENTS.md`, `architecture.md`, `SECURITY_DEBT.md` na raiz
- [x] CA5 — `netlify.toml` com SPA redirect + headers de segurança + CSP
- [x] CA6 — `docs/stories/` com README (protocolo sync), `_TEMPLATE.md` e esta story
- [x] CA7 — Vault Obsidian estruturado (Índice/Roadmap/Dashboard/Stories)
- [ ] CA8 — Framework de agentes (AIOX/Triviaiox) instalado *(ADIADO — ver Pendências)*
- [ ] CA9 — Supabase CLI linkado + Edge Functions/secrets confirmados *(requer `supabase login` — JG)*
- [ ] CA10 — Variáveis de ambiente configuradas no Netlify *(requer acesso ao Netlify — JG)*

---

## Implementação

**Status:** `concluido` (escopo executável localmente)

**Commit:** ver `chore: migrar projeto Lovable para o Padrão Trivia (STORY-001)`

**Arquivos criados/alterados (repo `heziom/shipping-insights`):**
- `.gitignore` — passou a ignorar `.env` / `.env.*` (exceto `.env.example`)
- `.env` — removido do tracking Git (arquivo local preservado)
- `.env.example` — criado (chaves sem valores)
- `src/config/env.ts` — criado (validação de env em startup)
- `src/main.tsx` — import de `@/config/env` (fail-fast)
- `CLAUDE.md`, `AGENTS.md` — criados
- `PROJECT_REQUIREMENTS.md`, `architecture.md`, `SECURITY_DEBT.md` — criados
- `netlify.toml` — criado
- `docs/stories/README.md`, `docs/stories/_TEMPLATE.md`, `docs/stories/STORY-001.md` — criados

**Notas de implementação:**
- Cliente Supabase gerado pela Lovable **não** foi editado (regenerado pela Lovable);
  mantida a convenção `VITE_SUPABASE_PUBLISHABLE_KEY` — renomear só em refatoração planejada.
- Histórico Git **não** foi reescrito (quebraria o sync da Lovable). `.env` só continha
  variáveis `VITE_*` públicas — risco baixo, registrado como SEC-001 (P2).

---

## QA

**Gate:** `PASS` (escopo de infraestrutura local)

- [x] Mudanças aditivas, sem alterar comportamento do app
- [x] `.env` fora do Git confirmado (`git ls-files`)
- [x] Docs preenchidas com dados reais do código
- [ ] `npm run build` validado *(rodar antes/junto do push)*

---

## Pendências / Próximos Passos

1. **Framework de agentes (AIOX/Triviaiox)** — adiado por decisão do JG; rodar
   `npx aiox@latest install` (ou via repo privado Triviaiox) em sessão acompanhada.
2. **Supabase CLI** — `supabase login` + `supabase link --project-ref sjciabkjuqefponkfqan`;
   confirmar `supabase functions list` e `supabase secrets list`.
3. **Netlify** — configurar `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
   `VITE_SUPABASE_PROJECT_ID` em Site configuration → Environment variables.
4. **SEC-002/003** — auditar RLS+FORCE e validação de assinatura nos `*-webhook`.

## Notas e Decisões

- `2026-05-19` — Decisões do JG: pular instalação do framework por ora; commitar+pushar
  direto na main (repo sincronizado com Lovable, `git pull --rebase` antes); não rotacionar
  chave (pública) nem reescrever histórico.
