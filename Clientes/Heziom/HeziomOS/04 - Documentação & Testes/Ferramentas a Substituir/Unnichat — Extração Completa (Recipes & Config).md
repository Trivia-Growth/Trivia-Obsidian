---
tags: [heziom, unnichat, whatsapp, recipes, automação, extração, migração]
status: extraído
criado: 2026-06-19
fonte: "Painel Unnichat — conta comercial@editoraheziom.com.br"
---

# Unnichat — Extração Completa (Recipes, Templates & Config)

> Extração feita em 19/06/2026 diretamente do painel Unnichat da Heziom.
> Objetivo: documentar tudo que precisa ser replicado no HeziomOS antes de desligar a Unnichat.

---

## 1. Conexão Ativa

| Campo | Valor |
|---|---|
| **Número** | +55 11 94498-6855 |
| **WABA** | Unnichat |
| **Limite** | 100.000 conversas / 24h |
| **Verificação empresarial** | Verificado |
| **Status da conta** | APROVADO |
| **Qualidade** | ALTA |

---

## 2. Atendentes Cadastrados

| Nome | Email | Área | Status |
|---|---|---|---|
| Ivanise Bittencourt | vendas@editoraheziom.com.br | SAC | Online |
| Bruno Matos | bruno@editoraheziom.com.br | Atacado | Online |
| Hevelyn Viana | vendas2@editoraheziom.com.br | Atendimento | Online |
| Lucas Silva | lucas_ds94@hotmail.com | Atendimento | Online |
| Bianca Assis | marketing@editoraheziom.com.br | Marketing | Offline |

**Áreas:** SAC, Atacado, Atendimento, Marketing

---

## 3. Automações (Fluxos)

### 3.1 Fluxo: "Recebendo Lead" (ATIVO — criado 23/09/2025)

**Trigger:** O cliente enviar qualquer mensagem

**Lógica do fluxo:**

```
1. TRIGGER: Cliente envia qualquer mensagem
      │
2. CONDIÇÃO: O contato possui tag "Em Andamento"?
      ├── SIM → (pula menu, vai direto pro atendente já atribuído)
      └── NÃO → continua ↓
      │
3. CONDIÇÃO: Horário comercial?
      │   Atende: Seg-Sex, 08:00-18:00
      ├── SIM → Mensagem de boas-vindas + Menu
      └── NÃO → (provavelmente mensagem fora do horário)
      │
4. MENSAGEM: "Bem-vindo(a) à Editora Heziom."
      │
5. AGUARDAR 15 minutos
      │
6. MENU INTERATIVO:
      "Obrigado pelo contato. Estamos prontos para ajudar.
       Para melhor atendê-lo(a), clique em 'Acesse Ao Menu'
       logo abaixo e selecione a opção desejada."
      
      Opções:
      🖥 Comprar Pelo Site         (41%)
      📚 Comprar Atacado           (7%)
      🚛 Rastreie o pedido         (17%)
      💲 Financeiro                (3%)
      📦 Problema c/ pedido        (16%)
      🌷 Mães da Aliança 2026      (11%)
      📖 Bíblia 120 anos IPP       (5%)
      📝 Publicação de Livro        (0%)
      │
7. ROTEAMENTO POR OPÇÃO:
      │
      ├── 🖥 Comprar Pelo Site →
      │     Msg: "Obrigado por selecionar uma opção 😊 Estamos com um tempo
      │           de resposta um pouco maior que o normal, mas já direcionamos
      │           sua mensagem e em breve um atendente falará com você.
      │           Caso queira comprar diretamente pelo site, segue o link
      │           abaixo ou aguarde para ser atendido: Acesse ao site:"
      │     Atribuir: Hevelyn Viana
      │
      ├── 📚 Comprar Atacado →
      │     Msg: "Obrigado... Estamos com um tempo de resposta um pouco maior...
      │           Para adiantarmos, nosso setor de atacado é somente voltado
      │           para livrarias físicas, igrejas e sites próprios.
      │           Sua loja se encaixa nesse perfil?"
      │     Atribuir: Bruno Matos
      │
      ├── 🚛 Rastreie o pedido →
      │     Msg: "Obrigado... Mas para adiantar, por favor, informe seu nome
      │           completo ou número do seu pedido."
      │     Atribuir: Hevelyn Viana
      │
      ├── 💲 Financeiro →
      │     Msg: "Obrigado... em breve um atendente falará com você."
      │     Atribuir: Ivanise Bittencourt
      │
      ├── 📦 Problema c/ pedido →
      │     Msg: "Obrigado... Para adiantarmos, poderia me dizer qual é o
      │           problema do seu pedido?"
      │     Atribuir: Hevelyn Viana
      │
      ├── 🌷 Mães da Aliança 2026 →
      │     Msg: "Obrigado... em breve um atendente falará com você."
      │     Atribuir: Ivanise Bittencourt
      │
      ├── 📖 Bíblia 120 anos IPP →
      │     Msg: "Obrigado... em breve um atendente falará com você."
      │     Atribuir: Lucas Silva
      │
      └── 📝 Publicação de Livro →
            Msg: "Olá! 😊 Ficamos muito felizes com o seu interesse em publicar
                  sua obra pela Editora Heziom. Para que possamos conhecer melhor
                  o seu projeto, pedimos que preencha o formulário de avaliação de
                  originais através do link abaixo (clique no botão).
                  Nossa equipe editorial analisará as informações enviadas e,
                  caso o manuscrito esteja alinhado com a linha editorial e o
                  catálogo da editora, entraremos em contato...
                  📚 Editora Heziom ✍️"
            Botão: "Quero Publicar"
            (Não atribui atendente — self-service via formulário)

8. APÓS ATRIBUIÇÃO:
      Tag adicionada: #Em Andamento
      Aguardar 1 segundo → próximo passo
```

