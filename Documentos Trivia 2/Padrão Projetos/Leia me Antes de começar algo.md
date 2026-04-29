# Padrão de Projetos — Leia Antes de Começar

Este vault documenta o **padrão Trivia de desenvolvimento** — a forma como todos os projetos de software são construídos aqui. Se você vai iniciar um projeto novo, este é o ponto de partida...

---

## O que você vai encontrar aqui

| Seção | O que é |
|-------|---------|
| [[00 - Checklist de Início]] | Passo a passo do zero: ideia → primeiro deploy (inclui pré-requisitos para leigos) |
| [[01 - Arquitetura/Stack Padrão\|01 - Stack Padrão]] | As tecnologias que usamos e por quê |
| [[01 - Arquitetura/Estrutura de Código\|01 - Estrutura de Código]] | Como organizar o código (Bulletproof React) |
| [[01 - Arquitetura/Dois Repositórios\|01 - Dois Repositórios]] | Como configurar código + vault lado a lado na máquina |
| [[01 - Arquitetura/Operações de Banco\|01 - Operações de Banco]] | Migrações, backups e rollback no Supabase |
| [[02 - Qualidade/Definition of Done\|02 - Definition of Done]] | Checklist antes de marcar qualquer coisa como pronto |
| [[02 - Qualidade/Testes Automatizados\|02 - Testes Automatizados]] | Setup e exemplos de testes locais com Vitest |
| [[03 - Segurança/Checklist de Segurança\|03 - Segurança]] | O mínimo de segurança que todo projeto deve ter |
| [[04 - Agentes AIOX/O que é o AIOX\|04 - O que é o AIOX]] | Como usar a equipe de agentes de IA |
| [[05 - Lovable e Claude/Base de Conhecimento Lovable\|05 - Lovable KB]] | Base de conhecimento para copiar na Lovable |
| [[06 - Gestão do Projeto/Setup Colaborador\|06 - Como Colaborar]] | Como uma pessoa sem perfil técnico entra no projeto |
| [[07 - Templates de Código/CLAUDE.md\|07 - Templates]] | Arquivos prontos para copiar no novo repositório |
| [[08 - Operações/Deploy Supabase\|08 - Deploy Supabase]] | Como deployar Edge Functions, migrations e secrets no Supabase |
| [[08 - Operações/Monitoramento sem Ferramentas\|08 - Monitoramento]] | Como monitorar produção usando Supabase, Netlify e DevTools |
| [[08 - Operações/LGPD e Compliance\|08 - LGPD e Compliance]] | Checklist de conformidade para dados pessoais e financeiros |
| [[09 - Migrações/Migrar Projeto Lovable para Padrão Trivia\|09 - Migrar da Lovable]] | Checklist para integrar projeto existente da Lovable ao padrão Trivia |
| [[10 - Sync Lovable e Claude\|10 - Sync Lovable + Claude]] | Protocolo de sincronismo entre Lovable e Claude Code via docs/stories/ |
| [[06 - Gestão do Projeto/Setup Dev Técnico\|06 - Setup Dev Técnico]] | Onboarding para devs que trabalham via Claude Code + AIOX |

**Leia na ordem acima.** O checklist de início conecta tudo.

---

## Projeto de referência real

O **HeziomOS** foi o primeiro projeto construído com este padrão. Todos os templates aqui foram extraídos do que funcionou lá.

→ Referência: `Clientes/Heziom/HezionOS/`

---

## Filosofia central

> **"Documentação é código."**
> Atualizar junto, commitar junto, tratar como bug quando estiver desatualizada.

Três regras que nunca quebram:

1. **Documentação é código** — specs existem antes do código, não depois.
2. **Segurança não é opcional** — RLS, Zod, JWT validado. Sem atalhos.
3. **Mudanças mínimas** — implementar o que foi pedido. Sem extras não solicitados.

---

## Quem usa este vault

- **Lucas (piloto)** — define o que construir, aprova planos, revisa entregas
- **Agentes AIOX** — implementam, testam, documentam via stories
- **Colaboradores de negócio** — leem o Dashboard do Projeto e o Roadmap
