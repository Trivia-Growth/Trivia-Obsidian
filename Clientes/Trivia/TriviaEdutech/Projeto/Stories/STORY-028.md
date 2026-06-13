# STORY-028 — Módulo de Atividades e Avaliações

**Módulo:** Avaliações / Cursos  
**Sprint:** Produto  
**Prioridade:** P1  
**Status:** pronto  
**Estimativa:** 5 dias  

---

## Contexto

A plataforma possui quizzes gerados por IA (automáticos), mas não tem um sistema de **atividades avaliativas formais**: trabalhos com entrega de arquivo, provas criadas manualmente pelo professor com nota, feedback e controle de prazo. Isso é uma lacuna crítica para organizações educacionais que precisam avaliar alunos além de quizzes rápidos.

A distinção com o módulo de quiz existente:

| Quiz atual | Atividade (nova) |
|-----------|------------------|
| Múltipla escolha automática | Múltipla escolha + envio de arquivo + texto discursivo |
| Sem nota formal | Com nota (0–10), peso na média, aprovação |
| Sem prazo de entrega | Com data de entrega (due date) |
| Sem correção pelo professor | Com correção manual + feedback escrito |
| Gerado por IA | Criado manualmente pelo professor |
| Não aparece no progresso do curso | Integrado à sequência do curso |

---

## Tipos de Atividade

### 1. Prova (Múltipla Escolha Manual)
Professor cria questões manualmente (diferente do quiz gerado por IA). O sistema corrige automaticamente e calcula a nota. Professor pode revisar e ajustar nota.

### 2. Trabalho com Entrega de Arquivo
Professor descreve o enunciado (markdown). Aluno faz upload de 1 arquivo (PDF, DOCX, ZIP, imagem). Professor corrige, atribui nota (0–10) e escreve feedback.

### 3. Atividade Discursiva (Texto)
Professor descreve o enunciado. Aluno escreve resposta em campo de texto (rico ou simples). Professor corrige manualmente.

---

## Acceptance Criteria

### Professor / Instrutor
- [ ] Pode criar atividade dentro de um módulo do curso (aparece na sequência ao lado das aulas)
- [ ] Pode escolher o tipo: Prova (múltipla escolha), Entrega de Arquivo, Discursiva
- [ ] Pode definir: título, enunciado (markdown), prazo, nota máxima (padrão 10), nota mínima para aprovação, peso na média, tentativas máximas (para provas), publicado/rascunho
- [ ] Para Prova: pode criar questões com 2–5 alternativas, marcar a correta, definir pontos por questão
- [ ] Pode anexar arquivo de apoio ao enunciado (PDF, imagens)
- [ ] Painel de correção: lista todas as entregas com status (pendente, entregue, corrigido)
- [ ] Pode abrir entrega individual, ver o que o aluno enviou, atribuir nota e escrever feedback
- [ ] Pode devolver para revisão ("retornar" a entrega ao aluno com comentário)
- [ ] Notificação ao aluno quando atividade é corrigida

### Aluno
- [ ] Atividade aparece na sequência do curso (como um item de módulo, ao lado das aulas)
- [ ] Dashboard "Minhas Atividades" acessível pelo menu: lista todas as atividades dos cursos matriculados com status e prazo
- [ ] Status visual por atividade: Pendente / Entregue / Corrigido / Atrasado / Devolvido
- [ ] Para Prova: responde as questões e submete — vê resultado imediato (acertos/erros e nota)
- [ ] Para Arquivo: faz upload e confirma entrega — não pode editar após submissão (salvo professor devolver)
- [ ] Para Discursiva: escreve resposta e submete
- [ ] Após correção: vê nota, feedback do professor e, em provas, o gabarito
- [ ] Alerta de prazo próximo (badge "Vence em X dias" quando faltam ≤ 3 dias)

---

## Banco de Dados

### `activities` — definição da atividade
```sql
CREATE TABLE public.activities (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  course_id      uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id      uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  title          text NOT NULL,
  description    text,                          -- enunciado em markdown
  type           text NOT NULL CHECK (type IN ('quiz', 'file_upload', 'text')),
  due_date       timestamptz,
  max_attempts   int NOT NULL DEFAULT 1,
  max_score      numeric(5,2) NOT NULL DEFAULT 10,
  passing_score  numeric(5,2),                  -- nota mínima para aprovação
  weight         numeric(5,2) NOT NULL DEFAULT 1, -- peso na média do curso
  sort_order     int NOT NULL DEFAULT 0,
  published      boolean NOT NULL DEFAULT false,
  allow_late     boolean NOT NULL DEFAULT false,
  attachment_url text,                          -- arquivo de apoio do professor
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
```

