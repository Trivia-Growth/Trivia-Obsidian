---
id: STORY-040
titulo: "Gate de qualidade Jimmy 3.0 no fluxo DB (validação real no publish)"
fase: 6
modulo: "Blog/CMS · Qualidade"
status: concluido
prioridade: media
agente_responsavel: "@dev"
criado: 2026-07-08
atualizado: 2026-07-11
depende_de: STORY-039
epico: EPIC-002
---

# STORY-040 — Gate de qualidade Jimmy 3.0 no fluxo DB

> M3. Recoloca a Metodologia Jimmy 3.0 como gate real — hoje ela só protege os arquivos Git (que STORY-039 aposenta), deixando o fluxo DB **sem nenhum controle de qualidade**.

## Contexto

A governança de conteúdo AEO/GEO vive hoje em **três lugares que não cobrem o caminho real**:

- `src/content.config.ts` (Zod) — só valida `.mdx` no build do Astro.
- `scripts/lint-content.ts` — `BLOG_DIR = src/content/blog` (linha 30); só varre Git. Regras: ≥3 `<Estatistica />`, H2 entre 50-150 palavras, H2 idealmente pergunta (warning), zero travessões.
- `supabase/functions/validate-post/index.ts` — porta as regras para o admin, mas o `PostEditor.tsx:237` diz textualmente `// Lint é apenas sugestão - nunca bloqueia publicação` e a UI (linha 676) confirma *"Publicação nunca bloqueada."*

Depois de STORY-039 (Git aposentado), o lint de build fica **sem alvo**. Ou seja: sem esta story, posts feitos via admin — o único caminho — não passam por **nenhum** gate. Isso contraria o Article IV (No Invention) do `CLAUDE.md`, que pressupõe enforcement automático das regras AEO/GEO.

> **Nota de produto:** "nunca bloquear publicação" foi uma decisão consciente do EPIC-001 (ADR-010: lint vira validação no save, não gate de build). Esta story **não** reverte isso para um bloqueio duro — propõe um meio-termo: violações estruturais exigem **confirmação explícita**, não impedem de todo. Confirmar a régua com o JG (ver Decisões em aberto).

## Escopo

### ✅ Inclui
1. `validate-post` roda **no momento do publish** (server-side, não só no debounce de digitação), retornando violações estruturais (erros) vs. sugestões (warnings).
2. **Publicar com violações estruturais** (ex.: <3 estatísticas, lede fora de 40-60 palavras, FAQ fora de 4-8) exige **confirmação explícita** no admin ("Este post não segue a Metodologia Jimmy 3.0: [lista]. Publicar mesmo assim?").
3. Toda publicação com violação confirmada é **registrada no `audit_log`** (quem publicou, quais regras foram furadas) — rastreabilidade.
4. Consolidar as regras num **único módulo compartilhado** para não ter três cópias divergindo (o incidente dos 414 travessões nasceu de regra que existia num lugar e não no outro).

### ❌ NÃO inclui
- Bloqueio absoluto de publicação (decisão de produto — manter escape hatch).
- Mudar as regras Jimmy 3.0 em si (só onde/como rodam).
- Reintroduzir lint de build (o gate agora é no publish, coerente com DB como fonte).

## Detalhamento

**Regras (fonte: Jimmy Studio, já implementadas em `validate-post`/`lint-content.ts`):**
- Erro (exige confirmação): ≥3 `<Estatistica />` com `fonte`+`fonteUrl`; lede 40-60 palavras; `conclusoesPrincipais` 3-5; FAQ 4-8 com resposta 40-150 palavras; H2 entre 50-150 palavras; zero travessões (— e –).
- Warning (informativo): H2 sem forma de pergunta.

**Fluxo:**
1. No `save` com `status='publicado'`, chamar `validate-post` server-side e aguardar o resultado (diferente do debounce atual que é só cosmético).
2. Se houver erros e o usuário não confirmou → abrir modal "publicar mesmo assim?" listando as violações. Não publica até confirmar.
3. Ao confirmar, gravar no `audit_log` `{ recurso:'posts', acao:'publish-com-violacao', payload: regras_violadas }`.
4. Rascunho/agendamento **não** dispara gate (só publish).

## Critérios de Aceite

- [ ] CA1 — Publicar um post com <3 estatísticas abre confirmação explícita; sem confirmar, não publica.
- [ ] CA2 — Publicar um post conforme Jimmy 3.0 flui sem fricção (nenhum modal).
- [ ] CA3 — Publicação com violação confirmada registra as regras furadas no `audit_log`.
- [ ] CA4 — Rascunho e agendamento não acionam o gate.
- [ ] CA5 — As regras vivem em **um único módulo** reutilizado por `validate-post` (sem cópias divergentes).
- [ ] CA6 — Travessões (— / –) continuam sendo pegos (regra que já quebrou antes — STORY-025).
- [ ] CA7 — `npm run build` passa; sem novo erro de typecheck além do baseline.

## Arquivos esperados

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/validate-post/index.ts` | Retorno estruturado erros vs. warnings; consolidar regras |
| `src/admin/pages/posts/PostEditor.tsx` | Gate no publish + modal "publicar mesmo assim" + audit |
| (módulo compartilhado de regras) | Fonte única das regras Jimmy 3.0 |

## Decisões em aberto (confirmar com JG)

1. **Régua do gate:** confirmação explícita (proposto) vs. bloqueio duro vs. só warning? Proposta: confirmação explícita — segura sem travar o editor.
2. Quais regras são "erro" (exigem confirmação) vs. "warning" (só avisam)? Proposta acima.

## Notas de Implementação (2026-07-11)

- **Feito e no ar.** `validate-post` editada+deployada; UI no bundle `02172cc`. Commit `02172cc`.
- `validate-post` retorna erros ESTRUTURAIS e avisos SEPARADOS (`{ ok, errors, warnings }`).
- `PostEditor.tsx`: `runPublishGate()` chama `validate-post` server-side no publish; com erros → modal "Publicar fora do padrão Jimmy 3.0?" listando as violações (Voltar e ajustar / Publicar mesmo assim). Confirmar publica e grava no `audit_log` (`acao:'publish'`, `payload_after.publicado_com_violacao_jimmy3`). Rascunho/agendamento não acionam o gate. `validate-post` indisponível → degrada para publicar (não trava). Painel de lint mostra erros (vermelho) + avisos.
- **Régua confirmada:** confirmação explícita (meio-termo), não bloqueio duro — coerente com ADR-010. `acao='publish-com-violacao'` seria rejeitado pelo CHECK de `audit_log.acao`; usei `acao='publish'` + flag no payload.
- **Verificação:** deploy OK; build verde. Pendente: walkthrough do JG.
