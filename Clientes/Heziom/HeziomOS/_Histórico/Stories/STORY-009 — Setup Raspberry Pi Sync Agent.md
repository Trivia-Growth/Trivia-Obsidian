---
tags: [story, infra, windows-server, raspberry-pi, sync]
status: em andamento
fase: 1
prioridade: alta
criado: 2026-05-18
atualizado: 2026-06-10
bloqueia: [STORY-002, STORY-003, STORY-004, STORY-006]
---

# STORY-009 — Setup Agente de Sync (Windows Server + Raspberry Pi)

> **Decisão (2026-06-10):** Windows Server da Intelinove é o **alvo primário** do MVP.
> Já tem acesso ao SQL Server Literarius, sem custo de hardware adicional.
> Raspberry Pi permanece como plano de redundância/futuro.
> Repo de desenvolvimento: `Org-Heziom/literarius-sync`

## Objetivo

Configurar o ambiente de execução do Sync Agent (Deno) para que rode de forma contínua e monitorada, primeiramente no **Windows Server da Intelinove** e futuramente num **Raspberry Pi 4** como redundância.

> Decisão de arquitetura: [[ADR-001 — Sync Agent no Raspberry Pi]] (revisar para refletir Windows first)

---

## Por que é crítico

Esta story **bloqueia todas as stories de sync** (002, 003) e consequentemente o Dashboard CEO (004) e o Briefing Teams (006). Sem o Pi configurado, não há como acessar os dados financeiros do Literarius.

---

## Critérios de aceite

- [ ] Raspberry Pi 4 físico instalado e conectado via cabo de rede à LAN da Heziom
- [ ] Deno instalado e executando sem erros
- [ ] Conexão SQL Server `192.168.18.10:1433` confirmada com usuário `acessoExterno`
- [ ] Variáveis de ambiente configuradas (`.env` local, sem credenciais no repositório)
- [ ] Script de teste de conectividade rodando: lê 1 linha de `PedidoVenda` e imprime no log
- [ ] Serviços systemd criados e habilitados para os 4 timers (estoque, pedidos, financeiro, cadastros)
- [ ] Alerta Teams disparado em caso de falha de sync por mais de 2h
- [ ] Endpoint `/health` respondendo localmente

---

## Hardware a comprar

| Item | Especificação |
|---|---|
| Raspberry Pi 4 | 4GB RAM (preferível) ou 2GB |
| Cartão microSD | 32GB Classe 10 / A1 (SanDisk ou Samsung) |
| Fonte | Oficial 5V 3A USB-C |
| Cabo de rede | Cat5e ou Cat6, comprimento suficiente para o rack/patch panel |
| Case | Com dissipador passivo (sem fan) |

---

## Tarefas técnicas

```
1. [ ] Comprar hardware (~R$ 500–700)
2. [ ] Flashar Raspberry Pi OS Lite 64-bit no SD (via Raspberry Pi Imager)
3. [ ] Configurar hostname: heziom-sync
4. [ ] Habilitar SSH + definir IP fixo via DHCP reservation no roteador
5. [ ] Instalar Deno (curl -fsSL https://deno.land/install.sh | sh)
6. [ ] Clonar repositório: git clone .../heziomOS /opt/heziom-sync
7. [ ] Criar /opt/heziom-sync/.env com credenciais
8. [ ] Testar conexão SQL Server: deno run --allow-net --allow-env sync/test-conn.ts
9. [ ] Criar 4 units systemd (service + timer) para cada frequência de sync
10. [ ] Configurar logrotate para /var/log/heziom-sync/
11. [ ] Testar alerta Teams em falha simulada
12. [ ] Documentar IP fixo e procedimento de acesso SSH para a equipe Heziom
```

---

## Dependências externas (precisam estar prontas antes)

| Dependência | Responsável | Status |
|---|---|---|
| Credencial `acessoExterno` com acesso read-only às tabelas necessárias | Equipe Literarius | ⏳ pendente |
| 6 views SQL otimizadas criadas no Literarius | Equipe Literarius | ⏳ pendente (P2) |
| Ponto de rede disponível próximo ao servidor Literarius | Heziom (infra) | ⏳ confirmar |
| Tomada 24/7 para alimentação do Pi | Heziom (infra) | ⏳ confirmar |

---

## Notas de implementação

- Usar **cabo de rede**, nunca Wi-Fi — a conexão SQL Server precisa de estabilidade
- O Pi **não precisa de IP público** — só precisa de saída HTTPS (porta 443)
- Não abrir nenhuma porta de entrada no firewall da Heziom
- O cartão SD é o ponto mais fraco — fazer backup mensal via `dd` para pendrive
- systemd timers são mais robustos que cron: persistem em reboot e têm logs nativos

---

## Segurança (obrigatório antes de ir para produção)

Ver: [[ADR-002 — Segurança do Sync Agent]]

- [ ] Configurar `ufw`: bloquear toda entrada, permitir saída apenas 443 + 1433 + 53 + 123
- [ ] Criar usuário `heziom-sync` sem shell para rodar o serviço
- [ ] Arquivo `.env` com `chmod 600` — nunca no repositório Git
- [ ] Instalar e configurar `fail2ban`
- [ ] Habilitar `unattended-upgrades` para patches automáticos
- [ ] Verificar se roteador Heziom suporta bloqueio de entrada por IP
- [ ] Criar role limitada no Supabase (sem acesso a `auth`, `payment_approvals`, `cnab_batches`)
- [ ] Implementar `sync-watchdog` Edge Function (alerta Teams se sync parar > 2h)

---

## Referências

- [[ADR-001 — Sync Agent no Raspberry Pi]]
- [[ADR-002 — Segurança do Sync Agent]]
- [[HeziomOS — Arquitetura]]
- [[Estudo de APIs — Capacidades e Gaps]] — seção de pendências P2, P3
