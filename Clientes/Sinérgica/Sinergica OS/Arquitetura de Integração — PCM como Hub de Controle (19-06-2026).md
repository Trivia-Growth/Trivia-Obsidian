# PCM Sinérgica + Auvo: Arquitetura de Integração e Robustez

Data: 19 de junho de 2026
Uso: interno Trívia — decisão de arquitetura e roadmap técnico
Relacionados: [[Mapeamento de Capacidades Auvo vs PCM (19-06-2026)]] · [[Relatório de Integração Auvo (19-06-2026)]] · [[Auvo-API-Mapeamento-Completo 1]]

---

## 0. Tese deste documento

Hoje a integração trata o **Auvo como fonte de verdade** e o PCM como receptor (os dados nascem no Auvo e são espelhados no PCM). Este documento propõe a inversão: **o PCM passa a ser o centro de controle (system of record) e o Auvo vira um hub de execução de campo.**

A ideia é simples: tudo que pode ser operado de dentro do PCM, é operado de dentro do PCM. O Auvo é acionado apenas para o que só ele faz bem — colocar a tarefa no celular do técnico, capturar GPS, check-in/check-out, fotos, assinatura e checklist em campo (inclusive offline).

Este documento mapeia, domínio por domínio, qual sistema deve ser o dono de cada dado, em que direção a informação deve fluir, e o que precisa mudar no código atual para que essa arquitetura seja confiável.

---

## 1. A linha divisória: o que só o Auvo faz

Antes de decidir o que migrar para o PCM, é preciso ser honesto sobre o que o Auvo faz que o PCM não tem como substituir sem reconstruir um app móvel inteiro.

### Insubstituível pelo Auvo (o hub de campo)

| Capacidade | Por que só o Auvo |
|---|---|
| App no celular do técnico | App nativo, funciona offline, já instalado e em uso pela equipe |
| GPS e rastreamento | Coleta de posição em background pelo app móvel |
| Check-in / check-out | Registro de chegada e saída com geolocalização |
| Captura de foto em campo | Câmera + upload com a tarefa, mesmo sem sinal |
| Checklist / questionário offline | Técnico responde sem internet, sincroniza depois |
| Assinatura do cliente | Coleta de assinatura na tela do celular |
| Deslocamento e tempo de tarefa | Cronometragem automática pelo app |

Tudo nessa lista é **dado nascido no campo**: o PCM nunca vai ser a origem disso, só o consumidor. O fluxo aqui é sempre **Auvo → PCM**.

### Operável pelo PCM (o centro de controle)

Tudo o que é decisão de gestão, cadastro, planejamento e financeiro pode e deve ser operado no PCM:

- Cadastro e edição de clientes (condomínios)
- Cadastro de equipamentos e sua hierarquia
- Abertura e priorização de chamados e ordens de serviço
- Planejamento do preventivo (o que, quando, com que recorrência)
- Atribuição de técnico e equipe
- Catálogo de serviços e produtos
- Orçamentos e propostas
- Faturamento e contas a receber
- Relatórios e indicadores

O fluxo aqui é **PCM → Auvo** (o PCM decide, o Auvo recebe a ordem de execução) e, quando o campo devolve resultado, **Auvo → PCM** (só os dados de execução).

---

## 2. Princípio de direção de dados por domínio

Esta é a tabela central da arquitetura proposta. Para cada domínio, define quem é o dono (system of record) e em que direção a informação flui.

| Domínio | Dono proposto | Direção | Observação |
|---|---|---|---|
| Clientes (condomínios) | **PCM** | PCM → Auvo | Hoje é Auvo → PCM. Inverter: cliente nasce no PCM e é empurrado pro Auvo |
| Equipamentos | **PCM** | PCM → Auvo | Idem; PCM ganha hierarquia (edifício > sistema > equipamento) |
| Técnicos / equipes | **Auvo** | Auvo → PCM | Gestão de usuários do app fica no Auvo; PCM só espelha |
| Chamados / OS | **PCM** | PCM → Auvo → PCM | PCM abre, Auvo executa no campo, devolve status/resultado |
| Preventivo (recorrência) | **PCM** | PCM → Auvo | PCM planeja, Auvo gera as tarefas recorrentes |
| Checklist / questionário (respostas) | **Auvo** | Auvo → PCM | Capturado em campo; PCM consome |
| GPS / check-in / fotos / assinatura | **Auvo** | Auvo → PCM | Nascido no campo, insubstituível |
| Produtos / serviços usados na tarefa | **Auvo** (registro) / **PCM** (catálogo) | bidirecional | Catálogo no PCM; consumo registrado no campo |
| Orçamentos | **PCM** | PCM → Auvo | PCM gera; Auvo arquiva/envia se preciso |
| Notas fiscais / contas a receber | **PCM** | PCM → Auvo | Ciclo financeiro controlado no PCM |
| Pesquisa de satisfação | **Auvo** | Auvo → PCM | Auvo dispara e coleta; PCM consolida NPS |

