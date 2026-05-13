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
- [ ] Implementacao (proximo passo)

pasta para projeto git: /Users/lucasazevedo/Documents/GitHub/