---
id: EPIC-002
titulo: "Publicação de Blog Confiável e Fonte Única de Conteúdo"
fase: 6
modulo: "Blog/CMS"
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-07-08
atualizado: 2026-07-11
duracao_estimada: "1-2 semanas"
depende_de: EPIC-001
---

# EPIC-002 — Publicação de Blog Confiável e Fonte Única de Conteúdo

> **Origem:** JG relatou (08/07/2026) que a gestão do blog está ruim, "principalmente para subir novos posts". Investigação técnica confirmou que **publicar um post é um ato de fé**: salva no banco, dispara rebuild em background e o admin nunca confirma se o site realmente atualizou. Este épico fecha esse buraco.

---

## Diagnóstico (estado atual, 08/07/2026)

Investigação ponta a ponta do fluxo de publicação encontrou **oito pontos de fricção**, todos rastreados a código real:

1. **Rebuild fire-and-forget silencioso.** O site é 100% estático (`astro.config.mjs` → `output: 'static'`). Toda mudança de conteúdo só aparece ao vivo após rebuild completo. O disparo (`PostEditor.tsx:271-278`) é literalmente *"best-effort, falha não bloqueia save"* — se falhar, vira um `console.warn` que ninguém vê. O post fica "publicado" no banco, mas o site serve a versão antiga.
2. **Incidente real já documentado no próprio código.** `supabase/functions/trigger-rebuild/index.ts:92-100` registra que em 25/05 o secret `NETLIFY_AUTH_TOKEN` do GitHub Actions expirou: a função retornava `ok:true` (dispatch aceito) mas o build nunca acontecia. *"JG percebeu quando publicou imagem nova de capa e o site continuou servindo o estado anterior."* Exatamente a dor de hoje.
3. **Nenhuma superfície de status no admin.** `site.configs_seo` guarda `last_rebuild` (com `ok`, `error`, `via`), mas **nada no `/admin` lê esse dado** — só escreve. O único jeito de saber se o build funcionou é olhar o site ao vivo ou o dashboard do Netlify.
4. **Cooldown silencioso de 60s.** `trigger-rebuild` pula disparos consecutivos retornando `{ ok:true, skipped:true, reason:'cooldown' }`. Para quem publica dois ajustes seguidos, o segundo é engolido sem aviso claro.
5. **Workaround recorrente = commit vazio no Git.** Histórico tem ao menos 4 "força rebuild" (`daa8370`, `09c8c61`, `3671541`, `599d4d5`) — sintoma direto de que o caminho oficial (admin → DB) não é confiável.
6. **Post mais recente nem passou pelo admin.** "Reforma Tributária" (`07e9405`, `bcf38dd`) foi criado editando `.mdx` direto no Git — abandono prático do fluxo de DB.
7. **Conteúdo em estado híbrido permanente.** `src/lib/data/posts.ts::getAllPosts()` lê DB primeiro e faz merge com `getCollection('blog')`, excluindo do Git slugs já no DB (linha 87-88). A "fase 2" da migração (STORY-024) nunca aconteceu — 19 `.mdx` legados convivem com posts no banco. Ambiguidade real de "onde eu edito?".
8. **Lint Jimmy 3.0 não protege o caminho principal.** `scripts/lint-content.ts` e o Zod de `src/content.config.ts` só varrem `src/content/blog/` (Git). Posts feitos via admin (DB) **nunca passam por lint no build**. A validação client-side (`validate-post`) é, por design, *"apenas sugestão - nunca bloqueia publicação"* (`PostEditor.tsx:237,676`). Ou seja: não há gate de qualidade real no fluxo predominante.

**Achado de segurança (crítico, tratado à parte):** `scripts/migrate-git-posts-to-db.mjs` tem a **`service_role` key do Supabase hardcoded** (linha 16) **e está versionado no Git** (`git ls-files` confirma). Chave de bypass total do banco **compartilhado** (Organograma + Site + Portal futuro), em repo no GitHub. → **STORY-042**, urgente e independente do cronograma do épico.

---

## Decisão de arquitetura (fechada nesta análise)

