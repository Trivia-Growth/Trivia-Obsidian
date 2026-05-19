# Padrão de Projetos — Leia Antes de Começar

Este vault documenta o **padrão Trivia de desenvolvimento** — a forma como todos os projetos de software são construídos aqui. Se você vai iniciar um projeto novo ou executar qualquer tarefa, **leia este arquivo primeiro**.

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
| [[04 - Agentes Triviaiox/O que é o Triviaiox\|04 - O que é o Triviaiox]] | Como usar a equipe de agentes de IA |
| [[04 - Agentes Triviaiox/Equipe de Agentes\|04 - Equipe de Agentes]] | 15 agentes especializados e quando acionar cada um |
| [[05 - Lovable e Claude/Base de Conhecimento Lovable\|05 - Lovable KB]] | Base de conhecimento para copiar na Lovable |
| [[06 - Gestão do Projeto/Setup Colaborador\|06 - Como Colaborar]] | Como uma pessoa sem perfil técnico entra no projeto |
| [[07 - Templates de Código/CLAUDE.md\|07 - Templates]] | Arquivos prontos para copiar no novo repositório |
| [[08 - Operações/Deploy Supabase\|08 - Deploy Supabase]] | Como deployar Edge Functions, migrations e secrets no Supabase |
| [[08 - Operações/Monitoramento sem Ferramentas\|08 - Monitoramento]] | Como monitorar produção usando Supabase, Netlify e DevTools |
| [[08 - Operações/LGPD e Compliance\|08 - LGPD e Compliance]] | Checklist de conformidade para dados pessoais e financeiros |
| [[09 - Migrações/Migrar Projeto Lovable para Padrão Trivia\|09 - Migrar da Lovable]] | Checklist para integrar projeto existente da Lovable ao padrão Trivia |
| [[10 - Sync Lovable e Claude\|10 - Sync Lovable + Claude]] | Protocolo de sincronismo entre Lovable e Claude Code via docs/stories/ |
| [[06 - Gestão do Projeto/Setup Dev Técnico\|06 - Setup Dev Técnico]] | Onboarding para devs que trabalham via Claude Code + Triviaiox |

**Leia na ordem acima.** O checklist de início conecta tudo.

---

## Filosofia central

> **"Documentação é código."**
> Atualizar junto, commitar junto, tratar como bug quando estiver desatualizada.

Quatro regras que nunca quebram:

1. **Documentação é código** — specs existem antes do código, não depois.
2. **Segurança não é opcional** — RLS, Zod, JWT validado, @security gate em features sensíveis. Sem atalhos.
3. **Mudanças mínimas** — implementar o que foi pedido. Sem extras não solicitados.
4. **Story-driven** — nenhum código sem story. Nenhuma story sem acceptance criteria.

---

## Ciclo de desenvolvimento (para agentes — executar nesta ordem)

Todo trabalho começa em uma story e termina com push do @devops. O fluxo completo:

```
@po/@sm cria story
    ↓
@po valida (10-point checklist) → GO ou NO-GO
    ↓
@dev implementa (Diff Plan → aprovação → código)
    ↓
@security *security-gate [SE story toca segurança*]
    ↓
@qa *gate (7 quality checks)
    ↓
@devops push → deploy
```

### Quando acionar @security (gate obrigatório antes do @qa)

A story **exige** @security se toca qualquer um destes pontos:

- [ ] Autenticação ou autorização (login, JWT, OAuth, RBAC, permissões)
- [ ] Dados pessoais: CPF, RG, email, telefone, endereço (LGPD/GDPR)
- [ ] Dados financeiros: cartão, CVV, dados bancários, valores (PCI DSS)
- [ ] Dados de saúde: prontuários, diagnósticos, CID (PHI)
- [ ] Novos endpoints de API (qualquer método HTTP)
- [ ] Integração com serviço de terceiro (Stripe, Supabase, Google, etc.)
- [ ] Gestão de secrets ou chaves criptográficas
- [ ] Mudanças em políticas de acesso ou RLS
- [ ] Funcionalidade multi-tenant
- [ ] Logging ou observabilidade (risco de PII em logs)

**Se @security retornar FAIL (CRITICAL ou HIGH):** o merge é bloqueado. @dev corrige. Não há exceção.

### Fluxo para features novas complexas (Spec Pipeline)

Para features novas que envolvem múltiplas decisões técnicas:

```
@pm coleta requisitos
    ↓
@architect avalia complexidade
    ↓
@analyst pesquisa (se STANDARD/COMPLEX)
    ↓
@pm escreve spec
    ↓
@qa critica a spec
    ↓
@security threat model STRIDE (se STANDARD/COMPLEX ou toca segurança)
    ↓
@architect planeja implementação
    ↓
→ Ciclo de story normal acima
```

---

## Autoridade dos agentes — quem pode fazer o quê

