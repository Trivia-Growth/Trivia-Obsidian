# Auvo x PCM Sinérgica: Mapeamento Completo de Capacidades

Data: 19 de junho de 2026
Uso: interno Trívia — planejamento de roadmap de integração

---

## Como ler este documento

A API do Auvo expõe 29 grupos de recursos e 141 endpoints. O PCM atual usa apenas 5 desses grupos (login, clientes, equipamentos, tarefas e webhooks). Este documento mapeia tudo que a API permite fazer, classifica o que já está implementado e o que não está, e avalia o valor de cada capacidade para o contexto da Sinérgica.

**Legenda de status:**
- Implementado: o PCM já faz isso hoje (ou tem o código pronto, mesmo que não ativado)
- Parcial: código existe mas incompleto ou quebrado
- Não implementado: capacidade disponível na API, sem nenhum código no PCM

**Legenda de valor:**
- Alto: muda diretamente o dia a dia da operação
- Médio: melhora o sistema mas não é urgente
- Baixo: útil no futuro, não prioritário agora

---

## 1. Autenticação e Infraestrutura

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Login JWT (POST /login) | Implementado | — | Base de tudo; token de 30 min |
| Renovação automática de token | Implementado | — | Código nas Edge Functions |
| Receber webhooks do Auvo | Implementado | — | `pcm-auvo-webhook` pronto |
| Registrar webhooks no Auvo (POST /webhooks) | Não implementado | Alto | Precisa ser feito via painel Auvo ou via API |
| Listar webhooks ativos (GET /webhooks) | Não implementado | Médio | Útil para auditoria e diagnóstico |

---

## 2. Usuários e Técnicos

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Sincronizar técnicos Auvo → PCM (GET /users) | Parcial | Alto | Código pronto, tabela pcm_technicians não existe no banco |
| Criar usuário no Auvo (POST /users) | Não implementado | Baixo | Gestão de usuários feita pelo Fabrício no painel |
| Atualizar dados do técnico (PATCH /users) | Não implementado | Baixo | Idem |
| Listar equipes e membros (GET /teams) | Não implementado | Médio | Útil para atribuição inteligente de chamados por equipe |
| Monitorar localização GPS dos técnicos (GET /gps) | Não implementado | Alto | Ver onde cada técnico está em tempo real ou última posição conhecida |

**Destaque — GPS em tempo real:**
A API permite consultar a posição atual de qualquer técnico (latitude, longitude, nível de bateria, operadora). Com isso seria possível mostrar um mapa no PCM com os técnicos em campo, ver quem está mais próximo de um chamado urgente e registrar o histórico de deslocamento por tarefa.

---

## 3. Clientes (Condomínios)

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Sincronizar clientes Auvo → PCM (GET /customers) | Implementado | Alto | `pcm-auvo-customers-sync` pronto |
| Receber evento de cliente novo/alterado via webhook | Implementado | Alto | `pcm-auvo-webhook` processa entityType 7 |
| Criar cliente no Auvo a partir do PCM (PUT /customers) | Não implementado | Médio | Hoje o fluxo é inverso: cliente nasce no Auvo e vem pro PCM |
| Atualizar dados do cliente no Auvo (PATCH /customers) | Não implementado | Médio | Manter os dois sistemas sincronizados em ambas as direções |
| Grupos de clientes (GET/POST /customergroups) | Não implementado | Médio | Agrupar condomínios por perfil: residencial, comercial, industrial |
| Segmentos de clientes (GET /segments) | Não implementado | Baixo | Segmentação adicional de portfólio |
| Anexos de cliente (PUT /customers/{id}/attachments) | Não implementado | Baixo | Documentos do condomínio vinculados no Auvo |

---

## 4. Equipamentos

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Sincronizar equipamentos Auvo → PCM (GET /equipments) | Implementado | Alto | `pcm-auvo-equipment-sync` pronto |
| Receber evento de equipamento via webhook | Implementado | Alto | `pcm-auvo-webhook` processa entityType 27 |
| Criar equipamento no Auvo a partir do PCM (POST /equipments) | Não implementado | Médio | Hoje o equipamento nasce no Auvo |
| Hierarquia de equipamentos (parentEquipmentId) | Não implementado | Médio | Organizar: Edifício > Sistema > Equipamento. Exemplo: Torre A > Sistema Hidráulico > Bomba 01 |
| Categorias de equipamentos (GET /equipmentcategories) | Não implementado | Baixo | Organização por tipo no painel Auvo |

