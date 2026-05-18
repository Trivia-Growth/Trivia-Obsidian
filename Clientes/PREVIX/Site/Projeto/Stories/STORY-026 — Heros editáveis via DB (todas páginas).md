---
id: STORY-026
titulo: "Heros editáveis via DB em todas as páginas (cutover hardcoded → site.paginas)"
fase: 6
modulo: "Admin/Conteúdo"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-14
atualizado: 2026-05-14
---

# STORY-026 — Heros editáveis em todas as páginas via DB

## Contexto

JG estava reclamando que ao tentar trocar a foto da Hero da Home no painel admin, descobriu que **não tem como** — só `/sobre` (que usa o sistema de blocos modulares de `site.paginas.blocos`) tinha hero editável. Todas as outras 6 rotas (`/`, `/servicos`, `/contato`, `/noticias`, `/faq`, `/privacidade`) estavam com hero **hardcoded** em arquivos `.astro` — alterar exigia commit + deploy.

JG escolheu: **tornar TODAS as heros admin-editáveis** reusando o sistema de blocos modulares já existente (`PaginasAdminPage`, bloco `hero`, `ImagePicker`, `getPagina()`), sem nova tabela, sem novo componente.

## Critérios de Aceite

- [x] CA1 — Tipo `Bloco` hero estendido com 4 campos opcionais novos: `subtitulo?`, `ctaTexto?`, `ctaUrl?`, `variant?: 'compact' | 'full'`. Backwards-compatible com `/sobre` (todos opcionais).
- [x] CA2 — `FormHero` no `PaginasAdminPage.tsx` ganha 4 inputs: textarea subtítulo + select variant + 2 inputs CTA texto/URL.
- [x] CA3 — Migration `20260514120000_seed_paginas_heros.sql` insere 6 linhas em `site.paginas` (home, servicos, contato, noticias, faq, privacidade) com bloco hero pré-populado idêntico ao hardcoded atual. `ON CONFLICT (slug) DO NOTHING` (idempotente).
- [x] CA4 — Os 6 `.astro` afetados refatorados pra estratégia híbrida: `getPagina(slug)` + fallback `??` para o caminho hardcoded antigo. **Zero mudança visual no momento do cutover** (DB pré-populado idêntico).
- [x] CA5 — `PaginasAdminPage` lista dinâmica via `SELECT * FROM site.paginas` — basta inserir as 6 linhas pra aparecerem 6 tabs novas (sobre + 6 = 7 tabs). Zero mudança no React de listagem.
- [x] CA6 — Render do hero permanece **inline** em cada `.astro` (não delegado pra `<PaginaBlocos>`) porque cada página tem peculiaridades (Home full + CTA, outras compact, FAQ/Privacidade têm lede). Mantém HTML/CSS exatamente igual ao atual.
- [x] CA7 — Trigger `trigger-rebuild` Netlify automático após save (já existia em `PaginasAdminPage.tsx:157`).

## Notas Técnicas

- **Tipo `Bloco` é DUPLICADO** entre `src/lib/data/institucional.ts:56-63` e `src/admin/pages/conteudo/PaginasAdminPage.tsx:8-15`. Ambos atualizados no mesmo commit.
- **Rollback trivial**: `delete from site.paginas where slug in ('home','servicos','contato','noticias','faq','privacidade');` — `getPagina` volta a retornar null e o `??` reusa o hardcoded.
- Migração aplicada via `supabase db query --linked` (autorização explícita JG).

## Pendências externas

Nenhuma. Fluxo end-to-end testado: edição via `/admin/conteudo` → tab Home → trocar imagem via ImagePicker → save → trigger-rebuild → site atualiza em ~3min.

---

## Implementação

**Status:** `concluido` em 2026-05-14

**Commit:** `b005d9b` — `feat: heros editáveis em todas as páginas via site.paginas`

**Arquivos modificados (9):**
- `src/lib/data/institucional.ts` — estende tipo Bloco hero
- `src/admin/pages/conteudo/PaginasAdminPage.tsx` — sincroniza tipo + estende FormHero
- `src/pages/index.astro` — Home (variant `full` + CTA)
- `src/pages/servicos.astro`
- `src/pages/contato.astro`
- `src/pages/noticias/index.astro`
- `src/pages/faq.astro`
- `src/pages/privacidade.astro`
- `supabase/migrations/20260514120000_seed_paginas_heros.sql` (novo)

**Resultado:**
- `/admin/conteudo` passa de 1 tab (`sobre`) para **7 tabs** (sobre + 6 novas).
- Cada tab permite editar bloco hero (eyebrow, título HTML, subtítulo, imagem via ImagePicker, variant compact/full, CTA texto/URL).
- Save dispara rebuild Netlify; site atualiza em ~3min.

---

## QA

**Gate:** validado em produção 2026-05-14.

**Checklist:**
- [x] HTML em prod das 6 rotas (`/`, `/servicos`, `/contato`, `/noticias`, `/faq`, `/privacidade`) renderiza imagem hero idêntica ao estado pré-cutover (zero diff visual).
- [x] `/admin/conteudo` mostra 7 tabs.
- [x] Schema markup nas páginas continua válido (postbuild gate verde).
- [x] Build CI verde (run #25884210755).
