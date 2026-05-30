# Vista Intel Pro (Trivia Tasker) — Indice

## Documentos do Projeto

| Documento | Descricao |
|-----------|-----------|
| [[Projeto/Dashboard]] | Visao geral, stack, features, metricas |
| [[Projeto/Arquitetura]] | Diagrama, componentes, schema, Edge Functions |
| [[Projeto/Roadmap]] | Features concluidas, backlog, oportunidades |

## Links Uteis

| Recurso | URL |
|---------|-----|
| Producao (Netlify) | `[placeholder]` |
| Supabase Dashboard | `[placeholder]` |
| Repositorio | https://github.com/Triviastudio/vista-intel-pro |
| Stories (no repo) | `docs/stories/` |
| CLAUDE.md (instrucoes agentes) | raiz do repositorio |

## Acessos

| Servico | Notas |
|---------|-------|
| Netlify | Deploy automatico via git push main |
| Supabase | PostgreSQL + Auth + Storage + Edge Functions |
| Stripe | Billing e planos |

## Equipe

| Papel | Quem |
|-------|------|
| Piloto (dev) | Lucas Azevedo |
| Agentes | TRIVIAIOX v5.0.3 (analyst, planner, coder, tester) |
| Cliente interno | Trivia |
| Usuarios ativos | Thomaz (Onix LAB), equipe Trivia |

## Notas

- Sistema em **producao ativa** — qualquer mudanca requer Diff Plan aprovado
- Editado via Lovable + Claude Code — sincronismo critico (ver CLAUDE.md)
- Multi-tenant: suporta multiplas organizacoes isoladas
- Billing via Stripe com limites por plano
