---
id: STORY-030
titulo: "Polimento institucional: unifica Orçamento+Contato, +2 depoimentos, URLs sociais, desativa WhatsApp"
fase: 6
modulo: "Conteúdo/UX"
status: concluido
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-14
atualizado: 2026-05-14
---

# STORY-030 — Polimento institucional

## Contexto

JG pediu 4 ajustes pequenos de polimento, agrupados nesta story porque são correções pontuais sem grande arquitetura:

1. **Unificar /contato e /orcamento em "Orçamentos & Contato"**: header tinha 2 itens ("Orçamentos" e "Contato") apontando pra mesma página `/contato` (a `/orcamento` era só meta-refresh). Confunde usuário e duplica nav.
2. **+2 depoimentos novos**: Marcos de Godoy (Mackenzie) e Roberto Pastor (Ribeira) — JG forneceu textos + logos via imagem.
3. **Atualizar URLs das redes sociais**: handles antigos (`/grupoprevix`, `@grupoprevix`) viraram (`/grupo.previx`, `@GrupoPrevixSeguranca`).
4. **Desativar botão flutuante WhatsApp** temporariamente — JG não quer no ar por hora (provavelmente pendente de WhatsApp Business definitivo).

## Critérios de Aceite

### Unificação Orçamento+Contato
- [x] CA1 — `SiteHeader.astro`: remove `<a href="/contato#orcamento">Orçamentos</a>`; renomeia `Contato` → `Orçamentos & Contato`. Header passa de 6 → 5 itens.
- [x] CA2 — `src/pages/orcamento.astro` deletado (era só meta-refresh).
- [x] CA3 — `netlify.toml`: redirect 301 `/orcamento` e `/orcamento/` → `/contato#orcamento` com `force = true` (preserva backlinks externos pra SEO).
- [x] CA4 — `src/pages/contato.astro`: title vira `"Orçamentos & Contato | Grupo Previx"`; description ajustada; eyebrow do hero (default fallback) vira "Orçamentos & Contato".
- [x] CA5 — DB: `update site.paginas set titulo = 'Orçamentos & Contato', blocos[0].eyebrow = 'Orçamentos & Contato' where slug = 'contato'`.
- [x] CA6 — DB: `update site.faq set resposta = replace(resposta, '/orcamento', '/contato#orcamento')` em qualquer linha que referenciava o link antigo.
- [x] CA7 — `public/llms.txt`: 2 entradas (`Contato` + `Orçamento`) viram 1 unificada `Orçamentos & Contato`.

### +2 depoimentos novos
- [x] CA8 — Logos uploadadas pro bucket Storage `site-assets/depoimentos/mackenzie.png` e `ribeira.png` via API (HTTP 200 público).
- [x] CA9 — Registros em `site.assets` pra aparecer na biblioteca do ImagePicker (alt_text + tags).
- [x] CA10 — INSERT em `site.depoimentos`:
  - `marcos-godoy-mackenzie` · Marcos de Godoy · Gerente de Segurança · Instituto Presbiteriano Mackenzie · ordem 3 · publicado true
  - `roberto-pastor-ribeira` · Roberto Pastor · Diretor Técnico · Ribeira Construtora · ordem 4 · publicado true
- [x] CA11 — Carrossel da Home passa de 2 → 4 depoimentos automaticamente (componente já dinâmico).

### Atualização URLs redes sociais
- [x] CA12 — `src/config/empresa.ts`: `instagram` → `https://www.instagram.com/grupo.previx/`; `youtube` → `https://www.youtube.com/@GrupoPrevixSeguranca`; `linkedin` ganha trailing slash canônico.
- [x] CA13 — `src/components/layout/SiteHeader.astro`: 3 URLs hardcoded atualizadas.
- [x] CA14 — `src/admin/pages/configs/ConfigsSeoPage.tsx`: `REDES_DEFAULT` atualizado (defaults do form admin de SEO).
- [x] CA15 — JSON-LD `Organization.sameAs` (em `src/lib/seo.ts`) usa `empresa.redes.*` direto — propaga automaticamente.

### Desativação WhatsApp
- [x] CA16 — `src/config/empresa.ts`: `whatsapp: ''` (string vazia). O `WhatsAppFloat.astro` tem condicional `{whatsappUrl && (...)}` que esconde o botão quando vazio.
- [x] CA17 — Comment no código documenta como reativar (repor o número).

## Notas Técnicas

- **Migration sem ON CONFLICT**: `site.assets` não tem unique constraint em `path` — usei `WHERE NOT EXISTS` em vez de `ON CONFLICT`. Idempotente.
- **`tamanho` é NOT NULL** em `site.assets` — peguei dos arquivos via `ls -l` (mackenzie 23015 bytes, ribeira 16749).
- **Logos no Storage** (não em `public/`): consistente com novo padrão de assets (STORY-022). URLs são `https://yqexjddpotlaqraljwvl.supabase.co/storage/v1/object/public/site-assets/depoimentos/<arquivo>.png`.
- **Reativar WhatsApp**: futuro — repor `whatsapp: '551138751148'` (ou WhatsApp Business móvel quando confirmado) em `empresa.ts:41`.

## Pendências externas

Nenhuma.

---

## Implementação

**Status:** `concluido` em 2026-05-14

**Commits:**
- `ec4564e` — `feat: heros editáveis (posição+cor) · unifica orçamento+contato · +2 depoimentos`
- `f302e0c` — `fix: atualiza URLs das redes sociais`
- `befdbe9` — `chore: desativa botão flutuante WhatsApp temporariamente`

**Arquivos modificados:**
- `src/components/layout/SiteHeader.astro` — remove "Orçamentos", renomeia "Contato" → "Orçamentos & Contato", atualiza URLs Instagram/LinkedIn
- `src/pages/contato.astro` — title + description + eyebrow fallback
- `src/pages/orcamento.astro` — DELETADO
- `netlify.toml` — 2 redirects 301 pra `/orcamento` e `/orcamento/`
- `public/llms.txt` — entradas Contato + Orçamento → uma só
- `src/config/empresa.ts` — URLs redes sociais + whatsapp vazio
- `src/admin/pages/configs/ConfigsSeoPage.tsx` — defaults de REDES atualizados

**Recursos no DB / Storage:**
- 2 PNG uploadados pro bucket `site-assets/depoimentos/` (HTTP 200 público)
- 2 linhas em `site.assets`
- 2 linhas em `site.depoimentos`
- 1 UPDATE em `site.paginas` (slug=contato)
- 1 UPDATE em `site.faq` (replace de URL)

---

## QA

**Gate:** validado em produção 2026-05-14.

**Checklist:**
- [x] `curl -I https://previx-site-app.netlify.app/orcamento` retorna `301` + `location: /contato#orcamento`
- [x] Header em prod tem 5 itens (sem "Orçamentos") com label "Orçamentos & Contato"
- [x] Home tem 4 depoimentos no carrossel (Afeet · Munir · Mackenzie · Ribeira)
- [x] HTML de prod tem `https://www.instagram.com/grupo.previx/`, `https://www.youtube.com/@GrupoPrevixSeguranca`, `https://www.linkedin.com/company/grupo-previx/`
- [x] JSON-LD `Organization.sameAs` propagado com novas URLs
- [x] Botão `.whatsapp-float` ausente em todas as páginas (após deploy do `befdbe9`)
- [x] 3 builds CI verdes
