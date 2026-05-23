---
tags: [adr, decisao, infra, sync, raspberry-pi]
status: superseded
data: 2026-05-18
decisores: [Lucas Azevedo (Trivia)]
superseded_by: [[ADR-003 — Sync Agent no Servidor Intelinovo]]
---

# ADR-001 — Sync Agent rodando em Raspberry Pi dedicado

## Status

> ⚠️ **SUPERSEDED em 2026-05-23** — A Heziom possui um servidor Intelinovo já conectado ao Literarius que será usado no lugar do Raspberry Pi. Ver [[ADR-003 — Sync Agent no Servidor Intelinovo]].

**Superseded** — substituído pelo ADR-003 em 2026-05-23  
~~Decidido — 2026-05-18~~

---

## Contexto

O banco de dados do Literarius (SQL Server `192.168.18.10:1433`) só é acessível dentro da rede interna da Heziom. As Edge Functions do Supabase rodam na nuvem e **não alcançam IPs privados**. Precisamos de um agente que:

1. Esteja dentro da rede da Heziom (acesso ao SQL Server)
2. Tenha saída para a internet (para empurrar dados ao Supabase)
3. Rode 24/7 de forma confiável e dedicada
4. Seja barato e de baixa manutenção

A API HTTP do Literarius foi descartada como fonte primária para dados financeiros porque:
- Não expõe `TituloFinanceiro`, `ContaBancaria`, `PlanoConta`
- Não tem paginação nativa (risco de timeout em volume)
- Rate limiting por IP (burst de chamadas gera bloqueio 403)

---

## Decisão

**Raspberry Pi 4 (2GB RAM mínimo) dedicado, dentro da rede da Heziom**, rodando o Sync Agent como serviço Linux (`systemd`).

Descartadas:
- **PC existente da Heziom** — risco de desligamento por alguém da equipe sem saber o impacto
- **VM na nuvem com VPN WireGuard** — mais complexo de configurar, latência extra no túnel, custo recorrente
- **Raspberry Pi Zero / 1** — RAM insuficiente para Node/Deno + conexão SQL Server simultânea

---

## Hardware recomendado

| Item | Especificação | Custo estimado |
|---|---|---|
| Raspberry Pi 4 | 2GB RAM (4GB preferível) | R$ 350–500 |
| Cartão microSD | 32GB Classe 10 / A1 | R$ 30–50 |
| Fonte oficial | 5V 3A USB-C | R$ 50–80 |
| Cabo de rede | Cat5e/Cat6 (evitar Wi-Fi) | R$ 15 |
| Case com dissipador | Qualquer passivo | R$ 30–60 |
| **Total** | | **~R$ 475–705** |

> Usar **cabo de rede**, não Wi-Fi — conexão SQL Server precisa de estabilidade.

---

## Stack do Sync Agent

```
SO:       Raspberry Pi OS Lite (64-bit, sem desktop)
Runtime:  Deno (instalação via script oficial)
DB conn:  npm:mssql → SQL Server 192.168.18.10:1433
Push:     @supabase/supabase-js → Supabase PostgreSQL
Schedule: systemd timer (substitui cron, mais robusto)
Logs:     journald → arquivo local + alerta Teams em falha
```

---

## Arquitetura do fluxo

```
┌─────────────────────────────────────────────┐
│  Rede Heziom (LAN)                          │
│                                             │
│  SQL Server Literarius                      │
│  192.168.18.10:1433                         │
│         │                                   │
│         ▼ npm:mssql (read-only)             │
│  ┌──────────────────────┐                   │
│  │  Raspberry Pi        │                   │
│  │  Sync Agent (Deno)   │                   │
│  │                      │                   │
│  │  sync-estoque.ts     │ → a cada 30 min   │
│  │  sync-pedidos.ts     │ → a cada 30 min   │
│  │  sync-financeiro.ts  │ → 2× por dia      │
│  │  sync-cadastros.ts   │ → 1× por semana   │
│  └──────────┬───────────┘                   │
│             │ HTTPS (saída)                 │
└─────────────┼───────────────────────────────┘
              │
              ▼ Supabase SDK (upsert idempotente)
┌─────────────────────────────────────────────┐
│  Supabase PostgreSQL (nuvem)                │
│  réplica das tabelas críticas do Literarius  │
└─────────────────────────────────────────────┘
```

---

