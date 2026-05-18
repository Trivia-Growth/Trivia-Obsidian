---
id: STORY-007
titulo: "TypeScript Strict Mode Progressivo"
fase: 2
modulo: "infra"
status: backlog
prioridade: baixa
agente_responsavel: "@dev"
criado: 2026-04-29
atualizado: 2026-04-29
---

# STORY-007 — TypeScript Strict Mode Progressivo

## Contexto

O `tsconfig.json` tem `noImplicitAny: false` e `strictNullChecks: false`. Isso permite 1.124 ocorrências de `any` e 71 padrões `as unknown as X` sem erro de compilação. Bugs de tipo ficam silenciosos até o runtime.

A abordagem progressiva é ativar strict mode para `src/features/` primeiro (que é vazio agora — tudo novo vai passar por strict), e para os demais módulos conforme forem sendo modificados.

**Pré-requisito:** STORY-002 (testes) concluída — precisamos dos testes para detectar regressões ao ativar strict.

## Spec de Referência

- `architecture.md` — ADR-008

## Critérios de Aceite

- [ ] CA1 — `src/features/` tem strict mode ativo via `tsconfig.features.json` ou path include
- [ ] CA2 — Qualquer novo arquivo em `src/features/` que use `any` causa erro de build
- [ ] CA3 — `tsconfig.json` base atualizado com comentário explicando a estratégia progressiva
- [ ] CA4 — Documentado em `architecture.md` como adotar strict para novos módulos

## Restrições

- NÃO ativar strict globalmente — quebraria o build de 20+ arquivos de uma vez
- NÃO migrar código existente nesta story — apenas configurar a infraestrutura para novos arquivos
- Mudança de apenas arquivos de configuração e documentação

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Arquivos a modificar:**
- `tsconfig.json` (adicionar comentário e possível `references`)
- `tsconfig.app.json` (verificar configurações atuais)
- `architecture.md` (ADR-008 atualizado)

---

## QA

> Preenchido pelo `@qa` após implementação.

**Gate:** —

**Checklist:**
- [ ] Build continua passando sem erros
- [ ] `npm test` continua passando
- [ ] Arquivo de teste criado em `src/features/` com `any` — deve falhar no build

**Notas:** —