**Regra de ouro:** dado de gestão nasce no PCM; dado de campo nasce no Auvo. Quando os dois tocam o mesmo registro (uma OS), o PCM vence em tudo que é decisão (prioridade, descrição, atribuição) e o Auvo vence em tudo que é execução (status real, horário de check-in, foto, resposta de checklist).

---

## 3. O modelo de identidade (a peça técnica que sustenta tudo)

Para o PCM ser o dono sem perder o vínculo com o Auvo, é preciso acertar como cada registro é identificado entre os dois sistemas.

### Como está hoje

| Entidade | Identificação atual | Quem é dono do ID |
|---|---|---|
| Cliente | `pcm_clients.auvo_customer_id` (UNIQUE) | Auvo |
| OS / Tarefa | `pcm_ordens_servico.auvo_task_id` (índice UNIQUE) | Auvo |
| Equipamento | `pcm_equipment_cache (client_id, auvo_id)` | Auvo |

O código de criação de tarefa (`pcm-auvo-create-task`) **já envia `externalId` igual ao ID da OS no PCM**. Ou seja, a base para o PCM ser dono do ID já existe parcialmente. O problema: na hora de reconciliar (quando a tarefa volta pelo webhook), o sistema procura pelo `auvo_task_id` (ID do Auvo), não pelo `externalId` (ID do PCM). Isso amarra a reconciliação ao ID que o Auvo gera, em vez do ID que o PCM controla.

### Como deveria ser (PCM dono do ID)

O padrão robusto é: **o PCM gera o ID, e esse ID viaja para o Auvo como `externalId` em toda escrita.** O ID nativo do Auvo (`taskID`, `customerId`) passa a ser um espelho secundário, não a chave primária da relação.

| Entidade | Chave de reconciliação recomendada | Espelho secundário |
|---|---|---|
| Cliente | `externalId` = PCM client id | `auvo_customer_id` |
| OS / Tarefa | `externalId` = PCM OS id (já enviado!) | `auvo_task_id` |
| Equipamento | `externalId` = PCM equipment id | `auvo_id` |

Quase todos os endpoints de escrita do Auvo aceitam `externalId` como chave de upsert (criar-ou-atualizar). Isso significa que o PCM pode empurrar dados para o Auvo de forma idempotente: se mandar duas vezes, atualiza o mesmo registro em vez de duplicar. É o alicerce de uma integração que não cria lixo.

**Mudança necessária:** reconciliar o webhook por `externalId` quando presente, com `auvo_task_id` como fallback. Hoje é só por `auvo_task_id`.

---

## 4. Achados de robustez no código atual

A leitura linha a linha das duas funções centrais (`pcm-auvo-create-task` e `pcm-auvo-webhook`) revelou problemas concretos que precisam ser resolvidos para a integração ser confiável em produção. Estes não são teóricos — estão no código hoje.

### 4.1 Webhook sem deduplicação (risco de dados duplicados) — ALTO

O webhook não registra nem verifica um identificador de entrega. O Auvo **reentrega eventos por até 24 horas** em caso de falha. Se o mesmo evento de finalização de uma ronda chegar duas vezes, a função `createCorretivasFromRonda` vai criar **corretivas duplicadas** (ela faz INSERT direto, sem checar se já existe).

Correção: deduplicar por um identificador de entrega (a tabela `pcm_auvo_webhook_logs` já existe e pode ganhar uma coluna de delivery id com índice único; processar só se for novo).

### 4.2 Validação de webhook não bate com o formato novo da API — ALTO

O código valida um header simples `x-webhook-secret` (segredo compartilhado). A documentação atual da API Auvo (OpenAPI 3.1) descreve um mecanismo diferente: assinatura **HMAC-SHA256** no header `X-Auvo-Signature`, com timestamp e proteção contra replay. Além disso, o payload que o código espera (array de `entityType`/`action`/`entityId`) é o **formato legado** de webhook do Auvo, não o formato novo (`event`/`deliveryId`/`data`).

