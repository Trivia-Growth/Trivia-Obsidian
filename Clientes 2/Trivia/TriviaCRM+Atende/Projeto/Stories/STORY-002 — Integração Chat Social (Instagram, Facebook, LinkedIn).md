---
id: STORY-002
titulo: "Integração Chat Social — Instagram, Facebook e LinkedIn"
modulo: "Canais de Atendimento"
status: "backlog"
fase: 3
prioridade: 2
agente_responsavel: "—"
atualizado: 2026-05-05
---

# STORY-002 — Integração Chat Social (Instagram, Facebook, LinkedIn)

## Contexto

O TriviaCRM+Atende já possui integração com WhatsApp via Z-API. O objetivo desta story é expandir os canais de atendimento para Instagram DM, Facebook Messenger e LinkedIn Messages, permitindo que os atendentes interajam com leads e clientes de todas as redes sociais dentro da mesma plataforma.

---

## Objetivo

Permitir que equipes de atendimento recebam e respondam mensagens do Instagram, Facebook e LinkedIn diretamente na plataforma, com o mesmo nível de funcionalidade já existente para WhatsApp: histórico de conversa, atribuição a atendente, toggle IA/Humano/Pausado e vinculação ao CRM.

---

## Escopo (MVP desta story)

### Instagram DM
- [ ] Integração via **Meta Messaging API** (Instagram Basic Display + Webhooks)
- [ ] Recebimento de mensagens diretas (texto e imagens)
- [ ] Envio de respostas pela plataforma
- [ ] Criação automática de conversa e contato no CRM

### Facebook Messenger
- [ ] Integração via **Meta Messenger Platform** (Webhooks)
- [ ] Recebimento de mensagens do Messenger
- [ ] Envio de respostas
- [ ] Vínculo com contato/empresa existente no CRM

### LinkedIn (fase posterior — avaliar viabilidade)
- [ ] LinkedIn não possui API pública de DM para terceiros — avaliar alternativas (Sales Navigator API, parceria, ou extensão browser)
- [ ] Registrar como bloqueador técnico até definição

---

## Requisitos Técnicos

### Banco de Dados
- Adicionar `channel` enum: `whatsapp | instagram | facebook | linkedin`
- Alterar tabela `conversations` para incluir `channel` (com default `whatsapp`)
- Adicionar `social_accounts` por workspace (armazenar tokens OAuth por canal)
- RLS + FORCE obrigatório em todas as novas tabelas

### Edge Functions
- `meta-webhook` — recebe eventos do Instagram e Facebook Messenger (verificação + mensagens)
- `instagram-send` — envia mensagem via Instagram API
- `facebook-send` — envia mensagem via Facebook Messenger API
- JWT validado via `auth.getUser()` em todas as funções autenticadas
- Input validado com Zod

### Frontend
- Ícone de canal na lista de conversas e no header do chat (WhatsApp, Instagram, Facebook, LinkedIn)
- Configuração de contas sociais em Settings → Canais
- OAuth flow para conectar conta Instagram/Facebook do workspace

---

## Regras de Negócio

- Cada conversa tem um `channel` — não misturar canais numa mesma conversa
- O agente IA pode responder automaticamente em todos os canais quando `ai_mode='ai'`
- Atribuição de conversa funciona igual ao WhatsApp
- Contato criado automaticamente se não existir (por username ou e-mail)

---

## Questões Abertas (Bloqueadores)

| # | Questão | Impacto |
|---|---------|---------|
| 1 | LinkedIn não tem API pública de DM — definir abordagem | Bloqueia integração LinkedIn |
| 2 | Meta exige verificação de app para produção (Business Verification) — já feito? | Bloqueia Instagram + Facebook em produção |
| 3 | Tokens OAuth do Meta expiram — definir estratégia de refresh | Bloqueia estabilidade da integração |

---

## Critérios de Aceite

- [ ] Mensagens do Instagram DM aparecem na lista de conversas em tempo real
- [ ] Atendente consegue responder pelo chat panel sem sair da plataforma
- [ ] Mensagens do Facebook Messenger idem
- [ ] Canal é identificado visualmente na conversa
- [ ] Contato é criado/vinculado automaticamente no CRM
- [ ] Agente IA responde automaticamente quando `ai_mode='ai'`
- [ ] RLS verificado em todas as novas tabelas
- [ ] Edge Functions com Zod + JWT
- [ ] `npm test` passa sem erros