**Resumo de roteamento:**

| Opção | Atendente | Área |
|---|---|---|
| Comprar Pelo Site | Hevelyn Viana | Atendimento |
| Comprar Atacado | Bruno Matos | Atacado |
| Rastreie o pedido | Hevelyn Viana | Atendimento |
| Financeiro | Ivanise Bittencourt | SAC |
| Problema c/ pedido | Hevelyn Viana | Atendimento |
| Mães da Aliança 2026 | Ivanise Bittencourt | SAC |
| Bíblia 120 anos IPP | Lucas Silva | Atendimento |
| Publicação de Livro | (sem atribuição — formulário externo) | — |

---

### 3.2 Fluxo: "Leads sem resposta" (DESATIVADO — criado 23/12/2025)

**Trigger:** Inicia a automação "Recebendo Lead"

**Lógica:**
```
1. Contato não respondeu por 30 minutos
      └── (sem ação configurada — fluxo incompleto/desativado)
```

> Nota: Este fluxo está desativado e parece inacabado. Provavelmente seria um follow-up para leads que não responderam ao menu.

---

## 4. Templates Aprovados (30 total)

### Templates de Utilidade (12)

| # | Nome | Corpo (quando capturado) |
|---|---|---|
| 1 | `problem_pedido` | "Olá, verificamos um problema no seu pedido." |
| 2 | `teste_bianca_omni` | — |
| 3 | `conversa_cliente` | — |
| 4 | `continua_o_atendimento_depois_liga_o` | — |
| 5 | `inicial_hzm_atendimento` | "Olá, aqui é a Ivanise do atendimento. Recebemos sua mensagem e em breve vamos retornar com todas as informações." |
| 6 | `pagamentopendente` | — |
| 7 | `inicial_hzm_atacado` | — |
| 8 | `continua_atendimento` | — |
| 9 | `inicial_hzm_generico` | — |
| 10 | `resposta_cliente_hzm` | — |
| 11 | `continuacao_atendimento_tel` | — |
| 12 | `atendimento_conclusao` | — |
| 13 | `tempo_de_atendimento` | — |

