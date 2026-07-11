---
id: STORY-038
titulo: "Status de publicação no admin (confirmação de rebuild)"
fase: 6
modulo: "Blog/CMS · Admin"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-07-08
atualizado: 2026-07-11
depende_de: STORY-037
epico: EPIC-002
---

# STORY-038 — Status de publicação no admin (confirmação de rebuild)

> Camada de **UI** do M1 e o **coração da dor do JG**. Fecha o loop: publicou → vê o build acontecer → confirma que está no ar. Fim do "publiquei e não sei se subiu".

## Contexto

Hoje, ao publicar (`PostEditor.tsx:271-278`), o disparo do rebuild é *"best-effort, falha não bloqueia save"*: um `try/catch` que, em erro, só faz `console.warn('trigger-rebuild falhou:', e)`. O usuário vê "salvo" e vai embora, sem qualquer sinal de que o build pode ter falhado. Nada no admin lê `site.configs_seo.last_rebuild` nem o estado do deploy. É por isso que o JG recorre a **commit vazio no Git para forçar rebuild** e depois confere o site na mão.

Com STORY-037 fornecendo `deploy_id` + `get-rebuild-status`, a UI agora pode **mostrar o estado real**.

## Escopo

### ✅ Inclui
1. **Feedback de publicação no PostEditor:** ao publicar, abrir um indicador de progresso que faz *polling* de `get-rebuild-status` e evolui: `Enfileirado → Publicando… → No ar ✅` (ou `Falhou ❌` com o detalhe do erro e link pro deploy no Netlify).
2. **Tratamento honesto de falha:** se o rebuild falhar, o post continua salvo (não perde trabalho), mas a UI mostra **erro claro** + botão "Tentar rebuild de novo" (rechama `trigger-rebuild`). Fim do `console.warn` mudo.
3. **Cooldown visível:** se `trigger-rebuild` responder `skipped:cooldown`, mostrar "Rebuild recente em andamento, aguarde Xs" (usando `next_allowed_at`) em vez de fingir sucesso.
4. **Badge de status na listagem de posts** (`PostsListPage.tsx`): indicador do último rebuild (data + ✅/❌) lido de `last_rebuild`, para o editor ver de relance se a última publicação subiu.
5. **Estado `unknown` degradado:** se STORY-037 rodar sem `NETLIFY_AUTH_TOKEN`, a UI mostra "publicação enviada (confirmação automática indisponível)" com link pro Netlify — honesto, não falso-positivo.

### ❌ NÃO inclui
- Lógica de backend (STORY-037).
- Gate de qualidade (STORY-040).
- Reescrever o editor; é adição de feedback ao fluxo existente.

## Detalhamento

**Componente de progresso (novo, ex.: `RebuildStatus.tsx`):**
- Recebe o `deploy_id` retornado por `trigger-rebuild`.
- Faz polling de `get-rebuild-status` a cada ~5s, com timeout (ex.: 3 min) → depois disso mostra "demorando mais que o normal, acompanhe no Netlify".
- Estados visuais: enfileirado (spinner cinza) → building (spinner azul `#00AEEF`) → ready (check verde) → error (X vermelho + detalhe).
- Acessível em desktop e mobile (admin é usado no celular — ver STORY-036 CA10).

**Onde entra:**
- `PostEditor.tsx` `save` mutation `onSuccess`: quando `status==='publicado'`, em vez do `try/catch` mudo, capturar o retorno do `trigger-rebuild` e montar o `RebuildStatus`.
- `PostsListPage.tsx`: coluna/badge de "último rebuild".

## Critérios de Aceite

- [ ] CA1 — Ao publicar um post, aparece um indicador que evolui até **"No ar ✅"** confirmando o build concluído — sem o usuário abrir o Netlify.
- [ ] CA2 — Se o rebuild falhar, a UI mostra **erro explícito** + detalhe + botão "Tentar de novo"; o post permanece salvo.
- [ ] CA3 — Cooldown aparece como "aguarde Xs", não como sucesso.
- [ ] CA4 — A listagem de posts mostra o status do último rebuild (data + ✅/❌).
- [ ] CA5 — Sem token Netlify (estado `unknown`), a UI é honesta ("confirmação indisponível" + link), nunca falso ✅.
- [ ] CA6 — Nenhum `console.warn` mudo no caminho de publicação; toda falha vira feedback visível.
- [ ] CA7 — Validado em desktop **e** mobile.
- [ ] CA8 — `npm run build` passa; sem novo erro de typecheck além do baseline.

## Arquivos esperados

| Arquivo | Mudança |
|---------|---------|
| `src/admin/pages/posts/PostEditor.tsx` | Substitui o `try/catch` mudo (linha ~271) por feedback via `RebuildStatus`; botão retry |
| `src/admin/pages/posts/PostsListPage.tsx` | Badge de último rebuild |
| `src/admin/components/RebuildStatus.tsx` | **Novo** — polling de `get-rebuild-status` + estados visuais |
| `src/admin/lib/*` | Helper para chamar `get-rebuild-status` (se `callFunction` já não cobrir) |

> Observação: esse mesmo padrão de feedback vale para os outros disparos de `trigger-rebuild` (FAQ, páginas, configs SEO — `FAQPage.tsx:128`, `PaginasAdminPage.tsx:157`, `ConfigsSeoPage.tsx`). Escopo desta story é o **blog**; estender aos demais pode virar follow-up rápido reusando o `RebuildStatus`.

## Notas de Implementação (2026-07-11)

- **Feito e no ar** (Netlify deploy `02172cc9` = ready; bundle do admin referencia `get-rebuild-status`). Commit `02172cc`.
- `src/admin/components/RebuildStatus.tsx` (novo): recebe `deploy_id`, faz polling de `get-rebuild-status` (~5s, timeout ~3min), estados Enfileirado→Publicando→No ar ✅ / Falhou ❌ (cor da marca #00AEEF); botão "tentar de novo"; degrada honesto no estado `unknown`.
- `PostEditor.tsx`: substituído o `try/catch` mudo do rebuild por feedback via `RebuildStatus` (o post continua salvo se o rebuild falha). `PostsListPage.tsx`: badge do último rebuild lido de `last_rebuild`.
- **Verificação:** bundle publicado referencia `get-rebuild-status`; backend (037) verificado ao vivo. Pendente: walkthrough visual do JG (desktop+mobile) — CA7.
