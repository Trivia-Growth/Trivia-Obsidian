# Sinérgica OS — PCM v2 → OS: Mapeamento de Módulos

> Documento de referência para a migração do **PCM Sinérgica v2** (app standalone legado)
> para o módulo **PCM** dentro do **Sinérgica OS**.
> Fonte: [[Fluxogramas-PCM-Sinergica-v2.pdf]] · Repo `pcm-sinergica-v2` · `docs/blueprint/01-pcm-operacao.md`

---

## Contexto: o que era o PCM v2

O PCM v2 (`pcm-sinergica-v2`) era um **React SPA standalone** com 13 módulos organizados em 5 grupos de navegação, 24 Edge Functions Deno e 41 tabelas no Supabase. URL de produção: `https://pcm-sinergica-v2.netlify.app`.

No OS, toda essa lógica entra no **bounded context PCM / Operação** (`apps/web/src/features/pcm/`, schema `pcm`), com os demais bounded contexts (Comercial, Financeiro, etc.) absorvendo o que extrapolava o escopo operacional.

---

## Mapeamento: 13 módulos v2 → OS

| Módulo v2 | Rota v2 | Onde vai no OS | Bounded Context |
|-----------|---------|----------------|-----------------|
| **Clientes** | `/clientes` | `features/pcm` — CRUD + Sync Auvo | PCM |
| **Backlog** | `/backlog` | `features/pcm` — Matriz GUT + sugestão IA | PCM |
| **Cronograma** | `/cronograma` | `features/pcm` — Grid semanal de visitas | PCM |
| **Visitas** | `/visitas` | `features/pcm` — Calendário + KPIs | PCM |
| **Ordens de Serviço** | `/os` | `features/pcm` — Kanban drag-and-drop | PCM |
| **Relatório Diário** | `/relatorio-diario` | `features/pcm` — Auto via Auvo | PCM |
| **Inspeções** | `/inspecoes` | `features/pcm` — IA + NBR 5674 | PCM |
| **Laudos SPDA** | `/laudos` | `features/pcm` — Wizard 8 etapas | PCM |
| **Preventivo** | `/preventivo` | `features/pcm` — Plano por cliente | PCM |
| **Relatório Mensal** | `/relatorio-mensal` | `features/pcm` — PDF gerado | PCM |
| **Propostas** | `/propostas` | `features/comercial` — 4 tipos | **Comercial** |
| **Levantamento** | `/levantamentos/novo` | `features/comercial` — Chat IA campo | **Comercial** |
| **Agentes / Zé** | `/agentes` | `features/atendimento` — WhatsApp + Zé | **Atendimento** |

> **Nota:** Volante (`/volante/novo`) e Residente (`/residente/novo`) eram sub-fluxos de Propostas — permanecem em `features/comercial`.

---

## Fluxos Operacionais Principais (herdados do v2)

### 1. Ciclo completo de chamado → fechamento

```
Abertura
  ├── WhatsApp (Agente Zé)
  ├── Inspeção (vistoria)
  └── Backlog / Preventivo
        ↓
pcm.ordens_servico  [status: solicitação]
        ↓
Kanban → Planejamento
        ↓
Auvo Task criada  [externalId = os.id]
        ↓
Técnico executa em campo (app Auvo)
        ↓
Fim de visita no Auvo
  ├── Questionário → gera novos itens de backlog
  ├── Status sync → atualiza OS no PCM
  └── Relatório Diário → enviado via WhatsApp ao condomínio
```

**Status da OS (Kanban 6 estágios):**
`solicitacao` → `planejamento` → `em_execucao` → `finalizado` → `faturado` / `cancelado`

---

### 2. Fluxo de Propostas (4 tipos)

| Tipo | Como funciona | Motor |
|------|--------------|-------|
| **Levantamento** | Chat IA com fotos + notas + disciplinas | Edge Function `pcm-generate-proposal` (Gemini 2.5 Flash) |
| **Volante** | Cálculo dinâmico: Téc × Freq × Nível × Margem | `calcVolante.ts` |
| **Residente** | Cálculo dinâmico: Nível + Cobertura + Margem | `calcResidente.ts` |
| **Contrato Simples** | Formulário manual (legado) | — |

