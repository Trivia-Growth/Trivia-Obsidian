# PCM Sinérgica: Análise de Integração com o Auvo

Data: 19 de junho de 2026
Preparado por: Trívia (JG) — uso interno e apresentação ao Fabrício Medeiros

---

## 1. Contexto

Durante o diagnóstico geral do sistema PCM (relatório de 18/06/2026), identificamos que a integração com o Auvo estava codificada mas nunca havia sido ativada em produção (zero registros nas tabelas de log). Com a decisão de avançar com o Auvo, fizemos uma análise técnica completa e detalhada de tudo que existe no código relacionado à integração.

Este documento apresenta o que encontramos, o que está pronto, o que está quebrado e o que precisa acontecer para ativar.

---

## 2. O que encontramos

A integração Auvo foi desenvolvida de forma significativamente mais completa do que o esperado. Ao analisar o código, banco de dados e funções de backend, encontramos:

- 8 funções de backend (Edge Functions) totalmente implementadas para comunicação com o Auvo
- Schema de banco de dados com todos os campos necessários para o vínculo entre as duas plataformas
- Tipagem de dados no frontend preparada para exibir e interagir com informações do Auvo
- 13 tipos de tarefa Auvo (preventiva, corretiva, inspeção, levantamento, emergencial) já mapeados no código

Em termos práticos: a integração não precisa ser construída. Ela precisa ser ligada.

---

## 3. O que está implementado e pronto

### 3.1 Sincronização de dados (Auvo → PCM)

| Função | O que faz | Status |
|---|---|---|
| Sync de clientes | Traz todos os clientes do Auvo e vincula aos clientes do PCM pelo CNPJ | Pronto |
| Sync de equipamentos | Traz os equipamentos cadastrados por cliente e armazena localmente | Pronto |
| Sync de técnicos | Traz os usuários e equipes cadastrados no Auvo | Com falha técnica |
| Sync de tarefas | Traz as ordens de serviço de um período e sincroniza com os chamados do PCM | Pronto |

### 3.2 Ações do PCM sobre o Auvo

| Função | O que faz | Status |
|---|---|---|
| Criar tarefa no Auvo | A partir de um chamado aberto no PCM, cria a tarefa correspondente no Auvo com todos os dados e faz a vinculação nos dois sistemas | Pronto |
| Atualizar orientação | Quando um chamado PCM é vinculado a uma tarefa Auvo, atualiza a descrição da tarefa no Auvo com a referência do chamado (CH-XXX) | Pronto |
| Importar questionário | Quando uma tarefa no Auvo é finalizada com questionário preenchido, importa os itens com "Não OK" e gera automaticamente itens de backlog no PCM com foto de evidência | Pronto |

### 3.3 Recepção de eventos em tempo real (Auvo → PCM via webhook)

O sistema está preparado para receber notificações automáticas do Auvo quando algo muda. Quando configurado, ele vai processar automaticamente:

- Criação ou atualização de clientes no Auvo: reflete no PCM
- Finalização de tarefa pelo técnico no campo: fecha o chamado no PCM, importa questionário se houver, dispara geração de relatório diário se for visita de ronda
- Atualização de equipamentos: mantém o cache local atualizado

---

## 4. O que está quebrado ou incompleto

### 4.1 Tabela de técnicos ausente no banco

A função de sincronização de técnicos existe e está implementada, mas a tabela de banco que ela precisa (`pcm_technicians`) nunca foi criada. Qualquer chamada para sincronizar técnicos resulta em erro.

Impacto: sem técnicos sincronizados, não é possível atribuir automaticamente o responsável de campo a um chamado aberto via Auvo.

Correção: criar a tabela via migration (trabalho de cerca de 10 minutos).

### 4.2 Webhook sem segredo configurado

O endpoint que recebe eventos do Auvo valida uma chave de segurança (`AUVO_WEBHOOK_SECRET`) para garantir que os eventos são legítimos. Essa chave não está configurada em produção. O sistema aceita qualquer chamada que chegue nesse endereço, sem verificar se veio de fato do Auvo.

Impacto: vulnerabilidade de segurança que permite injetar eventos falsos no sistema.

Correção: gerar um segredo, configurar no Supabase e registrar no painel Auvo.

### 4.3 Funções sem autenticação declarada

As 8 funções Auvo não têm a declaração de autenticação no arquivo de configuração do sistema. Dependendo de como são chamadas, podem estar expostas sem exigir login.

Correção: adicionar a declaração correta no arquivo de configuração (trabalho pontual).

---

## 5. O que a integração habilita, na prática

Quando ativada, a integração vai ligar os dois sistemas de forma bidirecional e automatizada:

