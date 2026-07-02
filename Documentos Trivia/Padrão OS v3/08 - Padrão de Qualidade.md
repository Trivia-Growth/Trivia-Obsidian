---
audiência: humano
atualizado: 2026-07-01
---

# 08 — Padrão de Qualidade

> Espelho humano. **Fonte da verdade: `_Scaffold/base/PADRAO-DE-QUALIDADE.md`** (a matriz
> completa, lida pelo agente). Aqui é a visão de navegação. Voltar: [[00 - Comece Aqui]].

## A pergunta que esta nota responde
"O que o Padrão OS **garante** de qualidade — e **como**?" A resposta é uma matriz única no
scaffold: cada barra de qualidade tem o seu **enforcement**, perfil e dono. Princípio: **"pronto"
é gate verde por comando, nunca inspeção visual.**

## Os quatro tipos de enforcement
- 🟢 **Gate CI** — falha o build automaticamente (bloqueante). É o nível mais forte.
- 🪝 **Hook local** (Husky) — pega o problema antes do push/commit.
- ☑️ **Checklist DoD** — verificado no PR ([[05 - Qualidade e Segurança]]).
- 📖 **Guia** — padrão documentado, aplicado e revisado por agente.

## O que é bloqueante na CI hoje (🟢)
Rastreabilidade AC→task (`eval:spec`), integridade da esteira (`audit:esteira`), Mermaid,
**lint** (Biome), **typecheck**, **arquitetura DDD** (`arch:check` — dependency-cruiser falha o
build se `domain/` importar framework/camada), **testes + cobertura** (threshold), **secret
scanning** (gitleaks) e **dependências vulneráveis** (`npm audit` alto+). No perfil **OS** somam
**SAST (Semgrep)** e **dependency review + SBOM**. Nenhum merge para `main` sem tudo verde.

## Pilares cobertos
- **Confiabilidade/método:** rastreabilidade, testes de aceite, runbooks, ADRs.
- **Código/arquitetura:** lint, typecheck, cobertura, camadas DDD, anti-over-engineering.
- **Segurança:** secret scan, audit de deps, RLS, threat model STRIDE, dívida registrada, OS-grade.
- **Performance:** budgets (Web Vitals/p95/bundle), índice/paginação/N+1.
- **Observabilidade:** erro `problem+json` com `reqId`, log sem PII, SLO/SLI.
- **IA/LLM:** evals, prompt versionado, OWASP LLM Top 10 ([[05 - Qualidade e Segurança]]).

→ Matriz completa (36 itens) com comando, perfil e dono: `_Scaffold/base/PADRAO-DE-QUALIDADE.md`.
A skill `/validar` (@qa) roda os gates e emite **PASS / CONCERNS / FAIL**.
