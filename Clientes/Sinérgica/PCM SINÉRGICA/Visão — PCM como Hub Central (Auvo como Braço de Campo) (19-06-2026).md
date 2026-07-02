# PCM como Hub Central da Operação Sinérgica

### Blueprint de evolução, com o Auvo como braço de campo via API

Data: 19 de junho de 2026
Uso: interno Trívia — visão de produto e arquitetura
Relacionados: [[00 - Índice — Sinérgica]] (contrato Sinérgica OS) · [[Auvo-API-Mapeamento-Completo 1]] · [[Mapeamento de Capacidades Auvo vs PCM (19-06-2026)]]

---

## 0. Premissa (o enquadramento correto)

Este documento **não** parte do que o código atual do PCM faz (que é limitado, ~10% da API do Auvo). Parte de duas coisas:

1. **A capacidade total da API do Auvo** — 141 endpoints em 29 grupos, cobrindo campo, ativos, estoque, financeiro, satisfação e mais.
2. **A operação completa da Sinérgica** — já desenhada no contrato do Sinérgica OS (9 módulos).

A pergunta que respondemos: **como o PCM evolui para ser o hub central (o cérebro) de toda a operação da Sinérgica, usando o Auvo como o ponto central das operações que não faz sentido substituir?**

Isso não é uma ideia nova. O contrato do Sinérgica OS já tomou esta decisão:

> "Auvo: mantido como sistema de campo e integrado via API (não substituído). PCM: aproveita a estrutura existente (regras de negócio + integração com o Auvo), com ajustes para entrar na base única."

Este documento operacionaliza essa decisão: define a fronteira entre o que o PCM passa a controlar e o que continua sendo do Auvo, e como os dois se conectam.

---

## 1. A fronteira: o que NÃO substituímos no Auvo

O Auvo tem um valor que seria caro e desnecessário reconstruir: **o aplicativo de campo que a equipe técnica já usa**. Tudo que depende desse app fica no Auvo. É o "braço de campo".

| Capacidade insubstituível | Por quê |
|---|---|
| App móvel do técnico (nativo, offline) | Funciona sem sinal; já instalado e dominado pela equipe |
| Despacho de tarefa para o celular | A tarefa aparece na agenda do técnico no app |
| GPS e rastreamento em background | Coletado pelo SO do celular, impossível replicar via web |
| Check-in / check-out geolocalizado | Prova de presença no local |
| Checklist / questionário offline | Técnico responde sem internet, sincroniza depois |
| Captura de foto e assinatura em campo | Câmera + tela de assinatura no momento do serviço |
| Cronometragem de deslocamento e execução | Automática pelo app |

**Regra:** se depende do técnico com um celular na mão dentro do condomínio, é Auvo. Todo o resto é candidato a ser operado pelo PCM.

---

## 2. Os 9 módulos do Sinérgica OS × Auvo

A operação completa da Sinérgica está descrita nos 9 módulos do contrato. Aqui, para cada módulo: o que o **PCM** controla como cérebro, e onde o **Auvo** entra (via qual endpoint da API) ou se é insubstituível.

| # | Módulo Sinérgica OS | PCM (cérebro / system of record) | Auvo (braço, via API) |
|---|---|---|---|
| 1 | **Comercial (CRM)** | Funil de prospects, propostas, contratos, precificação | Visita técnica de levantamento vira task de campo (`POST /tasks` tipo Levantamento) |
| 2 | **Atendimento (IA)** | Zé no WhatsApp + triagem + abertura de chamado | Chamado despacha task ao técnico (`POST /tasks`) |
| 3 | **Marketing** | Conteúdo multicanal (independente do Auvo) | — |
| 4 | **Growth** | Análise Meta/Google Ads (independente do Auvo) | — |
| 5 | **Operação Técnica e Estoque** | Planejamento, OS, inventário de ativos, catálogo de materiais, custo | Execução em campo + consumo de peças (`tasks`, `serviceorders`, `equipments`, `products`, `gps`) |
| 6 | **Financeiro** | Orçamento, faturamento, contas a receber, rentabilidade por contrato | Despesas do técnico + dados de execução para faturar (`expenses`, produtos/serviços da task) |
| 7 | **Dados (base única)** | A base única — PCM é o repositório central | Auvo é uma fonte que alimenta a base (campo) |
| 8 | **Gestão (cockpit do dono)** | Dashboards, SLA, produtividade, rentabilidade | Dados de execução e GPS alimentam os indicadores (`tasks`, `gps`, `satisfactionsurveys`) |
| 9 | **Área do Cliente (portal)** | Portal do síndico: chamados, relatórios, histórico | Pesquisa de satisfação disparada pós-serviço (`satisfactionsurveys`) |