**Mantém o site estático** (`output: 'static'`), fiel ao ADR-001/ADR-010 — HTML completo pré-renderizado é a fundação AEO/GEO do projeto. A causa da dor **não é** a arquitetura estática; é que o **loop de confirmação do rebuild nunca foi fechado** e a **migração de conteúdo nunca foi concluída**.

**Alternativa considerada e rejeitada — SSR/ISR por post.** Renderizar cada post sob demanda em Netlify Function eliminaria o rebuild, mas: (a) adiciona latência e custo de function em toda visita de crawler de IA — justo o público-alvo do projeto; (b) contraria ADR-001 (fundação estática); (c) é uma reescrita grande de risco alto para um problema que se resolve fechando o loop. Fica registrada como opção futura caso o volume de posts cresça a ponto de o rebuild completo virar gargalo.

Portanto o épico ataca **confiabilidade + observabilidade + fonte única**, não a arquitetura de render.

---

## Objetivo

Ao fim do épico, publicar um post via `/admin` é **confiável e observável**:

- O admin **confirma** que o build concluiu (ou avisa claramente que falhou), com estado visível — nunca mais "publiquei e não sei se subiu".
- **Uma única fonte de verdade** para conteúdo (DB). Fim da ambiguidade Git×DB.
- **Um gate de qualidade real** no caminho de publicação (não só sugestão).
- **Alertas** quando o pipeline de deploy quebra (secret expirado), antes de o JG descobrir na mão.
- **Zero segredo** hardcoded no repositório.

---

## Sub-stories

| # | Story | Milestone | Bloqueada por | Resumo |
|---|-------|-----------|---------------|--------|
| 037 | [[STORY-037 — trigger-rebuild retorna estado do deploy (fim do fire-and-forget)\|STORY-037]] | M1 — Parar o sangramento | — | Edge Function passa a capturar/retornar o `deploy_id` + estado real do Netlify (via API), propaga erro em vez de engolir, e expõe endpoint de status. Cooldown vira resposta explícita. |
| 038 | [[STORY-038 — Status de publicação no admin (confirmação de rebuild)\|STORY-038]] | M1 — Parar o sangramento | 037 | UI do admin passa a **fechar o loop**: após publicar, mostra "enfileirado → publicando → no ar ✅ / falhou ❌" com link pro deploy. Badge de status do último rebuild na listagem de posts. Fim do `console.warn` mudo. |
| 039 | [[STORY-039 — Fonte única de conteúdo: finalizar migração Git → DB\|STORY-039]] | M2 — Fonte única | 037 | Migrar os 19 `.mdx` legados restantes para o DB (script idempotente, sem chave hardcoded — depende de STORY-042), aposentar a leitura do Git em `getAllPosts()`, e decidir o destino da collection `blog` (arquivar). Fim da ambiguidade "onde edito". |
| 040 | [[STORY-040 — Gate de qualidade Jimmy 3.0 no fluxo DB\|STORY-040]] | M3 — Qualidade | 039 | Tornar a validação Jimmy 3.0 um gate real no fluxo de publicação DB: `validate-post` roda no publish (server-side), publicação com violações estruturais exige confirmação explícita "publicar mesmo assim" + registra no audit_log. Alinha com Article IV (No Invention). |
| 041 | [[STORY-041 — Observabilidade do pipeline de deploy (healthcheck de secrets)\|STORY-041]] | M3 — Qualidade | 037 | Healthcheck que detecta secret Netlify expirado/inválido **antes** de uma publicação falhar silenciosa; Build Hook e config de deploy documentados no repo (hoje vivem só no dashboard Netlify, fora do versionamento). Alerta ao admin. |
| 042 | [[STORY-042 — [SEGURANÇA] Remover service_role hardcoded + rotacionar\|STORY-042]] | M0 — Urgente/paralelo | — | Remover a `service_role` key hardcoded de `scripts/migrate-git-posts-to-db.mjs` (e conferir `migrate-content-to-db.ts`), migrar para variável de ambiente, **rotacionar a chave exposta** no Supabase, e purgar do histórico do Git se necessário. Independente — pode/deve rodar já. |

