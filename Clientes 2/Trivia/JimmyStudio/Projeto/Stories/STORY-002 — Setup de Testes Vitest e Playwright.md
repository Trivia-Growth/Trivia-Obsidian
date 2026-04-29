---
id: STORY-002
titulo: "Setup de Testes — Vitest + Playwright"
fase: 2
modulo: "infra"
status: pronto
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-29
atualizado: 2026-04-29
---

# STORY-002 — Setup de Testes: Vitest + Playwright

## Contexto

O projeto tem 779 componentes e 132 Edge Functions, mas praticamente zero cobertura de testes (1 arquivo). Não há ambiente de staging — qualquer mudança vai direto para produção com clientes reais. Isso torna os testes o pré-requisito mais crítico do projeto: sem eles, não é seguro fazer nenhum refactor estrutural.

Esta story estabelece a infraestrutura de testes e os primeiros testes dos fluxos mais críticos.

## Spec de Referência

- [[Documentos Trivia 2/Padrão Projetos/02 - Qualidade/Testes Automatizados]]
- `PROJECT_REQUIREMENTS.md` — seção de Questões Abertas, item 1
- `architecture.md` — ADR-004 (sem staging)

## Critérios de Aceite

- [ ] CA1 — Vitest configurado e rodando (`npm test` passa sem erros)
- [ ] CA2 — Testes unitários cobrindo as funções utilitárias de `src/lib/` (utils.ts, image-compressor.ts, aov-utils.ts)
- [ ] CA3 — Testes de schemas Zod das Edge Functions críticas (agent-api, generate-content) — input válido e inválido
- [ ] CA4 — Playwright configurado (`npx playwright test` executa)
- [ ] CA5 — Teste E2E do fluxo de login (`/auth` → autenticação → redirect para `/dashboard`)
- [ ] CA6 — Teste E2E do fluxo principal: dashboard Meta Ads carrega com dados
- [ ] CA7 — `npm test` integrado ao Diff Plan — agentes executam antes de marcar story como concluída
- [ ] CA8 — Documentação de como rodar testes localmente em `docs/TESTING.md`

## Restrições

- Não usar mocks do Supabase client — testes de integração devem usar ambiente real ou fixtures
- Playwright deve testar contra a URL de produção (ou localhost com `npm run dev`)
- Não criar testes para componentes que ainda não têm comportamento estável — foco em utils e fluxos críticos primeiro

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

**Arquivos a criar/modificar:**
- `vitest.config.ts` (ou atualizar o existente)
- `src/test/setup.ts` — setup global de testes
- `src/lib/utils.test.ts`
- `src/lib/image-compressor.test.ts`
- `playwright.config.ts` (já existe — verificar configuração)
- `tests/auth.spec.ts`
- `tests/dashboard.spec.ts`
- `docs/TESTING.md`

---

## QA

> Preenchido pelo `@qa` após implementação.

**Gate:** —

**Checklist:**
- [ ] `npm test` passa sem erros
- [ ] `npx playwright test` executa e não trava
- [ ] Testes de utils cobrem: caso normal, caso vazio, caso inválido
- [ ] Testes E2E passam no ambiente de produção
- [ ] Documentação de testes clara e executável

**Notas:** —