**Destaque — Hierarquia de equipamentos:**
O Auvo suporta equipamentos pai e filho. Um condomínio pode ter Torre A como equipamento pai, dentro dela os sistemas (hidráulico, elétrico, HVAC) como filhos, e dentro de cada sistema os equipamentos individuais. Isso permite criar um plano de manutenção preventiva por equipamento específico e rastrear o histórico de cada bomba, quadro ou ar-condicionado individualmente.

---

## 5. Tarefas (Ordens de Serviço de Campo)

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Sincronizar tarefas Auvo → PCM (GET /tasks) | Implementado | Alto | `pcm-auvo-tasks-sync` pronto |
| Criar tarefa no Auvo a partir de chamado PCM (POST /tasks) | Implementado | Alto | `pcm-auvo-create-task` pronto |
| Atualizar orientação da tarefa (PATCH /tasks) | Implementado | Alto | `pcm-auvo-patch-task-orientation` pronto |
| Importar respostas de questionário (GET /questionnaires) | Implementado | Alto | `pcm-auvo-import-questionnaire` pronto |
| Registrar produtos usados na tarefa (PUT /tasks/{id}/products) | Não implementado | Alto | Técnico informa peças/materiais no Auvo; PCM poderia consolidar o custo |
| Registrar serviços executados (PUT /tasks/{id}/services) | Não implementado | Alto | Base para faturamento: o que foi feito em cada tarefa |
| Registrar custos adicionais da tarefa (PUT /tasks/{id}/additional-costs) | Não implementado | Médio | Deslocamento, ferramentas, etc. |
| Enviar resposta de questionário via API (PUT /tasks/{id}/questionnaire-response) | Não implementado | Médio | Pré-preencher checklists antes do técnico chegar |
| Anexos de tarefa (PUT /tasks/{id}/attachments) | Não implementado | Médio | Fotos do antes da manutenção enviadas via PCM |
| Tarefas para múltiplos técnicos (listIdUserTo) | Não implementado | Médio | Um chamado → N técnicos com tarefas individuais |
| Listar tarefas excluídas (GET /tasks/GetDeletedTasks) | Não implementado | Baixo | Auditoria de tarefas removidas no Auvo |

**Destaque — Produtos e Serviços da Tarefa:**
Quando um técnico finaliza uma tarefa no Auvo, ele pode registrar quais peças usou e quais serviços executou. Se o PCM consumir esses dados via API, teria automaticamente a base para gerar o orçamento ou a nota fiscal da OS: materiais + mão de obra já registrados, sem entrada manual.

---

## 6. Ordens de Serviço com Recorrência (Service Orders)

Esta é a funcionalidade do Auvo mais distante do que o PCM atual usa, e potencialmente a mais estratégica para o preventivo.

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Criar OS com recorrência no Auvo (POST /serviceorders) | Não implementado | Alto | Diferente de tasks: OS são recorrentes (diária, semanal, mensal, anual). Base do preventivo Auvo |
| Sincronizar OS Auvo → PCM (GET /serviceorders) | Não implementado | Alto | Trazer o calendário de preventivos do Auvo para o PCM |
| Atualizar status de OS (PATCH /serviceorders) | Não implementado | Médio | Fechar OS no Auvo quando concluída no PCM |

**O que são Service Orders no Auvo vs Tasks:**
No Auvo existem dois conceitos diferentes. Tasks são tarefas avulsas com data e técnico definidos. Service Orders (ordens de serviço) são planos de manutenção recorrente: definem o cliente, o tipo de serviço e a recorrência, e o Auvo gera as tasks automaticamente no calendário. O preventivo mensal de um condomínio seria uma Service Order, não uma task.

Hoje o PCM tem seu próprio módulo de preventivo. A integração com Service Orders permitiria que os dois calendários conversassem: preventivo planejado no PCM geraria automaticamente a OS recorrente no Auvo.

---

## 7. Chamados Auvo (Tickets)

O Auvo tem seu próprio sistema de chamados, paralelo ao sistema de tasks. Nunca foi usado no contexto do PCM Sinérgica.

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Criar chamado no Auvo (POST /tickets) | Não implementado | Médio | Auvo tem sistema de help desk próprio com status e responsável |
| Listar chamados Auvo (GET /tickets) | Não implementado | Médio | Consolidar chamados vindos de fontes diferentes |
| Atualizar status de chamado (PATCH /tickets) | Não implementado | Médio | Fechar chamado Auvo quando OS PCM é concluída |
| Receber evento de chamado via webhook (entity 62) | Não implementado | Médio | Chamado aberto no Auvo vira automaticamente OS no PCM |

