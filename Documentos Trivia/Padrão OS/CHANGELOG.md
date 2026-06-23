# CHANGELOG — Padrão OS

> Versionamento do próprio padrão. Norma nova entra **no scaffold** (`_Scaffold/`) e é resumida
> aqui. Owner do padrão: <definir>. Processo: PR no vault + scaffold; rodar `audit:esteira` e
> `eval:spec` antes de marcar a versão.

## v2.0.0 — 2026-06-22
Primeira versão do **Padrão OS**, substituindo o Padrão Projetos (focado em Lovable, depreciado
para agentes).

**Adicionado**
- Esteira **SDD** completa (Lean Inception → DDD → Technical Design → Spec → Tasks) com **tiers**
  de cerimônia e **gates executáveis**.
- **Scaffold copiável** como fonte da verdade: `base/` (single-repo) + `os-layer/` (OS) + squad
  `trivia-os` (extensão Triviaiox sem tocar no core).
- **Exemplo de referência** 100% preenchido (`specs/0001-calculo-comissao/`: spec→domain→tasks→
  código→testes→ADR).
- **Gates** com scripts (`audit-esteira`, `eval-spec-fidelity`, `validate-mermaid`), CI e PR template.
- **Segurança por perfil**: baseline mínimo (single-repo) × OS-grade (RLS FORCE, audit append-only,
  Vault, webhooks HMAC).
- **Trilha de IA/LLM**: evals, prompt versionado, defesa contra injection, OWASP LLM Top 10.
- **Anti-padrões e stop-conditions** para conter super-produção do agente.
- Guia no vault (notas 00–07) como espelho humano referenciando o scaffold.

**Origem**: consolida padrões de produção do HeziomOS, a metodologia do spec-driven e a
orquestração do Triviaiox.
