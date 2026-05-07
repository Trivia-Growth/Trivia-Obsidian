---
id: STORY-052
titulo: "Untrack .env do git + .env.production como source de VITE_ vars no build"
fase: 3
modulo: infra
status: done
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-052 — Untrack .env + hotfix Netlify

## Contexto

Durante a STORY-051, foi necessário adicionar `SUPABASE_SERVICE_ROLE_KEY`
ao `.env` local para rodar queries via REST (CLI não tinha access token).
Ao fazer `git status`, descobriu-se que **`.env` estava tracked no repo**
desde commits antigos (`fba6eaf7`, `1d12a8e6`, `94a4deb8`), apesar de
estar no `.gitignore`. Isso significava risco de commit acidental de
secrets em qualquer alteração futura do `.env`.

Foi feito `git rm --cached .env` e push (commit `dfc35c41`). O arquivo
local permaneceu intacto, mas foi removido do tracking.

**Incidente:** o Netlify build dependia silenciosamente do `.env` tracked
para popular as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
no bundle de produção. Não havia env vars configuradas no painel do Netlify.
Próximo deploy clonou o repo sem `.env` → `npm run build` gerou bundle
sem as vars → app travou na inicialização com erro
`"Supabase env vars ausentes. Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY"`.

**Tela em branco em prod por ~5 minutos.**

Hotfix imediato: criar `.env.production` (convenção Vite, **não está no
gitignore**) com apenas as `VITE_*` vars públicas. `npm run build` carrega
automaticamente em produção. Anon/publishable key é segura no repo
(sempre fica visível no JS minificado servido ao browser).

## Critérios de Aceite

- [x] CA1 — `.env` removido do tracking via `git rm --cached`
- [x] CA2 — `.env` local preservado (não deletado do disco)
- [x] CA3 — `.gitignore` continua cobrindo `.env`
  (`git check-ignore -v .env` confirma)
- [x] CA4 — `.env.production` criado com `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`,
  `VITE_JIMMY_HUBCHAT_ENABLED`
- [x] CA5 — Build local confirma que vars aparecem no bundle
  (`grep "kjixezlzateraihxltfa" dist/assets/index-*.js`)
- [x] CA6 — Netlify build pós-deploy gera bundle funcional
  (site volta a carregar)

## Out of scope

- **Migrar VITE_ vars pro painel do Netlify** — solução mais correta
  longo prazo (sem credentials no source). Próxima story.
- **Rotacionar service role key** (já compartilhada no chat 2× durante
  sessão de debug) — story separada.
- **Histórico do git** — anon key existe em commits passados. Não vale
  rewrite history porque é key pública (segura) e o ônus operacional é
  alto.

## Implementação

**Status:** `done`

**Commits:**
- `dfc35c41` — `chore: untrack .env (.gitignore should govern it)`
- `4017b41d` — `fix(build): adiciona .env.production com VITE_ vars publicas`

**Arquivos:**
- `.env` — removido do index do git (arquivo local intacto)
- `.env.production` — criado com VITE_ vars públicas

**Validações:**
- Build local em 17s, bundle contém ref do projeto
- Após deploy do Netlify: site voltou a carregar normalmente

## Riscos

| Risco | Mitigação |
|---|---|
| Anon key versionada no repo (mesmo sendo pública) | Próxima story migra pra Netlify env vars |
| Outras `.env*` tracked no repo? | `git ls-files .env*` retorna nada agora |
| Dev local com `.env.production` interfere em `npm run dev`? | Vite só carrega `.env.production` em build prod (`mode=production`); dev usa `.env` |
| Netlify env vars sobrepõem `.env.production`? | Sim — convenção Vite respeita env vars do shell. Quando migrar pro painel, basta deletar `.env.production` |

## Lições aprendidas

- Antes de rodar `git rm --cached .env`, **verificar se Netlify (ou
  qualquer build pipeline) depende dele**. Esquecer essa verificação
  custou ~5 min de tela em branco em prod.
- `.env` tracked num repo com gitignore é red flag — significa que foi
  commitado antes do gitignore existir e ninguém limpou. Limpeza correta:
  `rm --cached` + verificar dependências do build pipeline + migrar
  vars pro painel do hosting.

## QA

**Gate:** PASS

**Checklist:**
- [x] Site em prod voltou
- [x] `.env` local preservado, untracked, gitignore funcionando
- [x] `.env.production` versionado com apenas VITE_ vars públicas
