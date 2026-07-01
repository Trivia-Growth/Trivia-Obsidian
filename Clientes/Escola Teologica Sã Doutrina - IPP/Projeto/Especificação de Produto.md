---
tipo: espelho-repo
projeto: Edutech IPP
fonte: docs/ESPECIFICACAO.md (repositório de código)
espelhado_em: 2026-07-01
status: RASCUNHO (exemplo para refinamento)
---

> ⚠️ **Este documento é um espelho.** A fonte da verdade é `docs/ESPECIFICACAO.md` no repositório
> (`~/Documents/Obsidian/Github/ETSD - IPP`). Se editar, edite lá primeiro e re-espelhe aqui — não
> o contrário. Não substitui as specs de feature (`specs/NNNN-*/`, contrato executável) nem os
> ADRs (decisões arquiteturais duráveis).

# Especificação — Edutech IPP

> **Status: RASCUNHO (exemplo para refinamento).** Documento é a **visão macro do produto**: o
> mapa de módulos, personas e definições que orienta a criação das specs de feature em
> `specs/NNNN-*/`. Cada módulo aqui vira uma ou mais features na esteira SDD.
>
> Perfil do projeto: **OS (monorepo multi-domínio), single-tenant** (uma única escola). Não há
> multi-tenancy nem `tenant_id` — o isolamento é por **papel de usuário** (RLS por role/ownership).
> Ver [[00 - Índice]].

---

## 1. Propósito

Plataforma única para uma escola que **oferece cursos online (EAD) em ambiente próprio** e, ao mesmo
tempo, **usa a plataforma para gerir a operação da escola** (matrícula, presença, turmas, cobrança e
secretaria) — englobando também a modalidade **presencial**. O objetivo é unificar, em um só sistema,
o que hoje costuma estar espalhado entre um LMS (entrega de conteúdo) e planilhas/ERPs paralelos de
gestão e financeiro.

---

## 2. Dores de mercado (o problema)

Escolas que disponibilizam cursos online em plataforma própria, mas dependem dela também para gerir a
escola, enfrentam lacunas recorrentes:

| # | Dor | Consequência | Como o IPP endereça |
|---|-----|--------------|---------------------|
| D1 | LMS de mercado são **só entrega de conteúdo**; não gerem a escola | Gestão vira planilha paralela | Módulos de gestão (turmas, secretaria, financeiro) nativos |
| D2 | **Presencial e EAD** vivem em sistemas separados | Aluno e operação fragmentados | Unidades presenciais + EAD no mesmo cadastro de aluno/curso |
| D3 | **Matrícula manual/urgente** (ex.: fechar pagamento) sem fluxo próprio | Retrabalho, erro, atraso de caixa | Matrícula manual assistida, priorizando liberação de pagamento |
| D4 | **Controle de presença** e justificativa de falta inexistente ou em papel | Sem histórico confiável | Registro de presença por encontro + campo de justificativa |
| D5 | **Cobrança recorrente e inadimplência** fora da plataforma | Conciliação manual, perda de receita | Recorrência integrada (Pagar.me) e status de pagamento por matrícula |
| D6 | **Turmas com janela de inscrição** e liberação gradual não são suportadas | Conteúdo liberado cedo/errado | Gestão de turmas: período de inscrição + liberação progressiva (drip) |
| D7 | Papéis operacionais (**secretaria, financeiro**) não têm perfil próprio | Permissões improvisadas, risco | Perfis de acesso dedicados por função |
| D8 | Curso **avulso** (ex.: música) com escolha de professor não cabe no modelo de "curso fechado" | Vendas perdidas | Curso avulso com seleção de professor |
| D9 | Materiais de apoio (**link, documento**) sem lugar padronizado | Conteúdo disperso | Materiais complementares por aula/curso |
| D10 | Vídeo hospedado externamente sem **thumbnail/metadados** integrados | Vitrine pobre | Integração Vimeo (puxar thumbnail) |