**Pipeline de status:** Em Revisão → Aprovada → Enviada → Aceita / Recusada  
**Output:** Download DOCX via `pcm-proposal-docx`

**Motor de precificação (Volante / Residente):**
```
Custo Total (MO + Benefícios + Material + Veículo + Suporte)
  × (1 + Margem)
  ÷ (1 − Alíquota Anexo IV Simples)
= PREÇO FINAL

Piso = Custo / (1 − Alíquota)
Desconto máximo = 1 − Piso / Preço
```

---

### 3. Agente Zé (WhatsApp)

```
Usuário/Síndico → mensagem no grupo
  ↓
Evolution API → POST /webhook
  ↓
pcm-whatsapp-webhook → salva pcm_wa_messages, enfileira (delay 8s)
  ↓
pcm-ze-agent → batch de mensagens + prompt + tools + contexto
  ↓
OpenRouter/Gemini → resposta + tool_calls
  (tools: criar_chamado / listar / atualizar)
  ↓
Evolution API → texto natural → Usuário/Síndico
```

---

### 4. Laudo SPDA (Wizard 8 etapas)

Conforme **NBR 5419:2026** (partes 2, 3 e 4):

| Etapa | Conteúdo |
|-------|---------|
| 1 | Dados básicos (cliente, ART, data) |
| 2 | Edifício (dimensões, uso) |
| 3 | Medições (resistência, fotos) |
| 4 | Risco — NBR 5419-2 (Ng, Cd, fatores) |
| 5 | Segurança — NBR 5419-3 (ki × kc/km × L) |
| 6 | DPS — NBR 5419-4 (classe, Up) |
| 7 | Rascunho — IA gera narrativa |
| 8 | Assinatura (SVG + hash SHA-256) → gera PDF |

---

## O que muda do v2 para o OS

| Aspecto | PCM v2 (legado) | Sinérgica OS |
|---------|-----------------|--------------|
| Arquitetura | App standalone (single-repo) | Monorepo multi-domínio (9 contextos) |
| Propostas | Dentro do PCM | Bounded context **Comercial** próprio |
| Agente Zé | Config dentro do PCM (`/agentes`) | Bounded context **Atendimento** próprio |
| Banco | 41 tabelas no schema padrão | Schemas separados por domínio (`pcm`, `comercial`, etc.) |
| Auvo | Receptor (dados chegam do Auvo) | **Hub**: PCM escreve no Auvo, Auvo devolve campo |
| Financeiro | Não coberto | Bounded context **Financeiro** novo |
| Comercial / Marketing / Growth | Não cobertos | Bounded contexts próprios |
| Gestão | Não coberta | **Cockpit** com dashboards e SLA |
| Área do Cliente | Não coberta | Portal do síndico |

---

## Entidades principais do módulo PCM

| Entidade | Descrição |
|----------|-----------|
| `Cliente` | Condomínio (CNPJ, endereço, contrato, grupo WhatsApp) |
| `Contrato` | Visitas/semana, horas/visita — base do indicador de saúde do backlog |
| `Backlog Item` | Item com score GUT (Gravidade × Urgência × Tendência, máx 125) |
| `Visita` | Agendamento (cliente + data + turno + técnico + itens de backlog) |
| `Ordem de Serviço` | Trabalho executável: corretiva, preventiva, inspeção, levantamento, emergencial |
| `Inspeção` | Vistoria com fotos + IA → gera backlog automaticamente |
| `Plano Preventivo` | Equipamento + periodicidade → gera OS automaticamente |
| `Relatório Diário` | Consolidação das OS do dia, enviado via WhatsApp |
| `Relatório Mensal` | PDF do período (OS, preventivas, SLA, NPS, assinatura) |
| `Laudo SPDA` | Documento técnico NBR 5419:2026 |
