---
id: STORY-024
titulo: "Infra de Testes — Testes unitários de componentes React (RTL)"
modulo: "QA / Infra / Testes"
status: concluido
prioridade: P1
origem: claude
agente_responsavel: "@dev"
criado: 2026-04-29
atualizado: 2026-04-29
dependencias: ["STORY-023"]
---

# STORY-024 — Testes unitários de componentes React (RTL)

## Contexto

Após a STORY-023 estabelecer a infraestrutura Vitest, esta story adiciona o React Testing Library para testar componentes e hooks no ambiente jsdom. Foco nos componentes de maior impacto em compliance (ConsentBanner + analytics) e na lógica de UI crítica (useTypewriter).

## Critérios de Aceite

- [ ] CA1 — `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` e `jsdom` instalados como devDependencies
- [ ] CA2 — `vitest.setup.ts` expandido com: `@testing-library/jest-dom` import, mock de `window.dataLayer`, mock de `window.gtag`, `beforeEach` limpando `localStorage`
- [ ] CA3 — `src/lib/analytics.test.ts` com 2 testes: `loadConsent()` retorna `null` e remove localStorage após TTL 365 dias; `saveConsent({ analytics: true, marketing: false })` dispara `window.gtag` com `analytics_storage: "granted"` e `ad_storage: "denied"`
- [ ] CA4 — `src/hooks/use-trivia.test.ts` com 1 teste: `useTypewriter` com `enabled=false` retorna texto completo imediatamente sem aguardar timers
- [ ] CA5 — `src/components/ConsentBanner.test.tsx` com 2 testes: banner aparece sem consent salvo; "Aceitar tudo" fecha banner e salva no localStorage
- [ ] CA6 — `npm run test:browser` passa todos os 5 testes sem erros
- [ ] CA7 — `npm run typecheck` sem erros
- [ ] CA8 — `npm run lint` OK

## Escopo

**IN:**

- `package.json` (+ devDependencies: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`)
- `vitest.setup.ts` (expandir com jest-dom + mocks de GTM + localStorage cleanup)
- `src/lib/analytics.test.ts` (novo)
- `src/hooks/use-trivia.test.ts` (novo)
- `src/components/ConsentBanner.test.tsx` (novo)

**OUT:**

- ChatModal.test.tsx (complexidade de integração com fetch — deixar para depois)
- Testes de rotas TanStack (requerem setup de router que está fora do escopo inicial)
- Testes E2E (STORY-025)

## Detalhes de Implementação

### Setup GTM no vitest.setup.ts (adicionar)

```typescript
import "@testing-library/jest-dom";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "dataLayer", { value: [], writable: true });
  Object.defineProperty(window, "gtag", { value: vi.fn(), writable: true });
});
```

### analytics.test.ts — TTL test

- Setup: salvar no localStorage com `date` de 366 dias atrás
- Assert: `loadConsent()` retorna `null`
- Assert: `localStorage.getItem("trivia-consent")` é `null` (foi removido)

### ConsentBanner.test.tsx — atenção ao setup/teardown

ConsentBanner usa `localStorage` como estado persistente. Cada teste precisa de localStorage limpo (`beforeEach(() => localStorage.clear())`).

### Arquivos referência

- `src/lib/analytics.ts` — `loadConsent`, `saveConsent`, `applyConsent`, TTL 365d
- `src/hooks/use-trivia.ts` — `useTypewriter` com flag `enabled`
- `src/components/ConsentBanner.tsx` — banner LGPD, 3 categorias de consent

## Definition of Done

- [ ] `npm run test:browser` — 5 testes PASS
- [ ] `npm run test` — todos os testes (node + browser) passam juntos
- [ ] `npm run typecheck` sem erros
- [ ] `npm run lint` OK

## Implementação

**Status:** `concluido`
**Implementado por:** `@dev`
**Branch/PR:** `claude/identify-repo-language-15YNK`

## Arquivos alterados:

- [x] `vitest.setup.ts` (expandido — import jest-dom, configurable=true, beforeEach com localStorage.clear + reset gtag)
- [x] `tsconfig.json` (types + `@testing-library/jest-dom`)
- [x] `src/lib/analytics.test.ts` (novo — T13, T14)
- [x] `src/hooks/use-trivia.test.ts` (novo — T15)
- [x] `src/components/ConsentBanner.test.tsx` (novo — banner aparece; "Aceitar tudo" fecha e salva)

**Notas:** 22 testes passando no total (17 node + 5 browser). `window.gtag = vi.fn()` reatribuído em `beforeEach` do setup global — não precisa de mock local nos testes de analytics.

---

## QA

**Gate:** PASS
**Validado por:** `@dev`

- [x] Critérios de aceite validados
- [x] TypeScript sem erros (`npx tsc --noEmit`)
- [x] Lint OK (`npm run lint`)
- [x] 5 testes de browser passam: `npm run test:browser`
- [x] 22 testes totais passam: `npm run test`

## Change Log

| Data       | Agente | Ação                                                                                 |
| ---------- | ------ | ------------------------------------------------------------------------------------ |
| 2026-04-29 | @sm    | Story criada — testes de componentes React com RTL                                   |
| 2026-04-29 | @dev   | Implementação concluída — 5 testes browser passando, 22 total, lint OK, typecheck OK |
