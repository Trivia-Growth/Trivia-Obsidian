---
title: "04/04/2026 — Simplificação Multi-Agente"
tags: [decisao, arquitetura, agentes]
created: 2026-04-17
---

# Simplificação Multi-Agente

## Decisões

- **`jimmy-ceo` desativado** — papel redundante com trivia+heads
- **Roteamento direto** — trivia roteia diretamente para agencia-head / sales-head (sem camada intermediária)
- **Timeout:** 600s por chamada de Head
- **`captura-mensagens.cjs`** reescrito com exclusividade por grupo (sem duplicação entre agentes)

## Resultado

Arquitetura de 4 agentes: trivia, agencia-head, sales-head, cs-head. Cada um com workspace próprio e escopo bem definido.