## Frequência de sincronização por tabela

| Tabela Literarius | Frequência | Justificativa |
|---|---|---|
| `TEstoque` | 30 min | Muda com vendas e entradas de NF |
| `PedidoVenda` | 30 min | CEO quer pedidos do dia em tempo quasi-real |
| `NotaFiscal` | 60 min | Conciliação e-commerce; não é urgente ao segundo |
| `TituloFinanceiro` | 2× dia (6h e 18h) | Financeiro; dado estável, não muda em segundos |
| `ContaBancaria` + `Lancamentos` | 1× dia (5h30) | Alimenta o briefing do CEO às 7h |
| `TituloFinanceiroBaixa` | 2× dia | Conciliação bancária |
| `Parceiro` | 1× semana | Cadastro; raramente muda |
| `PlanoConta` / `CentroResultado` | 1× semana | Cadastro; aguarda correção `TipoCategoria` |
| `Produto` | 1× dia | Catálogo; mudanças são planejadas |

---

## Estratégia de resiliência

- **Retry automático**: 3 tentativas com backoff exponencial em falha de conexão SQL
- **Idempotência**: todos os upserts usam `onConflict` — rodar 2× não duplica dados
- **Watchdog**: systemd reinicia o serviço automaticamente em crash
- **Alerta de falha**: se o sync não rodar por mais de 2h → POST no webhook Teams com erro
- **Health check**: endpoint HTTP local `/health` que o monitoramento pode consultar
- **Backup do SD**: snapshot mensal do cartão via `dd` para pendrive de reserva

---

## Instalação (passos principais)

```bash
# 1. Instalar Deno no Pi
curl -fsSL https://deno.land/install.sh | sh

# 2. Clonar o repositório do HeziomOS (pasta sync/)
git clone https://github.com/heziom/heziomOS /opt/heziom-sync

# 3. Criar arquivo .env com credenciais
cat > /opt/heziom-sync/.env << EOF
LITERARIUS_HOST=192.168.18.10
LITERARIUS_PORT=1433
LITERARIUS_DB=Literarius
LITERARIUS_USER=acessoExterno
LITERARIUS_PASS=****
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=****
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/****
EOF

# 4. Criar serviço systemd
# /etc/systemd/system/heziom-sync-estoque.service + .timer
# /etc/systemd/system/heziom-sync-financeiro.service + .timer

systemctl enable --now heziom-sync-estoque.timer
systemctl enable --now heziom-sync-financeiro.timer
```

---

## O que NÃO muda com essa decisão

- O HeziomOS **não escreve** no Literarius nesta fase — sync é **read-only**
- A API HTTP do Literarius continua sendo usada para consultas pontuais e ações (ex: mudar status de pedido)
- O Supabase continua sendo o banco de dados operacional do HeziomOS
- Dados financeiros profundos (TituloFinanceiro, ContaBancaria) só chegam via este sync — não via API HTTP

---

## Consequências

**Positivas:**
- Hardware dedicado → sem risco de desligamento acidental
- Baixo consumo (~5W) → custo elétrico desprezível
- Zero dependência de infraestrutura existente da Heziom
- Investimento único ~R$ 500–700, sem mensalidade

**Riscos residuais:**
- Falha do cartão SD → mitigado por alertas + backup mensal
- Queda de internet na Heziom → sync pausa, retoma automaticamente quando reconectar
- Acesso físico à rede necessário para instalar e configurar → precisa de visita presencial uma vez

---

## Pendências para implementação

- [ ] Comprar hardware (Raspberry Pi 4 + acessórios)
- [ ] Visita à Heziom para instalação física e configuração de rede
- [ ] Obter credencial `acessoExterno` com acesso às tabelas necessárias
- [ ] Criar as 6 views SQL otimizadas no Literarius (pendência P2 do backlog)
- [ ] Configurar `acessoExterno` como read-only (sem INSERT/UPDATE/DELETE)

---

## Referências

- [[HeziomOS — Arquitetura]] — diagrama completo de componentes
- [[Estudo de APIs — Capacidades e Gaps]] — por que SQL direto é necessário
- [[Backlog]] — STORY-002 e STORY-003 dependem deste sync
- Pendência P3 do backlog: "Definir máquina Heziom para rodar Deno sync"

---

*Decisão tomada em 2026-05-18 — Lucas Azevedo (Trivia)*
