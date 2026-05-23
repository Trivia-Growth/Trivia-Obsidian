---
tags: [heziom, kickoff, implementação, sprint-1]
data: 2026-05-26
status: planejado
atualizado: 2026-05-23
---

# Kickoff da Implementação — Segunda, 26 Mai 2026

> Início formal da construção do HeziomOS.  
> Documentação e arquitetura aprovadas. Fase 1 começa agora.

---

## Contexto rápido

O projeto está 100% documentado e aprovado pelo Conselho da Heziom. O que começa na segunda é a **construção real** — código, banco, infraestrutura. A Sprint 1 tem objetivo único: dados do Literarius fluindo para o Supabase, sem nenhuma tela ainda.

**Sequência crítica:**
```
Infra (STORY-001) → Servidor Intelinovo (STORY-009) → Sync Agent (STORY-002/003) → Dashboard CEO (STORY-004/005)
```

> **Mudança de arquitetura (2026-05-23):** O Raspberry Pi foi descartado. A Heziom já tem um servidor Intelinovo com conectividade comprovada ao Literarius (era usado pelo Power BI). Usaremos ele. Ver [[ADR-003 — Sync Agent no Servidor Intelinovo]].

---

## Decisões que precisam ser tomadas ANTES de segunda

> Se estas decisões não estiverem resolvidas, o kickoff trava na primeira hora.

| # | Decisão | Quem decide | Urgência |
|---|---------|-------------|----------|
| D1 | Supabase Pro (US$ 25/mês) aprovado? Ou começamos no Free (limite 500MB)? | JG / Heziom | 🔴 Imediata |
| D2 | Qual é o email para criar a conta Supabase? (recomendo email Trivia, não pessoal) | Lucas | 🟡 Antes do setup |
| D3 | OS do servidor Intelinovo — Windows Server ou Linux? | JG perguntar à Heziom/Intelinovo | 🔴 Imediata |
| D4 | Temos acesso remoto ao servidor Intelinovo? (RDP ou SSH) | JG perguntar à Heziom | 🔴 Imediata |
| D5 | As credenciais SQL Server usadas pelo Power BI ainda existem e funcionam? | DBA Literarius confirmar | 🟡 Antes da STORY-009 |

> **Nota D3/D4:** Não é necessário resolver antes de iniciar STORY-001. STORY-001 (infra) começa na segunda independente. Mas D3 e D4 precisam estar resolvidos para começar STORY-009.

---

## Atividades da semana — Sprint 1

### Bloco 1 — STORY-001: Setup Infraestrutura

**Responsável:** Lucas  
**Pode iniciar na segunda de manhã, sem dependências externas**

#### 1.1 Repositório de código
- [ ] Criar repositório `heziom-os-app` no GitHub (privado, na org Trivia ou pessoal)
- [ ] Scaffold inicial: React 18 + TypeScript + Vite + shadcn/ui
- [ ] Estrutura de pastas: `src/`, `supabase/`, `sync/`
- [ ] Criar `CLAUDE.md` na raiz com contexto do domínio HeziomOS

#### 1.2 Supabase
- [ ] Criar projeto Supabase Pro (região: São Paulo `sa-east-1`)
- [ ] Guardar `SUPABASE_URL` e `SUPABASE_ANON_KEY` no vault de secrets
- [ ] Criar schema `lit_*` inicial com as 5 tabelas prioritárias:
  - `lit_titulo_financeiro` (A/R e A/P — coração do dashboard)
  - `lit_conta_bancaria` (posição de caixa)
  - `lit_nota_fiscal` (faturamento por canal)
  - `lit_pedido_venda` (pedidos e status)
  - `lit_produto` (catálogo para estoque)
- [ ] Configurar RLS com FORCE nas tabelas financeiras
- [ ] Criar 3 roles: `ceo`, `financeiro`, `analista`

#### 1.3 Netlify + CI/CD
- [ ] Conectar repositório ao Netlify
- [ ] Configurar deploy automático no push para `main`
- [ ] Adicionar variáveis de ambiente Supabase no Netlify
- [ ] Testar: push simples → deploy automático funcionando

#### 1.4 AIOX
- [ ] Instalar AIOX no repo (`npx aiox-core init`)
- [ ] Configurar squad `heziom-squad` com contexto financeiro

#### 1.5 Obsidian Git (João)
- [ ] Configurar plugin `obsidian-git` no vault do João
- [ ] Auto-pull ao abrir, auto-push a cada 10 min
- [ ] Validar: João faz uma edição → aparece no vault do Lucas

**Critério de conclusão da STORY-001:**  
João consegue abrir o vault no Obsidian e ver mudanças do Lucas, sem usar terminal. Repo no GitHub, Supabase e Netlify no ar.

---

### Bloco 2 — STORY-009: Setup Sync Agent no Servidor Intelinovo

**Responsável:** Lucas  
**Depende de:** D3 (OS confirmado) e D4 (acesso remoto) + autorização para instalar software

> O servidor Intelinovo já está na rede e já provou que conecta no Literarius. O trabalho aqui é instalar o runtime (Deno ou Node.js) e configurar os scripts de sync.

#### 2.1 Acesso e reconhecimento
- [ ] Confirmar acesso remoto (RDP ou SSH) ao servidor
- [ ] Verificar OS, versão e o que já está instalado (Node? Python? .NET?)
- [ ] Confirmar saída na porta 443 (HTTPS para o Supabase)
- [ ] Testar conectividade SQL Server com as credenciais existentes (do Power BI)

