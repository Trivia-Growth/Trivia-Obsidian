# Definition of Done — Padrão OS

> Uma feature/task **não está pronta por inspeção visual** — está pronta quando os **gates
> executáveis passam**. Este arquivo é o contrato de qualidade; o `@qa` valida por ele.

## Gates locais (Husky — automáticos, sem precisar rodar manualmente)
| Hook | Quem | O que verifica |
|------|------|----------------|
| `pre-commit` | `@dev` a cada commit | Biome nos arquivos staged (lint + format) — leve, roda sempre |
| `commit-msg` | `@dev` a cada commit | Conventional Commits obrigatório |
| `pre-push` | `@devops` antes do push | **`npm run ci:local` — espelho FIEL da CI** (não só typecheck+test) |

> **Por que o peso está no pre-push, não no pre-commit:** o commit é frequente — encher de build/
> e2e ali vira cerimônia e atrapalha o ritmo (`ANTI-PADROES.md`). O push é o gatilho real do
> pipeline, então é ali que roda o espelho completo. Emergência: `git push --no-verify` (registre
> o porquê; o CI ainda cobra). Quem não é `@devops` nem chega ao push (hook de autoridade).

## Gates executáveis — um comando (`npm run ci:local`) roda todos, na ordem da CI
`ci:local` é o **espelho local do pipeline**: mesma sequência, mesmo fail-fast. Se passar local,
o CI deve passar. Individualmente, para depurar:
| Gate | Comando | O que prova |
|------|---------|-------------|
| Esteira | `npm run audit:esteira` | frontmatter, links e specs íntegros |
| Rastreabilidade | `npm run eval:spec` | todo `AC` coberto por task; `SPEC_DEVIATION` contados |
| Diagramas | `node scripts/validate-mermaid.mjs` | blocos Mermaid válidos |
| Migrations | `npm run lint:migrations` | DROP com reverso; **CREATE POLICY com GRANT** |
| Lint/format | `npm run lint` | Biome sem finding |
| Type-check | `npm run typecheck` | TypeScript strict sem erro |
| Arquitetura | `npm run arch:check` | regra de dependência DDD (domain puro) sem violação |
| Build (se houver) | `npm run build` | compila sem erro |
| Testes (AC) + cobertura | `npm run test:coverage` | cada `AC` tem teste verde; threshold |
| E2E (se houver) | `npm run test:e2e` | fluxos críticos ponta a ponta |

## Checklist (todo PR)
- [ ] Todos os `AC` da `spec.md` **verdes pelo gate** (`npm test`) — não por inspeção
- [ ] `npm run ci:local` **verde** localmente (espelho da CI)
- [ ] **CI real verde no PR:** `gh pr checks` sem vermelho e **sem check obrigatório pulado**
      (⚠️ gate que exige Docker/banco — RLS/pgTAP, e2e — não pode ter sido silenciosamente pulado)
- [ ] Nenhum `SPEC_DEVIATION` pendente sem resolução
- [ ] Decisões difíceis de reverter viraram **ADR** em `docs/adr/`
- [ ] **Segurança:** sem secret no client; input validado (Zod); JWT validado; RLS na tabela.
      Dívida aceita registrada em `docs/SECURITY_DEBT.md` (baseline em `seguranca/`)
- [ ] **Performance:** sem regressão de budget (`performance/README.md`) — query crítica indexada
      (sem `Seq Scan` em tabela grande), lista paginada, sem N+1
- [ ] **Observabilidade:** erro na borda em `problem+json` com `reqId`; log estruturado sem PII
- [ ] **Se feature de IA/LLM:** checks da trilha `ia/` (evals, prompt versionado, injection)
- [ ] Glossário atualizado se introduziu termo
- [ ] A `spec.md` reflete o que foi construído (ou a divergência está documentada)
- [ ] `docs/STATE.md` atualizado (próximo passo, decisões, bloqueios)
- [ ] `git push` / PR feitos por **@devops** (ver `AGENTS.md`)

## Web Vitals (quando houver frontend)
- LCP < 2.5s · INP < 200ms · CLS < 0.1
