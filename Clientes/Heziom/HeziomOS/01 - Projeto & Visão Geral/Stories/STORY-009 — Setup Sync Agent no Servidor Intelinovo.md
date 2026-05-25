---
tags: [story, infra, intelinovo, sync]
status: backlog
fase: 1
prioridade: alta
criado: 2026-05-18
atualizado: 2026-05-23
bloqueia: [STORY-002, STORY-003, STORY-004, STORY-006]
decisao: [[ADR-003 — Sync Agent no Servidor Intelinovo]]
---

# STORY-009 — Setup Sync Agent no Servidor Intelinovo

> **Atualizado em 2026-05-23:** Raspberry Pi descartado. Usaremos o servidor existente da Intelinovo, que já está na rede da Heziom com conectividade comprovada ao Literarius (era usado pelo Power BI). Ver [[ADR-003 — Sync Agent no Servidor Intelinovo]].

## Objetivo

Instalar e configurar o Sync Agent no servidor Intelinovo, que já reside na rede da Heziom, para ler o SQL Server do Literarius e fazer upsert dos dados no Supabase.

## Por que é crítico

Esta story **bloqueia todas as stories de sync** (002, 003) e consequentemente o Dashboard CEO (004) e o Briefing Teams (006). Sem o agente configurado, não há como acessar os dados financeiros do Literarius.

---

## Informações a confirmar antes de começar

> Sem estas informações, não é possível escolher o runtime nem o mecanismo de agendamento.

| # | Informação | Como obter | Status |
|---|-----------|-----------|--------|
| I1 | OS do servidor (Windows Server ou Linux?) | Perguntar ao João / Heziom | ⏳ pendente |
| I2 | Acesso remoto disponível? (RDP ou SSH) | Testar / perguntar ao João | ⏳ pendente |
| I3 | Permissão para instalar software? | João acionar Intelinovo ou Heziom IT | ⏳ pendente |
| I4 | Credenciais SQL Server do Power BI ainda válidas? | DBA Literarius confirmar | ⏳ pendente |
| I5 | Saída na porta 443 confirmada? | Power BI já usava → provavelmente sim | ✅ assumido |

---

## Critérios de aceite

- [ ] CA1 — Acesso remoto ao servidor confirmado e funcionando para Lucas
- [ ] CA2 — Deno (ou Node.js 20 LTS) instalado no servidor sem erros
- [ ] CA3 — Conexão SQL Server `192.168.18.10:1433` confirmada (lê 1 linha de `TituloFinanceiro`)
- [ ] CA4 — Variáveis de ambiente configuradas (arquivo `.env` local, fora do repositório)
- [ ] CA5 — Agendamento configurado: 4 frequências (estoque/pedidos 30min, financeiro 2×/dia, cadastros 1×/sem)
- [ ] CA6 — Alerta Teams disparado se sync parar por mais de 2h
- [ ] CA7 — Primeiro upsert real no Supabase validado (linha em `lit_titulo_financeiro`)

---

## Tarefas técnicas

### Pré-requisitos (antes de abrir o laptop)
```
1. [ ] Confirmar OS do servidor (João/Heziom)
2. [ ] Obter acesso remoto (RDP ou SSH)
3. [ ] Confirmar permissão para instalar software
4. [ ] Confirmar ou criar credencial SQL Server read-only
```

### Instalação do runtime

**Se Windows Server:**
```powershell
# Instalar Deno via winget
winget install DenoLand.Deno

# OU instalar Node.js 20 LTS
winget install OpenJS.NodeJS.LTS

# Criar pasta de trabalho
mkdir C:\heziom-sync
cd C:\heziom-sync

# Clonar repositório
git clone https://github.com/[org]/heziom-os-app .

# Criar arquivo de ambiente (NÃO commitar)
copy .env.example .env
# Editar .env com credenciais reais
```

**Se Linux:**
```bash
# Instalar Deno
curl -fsSL https://deno.land/install.sh | sh

# Clonar repositório
git clone https://github.com/[org]/heziom-os-app /opt/heziom-sync
```

### Configuração do agendamento

**Se Windows Server — Task Scheduler:**
```
Tarefa: heziom-sync-financeiro
  Disparar: diário às 06:00 e 18:00
  Ação: deno run --allow-net --allow-env C:\heziom-sync\sync\financeiro.ts
  Executar como: conta de serviço heziom_sync (sem logon interativo)

Tarefa: heziom-sync-pedidos
  Disparar: a cada 30 minutos
  Ação: deno run --allow-net --allow-env C:\heziom-sync\sync\pedidos.ts

Tarefa: heziom-sync-estoque
  Disparar: a cada 30 minutos
  Ação: deno run --allow-net --allow-env C:\heziom-sync\sync\estoque.ts

Tarefa: heziom-sync-cadastros
  Disparar: domingo às 02:00
  Ação: deno run --allow-net --allow-env C:\heziom-sync\sync\cadastros.ts
```

**Se Linux — systemd timers:**
Ver configuração detalhada no [[ADR-001 — Sync Agent no Raspberry Pi]] (mesma configuração, diferente hardware).

### Segurança
- [ ] Criar conta de serviço dedicada sem privilégios de logon interativo
- [ ] `.env` com permissões restritas (só a conta de serviço pode ler)
- [ ] Criar role Supabase com escopo mínimo (só INSERT/UPDATE nas tabelas `lit_*`)
- [ ] Ver checklist completo em [[ADR-002 — Segurança do Sync Agent]]

---

## Dependências externas

| Dependência | Responsável | Status |
|---|---|---|
| Confirmar acesso ao servidor | João / Heziom | ⏳ pendente |
| Credencial read-only no SQL Server | DBA Literarius | ⏳ pendente |
| 6 views SQL otimizadas no Literarius | DBA Literarius | ⏳ pendente |
| Autorização para instalar software (se necessário) | Heziom → Intelinovo | ⏳ pendente |

---

## Frequência de sincronização

| Tabela Literarius | Frequência | Justificativa |
|---|---|---|
| `PedidoVenda` | 30 min | CEO quer pedidos do dia quasi-real |
| `TEstoque` | 30 min | Muda com vendas e entradas de NF |
| `NotaFiscal` | 60 min | Conciliação e-commerce |
| `TituloFinanceiro` | 2× dia (6h e 18h) | Financeiro; dado estável |
| `ContaBancaria` + `Lancamentos` | 1× dia (5h30) | Alimenta briefing 7h do CEO |
| `TituloFinanceiroBaixa` | 2× dia | Conciliação bancária |
| `Parceiro` | 1× semana | Cadastro; raramente muda |
| `PlanoConta` / `CentroResultado` | 1× semana | Aguarda correção `TipoCategoria` |
| `Produto` | 1× dia | Mudanças são planejadas |

---

## Referências

- [[ADR-003 — Sync Agent no Servidor Intelinovo]] — decisão de arquitetura
- [[ADR-002 — Segurança do Sync Agent]] — modelo de segurança (mantido)
- [[HeziomOS — Arquitetura]] — visão geral do sistema
- [[STORY-002 — Deno Sync TituloFinanceiro e ContaBancaria]] — desbloqueada por esta story
- [[STORY-003 — Deno Sync NotaFiscal e PedidoVenda]] — desbloqueada por esta story
