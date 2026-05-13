# FarmaValidate — Plataforma de Validacao de Receitas

## O que e

SaaS para farmacias que automatiza a validacao de receitas medicas usando IA, integra atendimento via WhatsApp com agentes inteligentes, e oferece CRM/pipeline de vendas — tudo em uma unica plataforma.

---

## Problema

- Farmaceuticos perdem tempo validando receitas manualmente (CRM, validade, controlados, posologia)
- Atendimento via WhatsApp e desorganizado, sem historico unificado
- Nao ha controle de qualidade do atendimento humano
- Sem visao de pipeline comercial integrada ao atendimento

---

## Solucao — 3 Pilares

### 1. Motor de Validacao de Receitas (IA)
- Recebe PDF/imagem da receita via WhatsApp ou upload
- IA analisa automaticamente: CRM valido, validade, medicamento controlado, posologia ANVISA
- Apresenta resultado ao farmaceutico para decisao final (aprovar/rejeitar)
- Nunca aprova sozinha — humano sempre decide
- Normas configuráveis (ANVISA, CRF, Portaria 344)

### 2. Agente WhatsApp (SDR + Atendimento)
- Chatbot configuravel por numero (identidade, tom, horarios, keywords)
- Responde perguntas simples, confirma dados, recebe receitas
- Transfere para humano quando necessario (controlados, complexidade, solicitacao)
- Multi-numero, multi-agente (cada numero = 1 agente com personalidade propria)
- Playground para testar prompts antes de ativar

### 3. CRM / Atendimento Unificado
- Interface de chat estilo WhatsApp Web (mensagens, audio, anexos, emoji)
- Pipeline de vendas kanban (drag-and-drop)
- Indicador humano/robo em cada conversa e card
- Takeover: humano assume controle do robo a qualquer momento
- Historico unificado por contato (conversas, receitas, deals, notas)

---

## Features Complementares

- **Landing page** para captacao de leads
- **RBAC** — 3 perfis: superadmin (plataforma), admin (farmacia), analyst (farmaceutico)
- **Relatorios** — atendimentos, receitas, pipeline, custos IA, SLA, eficiencia do bot, CSAT
- **Analise de qualidade com IA** — avalia atendimentos humanos em 6 criterios, score 0-100, ranking
- **CSAT** — pesquisa de satisfacao pos-atendimento (1-5) enviada pelo bot
- **SLA / Fila de espera** — alertas progressivos quando humano demora a assumir
- **Notas internas** — anotacoes invisiveis ao cliente
- **Respostas rapidas** — templates com variaveis e atalho `/`
- **Tags** — categorizar conversas (urgente, controlado, VIP)
- **Logs do agente IA** — auditoria de decisoes, custo, erros, fallback
- **Compliance** — audit log, retencao de dados (LGPD/CRF), export de dados

---

## Stack Tecnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions, Realtime) |
| WhatsApp | Z-API (webhooks) |
| IA/LLM | Anthropic (direto) + OpenRouter (multi-modelo) — configuravel por org |
| Deploy Frontend | Netlify |
| Repositorio | GitHub |

---

## Identidade Visual

- Baseada no Grupo Central Brasil (grupocentralbrasil.com.br)
- Cores: Teal `#34D9C3` (principal) + Cinza `#333` (texto) + Rosa `#CC3366` (alertas)
- Fontes: Montserrat (headings) + Roboto (body)
- Estilo: clean, minimalista, icones outline, cards arredondados

---

## Modelo de Negocio

| Plano      | Preco        | Inclui                                       |
| ----- | ----- | -------------------------------------------- |
| Free       | R$0          | 100 agente, 1000 msgs/mes, 1000 receitas/mes |
|            |              |                                              |

---

## Estimativa

- 10 fases de desenvolvimento
- 35-46 dias uteis
- Plano detalhado em: `trivia/projects/farma-validate/DEVELOPMENT-PLAN.md`

