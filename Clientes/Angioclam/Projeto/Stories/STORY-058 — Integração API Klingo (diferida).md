---
id: STORY-058
titulo: "Integração API Klingo (diferida — visão Sergio)"
fase: 5
modulo: "integração"
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-058 — Integração API Klingo (DIFERIDA)

## Contexto

Áudio Sergio 2026-05-19: o ideal é não precisar subir relatórios — a Klingo
abrir API para o sistema puxar atendimentos/exames direto. Depende de a Klingo
liberar a API (Marcelo/Angioclam coordenam). Por ora seguimos por upload.

## Escopo (a planejar quando a API existir)

- Conector Klingo (auth + endpoints de atendimentos, exames realizados,
  exames solicitados, comorbidades) → alimentar o motor sem upload.
- Mapear payload da API para o agregado PII-free do motor.

## Critérios de Aceite (rascunho)

- [ ] CA1 — autenticação e leitura via API Klingo
- [ ] CA2 — mesmo agregado/saída do fluxo por upload (paridade)
- [ ] CA3 — upload continua como fallback

## Implementação

**Status:** `backlog` — aguardando API Klingo.