### `activity_questions` — questões de prova (type = 'quiz')
```sql
CREATE TABLE public.activity_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id   uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  sort_order    int NOT NULL DEFAULT 0,
  points        numeric(5,2) NOT NULL DEFAULT 1
);

CREATE TABLE public.activity_question_options (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.activity_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct  boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 0
);
```

### `activity_submissions` — entregas dos alunos
```sql
CREATE TABLE public.activity_submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  activity_id    uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id),
  attempt_number int NOT NULL DEFAULT 1,
  status         text NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','submitted','graded','returned')),
  submitted_at   timestamptz,
  -- Conteúdo da entrega por tipo
  text_response  text,                          -- type = 'text'
  file_url       text,                          -- type = 'file_upload'
  file_name      text,
  answers        jsonb,                         -- type = 'quiz': [{question_id, option_id}]
  -- Avaliação
  auto_score     numeric(5,2),                  -- calculado para quizzes
  final_score    numeric(5,2),                  -- definido pelo professor
  feedback       text,                          -- feedback escrito pelo professor
  graded_at      timestamptz,
  graded_by      uuid REFERENCES auth.users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id, attempt_number)
);
```

**RLS:** Todas as tabelas com ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY.
- Alunos: leem apenas suas próprias submissões + atividades publicadas do curso matriculado
- Instrutores/Admins: leem/escrevem atividades e submissões do seu tenant
- Superadmin: acesso total

**Storage bucket:** `activity-submissions` (privado, com RLS por tenant)

---

## Integração com Estrutura de Curso Existente

A atividade se encaixa no módulo como um item ao lado das aulas (`lessons`). A sequência do curso exibe:

```
Módulo 1
  ├── Aula 1 — Introdução (vídeo)       ✅ Concluído
  ├── Aula 2 — Conceitos (vídeo)        ✅ Concluído
  ├── 📝 Atividade — Exercício Prático   ⏳ Pendente (vence em 2 dias)
  └── Aula 3 — Avançado (vídeo)         🔒 Bloqueado*
```

*Opcional: o professor pode configurar se a próxima aula exige conclusão da atividade.

**Coluna `sort_order` em `activities`** controla a posição no módulo. O componente de módulo no frontend precisa mesclar `lessons` + `activities` ordenados por `sort_order`.

---

## Fluxo por Tipo

### Fluxo: Prova (quiz manual)
```
Professor cria → adiciona questões + alternativas → publica
Aluno abre → responde questões → submete
Sistema calcula auto_score → exibe resultado + gabarito
Professor pode revisar e ajustar final_score + escrever feedback
```

### Fluxo: Trabalho com Arquivo
```
Professor cria com enunciado → publica
Aluno lê enunciado → faz upload do arquivo → confirma entrega
Status muda para "submitted"
Professor abre → baixa arquivo → atribui nota + feedback → salva
Status muda para "graded"
Aluno recebe notificação → vê nota + feedback
Opcional: professor devolve ("returned") com comentário → aluno refaz
```

### Fluxo: Discursiva
```
Igual ao Arquivo, mas aluno escreve texto em vez de fazer upload
Professor lê resposta inline → atribui nota + feedback
```

---

## Arquitetura de Componentes (Frontend)

### Admin / Instrutor

```
src/features/activities/
├── components/
│   ├── ActivityBuilder.tsx        ← formulário criar/editar atividade
│   ├── QuestionEditor.tsx         ← criar questões (type=quiz)
│   ├── SubmissionsList.tsx        ← lista de entregas para correção
│   └── SubmissionReview.tsx       ← tela de correção individual
├── hooks/
│   ├── useActivities.ts           ← CRUD de atividades
│   └── useSubmissions.ts          ← listar e corrigir entregas
└── pages/
    └── (montados em /admin/courses/:id/activities)
```

### Aluno

```
src/features/activities/
└── components/
    ├── ActivityCard.tsx            ← card na sequência do curso
    ├── ActivityDetail.tsx          ← tela de entrega (roteada)
    ├── QuizActivity.tsx            ← resolver prova de múltipla escolha
    ├── FileUploadActivity.tsx      ← upload de arquivo
    ├── TextActivity.tsx            ← resposta discursiva
    └── MyActivitiesDashboard.tsx   ← painel "Minhas Atividades"
```