Implicação: ao registrar o webhook, precisamos confirmar **qual formato a conta da Sinérgica usa**. Se for o novo, o código de validação e de parsing precisa ser adaptado. Isso tem que ser verificado antes de ativar, não depois.

### 4.3 Login via URL e sem cache de token — MÉDIO

Ambas as funções fazem `GET /login?apiKey=...&apiToken=...`, passando as credenciais na URL (ficam em logs de servidor e proxies). A própria doc da Auvo recomenda **não usar GET /login em produção**. Além disso, cada invocação faz um login novo (sem cache), o que desperdiça chamadas e aproxima do limite de 400 req/min em picos.

Correção: trocar para `POST /login` com as credenciais no corpo, e cachear o token (válido por 30 min) entre invocações.

### 4.4 Campos de criação de tarefa divergentes da API — MÉDIO

O `create-task` monta o payload com `taskTypeId` e `priority` de 1 a 4 (incluindo 4 = Urgente). A documentação da API descreve o campo como `taskType` (não `taskTypeId`) e prioridade de **1 a 3** (1=Baixa, 2=Média, 3=Alta). Enviar `priority: 4` ou o nome de campo errado pode fazer o Auvo ignorar silenciosamente o valor, criando a tarefa com tipo/prioridade padrão.

Correção: validar os nomes de campo e o range de prioridade contra a API real (testar criando uma tarefa e conferindo no painel).

### 4.5 Prioridade e status com vocabulários inconsistentes — BAIXO

O mapa de prioridade no código tem chaves `baixa/normal/media/alta/urgente/critica`, mas o banco só aceita `critica/alta/media/baixa`. Valores como `normal` e `urgente` não existem no schema. Pequena fonte de bug.

### 4.6 Sem reconciliação de fallback (estado pode divergir para sempre) — ALTO

Toda a sincronização depende de o webhook chegar. Se a função estiver fora do ar, se o Auvo desistir após 24h, ou se um evento se perder, o PCM e o Auvo divergem **permanentemente**, sem mecanismo de auto-correção.

Correção: um job de reconciliação (cron) que periodicamente puxa do Auvo o que mudou (as funções de sync por período já existem) e corrige divergências. É a rede de segurança que torna a integração confiável de verdade.

---

## 5. Padrões de robustez a implementar

Para a arquitetura "PCM como hub de controle" ser sólida, recomendamos estes padrões. Eles transformam a integração de "funciona quando tudo dá certo" para "funciona mesmo quando algo falha".

### 5.1 Escrita idempotente (externalId em tudo)

Toda escrita PCM → Auvo usa o ID do PCM como `externalId`. Reenviar nunca duplica. É a defesa número um contra lixo de integração.

### 5.2 Fila de saída (outbox) para escritas no Auvo

Em vez de chamar o Auvo direto no meio de uma ação do usuário (onde uma falha de rede trava a operação), o PCM grava a intenção numa fila (`pcm_auvo_outbox`) e um worker processa com retry. O usuário não espera o Auvo responder; a sincronização acontece em background com garantia de entrega.

### 5.3 Idempotência na entrada (dedup por delivery id)

Todo evento recebido é registrado com seu identificador único e processado uma única vez. Reentrega do Auvo não causa efeito duplicado.

### 5.4 Máquina de estado de sincronização

Cada registro sincronizável tem um estado explícito: `pendente` → `sincronizado` → `falhou` → `em_conflito`. Já existe parcialmente (`auvo_sync_status`), mas precisa cobrir os casos de conflito e ser visível no frontend (o gestor vê o que não sincronizou).

### 5.5 Reconciliação periódica

Um cron diário compara PCM e Auvo e corrige divergências. Rede de segurança contra eventos perdidos.

### 5.6 Política de resolução de conflito

Regra explícita de quem vence quando os dois lados mudam o mesmo registro: **PCM vence em campos de decisão** (prioridade, descrição, atribuição), **Auvo vence em campos de execução** (status real, check-in, fotos, respostas). Sem essa regra, a última escrita ganha de forma imprevisível.

### 5.7 Retry com backoff e dead-letter

Falhas transitórias (rede, rate limit 403) são repetidas com espera crescente. Falhas persistentes vão para uma "fila morta" visível, em vez de sumirem silenciosamente.

---

## 6. Como cada operação passaria a funcionar (visão alvo)

### Abrir um chamado (hoje vs alvo)