### Templates de Marketing (17)

| # | Nome | Uso provável |
|---|---|---|
| 1 | `_congresso_mda_remarketing_ominchat_` | Remarketing evento MDA |
| 2 | `_congresso_mda_abordagem_` | Abordagem evento MDA |
| 3 | `hor_riolivraria_1` | Campanha Rio Livraria |
| 4 | `continuar_atendimento1` | Retomar conversa (janela fechada) |
| 5 | `solas_20h` | Campanha livro "Solas" — 20h |
| 6 | `tratados_pr_venda_abnega_o` | Campanha "Tratados" — venda |
| 7 | `inicio_de_atendimento` | Iniciar atendimento (janela fechada) |
| 8 | `voce_tem_um_momento1` | Reengajamento |
| 9 | `dados_para_sorteio` | Coleta dados para sorteio |
| 10 | `solas_23h_ultima_chance` | Campanha "Solas" — última chance |
| 11 | `solas` | Campanha "Solas" — base |
| 12 | `continuar_atendimento` | Retomar conversa |
| 13 | `chave_pix1234` | Envio de chave Pix |
| 14 | `b_bl_personalizadas` | Campanha Bíblias personalizadas |
| 15 | `aguardando_resposta1` | Follow-up aguardando resposta |
| 16 | `continuar_atendimento123` | Retomar conversa (variante) |
| 17 | `comercial_igrejas` | Prospecção comercial igrejas |

---

## 5. Seções Vazias (sem configuração)

| Seção | Status |
|---|---|
| Broadcasts | Vazio (1 draft sem conteúdo) |
| Webhooks | Nenhum configurado |
| CRM Pipelines | Nenhum pipe criado |
| Campos customizados | Nenhum campo |
| Redirect | Nenhuma regra |

---

## 6. Tags em Uso

- `#Em Andamento` — aplicada automaticamente pelo fluxo "Recebendo Lead" após atribuição de atendente

---

## 7. Equivalência para HeziomOS

### O que precisa ser replicado (essencial):

| Unnichat | HeziomOS | Prioridade |
|---|---|---|
| Fluxo "Recebendo Lead" (menu + roteamento) | `crm-meta-wa-webhook` + `crm-flow-action-executor` | **ALTA** |
| Roteamento por opção → atendente | Regras de distribuição no módulo Atendimento | **ALTA** |
| Tag "#Em Andamento" automática | Tagueamento automático no CRM | ALTA |
| Condição horário comercial (Seg-Sex 08-18) | Lógica no executor de fluxo | ALTA |
| Condição "já tem tag = pular menu" | Check de tag antes de menu | MÉDIA |
| Templates de Utilidade (13) | Recriar na WhatsApp Cloud API (mesmo WABA) | ALTA |
| Templates de Marketing (17) | Recriar na WhatsApp Cloud API | MÉDIA |

### O que NÃO precisa replicar:

- CRM/Pipelines — não estavam em uso na Unnichat (o CRM real será no HeziomOS)
- Webhooks — nenhum configurado
- Broadcasts — nenhuma campanha salva
- Campos customizados — vazios
- Fluxo "Leads sem resposta" — desativado e incompleto

---

## 8. Atenção: Migração de Templates

Os templates aprovados estão vinculados ao **WABA da Unnichat** (número +55 11 94498-6855). Quando migrar para o HeziomOS usando a WhatsApp Cloud API diretamente:

1. Se usar o **mesmo WABA/número**, os templates já existem e podem ser chamados por nome
2. Se criar um **novo app** conectado ao mesmo número, os templates precisam ser re-submetidos para aprovação
3. O token permanente do System User (já extraído) acessa o mesmo WABA — os templates devem estar acessíveis

**Recomendação:** Verificar via API se os templates aparecem com o token que já temos:
```
GET https://graph.facebook.com/v21.0/{WABA_ID}/message_templates
Authorization: Bearer {TOKEN}
```
