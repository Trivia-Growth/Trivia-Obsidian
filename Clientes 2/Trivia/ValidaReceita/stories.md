# ValidaReceita — User Stories & Feature Backlog

> **Criado em:** 2026-05-12  
> **Status do MVP:** Entregue e deployado

---

## Épicos Entregues no MVP

### EP-01 — Autenticação e RBAC
- [x] US-01: Como farmacêutico, posso fazer login com email/senha
- [x] US-02: Como admin, posso resetar minha senha por email
- [x] US-03: Como sistema, acesso é bloqueado para roles insuficientes (ProtectedRoute)
- [x] US-04: Como superadmin, tenho acesso a tudo; como analyst, acesso limitado
- [x] US-05: Como usuário logado, vejo sidebar filtrado pelas minhas permissões

### EP-02 — Validação de Receitas
- [x] US-10: Como farmacêutico, posso fazer upload de PDF/imagem de receita
- [x] US-11: Como farmacêutico, recebo análise automática de IA (CRM, validade, controlado, posologia)
- [x] US-12: Como farmacêutico, posso aprovar ou rejeitar uma receita com observação
- [x] US-13: Como farmacêutico, vejo score de conformidade (0-100) e lista de problemas
- [x] US-14: Como farmacêutico, posso filtrar receitas por status (pendente, aprovada, rejeitada)

### EP-03 — Agente WhatsApp (SDR)
- [x] US-20: Como admin, posso criar um agente com identidade, tom e número WhatsApp
- [x] US-21: Como admin, posso configurar knowledge base e regras de comportamento
- [x] US-22: Como admin, posso definir horários de funcionamento por dia da semana
- [x] US-23: Como admin, posso testar o agente no Playground antes de ativar
- [x] US-24: Como sistema, webhook Z-API processa mensagens inbound e dispara agente

### EP-04 — CRM e Chat
- [x] US-30: Como farmacêutico, vejo lista de conversas com preview da última mensagem
- [x] US-31: Como farmacêutico, posso assumir controle de uma conversa (bot → humano)
- [x] US-32: Como farmacêutico, posso devolver controle ao bot (humano → bot)
- [x] US-33: Como farmacêutico, posso resolver uma conversa
- [x] US-34: Como farmacêutico, posso adicionar notas internas (invisíveis ao cliente)
- [x] US-35: Como farmacêutico, vejo indicador bot/humano em cada conversa

### EP-05 — Pipeline de Vendas
- [x] US-40: Como farmacêutico, vejo deals organizados em kanban com 6 estágios
- [x] US-41: Como farmacêutico, posso arrastar deals entre estágios (drag-and-drop)
- [x] US-42: Como farmacêutico, vejo valor formatado em BRL por deal e total por coluna

### EP-06 — Relatórios
- [x] US-50: Como admin, vejo relatório de atendimentos por período (volume, SLA, CSAT)
- [x] US-51: Como admin, vejo relatório de receitas validadas (aprovadas vs rejeitadas)
- [x] US-52: Como admin, vejo relatório de pipeline (conversão por estágio)
- [x] US-53: Como admin, vejo custo de IA acumulado (tokens, USD, por função)

### EP-07 — Qualidade com IA
- [x] US-60: Como admin, posso solicitar análise de qualidade de um atendimento humano
- [x] US-61: Como admin, vejo score 0-100 em 6 critérios com radar chart
- [x] US-62: Como admin, vejo pontos fortes e sugestões de melhoria gerados pela IA

### EP-08 — Configurações
- [x] US-70: Como admin, posso configurar provider de IA (Anthropic/OpenRouter), modelo e orçamento mensal
- [x] US-71: Como admin, posso configurar SLA (tempo de primeira resposta e resolução)
- [x] US-72: Como admin, posso criar respostas rápidas com shortcut e conteúdo

---

## Backlog — Próximas Iterações

### Prioridade Alta (P0)

