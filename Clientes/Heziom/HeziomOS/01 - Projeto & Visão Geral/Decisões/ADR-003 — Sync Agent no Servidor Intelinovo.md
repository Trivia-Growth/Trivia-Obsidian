---
tags: [adr, decisao, infra, sync, intelinovo]
status: decidido
data: 2026-05-23
decisores: [Lucas Azevedo (Trivia), João G. Novais (Trivia)]
supersede: [[ADR-001 — Sync Agent no Raspberry Pi]]
---

# ADR-003 — Sync Agent no Servidor Intelinovo (supersede ADR-001)

## Status

**Decidido** — 2026-05-23

---

## Contexto

A Heziom já possui um servidor gerenciado pela **Intelinovo** que:

1. Está dentro da rede interna da Heziom
2. Já tem **conectividade comprovada com o SQL Server do Literarius** (`192.168.18.10:1433`) — era usado para alimentar o Power BI que a Heziom tinha
3. Tem saída para a internet (era necessária para enviar dados ao Power BI)
4. Já existe fisicamente — sem custo de hardware e sem necessidade de visita presencial para instalação

O problema original que levou ao ADR-001 (Raspberry Pi) era a necessidade de um agente **dentro da rede** com saída para internet. O servidor Intelinovo resolve isso sem custo adicional.

---

## Decisão

**Usar o servidor existente da Intelinovo como host do Sync Agent**, em vez de adquirir um Raspberry Pi dedicado.

Descartadas (com este ADR):
- **Raspberry Pi dedicado** — custo de ~R$500–700, compra + visita presencial para instalação, setup de OS do zero; desnecessário dado que o servidor Intelinovo já existe e já tem a conectividade exata que precisamos

---

## O que precisa ser confirmado antes de implementar

> Estas informações determinam o runtime e o método de agendamento a usar.

| # | Informação necessária | Impacto |
|---|----------------------|---------|
| I1 | **Sistema operacional** do servidor (Windows Server ou Linux?) | Define o runtime: systemd (Linux) ou Windows Task Scheduler |
| I2 | **Acesso remoto disponível** (RDP se Windows, SSH se Linux) | Como Lucas vai acessar para instalar e configurar |
| I3 | **Permissão para instalar software** (quem autoriza: Intelinovo ou Heziom IT?) | Pode exigir abertura de chamado com a Intelinovo |
| I4 | **Credenciais SQL Server** usadas pelo Power BI — ainda são válidas? | Podemos reusar a mesma conta ou precisamos criar `acessoExterno` |
| I5 | **Acesso de saída na porta 443** confirmado | O Power BI já usava → provavelmente sim |
| I6 | **Runtime disponível** (Node.js? Deno? Python?) | Se Windows, Deno roda nativo; Node.js é alternativa |

---

## Arquitetura do fluxo (sem alteração em relação ao ADR-001)

```
┌─────────────────────────────────────────────┐
│  Rede Heziom (LAN)                          │
│                                             │
│  SQL Server Literarius                      │
│  192.168.18.10:1433                         │
│         │                                   │
│         ▼ mssql (read-only)                 │
│  ┌──────────────────────────────┐           │
│  │  Servidor Intelinovo         │           │
│  │  Sync Agent (Deno ou Node)   │           │
│  │                              │           │
│  │  sync-financeiro.ts → 2×/dia │           │
│  │  sync-pedidos.ts    → 30 min │           │
│  │  sync-estoque.ts    → 30 min │           │
│  │  sync-cadastros.ts  → 1×/sem │           │
│  └───────────────┬──────────────┘           │
│                  │ HTTPS 443 (saída)        │
└──────────────────┼──────────────────────────┘
                   │
                   ▼ Supabase SDK (upsert idempotente)
┌─────────────────────────────────────────────┐
│  Supabase PostgreSQL (nuvem)                │
│  réplica das tabelas críticas do Literarius  │
└─────────────────────────────────────────────┘
```

---

## Stack do Sync Agent (ajustada ao OS do servidor)

### Se Windows Server (mais provável)