> **Posicionamento:** o IPP não é "mais um LMS". É a camada onde **oferta de curso** (EAD + presencial)
> e **gestão da escola** (matrícula, presença, turmas, cobrança) convivem — sem exigir um ERP à parte.

---

## 3. Escopo

### Fase 1 (MVP operacional)
Presencial + EAD + gestão essencial + cobrança recorrente.

### Fase 2 (evolução)
Site integrado · Módulo Financeiro (completo) · E-book e Audiobook · Aula ao vivo.

### Fora de escopo (por ora)
- Multi-tenancy / white-label (é single-tenant; ver nota de promoção a OS em [[00 - Índice]]).
- App mobile nativo.
- Emissão fiscal (avaliar no Módulo Financeiro da Fase 2).

---

## 4. Personas e perfis de acesso

Cinco perfis. As permissões abaixo são o ponto de partida das **RLS policies** (refinar por feature).

| Perfil | Foco | Pode (resumo) |
|--------|------|---------------|
| **Aluno** | Consumir | Ver cursos matriculados, assistir aulas, baixar materiais, ver presença/notas, pagar |
| **Professor** | Ensinar | Gerir conteúdo dos seus cursos/turmas, registrar presença, avaliar, responder alunos |
| **Secretaria** | Operação acadêmica | Matricular (inclusive manual), gerir turmas e inscrições, presença, cadastros |
| **Financeiro** | Cobrança | Ver/gerir pagamentos, recorrência, inadimplência, conciliação |
| **Administrativo** | Gestão geral | Acesso amplo de gestão e configuração; superset operacional |

> Matriz de permissão detalhada (por ação × recurso) será formalizada na feature de **Identidade e
> Acesso** e refletida em `docs/glossary.md` (repo).

---

## 5. Linguagem ubíqua (extrato)

> Migrar termos consolidados para `docs/glossary.md` (repo) na feature correspondente. Sem sinônimos.

| Termo | Definição | Não confundir com |
|-------|-----------|-------------------|
| **Unidade** | Local físico da modalidade presencial (**Vila Natal**, **Pinheiros**) | Turma |
| **Curso Livre** | Curso EAD comprável a qualquer momento, sem janela de inscrição | Curso de Formação |
| **Curso de Formação** | Curso EAD com **período de inscrição** e **turmas** | Curso Livre |
| **Turma** | Grupo de alunos de um Curso de Formação, com janela de inscrição e liberação progressiva | Módulo |
| **Matrícula** | Vínculo aluno↔(curso ou turma), com status de pagamento | Inscrição |
| **Presença** | Registro de comparecimento por encontro (presencial), com justificativa opcional | Progresso (EAD) |
| **Recorrência** | Cobrança periódica automática (Pagar.me) | Compra avulsa |
| **Curso Avulso de Música** | Curso vendido individualmente com **seleção de professor** | Curso de Formação |
| **Material Complementar** | Recurso de apoio: **link** ou **documento** | Aula |

---

## 6. Módulos — Fase 1

Cada módulo lista **definição**, **regras principais** e **candidatos a AC** (a detalhar na spec).

### M1 — Identidade e Acesso
- **Definição:** autenticação e autorização com os cinco perfis (Aluno, Professor, Financeiro, Secretaria, Administrativo).
- **Regras:** RLS por papel e por ownership; sem multi-tenant. Convite/cadastro de usuários pela Secretaria/Administrativo.
- **Candidatos a AC:** login; atribuição de papel; um perfil só enxerga o que seu papel permite.

### M2 — Catálogo de Cursos e Conteúdo
- **Definição:** CRUD de cursos, módulos e aulas. Tipos de curso: **Curso Livre** e **Curso de Formação**.
- **Regras:** aula pode ter vídeo (Vimeo) + **materiais complementares (link/documento)**; ordenação de módulos/aulas; publicação.
- **Candidatos a AC:** criar curso e classificá-lo como Livre/Formação; anexar material do tipo link e do tipo documento; ordenar aulas.