Repare: o Auvo aparece de forma intensa apenas nos módulos 5 e 6 (operação de campo e a parte de execução do financeiro). Nos demais, o PCM é autônomo. **O Auvo é um braço especializado, não o esqueleto.**

---

## 3. A arquitetura de hub

```
        Síndico / Zelador                              Técnico em campo
        (WhatsApp via Zé)                              (app Auvo no celular)
               │                                              ▲
               ▼                                              │
   ┌───────────────────────────────────────────────┐         │
   │                                               │         │
   │              PCM — HUB CENTRAL                 │   push  │  resultado
   │           (cérebro da operação)               │ ──────► │ ◄──────
   │                                               │  tasks  │ status, GPS,
   │   Comercial · Atendimento · Planejamento      │  OS     │ foto, checklist,
   │   Operação · Estoque · Financeiro             │  cadastro│ assinatura
   │   Dados (base única) · Gestão/BI · Portal     │         │
   │                                               │      AUVO (braço de campo)
   └───────────────────────────────────────────────┘
        ▲                    ▲                    ▲
        │                    │                    │
   Portal do Cliente   Meta/Google Ads      Fiscal / NF-e
   (síndico)           (Growth)             Resend (e-mails)
```

O PCM fica no centro. O Auvo é **um** dos braços conectados (o de campo), no mesmo nível conceitual que o WhatsApp/Zé (braço de atendimento), o portal do cliente, ou as integrações de marketing e fiscal. Nenhum desses braços é o cérebro. O cérebro é o PCM.

---

## 4. Como cada processo operacional funciona no modelo-alvo

### 4.1 Captação e onboarding de um condomínio

- **PCM faz:** cadastra o prospect no CRM, gera a proposta, fecha o contrato, e cadastra o condomínio como cliente mestre (dados, contatos, grupo de WhatsApp do Zé, plano contratado).
- **Empurra ao Auvo:** o cliente (`PUT /customers` com `externalId` = ID do PCM) para que apareça no app dos técnicos, e os equipamentos/ativos do condomínio (`POST /equipments`, com hierarquia: Torre > Sistema > Equipamento).
- **Auvo devolve:** se o levantamento de ativos for feito em campo, o que o técnico cadastrar no local volta para enriquecer o inventário do PCM.

### 4.2 Planejamento da manutenção preventiva

- **PCM faz:** monta o plano preventivo por ativo (o que inspecionar, com que periodicidade, sob qual norma — PMOC, NRs), e o cronograma anual. É aqui que vive a inteligência de manutenção.
- **Empurra ao Auvo:** cada rotina preventiva como Ordem de Serviço recorrente (`POST /serviceorders` com `recurrenceType`), que faz o Auvo gerar automaticamente as tarefas no calendário dos técnicos.
- **Auvo devolve:** a execução de cada preventiva (checklist preenchido, fotos, status).

### 4.3 Atendimento e abertura de chamado (corretivo)

- **PCM é a porta única:** o síndico ou zelador fala com o Zé no WhatsApp, ou abre pelo portal do cliente, ou o escritório registra. Tudo entra pelo PCM, que faz a triagem e a priorização (matriz GUT).
- **Empurra ao Auvo:** o chamado vira uma task despachada ao técnico (`POST /tasks` com `externalId` = ID do chamado e o técnico atribuído).
- **Auvo devolve:** check-in, execução, foto, checklist, check-out — e o PCM fecha o chamado automaticamente.

> Decisão de desenho: o Auvo tem um módulo próprio de chamados (Tickets). **Recomendamos não usá-lo** — o Zé + portal do PCM já são a porta de entrada, e usar duas portas fragmenta o atendimento. Tickets fica como capacidade de reserva.

### 4.4 Execução em campo (o território do Auvo)

- **Auvo faz tudo:** o técnico recebe a tarefa no app, navega até o local, faz check-in, executa, registra peças usadas, preenche o checklist (mesmo offline), tira fotos, colhe a assinatura, faz check-out.
- **PCM orquestra o pós-execução:** ao receber a finalização, dispara automaticamente os gatilhos de negócio — gera corretiva para cada não-conformidade do checklist, importa as fotos como evidência, e aciona o relatório do dia. (Essa orquestração já existe no código atual e é o ponto forte do que o Fabrício construiu.)

