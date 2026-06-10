---
title: IPP Reembolsos — Mockups aprovados
cliente: IPP — Igreja Presbiteriana de Pinheiros
status: aprovado
aprovado_em: 2026-06-10
tags: [ipp, reembolso, mockup, design]
---

# Mockups aprovados (2026-06-10)

> Telas validadas por JG antes do desenvolvimento. Design travado — base visual da Fase 1. Referência: [[Arquitetura e Fluxos]].

## 1. Painel do líder (celular)

- Verba do departamento no topo: **orçado/ano · realizado · saldo** + barra de % consumido.
- Seletor de departamento (líder pode ter mais de um).
- Lista "Minhas solicitações" com status colorido: `Em validação` (azul) · `No financeiro` (âmbar) · `Paga` (verde) · `Reprovada` (vermelho).
- Botão "Nova solicitação".

## 2. Nova solicitação (celular)

- Itens com descrição, valor e data; **comprovante por item** via **Tirar foto** (câmera) ou **Enviar arquivo**.
- **Trava do comprovante:** item sem anexo mostra bloco "Comprovante obrigatório"; botão **Enviar fica desabilitado** com aviso "Falta o comprovante de N item(ns)". Item com nota anexada fica verde.
- Dados de recebimento (PIX) + total.

## 3. Fila do financeiro

- **Departamento em destaque** = título de cada linha (negrito), com faixa lateral colorida (vermelha quando o depto está com orçado estourado) e selo "orçado estourado".
- Filtro por departamento no topo.
- Cards de resumo: aguardando aprovação · aprovadas a pagar · pago no mês.
- Ações por status: **Aprovar / Reprovar** (validadas) · **Marcar pago** (aprovadas) · **Ver** (pagas).
- "Ver comprovantes" direto na linha.
- Botão **Exportar para o Prover**.

## 4. Administração do financeiro (orçado vs. realizado)

- Consolidado de **todos os departamentos**, agrupados em **Ministérios** e **Sociedades internas**.
- Por linha: realizado de orçado · barra de consumo · **% (vermelho se acima de 100%)** · saldo.
- Cards de topo: orçado total · realizado · % consumido · nº de departamentos acima do orçado.
- Linha clicável → extrato do departamento.

## Decisões de design travadas

- Status: `Em validação` · `No financeiro` / `A pagar` · `Paga` · `Reprovada`.
- Estouro de orçamento sempre sinalizado em vermelho (linha, %, selo).
- Comprovante é pré-requisito visível e bloqueante para enviar.

> Escopo refletido na [[STORY-008 — Painel Orcado vs Realizado|STORY-008]] (administração do financeiro) e [[STORY-005 — Solicitacao de Reembolso|STORY-005]] (trava do comprovante).
