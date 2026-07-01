# Roadmap — Edutech IPP

> Espelho do estado descrito em `docs/STATE.md`, `docs/PROJECT.md` e `docs/ESPECIFICACAO.md` do
> repositório (fonte da verdade). Atualizar aqui só quando o estado do repo mudar de forma
> relevante para o negócio.

## Linha do tempo

- **2026-06-30** — Início do projeto. Scaffold do Padrão OS aplicado (perfil inicial: single-repo).
- **2026-07-01** — TRIVIAIOX v2.2.0 instalado (traz agente `@security`). `docs/ESPECIFICACAO.md`
  criado como rascunho de produto (módulos Fase 1/Fase 2).
- **2026-07-01** — Casca do frontend entregue (`specs/0003-setup-frontend`): React + Vite + TS +
  Tailwind + shadcn/ui + TanStack Query, cliente Supabase por env, roteamento base, deploy Netlify
  configurado. Sem lógica de negócio ainda.
- **2026-07-01** — **Promovido de single-repo para OS** (monorepo pnpm + Turborepo) — ADR-0003
  *(ver `docs/adr/0003-promocao-single-repo-para-os.md` no repo)*. Motivo:
  o pitch de venda vai entregar mais do que a gestão acadêmica pedida pela escola — módulos de
  Administração, Atendimento, Financeiro (com repasse a funcionários) e Marketing também entram.
  - `apps/web/` (código movido de `src/`), `packages/{config,database,shared,ui}` (placeholders).
  - Schemas Postgres por domínio criados: `educacao`, `administracao`, `atendimento`,
    `financeiro`, `marketing` + governança (`audit`, `lgpd`, `config`). Só schema, sem tabela de
    negócio ainda.
  - Gates verdes no novo layout (build/typecheck/lint/test via turbo, audit de esteira, eval de
    specs).
- **Próximo passo (em aberto):** aguardando o João mandar a **1ª feature de negócio** no chat com
  o dev (Lucas). Ao chegar, entra pela esteira `@pm/@analyst` → `specs/0005-<slug>/` (product.md +
  spec.md + tasks.md; `design.md` só se tier arquitetural) → `@sm` → `@dev`. No vault, a mesma
  feature ganha uma nota-espelho em [[Projeto/Specs/]] (não há épico/story neste padrão — a spec
  **é** a unidade, ver `_Template — Spec.md`).

---

## O que já existe hoje no repositório (não é negócio real)

As 4 specs atuais (`0001-calculo-comissao`, `0002-registro-comissao`, `0003-setup-frontend`,
`0004-promocao-os-monorepo`) são **exemplos de referência do Padrão OS + fundação técnica** —
não representam funcionalidade da escola. Nenhum módulo de negócio (matrícula, presença, turmas,
cobrança) foi especificado ou implementado ainda.

---

## Bounded contexts (visão OS)

| Contexto | Status | Observação |
|---|---|---|
| **Educação** (core) | fundação implementada | único com specs reais até agora (0001–0003 são exemplo/casca, não negócio) |
| **Administração** | a especificar | transversal (config, perfis, papéis) |
| **Atendimento** | a especificar | histórico do aluno, Customer de Educação |
| **Financeiro** | a especificar | cobrança de matrícula + repasse a funcionários/professores |
| **Marketing** | a especificar | fonte de leads para Atendimento/Educação |

---

## Fase 1 — MVP operacional (presencial + EAD + gestão essencial + cobrança)

Prioridade explícita do negócio: **matrícula manual do presencial** (destravar pagamento rápido) é
urgente — puxar cedo (M3 + M8).

| Módulo | O que entrega |
|---|---|
| M1 — Identidade e Acesso | login + 5 papéis (Aluno, Professor, Secretaria, Financeiro, Administrativo), RLS por papel |
| M2 — Catálogo de Cursos e Conteúdo | CRUD de cursos/módulos/aulas; Curso Livre vs. Curso de Formação; materiais complementares |
| M3 — Modalidade Presencial | unidades Vila Natal e Pinheiros; **matrícula manual** (prioridade: destravar pagamento); presença + justificativa de falta |
| M4 — Modalidade Online (EAD) | Curso Livre (compra a qualquer momento) vs. Curso de Formação (inscrição + turma) |
| M5 — Gestão de Turmas | janela de inscrição; liberação progressiva (drip) |
| M6 — Curso Avulso de Música | curso vendido individualmente com seleção de professor pelo aluno |
| M7 — Matrículas e Progresso | status de matrícula por pagamento; progresso por aula; histórico do aluno |
| M8 — Pagamentos e Recorrência (Pagar.me) | recorrência automática, compra avulsa, preço calculado no backend, webhook, inadimplência |
| M9 — Materiais Complementares | link e documento por aula/curso; visibilidade por matrícula |
| M10 — Integração de Vídeo (Vimeo) | thumbnail/metadados puxados automaticamente ao cadastrar aula |

## Fase 2 — evolução

Site integrado (vitrine pública) · Módulo Financeiro completo (contas a receber, inadimplência,
relatórios, conciliação — avaliar emissão fiscal) · E-book e Audiobook · Aula ao vivo (provedor a
definir).

---

## Fora de escopo (por ora)

- Multi-tenancy / white-label (é single-tenant; a promoção a OS foi por fronteira de domínio, não
  por multi-tenant).
- App mobile nativo.
- Emissão fiscal (avaliar no Módulo Financeiro da Fase 2).

---

## Modelo de negócio confirmado (2026-07-01, ver [[Especificação de Produto]] §12)

- **Curso de Formação** pode ser **EAD ou presencial** — o que define é ter **Turma**, não a
  modalidade. Presencial usa a mesma lógica de curso (catálogo/módulo/aula) do M2, só **sem vídeo**.
- **Turma** é conceito único para EAD e presencial (cada instância tem sua modalidade e, se
  presencial, sua Unidade).
- **Liberação progressiva (drip)** vale para as duas modalidades (EAD libera aula, presencial
  libera material).
- **Recorrência** (Pagar.me) cobre **Curso de Formação** (EAD e presencial); **Curso Livre** e
  **Curso Avulso de Música** seguem **pagamento avulso** (sem turma).
- **Vídeo (Vimeo)** continua exclusivo do Online.

## Questões em aberto (do `docs/ESPECIFICACAO.md`, a refinar com a escola)

- [ ] **Granularidade da recorrência:** mensalidade por Turma ou por Curso?
- [ ] Curso Avulso de Música é presencial, EAD, ou ambos? Precisa de agenda por professor?
- [ ] Regras de inadimplência: bloqueia acesso? Após quantos dias?
- [ ] Materiais complementares: por aula, por módulo, por curso — ou todos?
- [ ] Menores de idade: precisa de responsável financeiro/legal no cadastro?
- [ ] Aula ao vivo (Fase 2): qual provedor (Zoom, Vimeo, outro)?
- [ ] Repositório de código definitivo — divergência entre `docs/PROJECT.md` (Trivia-Growth/Edutech-IPP)
  e o remote real (IPPinheiros/ETSD-ESCOLATEOLOGICA-IPP). Ver [[00 - Índice]].
