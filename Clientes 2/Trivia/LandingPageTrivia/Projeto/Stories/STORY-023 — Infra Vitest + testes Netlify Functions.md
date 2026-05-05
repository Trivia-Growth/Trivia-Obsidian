---
id: STORY-023
titulo: "Infra de Testes — Setup Vitest + testes unitários das Netlify Functions"
modulo: "QA / Infra / Testes"
status: concluido
prioridade: P1
origem: claude
agente_responsavel: "@dev"
criado: 2026-04-29
atualizado: 2026-04-29
dependencias: []
---

# STORY-023 — Setup Vitest + testes unitários das Netlify Functions

## Contexto

O projeto não tem nenhuma infraestrutura de testes. O script `test` no `package.json` é `echo "No test suite configured yet"`. Nenhum framework de testes está instalado. Qualquer PR pode quebrar silenciosamente o fluxo de chat, captura de leads ou autenticação admin sem verificação automática.

Esta story cria a base: Vitest configurado com dois ambientes (`node` para funções serverless, `jsdom` para componentes), e implementa os 12 testes unitários mais críticos das Netlify Functions.

## Critérios de Aceite

- [ ] CA1 — `vitest.config.ts` criado com projetos `node` e `browser` separados; plugin `tanstackStart()` **não** incluído (conflita com ambiente de testes)
- [ ] CA2 — `vitest.setup.ts` criado com polyfills para jsdom: `IntersectionObserver`, `matchMedia`, `requestAnimationFrame`, `performance.now`, `dataLayer`, `gtag`
- [ ] CA3 — Scripts adicionados em `package.json`: `test`, `test:watch`, `test:ui`, `test:coverage`, `test:node`, `test:browser`
- [ ] CA4 — `netlify/functions/lead.test.ts` com 4 testes: validação Zod (email inválido → 400), deduplicação 24h (sem INSERT), Turnstile configurado + token ausente → 403, Turnstile não configurado (dev) → passa
- [ ] CA5 — `netlify/functions/chat.test.ts` com 4 testes: `extractBrief()` extrai bloco `<brief>` e remove do texto, fallback para `json`, MSG_CAP=60 bloqueia → 429, `ready_to_close` com <4 turns não fecha conversa
- [ ] CA6 — `netlify/functions/admin-login.test.ts` com 2 testes: `safeEqual` previne timing attack, rate limit 5/15min → 429
- [ ] CA7 — `netlify/functions/_lib/admin-auth.test.ts` com 2 testes: sem `ADMIN_API_TOKEN` → retorna true (dev); token errado/ausente → false
- [ ] CA8 — `npm run test:node` passa todos os 12 testes sem erros
- [ ] CA9 — `npm run typecheck` sem erros nos arquivos de teste
- [ ] CA10 — `npm run lint` OK

## Escopo

**IN:**

- `vitest.config.ts` (novo)
- `vitest.setup.ts` (novo)
- `package.json` (scripts + devDependencies: `vitest`, `@vitest/coverage-v8`, `@vitest/ui`)
- `netlify/functions/lead.test.ts` (novo)
- `netlify/functions/chat.test.ts` (novo)
- `netlify/functions/admin-login.test.ts` (novo)
- `netlify/functions/admin-agent.test.ts` (novo — testes de discriminated union)
- `netlify/functions/_lib/admin-auth.test.ts` (novo)

**OUT:**

- Testes de componentes React (STORY-024)
- Testes E2E com Playwright (STORY-025)
- GitHub Actions CI (STORY-026)
- Cobertura de 100% — objetivo inicial é cobrir os fluxos críticos

## Detalhes de Implementação

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsConfigPaths(), react()],
  test: {
    projects: [
      {
        name: "node",
        include: ["netlify/functions/**/*.test.ts", "src/lib/**/*.test.ts"],
        environment: "node",
        globals: true,
      },
      {
        name: "browser",
        include: ["src/components/**/*.test.tsx", "src/hooks/**/*.test.ts"],
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "netlify/functions/**/*.ts",
        "src/lib/**/*.ts",
        "src/hooks/**/*.ts",
        "src/components/**/*.tsx",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/lib/database.types.ts",
        "src/routeTree.gen.ts",
      ],
    },
  },
});
```

### Mocking Strategy

- **Supabase:** `vi.mock("../../src/lib/supabase-server")` com builder pattern encadeado
- **OpenRouter + Turnstile:** `vi.stubGlobal("fetch", vi.fn())` com `mockImplementation` que inspeciona a URL
- **Env vars:** `vi.stubEnv("TURNSTILE_SECRET_KEY", "secret")`

### Arquivos referência para os testes

- `netlify/functions/chat.ts` — lógica de `extractBrief`, `MSG_CAP`, `ready_to_close`
- `netlify/functions/lead.ts` — validação Zod, Turnstile, deduplicação
- `netlify/functions/admin-login.ts` — rate limit, `safeEqual`, timing-safe compare
- `netlify/functions/_lib/admin-auth.ts` — `checkAdminToken`, guard de endpoints

## Definition of Done

- [ ] `npm run test:node` — 12 testes PASS
- [ ] `npm run test:coverage` — relatório gerado em `coverage/`
- [ ] `npm run typecheck` sem erros
- [ ] `npm run lint` OK
- [ ] `npm run build` ainda funciona (vitest.config.ts não interfere com vite.config.ts)

## Implementação

> Preencher ao começar. Atualizar ao concluir.

**Status:** `pronto`
**Implementado por:** `@dev`
**Branch/PR:** `claude/identify-repo-language-15YNK`

## Arquivos alterados:

- [x] `vitest.config.ts` (novo — projetos node + browser, Vitest 4.x)
- [x] `vitest.setup.ts` (novo — polyfills jsdom, GTM mocks)
- [x] `package.json` (scripts test, test:watch, test:ui, test:coverage, test:node, test:browser)
- [x] `netlify/functions/lead.test.ts` (novo — T01-T04)
- [x] `netlify/functions/chat.test.ts` (novo — T05-T08)
- [x] `netlify/functions/admin-login.test.ts` (novo — T09-T10)
- [x] `netlify/functions/admin-agent.test.ts` (novo — discriminated union)
- [x] `netlify/functions/_lib/admin-auth.test.ts` (novo — T11-T12)

**Notas:** Vitest 4.x usa formato `{ plugins, test: { name, ... } }` por projeto (diferente da doc 2.x). Typo `maybySingle` → `maybeSingle` resolvido. 17 testes passando.

---

## QA

**Gate:** PASS
**Validado por:** `@dev`

- [x] Critérios de aceite validados
- [x] Build sem erros (`npm run build` — vitest.config.ts independente de vite.config.ts)
- [x] TypeScript sem erros (`npx tsc --noEmit`)
- [x] Lint OK (`npm run lint`)
- [x] 17 testes passam: `npm run test:node` — 5 arquivos, 17 testes

## Change Log

| Data       | Agente | Ação                                                                |
| ---------- | ------ | ------------------------------------------------------------------- |
| 2026-04-29 | @sm    | Story criada — infraestrutura de testes unitários (Vitest)          |
| 2026-04-29 | @dev   | Implementação concluída — 17 testes passando, lint OK, typecheck OK |
