---
id: STORY-015
titulo: "Dev — Correções Pós-Auditoria QA (STORY-014)"
fase: 1
modulo: "transversal"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-015 — Dev: Correções Pós-Auditoria QA

## Contexto

Executada após STORY-014. O `@dev` recebe o relatório do `@qa` e corrige todos os achados, priorizando por severidade. Issues Críticas/Altas com story própria são tratadas separadamente; esta story cobre achados Médio/Baixo.

## Pré-condição

STORY-014 concluída com Gate FAIL ou CONCERNS.

## Missão do @dev

1. Ler relatório da STORY-014
2. Corrigir por severidade (Médio/Baixo nesta story; Crítico/Alto em story própria)
3. `npm run build` + `npm run lint` após cada bloco de correções
4. Notificar `@qa` para re-validar

## Protocolo

```
Crítico/Alto sem story → abrir story → implementar
Médio → corrigir aqui
Baixo simples → corrigir aqui
Baixo complexo → registrar story de debt técnico
```

## Critérios de Conclusão

- [ ] Todos os achados Médio/Baixo corrigidos
- [ ] Build + lint + npm audit limpos
- [ ] `@qa` re-validou: Gate PASS
- [ ] Push para main

---

## Implementação

**Status:** `backlog` (aguarda STORY-014)

**Depende de:** STORY-014

**Achados atribuídos:** _(preencher após STORY-014)_

---

## QA Re-validação

**Gate:** pendente

**Declaração do @qa:**
