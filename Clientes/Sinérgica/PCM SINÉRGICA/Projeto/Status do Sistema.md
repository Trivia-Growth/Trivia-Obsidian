# Status do Sistema — PCM Sinérgica

> Mapeamento completo de status, produzido pelos agentes do TRIVIAIOX (analyst/architect/data/devops/qa).
> Última atualização: **2026-06-18** · Base: repo `pcm-sinergica-v2` + estados de produção confirmados.

## Visão Geral

O **PCM Sinérgica** é o sistema de **Planejamento e Controle de Manutenção** da Sinérgica Manutenções Patrimoniais. Organiza, do início ao fim, o ciclo de manutenção predial dos condomínios clientes: abertura de chamados, planejamento de visitas, execução em campo (via app Auvo), inspeções/laudos técnicos, propostas comerciais e relatórios (diários e mensais) entregues ao cliente.

O grande diferencial é o **Agente Zé**, um assistente de WhatsApp que conversa dentro dos grupos dos condomínios: recebe pedidos de manutenção, abre chamados no sistema e informa status — tudo em linguagem natural.

**Está em produção?** Sim. Frontend na Netlify + banco e funções na Supabase. O **Agente Zé está funcionando em produção** após o pacote de correções de 2026-06-17.

---

## Componentes e Status

| Componente | Onde roda | Status | Observação |
|---|---|---|---|
| **Frontend (app web)** | Netlify (React + Vite) | ✅ | 12 módulos. Deploy via `netlify.toml`. |
| **Banco de dados** | Supabase `sfprfvltbtysvtsqutla` (São Paulo) | ✅ | **63 tabelas** (≈41 `pcm_*`/`laudos_*` em uso + ~22 vazias de outro sistema — ver abaixo). Em uso: 51 clientes, 517 chamados, 172 msgs do Zé. |
| **Edge Functions — WhatsApp/Zé** | Supabase (Deno) | ✅ | `pcm-whatsapp-webhook`, `pcm-ze-agent`, `pcm-wa-poller`, `pcm-evolution-groups`. Pipeline funcionando. |
| **Edge Functions — Relatórios** | Supabase (Deno) | ✅ | Diário (`pcm-relatorio-diario` + `-enviar`) e mensal (`pcm-relatorio-mensal` + `-worker` via cron). |
| **Edge Functions — Auvo** | Supabase (Deno) | ✅ | ~9 funções de sincronização/integração. |
| **Edge Functions — Inspeções/Laudos** | Supabase (Deno) | ✅ | `analisar-item-inspecao`, `importar-relatorio-pdf`, `laudos-agent`, `image-proxy`. |
| **Evolution / WhatsApp** | Cloudfy (`fascinatingsnail-evolution.cloudfy.live`) | ✅ | Instância **`ze-pcm-v2`**. Envio e recebimento OK após 17/06. |
| **Integração Auvo** | API externa | ✅ | App de campo dos técnicos; fonte de tarefas, fotos, questionários e assinaturas. |
| **LLM / OpenRouter** | API externa | ✅ | Zé usa **gemini-2.5-flash**; inspeções/laudos/propostas usam **Claude**. |
| Funções utilitárias | Supabase (Deno) | ⚠️ | `run-migration`, `setup-storage-policies` — scripts pontuais, não fluxo de produção (ver SEC-006). |

Legenda: ✅ operando · ⚠️ atenção/uso restrito · ❌ quebrado

---

## Pipeline do Agente Zé (WhatsApp)

1. **Morador/síndico envia mensagem** no grupo WhatsApp do condomínio.
2. **Evolution API (Cloudfy)** dispara um **webhook** para `pcm-whatsapp-webhook` (evento `messages.upsert`). O webhook valida o header `Authorization` (causa do 401 antes da correção) e ignora mensagens próprias.
3. **Enfileiramento + agrupamento:** entra na fila `pcm_wa_queue` com `process_after` de **3 segundos** (agrupa rajadas de mensagens curtas).
4. **Disparo via `waitUntil`:** o webhook responde imediatamente ao Evolution e, em background, espera o agrupamento e chama `pcm-ze-agent` (mantém o isolate vivo).
5. **`pcm-ze-agent` decide e age:**
   - **Detecção determinística** se chamaram "Zé" (regex `\bz[eé]\b`) ou mencionaram o bot (`5519982252881` / `124335561912531`) — nesse caso é **forçado a responder**.
   - Chama o **LLM (gemini-2.5-flash via OpenRouter)** com histórico recente (20 msgs) + **tools de chamado** (`criar_chamado`, `atualizar_chamado`, consultas). Loop de até 5 iterações.
   - Off-topic → `SKIP`.
6. **Resposta** enviada de volta ao grupo via Evolution (instância `ze-pcm-v2`).

**Backstop:** o cron **`process-wa-queue`** (`process_wa_queue_cron`, **a cada 1 minuto**) reprocessa itens da fila não disparados pelo `waitUntil`.

**Latência atual:** **~7–9 segundos** (era 40–60s antes das otimizações).

---

## Módulos do Frontend

| Módulo | O que faz |
|---|---|
| **clients** | Cadastro e detalhe de clientes (condomínios), contratos. |
| **os** | Ordens de Serviço / chamados — núcleo operacional. |
| **backlog** | Itens pendentes (de inspeções e "Não OK" do Auvo); score GUT. |
| **visitas** / **cronograma** | Planejamento e registro de visitas técnicas; grade semanal. |
| **preventive** | Manutenção preventiva e planos. |
| **inspecoes** | Inspeções prediais; import PDF/XLS com análise por IA. |
| **laudos** | Laudos SPDA (engine + 4 agentes de IA + PDF). |
| **proposals** | Propostas comerciais (levantamento → IA → DOCX). |
| **daily-reports** / **monthly-reports** | Relatório diário (WhatsApp) e mensal (PDF). |
| **agentes** | Configuração dos agentes WhatsApp (Zé) e modelos de LLM. |

