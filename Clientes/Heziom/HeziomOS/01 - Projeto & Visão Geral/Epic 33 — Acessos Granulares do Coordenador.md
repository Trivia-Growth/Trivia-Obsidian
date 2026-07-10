---
tipo: epico
status: draft
data: 2026-07-06
fonte_de_verdade: docs/specs/33-acessos-granulares-coordenador.spec.md + docs/epics/epic-33-*.md (repo heziomos)
pr: "#291 (docs)"
---

# Epic 33 — Acessos granulares do coordenador (por módulo)

> **Fonte de verdade viva = repositório** (`heziomos`): spec em `docs/specs/33-acessos-granulares-coordenador.spec.md`, épico em `docs/epics/epic-33-acessos-granulares-coordenador.md`, stories em `docs/stories/active/33.1..33.4`. Esta nota é espelho de referência. Ver também [[Estado Atual — Espelho dos Épicos]].

## Objetivo

Permitir que um admin defina, **por coordenador**, quais **módulos do sistema** a pessoa acessa (Atendimento, Comercial, Logística, Marketing, Relatórios, Liderança, Financeiro), com **acesso de gestão** dentro dos módulos liberados. Fora deles, não vê nada. **Administração** (Equipe/config do sistema/integrações/superadmin) não é ofertável.

## De onde veio

O papel `coordenador` nasceu como follow-up do Epic 23 (stories 23.8–23.10, em produção):
- **23.8** — transferência de atendimento entre atendentes (+ hotfix do WITH CHECK).
- **23.9** — papel coordenador (vê o time, transfere, exclui tags, 6 abas de config).
- **23.10** — o admin escolhe, por pessoa, quais **abas de Configurações de Atendimento** o coordenador vê.

O CEO (06/07) pediu o nível de cima: escolher quais **módulos** (não só abas de Atendimento) cada coordenador acessa, com acesso de gestão.

## As duas camadas (o ponto crítico)

Esconder o menu é a parte fácil (frontend). Mas o acesso real ao dado é gated por papel no backend em vários módulos:

| Módulo | Coordenador hoje | Ação |
|---|---|---|
| Atendimento, Comercial, Relatórios, Logística (ler) | já funciona | só gate de menu |
| **Financeiro** | 403 (exige gerência) | **backend** |
| **Liderança / BI / Dashboard CEO** | 403 | **backend** |
| **Marketing** (criar/editar/disparar campanha) | 403 (ler é liberado) | **backend** |

**Regra de ouro:** a liberação do backend é **por módulo liberado à pessoa**, nunca um passe geral. Um coordenador só acessa o Financeiro se tiver o módulo Financeiro marcado — via `crm.can_manage_area(uid, area)`, sem alargar `is_manager_or_admin` global.

## Stories (repo)

- **33.1** — Modelo de dados + autorização base: coluna `crm.profiles.allowed_areas` + trigger anti-auto-liberação + helpers `coordenador_has_area`/`can_manage_area`.
- **33.2** — Frontend: seletor de módulos na Equipe + gate de menu/rotas por área (gestão dentro da área).
- **33.3** — Backend por área: Financeiro, Liderança/BI e gestão de Campanhas aceitam coordenador com o módulo liberado.
- **33.4** — Security Gate do épico (auto-concessão, passe geral, menu-sem-403, dado financeiro).

**Ordem:** 33.1 → 33.3 → 33.2 → 33.4 (backend antes/junto do front, pra nenhum menu abrir dando 403).

## Decisões do CEO (06/07)

1. Dentro dos módulos liberados: **acesso de gestão** (nível gerência).
2. Módulos ofertáveis: Atendimento, Comercial, Logística, Marketing, Relatórios, Liderança, Financeiro. **Administração não.**
3. Default: sem módulo marcado = coordenador não vê nada (least-privilege).
