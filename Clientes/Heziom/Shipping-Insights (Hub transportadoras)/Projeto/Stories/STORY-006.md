---
id: STORY-006
titulo: "Confiabilidade das integrações (dedup, retry, OAuth)"
fase: 1
modulo: "Integrações"
status: backlog
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-006 — Confiabilidade das integrações

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) apontou que as integrações não são
confiáveis sob carga: sem deduplicação, sem retry, login OAuth frágil.

## Critérios de Aceite

- [ ] CA1 — Webhooks com deduplicação/ordenação de eventos (só atualizar status
  quando o evento recebido for mais recente que o armazenado)
- [ ] CA2 — Chamadas externas com retry + tratamento de HTTP 429 (`Retry-After`)
- [ ] CA3 — Erro pontual de uma transportadora não derruba o lote inteiro
- [ ] CA4 — Refresh de token OAuth robusto (serializar refresh; persistir
  refresh token rotativo de ML/Tray)
- [ ] CA5 — Validação de input (Zod) em todos os webhooks
- [ ] CA6 — `melhor-envio-sync` com lock contra execução concorrente e status de job

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 3 (confiabilidade)

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