**Hoje:** chamado nasce no Auvo (técnico abre no app ou alguém abre no painel Auvo) → webhook → vira OS no PCM. Ou nasce no PCM e é empurrado pro Auvo via `create-task`.

**Alvo:** o gestor (ou o Zé via WhatsApp) abre o chamado **no PCM**. O PCM é a porta de entrada única. Ao atribuir um técnico, o PCM empurra a tarefa para o Auvo (com `externalId` = ID do chamado), que a coloca no celular do técnico. O técnico executa, e só o resultado de execução volta.

### Cadastrar um cliente

**Hoje:** cliente cadastrado no Auvo → espelhado no PCM.

**Alvo:** cliente cadastrado **no PCM** (com todos os dados de gestão, contatos, grupo de WhatsApp do Zé) → empurrado pro Auvo para que apareça no app dos técnicos. PCM é o cadastro mestre.

### Planejar o preventivo

**Hoje:** não integrado (PCM tem módulo próprio; Auvo tem Service Orders recorrentes; não conversam).

**Alvo:** o plano preventivo é montado **no PCM** (qual equipamento, qual periodicidade) e empurrado para o Auvo como Ordem de Serviço recorrente. O Auvo gera as tarefas no calendário dos técnicos automaticamente. O PCM continua sendo onde o plano vive e é ajustado.

### Fechar o ciclo financeiro

**Hoje:** fora de escopo.

**Alvo:** tarefa concluída no campo devolve ao PCM os serviços e produtos usados. O PCM monta o orçamento ou a NF (com seu catálogo e suas regras), e empurra para o Auvo apenas o que precisar viver lá. O controle financeiro é do PCM.

---

## 7. Roadmap revisado sob a ótica "PCM como hub de controle"

### Fase 0 — Endurecer o que existe (pré-requisito de tudo)

Antes de expandir, tornar confiável o que já está implementado:

1. Trocar `GET /login` por `POST /login` com cache de token
2. Deduplicação de webhook por delivery id
3. Confirmar formato de webhook da conta Auvo (legado vs novo / HMAC) e adaptar validação
4. Corrigir nomes de campo e range de prioridade no `create-task`
5. Criar a tabela de técnicos ausente
6. Configurar o segredo do webhook e o `verify_jwt`
7. Job de reconciliação diária (rede de segurança)

### Fase 1 — Inverter o sentido do cadastro

Fazer o PCM virar dono de clientes e equipamentos: cadastro no PCM, push para o Auvo via `externalId`. Reconciliação por `externalId`.

### Fase 2 — Fechar o ciclo operacional

Abertura de chamado centralizada no PCM; GPS dos técnicos no painel; registro de produtos/serviços da tarefa devolvido ao PCM; tipos de tarefa sincronizados dinamicamente (não hardcoded).

### Fase 3 — Preventivo integrado

Plano preventivo no PCM gerando Service Orders recorrentes no Auvo. Hierarquia de equipamentos.

### Fase 4 — Ciclo financeiro

Orçamento, nota fiscal, contas a receber e pesquisa de satisfação, com o PCM como centro de controle financeiro.

---

## 8. O que muda para a Sinérgica, na prática

Com essa arquitetura, o Fabrício e a equipe passam a ter **um único lugar para operar**: o PCM. O Auvo continua existindo e sendo essencial — é o que põe a tarefa na mão do técnico e captura o que acontece em campo — mas deixa de ser onde as decisões são tomadas e os cadastros são mantidos.

Benefícios diretos:
- Uma porta de entrada de chamados (PCM), não duas
- Cadastro de cliente e equipamento em um lugar só
- Fim do risco de dados duplicados e divergência silenciosa
- Base para o ciclo financeiro automatizado (campo → faturamento) que hoje é manual
- O Auvo vira um "braço de campo" plugável: se um dia a Sinérgica trocar de ferramenta de campo, o PCM (que detém os dados) sobrevive à troca

Isso conversa diretamente com o contrato do Sinérgica OS, onde o PCM é descrito como parte da base única de dados. Esta arquitetura é o caminho técnico para que o PCM seja, de fato, essa base.

---

## 9. Próximos passos

1. Validar com o Fabrício a premissa de que o PCM deve ser a porta de entrada única (impacto no fluxo da equipe)
2. Executar a Fase 0 (endurecimento) — não depende de credenciais novas, pode começar já
3. Confirmar o formato de webhook da conta Auvo antes de registrar (item técnico crítico)
4. Sequenciar as Fases 1 a 4 dentro do cronograma do Sinérgica OS
