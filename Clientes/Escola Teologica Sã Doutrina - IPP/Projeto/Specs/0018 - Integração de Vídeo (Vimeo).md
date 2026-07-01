---
numero: "0018"
titulo: Integração de Vídeo (Vimeo)
tier: arquitetural
status: rascunho
fase: 1
modulo: M10
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0018 — Integração de Vídeo (Vimeo)

> Espelho de `specs/0018-integracao-vimeo/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `design.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** arquitetural (exige `design.md` — feito; ADR-0009)
**Status:** rascunho (specs escritas, aguardando `@dev` implementar)
**Módulo (ESPECIFICACAO.md):** M10 — Integração de Vídeo (Vimeo)
**Repo:** `specs/0018-integracao-vimeo/`

---

## Por quê / para quem (product.md)
A 0007 grava a **referência** do vídeo Vimeo numa Aula EAD, mas não puxa nada — dor D10 (vitrine
pobre: vídeo externo sem thumbnail/metadados). Para Professor/Secretaria (recebem thumbnail e
duração automáticos) e Aluno EAD (vê capa e duração). Não se aplica ao presencial.

## Resumo (spec.md)
Ao (re)informar a referência do vídeo Vimeo numa Aula de curso **Online (EAD)**, o sistema obtém
**server-side** o vídeo, a thumbnail e os metadados (título, duração, dimensões, status) do Vimeo,
persiste no contexto Educação e exibe — com o token do Vimeo só no servidor (Edge Function,
ADR-0009 — `docs/adr/0009-integracao-vimeo-fetch-server-side.md` no repo) e **sem** se aplicar ao
presencial.

## Critérios de aceite
- [ ] AC-0 — Mockup da exibição de thumbnail/metadados aprovado pelo JG antes de codar UI
- [ ] AC-1 — Informar vídeo em Aula EAD obtém vídeo + thumbnail + metadados
- [ ] AC-2 — Obtenção acontece server-side, sem token no client
- [ ] AC-3 — Curso Presencial não obtém vídeo (exclusivo do Online)
- [ ] AC-4 — Referência inválida/indisponível não gera thumbnail quebrada
- [ ] AC-5 — Exibição usa o metadado cacheado, sem chamar o Vimeo por visualização
- [ ] AC-6 — Só quem edita o conteúdo aciona a obtenção; escrita do metadado é só server-side

## Fora de escopo
- Gravar/validar a `video_ref` na Aula (é a 0007).
- Player/reprodução rica (controles, qualidade, legendas, DRM) e upload de vídeo para o Vimeo.
- Qualquer coisa do Presencial (não tem vídeo — conteúdo é Material Complementar, M9).
- Controle de acesso por matrícula/liberação progressiva (M5/M7) — só se acompanha a visibilidade da Aula.
- Re-sincronização periódica automática (cron) — MVP é sob demanda.
- Outros provedores de vídeo (YouTube, aula ao vivo — Fase 2). Só Vimeo.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 1 | Value objects `VideoRef`/`VideoMetadata` + porta `ProvedorDeVideo` (domínio) | todo |
| 2 | ACL `VimeoProvider` (infrastructure) mapeando payload do Vimeo | todo |
| 3 | Migration `educacao.aula_video_meta` (cache 1:1 com a Aula) | todo |
| 4 | RLS FORCE de `aula_video_meta` + testes pgTAP | todo |
| 5 | Caso de uso `SincronizarVideoDaAula` (application) | todo |
| 6 | Edge Function `vimeo-fetch-metadata` (token no servidor) | todo |
| 7 | Auditoria `aula.video_sincronizado` em `audit.events` | todo |
| 8 | Mockup da exibição de thumbnail/duração aprovado pelo JG | todo |
| 9 | UI do editor: aciona obtenção + exibe thumbnail/duração | todo |
| 10 | UI de listagem/aula do Aluno lê thumbnail/duração do cache | todo |

## Decisões / ADRs relacionados
- ADR-0009 — Integração Vimeo server-side, exclusiva do Online (`docs/adr/0009-integracao-vimeo-fetch-server-side.md` no repo).
- ADR-0004 — Papel via JWT custom claim (base da RLS por Papel).