#### 2.2 Instalação do runtime
- [ ] Instalar Deno no servidor (Windows: `winget install DenoLand.Deno` / Linux: script oficial)
- [ ] Clonar repositório `heziom-os-app` na pasta de trabalho (`C:\heziom-sync` ou `/opt/heziom-sync`)
- [ ] Criar arquivo `.env` com credenciais (nunca no repositório)
- [ ] Rodar teste de conexão: lê 1 linha de `TituloFinanceiro` e imprime no log

#### 2.3 Agendamento
- [ ] Configurar 4 tarefas agendadas (Task Scheduler no Windows ou systemd no Linux)
  - Financeiro: 2× por dia (06h e 18h)
  - Pedidos: a cada 30 min
  - Estoque: a cada 30 min
  - Cadastros: 1× por semana (domingo 02h)
- [ ] Alerta Teams se sync não rodar por mais de 2h

**Critério de conclusão da STORY-009:**  
`lit_titulo_financeiro` no Supabase com dados reais do Literarius. Log de execução limpo. Alerta Teams testado.

---

### Bloco 3 — Acionamentos externos (fazer na segunda, manhã)

> Estas dependências não bloqueiam STORY-001 mas vão bloquear STORY-002 e STORY-003 se não forem acionadas agora.

#### 3.1 Equipe Literarius — Solicitar urgente
Enviar mensagem formal para o DBA/responsável pelo Literarius:

**Item A — 6 views customizadas** (ver [[Views — Camada de Acesso HeziomOS]])  
As views já estão especificadas no vault. Precisamos apenas que a equipe as crie no SQL Server. Prazo solicitado: até sexta (29 Mai).

**Item B — Corrigir `PlanoConta.TipoCategoria`**  
Atualmente todos os 115 registros estão com valor `'A'`, o que impede o cálculo automático do DRE. A correção define quais planos são Receita (`'R'`) e quais são Despesa (`'D'`). Sem isso, o DRE da Fase 1 não funciona.

**Item C — Confirmar credenciais SQL Server**  
As credenciais usadas pelo Power BI ainda funcionam? Podemos reusá-las ou precisamos criar novo usuário `heziom_sync` com acesso read-only?

#### 3.2 CEO — Validar Dashboard HTML
- Abrir `heziom-ceo-dashboard-maio2026.html` em navegador
- Validar se os KPIs de Maio fazem sentido para ele
- Definir thresholds de aprovação de pagamentos: R$1k / R$5k / R$20k? (necessário para Fase 2)

---

## Ordem do dia — Segunda 26/Mai

| Hora | Atividade | Quem |
|------|-----------|------|
| Manhã | Confirmar D1 (Supabase Pro) e D3/D4 (servidor Intelinovo) | JG + Lucas |
| Manhã | Enviar solicitação de views + correção + credenciais para DBA Literarius | JG |
| Manhã | Criar repo `heziom-os-app` + scaffold React + CLAUDE.md | Lucas |
| Tarde | Criar projeto Supabase + schema `lit_*` + RLS | Lucas |
| Tarde | Conectar Netlify + testar CI/CD | Lucas |
| Tarde | Tentar acesso remoto ao servidor Intelinovo (se D3/D4 resolvidos) | Lucas |
| Fim do dia | Review rápido: o que está no ar, o que está bloqueado | JG + Lucas |

---

## Impedimentos conhecidos

| Impedimento | Impacto | Como destravar |
|-------------|---------|----------------|
| OS e acesso ao servidor Intelinovo não confirmados | Bloqueia STORY-009 | JG perguntar à Heziom/Intelinovo — D3 e D4 |
| Views Literarius não criadas | Bloqueia STORY-002 e STORY-003 | Acionar DBA segunda manhã |
| `PlanoConta.TipoCategoria` errado | DRE automático não funciona | Acionar DBA segunda manhã |
| Supabase Free (500MB) | Pode estourar com dados de 90 dias | Decisão D1: subir para Pro |

> ~~Raspberry Pi não comprado~~ → **Resolvido**: Usaremos o servidor Intelinovo existente.

---

## O que NÃO fazer nesta semana

- Não começar o Dashboard (frontend) antes do sync estar rodando — sem dados reais não tem como validar
- Não criar telas de Fase 2 (Tarefas, CRM, Comercial) — foco total na infraestrutura da Fase 1
- Não migrar dados históricos completos ainda — começar com últimos 90 dias

---

## Definição de pronto para o final da semana

- [ ] Repositório `heziom-os-app` no GitHub, com scaffold e CLAUDE.md
- [ ] Supabase no ar com schema `lit_*` criado (tabelas vazias está ok)
- [ ] Netlify com deploy automático funcionando
- [ ] João acessa vault no Obsidian sem usar terminal
- [ ] Literarius team acionado com prazo definido para as views
- [ ] OS e acesso ao servidor Intelinovo confirmados (D3 e D4)

---

## Referências

- [[Sprint Atual]] — Stories do Sprint 1
- [[Backlog]] — Todas as stories por fase
- [[ADR-003 — Sync Agent no Servidor Intelinovo]] — decisão de arquitetura atual
- [[HeziomOS — Arquitetura]] — Stack técnica completa
- [[STORY-001 — Setup Infraestrutura]] — Critérios de aceite detalhados
- [[STORY-009 — Setup Sync Agent no Servidor Intelinovo]] — Spec atualizada do sync agent
- [[Views — Camada de Acesso HeziomOS]] — 6 views a solicitar para Literarius
- [[heziom-ceo-dashboard-maio2026.html]] — Dashboard HTML para validação com CEO

---

*Criado em 2026-05-23 — Lucas Azevedo (Trivia Growth)*  
*Atualizado em 2026-05-23: Raspberry Pi substituído pelo servidor Intelinovo*