---

## Milestones

| Marco | Stories | Entrega |
|-------|---------|---------|
| **M0 — Segurança urgente** | 042 | Nenhum segredo no repo; chave rotacionada. Roda em paralelo a tudo. |
| **M1 — Parar o sangramento** | 037 + 038 | Publicar no admin confirma se o site subiu. Fim do "ato de fé". **Maior alívio imediato da dor do JG.** |
| **M2 — Fonte única** | 039 | Todo conteúdo no DB; Git aposentado para posts. Fim da ambiguidade de edição. |
| **M3 — Qualidade + Observabilidade** | 040 + 041 | Gate Jimmy 3.0 real no publish; alerta de pipeline quebrado. |

> **Ordem recomendada:** 042 (já) → 037 → 038 → 039 → 040/041. Se houver só tempo para uma coisa, é **037+038** — é o que mata a dor central.

---

## Pendências / dependências externas

- **`NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID` como secrets da Edge Function** (`get-rebuild-status`/`trigger-rebuild`). Hoje o token só existe no GitHub Actions. STORY-037 precisa dele nos secrets do Supabase para consultar a Deploys API. Confirmar/gerar com JG.
- **Rotação da `service_role` key** (STORY-042) — operação sensível: ao rotacionar, todas as Edge Functions e serviços que a usam precisam da nova chave. Coordenar com o Organograma (mesmo projeto Supabase).
- **Decisão sobre os 19 `.mdx` legados** (STORY-039): arquivar em pasta fora do build vs. deletar após confirmar migração. Recomendação: arquivar em `docs/legacy-blog/` por segurança, deletar depois de 1 build verde.

---

## QA do épico

**Gate final:**
- [ ] Publicar um post via `/admin` mostra estado do build até "no ar ✅", sem consultar Netlify manualmente
- [ ] Forçar um erro de rebuild (token inválido) aparece como ❌ no admin, não como sucesso
- [ ] `getAllPosts()` não lê mais do Git; 0 `.mdx` no caminho de build de posts
- [ ] Publicar post com <3 estatísticas exige confirmação explícita e registra no audit_log
- [ ] Secret Netlify expirado dispara alerta antes de uma publicação falhar
- [ ] `git grep` por `service_role` / JWT no repo retorna 0; chave antiga revogada no Supabase
- [ ] Nenhum "commit vazio de força-rebuild" necessário durante o QA

---

## ✅ Épico concluído (2026-07-11)

Todas as 6 stories entregues e no ar. Commits: `0f493f7` (STORY-042 código) + `02172cc` (037/038/039/040/041). Edge functions deployadas (`validate-post`, `trigger-rebuild`, `get-rebuild-status`, `pipeline-health`); frontend em produção (Netlify deploy `02172cc9` = ready).

**Gate final:**
- [x] Publicar via `/admin` mostra estado do build até "no ar ✅" — `RebuildStatus` + `get-rebuild-status` (037/038) no ar; verificado por equivalência + prod (invocação com JWT de admin real barrada pelo classificador; walkthrough visual do JG pendente).
- [x] Erro de rebuild aparece como ❌, não como sucesso — `trigger-rebuild` retorna 5xx em falha (fim do `ok:true` mentiroso).
- [x] `getAllPosts()` não lê mais do Git; 0 `.mdx` no build de posts (`/noticias` ao vivo com 21 posts do DB).
- [x] Publicar com <3 estatísticas exige confirmação e registra no `audit_log` (040).
- [x] Secret Netlify expirado dispara alerta antes de a publicação falhar — `pipeline-health` + banner no Dashboard (041).
- [x] `git grep` por `service_role`/JWT no repo = 0; chave antiga revogada (042).
- [x] Nenhum "commit vazio de força-rebuild" necessário.

**Pendente (não bloqueia):** walkthrough visual do JG no `/admin` (publicar um post e ver o `RebuildStatus`; ver o banner de pipeline); revogar tokens `sbp_`/`nfp_` expostos no chat; despublicar o post de teste `e2e-minimercado-...570195`.