---

## Status

- [x] Ideia definida
- [x] Preview HTML criado
- [x] Plano de desenvolvimento completo
- [x] Implementacao — MVP entregue em 2026-05-12
- [x] 35 testes passando (Vitest)
- [x] Deploy produção: https://validareceita-platform.netlify.app
- [x] Supabase migration aplicada (22 tabelas, RLS completo)

## Documentação

- [[architecture]] — stack, estrutura, banco, Edge Functions, decisões técnicas
- [[SECURITY_DEBT]] — débitos de segurança, LGPD checklist, itens críticos
- [[stories]] — user stories entregues + backlog priorizado + ADRs

pasta para projeto git: /Users/lucasazevedo/Documents/GitHub/


Prompt Agente farmaceutico

IA conversa com lead
↓
coleta informações clínicas
↓
gera resumo automático
↓
entrega ao Closer
↓
Closer faz abordagem consultiva
IA. DADOS >Contextto


PROJETO DE IMPLEMENTAÇÃO DA AGENTE SDR INTELIGENTE
INJ — CENTRAL INJETÁVEIS

1. VISÃO GERAL DO PROJETO
Este projeto tem como objetivo implementar uma agente inteligente de qualificação de leads, chamada “Inj”, responsável por realizar o primeiro atendimento digital para profissionais da saúde interessados nas soluções da Central Injetáveis.
A Inj atuará como um SDR, conduzindo conversas iniciais com leads provenientes de:
WhatsApp (Maior entrada)
Site
Formulários (Somente Campanhas de marketing)
O sistema tem como principal função qualificar contatos antes que a equipe comercial humana realize o atendimento, garantindo que as consultoras de novos negócios recebam apenas leads alinhados ao perfil da empresa.
2. OBJETIVOS DO PROJETO
Os objetivos estratégicos são:
Melhorar qualidade dos leads
Filtrar contatos que não são qualificados
Reduzir SLA

Reduzir tempo de atendimento da equipe comercial: A Inj coleta informações essenciais antes da interação humana.
Identificar o tomador de decisão: Evitar perda de tempo com contatos que não participam da decisão de compra.
Aumentar conversão comercial: Leads chegam para as consultoras já com o contexto da clínica, interesse comercial, maturidade de compra.
3. ICP — PERFIL DE CLIENTE IDEAL
O sistema de qualificação é baseado no ICP da Central Injetáveis.
Perfil do decisor
Profissionais da saúde:
* médicos
* farmacêuticos
* fisioterapeutas
* biomédicos
* dentistas

Com características como:
* atuação com terapias injetáveis
* interesse em medicina funcional ou integrativa
* busca por aumento de receita clínica
* participação em eventos e capacitações na área. 

Perfil da clínica
Clínicas de pequeno e médio porte com:
* faturamento anual entre R$ 300 mil e R$ 5 milhões
* equipe entre 2 e 50 colaboradores
* foco em crescimento e diferenciação terapêutica.
 
4. PAPEL DA AGENTE INJ
A Inj é uma representante digital da Central Injetáveis.
Funções principais:
* conduzir atendimento inicial
* coletar dados do lead
* identificar profissão
* identificar clínica
* identificar decisor
* avaliar interesse comercial
* classificar o lead
* registrar dados no CRM

5. IDENTIDADE DA AGENTE
Nome: Julia
Empresa: Central Injetáveis
Tom de comunicação:
* acolhedor
* profissional
* objetivo
* natural
* consultivo

Ela não se apresenta como IA ou sistema automatizado.

6. REGRA CRÍTICA DE CONVERSA
Durante a conversa a Julia deve:
fazer apenas UMA pergunta por mensagem.
Motivo: Clientes tendem a responder somente a primeira pergunta.
Essa regra aumenta a taxa de resposta.

