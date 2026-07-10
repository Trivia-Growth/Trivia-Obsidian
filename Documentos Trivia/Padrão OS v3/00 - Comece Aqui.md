---
audiência: humano
padrão: Padrão OS v3
atualizado: 2026-07-01
---

# Padrão OS — Comece Aqui

> **Para humanos.** Este guia no Obsidian é o **espelho** do padrão. A **fonte da verdade que o
> agente lê** é o scaffold em `_Scaffold/` (CLAUDE.md, docs/, specs/, skills). Se algo aqui
> contradisser o scaffold, **o scaffold vence**. Não duplicamos norma aqui — referenciamos.

## O que é
O **Padrão OS** é o padrão único (v3) da Trivia para construir software **com agentes de IA**.
Combina:
- **Esteira SDD** (Spec-Driven Development): Lean Inception → DDD → Technical Design → Spec →
  Tasks, com **gates executáveis**.
- **Agentes Triviaiox** executando a esteira (sem alterar o core do framework).
- **Dois perfis:** sistema **single-repo** (isolado) e sistema **OS** (monorepo multi-domínio).

Substitui o antigo [[Leia me Antes de começar algo|Padrão Projetos]] (depreciado para agentes;
sem Lovable).

## Princípio central
**A spec é a fonte da verdade.** O agente implementa a partir de `specs/NNNN-*/spec.md`; os
critérios de aceite (`AC`) são contrato e oráculo de teste. Nada de inventar; nada de "done" por
inspeção — só por **gate verde**.

## Mapa do guia
- [[01 - Metodologia]] — esteira SDD, tiers de cerimônia, artefatos e rastreabilidade.
- [[02 - Agentes Triviaiox]] — quem faz o quê, autoridade, squad trivia-os.
- [[03 - Perfis de Projeto]] — single-repo × OS e quando promover.
- [[04 - Arquitetura]] — camadas DDD, stack, banco de dados, estrutura de código.
- [[05 - Qualidade e Segurança]] — Definition of Done, gates, segurança por perfil, trilha de IA.
- [[06 - Operações]] — git, CI/CD, runbooks, observabilidade.
- [[07 - Como usar o Scaffold]] — copiar `base/`, aplicar `os-layer/`, instalar o squad.
- [[08 - Padrão de Qualidade]] — o que é garantido e **como** (gate / hook / checklist / guia).
- [[09 - Receitas (Banco, Edge, HTTP)]] — RLS, migration, Edge Function, borda HTTP, port/adapter,
  sync/espelho de dados.

## Como começar um projeto (resumo)
1. Copie `_Scaffold/base/` para o repositório novo e instale o squad
   (`_Scaffold/squads/trivia-os/` — agentes, hook de autoridade, config).
2. Diga ao agente: *"seguindo o padrão, vamos iniciar o projeto com essas especificações"* —
   isso aciona a skill **`/iniciar-projeto`**, que decide o perfil, preenche `docs/PROJECT.md`,
   decompõe as especificações em features (epics) e orquestra os agentes, **anunciando cada
   etapa e o porquê** (ADR, spec, tasks visíveis).
3. Features seguintes: `/nova-feature`, espelhando `specs/0001-calculo-comissao/`.
4. Detalhes em [[07 - Como usar o Scaffold]].
