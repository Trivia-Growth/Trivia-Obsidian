---
id: STORY-019
titulo: "Agentes como Personas — Identidade, Memória e Base de Conhecimento"
modulo: "Atendimento / IA"
status: "implementado"
fase: 7
prioridade: 1
agente_responsavel: "TRIVIAIOX"
atualizado: 2026-05-06
---

# STORY-019 — Agentes como Personas

## Contexto

Hoje os agentes de IA do sistema são genéricos e não têm identidade própria. Para um atendimento de qualidade, cada canal (número de WhatsApp) precisa de um agente com persona definida — nome, tom de voz, personalidade — além de memória de contexto e vínculo com bases de conhecimento específicas.

Cada número pode ter um **agente autônomo** diferente (responde sozinho) e um **copiloto** diferente (sugere respostas para o agente humano). Agentes são personas completas com três camadas: **Identidade**, **Memória** e **Conhecimento**.

## Arquitetura de Personas

```
Persona
├── Identidade: nome, avatar, tom, personalidade, idioma, horário de atuação
├── Memória: contexto de conversas anteriores, fatos aprendidos por contato
└── Conhecimento: bases de conhecimento vinculadas (FAQs, docs, produtos)
```

## O que fazer

### Migrations

**Personas:**
- [ ] Criar tabela `agent_personas` (id, workspace_id, name, avatar_url, tone, personality_prompt, language, active_hours_json, is_active, created_at)
  - `tone`: ex. `formal`, `amigavel`, `tecnico`, `vendedor`
  - `personality_prompt`: system prompt base da persona (ex. "Você é a Ana, assistente da Empresa X, sempre gentil e objetiva...")
  - `active_hours_json`: horários em que este agente responde automaticamente

**Vínculo por Número:**
- [ ] Adicionar colunas em `whatsapp_numbers` (ou tabela equivalente):
  - `agent_persona_id` (FK → agent_personas) — agente autônomo deste número
  - `copilot_persona_id` (FK → agent_personas) — copiloto deste número
  - Ambos opcionais: se null, usa comportamento padrão do workspace

**Memória por Contato:**
- [ ] Criar tabela `agent_memory` (id, persona_id, contact_id, workspace_id, memory_type, content, created_at, expires_at)
  - `memory_type`: `fact` (dado explícito aprendido), `preference`, `context` (resumo de conversa anterior)
  - Memória tem TTL configurável (ex. `fact` = 1 ano, `context` = 30 dias)
- [ ] Cron diário para limpar memórias expiradas

**Base de Conhecimento:**
- [ ] Criar tabela `knowledge_bases` (id, workspace_id, name, description, created_at)
- [ ] Criar tabela `knowledge_documents` (id, knowledge_base_id, title, content, content_type, embedding_vector, created_at)
  - `content_type`: `text`, `url`, `pdf`, `faq`
  - `embedding_vector`: para busca semântica (pgvector)
- [ ] Criar tabela `persona_knowledge_bases` (persona_id, knowledge_base_id) — N:N, quais KBs a persona usa
- [ ] RLS: workspace_members vêem apenas KBs do próprio workspace; admin pode editar; agent pode ler

### Edge Functions

**manage-personas (nova):**
- [ ] CRUD completo de personas: criar, editar, listar, ativar/desativar
- [ ] `POST /manage-personas/{id}/test` → testa a persona com uma mensagem de exemplo, retorna resposta gerada

**manage-knowledge-bases (nova):**
- [ ] CRUD de bases de conhecimento e documentos
- [ ] `POST /manage-knowledge-bases/{id}/ingest` → processa documento, gera embeddings e armazena
- [ ] Suporta: texto livre, URL (scraping básico), FAQ (pares pergunta/resposta)

**agent-chat (nova ou evolução do existente):**
- [ ] Ao gerar resposta, resolver qual persona usar (via número → persona_id)
- [ ] Construir context window: system prompt da persona + memórias relevantes do contato + documentos da KB via RAG
- [ ] Após resposta: extrair e salvar fatos relevantes na `agent_memory` (ex. "usuário preferiu contato por WhatsApp")
- [ ] Para copiloto: retorna 2-3 sugestões rankeadas por relevância (não envia automaticamente)

### Frontend — Configuração de Personas (/settings/personas)

**Lista de Personas:**
- [ ] Cards com avatar, nome, tom, status (ativo/inativo), quantos números vinculados
- [ ] Botão "Nova Persona" → formulário completo

**Formulário de Persona:**
- [ ] Nome e avatar (upload ou emoji)
- [ ] Tom de voz: select (formal, amigável, técnico, vendedor)
- [ ] Personality Prompt: textarea com preview e dicas
- [ ] Idioma e horário de atuação
- [ ] Seção "Bases de Conhecimento": checklist das KBs disponíveis para vincular
- [ ] Botão "Testar Persona": caixa de chat simulado

**Gestão de Bases de Conhecimento (/settings/knowledge-bases):**
- [ ] Lista de KBs com: nome, documentos, personas que usam
- [ ] CRUD de KBs
- [ ] Dentro de cada KB: lista de documentos com status de ingestão (pendente/processado/erro)
- [ ] Formulário de documento: texto livre, URL, ou upload de FAQ (formato JSON/CSV)

**Vínculo por Número (/settings/channels ou equivalente):**
- [ ] Para cada número WhatsApp, selects: "Agente Autônomo" e "Copiloto" (ambos opcionais, com opção "Nenhum")
- [ ] Preview: "Este número usa [Ana] como agente autônomo e [Max] como copiloto"

**Memória por Contato (Ficha do Contato):**
- [ ] Seção "Memória do Agente": lista fatos e contextos salvos sobre o contato
- [ ] Permite ao admin editar ou deletar memórias individualmente

### Copiloto no Chat

- [ ] Na tela de conversa: painel lateral "Sugestões do Copiloto" com 2-3 respostas geradas
- [ ] Botão "Usar esta resposta" → copia para o campo de digitação (agente humano pode editar antes de enviar)
- [ ] Feedback: thumbs up/down em cada sugestão (melhora o rankeamento futuro)

## Critérios de Aceite

- [ ] Admin consegue criar persona com nome, tom, personality prompt e vincular KBs
- [ ] Número WhatsApp pode ter persona de agente e copiloto diferentes
- [ ] Agente autônomo usa personality prompt + memória + RAG da KB ao responder
- [ ] Copiloto exibe sugestões no chat sem enviar automaticamente
- [ ] Fatos extraídos de conversas salvos em `agent_memory` e visíveis na ficha do contato
- [ ] Documentos da KB processados com embeddings funcionais para busca semântica
- [ ] `npm run build` sem erros, TypeScript strict

## Dependências

- pgvector habilitado no Supabase (verificar se já está ativo)
- Modelo de IA: OpenAI / Anthropic Claude (configuração de provider no workspace)
- STORY-016 para estrutura de audit_log

## Notas de Complexidade

Esta é a story mais complexa do backlog. Recomenda-se decompor em sub-tasks na sprint:
1. Sprint A: Migrations + CRUD de Personas + Vínculo por Número
2. Sprint B: Bases de Conhecimento + Ingestão + RAG básico
3. Sprint C: Memória por Contato + extração automática de fatos
4. Sprint D: Copiloto no Chat + Feedback
