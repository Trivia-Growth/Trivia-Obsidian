---
id: STORY-041
titulo: "Observabilidade do pipeline de deploy (healthcheck de secrets + Build Hook versionado)"
fase: 6
modulo: "Blog/CMS · DevOps"
status: backlog
prioridade: media
agente_responsavel: ""
criado: 2026-07-08
atualizado: 2026-07-08
depende_de: STORY-037
epico: EPIC-002
---

# STORY-041 — Observabilidade do pipeline de deploy

> M3. Detectar que o pipeline quebrou **antes** de uma publicação falhar silenciosa — em vez de o JG descobrir publicando e vendo o site não mudar (como no incidente de 25/05).

## Contexto

O incidente de 25/05 (documentado em `trigger-rebuild/index.ts:92-100`) teve uma causa banal e invisível: o secret `NETLIFY_AUTH_TOKEN` do GitHub Actions **expirou**. Não havia nada monitorando isso — a falha só apareceu quando o JG publicou algo e o site não atualizou. Dois problemas de observabilidade:

1. **Nenhum healthcheck de secrets/pipeline.** Token expira → tudo parece ok até alguém publicar.
2. **Configuração de deploy fora do versionamento.** O `netlify.toml` **não** declara o Build Hook — a `NETLIFY_BUILD_HOOK_URL` vive só como env var/secret no dashboard do Netlify e do Supabase, sem nenhuma documentação no repo de onde é gerenciada. "Ninguém sabe por que o rebuild não disparou" começa aqui.

STORY-037/038 fazem a UI *reagir* a falhas; esta story faz o sistema *antecipar* falhas.

## Escopo

### ✅ Inclui
1. **Healthcheck do pipeline:** rotina que valida periodicamente (ou sob demanda no admin) se `NETLIFY_AUTH_TOKEN` + Build Hook estão válidos — ex.: chamada leve à Netlify API que retorna 401 se o token expirou. Resultado gravado em `site.configs_seo` (chave `pipeline_health`).
2. **Alerta ao admin:** se o healthcheck falhar, um aviso visível no `/admin` (banner no Dashboard) dizendo "pipeline de deploy com problema: token/hook inválido — publicações não vão ao ar até corrigir".
3. **Documentar a config de deploy no repo:** um `docs/DEPLOY.md` (ou seção no `architecture.md`) explicando onde vive o Build Hook, quais secrets existem (Netlify + Supabase + GH Actions), como rotacioná-los e como diagnosticar "publiquei e não subiu". Referenciar do `CLAUDE.md`.
4. (Opcional, se barato) Cron leve que roda o healthcheck 1×/dia e registra, para o problema não ficar dormente.

### ❌ NÃO inclui
- Mudar o mecanismo de rebuild (STORY-037).
- Migrar a `NETLIFY_BUILD_HOOK_URL` para dentro do repo (é secret, não pode ser versionada — só documentar onde vive).
- Monitoramento externo pago (Sentry já está no projeto; usar se couber, mas não é requisito).

## Detalhamento

**Healthcheck (Edge Function ou reuso de `get-rebuild-status`):**
- Chama um endpoint barato da Netlify API autenticado (ex.: `GET /sites/{site_id}`) que só passa se o token for válido.
- Grava `{ at, ok, detail }` em `pipeline_health`.
- Postura de auth igual às demais funções do admin.

**Banner no admin:**
- `DashboardPage.tsx` lê `pipeline_health`; se `ok=false`, mostra banner vermelho com a data da última falha e o detalhe.

## Critérios de Aceite

- [ ] CA1 — Existe um healthcheck que detecta token/hook Netlify inválido sem depender de uma publicação real.
- [ ] CA2 — Token inválido → banner de alerta visível no `/admin` (Dashboard).
- [ ] CA3 — `docs/DEPLOY.md` documenta: onde vive o Build Hook, todos os secrets do pipeline, como rotacionar e o runbook de "publiquei e não subiu". Referenciado no `CLAUDE.md`.
- [ ] CA4 — O healthcheck pode ser disparado sob demanda no admin (botão) e opcionalmente por cron diário.
- [ ] CA5 — `npm run build` passa; sem novo erro de typecheck além do baseline.

## Arquivos esperados

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/get-rebuild-status/index.ts` (ou nova `pipeline-health`) | Endpoint de healthcheck |
| `src/admin/pages/DashboardPage.tsx` | Banner de alerta lendo `pipeline_health` |
| `docs/DEPLOY.md` | **Novo** — runbook + mapa de secrets do pipeline |
| `CLAUDE.md` | Referência ao `docs/DEPLOY.md` |
| (Supabase, opcional) | Cron diário do healthcheck |

## Notas

> Conecta com a lição de memória sobre edges/webhooks e configs de deploy frágeis. A ideia é que **falha de pipeline vire sinal visível**, não descoberta acidental.