| Operação | Agente | Outros |
|----------|--------|--------|
| `git push` para remote | **@devops** exclusivo | BLOQUEADO para todos |
| Criar Pull Requests | **@devops** exclusivo | BLOQUEADO para todos |
| Criar stories | **@sm** | — |
| Validar stories (10-point) | **@po** | — |
| Implementar código | **@dev** | — |
| Security gate (PASS/FAIL) | **@security** | Autoridade máxima em segurança |
| QA gate | **@qa** | — |
| Schema/migrations/RLS | **@data-engineer** | Delegado pelo @architect |
| Decisões de arquitetura | **@architect** | — |

**Regra de escalação:** se um agente não consegue completar a tarefa → escalate para @triviaiox-master.

---

## Equipe de agentes (15 especializados)

| Agente | Persona | Quando acionar |
|--------|---------|----------------|
| `@triviaiox-master` | Orion | Conflitos entre agentes, framework governance |
| `@pm` | Morgan | Epics, roadmap, PRDs, coleta de requisitos |
| `@po` | Pax | Validar stories, priorizar backlog |
| `@sm` | River | Criar stories, gerenciar sprint |
| `@architect` | Aria | Decisões técnicas, ADRs, design de sistema |
| `@dev` | Dex | Implementar código |
| `@qa` | Quinn | Validar critérios de aceite, gate de qualidade |
| `@security` | Cipher | **Threat modeling, OWASP review, secrets scan, auth audit** |
| `@devops` | Gage | Push, CI/CD, deploy — EXCLUSIVO para git push |
| `@data-engineer` | Dara | Schema Supabase, migrations, RLS, sync |
| `@ux-design-expert` | Uma | UI/UX, componentes, acessibilidade |
| `@analyst` | Alex | Pesquisa, análise, FinOps |
| `@reliability` | Rex | SRE, SLO/SLI, incident response |
| `@prompt-engineer` | Pria | Prompt design, LLM eval, defesa contra injection |
| `@squad-creator` | — | Montar equipe pré-configurada para projetos |

Ver [[04 - Agentes Triviaiox/Equipe de Agentes]] para detalhes de cada agente e seus comandos `*`.

---

## Como o Triviaiox chega em cada máquina

Existem dois perfis de uso. Identifique o seu e siga o caminho correspondente.

---

### Perfil A — Dev que inicia projetos (Lucas, João com acesso ao framework)

Para poder criar projetos novos com `triviaiox-core install`, é necessário fazer o setup único abaixo na sua máquina (admins do GitHub da Trivia Growth já têm acesso ao repositório privado).

**Setup único por máquina (qualquer dev com acesso):**
```bash
# 1. Clonar o repositório privado do framework
git clone git@github.com:Trivia-Growth/Triviaiox.git ~/Documents/GitHub/Triviaiox
cd ~/Documents/GitHub/Triviaiox
npm install
npm link   # registra triviaiox-core globalmente nesta máquina

# Verificar que funcionou:
triviaiox-core info   # deve mostrar versão 5.x.x
```

**Iniciar um projeto novo:**
```bash
cd /caminho/do/projeto-cliente
triviaiox-core install
git add . && git commit -m "chore: install Triviaiox framework" && git push
```

A partir deste commit, **todos os outros devs que clonarem o projeto não precisam de nenhum setup adicional** — o framework já está dentro do repositório.

**Atualizar o framework quando houver melhorias:**
```bash
cd ~/Documents/GitHub/Triviaiox
git pull   # baixa as atualizações mais recentes
# Projetos novos já usam a versão atualizada automaticamente
# Para atualizar um projeto existente: cd [projeto] && triviaiox-core update
```

---

### Perfil B — Dev que entra em projeto existente (João, qualquer colaborador)

O `.triviaiox-core/` já está commitado no repositório do projeto. **Zero configuração de framework necessária:**

```bash
git clone [URL do projeto]
cd [projeto]
npm install
claude   # abrir Claude Code — 15 agentes disponíveis imediatamente
```

Não precisa de acesso ao repositório do framework. Não precisa de npm link. Não precisa de nenhum setup além do Node.js e Claude Code.

---

Ver [[00 - Checklist de Início]] passo 6 e [[06 - Gestão do Projeto/Setup Dev Técnico|Setup Dev Técnico]] para detalhes completos de cada perfil.

---

## Projeto de referência real

O **HeziomOS** foi o primeiro projeto construído com este padrão. Todos os templates aqui foram extraídos do que funcionou lá.

→ Referência: `Clientes/Heziom/HezionOS/`

---

## Quem usa este vault

- **Lucas (piloto)** — define o que construir, aprova planos, revisa entregas
- **Agentes Triviaiox** — implementam, testam, documentam via stories, seguem o ciclo acima
- **Colaboradores de negócio** — leem o Dashboard do Projeto e o Roadmap
