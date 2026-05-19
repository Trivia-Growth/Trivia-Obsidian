---
tags: [adr, decisao, segurança, raspberry-pi, firewall, sync]
status: decidido
data: 2026-05-18
decisores: [Lucas Azevedo (Trivia)]
relacionado: [[ADR-001 — Sync Agent no Raspberry Pi]]
---

# ADR-002 — Modelo de Segurança do Sync Agent (Raspberry Pi)

## Superfície de ataque

O Pi é o componente mais crítico da arquitetura: tem acesso simultâneo ao banco de dados do ERP (SQL Server interno) e ao Supabase (internet). Um Pi comprometido poderia:

- Exfiltrar dados financeiros completos da Heziom
- Alterar dados no Supabase (se a service key vazar)
- Servir de pivô para atacar outros hosts da rede interna

**Por isso, o modelo de segurança é em camadas (defense-in-depth):** cada camada funciona independentemente. Uma camada comprometida não entrega o sistema inteiro.

---

## Arquitetura de rede com firewall

```
                    INTERNET
                       │
              ┌────────┴────────┐
              │  Roteador Heziom │
              │  (firewall 1)    │
              │                  │
              │  REGRA: bloquear │
              │  toda entrada    │
              │  para o Pi       │
              └────────┬────────┘
                       │ LAN
          ┌────────────┼─────────────────┐
          │            │                 │
   [outros hosts]  ┌───┴──────────────┐  [SQL Server]
   da rede Heziom  │  Raspberry Pi    │  192.168.18.10
                   │  (firewall 2     │       │
                   │   via iptables)  │◄──────┘ TCP 1433
                   │                  │  (leitura apenas)
                   │  Sync Agent Deno │
                   └────────┬─────────┘
                            │ HTTPS 443 (saída)
                            ▼
                       Supabase
                    (*.supabase.co)
```

---

## Camada 1 — Roteador / firewall de borda

Configurar no roteador da Heziom:

```
REGRA DE ENTRADA (WAN → Pi):
  DROP tudo para o IP do Pi (ex: 192.168.1.50)

REGRA DE SAÍDA (Pi → WAN):
  ALLOW TCP 443 (HTTPS) para *.supabase.co
  DROP todo o resto de saída do Pi (opcional, mas recomendado)
```

O Pi **nunca precisa receber conexões da internet**. Se alguém tentar acessá-lo de fora, o pacote é descartado no roteador antes de chegar.

> ℹ️ A Heziom usa roteador doméstico — regras por IP de origem podem não estar disponíveis. O `ufw` no Pi (Camada 2) é suficiente e cobre esse gap.

---

## Camada 2 — Firewall local no Pi (ufw)

`ufw` (Uncomplicated Firewall) é o firewall do Linux. Configuração mínima:

```bash
# Instalar e habilitar
sudo apt install ufw -y
sudo ufw default deny incoming   # bloqueia TODA entrada por padrão
sudo ufw default deny outgoing   # bloqueia toda saída por padrão

# Liberar apenas o necessário de saída
sudo ufw allow out 443/tcp       # HTTPS → Supabase
sudo ufw allow out 1433/tcp      # SQL Server Literarius (LAN)
sudo ufw allow out 53/udp        # DNS (necessário para resolver supabase.co)
sudo ufw allow out 123/udp       # NTP (relógio do sistema — importante para logs)

# SSH: só da LAN (para manutenção), nunca da internet
sudo ufw allow in from 192.168.1.0/24 to any port 22

# Habilitar
sudo ufw enable
sudo ufw status verbose
```

Resultado: o Pi **só consegue falar com o SQL Server e o Supabase**. Qualquer outro destino é bloqueado — mesmo que malware tente se comunicar com um C2 externo.

---

## Camada 3 — Credenciais e segredos

### Supabase: usar Service Role Key com privilégios mínimos

A `SERVICE_ROLE_KEY` padrão do Supabase tem acesso total ao banco. No Pi, usar uma chave com escopo reduzido:

```sql
-- No Supabase: criar role dedicada para o sync agent
-- Permissões: INSERT/UPDATE nas tabelas de réplica apenas
-- Sem acesso a: auth.users, payment_approvals, cnab_batches
```

Na prática: criar um segundo projeto Supabase ou usar RLS para limitar o que essa chave pode fazer.

### SQL Server: conta read-only

O usuário `acessoExterno` no Literarius deve ter **somente SELECT** nas tabelas necessárias:

```sql
-- No SQL Server Literarius (pedir para equipe Literarius executar):
CREATE LOGIN acessoExterno WITH PASSWORD = 'SENHA_FORTE';
USE Literarius;
CREATE USER acessoExterno FOR LOGIN acessoExterno;

-- Conceder SELECT apenas nas tabelas necessárias:
GRANT SELECT ON dbo.TituloFinanceiro TO acessoExterno;
GRANT SELECT ON dbo.ContaBancaria TO acessoExterno;
GRANT SELECT ON dbo.PedidoVenda TO acessoExterno;
GRANT SELECT ON dbo.NotaFiscal TO acessoExterno;
GRANT SELECT ON dbo.Estoque TO acessoExterno;
GRANT SELECT ON dbo.Parceiro TO acessoExterno;
GRANT SELECT ON dbo.Produto TO acessoExterno;
GRANT SELECT ON dbo.PlanoConta TO acessoExterno;
-- NÃO conceder: INSERT, UPDATE, DELETE, DROP, EXECUTE
```