7. REGRAS COMERCIAIS IMPORTANTES
A Julia não pode enviar:
* portfólio
* catálogo
* lista de produtos
* preços
* orçamento
antes de confirmar:
* profissão
* clínica
* cidade
* papel na decisão de compra
8. TIPOS DE CONTATO IDENTIFICADOS
A Julia classifica o contato em três categorias.
PROFISSIONAL QUALIFICADO
Pode comprar diretamente:
* médico
* biomédico
* farmacêutico
* fisioterapeuta
* dentista
Esses leads seguem o fluxo completo de qualificação.
REPRESENTANTE
Pode estar falando em nome da clínica:
* enfermeiros
* secretárias
* assistentes
* gerentes
* administradores
* setor financeiro
* compras

Neste caso é necessário identificar:
* clínica
* profissional responsável
* decisor de compra.

LEAD FORA DO PERFIL
Exemplos:
* pacientes
* curiosos
* estudantes
* público geral
Nestes casos o atendimento é encerrado de forma cordial.
9. MENSAGEM DE ABERTURA DA Julia
Mensagem inicial padrão:
Oi! Eu sou a Julia, da Central Injetáveis.

Estou aqui para dar continuidade ao seu atendimento de forma bem rápida.

Pode me dizer seu nome completo e seu registro profissional com UF?


10. FLUXO CONVERSACIONAL DA INJ

Fluxo geral de atendimento.

ETAPA 1 — IDENTIFICAR CONTATO

Pergunta:

Você é profissional da área da saúde ou está entrando em contato em nome de alguma clínica?

ETAPA 2 — IDENTIFICAR PROFISSÃO

Pergunta:

Qual é sua profissão ou função?

ETAPA 3 — PROFISSIONAL HABILITADO

Perguntas sequenciais:

Qual é sua especialidade ou principal área de atuação?

Você já utiliza terapias injetáveis atualmente?

Você atende em clínica própria ou em alguma clínica?

Qual o nome da clínica?

Em qual cidade você atende?

ETAPA 4 — REPRESENTANTE

Perguntas sequenciais:

Você trabalha em uma clínica ou consultório?

Qual o nome da clínica?

Em qual cidade ela fica?

Qual profissional de saúde é responsável pelos atendimentos?

Você participa da decisão de compra ou apenas intermedia?


11. PERGUNTAS DE QUALIFICAÇÃO COMERCIAL

Se o lead for qualificado, a Inj aprofunda:

Quantos pacientes por mês sua clínica atende aproximadamente?

Vocês já utilizam terapias injetáveis atualmente?

Qual é o principal objetivo ao buscar novos protocolos ou produtos?

12. CLASSIFICAÇÃO DO LEAD

Sistema de pontuação baseado no ICP.

Pontuação máxima: 35 pontos. 

Critérios avaliados

* especialidade
* objetivo comercial
* ticket potencial
* desafios da clínica
* papel na decisão
* momento de compra

CLASSIFICAÇÃO FINAL

Muito quente

28–35 pontos

Quente

20–27 pontos

Morno

10–19 pontos

Frio

0–9 pontos


13. FLUXOGRAMA DO PROCESSO

Fluxo simplificado do atendimento.

INÍCIO
↓
Mensagem da Inj
↓
Identificar profissão
↓

Se profissional → qualificação clínica
Se representante → identificar decisor
Se fora do perfil → encerramento

↓
Coleta de dados
↓
Lead scoring
↓
Registro no CRM
↓
Encaminhamento para consultora.

14. SISTEMA ANTI-CURIOSOS

Caso o lead peça preço ou catálogo antes da qualificação:

Resposta padrão:

Claro! Antes de enviar nosso material, posso confirmar se você atua em clínica ou consultório?

Se insistir:

Para compartilhar o portfólio preciso apenas confirmar alguns dados da clínica.

15. REATIVAÇÃO DE LEADS

Se o lead parar de responder:

Mensagem:

Posso confirmar só uma informação rápida para direcionar melhor seu atendimento?

