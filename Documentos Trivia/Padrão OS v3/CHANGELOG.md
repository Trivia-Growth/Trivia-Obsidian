# CHANGELOG — Padrão OS

> Versionamento do próprio padrão. Norma nova entra **no scaffold** (`_Scaffold/`) e é resumida
> aqui. Owner do padrão: <definir>. Processo: PR no vault + scaffold; rodar `audit:esteira` e
> `eval:spec` antes de marcar a versão.

## v3.2.0 — 2026-07-02
**Hardening pós-primeira-pipeline-real.** O scaffold nunca tinha rodado num GitHub Actions de
verdade; a primeira feature real de um projeto pegou **10 bugs**, todos do tipo que só a pipeline
revela (nenhum pegável por inspeção). Esta versão traz cada correção **de volta ao scaffold** (para
não repetir no próximo projeto) e, onde possível, transforma a pegadinha em **gate automático** em
vez de só documentação — a filosofia do padrão ("pronto = gate verde por comando").

**Adicionado — o pre-push virou espelho fiel da CI**
- `scripts/ci-local.mjs` + `npm run ci:local`: roda a MESMA sequência da CI, na mesma ordem, com
  fail-fast. `build` e `test:e2e` entram automaticamente se o projeto os declarar (backend puro
  não tem, frontend/OS tem — sem editar o script). gitleaks é best-effort local (o gate
  bloqueante é o da CI).
- `.husky/pre-push` agora roda `ci:local` (antes: só `typecheck + test`). Era essa lacuna que
  deixava lint completo, arch-check, migrations e cobertura só aparecerem na pipeline. Peso no
  pre-push, não no pre-commit (commit é frequente; ver `ANTI-PADROES.md`).
- **`/validar` (@qa) e `/revisar-pr` passam a exigir o CI REAL** (`gh pr checks` verde, sem check
  obrigatório "skipped"), não só o comando local. Fecha o furo em que um gate que precisa de
  Docker/banco (RLS/pgTAP, e2e) era pulado local e a story era considerada pronta sem ele ter
  rodado nunca.

**Adicionado — pegadinhas de Postgres/Supabase viraram gate + doc**
- **Lint de migrations** (`scripts/lint-migrations.mjs`, `npm run lint:migrations`, job na CI):
  além de DROP-sem-reverso, agora **falha o build se um CREATE POLICY não tiver GRANT
  correspondente** (bug #7 — RLS só é avaliada após o privilégio de tabela; sem GRANT ao role, a
  policy nunca roda e a tabela fica inacessível **em produção**, não só no teste). Regra também no
  `db/rls.template.sql` (agora com GRANT obrigatório) e nas duas migrations de exemplo.
