---
id: STORY-005
titulo: "Tornar buckets de storage privados (signed URLs)"
fase: 1
modulo: "storage"
status: concluido
prioridade: alta
agente_responsavel: "@dev / @security"
criado: 2026-06-18
atualizado: 2026-06-18
---

> ✅ **Concluída 2026-06-18.** Buckets `inspecao-fotos` e `pcm-relatorios` privados; frontend resolve signed URLs (foto de inspeção, PDF, download do relatório). Descoberto e corrigido no teste e2e: `createSignedUrl` exigia policy de SELECT em storage.objects (migration 20260618000002). Validado no preview com bucket privado. Commits d99665f + docs.

# STORY-005 — Tornar buckets de storage privados

## Contexto

Achado **SEC-010 (P1)**, confirmado em produção: dos 5 buckets, **`inspecao-fotos` e `pcm-relatorios` estão PÚBLICOS** — qualquer pessoa com a URL acessa fotos de inspeção predial e relatórios de clientes sem autenticação. (`laudos-fotos`, `laudos-pdf`, `pcm-proposals` já são privados.)

## Spec de Referência

- `SECURITY_DEBT.md` → SEC-010
- [[../Mapeamento/06 - Seguranca e Infra]] e [[../Mapeamento/00b - Verificacao]] (item 7)

## Critérios de Aceite

- [ ] CA1 — `inspecao-fotos` e `pcm-relatorios` tornados **privados**.
- [ ] CA2 — Onde o frontend exibe fotos/relatórios desses buckets, passar a usar **signed URLs** (`createSignedUrl`) com expiração.
- [ ] CA3 — Storage policies revisadas para leitura por papel.
- [ ] CA4 — Nenhuma tela quebra (inspeções, relatórios diário/mensal continuam exibindo as imagens/PDFs).

---

## Implementação

**Status:** `pronto`

**Notas:**
- Mapear todos os pontos do frontend que montam URL pública desses buckets (`getPublicUrl`) e trocar por `createSignedUrl`.
- Atenção: relatórios enviados por WhatsApp/Evolution que usem link público desses buckets precisam de URL assinada com validade adequada (ou outro canal).
- Tornar privado via dashboard ou SQL (`update storage.buckets set public=false`).

---

## QA

**Gate:** *(pendente)*

- [ ] URL antiga pública dos 2 buckets retorna 403/erro.
- [ ] Telas de inspeção e relatórios exibem mídia normalmente (via signed URL).
- [ ] Envio de relatório no WhatsApp continua acessível ao destinatário.