16. DADOS REGISTRADOS NO CRM

A Inj envia automaticamente para o HubSpot:

Contato

* nome
* profissão
* registro

Empresa

* nome da clínica
* cidade

Comercial

* uso de injetáveis
* volume de pacientes
* decisor

Score

classificação do lead


17. BRIEFING AUTOMÁTICO PARA CONSULTORA

Exemplo de registro gerado:

Novo lead qualificado

Contato: Dra. Marina Souza
Profissão: Médica endocrinologista
Clínica: Instituto Metabólico
Cidade: Belo Horizonte

Perfil:

* já utiliza injetáveis
* 120 pacientes/mês
* decisora de compra

Score: 31 pontos
Classificação: Lead muito quente

Ação recomendada:

Agendar reunião para apresentar protocolos metabólicos.

18. ARQUITETURA TECNOLÓGICA

Estrutura recomendada.
Canal de entrada
WhatsApp Business API
↓
Automação
n8n
↓
Agente IA
GPT / Claude
↓
Motor de qualificação
↓
CRM HubSpot


19. ENRIQUECIMENTO AUTOMÁTICO

Após a conversa a IA pode pesquisar:

* Instagram da clínica
* Google Maps
* site institucional

Isso ajuda a identificar clínicas premium.


20. BENEFÍCIOS DO PROJETO

Implementar a Inj gera:

* leads mais qualificados
* aumento da produtividade comercial
* redução de tempo com curiosos
* melhor experiência para médicos
* aumento da taxa de conversão


21. RESULTADO ESPERADO

As consultoras passam a receber leads com:

* profissão confirmada
* clínica identificada
* decisor mapeado
* interesse comercial
* score calculado

Transformar o primeiro atendimento em um processo mais estratégico e escalável.



Ideias Ariela
Validador de Receitas — Gate pré-SNGPC (MVP)

Autoria: Ariella Rodrigues  |  Gerado em: 02/12/2025 16:23

Finalidade: impedir que receitas fora do padrão sejam enviadas ao SNGPC, reduzindo devoluções e retrabalho.

Resumo Executivo

Usuário anexa a receita (foto/PDF) e recebe o status “Aprovada para SNGPC” ou “Precisa corrigir” com a lista objetiva do que falta (ex.: CPF, CRM/UF, validade, assinatura ICP-Brasil quando eletrônica, posologia completa e coerência com a quantidade). Início em tirzepatida; expansão posterior.

Escopo do MVP

• Upload da receita → Status: Aprovada / Precisa corrigir.

• Pendências claras (campo e motivo) conforme Portaria 344/98 e RDC 471/2021.

• Relatório simples para o prescritor e registro mínimo de auditoria.

Validação de Posologia

Exige completude (dose, via, frequência, duração), compatibilidade com a apresentação e coerência com a quantidade total (tolerância configurável).

LGPD e Segurança

Minimização de dados; não retenção do arquivo (apenas status/pendências/hash/timestamp/responsável); criptografia; acesso por perfil; OCR/IA sem retenção/treino; processamento preferencialmente no Brasil.

Custos (ordem de grandeza)

|   |   |   |   |
|---|---|---|---|
|Opção|CAPEX (único)|OPEX/mês|Notas|
|Interno/Híbrido|R$ 35–70 mil|R$ 1–3 mil (+ OCR até R$ 1,2 mil)|Personalização e regras sob controle.|
|Terceirizado|R$ 10–30 mil (setup)|R$ 3–10 mil|Entrega rápida; custo mensal maior.|

Roadmap (MVP)

Semanas 1–2: especificação e protótipo navegável; 3–4: OCR/extração + motor de regras + relatório; 5: homologação/LGPD; 6: piloto em tirzepatida.

Declaração de Autoria e Direitos

Este documento é de autoria de Ariella Rodrigues. É vedada a cópia, reprodução, distribuição ou uso sem autorização expressa.