---

## Integrações Externas

| Integração | O que faz |
|---|---|
| **Evolution API (Cloudfy)** | Camada de WhatsApp. Recebe (webhook) e envia as respostas do Zé. Instância `ze-pcm-v2`. |
| **Auvo** | App de gestão de campo. Fonte de tarefas, fotos, questionários, assinaturas e status. O PCM sincroniza clientes/usuários/equipamentos/tarefas, cria tarefas a partir de OS e importa questionários (gera backlog para "Não OK"). |
| **OpenRouter (LLM)** | Gateway de modelos. Zé em **gemini-2.5-flash**; inspeção/laudos/propostas em **Claude** (Sonnet/Haiku). |

---

## Correções Recentes (2026-06-17 / 18)

| Correção | Problema → Solução |
|---|---|
| **Secret de instância** | `EVOLUTION_INSTANCE_ZE` vazio → envio falhava. Padronizado para **`ze-pcm-v2`**. |
| **Recebimento (401)** | Webhook recusava chamadas do Evolution → header `Authorization` ajustado. |
| **Detecção de "Zé"** | Detecção determinística de nome/@menção — força resposta, elimina SKIP indevido. |
| **Latência** | 40–60s → **~7–9s** (resposta rápida com `waitUntil` + agrupamento 8s → 3s). |
| **Drift de código** | Ressincronização das edge functions com produção (o time deployava fora do Git). |
| **Padronização** | Instalação do **TRIVIAIOX (Padrão Trívia)** + docs de repo e vault + STORY-001. |

---

## Pendências e Riscos

| Risco | Severidade | Detalhe |
|---|---|---|
| **IDOR no `atualizar_chamado`** | 🔴 Alto (SEC-001) | A tool faz `.update().eq('numero_os', ...)` **sem `client_id`** — um grupo poderia alterar/cancelar chamado de outro condomínio. Adicionar `.eq('client_id', clientId)`. |
| **FORCE RLS ausente** | 🟠 Médio (SEC-002) | Tabelas têm `ENABLE` mas não `FORCE ROW LEVEL SECURITY` (exigido pelo padrão Trívia). |
| **Drift repo ↔ produção** | 🟠 Médio | O time deploya functions fora do Git. Ressincronizado em 17/06; tende a divergir se o processo não for sempre via repositório. |
| **CORS `*` / sem Zod / sem JWT em código** | 🟠 Médio (SEC-003/004/005) | Functions abertas, sem validação de input, dependem só do `verify_jwt` default. |
| **Fallbacks de instância antigos** | 🟡 Baixo (SEC-009) | Defaults legados (`ze-carlos`/`ze-pcm`) — inócuo enquanto o secret estiver setado. |
| **`pcm-wa-poller`** | ✅ Resolvido | Agora versionado no repositório. |
| **`npm install` peer dep (eslint)** | 🟡 Baixo | Conflito não bloqueia build; usar `--legacy-peer-deps` se necessário. |

> Detalhe completo dos itens SEC-XXX no `SECURITY_DEBT.md` do repositório de código.

---

## Verificação contra Produção (2026-06-18) — achados que o mapeamento por código não pegou

Auditoria via Management API (SQL direto na produção) corrigiu o mapeamento inicial:

| Achado | Detalhe |
|---|---|
| **63 tabelas (não ~40)** | ~22 são de **outro sistema** no mesmo Supabase: um CRM (`deals`, `contacts`, `pipeline_stages`, `teams`, `appointments`) + assistente WhatsApp **"Nina"** (`nina_*`, `whatsapp_instances`, `messages`). **Todas vazias (0 linhas)** — entulho de template, não sistema ativo. Débito SEC-011. |
| **Buckets públicos** | `inspecao-fotos` e `pcm-relatorios` estão **PÚBLICOS** (URL acessível sem auth) — fotos de inspeção e relatórios expostos. Débito SEC-010. 5 buckets no total (`laudos-fotos`, `laudos-pdf`, `pcm-proposals` privados). |
| **Migration drift no banco** | **17 migrations aplicadas** (param em `20260605000002`) vs **24 no repo**. As de 06/06+ (auvo, preventivo, relatórios) foram aplicadas **fora do sistema de migrations** — o schema existe, mas `supabase db push` do repo seria arriscado. |
| **FORCE RLS** | Confirmado: **63/63 tabelas com RLS, 0 com FORCE**. Débito SEC-002. |
| **DB functions / triggers** | 22 funções e 47 triggers no schema `public`. |
| **Crons** | 2 ativos: `process-wa-queue` (1 min) e `relatorio-mensal-worker` (2 min). |

---

## Acessos e Identificadores

| Item | Valor |
|---|---|
| **Repositório** | `engenharia-sinergica/pcm-sinergica-v2` |
| **Supabase (ref)** | `sfprfvltbtysvtsqutla` — São Paulo |
| **Evolution API** | `https://fascinatingsnail-evolution.cloudfy.live` (Cloudfy) |
| **Instância WhatsApp** | `ze-pcm-v2` · número `5519982252881` · id `124335561912531` |
| **LLM — Zé** | `google/gemini-2.5-flash` (OpenRouter) |
| **LLM — Inspeções/Laudos/Propostas** | Claude (Sonnet/Haiku) via OpenRouter |
| **Crons** | `process_wa_queue_cron` (1 min — backstop do Zé) · worker do relatório mensal (2 min) |