### M3 — Modalidade Presencial
- **Definição:** operação das unidades **Vila Natal** e **Pinheiros**.
- **Regras:**
  - **Matrícula manual** (preenchimento manual) — **prioridade: destravar pagamento** rapidamente.
  - **Controle de presença** por encontro, com **campo de justificativa** de falta.
- **Candidatos a AC:** matricular manualmente um aluno em uma unidade; registrar presença/falta de um encontro; anexar justificativa a uma falta.

### M4 — Modalidade Online (EAD)
- **Definição:** entrega de cursos EAD.
- **Regras:**
  - **Curso Livre:** compra a **qualquer momento**; acesso imediato após pagamento.
  - **Curso de Formação:** exige **inscrição** dentro da janela e vínculo a uma **turma**.
- **Candidatos a AC:** comprar Curso Livre e obter acesso; tentar inscrever em Formação fora da janela → bloqueado.

### M5 — Gestão de Turmas
- **Definição:** administração de turmas dos Cursos de Formação.
- **Regras:**
  - Controlar **período de inscrição** (abre/fecha).
  - **Liberação progressiva** do conteúdo (drip): aulas/módulos liberados por cronograma/etapa.
- **Candidatos a AC:** definir janela de inscrição de uma turma; configurar liberação progressiva; aluno só acessa o conteúdo já liberado.

### M6 — Curso Avulso de Música
- **Definição:** curso vendido individualmente com **seleção de professor** pelo aluno.
- **Regras:** disponibilidade/agenda por professor; vínculo da matrícula ao professor escolhido.
- **Candidatos a AC:** listar professores disponíveis; selecionar professor ao contratar; matrícula fica vinculada ao professor.

### M7 — Matrículas e Progresso
- **Definição:** vínculo aluno↔curso/turma e acompanhamento.
- **Regras:** status de matrícula reflete pagamento; progresso por aula (EAD) e presença (presencial); histórico do aluno.
- **Candidatos a AC:** matrícula muda de status conforme pagamento; progresso do aluno é registrado por aula.

### M8 — Pagamentos e Recorrência (Pagar.me)
- **Definição:** cobrança de matrículas e mensalidades via **Pagar.me**.
- **Regras:**
  - **Recorrência** (assinatura/mensalidade) automática.
  - Compra avulsa (Curso Livre, Curso Avulso de Música).
  - **Preços sempre calculados no backend**; webhook confirma pagamento; status de inadimplência.
- **Candidatos a AC:** criar recorrência; webhook confirma pagamento e ativa matrícula; falha de cobrança marca inadimplência.

### M9 — Materiais Complementares
- **Definição:** recursos de apoio vinculados a aula/curso: **link** e **documento**.
- **Regras:** upload de documento (Storage) e cadastro de link; visibilidade conforme matrícula.
- **Candidatos a AC:** adicionar link; fazer upload de documento; aluno matriculado acessa, não-matriculado não.

### M10 — Integração de Vídeo (Vimeo)
- **Definição:** vídeos das aulas hospedados no **Vimeo**.
- **Regras:** **puxar a thumbnail** (e metadados) do Vimeo ao cadastrar/exibir a aula.
- **Candidatos a AC:** ao informar o vídeo Vimeo, a thumbnail é obtida e exibida automaticamente.

---

## 7. Módulos — Fase 2

| Módulo | Definição | Notas |
|--------|-----------|-------|
| **Site integrado** | Vitrine/landing pública da escola integrada ao catálogo | SEO; página de curso pública |
| **Módulo Financeiro** | Gestão financeira completa (contas a receber, inadimplência, relatórios, conciliação) | Avaliar emissão fiscal |
| **E-book e Audiobook** | Biblioteca digital com progresso de leitura/escuta | Storage + player |
| **Aula ao vivo** | Sessões síncronas (webinar/turma ao vivo) | Provedor de streaming a definir |

---

## 8. Requisitos não-funcionais