**Quando faz sentido usar Tickets Auvo:**
Se clientes da Sinérgica abrirem chamados direto no portal do cliente Auvo (se disponível), esses chamados chegariam via webhook e poderiam virar OS no PCM sem intervenção manual. A integração com o Zé já resolve parte disso via WhatsApp, mas os Tickets Auvo abrem outra porta de entrada.

---

## 8. Financeiro

Esta área está completamente fora do escopo atual do PCM. A API Auvo cobre o ciclo financeiro completo a partir dos serviços prestados.

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Gerar orçamento no Auvo (POST /quotations) | Não implementado | Alto | A partir de um levantamento de serviço no PCM, criar orçamento no Auvo com itens detalhados |
| Acompanhar orçamentos (GET /quotations) | Não implementado | Médio | Funil de propostas no Auvo |
| Gerar nota fiscal no Auvo (POST /invoices) | Não implementado | Alto | OS finalizada → NF gerada no Auvo com produtos e serviços da tarefa |
| Contas a receber (POST /receivables) | Não implementado | Alto | Após NF, lançar parcelas a receber no Auvo |
| Listar contas a receber (GET /receivables) | Não implementado | Médio | Visibilidade de inadimplência por cliente no PCM |
| Despesas do técnico (GET/POST /expenses) | Não implementado | Médio | Técnico registra combustível, ferramentas, etc. no app; PCM consolida por OS |
| Categorias financeiras (GET /financialcategories) | Não implementado | Baixo | Referência para categorizar receitas e despesas |
| Métodos de pagamento (GET /paymentmethods) | Não implementado | Baixo | Referência para orçamentos e NFs |

**Destaque — Ciclo financeiro completo:**
A API do Auvo permite cobrir o ciclo do campo ao faturamento sem sair da integração: tarefa executada → serviços e produtos registrados → orçamento gerado → NF emitida → conta a receber lançada. Hoje a Sinérgica provavelmente faz esse ciclo manualmente ou em outro sistema. A integração PCM + Auvo poderia automatizar parte disso.

---

## 9. Pesquisa de Satisfação

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Coletar respostas de pesquisa de satisfação (GET /satisfactionsurveys) | Não implementado | Médio | Auvo envia pesquisa automática ao cliente após tarefa concluída; respostas ficam disponíveis via API |

**Como funciona:** O tipo de tarefa pode ser configurado para enviar automaticamente uma pesquisa de satisfação ao cliente após o checkout do técnico. As respostas ficam na API. O PCM poderia exibi-las no painel do cliente ou consolidar um NPS por período.

---

## 10. Produtos e Serviços (Catálogo)

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Listar produtos (GET /products) | Não implementado | Médio | Catálogo de materiais para usar nas tarefas e orçamentos |
| Criar/atualizar produto (POST/PUT /products) | Não implementado | Baixo | Manter catálogo sincronizado com ERP da Sinérgica, se houver |
| Controle de estoque por técnico (PUT /products/employee-product-stock) | Não implementado | Médio | Cada técnico tem um saldo de materiais; Auvo controla o estoque por colaborador |
| Listar serviços (GET /services) | Não implementado | Médio | Catálogo de serviços para orçamentos e faturamento |
| Criar/atualizar serviço (POST/PUT /services) | Não implementado | Baixo | Manter catálogo atualizado |

---

## 11. Palavras-chave e Tipos de Tarefa

| Capacidade | Status | Valor | Observação |
|---|---|---|---|
| Listar tipos de tarefa (GET /tasktypes) | Não implementado | Médio | Os 13 tipos mapeados no PCM foram hardcoded; sincronizar dinamicamente do Auvo é mais robusto |
| Palavras-chave em tarefas (GET/POST /keywords) | Não implementado | Baixo | Tags para agrupamento e filtros em relatórios |

---

## 12. Resumo: capacidades por grau de valor para Sinérgica

### Alto valor — não implementadas (oportunidades imediatas)

| Capacidade | Por que vale |
|---|---|
| GPS dos técnicos | Visibilidade em tempo real de quem está onde; atribuição por proximidade em urgências |
| Registrar produtos e serviços da tarefa | Base para orçamento e faturamento automático; elimina entrada manual |
| Orçamento automático (Quotations) | A partir do levantamento PCM, gerar proposta no Auvo em segundos |
| Service Orders com recorrência | Calendário preventivo do Auvo conversando com o preventivo PCM |
| Nota Fiscal automática | OS concluída → NF gerada, sem passo manual |
| Contas a receber | Fechamento do ciclo financeiro dentro dos sistemas |

### Médio valor — implementação em segunda fase

