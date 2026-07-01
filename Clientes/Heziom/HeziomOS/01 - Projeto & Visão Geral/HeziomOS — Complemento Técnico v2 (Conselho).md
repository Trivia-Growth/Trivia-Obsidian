---
tags: [heziom, arquitetura, segurança, lgpd, conselho, aprovado]
aliases: ["Escopo Tecnico", "Escopo Técnico"]
status: aprovado
criado: 2026-03
apresentado-a: Conselho Heziom
autor: Lucas (Tech Lead)
versão: v2.0
classificação: Confidencial
---

> ℹ️ Documento contratual/institucional do Conselho (mar/2026). Consolidou a nota bruta "Escopo Tecnico" (removida na limpeza de 2026-07-01; este é o texto limpo, e o alias `Escopo Tecnico` aponta para cá). Detalhes técnicos de deploy foram superados pela [[HeziomOS — Arquitetura v3]] e pelo estado real do código.

# HeziomOS — Complemento Técnico: Infraestrutura, Segurança e Confiabilidade

> Documento aprovado pelo Conselho da Heziom em março/2026.
> Complementa o Documento Executivo v1.0.
> **Referência canônica para decisões de stack, segurança e compliance.**

---

## 1. Stack Técnica e Decisões de Arquitetura

Critérios não negociáveis: **segurança por padrão**, **resiliência operacional**, **capacidade de evolução sem reescrita**.

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | React 18 + TypeScript | Tipagem estática, comportamento auditável para dados financeiros |
| Backend e lógica sensível | Deno (Edge Functions) | Server-side exclusivo, sem exposição de credenciais ao cliente |
| Banco de dados | PostgreSQL via Supabase na AWS | Redundância gerenciada, failover automático, backups diários, criptografia em repouso e em trânsito |
| Validação de dados | Zod (todas as Edge Functions) | Validação de schema em 100% das entradas, incluindo instruções aos agentes |
| Orquestração de agentes | Edge Functions + OpenRouter | Roteamento entre modelos sem vendor lock-in (Claude + GPT-4o avaliados) |
| Deploy | GitHub → Netlify (CDN) | Code splitting, lazy loading por rota, bundle analisado antes de release. Lovable usado como builder de desenvolvimento, deploy via GitHub + Netlify |
| Monitoramento | Audit logs + Web Vitals + alertas | Rastreabilidade completa de ações dos agentes |

**Princípio central:** *"Se o código fosse público amanhã, o sistema ainda estaria seguro."*

Filtro de decisão: componente reduz ou amplia superfície de ataque? Serverless elimina gestão de servidores expostos.

---

## 2. Segurança em Profundidade

Modelo de defesa em profundidade — cada camada se protege independentemente.

| Camada | Controles |
|---|---|
| **Frontend** | Validação Zod, sanitização DOMPurify, sem segredos no client, CSP + HTTP Security Headers |
| **Edge Functions** | JWT validado server-side (auth.getUser()), Zod em todo body, rate limiting por rota, CORS restritivo (domínio fixo em prod), logging estruturado com request ID |
| **Banco de dados** | RLS com FORCE em todas tabelas sensíveis, menor privilégio, views mascaradas para PII, SERVICE_ROLE_KEY exclusivamente em Edge Functions |
| **Infraestrutura** | HTTPS obrigatório + HSTS, env vars no cofre do provedor, auditoria de dependências pré-deploy, rotação de secrets documentada |

### Autenticação e Sessões
- Supabase Auth + JWT validado exclusivamente no backend
- Frontend NUNCA é fonte de verdade sobre identidade
- Acesso admin exige MFA
- Sessões invalidadas globalmente em caso de suspeita

### Proteção de Credenciais
- Chaves (Literarius, Meta Ads, WhatsApp API) = variáveis de ambiente no servidor
- Validadas na inicialização da aplicação
- Nenhuma credencial trafega por outra camada

### Rate Limiting
| Operação | Limite |
|---|---|
| Login | 5 tentativas / 15 min |
| API geral | 20 req/min por usuário |
| Operações financeiras | 3 tentativas / 5 min + bloqueio progressivo |
| IPs anômalos | Bloqueio automático |

### Auditoria
- Toda ação de agente IA registrada: timestamp, agente, dados consultados, resultado
- Retenção mínima: 12 meses
- Disponível para consulta pelo Conselho a qualquer momento
- Nenhum log contém senhas, tokens ou PII em texto claro

---

## 3. Controle de Acesso dos Agentes de IA

Escopo definido e limitado via **RLS com FORCE** no banco. Controle estrutural — persiste independentemente de qualquer camada acima.