### 4.5 Gestão de ativos e equipamentos

- **PCM é o cérebro do inventário:** histórico consolidado por equipamento (toda manutenção que cada bomba, quadro ou ar-condicionado já recebeu), garantias, vida útil, custo acumulado de manutenção por ativo. Isso é base para decidir trocar vs reparar.
- **Auvo espelha:** os equipamentos vão para o Auvo (com QR code / identificador) para que o técnico os escaneie em campo e vincule a tarefa ao ativo certo.

### 4.6 Estoque e materiais

- **PCM é o catálogo e o estoque central:** define produtos e serviços, controla o estoque do almoxarifado, calcula custo.
- **Auvo gerencia o estoque de campo:** cada técnico tem um saldo de materiais no app (`PUT /products/employee-product-stock`), e o consumo é registrado na tarefa (`PUT /tasks/{id}/products`).
- **Auvo devolve:** o que foi consumido em campo abate o estoque no PCM e entra no custo da OS.

### 4.7 Financeiro

- **PCM é o centro financeiro:** a partir da OS executada (com peças e serviços que voltaram do campo), monta o orçamento ou a nota, controla contas a receber e calcula a rentabilidade por contrato e por condomínio.
- **Auvo entra como fonte de execução:** despesas lançadas pelos técnicos no app (`GET /expenses`) e os produtos/serviços registrados na tarefa alimentam o custo real.

> Decisão de desenho: o Auvo também tem orçamento, NF e contas a receber na API. **Recomendamos o PCM fazer o financeiro nativo** (mais flexível, integra com o fiscal/NF-e e o Resend já previstos no Sinérgica OS) e usar o Auvo apenas como fonte de dados de campo (despesas e consumo). Espelhar para o financeiro do Auvo fica opcional, caso a Sinérgica queira ver lá também.

### 4.8 Relatórios, indicadores e portal do cliente

- **PCM produz:** relatório mensal do condomínio, laudos técnicos, indicadores de SLA (tempo de atendimento), cumprimento do preventivo, e o portal onde o síndico acompanha tudo.
- **Auvo fornece os dados:** as respostas de pesquisa de satisfação (`GET /satisfactionsurveys`) viram o NPS, e os dados de execução das tarefas (`GET /tasks`) alimentam o SLA e a produtividade.

### 4.9 Equipe de campo

- **Auvo é o dono natural:** o técnico é, antes de tudo, um usuário do app. Cadastro, equipes e agenda vivem bem no Auvo.
- **PCM espelha e usa:** importa os técnicos (`GET /users`), consome o GPS (`GET /gps`) para um painel de operação em tempo real (quem está onde, quem está livre para um chamado urgente) e mede produtividade.

---

## 5. O modelo de identidade que sustenta o hub

Para o PCM ser o dono da operação sem perder o vínculo com o Auvo, o PCM gera os IDs e os envia ao Auvo como `externalId` em toda escrita. O ID nativo do Auvo vira um espelho secundário.

| Entidade | Dono do ID | Como viaja ao Auvo |
|---|---|---|
| Cliente (condomínio) | PCM | `externalId` em `PUT /customers` |
| Equipamento / ativo | PCM | `externalId` em `POST /equipments` |
| Chamado / OS | PCM | `externalId` em `POST /tasks` (já implementado hoje) |
| Plano preventivo | PCM | `externalId` em `POST /serviceorders` |
| Técnico | Auvo | PCM espelha via `GET /users` |

A vantagem: a API do Auvo aceita `externalId` como chave de "criar ou atualizar" na maioria dos endpoints de escrita. Isso torna cada envio **idempotente** — reenviar nunca duplica. É o que permite o PCM empurrar dados com segurança e ser, de fato, a fonte de verdade.

---

## 6. Capacidades da API ainda não exploradas que viabilizam essa visão

A maioria do que torna o PCM um hub central depende de endpoints do Auvo que o sistema atual ainda não usa. Os de maior alavancagem:

| Capacidade da API | O que destrava | Endpoint |
|---|---|---|
| Empurrar cliente para o Auvo | Cadastro mestre no PCM | `PUT /customers` |
| Empurrar equipamento com hierarquia | Inventário de ativos no PCM | `POST /equipments` (parentEquipmentId) |
| Ordens de serviço recorrentes | Preventivo planejado no PCM | `POST /serviceorders` |
| GPS dos técnicos | Painel de operação em tempo real | `GET /gps` |
| Produtos/serviços na tarefa | Custo real e base de faturamento | `PUT /tasks/{id}/products` e `/services` |
| Despesas do técnico | Custo operacional por OS | `GET /expenses` |
| Estoque por técnico | Controle de materiais de campo | `PUT /products/employee-product-stock` |
| Pesquisa de satisfação | NPS no cockpit e no portal | `GET /satisfactionsurveys` |
| Tipos de tarefa dinâmicos | Sem hardcode; espelha config do Auvo | `GET /tasktypes` |

Hoje o sistema usa ~15 de 141 endpoints. Esta visão usa um conjunto bem maior, mas **seletivo** — só o que serve à operação, não a API inteira por completude.

---

## 7. Decisões de desenho em aberto (precisam de validação)

Estas bifurcações mudam o desenho e merecem uma definição (proponho a recomendação, mas é decisão de produto):

1. **Porta de atendimento:** Zé + portal do PCM como porta única (recomendado), ou também abrir os Tickets do Auvo? → Recomendo porta única.
2. **Financeiro:** nativo no PCM (recomendado, integra com fiscal/NF-e/Resend do Sinérgica OS), ou espelhado no financeiro do Auvo? → Recomendo nativo.
3. **Cadastro mestre de cliente:** inverter para o PCM ser a origem (recomendado), ou manter o Auvo como origem por enquanto? → Recomendo inverter, mas pode ser gradual.
4. **Preventivo:** PCM gera as Service Orders recorrentes no Auvo (recomendado), ou mantém os dois calendários separados? → Recomendo integrar.

---

## 8. Roadmap de evolução (orientado por capacidade de negócio)

Sequência pensada para entregar valor cedo e na ordem em que a operação precisa:

**Etapa 1 — Ligar e endurecer o que existe.** Ativar a integração já construída e torná-la confiável (detalhes técnicos no documento de arquitetura e robustez). Pré-requisito de tudo.

**Etapa 2 — PCM como porta única de atendimento.** Chamado nasce no PCM (Zé/portal/escritório) e despacha ao Auvo. GPS dos técnicos no cockpit.

**Etapa 3 — PCM como cadastro mestre.** Inverter a origem de clientes e equipamentos; inventário de ativos com histórico consolidado no PCM.

**Etapa 4 — Preventivo planejado no PCM.** Plano por ativo gerando Service Orders recorrentes no Auvo. Hierarquia de equipamentos.

**Etapa 5 — Custo e financeiro.** Produtos/serviços e despesas voltando do campo; orçamento, faturamento e contas a receber no PCM. Rentabilidade por contrato.

**Etapa 6 — Cockpit e portal.** Indicadores (SLA, cumprimento de preventiva, NPS), portal do síndico, satisfação.

As etapas 2 a 6 são, na prática, a construção dos módulos 5, 6, 8 e 9 do Sinérgica OS — com o Auvo plugado como braço de campo em cada uma.

---

## 9. Por que essa arquitetura é a certa para a Sinérgica

- **Respeita o que funciona:** ninguém pede para a equipe trocar o app de campo. O Auvo continua sendo o que eles já usam.
- **Centraliza o que está espalhado:** uma base única (o PCM) em vez de dados fragmentados entre Auvo, planilhas e WhatsApp.
- **É à prova de troca de fornecedor:** como o PCM detém os dados, se um dia a Sinérgica trocar a ferramenta de campo, o cérebro sobrevive. O Auvo é plugável, não é a fundação.
- **É exatamente o Sinérgica OS:** este blueprint é a materialização técnica do contrato já assinado — o PCM evoluindo para a base única, com o Auvo integrado via API como sistema de campo.

---

## 10. Próximos passos

1. Validar com o Fabrício as 4 decisões de desenho da seção 7.
2. Confirmar que a operação real da Sinérgica bate com os processos da seção 4 (entrevista de operação — pode ser o mesmo levantamento do diagnóstico do Sinérgica OS).
3. Detalhar a Etapa 1 (ligar + endurecer) como primeiro incremento concreto.
4. Sequenciar as etapas 2 a 6 dentro do cronograma do Sinérgica OS (meses 2 e 3).