### Rotas a adicionar (`src/App.tsx`)
```
/admin/courses/:id/activities          ← gestão de atividades (instrutor)
/cursos/:courseId/atividades           ← painel de atividades (aluno)
/cursos/:courseId/atividades/:actId    ← entrega / visualização
```

---

## Edge Function: `submit-activity`

Nova Edge Function para processar submissões (separada de `submit-quiz` para não misturar responsabilidades).

**Actions:**
- `submit`: registra entrega (arquivo, texto, ou respostas quiz)
- `grade`: professor atribui nota + feedback (`admin`/`instructor` only)
- `return`: professor devolve para revisão

Para type `quiz`: calcula `auto_score` automaticamente (soma dos pontos das questões corretas / max_score * 10).

Para type `file_upload`: recebe `file_url` já upada no Storage, salva referência.

---

## "Minhas Atividades" — Dashboard do Aluno

Acessível em `/cursos/:id/atividades` ou via menu lateral "Atividades".

Filtros: Todas · Pendentes · Entregues · Corrigidas · Atrasadas

Cada card exibe:
- Título e curso
- Tipo (ícone: 📝 prova / 📎 arquivo / ✍️ discursiva)
- Prazo (com badge vermelho se vencido, laranja se ≤ 3 dias)
- Status + nota (se já corrigido)

---

## Nota Final do Curso (Cálculo de Média)

```
média_ponderada = Σ (final_score_i * weight_i) / Σ weight_i
```

Exibida no perfil do aluno no curso. A aprovação no curso pode ser configurada para exigir:
- Nota mínima em cada atividade com `passing_score` definido
- Média ponderada ≥ threshold do curso

---

## Decisões de Produto

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Tentativas em prova | Configurável (1–5) | Professores têm necessidades distintas |
| Ver gabarito | Apenas após última tentativa | Evita fraude em tentativas múltiplas |
| Upload múltiplo | Não (v1) — 1 arquivo por entrega | Simplicidade; multi-arquivo é v2 |
| Correção por IA | Não (v1) — só manual | Evitar falsas notas; IA feedback é v2 |
| Notificações | Push in-app (toast + badge) | Email transacional é v2 |
| Plágio | Não (v1) | Integração Turnitin/Copyleaks é v3 |
| Rubrica | Não (v1) — nota numérica simples | Rubrica detalhada por critério é v2 |

---

## Sequência de Implementação

1. **Migrations** — criar 4 tabelas + RLS + policies + storage bucket
2. **Edge Function `submit-activity`** — submit + grade + return actions
3. **Hook `useActivities`** — CRUD para instrutor
4. **`ActivityBuilder`** — formulário de criação com QuestionEditor
5. **Integrar na sequência do módulo** — mesclar lessons + activities no CourseDetail
6. **`ActivityDetail` (aluno)** — tela de entrega por tipo
7. **`SubmissionsList` + `SubmissionReview`** — painel de correção (instrutor)
8. **`MyActivitiesDashboard`** — dashboard do aluno com filtros
9. **Rotas** — registrar em App.tsx
10. **Média ponderada** — exibir no perfil do aluno no curso

---

## File List

- [ ] `supabase/migrations/YYYYMMDD_activities.sql`
- [ ] `supabase/functions/submit-activity/index.ts`
- [ ] `src/features/activities/hooks/useActivities.ts`
- [ ] `src/features/activities/hooks/useSubmissions.ts`
- [ ] `src/features/activities/components/ActivityBuilder.tsx`
- [ ] `src/features/activities/components/QuestionEditor.tsx`
- [ ] `src/features/activities/components/ActivityCard.tsx`
- [ ] `src/features/activities/components/ActivityDetail.tsx`
- [ ] `src/features/activities/components/QuizActivity.tsx`
- [ ] `src/features/activities/components/FileUploadActivity.tsx`
- [ ] `src/features/activities/components/TextActivity.tsx`
- [ ] `src/features/activities/components/SubmissionsList.tsx`
- [ ] `src/features/activities/components/SubmissionReview.tsx`
- [ ] `src/features/activities/components/MyActivitiesDashboard.tsx`
- [ ] `src/pages/CourseDetail.tsx` (integrar activities na sequência do módulo)
- [ ] `src/App.tsx` (novas rotas)
- [ ] `supabase/config.toml` (verify_jwt = false para submit-activity)