| Capacidade | Por que vale |
|---|---|
| Grupos de clientes | Segmentar portfólio para relatórios e precificação |
| Hierarquia de equipamentos | Histórico por equipamento individual, não só por cliente |
| Sincronização bidirecional de clientes | PCM como fonte de verdade, não só receptor |
| Pesquisa de satisfação | NPS por cliente, visibilidade de qualidade do atendimento |
| Chamados Auvo (Tickets) | Segunda porta de entrada de chamados além do Zé |
| Despesas dos técnicos | Controle de custo operacional por OS |
| Estoque por técnico | Controle de materiais em campo |

### Baixo valor / futuro

| Capacidade | Por que vale |
|---|---|
| CRUD de usuários no Auvo | Hoje gerenciado manualmente; automatizar não é urgente |
| Criação de produtos/serviços no Auvo | Manutenção de catálogo; raramente muda |
| Palavras-chave | Útil para relatórios, mas não bloqueia nada |
| Tarefas excluídas | Auditoria; raramente necessário |

---

## 13. O que o Fabrício já construiu vs o que existe na API

| Grupo da API Auvo | Endpoints disponíveis | O que o PCM usa hoje |
|---|---|---|
| Autenticação | 2 | Sim (login automático) |
| Usuários | 6 | Parcial (sync quebrado) |
| Clientes | 9 | 2 de 9 (sync + webhook) |
| Grupos de clientes | 4 | Nenhum |
| Produtos | 7 | Nenhum |
| Categorias de produto | 6 | Nenhum |
| Serviços | 6 | Nenhum |
| Equipamentos | 6 | 2 de 6 (sync + webhook) |
| Categorias de equipamento | 5 | Nenhum |
| Palavras-chave | 5 | Nenhum |
| Tipos de tarefa | 5 | Nenhum (hardcoded no frontend) |
| Equipes | 4 | Nenhum |
| Segmentos | 5 | Nenhum |
| Tarefas | 14 | 4 de 14 (sync, criar, patch, questionário) |
| Chamados (Tickets) | 5 | Nenhum |
| Status de chamados | 1 | Nenhum |
| Questionários | 2 | 1 de 2 (leitura de respostas) |
| GPS | 1 | Nenhum |
| Ordens de Serviço | 4 | Nenhum |
| Despesas | 6 | Nenhum |
| Tipos de despesa | 5 | Nenhum |
| Custos adicionais | 3 | Nenhum |
| Notas Fiscais | 4 | Nenhum |
| Orçamentos | 14 | Nenhum |
| Contas a Receber | 4 | Nenhum |
| Categorias Financeiras | 1 | Nenhum |
| Métodos de Pagamento | 1 | Nenhum |
| Pesquisas de Satisfação | 1 | Nenhum |
| Webhooks | 4 | 2 de 4 (receber + processar; registrar via API não implementado) |
| **Total** | **141** | **~15 de 141 (cerca de 10%)** |

---

## 14. Proposta de fases de expansão

### Fase 1 — Ativar o que existe (bloqueio atual)
Corrigir os 3 problemas técnicos e ligar a integração já implementada. Pré-requisito para tudo mais.

### Fase 2 — Fechar o ciclo operacional
GPS dos técnicos, registro de produtos/serviços na tarefa, sincronização de tipos de tarefa dinamicamente do Auvo (em vez de hardcoded). Custo: algumas semanas de desenvolvimento.

### Fase 3 — Ciclo financeiro
Orçamento automático a partir de levantamento, nota fiscal, contas a receber, pesquisa de satisfação. Custo: projeto separado, provavelmente dentro do Sinérgica OS (meses 2-3 do contrato).

### Fase 4 — Gestão completa de campo
Service Orders com recorrência (preventivo sincronizado), hierarquia de equipamentos, controle de estoque por técnico, despesas. Custo: escopo avançado, fase final do Sinérgica OS.

---

## 15. Conclusão

O Fabrício construiu uma base sólida: a integração cobre os fluxos principais do dia a dia (sync de clientes e equipamentos, criar tarefas, receber eventos, importar checklists). A API do Auvo, porém, cobre um espectro muito maior que o operacional: tem GPS, financeiro completo (orçamento, NF, contas a receber), controle de estoque de campo, pesquisa de satisfação e ciclo preventivo com recorrência.

A integração atual usa cerca de 10% da capacidade disponível. As fases 2 e 3 resolveriam o problema de dupla entrada de dados (campo → escritório → financeiro) e automatizariam o ciclo do chamado até o faturamento, que hoje é manual.

Isso está mapeado e dimensionado para entrar no Sinérgica OS (contrato ativo) nas fases de construção e ativação.
