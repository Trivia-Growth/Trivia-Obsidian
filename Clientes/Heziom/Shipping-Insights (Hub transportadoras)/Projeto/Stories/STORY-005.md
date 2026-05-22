---
id: STORY-005
titulo: "Bugs confirmados e credenciais expostas"
fase: 1
modulo: "Correções"
status: pronto
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-005 — Bugs confirmados e credenciais expostas

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) confirmou bugs concretos e
credenciais expostas que devem ser corrigidos antes do sistema entrar em uso.

## Critérios de Aceite

- [ ] CA1 — `logmanager-webhook` compila (remover declaração duplicada de
  `STATUS_LABELS` e imports não usados)
- [ ] CA2 — Edição de lançamento (`useShippingData` / `Lancamentos.tsx`)
  SUBSTITUI os valores em vez de somar
- [ ] CA3 — Importação de planilha (`Relatorios.tsx`) rejeita datas inválidas
  em vez de gravá-las
- [ ] CA4 — Logs de credenciais removidos de `_shared/correios-auth.ts`
- [ ] CA5 — Credenciais hardcoded removidas do frontend (`AdminAmazonVendor.tsx`,
  `AdminMercadoLivre.tsx`)
- [ ] CA6 — `logmanager-webhook` não usa UUID de usuário hardcoded
- [ ] CA7 — `melhor-envio-sync` — filtro de data funcional ou parâmetro removido
- [ ] CA8 — `AdminTray.tsx` monta a URL do webhook via env var (como as demais telas)

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 2 (bugs) e itens S5, S6, S17

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
