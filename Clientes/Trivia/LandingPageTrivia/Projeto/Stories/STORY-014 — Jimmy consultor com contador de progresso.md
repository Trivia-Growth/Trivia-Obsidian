---
id: STORY-014
titulo: "Jimmy: consultor com contador de progresso e prompt configurável"
fase: 1
modulo: "Landing / ChatModal + Netlify Functions / Jimmy"
status: concluido
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-25
atualizado: 2026-04-25
---

# STORY-014 — Jimmy consultor com contador de progresso

## Contexto

O Jimmy tinha três problemas:
1. **Comportamento de consultor fraco** — fazia perguntas em loop, repetia questões, nunca chegava a uma proposta de IA concreta.
2. **Sem indicação de progresso** — usuário não sabia quanto faltava para terminar o diagnóstico.
3. **Prompt 100% hardcoded** — qualquer ajuste de comportamento exigia deploy.

## Solução

### Feature 1 — Contador de progresso (ChatModal.tsx)

- Constante `MAX_DISCOVERY_TURNS` lida de `VITE_MAX_DISCOVERY_TURNS` (fallback: 8).
- Header do modal exibe `DIAGNÓSTICO · X/8` durante o chat.
- Cores: verde (0–5 trocas) → âmbar (`#febc2e`, 6–7) → coral + "COMPLETO" (8+).

### Feature 2 — Prompt configurável via admin

- Regras de comportamento e fluxo movidas para `agent_memory` tipo `rule` no banco.
- Admin `/admin/agente` → Memória permite editar sem deploy.
- Apenas 6 invariantes técnicas permanecem hardcoded em `chat.ts`.

### Feature 3 — Histórico completo enviado ao modelo

- Frontend enviava só mensagens do usuário — Jimmy não tinha memória das próprias respostas.
- Corrigido: `apiMessages` inclui user + assistant alternando.
- Schema Zod atualizado para aceitar `role: "user" | "assistant"`.

## Memórias configuradas no admin (tipo `rule`)

| Título | Conteúdo |
|--------|----------|
| COMPORTAMENTO | Uma pergunta por vez, nunca repetir, máx 3 frases + 1 pergunta |
| FLUXO DA CONVERSA | Ordem: site/Instagram → 7 perguntas → encerrar com proposta de IA |
| ENCERRAMENTO E PROPOSTA DE IA | Resumo + proposta personalizada + "Nossa equipe volta em 48h" |
| Brief schema | Formato `<brief>...</brief>` com campos capturados + ready_to_close |

## Variáveis de ambiente Netlify

| Var | Valor padrão | Efeito |
|-----|-------------|--------|
| `VITE_MAX_DISCOVERY_TURNS` | 8 | Número de trocas no diagnóstico |

## Status

**Concluído** — deploy em produção 2026-04-25.