**No dia a dia da equipe de campo:**
- O técnico abre o Auvo no celular, vê as tarefas do dia com todas as informações do chamado PCM já preenchidas (cliente, localização, descrição, prioridade)
- Ao finalizar a tarefa e preencher o checklist no Auvo, o chamado no PCM é fechado automaticamente, sem precisar de uma segunda entrada de dados
- Itens do checklist marcados como "Não OK" viram automaticamente backlog de pendências no PCM, com a foto de evidência vinculada

**Para o gestor no escritório:**
- O kanban de chamados no PCM reflete em tempo real o que está acontecendo no campo (técnico em deslocamento, em execução, finalizado)
- Link direto do chamado PCM para a tarefa no Auvo, e vice-versa
- Relatório diário gerado automaticamente ao fim da visita de ronda, consolidando tudo que foi registrado no Auvo

**Para o ciclo preventivo:**
- Equipamentos do Auvo sincronizados no PCM permitem planejar manutenções preventivas por equipamento, com histórico consolidado nos dois sistemas

---

## 6. O que precisa acontecer para ativar

### 6.1 Do lado técnico (Trívia faz)

Três correções antes de ligar qualquer coisa:

1. Criar a tabela de técnicos no banco (migration)
2. Declarar autenticação nas funções Auvo (config.toml)
3. Gerar e configurar o segredo do webhook (Supabase + Auvo)

Tempo estimado: 1 a 2 horas de trabalho técnico.

### 6.2 Do lado do Fabrício (precisamos dele)

**Imprescindível para começar:**

- API Key e API Token do Auvo: obtidos dentro do painel Auvo em Menu > Integração. São dois valores que identificam a Sinérgica na API e permitem que o PCM leia e escreva dados no Auvo.

- Acesso ao painel Auvo para registrar a URL do webhook: é um cadastro simples (URL de destino + escolha dos eventos), mas precisa ser feito por dentro da conta Auvo.

**Importante para o sync inicial:**

- Confirmação de quais clientes do PCM já existem no Auvo com o mesmo CNPJ. O sistema de sync usa o CNPJ como chave de vinculação. Se um cliente tiver CNPJ diferente nas duas plataformas, vai criar um registro duplicado em vez de vincular.

**Recomendação:** fazer o sync inicial em ambiente de teste ou com um cliente só antes de rodar em massa.

---

## 7. Sequência de ativação

Depois das correções técnicas e com as credenciais em mãos, a ativação segue esta ordem:

| Passo | O que é | Quem executa |
|---|---|---|
| 1 | Aplicar as correções técnicas (tabela, config, segredo) | Trívia |
| 2 | Fornecer API Key e API Token do Auvo | Fabrício |
| 3 | Sync inicial de clientes: vincular os clientes do Auvo aos do PCM | Trívia (execução) + Fabrício (validação) |
| 4 | Sync de técnicos: trazer usuários e equipes do Auvo | Trívia |
| 5 | Sync de equipamentos: trazer os equipamentos por cliente | Trívia |
| 6 | Registrar webhook no Auvo apontando para o PCM | Trívia + Fabrício (acesso ao painel) |
| 7 | Teste end-to-end: abrir chamado no PCM, ver tarefa no Auvo do técnico, finalizar, confirmar fechamento no PCM | Ambos |

---

## 8. Riscos e pontos de atenção

**Duplicidade no sync inicial:** se os dados (especialmente CNPJ de clientes) estiverem inconsistentes entre os dois sistemas, o primeiro sync pode criar duplicatas. Verificar antes de rodar em massa.

**Tipos de tarefa Auvo:** o PCM já tem 13 tipos de tarefa mapeados (Corretiva, Ar-Condicionado, Bomba, Quadro Elétrico, etc.). Esses IDs são específicos da conta Auvo da Sinérgica. Precisam ser confirmados por Fabrício para garantir que estão corretos antes de criar as primeiras tarefas via integração.

**Questionários do Auvo:** a importação automática de "Não OK" assume que os checklists do Auvo estão configurados com respostas no formato padrão. Checklists com texto livre ou formatos não convencionais podem não ser detectados corretamente.

**Volume de dados no sync:** dependendo de quantos clientes, equipamentos e tarefas históricos existem no Auvo, o sync inicial pode demorar. Recomendamos fazer por partes (cliente por cliente) na primeira vez.

---

## 9. Conclusão

A integração Auvo está implementada em profundidade: oito funções completas, banco preparado, tipos de dados mapeados. O que falta para ter os dois sistemas funcionando juntos são três correções técnicas (que a Trívia faz) e as credenciais de API e acesso ao painel Auvo (que precisam vir do Fabrício).

Quando ativada, a integração elimina a dupla entrada de dados entre PCM e Auvo, fecha chamados automaticamente ao fim do atendimento no campo e transforma os checklists de inspeção em backlog de manutenção de forma automática.

**Próximos passos imediatos:**
1. Fabrício confirmar interesse em ativar e fornecer credenciais Auvo
2. Trívia aplica as correções técnicas (pode ser feito em paralelo)
3. Agendar sessão conjunta para o sync inicial e registro do webhook
