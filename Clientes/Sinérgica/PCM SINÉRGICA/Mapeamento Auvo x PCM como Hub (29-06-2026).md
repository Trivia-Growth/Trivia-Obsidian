# Auvo x PCM Sinérgica: o PCM como Hub da Operação

Data: 29 de junho de 2026
Uso: interno Trívia — desenho da integração Auvo no PCM novo (Sinergica-OS)
Substitui: `Mapeamento de Capacidades Auvo vs PCM (19-06-2026).md` (aquele era um inventário "o que a API tem"; este é "o que o hub precisa")

---

## Mudança de lógica

O mapeamento anterior tratava o PCM como **receptor** do Auvo (o dado nascia no Auvo e vinha pro PCM). A nova diretriz inverte isso:

> O time de escritório da Sinérgica interage **somente com o PCM**. O PCM **escreve no Auvo** (cria clientes, equipamentos, tarefas, preventivos, financeiro) e é **realimentado pelos retornos do Auvo** (status de campo, fotos, checklist, peças, GPS). O PCM vira o hub de fato da operação.

Isso já é a intenção do design novo: o ADR-0001 do `Sinergica-OS` define **"PCM = origin of truth das decisões; Auvo = verdade da execução"**. Este documento valida essa decisão contra a API real e lista o que precisa ser construído, em ordem, com os cuidados.

**Estado atual do código:** o PCM novo (`~/Downloads/Sinergica-OS-main`) ainda **não tem nenhuma Edge Function de Auvo implementada** — só o design em `docs/blueprint/integracoes/auvo.md`. Folha limpa: dá pra desenhar o hub certo desde o início.

Base da API: `https://api.auvo.com.br/v2` · Doc: https://auvoapiv2.docs.apiary.io/

---

## A fronteira fixa: o campo continua no app Auvo

Antes de tudo, o limite que não muda e precisa estar claro com a Sinérgica:

**"O time mexe só no PCM" vale para o time de escritório / planejamento.** O **técnico em campo continua usando o app do Auvo no celular.** É lá que ele faz check-in/check-out, tira foto, coleta assinatura, preenche checklist e registra peças. A API do Auvo é **somente leitura** nesses pontos — não existe como o PCM "injetar" um GPS, um checkout ou uma assinatura.

Conclusão: o PCM é o **hub do escritório**. O app Auvo segue sendo a ferramenta de campo. Os dois juntos formam o ciclo completo.

---

## As três direções de dado

O hub tem três tipos de fluxo, e a viabilidade de cada um é diferente:

| Direção | Como funciona | Situação |
|---|---|---|
| **PCM → Auvo** (escrita) | O PCM cria/atualiza no Auvo via POST/PUT/PATCH | ✅ Cobertura total da API |
| **Auvo → PCM tempo real** (webhook) | O Auvo avisa o PCM quando algo muda | ✅ Só para 6 entidades (ver abaixo) |
| **Auvo → PCM agendado** (polling) | O PCM pergunta ao Auvo de tempos em tempos | ⚠️ Necessário pra tudo que não tem webhook |

---

## 1. PCM → Auvo: escrita (sem limitação)

Tudo que o escritório precisaria criar tem endpoint de escrita. Este lado está limpo.

| O time cria/edita no PCM… | Endpoint Auvo | Método |
|---|---|---|
| Condomínio / cliente | `/customers`, `/customers/complete` | POST / PUT / PATCH |
| Equipamento (com hierarquia pai→filho) | `/equipments` (`parentEquipmentId`) | POST / PUT / PATCH |
| Tarefa de campo (chamado/corretiva) | `/tasks` | POST / PUT / PATCH |
| Peças, serviços e custos da tarefa | `/tasks/{id}/products` · `/services` · `/additional-costs` | PUT |
| Anexos da tarefa (foto do "antes") | `/tasks/{id}/attachments` | PUT |
| **Preventivo recorrente** | `/serviceorders` | POST |
| Orçamento | `/quotations` (+ itens) | POST / PATCH |
| Nota Fiscal | `/invoices` | POST / PUT |
| Conta a receber | `/receivables` | POST / PUT |

**Hierarquia de equipamento** (`parentEquipmentId`): permite Torre A → Sistema Hidráulico → Bomba 01, com histórico por equipamento individual.

**Service Order = preventivo recorrente:** `recurrenceType` aceita `daily`/`weekly`/`monthly`/`yearly`, com `recurrenceInterval`, `recurrenceDays` e `monthlyMode`. O Auvo gera as tarefas no calendário automaticamente. **Cuidado:** o `PATCH /serviceorders/{code}` só edita descrição/status/externalId — **a recorrência só pode ser definida na criação**. Mudou a periodicidade do preventivo? Cria de novo ou ajusta no painel.

