---
id: STORY-023
titulo: "Configs SEO/Schema editáveis"
fase: 6
modulo: "Admin/SEO"
status: done
prioridade: media
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-023 — Configs SEO/Schema editáveis

## Contexto

Hoje configs SEO/Schema vivem em código (`src/lib/empresa.ts`, `src/lib/seo.ts`) e exigem deploy pra mudar. Esta story expõe ao admin os parâmetros editáveis com mais frequência: dados da empresa, áreas atendidas, redes sociais, overrides por página, redirects custom.

## Critérios de Aceite

### Dados da empresa (Organization + LocalBusiness)

- [ ] CA1 — Rota `/admin/configs/empresa`:
  - Form completo com todos os campos hoje em `empresa.ts`:
    - Nome, nome legal
    - URL, logo (image picker)
    - Endereço (rua, cidade, estado, CEP, país)
    - Coordenadas (lat, long)
    - Telefones (sales + customer service)
    - Email, horário de funcionamento
    - Founding date, descrição
  - Save → grava em `site.configs_seo` com chave `empresa` + dispara rebuild
  - Hot-reload no Astro: builders de Schema (`buildOrganization`, `buildLocalBusiness`) consomem do DB no build

### Áreas atendidas

- [ ] CA2 — Rota `/admin/configs/areas-atendidas`:
  - Lista atual de 18 bairros/cidades em LocalBusiness `areaServed`
  - Adicionar/remover/reordenar
  - Save → atualiza Schema LocalBusiness

### Redes sociais (sameAs)

- [ ] CA3 — Rota `/admin/configs/redes-sociais`:
  - Form com inputs para Facebook, Instagram, LinkedIn, YouTube, X (Twitter), TikTok (futuro)
  - Validação de URL
  - Save atualiza Schema Organization `sameAs[]`

### Overrides por página

- [ ] CA4 — Rota `/admin/configs/seo-paginas`:
  - Lista de páginas (Home, Sobre, Serviços + 3 subpáginas, Contato, FAQ, Privacidade, Listagem de Notícias)
  - Click em página → form:
    - Title override (max 70)
    - Description override (max 180)
    - OG image override (image picker)
    - JSON-LD extra (textarea JSON validado — para casos avançados)
    - Robots (default: index,follow / opções: noindex/nofollow/noarchive)
  - Posts NÃO entram aqui (têm seu próprio campo `descricaoSEO` no editor)

### Redirects custom

- [ ] CA5 — Rota `/admin/configs/redirects`:
  - Lista de redirects atuais (do `netlify.toml`) read-only por enquanto
  - Form para adicionar redirect custom (de + para + status code 301/302/410)
  - Save → grava em `site.configs_seo` com chave `redirects_custom` + dispara rebuild
  - No build, Astro injeta os redirects custom no `_redirects` final
- [ ] CA6 — Validação: não permitir redirect de URL que existe (ex: `/sobre` é página real)

### Robots.txt e llms.txt

- [ ] CA7 — Rota `/admin/configs/robots-llms`:
  - Editor read+edit do `robots.txt`
  - Editor read+edit do `llms.txt`
  - Save → grava em DB + commit no repo via GitHub API (pra preservar histórico) + rebuild
  - Validação: não permitir bloquear crawlers de IA por engano (warning visível)

### Sitemap

- [ ] CA8 — Rota `/admin/configs/sitemap`:
  - Read-only — gerado automaticamente pelo Astro
  - Mostra preview da listagem atual
  - Botão "Forçar rebuild" para regenerar manualmente

## Pendências externas

- Decisão JG: edição do robots.txt direto no painel é seguro? (alguém sem `seo.update` clicar e bloquear crawler — proteção é o RBAC) (sugestão: confirmação dupla com modal de "Você está prestes a alterar como crawlers veem o site")
- Decisão JG: configs sensíveis (dados da empresa) precisam de aprovação dupla? (sugestão: não, RBAC é suficiente — só admin-previx tem acesso)

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `src/admin/pages/configs/EmpresaConfig.tsx`
- `src/admin/pages/configs/AreasAtendidasConfig.tsx`
- `src/admin/pages/configs/RedesSociaisConfig.tsx`
- `src/admin/pages/configs/SeoPaginasConfig.tsx`
- `src/admin/pages/configs/RedirectsConfig.tsx`
- `src/admin/pages/configs/RobotsLlmsConfig.tsx`
- `src/lib/empresa.ts` (refatorado para consumir DB no build via Astro `getStaticProps`-like)
- `src/lib/seo.ts` (idem)
- Astro plugin para inject redirects custom no `_redirects` no build

---

## QA

**Gate:**

**Checklist:**
- [ ] admin-previx altera telefone da empresa, rebuild dispara, novo telefone aparece em todas as páginas
- [ ] editor-copy NÃO consegue editar configs SEO (RBAC funciona)
- [ ] Redirect custom adicionado funciona em produção (curl 301)
- [ ] Robots.txt editado preserva 16 user-agents de IA por padrão (regression check)
- [ ] JSON-LD extra inválido é rejeitado no save (validação Zod ou JSON schema)