| Perfil | Escopo |
|---|---|
| **Superagente executivo** | Leitura de todas as tabelas operacionais. Sem escrita direta |
| **Agente Financeiro** | R/W em A/P, A/R e conciliações. Sem acesso a CRM ou editorial |
| **Agente E-commerce** | R/W em leads, carrinhos, réguas. Sem acesso a financeiro ou fiscal |
| **Agente Atendimento** | Leitura de pedidos e políticas. Escrita restrita ao histórico de atendimento |
| **Agente Editorial** | R/W no pipeline editorial. Sem acesso a financeiro ou clientes |
| **Usuário financeiro** | Lançamento e consulta. Sem aprovação ou execução |
| **Diretores** | Aprovação de pagamentos exclusivamente via Internet Banking Santander |

> **Regra de ouro:** agentes propõem, humanos aprovam. Toda ação irreversível (pagamentos, cancelamentos, exclusão, comunicação em massa) exige aprovação explícita.

---

## 4. Integração Bancária e Fluxo de Pagamentos

**3 camadas independentes entre automação e dinheiro:**

```
HeziomOS (propõe) → Literarius (estrutura CNAB + transmite) → Santander (executa c/ 2 diretores)
```

- Execução financeira permanece no Literarius (integração CNAB ativa com Santander)
- HeziomOS **não tem acesso de execução** sobre pagamentos em nenhuma hipótese
- Agente financeiro identifica obrigações, reconhece padrões (fornecedores fixos, vencimentos, valores)
- Pode preparar fila autonomamente OU submeter para validação antes de enviar ao Literarius
- Liberação efetiva: 2 diretores no Internet Banking (fora de qualquer sistema interno)
- Nenhum agente IA participa das etapas de aprovação e execução

---

## 5. Conformidade com LGPD

Privacidade por padrão em todos os módulos.

### Base Legal
- **Clientes:** execução de contrato (pedidos/entregas/financeiro) + legítimo interesse (CRM, com opt-out)
- **Colaboradores:** obrigação legal + execução de contrato. Dados NUNCA usados para treinar modelos IA

### Direitos dos Titulares
- CRM incluirá exclusão e exportação de dados por titular (portabilidade + esquecimento)

### Fornecedores
- Supabase, AWS, OpenAI e Anthropic possuem DPA e são conformes com GDPR (cobre LGPD)

### DPO
- Encarregado de dados nomeado formalmente no início do projeto

---

## 6. Resiliência e Disponibilidade

Princípio: **Graceful Degradation** — nunca falha de forma opaca.

### Infraestrutura
- AWS via Supabase: redundância, failover automático, backups diários, point-in-time recovery
- SLA contratual: **99,99% uptime**

### Padrões Implementados

| Padrão | Implementação |
|---|---|
| Error Boundaries | Falha em um módulo não afeta os demais |
| Retry automático | TanStack Query: 2 retries + backoff exponencial |
| Graceful Degradation | Sistema externo fora → demais módulos operam normalmente (dados do último sync) |
| Fallback de modelos IA | OpenRouter roteia para modelo alternativo sem interrupção |
| Operações atômicas | requestId para idempotência em ações financeiras |
| Health checks | Edge Functions críticas com endpoint de health |
| Ambientes isolados | Produção e staging separados desde o início |

### Monitoramento
- Frontend: Error Boundaries + logging estruturado
- Edge Functions: logs `[FUNCAO][REQUEST_ID]`
- Web Vitals: LCP < 2,5s, INP < 200ms
- Alertas: mudança de saldo, acesso admin, rate limit atingido

---

## 7. IA Confiável: Controle e Precisão

- Agentes operam sobre **dados estruturados** (tabelas com schema, condições verificáveis)
- Perguntas tipo "qual o saldo da conta X no período Y" — não interpretam documentos vagos
- Toda instrução aos modelos passa por **validação e sanitização**
- Respostas incluem **fonte**: tabela, período, timestamp de extração
- **Testes de regressão** a cada atualização — desvios identificados antes de prod

---

## 8. Propriedade e Modelo de Manutenção

### Propriedade
- Código = **propriedade integral da Heziom**
- Repositório privado com acesso controlado
- Independente de relação comercial futura com equipe executora

### Custo Mensal Pós-Implantação

| Item | Custo |
|---|---|
| Infraestrutura (Supabase Pro + AWS/Vercel) | R$ 300–600/mês |
| Tokens IA (OpenAI/Anthropic) | até R$ 2.000/mês |
| **TOTAL** | **R$ 2.300–2.600/mês** |

### Suporte
- Manutenção corretiva **sem custo adicional por 2 anos** após implantação completa

---

## 9. Primeiros Passos Técnicos (Pós-Aprovação)

**3 primeiras semanas = base técnica antes de qualquer produto:**

1. Setup completo prod + staging (segurança, RLS, políticas desde o início)
2. Repositório + CI/CD + checklist de code review + auditoria de dependências
3. Início das integrações com APIs Literarius já mapeadas (Produtos, Estoque, Pedidos, NF)
4. **Dashboard Executivo operacional em até 30 dias**

---

*HeziomOS — Complemento Técnico v2.0 | Confidencial | Março/2026*
*Apresentado e aprovado pelo Conselho da Heziom*