---

## 2. Auvo → PCM em tempo real: webhook (cobertura limitada)

O Auvo só dispara webhook para **6 tipos de entidade**:

| entityType | Entidade | Serve pro hub? |
|---|---|---|
| 1 | User (técnico) | Cadastro de técnico mudou |
| **4** | **Task** | **Conclusão / mudança de status em campo — o loop operacional principal** |
| 7 | Customer | Cliente alterado no Auvo |
| 27 | Equipment | Equipamento alterado no Auvo |
| 50 | Invoice | Nota fiscal |
| 62 | Ticket | Chamado do help desk Auvo |

Eventos (`action`): `1 = Inclusão`, `2 = Alteração`, `3 = Exclusão`. Para pegar a conclusão de uma tarefa em campo, o que interessa é **Task + Alteração (4 + 2)** — o status muda para CheckedOut(4)/Finished(5).

### O webhook é "magro" — não traz o conteúdo

O webhook avisa **"a Task 123 mudou"**, mas **não manda as fotos, o checklist nem as peças no aviso.** O fluxo correto é:

1. Webhook chega: "Task 123, Alteração".
2. PCM faz `GET /tasks/123` para puxar `taskStatus`, assinatura (`signatureUrl`), peças, serviços etc.
3. PCM atualiza a OS local.

Status possíveis da tarefa (`taskStatus`): `1=Opened`, `2=InDisplacement`, `3=CheckedIn`, `4=CheckedOut`, `5=Finished`, `6=Paused`.

### Cuidado com o eco (loop infinito)

Como o PCM **cria** Customer/Equipment/Task no Auvo, e o Auvo **avisa** alteração dessas mesmas entidades via webhook, existe risco de eco: o PCM cria → Auvo avisa → PCM "recebe de volta" o que ele mesmo criou. Mitigação: idempotência por `externalId`/`auvo_*_id` (já previsto no schema: `pcm.ordens_servico.auvo_task_id` único + `auvo_sync_status`). Ao processar o webhook, checar se a mudança originou do próprio PCM antes de reagir.

---

## 3. Auvo → PCM agendado: polling (o que NÃO tem webhook)

Tudo abaixo **não dispara webhook** — o PCM precisa **perguntar de tempos em tempos** (cron + paginação). Sem isso, o hub fica cego nessas áreas.

| O que | Endpoint | Por que importa | Frequência sugerida |
|---|---|---|---|
| **Preventivo recorrente (Service Orders)** | `GET /serviceorders` | O calendário de preventivo do Auvo **não avisa nada**; o hub só sabe varrendo | Diária |
| **Respostas de checklist/questionário** | `GET /questionnaires` (ou no detalhe da task) | Sem webhook próprio | Junto do GET da task concluída |
| **GPS dos técnicos** | `GET /gps` (`getLastKnowPosition=true`) | "Mapa em tempo real" = polling, não push | A cada X min, só em horário operacional |
| **Orçamentos** | `GET /quotations` | Acompanhar funil de proposta | Sob demanda / diária |
| **Contas a receber** | `GET /receivables` | Inadimplência por cliente | Diária |
| **Despesas do técnico** | `GET /expenses` | Custo por OS | Diária |
| **Pesquisa de satisfação (NPS)** | `GET /satisfactionsurveys` | Qualidade do atendimento | Diária |

**Somente leitura (read-only) na API:** GPS, pesquisas de satisfação, categorias financeiras, métodos de pagamento. Esses nunca serão escritos pelo PCM — só consultados.

---

## 4. Segurança do webhook — todos os cuidados (ponto crítico)

> **A API do Auvo NÃO documenta assinatura (HMAC), header secreto ou qualquer mecanismo nativo de autenticação do webhook.** O corpo do evento chega "puro". Isso significa que **a proteção do endpoint é 100% responsabilidade do PCM.** Já batemos nisso antes (o "fix do header do webhook do Zé"). Como o endpoint vai ser público na internet, sem cuidado qualquer um que descobrir a URL pode injetar eventos falsos.

Camadas de proteção a implementar (defesa em profundidade):

1. **Segredo na URL de registro.** Ao registrar o webhook (`POST /webhooks`, campo `targetUrl`, máx. 250 caracteres), embutir um token longo e aleatório na própria URL, ex.:
   `https://<projeto>.supabase.co/functions/v1/pcm-auvo-webhook?s=<token-aleatorio-longo>`
   A Edge Function rejeita (HTTP 401) qualquer chamada sem o `s` correto. Esse token vai pro **Supabase Secrets** (nunca no código, nunca no vault).