```
Runtime:   Deno para Windows (instalação via winget ou MSI)
           ou Node.js 20 LTS (alternativa se Deno não for aprovado)
DB conn:   npm:mssql (idêntico ao planejado para Linux)
Push:      @supabase/supabase-js
Schedule:  Windows Task Scheduler (substitui systemd)
           ou NSSM (Non-Sucking Service Manager) para rodar como Windows Service
Logs:      Arquivo local + POST webhook Teams em falha
```

### Se Linux (menos provável, mas possível)

```
Runtime:  Deno (instalação via script oficial — idêntico ao ADR-001)
Schedule: systemd timers (idêntico ao ADR-001)
Logs:     journald + alerta Teams
```

> A lógica de negócio dos scripts `sync-*.ts` é **idêntica** independentemente do OS — só muda o mecanismo de agendamento.

---

## Vantagens sobre o Raspberry Pi

| Critério | Raspberry Pi (ADR-001) | Servidor Intelinovo (este ADR) |
|----------|----------------------|-------------------------------|
| Custo de hardware | R$500–700 | R$0 (já existe) |
| Prazo para ter no ar | 1–2 semanas (compra + envio + visita) | Dias (só instalar o runtime) |
| Conectividade Literarius | A ser testada | Comprovada (usada pelo Power BI) |
| Acesso remoto | Precisa configurar do zero | Provavelmente já existe (RDP/SSH) |
| Disponibilidade 24/7 | Depende da Heziom não desligar | Server rack: menos risco |
| Controle total | Total (hardware nosso) | Parcial (gerenciado pela Intelinovo) |

---

## Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Intelinovo não permite instalar software | Médio | Acionar via Heziom com requisito técnico documentado |
| Intelinovo descomissiona o servidor no futuro | Baixo | Se acontecer, Raspberry Pi ainda é o fallback óbvio |
| Servidor é compartilhado → interferência de outros processos | Baixo | Isolar em usuário dedicado, monitorar consumo de recursos |
| Credenciais do Power BI foram revogadas | Baixo | Criar novo usuário `heziom_sync` read-only no SQL Server |

---

## Modelo de segurança

O modelo de segurança do [[ADR-002 — Segurança do Sync Agent]] se mantém integralmente. As adaptações para Windows Server, se aplicável:

- Substituir `ufw` por **Windows Defender Firewall** com regras equivalentes de saída
- Substituir usuário Linux `heziom-sync` por **conta de serviço Windows** sem privilégios de logon interativo
- Substituir `fail2ban` por configuração equivalente no Windows (já vem com proteção de lockout nativa)
- O arquivo `.env` ou equivalente fica com permissões NTFS restritas ao usuário de serviço

---

## Próximos passos para implementar

- [ ] **Confirmar OS** do servidor Intelinovo (Windows ou Linux?) — perguntar ao João/Heziom
- [ ] **Confirmar acesso remoto** — RDP ou SSH disponível para Lucas?
- [ ] **Confirmar autorização** para instalar software — precisa abrir chamado com Intelinovo?
- [ ] **Verificar credenciais SQL Server** do Power BI — ainda válidas?
- [ ] Instalar Deno (ou Node.js 20 LTS) no servidor
- [ ] Configurar scripts sync em `sync/` do repositório `heziom-os-app`
- [ ] Configurar agendamento (Task Scheduler ou systemd)
- [ ] Testar: lê 1 linha de `TituloFinanceiro` e faz upsert no Supabase
- [ ] Configurar alerta Teams para falha de sync > 2h

---

## Referências

- [[ADR-001 — Sync Agent no Raspberry Pi]] — decisão anterior (supersedida)
- [[ADR-002 — Segurança do Sync Agent]] — modelo de segurança (mantido)
- [[STORY-009 — Setup Sync Agent no Servidor Intelinovo]] — implementação
- [[HeziomOS — Arquitetura]] — diagrama completo

---

*Decisão tomada em 2026-05-23 — Lucas Azevedo / João G. Novais (Trivia)*