### Arquivo .env: permissões restritas

```bash
# O .env nunca vai para o repositório Git
echo ".env" >> /opt/heziom-sync/.gitignore

# Apenas o usuário do serviço pode ler
chmod 600 /opt/heziom-sync/.env
chown heziom-sync:heziom-sync /opt/heziom-sync/.env
```

---

## Camada 4 — Isolamento do processo (usuário sem privilégios)

O Sync Agent roda como um usuário de sistema dedicado, sem senha e sem sudo:

```bash
# Criar usuário sem shell e sem home
sudo useradd --system --no-create-home --shell /usr/sbin/nologin heziom-sync

# O serviço systemd roda como esse usuário
# /etc/systemd/system/heziom-sync-estoque.service:
[Service]
User=heziom-sync
Group=heziom-sync
EnvironmentFile=/opt/heziom-sync/.env
ExecStart=/home/pi/.deno/bin/deno run --allow-net --allow-env /opt/heziom-sync/sync/estoque.ts
```

Se o processo for comprometido, ele não tem acesso a `sudo`, não pode instalar pacotes, não pode ler outros arquivos do sistema.

---

## Camada 5 — Atualizações automáticas de segurança

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Habilitar: "Automatically download and install stable updates"
```

Patches de segurança do OS aplicados automaticamente. Sem intervenção manual necessária.

---

## Camada 6 — Monitoramento e detecção

### Fail2ban (proteção contra brute force SSH)

```bash
sudo apt install fail2ban -y
# Configuração padrão já protege SSH:
# 5 tentativas falhas → bloqueia o IP por 10 minutos
```

### Log de acesso ao SQL Server

Solicitar à equipe Literarius que habilite o audit log do SQL Server para o usuário `acessoExterno`. Qualquer query fora do padrão (ex: SELECT em tabelas não autorizadas) gera alerta.

### Alerta de sync ausente

Se o Pi ficar mais de 2h sem sincronizar (falha de energia, crash, SD corrompido), o Supabase detecta via Edge Function scheduled e dispara alerta no Teams:

```ts
// supabase/functions/sync-watchdog/index.ts
// Roda a cada hora via Supabase Scheduled Functions
// Verifica: última sync_at em sync_log > agora - 2h
// Se sim → POST webhook Teams com alerta vermelho
```

---

## Resumo das regras

| Tráfego | Direção | Permitido? | Onde bloquear |
|---|---|---|---|
| Internet → Pi (qualquer porta) | Entrada | ❌ Nunca | Roteador + ufw |
| LAN → Pi porta 22 (SSH) | Entrada | ✅ Só da LAN | ufw |
| Pi → SQL Server 1433 (LAN) | Saída | ✅ | ufw |
| Pi → Supabase 443 (HTTPS) | Saída | ✅ | ufw |
| Pi → qualquer outro destino | Saída | ❌ | ufw |
| Pi → internet porta 80 (HTTP) | Saída | ❌ | ufw |
| Pi → outros hosts LAN | Saída/Entrada | ❌ (exceto SQL Server) | ufw |

---

## O que fazer em caso de comprometimento

1. **Desconectar o Pi da rede** imediatamente (cabo ou roteador)
2. **Revogar a `SERVICE_ROLE_KEY`** no Supabase (leva < 1 min no dashboard)
3. **Alterar senha do `acessoExterno`** no SQL Server
4. **Auditar logs** do SQL Server: quais queries foram feitas e quando
5. **Analisar o SD** do Pi offline para entender o vetor de ataque
6. **Reflashar o SD** com imagem limpa antes de reconectar

---

## Pendências para implementação

- [ ] Verificar se o roteador da Heziom suporta regras por IP de origem (firewall de borda)
- [ ] Criar usuário `acessoExterno` no SQL Server com permissões mínimas (equipe Literarius)
- [ ] Criar role dedicada no Supabase com escopo limitado para o sync agent
- [ ] Configurar ufw no Pi conforme Camada 2
- [ ] Configurar fail2ban
- [ ] Implementar sync-watchdog Edge Function no Supabase
- [ ] Documentar procedimento de emergência para a equipe Heziom

---

## Referências

- [[ADR-001 — Sync Agent no Raspberry Pi]] — hardware e arquitetura
- [[HeziomOS — Arquitetura]] — visão geral do sistema
- [[Projeto/Stories/STORY-009 — Setup Raspberry Pi Sync Agent]] — tarefas de implementação

---

*Decisão tomada em 2026-05-18 — Lucas Azevedo (Trivia)*