2. **Reconsulta obrigatória (não confiar no corpo).** Como o webhook é magro, o PCM **sempre** confirma o evento fazendo `GET /tasks/{id}` (ou da entidade certa) usando as credenciais reais do Auvo. Isso valida a origem **e** traz o dado verdadeiro. Um evento forjado não sobrevive: ou o ID não existe, ou o estado real diverge do alegado.

3. **Validação de payload e idempotência.** Validar o formato (entity/action/id esperados); ignorar eventos repetidos (o Auvo pode reenviar). Chave de idempotência por `auvo_task_id` + `taskStatus` + timestamp; gravar o que já foi processado.

4. **Endpoint sem efeito colateral imediato.** O webhook só **enfileira** o evento (escreve numa fila/tabela) e responde 200 rápido. O processamento pesado (GET de detalhe, atualização da OS) roda assíncrono. Isso evita que o endpoint público dispare lógica cara e protege contra flood.

5. **Rate limit / WAF no próprio endpoint.** Limitar requisições por IP na borda (Netlify/Supabase), já que o Auvo chama de um conjunto previsível de IPs.

6. **Não logar dados sensíveis.** Logar `reqId`, entity, action, id — nunca o token da URL nem dados pessoais do cliente em texto claro.

7. **Rotação.** O token da URL do webhook entra na lista de segredos rotacionáveis (mesma disciplina dos outros segredos do vault).

### Cuidado operacional: um webhook por entidade

O Auvo aparentemente aceita **um único webhook por tipo de entidade por conta** (erro `1026 — "Webhook with the given entity already registered for this admin user"`). Como decidido: o que for pro ar é o de **produção**, e não há problema em **apagar** (`DELETE /webhooks/{id}`) o registro antigo antes de apontar o novo. **Sequência na virada:**

1. `GET /webhooks` → listar o que está registrado hoje.
2. `DELETE /webhooks/{id}` → remover os apontamentos antigos (PCM legado).
3. `POST /webhooks` → registrar os novos (Task, Customer, Equipment etc.) apontando para a Edge Function de produção, já com o token na URL.
4. Conferir com novo `GET /webhooks`.

---

## 5. Limites operacionais da API

- **Token expira a cada 30 minutos.** Renovar via `POST /login` (apiKey + apiToken). As credenciais ficam em Supabase Secrets (`AUVO_API_KEY`, `AUVO_USER_TOKEN`), nunca no front nem no vault.
- **Rate limit: 400 requisições/min por IP** (estouro → HTTP 403 `"Rate limit temporarily exceeded"`). Confortável hoje, **mas o hub vai pollar** GPS + serviceorders + questionários + financeiro. Todas as Edge Functions saem do mesmo IP e **dividem esse teto**. Portanto:
  - Polling sempre via **cron agendado e paginado**, nunca sob demanda por usuário.
  - GPS só em horário operacional, com `getLastKnowPosition` em vez de varrer histórico.
  - Cachear referências que mudam pouco (tipos de tarefa, categorias, técnicos).

---

## 6. Roadmap do hub (ordem de construção)

### Fase 1 — Esqueleto do hub (PCM → Auvo + retorno de Task)
O loop operacional mínimo que já entrega o hub:
- Login + renovação de token (Edge Function base).
- `pcm-auvo-create-task` (POST /tasks com `externalId = os.id`, idempotente).
- `pcm-auvo-patch-task-orientation` (PATCH /tasks).
- `pcm-auvo-customers-sync` e `pcm-auvo-equipment-sync` (PCM cria/espelha).
- **`pcm-auvo-webhook` com todas as 7 camadas de segurança acima** + reconsulta GET.
- Registro de webhooks (Task, Customer, Equipment) apontando pra produção.

→ Resultado: time abre OS no PCM, vira tarefa no Auvo, técnico executa no app, conclusão volta pro PCM sozinha.

### Fase 2 — Fechar o operacional
- Polling de Service Orders (preventivo recorrente sincronizado).
- Importar peças/serviços/checklist da tarefa concluída (base pra custo).
- GPS por polling (mapa dos técnicos).
- Tipos de tarefa dinâmicos (em vez de hardcoded).

### Fase 3 — Ciclo financeiro
- Orçamento (Quotations) a partir do levantamento no PCM.
- Nota Fiscal e Contas a receber.
- Pesquisa de satisfação (NPS por cliente).

