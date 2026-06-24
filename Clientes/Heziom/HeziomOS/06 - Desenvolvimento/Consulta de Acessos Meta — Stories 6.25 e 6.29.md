---
tags: [heziom, heziomos, meta, whatsapp, instagram, permissões, verificação]
status: verificado
criado: 2026-06-24
fonte: "Meta Business Manager + Meta for Developers — verificação via browser"
---

# Consulta de Acessos Meta — Stories 6.25 e 6.29

> Verificação executada em 24/06/2026 diretamente nos painéis da Meta.
> Referência: nota original com os passos de verificação (arquivo anexado à sessão).

---

## Resultado

```
6.25 - Qualidade do número WhatsApp
- System User com acesso às duas WABAs: SIM (implícito — Admin do BM + app registrado nas WABAs)
- Permissões whatsapp_business_management + whatsapp_business_messaging: SIM
- Token sem expiração: SIM
- Veredicto: PRONTO — pode implementar sem pedido externo.

6.29 - Instagram DM
- Conta IG profissional ligada a Página FB: SIM
- instagram_manage_messages com Advanced Access: Standard (NÃO Advanced)
- pages_messaging com Advanced Access: Standard (NÃO Advanced)
- App em modo Live: NÃO (modo Development)
- Veredicto: PRECISA SOLICITAR → App Live + Advanced Access (detalhes abaixo)
```

---

## 6.25 — Qualidade do número WhatsApp (PRONTO)

### Dados verificados

| Item | Resultado | Detalhe |
|---|---|---|
| System User | "Admin" (ID: `61578149491508`), função Admin no BM |
| App atribuído | "Jornadas Flowbiz" (`717205734571633`) — Acesso total |
| WABAs no app | Ambos os números aparecem no dev console (WABA `1140360874094314` e `1879204222622839`) |
| `whatsapp_business_management` | Pré-selecionada no token |
| `whatsapp_business_messaging` | Pré-selecionada no token |
| Token sem expiração | Opção "Nunca" disponível e usada na geração anterior |

### Todas as permissões do token atual (5)

1. `ads_read`
2. `business_management`
3. `read_insights`
4. `whatsapp_business_management`
5. `whatsapp_business_messaging`

### Recomendação (não bloqueante)

Atribuir explicitamente as WABAs como ativos do System User (Configurações > Usuários do sistema > Admin > Gerenciar > adicionar Contas do WhatsApp). A API já funciona sem isso (Admin tem acesso implícito), mas é boa prática para auditoria.

---

## 6.29 — Instagram DM (PRECISA SOLICITAR)

### Dados verificados

| Item | Resultado | Detalhe |
|---|---|---|
| Conta Instagram | `@editoraheziom` (ID: `17841444303007148`) — profissional |
| Vinculada a Página FB | SIM — Página "Editora Heziom" (ID: `107843547845696`) |
| `instagram_manage_messages` | **Standard Access** — funciona só para teste |
| `instagram_business_manage_messages` | **Standard Access** — variante business, também Standard |
| `pages_messaging` | **Standard Access** |
| App modo | **Development** (NÃO Live) |

### O que fazer para habilitar (3 passos)

**Passo 1 — Colocar o app em modo Live:**
- Meta for Developers → App "Jornadas Flowbiz" → toggle "Ao vivo" no topo
- Pré-requisito: Política de Privacidade e URL dos Termos preenchidos em Configurações Básicas

**Passo 2 — Solicitar Advanced Access para `instagram_manage_messages`:**
- Meta for Developers → App → Permissões e recursos → "Solicitar acesso avançado"
- A Meta pedirá: descrição do uso, screencast demonstrando o fluxo, política de privacidade
- Tempo de aprovação: ~2-5 dias úteis

**Passo 3 — Solicitar Advanced Access para `pages_messaging`:**
- Mesmo processo do passo 2
- Necessário para processar mensagens via webhook em nome da Página

### Nota sobre `instagram_business_manage_messages`

A Meta tem essa permissão mais recente como alternativa. Verificar na documentação qual é a correta para o fluxo — pode ser suficiente apenas esta sem a legacy `instagram_manage_messages`.

---

## Outros System Users no BM

| Nome | ID | Função | Ativo atribuído |
|---|---|---|---|
| **Admin** | `61578149491508` | Admin | App "Jornadas Flowbiz" (acesso total) |
| **Conversions API System User** | `61578220260829` | Employee | (CAPI — outro propósito) |

---

## Resumo executivo

| Story | Status | Ação |
|---|---|---|
| **6.25** (Qualidade WhatsApp) | **PRONTO** | Implementar direto |
| **6.29** (Instagram DM) | **PRECISA SOLICITAR** | App → Live + Advanced Access (~2-5 dias) |

---

*Verificado em 24/06/2026 via acesso direto ao Meta Business Manager e Meta for Developers da Heziom.*