- `db/rls-test.md`: documentada a pegadinha do `throws_ok` (bug #8) — INSERT/WITH CHECK **lançam**
  42501, mas SELECT/UPDATE/DELETE filtrados pelo USING **não lançam**, afetam 0 linhas
  silenciosamente. Exemplo de como testar por efeito (`is`/contagem) em vez de erro.

**Corrigido — tooling do scaffold que só quebrava rodando (trazido ao scaffold)**
- **Node 22** na CI (base + os-layer) e em `package.json > engines`: dependency-cruiser 18 e
  vitest 3 exigem ≥22; a CI estava em Node 20 (bug #6). Bump coordenado de vitest → ^3.2,
  @vitest/coverage-v8 → ^3.2, @types/node → ^22, dependency-cruiser → ^18, e `package-lock.json`
  regenerado (o `npm ci` da CI depende do lockfile — ele agora vem no scaffold).
- **pnpm/action-setup sem `version:`** na CI da os-layer (bug #1): declarar `version: 9` no
  workflow E `packageManager` no package.json faz a action abortar — o campo do json manda.
- **biome.json + .gitignore** ignoram `.turbo/` e `supabase/.temp/` (bug #3 — dezenas de falsos
  positivos de lint em cache de ferramenta). `.gitignore` também cobre `.env*`, `sbom.json`.
- **`.gitleaks.toml`** no scaffold com allowlist ESTRITO para `.triviaiox-core/`/`.triviaiox/`
  (bug #4 — o framework vendorizado traz exemplos de credencial que o gitleaks lê como leak real).
  Todo projeto que vendoriza o Triviaiox batia nesse falso positivo no primeiro scan.
- **`audit-esteira.mjs`** trata `.claude/memory/` como dialeto próprio (bug #2 — o sistema de
  memória do Claude Code tem frontmatter sem `alwaysApply`; o audit exigia o schema SDD nele).

**Processo**
- `07 - Como usar o Scaffold`: fechar versão do padrão agora **exige rodar a CI de verdade**
  (repo descartável + `ci:local` verde + Actions real com `ci.yml`/`deploy.yml` passando). Config
  de CI "revisada no olho" ≠ testada — foi exatamente o que gerou os 10 bugs.

**Nota:** o CD via GitHub Integration nativa do Supabase (v3.1.1) foi confirmado no uso real como o
caminho certo — o `deploy.yml` com token segue como fallback só para monorepo multi-projeto (bug #9).

## v3.1.1 — 2026-07-02
Ajuste vindo de mais um feedback do primeiro uso real (Lucas testou a GitHub Integration nativa
do Supabase direto no dashboard — não era isso que o `deploy.yml` da v3.1.0 recomendava).

**Corrigido — caminho de CD trocado de Action para integração nativa**
- v3.1.0 tinha resolvido "deploy só é manual" com um `.github/workflows/deploy.yml` (Action +
  `SUPABASE_ACCESS_TOKEN` em secret). Esse token é de **conta inteira** — não existe token nativo
  do Supabase restrito a um projeto/org (limitação confirmada, sem solução no produto ainda:
  github.com/supabase/supabase/issues/18584). Preocupação legítima do Lucas em não expor acesso
  a todas as orgs num secret do GitHub.
- O Supabase tem solução melhor e nativa para isto: **Dashboard do projeto → Settings →
  Integrations → GitHub → "Deploy to production"**. A conexão nasce amarrada a um
  projeto+repositório específico (sem token de conta), aplica migrations e — se declarados em
  **`supabase/config.toml`** — Edge Functions e Storage buckets. Funciona no plano Free.
- **`supabase/config.toml` criado no scaffold** (não existia): é ele que a integração lê para
  saber quais funções/buckets deployar; sem ele a integração aplicaria só migrations em silêncio.
- `deploy.yml` **rebaixado a fallback**, documentado para o caso real em que a integração nativa
  não serve (monorepo com mais de um projeto Supabase no mesmo repo). Se usado, exige desligar
  "Deploy to production" na integração (evita aplicar a mesma migration duas vezes) e gerar o
  `SUPABASE_ACCESS_TOKEN` de uma **conta de automação** convidada só ao projeto/org da CI —
  nunca da conta pessoal (procedimento documentado em `docs/ENVIRONMENTS.md`).
- `06`, `07`, README do scaffold e matriz de qualidade (item 7a) atualizados para o novo caminho.

## v3.1.0 — 2026-07-02
Correções vindas do **primeiro uso real** do padrão (feedback do Lucas): a CI não rodava na PR e
o deploy de banco/Edge Functions não existia como esteira — era comando manual documentado em prosa.

**Corrigido (CI que não rodava na PR — três causas somadas)**
- **`package-lock.json` agora vem no scaffold** (gerado com `--package-lock-only`): o `npm ci` e o
  `cache: npm` da CI **falham sem lockfile**, e o scaffold não trazia um — todo projeto novo nascia
  com a CI quebrada no primeiro passo.
- **gitleaks via CLI em vez da action**: a `gitleaks-action@v2` exige `GITLEAKS_LICENSE` em repos
  de organização (caso da Trivia-Growth) e falhava. A CLI é MIT/grátis — sem secret nenhum.
- **Instrução de cópia com dotfiles** (`cp -R "base/." destino/`) no `07` e no README do scaffold:
  copiar `base/*` perde `.github/`, `.husky/` e `.gitignore` em silêncio — a causa mais comum de
  "a CI nem aparece na PR". Com passo de verificação (`ls .github/workflows/`).

**Adicionado**
- **CD via GitHub** (`.github/workflows/deploy.yml`): merge em `develop` deploya staging, merge em
  `main` deploya produção — `supabase db push` (migrations) + `supabase functions deploy` (Edge
  Functions) na esteira, com secrets por environment do GitHub (`SUPABASE_ACCESS_TOKEN`,
  `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD` — tabela em `docs/ENVIRONMENTS.md`). Deploy manual
  pela CLI vira exceção de emergência (runbook), não fluxo. Motivo: branch protection + CI verde já
  garantem que só código validado chega ao merge — o deploy tinha que ser consequência do merge,
  não um comando que alguém lembra de rodar. Matriz de qualidade ganha o item 7a (dono: @devops).
- `06 - Operações` reescrito na seção Deploy; `07` e `ENVIRONMENTS.md` com setup dos secrets.

**Triviaiox:** nenhuma mudança nesta rodada.

## v3.0.0 — 2026-07-01
Auditoria profunda + correção (Fable 5) com **simulação do kickoff real** como critério de aceite:
*"seguindo o padrão vamos iniciar o projeto com essas especificações; peça para os agentes do
Triviaiox desenvolverem"* — o caminho de ponta a ponta tinha 5 quebras; todas fechadas. **Major**
porque o contrato de instalação mudou: o `core-config-snippet.yaml` ganhou uma parte nova
obrigatória (remapeamento de caminhos), o `AGENTS.md` foi reestruturado para servir também ao
Codex, e o squad passou a distribuir subagentes + hook (passos 4–5 novos na instalação). Projetos
na v2 continuam funcionando, mas a integração com os agentes Triviaiox neles está incompleta —
reaplicar o snippet e o payload do squad ao migrar.

**Adicionado**
- **Skill `/iniciar-projeto`** (kickoff): reconhece a frase de kickoff, decide perfil, preenche
  `PROJECT.md`, decompõe especificações em features/epics, apresenta o plano (gate humano) e
  orquestra a cadeia `@pm → @architect → @security → @sm → @dev → @qa → @devops` **anunciando cada
  artefato e o porquê**. Antes, o kickoff vivia só no doc humano `07` — o agente não tinha rota.
- **Equivalência epic/story ⇄ artefatos SDD** (lacuna real entre os dois sistemas): **epic = pasta
  `specs/NNNN-<slug>/`** (contrato = `spec.md`), **story = task de `tasks.md`**. Tabela em
  `base/AGENTS.md`, campos `vocabulary_mapping`/`epic_is` no snippet e no `config.yaml` do squad.
  Motivo de não criar `epic.md`: seria artefato paralelo (linha vermelha); o core do Triviaiox
  (g1-epic-creation, epic-context-accumulator) opera sobre a equivalência via remapeamento.
- **Transparência declarativa como requisito** (`AGENTS.md` §, `CLAUDE.md`): agente anuncia o que
  vai produzir e por quê; decisão autônoma registrada no artefato (ADR/tasks/STATE), nunca só no chat.
- **Snippet de integração completo** (`rules/core-config-snippet.yaml`): além das technical
  preferences, agora **remapeia o que o core lê** — `devStoryLocation`, `prd*`, `epicFilePattern`,
  `architecture*`, `devLoadAlwaysFiles`, `qaLocation` → `specs/`, `CLAUDE.md`, `docs/`. Sem isso,
  `@sm`/`@dev` procuravam `docs/prd.md` e `docs/stories/` (não existem no Padrão OS) — era a maior
  quebra silenciosa do kickoff.
- **Payload Claude no squad** (`squads/trivia-os/claude/`): 13 wrappers de subagente corrigidos +
  `enforce-git-push-authority.sh` (fail-closed) + `settings-snippet.json`. O installer do
  Triviaiox não instala nada disso num projeto novo — a autoridade do `@devops` era prosa sem
  enforcement e os subagentes simplesmente não existiam fora do repo do framework.
- **Gate de arquitetura por máquina**: `npm run arch:check` (dependency-cruiser) falha o build se
  `domain/` importar framework/I-O/camada, `application/` importar borda/infra, ou houver ciclo.
  A regra existia só em prosa no `CLAUDE.md` (item 11 da matriz: 📖 → 🟢). Na CI e no `/validar`.
- **CODEOWNERS no perfil single-repo** (`base/.github/CODEOWNERS`) — antes só na os-layer.
- **OS-grade ampliado** (`os-layer/seguranca/os-grade.md`): §Financeiro (chave de idempotência em
  mutação monetária + invariante de ledger testada; saldo derivado), §Integrações assíncronas
  (outbox, timeout/retry/circuit breaker), §Supply chain (SAST Semgrep bloqueante, SBOM CycloneDX
  + dependency review na CI da os-layer). §Tracing (OpenTelemetry) em `observabilidade/README.md`.
- **Ponte Codex** no `base/AGENTS.md`: Codex lê `AGENTS.md`, não `CLAUDE.md` — o arquivo agora
  manda ler o `CLAUDE.md` primeiro e aponta o gatilho do kickoff.

**Corrigido**
- `specs/_templates/tasks.template.md` usava `AC-1,2` no exemplo — exatamente o formato que o
  próprio template proíbe duas linhas acima (o gate `eval-spec-fidelity` não enxerga o `AC-2`).
  Propagava rastreabilidade quebrada para todo projeto novo.
- Vocabulário único de veredito de QA em todo o padrão: `PASS/CONCERNS/FAIL/WAIVED`.

**Práticas de mercado avaliadas e NÃO adotadas** (filtro anti-over-engineering do `ANTI-PADROES.md`)
- **Mutation testing (Stryker):** custo de CI alto; cobertura + teste-por-AC bloqueantes já pagam
  o grosso do risco. Reavaliar se surgir bug que passou por teste fraco.
- **Contract testing (Pact):** não há fronteira consumidor/produtor real entre serviços ainda;
  entra quando o perfil OS tiver 2+ apps se falando. Registrado na matriz como candidato.
- **semantic-release:** o CHANGELOG manual versionado é o contrato do padrão (auditável no vault);
  commitlint já garante a matéria-prima se mudarmos de ideia.
- **Assinatura de manifests (MANIFEST_SIGNING do Triviaiox):** escopo do framework (distribuição
  de squads), não dos artefatos de projeto do Padrão OS.
- **Feature flags:** já coberto pelo eixo 3 (Infra) do `design.template.md` — sem gate novo.

**Triviaiox:** correções aplicadas **no repo do framework** (commits locais, sem push — comparar
por `git diff`): wrappers versionados (estavam fora do git por um bloco TEMPORARY esquecido no
`.gitignore`), "Alan's rules" removidas do `@devops` (`push -f origin main`, "NEVER pull"),
vocabulário de gate do `@qa` alinhado, elicitation override em dois níveis (AUTO-DECISION técnica
× OPEN-QUESTION de negócio), wrappers novos `@security`/`@reliability`/`@prompt-engineer`,
`@github-devops` (nome morto) → `@devops` em 6 personas, CodeRabbit consciente de plataforma
(era hardcoded WSL/Windows; quebrava no macOS), comandos com dono único
(`*risk-assessment`/`*capacity-estimate` no @architect; `*security-review` no @security),
skills Codex geradas para os 15 agentes (eram 10). `validate:agents`: 2 erros → 0.

## v2.1.0 — 2026-06-24
Rodada de **hardening** (confiabilidade, qualidade, segurança, performance). Fecha a lacuna entre
método (forte) e craft executável das camadas difíceis.

**Adicionado**
- **Exemplo de referência das camadas com I/O** (`specs/0002-registro-comissao/`): porta no
  domínio → adapters in-memory/Supabase → caso de uso → borda HTTP (`problem+json`) → teste de
  integração (roda na CI sem banco) → migration com RLS.
- **Banco no perfil single-repo:** `base/db/` (padrões de migration, `rls.template.sql`,
  `rls-test.md`) — antes só existia em `os-layer/`.
- **Receitas operacionais** no scaffold: template de Edge Function (`supabase/functions/_template/`)
  reusando `_shared/` (movido para a base); helpers reais `src/shared/log.ts`,
  `src/interfaces/http/problem.ts`, `config/env.ts`.
- **Performance** como pilar: `performance/README.md` (budgets, índice, paginação, N+1) + item no DoD.
- **Observabilidade**: log estruturado, taxonomia de erro RFC 7807, `observabilidade/` +
  `slo-sli.template.md`; **runbooks** (`runbooks/rollback-deploy.md` com SLA e autoridade).
- **Testes mais profundos**: `testes/README.md` (pirâmide + mocks) e **cobertura bloqueante**
  (`vitest.config.ts`, `test:coverage`).
- **Gates de segurança bloqueantes na CI**: gitleaks (secret scanning) e `npm audit` (deps);
  CI com cache + cancel-in-progress; **threat model STRIDE** (`seguranca/threat-model.template.md`).
- **CI da camada OS** (`os-layer/.github/workflows/ci.yml`) com turbo affected + lint de migrations;
  `docs/ENVIRONMENTS.md`.
- **Matriz de Qualidade** (`PADRAO-DE-QUALIDADE.md` + nota [[08 - Padrão de Qualidade]]): visão
  única de cada barra de qualidade × enforcement × perfil × dono. Nota [[09 - Receitas (Banco, Edge, HTTP)]].

**Triviaiox:** nenhuma mudança no core (extensão segue só via `squads/trivia-os/`).

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