### Fase 4 — Refinos
- Hierarquia de equipamento, grupos de cliente, despesas do técnico, estoque por técnico.

---

## 7. Resumo de uma linha por área

| Área | PCM escreve? | Volta por webhook? | Volta por polling? | Observação |
|---|---|---|---|---|
| Clientes | ✅ | ✅ (7) | — | Cuidar do eco |
| Equipamentos | ✅ | ✅ (27) | — | Hierarquia na criação |
| Tarefas | ✅ | ✅ (4) | detalhe via GET | Loop principal; webhook magro |
| Checklist/questionário | — | ❌ | ✅ | Junto da task concluída |
| Preventivo (Service Orders) | ✅ (criar) | ❌ | ✅ | Recorrência só na criação |
| GPS | ❌ (read-only) | ❌ | ✅ | "Tempo real" = polling |
| Orçamento / NF / Receber | ✅ | só Invoice (50) | ✅ | Fase 3 |
| Satisfação (NPS) | ❌ (read-only) | ❌ | ✅ | — |
| Campo (foto/assinatura/checkout) | ❌ | — | — | **Sempre no app Auvo** |

---

## 8. Limitações x como resolver (consolidado)

Cada limitação da API e a forma de contornar. Nenhuma delas inviabiliza o hub — todas têm saída.

| # | Limitação | Impacto no hub | Como resolver |
|---|---|---|---|
| 1 | **Webhook só cobre 6 entidades** (User, Task, Customer, Equipment, Invoice, Ticket) | Preventivo, checklist, GPS, orçamento, financeiro e NPS não avisam mudança | **Polling agendado** (cron paginado) para cada uma dessas áreas — ver tabela da seção 3 |
| 2 | **Webhook é "magro"** (só id+entity+action, sem foto/checklist/peça) | O aviso não traz o conteúdo da execução | Ao receber o webhook, fazer **`GET /tasks/{id}`** (ou da entidade) pra puxar o detalhe completo |
| 3 | **Risco de eco** (PCM cria → Auvo avisa → PCM "recebe de volta") | Reprocessar o que o próprio PCM gerou; duplicar dado | **Idempotência por `externalId`/`auvo_*_id`** + marcar a origem da mudança antes de reagir (schema já tem `auvo_sync_status`) |
| 4 | **Webhook sem assinatura/HMAC nativo** | Endpoint público pode receber evento forjado | **7 camadas de proteção** (seção 4): token na URL, reconsulta GET, idempotência, só-enfileirar, rate-limit na borda, não-logar-segredo, rotação |
| 5 | **Um webhook por entidade por conta** (erro 1026) | Não dá pra ter dois consumidores do mesmo evento; slot pode estar ocupado pelo PCM legado | Na virada: `GET /webhooks` → **`DELETE`** o antigo → **`POST`** o de produção. PCM é o ponto único e redistribui se precisar |
| 6 | **`PATCH /serviceorders` não edita recorrência** (só descrição/status) | Mudar a periodicidade de um preventivo não dá por API | Recriar a Service Order com a nova recorrência, ou ajustar no painel Auvo. Tratar recorrência como definida na criação |
| 7 | **Token expira a cada 30 min** | Chamada com token velho falha | Renovar via `POST /login` e **cachear o token** (reusar enquanto válido), não logar na URL |
| 8 | **Rate limit 400 req/min por IP** (compartilhado entre todas as Edge Functions) | Polling pesado pode estourar o teto | **Cron agendado e paginado** (nunca on-demand por usuário); GPS só em horário operacional com `getLastKnowPosition`; cachear referências que mudam pouco |
| 9 | **Campo é read-only na API** (GPS, foto, assinatura, checkout, checklist) | PCM não consegue "fazer" o trabalho de campo | **Fronteira fixa**: técnico segue no app Auvo; o PCM só lê esses dados. Não é limitação a "resolver", é o desenho |

---

## Conclusão

O modelo de PCM-hub **é viável** e já é a intenção do design novo. A escrita PCM → Auvo é total. O retorno tem dois regimes: **webhook** (rápido, mas só 6 entidades — sendo Task a que importa) e **polling agendado** (pra preventivo, GPS e financeiro). A fronteira que não muda: **o técnico continua no app Auvo**. E o cuidado nº 1 da implementação é a **segurança do endpoint de webhook**, que a API não protege sozinha — as 7 camadas acima são obrigatórias.

Tudo dimensionado para entrar no `Sinergica-OS` (`docs/blueprint/integracoes/auvo.md`) nas fases de construção.