- **Single-tenant:** um deploy = uma escola. Sem `tenant_id`. (Promoção a OS só se surgir fronteira de domínio real — já ocorreu por motivo de negócio, ver [[Roadmap]].)
- **Segurança (baseline mínimo):** RLS em toda tabela; JWT validado em toda Edge Function que toca dado; validação de input com Zod na borda; sem secrets no client. Ver `seguranca/baseline-minimo.md` (repo).
- **Pagamentos:** valores e ativação de matrícula **decididos no backend**; webhooks idempotentes; assinatura de webhook validada.
- **LGPD:** dados de alunos (menores incluídos) — tratar consentimento e minimização (a detalhar).
- **Dinheiro em centavos** (inteiro), nunca float. Ver `docs/adr/0001-dinheiro-em-centavos.md` (repo).
- **Observabilidade:** logs estruturados; SLIs por definir (`observabilidade/`, repo).

---

## 9. Integrações externas

| Integração | Uso | Módulo |
|-----------|-----|--------|
| **Pagar.me** | Pagamento avulso + recorrência + webhooks | M8 |
| **Vimeo** | Hospedagem de vídeo + thumbnail/metadados | M10 |

---

## 10. Roadmap por fase

1. **Fase 1 — MVP operacional:** M1 → M2 → M3/M4 → M5 → M7 → M8 → M9/M10 (M6 quando a operação de música entrar).
2. **Fase 2 — evolução:** Site integrado, Financeiro completo, E-book/Audiobook, Aula ao vivo.

> Ordem sujeita a refinamento. **Prioridade explícita do negócio:** matrícula manual do presencial
> (destravar pagamento) é urgente — puxar cedo em M3+M8.

---

## 11. Mapa módulo → specs de feature (a criar)

| Módulo | Feature(s) `specs/NNNN-*` sugerida(s) | Espelho no vault |
|--------|----------------------------------------|-------------------|
| M1 | `identidade-e-acesso` | [[Projeto/Specs/]] (a criar) |
| M2 | `catalogo-cursos`, `conteudo-aulas` | [[Projeto/Specs/]] (a criar) |
| M3 | `presencial-matricula-manual`, `presencial-presenca` | [[Projeto/Specs/]] (a criar) |
| M4 | `ead-curso-livre`, `ead-curso-formacao` | [[Projeto/Specs/]] (a criar) |
| M5 | `gestao-turmas`, `liberacao-progressiva` | [[Projeto/Specs/]] (a criar) |
| M6 | `curso-avulso-musica` | [[Projeto/Specs/]] (a criar) |
| M7 | `matriculas-progresso` | [[Projeto/Specs/]] (a criar) |
| M8 | `pagamentos-pagarme`, `recorrencia` | [[Projeto/Specs/]] (a criar) |
| M9 | `materiais-complementares` | [[Projeto/Specs/]] (a criar) |
| M10 | `integracao-vimeo` | [[Projeto/Specs/]] (a criar) |

> Abrir cada feature com a skill `/nova-feature` (repo), espelhando `specs/0001-*` (exemplo de
> referência). No vault, cada linha desta tabela vira uma nota em [[Projeto/Specs/]] (a partir de
> `_Template — Spec.md`) quando o `@pm`/`@analyst` abrir a spec no repo — sem épico/story
> intermediário, a spec é a unidade neste padrão.

---

## 12. Questões em aberto (para refinamento)

- [ ] Curso de Formação **presencial** existe, ou Formação é só EAD? (impacta M3×M4×M5)
- [ ] Modelo de recorrência: mensalidade da escola, por curso, ou por turma?
- [ ] Curso Avulso de Música é presencial, EAD, ou ambos? Agenda por professor é necessária?
- [ ] Regras de inadimplência: bloqueia acesso? Após quantos dias?
- [ ] Materiais complementares: por aula, por módulo, por curso — ou todos?
- [ ] Menores de idade: responsável financeiro/legal no cadastro?
- [ ] Aula ao vivo (Fase 2): provedor (Zoom, Vimeo, outro)?
