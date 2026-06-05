---
title: "14/04/2026 — Redução de Crons LLM (~$101/mês)"
tags: [decisao, custos, crons]
created: 2026-04-17
---

# Redução de Crons LLM

## Contexto

Inventário completo de custos revelou ~$455/mês estimados em LLM. Identificadas redundâncias significativas nos crons do sales-head e agencia-head.

## Crons removidos

| Cron | Custo economizado | Motivo |
|------|------------------|--------|
| `agencia-head-panorama-1330` (`a28ecbb7`) | ~$26/mês | Redundante com resumo-07h + rotina horária |
| `sales-head-analise-transcricoes` (`a3f7c291`) | ~$35/mês | Substituído por invocação manual do JG quando há reunião |
| `sales-head-rotina-horaria` (`ee1ef2fc`) | ~$40/mês | Volume de pipeline não justificava cobertura horária |

**Total removido: ~$101/mês**

## Ajuste adicional

`agencia-head-rotina-horaria`: schedule reduzido de 6×/dia (`0 8,10,12,14,16,18`) para 3×/dia (`0 10,14,18`), mantendo cobertura nos momentos-chave. Economia adicional: ~$26/mês.

**Total economizado com ajuste: ~$127/mês (~28% do custo estimado)**

## Fluxo substituto para análise de transcrições

JG invoca `jimmy-sales-head` manualmente via DM. Skill `analise-reuniao` permanece intacta — só o trigger mudou.
