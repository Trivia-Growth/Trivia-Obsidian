---
id: STORY-001
titulo: "Setup Infraestrutura (Supabase + repo + Netlify + obsidian-git)"
fase: 1
modulo: infra
status: pronto
prioridade: alta
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-04-16
---

# STORY-001 — Setup Infraestrutura

## Contexto
Antes de qualquer desenvolvimento, a base técnica precisa estar no lugar: repositório de código criado, banco Supabase configurado, deploy automático no Netlify funcionando e vault Obsidian sincronizando entre Lucas e João via obsidian-git.

## Spec de Referência
- [[HeziomOS — Arquitetura]] — stack completo, decisão de dois repositórios
- [[Views — Camada de Acesso HeziomOS]] — views a solicitar para equipe Literarius

## Critérios de Aceite
- [ ] CA1 — Repositório `heziom-os-app` criado no GitHub (via Lovable), com estrutura `src/`, `supabase/`, `sync/`
- [ ] CA2 — Projeto Supabase criado com `SUPABASE_URL` e `SUPABASE_ANON_KEY` configurados
- [ ] CA3 — `CLAUDE.md` criado na raiz do repo de código com path do vault Obsidian e contexto do domínio HeziomOS
- [ ] CA4 — Netlify conectado ao GitHub, deploy automático funcionando no push para `main`
- [ ] CA5 — Plugin `obsidian-git` configurado no vault HezionOS: auto-pull ao abrir, auto-push a cada 10 min
- [ ] CA6 — João consegue abrir o vault no Obsidian e ver as mudanças de Lucas sem usar terminal
- [ ] CA7 — AIOX instalado no repo de código (`npx aiox-core init`) com squad `heziom-squad` configurada

---

## Implementação
> ⚠️ Preenchido pelo @dev após concluir. Não editar manualmente.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA
> ⚠️ Preenchido pelo @qa. Não editar manualmente.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem regressões em outras features
- [ ] Segurança verificada (dados financeiros, RLS Supabase)
- [ ] Performance aceitável (<2s para queries principais)

**Notas QA:**

---

## Notas e Decisões
- Dois repositórios: `HezionOS` (docs) e `heziom-os-app` (código)
- João usa GitHub Desktop + Obsidian Git plugin — nunca precisa de terminal
- CLAUDE.md no repo de código deve referenciar o vault: `../HezionOS/HezionOS/`
