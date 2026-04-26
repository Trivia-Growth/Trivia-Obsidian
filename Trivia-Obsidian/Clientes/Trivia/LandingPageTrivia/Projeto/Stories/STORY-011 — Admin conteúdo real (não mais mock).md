---
id: STORY-011
titulo: "Admin conteúdo real — leads, conversas, agente"
fase: 1
modulo: "Admin / Supabase"
status: parcial
prioridade: P2
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-011 — Admin conteúdo real

## Contexto

O painel admin usava dados mockados em telas de leads, conversas, blog e imagens. Era necessário conectar ao Supabase real.

## Solução (parcial)

- Tela `/admin/agente`: configuração completa do Jimmy (identidade, alma, memória, histórico) — **concluída**.
- Tela `/admin/leads`: lista leads reais do banco — **concluída**.
- Tela `/admin/conversas`: histórico de conversas — **concluída**.
- Telas `/admin/conteudo`, `/admin/blog`, `/admin/imagens`: ainda com mock ou estrutura básica.

## Pendências

- Admin de conteúdo (textos da landing editáveis pelo admin).
- Upload de imagens via admin.
- Editor de blog posts.

## Status

**Parcial** — admin de agente e leads operacionais. Conteúdo/blog/imagens pendentes.