- [ ] US-80: **2FA obrigatório para admin/superadmin** — segurança crítica
- [ ] US-81: **Validação de tipo real de arquivo** — verificação de magic bytes no Edge Function
- [ ] US-82: **Rate limiting nas Edge Functions** — previne dreno de orçamento IA
- [ ] US-83: **Audit log populado automaticamente** — LGPD compliance
- [ ] US-84: **Job de retenção de dados** — `cleanup-expired-data` com pg_cron

### Prioridade Média (P1)

- [ ] US-90: **Convite de usuário por email** — admin convida analyst via link tokenizado
- [ ] US-91: **Criptografia real de API keys** — usar Supabase Vault ou pgcrypto
- [ ] US-92: **CSP headers no Netlify** — `netlify.toml` com Content-Security-Policy
- [ ] US-93: **Webhook Z-API com autenticação** — verificar token no header
- [ ] US-94: **Export de dados por contato** — LGPD direito de portabilidade
- [ ] US-95: **Soft-delete de contatos** — LGPD direito de exclusão
- [ ] US-96: **CSAT pós-atendimento** — envio automático de pesquisa 1-5 após resolução

### Prioridade Baixa (P2)

- [ ] US-100: **Tags em conversas** — categorizar como urgente, controlado, VIP
- [ ] US-101: **Respostas rápidas com shortcut `/`** — autocomplete no input de chat
- [ ] US-102: **Busca global** — pesquisar contato, conversa, receita por nome/número
- [ ] US-103: **Multi-idioma** — internacionalização (pt-BR / es)
- [ ] US-104: **Landing page pública** — captação de leads para o SaaS
- [ ] US-105: **Planos e billing** — Free, Pro, Enterprise com limites por org
- [ ] US-106: **Notificações em tempo real** — toast/badge quando chega nova mensagem
- [ ] US-107: **Histórico unificado por contato** — conversas + receitas + deals em um perfil
- [ ] US-108: **Fila de espera com SLA visual** — alerta progressivo (amarelo/vermelho) na lista de conversas
- [ ] US-109: **Integração Z-API real em produção** — configurar token real e testar end-to-end

---

## ADRs (Architecture Decision Records)

### ADR-001: Tailwind v4 sem config file
**Decisão:** Usar `@theme { }` em `globals.css` em vez de `tailwind.config.js`.  
**Motivo:** Tailwind v4 deprecou o config file. CSS custom properties são mais composable e evitam a camada extra de JavaScript.  
**Trade-off:** Menos exemplos na web ainda (ecossistema ainda em adoção).

### ADR-002: Dual LLM provider (Anthropic + OpenRouter)
**Decisão:** Org escolhe provider e modelo em Settings → IA.  
**Motivo:** Anthropic é mais preciso para análise de receitas; OpenRouter abre opções de modelo mais barato para respostas de chat.  
**Trade-off:** Complexidade extra em `_shared/llm.ts`; testado com mock.

### ADR-003: TanStack Query como única source of truth para server state
**Decisão:** Supabase Realtime apenas invalida o cache do TanStack Query — não mantém estado local de mensagens.  
**Motivo:** Evita duas fontes de verdade. Mensagens são sempre buscadas do Postgres, não de um array local.  
**Trade-off:** Fetch extra após cada evento Realtime (aceitável dado tamanho dos payloads).

### ADR-004: RLS como primeira linha de defesa
**Decisão:** Toda política de multi-tenancy está no Postgres via RLS com `my_org_id()`.  
**Motivo:** Frontend pode ser bypassado; banco não. RBAC na UI é UX, não segurança.  
**Trade-off:** Debug de RLS é mais difícil; requer testes diretos no SQL.

### ADR-005: Mock mode para IA em dev
**Decisão:** `VITE_MOCK_LLM=true` / `MOCK_LLM=true` retorna resposta estática em dev.  
**Motivo:** Evitar custo e latência de IA durante desenvolvimento. CI/CD pode rodar sem credenciais reais.  
**Trade-off:** Testes não cobrem qualidade real das respostas da IA.
