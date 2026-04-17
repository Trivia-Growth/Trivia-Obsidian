# Equipe de Agentes AIOX

12 agentes especializados. Cada um tem sua autoridade e não invade o papel do outro.

---

## Visão Geral da Equipe

| Agente | Papel | Quando Usar |
|--------|-------|------------|
| `@aiox-master` | Orquestrador geral | Configurar equipes, resolver conflitos entre agentes |
| `@po` | Product Owner | Definir requisitos, priorizar backlog, refinar produto |
| `@sm` | Scrum Master | Criar e gerir stories, facilitar sprint, remover bloqueios |
| `@architect` | Arquiteto | Decisões técnicas, design de sistema, ADRs |
| `@dev` | Desenvolvedor | Implementar código, escrever testes, refatorar |
| `@qa` | Quality Assurance | Validar critérios de aceite, gate de qualidade |
| `@devops` | DevOps | CI/CD, infraestrutura, deploy, monitoramento |
| `@data-engineer` | Engenheiro de Dados | Schema Supabase, migrations, RLS, sync scripts |
| `@ux-design-expert` | UX/UI | Design de interface, componentes, acessibilidade |
| `@analyst` | Analista | Pesquisa, documentação, análise de dados |
| `@pm` | Project Manager | Roadmap, milestones, comunicação com stakeholders |
| `@squad-creator` | Criador de Squads | Montar equipe pré-configurada para um projeto |

---

## Detalhes por Agente

### `@sm` — Scrum Master (uso mais frequente)
**O que faz:** Cria stories a partir de requisitos do piloto. Preenche contexto, spec de referência e critérios de aceite. Gerencia o status das stories no vault.

**Quando usar:**
- "Quero criar uma story para o módulo de pagamentos"
- "Mova todas as stories do sprint 2 para o backlog"
- "O que está bloqueado no sprint atual?"

---

### `@dev` — Desenvolvedor (uso mais frequente)
**O que faz:** Lê a story, propõe o Diff Plan, aguarda OK, implementa. Atualiza a seção "Implementação" da story com arquivos alterados. Segue Bulletproof React, TypeScript strict, sem extras.

**Quando usar:**
- "Implemente a STORY-004"
- "Existe um bug no componente X, corrija"

**Regra importante:** `@dev` nunca implementa sem Diff Plan aprovado.

---

### `@qa` — QA (uso mais frequente)
**O que faz:** Valida cada critério de aceite da story. Verifica segurança (RLS, JWT, Zod). Preenche o gate (PASS/CONCERNS/FAIL). Se PASS, muda status para `em-review` ou `concluido`.

**Quando usar:**
- "Faça o QA da STORY-004"
- "Revise a segurança do módulo de pagamentos"

---

### `@architect` — Arquiteto
**O que faz:** Toma decisões técnicas e documenta ADRs (Architecture Decision Records). Avalia trade-offs. Revisão de pull requests complexos. Não escreve código de feature.

**Quando usar:**
- "Como devo estruturar a integração com a API da Tray?"
- "Avalie se devemos usar Realtime ou polling para o dashboard"

---

### `@data-engineer` — Engenheiro de Dados
**O que faz:** Cria e mantém o schema do Supabase. Escreve migrations. Configura RLS e policies. Cria scripts de sincronização com bancos legados (Deno).

**Quando usar:**
- "Crie a tabela de pedidos no Supabase com RLS"
- "Escreva o script Deno para sincronizar o Literarius"

---

### `@po` — Product Owner
**O que faz:** Refina requisitos com o piloto. Escreve user stories de alto nível. Prioriza o backlog. Garante que o que está sendo construído resolve o problema real.

**Quando usar:**
- "Preciso mapear os requisitos para o módulo de comissões"
- "Ajude-me a priorizar as features para o próximo trimestre"

---

### `@devops` — DevOps
**O que faz:** Configura CI/CD no GitHub Actions. Deploy no Netlify. Variáveis de ambiente. Monitoramento. Security headers no `netlify.toml`.

**Quando usar:**
- "Configure o pipeline de deploy automático"
- "Adicione os security headers no Netlify"

---

### `@ux-design-expert` — UX/UI
**O que faz:** Design de interfaces. Componentes shadcn/ui. Acessibilidade. Decisões de layout. Mockups em texto (não gera imagens).

**Quando usar:**
- "Como devo organizar o dashboard do CEO?"
- "Revise a usabilidade do formulário de pagamento"

---

## Squads Pré-configuradas

O `@squad-creator` pode montar uma equipe para o projeto. Exemplo:

**Squad Fase 1 — Visibilidade:**
- `@sm` para gerenciar stories
- `@data-engineer` para Supabase + sync
- `@dev` para dashboard React
- `@qa` para validação

Invoke: `/squad-creator` e descreva o projeto.
