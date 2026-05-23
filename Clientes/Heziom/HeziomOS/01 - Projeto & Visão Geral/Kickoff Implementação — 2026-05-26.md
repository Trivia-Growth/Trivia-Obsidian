---
tags: [heziom, kickoff, implementação, sprint-1]
data: 2026-05-26
status: planejado
---

# Kickoff da Implementação — Segunda, 26 Mai 2026

> Início formal da construção do HeziomOS.  
> Documentação e arquitetura aprovadas. Fase 1 começa agora.

---

## Contexto rápido

O projeto está 100% documentado e aprovado pelo Conselho da Heziom. O que começa na segunda é a **construção real** — código, banco, infraestrutura. A Sprint 1 tem objetivo único: dados do Literarius fluindo para o Supabase, sem nenhuma tela ainda.

**Sequência crítica:**
```
Infra (STORY-001) → Raspberry Pi (STORY-009) → Sync Agent (STORY-002/003) → Dashboard CEO (STORY-004/005)
```

---

## Decisões que precisam ser tomadas ANTES de segunda

> Se estas decisões não estiverem resolvidas, o kickoff trava na primeira hora.

| # | Decisão | Quem decide | Urgência |
|---|---------|-------------|----------|
| D1 | Quem compra o Raspberry Pi 4 (4GB) + SD 32GB + fonte? Custo ~R$ 500 | JG / Heziom | 🔴 Imediata |
| D2 | Supabase Pro (US$ 25/mês) aprovado? Ou começamos no Free (limite 500MB)? | JG / Heziom | 🔴 Imediata |
| D3 | Qual é o email para criar a conta Supabase? (recomendo email Trivia, não pessoal) | Lucas | 🟡 Antes do setup |

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

### Bloco 2 — STORY-009: Setup Raspberry Pi

**Responsável:** Lucas (setup técnico) + Heziom (hardware)  
**Depende de:** Hardware comprado e máquina identificada na rede Heziom

- [ ] Hardware adquirido: Raspberry Pi 4 (4GB), SD 32GB, fonte oficial
- [ ] Instalar Raspberry Pi OS Lite (64-bit, sem interface gráfica)
- [ ] Instalar Deno (versão 1.x)
- [ ] Configurar acesso SSH (para Lucas acessar remotamente via tailscale ou VPN)
- [ ] Testar conexão com SQL Server do Literarius na rede local
- [ ] Configurar systemd timer: executa script a cada 15 min
- [ ] Criar script de healthcheck → se falhar 3x, envia alerta no Teams

> **Esta story pode rodar em paralelo com STORY-001.** Se o hardware chegar na semana, não precisa esperar.

---

### Bloco 3 — Acionamentos externos (fazer na segunda, manhã)

> Estas dependências não bloqueiam STORY-001 mas vão bloquear STORY-002 e STORY-003 se não forem acionadas agora.

#### 3.1 Equipe Literarius — Solicitar urgente
Enviar e-mail ou mensagem formal para o DBA/responsável pelo Literarius:

**Item A — 6 views customizadas** (ver [[Views — Camada de Acesso HeziomOS]])  
As views já estão especificadas no vault. Precisamos apenas que a equipe as crie no SQL Server. Prazo solicitado: até sexta (29 Mai).

**Item B — Corrigir `PlanoConta.TipoCategoria`**  
Atualmente todos os 115 registros estão com valor `'A'`, o que impede o cálculo automático do DRE. A correção define quais planos são Receita (`'R'`) e quais são Despesa (`'D'`). Sem isso, o DRE da Fase 1 não funciona.

#### 3.2 CEO — Validar Dashboard HTML
- Abrir `heziom-ceo-dashboard-maio2026.html` em navegador
- Validar se os KPIs de Maio fazem sentido para ele
- Definir thresholds de aprovação de pagamentos: R$1k / R$5k / R$20k? (necessário para Fase 2)

---

## Ordem do dia — Segunda 26/Mai

| Hora | Atividade | Quem |
|------|-----------|------|
| Manhã | Resolver D1 e D2 (Raspberry Pi + Supabase Pro) | JG + Lucas |
| Manhã | Enviar solicitação de views + correção para equipe Literarius | JG |
| Manhã | Criar repo `heziom-os-app` + scaffold React + CLAUDE.md | Lucas |
| Tarde | Criar projeto Supabase + schema `lit_*` + RLS | Lucas |
| Tarde | Conectar Netlify + testar CI/CD | Lucas |
| Tarde | Atualizar STORY-001 com status de cada critério de aceite | Lucas |
| Fim do dia | Review rápido: o que está no ar, o que está bloqueado | JG + Lucas |

---

## Impedimentos conhecidos

| Impedimento | Impacto | Como destravar |
|-------------|---------|----------------|
| Raspberry Pi não comprado | Bloqueia STORY-009 e sync automático | Decisão D1 hoje |
| Views Literarius não criadas | Bloqueia STORY-002 e STORY-003 | Acionar DBA segunda manhã |
| `PlanoConta.TipoCategoria` errado | DRE automático não funciona | Acionar DBA segunda manhã |
| Supabase Free (500MB) | Pode estourar com dados de 90 dias | Decisão D2: subir para Pro |

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
- [ ] Raspberry Pi comprado (ou decisão tomada sobre quem compra e quando)

---

## Referências

- [[Sprint Atual]] — Stories do Sprint 1
- [[Backlog]] — Todas as stories por fase
- [[HeziomOS — Arquitetura]] — Stack técnica completa
- [[STORY-001 — Setup Infraestrutura]] — Critérios de aceite detalhados
- [[STORY-009 — Setup Raspberry Pi Sync Agent]] — Spec do sync agent
- [[Views — Camada de Acesso HeziomOS]] — 6 views a solicitar para Literarius
- [[heziom-ceo-dashboard-maio2026.html]] — Dashboard HTML para validação com CEO

---

*Criado em 2026-05-23 — Lucas Azevedo (Trivia Growth)*
