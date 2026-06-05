---
tags: [ferramentas, flowbiz, substituicao, custo, marketing]
status: substituição-urgente
criado: 2026-06-05
atualizado: 2026-06-05
---

# Flowbiz — Análise Completa e Plano de Substituição

> **⚠️ Alerta de Custo:** Fatura de junho/2026 = **R$ 1.978,00**. Plano anual iniciou 26/06/2025 — janela de cancelamento sem multa: **~21 dias a partir de hoje**.

---

## 1. O que é a Flowbiz

Plataforma de **CRM de Marketing para e-commerce**, adquirida pela Sankhya em 2024. Foco em automação de vendas e fidelização via e-mail e WhatsApp com dados comportamentais de navegação e compra.

**Posicionamento:** "Régua de relacionamento automatizada" — recuperação de carrinho, recompra, reativação, fidelização via e-mail + WhatsApp no mesmo fluxo.

**Infraestrutura técnica:**
- Frontend/painel: `www.flowbiz.com.br` (Webflow)
- API de integração: documentada em `flowbiz.readme.io` (ex-Mailbiz)
- Tracking server: `stape.mailbiz.com.br`
- Central de ajuda: `cloudchat5.cloudhumans.com/hc/central-de-ajuda-flowbiz`
- Autenticação API: parâmetro `APIKey` em cada chamada (não há OAuth ou token separado)

---

## 2. Situação Atual da Conta Heziom (junho 2026)

| Item | Dado |
|------|------|
| **Plano** | CORP 200 — 200.000 envios/mês |
| **Valor do plano** | R$ 1.029,00/mês |
| **Início do contrato** | 26/06/2025 |
| **Vencimento anual** | ~26/06/2026 ⚠️ em 21 dias |
| **Fatura junho/2026** | **R$ 1.978,00** |
| **Excedente** | ~R$ 949,00 |
| **Utilização do plano** | 7% (faltam ~186.500 envios) |
| **Conta** | Editora Hez |

### Uso real — 01/06 a 30/06/2026

| Canal | Tipo | Volume |
|-------|------|--------|
| E-mail | Campanhas | 12.462 |
| E-mail | Envios Automáticos | 246 |
| E-mail | Fluxos | 803 |
| **E-mail Total** | | **13.511 de 200.000 (6,7%)** |
| WhatsApp | Campanhas | **0** |
| Contatos na base | | **96.718** |
| Listas | | **40** |
| Campanhas enviadas | | **3** (todas e-mail) |

> **Diagnóstico central:** A Heziom usa apenas e-mail básico — sem WhatsApp, sem recuperação de carrinho, sem fluxos avançados. Paga R$1.029 por 200.000 envios e usa 13.511. O plano está **14,8x superdimensionado**.

---

## 3. Mapeamento Completo das Funcionalidades

### 3.1 Módulos do produto (9 categorias na central de ajuda — ~159 artigos)

#### 📧 Campanhas (33 artigos documentados)
- Criação de campanhas de e-mail e CRM
- Editor Drag and Drop (arrasta e solta)
- Configuração de pré-cabeçalho e assunto
- Teste A/B de campanhas
- Segmentação de envio por lista ou segmento dinâmico
- Arquivo de campanha (link público)
- Relatórios de abertura, clique, descadastro, bounce

**Uso Heziom:** ✅ Em uso — 3 campanhas/mês, ~12.500 envios

#### 🗺️ Jornadas / Fluxos (7 artigos documentados)
- Recuperação de carrinho abandonado (E-mail + WhatsApp API + WhatsApp Manual)
- Envio em massa via WhatsApp por jornada
- Fluxos automáticos multicanal (WhatsApp + E-mail no mesmo fluxo)
- Gatilhos: comportamento de navegação, abandono de carrinho, compra finalizada
- Condições Se/Então (abriu e-mail, clicou, tem tag, etc.)
- Ações: enviar mensagem, atualizar campo, adicionar tag, webhook
- Teste A/B dentro de jornadas
- Receita influenciada por jornada vs. GA4

**Uso Heziom:** ✅ Parcialmente — 803 envios/mês via fluxos (baixo volume)

#### 👥 Listas de Contatos (17 artigos documentados)
- Criação de listas estáticas e segmentos dinâmicos
- Importação via CSV
- Campos padrão: nome, e-mail, telefone
- Campos personalizados por lista (dados do negócio)
- Tags para classificação de comportamento/funil
- Segmentação por: engajamento (abriu/clicou), dados cadastrais, comportamento
- Exportação de contatos
- Envios automáticos (autoresponder) por gatilho de lista
- Listas padrão criadas automaticamente: **Clientes** e **Assinantes**

**Uso Heziom:** ✅ Em uso — 96.718 contatos, 40 listas

#### 🤖 Autoresponder / Envios Automáticos
- Criação de sequências de e-mail por gatilho
- Gatilhos: entrada em lista, data comemorativa, comportamento no site
- Webhooks para sistemas externos
- Sequências com intervalos de tempo configuráveis
- Horários de funcionamento e condições de parada

**Uso Heziom:** ✅ Parcialmente — 246 envios/mês

#### 🏠 Landing Pages (26 artigos documentados)
- Criador de páginas de captura de leads (no-code)
- Página de agradecimento vinculada
- Segmentação automática de leads capturados em listas
- Integração com Google Analytics 4
- Formulários com campos personalizáveis
- Vinculação a automações (lead entra na LP → inicia jornada)

**Uso Heziom:** ❓ Não confirmado se usa

#### 📊 Métricas / Dashboard (6 artigos documentados)
- Dashboard de receita influenciada pelas campanhas
- Relatório de campanhas por desempenho (abertura, clique, conversão)
- Integração com Google Analytics 4 para atribuição de receita
- Criação e ajuste de "investimento" para cálculo de ROI
- Visualização de dados do Universal Analytics (legado)

**Uso Heziom:** ❓ Não confirmado se usa ativamente

#### 🔗 Integrações (44 artigos documentados)
Plataformas de e-commerce com integração nativa:
- **Tray** ✅ (relevante para Heziom)
- Shopify, WooCommerce, Magento, NuvemShop, VTEX, Loja Integrada
- Google Tag Manager (GTM) para tracking
- Google Analytics 4
- Sankhya (ERP — pós-aquisição)

**Mecanismo de integração:**
- Script `mb_track` (rastreamento comportamental no site)
- Script `mb_recover_cart` (recuperação de carrinho)
- Integration Hub Flowbiz (tag manager próprio)
- API REST para operações programáticas

**Uso Heziom:** ✅ Integração com Tray provavelmente ativa (tracking de pedidos)

#### 📱 WhatsApp via Meta API (11 artigos documentados)
- Integração oficial com Meta Business API
- Ativação e configuração do número
- Envio em massa (campanhas) — pay-as-you-go
- Mensagens em jornadas (cobradas só pela Meta, sem taxa Flowbiz)
- Limite de mensagens por dia (conforme tier Meta)
- Renovação de token de acesso Meta
- Foto de perfil do número WhatsApp

**Uso Heziom:** ❌ Zero mensagens enviadas em junho

#### 🔑 API de Integração
- Documentação: `flowbiz.readme.io`
- Autenticação: parâmetro `APIKey` em cada chamada
- Endpoints: Contatos (CRUD), Listas (CRUD), Campanhas (CRUD), Tags (CRUD), Autoresponder (CRUD), Segmentos, Campos personalizados, Arquivos/Mídia
- Versão: v3 (domínio `api.mailbiz.com.br/v3` — infraestrutura legada Mailbiz)
- Linguagens com exemplos: Go, NodeJS, C#, PHP, CURL

---

### 3.2 Funcionalidades do Universal Tracker (rastreamento comportamental)

Script instalado no site da Heziom (Tray) para capturar:

| Evento | O que captura |
|--------|---------------|
| `pageView` | Visualização de qualquer página |
| `accountSync` | Identificação do usuário logado |
| `productView` | Visualização de produto específico |
| `cartSync` | Estado atual do carrinho |
| `addToCart` | Adição de produto ao carrinho |
| `cartItemUpdate` | Atualização de quantidade/item |
| `cartSetPostalCode` | Cálculo de frete |
| `cartSetCoupon` | Aplicação de cupom |
| `checkoutStep` | Etapas do checkout |
| `orderComplete` | Pedido finalizado |

---

## 4. Estrutura de Custos Detalhada

### Plano base atual
| Plano | Envios e-mail/mês | Valor/mês |
|-------|-------------------|-----------|
| CORP 200 (atual) | 200.000 | **R$ 1.029,00** |

### Outros planos disponíveis (página de preços — jun/2026)

| Plano | Foco | Funcionalidades principais |
|-------|------|---------------------------|
| **Essential** | Iniciantes | Campanhas e-mail + WhatsApp, automação boas-vindas/aniversário, landing pages |
| **Scale** | E-commerces | Fluxos básicos por WhatsApp + e-mail, campanhas, recuperador de carrinho, botão WhatsApp pop-up |
| **Flow** | E-commerces avançados | Fluxos avançados por comportamento de compra, campanhas WhatsApp + e-mail, módulo CRM com histórico de compras, dashboard receita influenciada |
| **Prime** | Performance máxima | Tudo do Flow + integração nativa Sankhya/Ploomes, suporte prioritário, onboarding estendido, fluxos avançados |

> Todos os planos incluem: implantação 100% humanizada, especialistas em CRM, chat de ajuda.

### WhatsApp — pay-as-you-go (cobrado pela Flowbiz)
| Volume/mês | Valor unitário | Mínimo mensal |
|-----------|---------------|---------------|
| 1 – 5.000 | R$ 0,099 | **R$ 99,00** |
| 5.001 – 10.000 | R$ 0,079 | — |
| 10.001 – 25.000 | R$ 0,059 | — |
| 25.001 – 50.000 | R$ 0,055 | — |
| 50.001 – 1.000.000 | R$ 0,050 | — |

⚠️ A Meta cobra adicionalmente por conversa. Mensagens via módulo "Jornadas" são cobradas **só pela Meta** (sem taxa Flowbiz adicional).

### Por que a fatura chegou a R$ 1.978?
- Plano CORP 200: **R$ 1.029,00**
- Excedente identificado: **~R$ 949,00**
- Causas prováveis: taxa mínima WhatsApp (R$99) + cobranças de e-mails excedentes de meses anteriores + eventual taxa de e-mails excedentes do plano anterior + ajuste retroativo

---

## 5. O que a Heziom realmente usa vs. o que paga

| Recurso | Uso real | Necessidade real |
|---------|----------|-----------------|
| E-mail marketing (campanhas) | 3/mês, ~12.500 envios | ✅ Sim |
| Autoresponder | ~246 envios/mês | ✅ Sim (básico) |
| Fluxos de automação | ~803 envios/mês | ✅ Sim (básico) |
| Rastreamento comportamental (Tray) | Provavelmente ativo | ✅ Sim |
| WhatsApp | 0 envios | ❌ Não usa |
| Recuperação de carrinho | Não confirmado | ❓ A verificar |
| Landing Pages | Não confirmado | ❓ A verificar |
| Dashboard receita influenciada | Não confirmado | ❓ A verificar |
| Limite de 200.000 envios/mês | 13.511 usados (6,7%) | ❌ 14,8x superdimensionado |

**Conclusão:** A Heziom precisa de **e-mail marketing com automações básicas + tracking comportamental da Tray**. Está pagando por plano enterprise que não utiliza.

---

## 6. Alternativas para Substituição

### ✅ Opção 1 — Brevo (ex-Sendinblue) — Recomendada

| Item | Detalhe |
|------|---------|
| **Modelo de cobrança** | Por envio (não por contato) |
| **Custo estimado** | Plano Business ~R$150–250/mês para 20k envios/mês |
| **Contatos** | Ilimitados |
| **E-mail marketing** | ✅ Campanhas, automações, transacional |
| **WhatsApp** | ✅ Disponível se necessário no futuro |
| **Automações** | ✅ Fluxos, autoresponder, jornadas básicas |
| **Landing Pages** | ✅ Incluídas |
| **Integração Tray** | Via Zapier ou API REST |
| **Tracking comportamental** | Via script (similar ao Universal Tracker) |
| **Economia vs. atual** | **~R$1.700–1.800/mês** |

### Opção 2 — Klaviyo

| Item | Detalhe |
|------|---------|
| **Modelo** | Por contato ativo |
| **Custo estimado** | ~R$500–800/mês para 96k contatos |
| **Integração Tray** | ✅ Nativa |
| **Recuperação de carrinho** | ✅ Nativa e avançada |
| **Desvantagem** | Cobra por contato — base de 96k encarece |

### Opção 3 — RD Station Marketing

| Item | Detalhe |
|------|---------|
| **Custo estimado** | ~R$499–799/mês |
| **Suporte** | Português, time local |
| **Integração Tray** | ✅ Disponível |
| **Desvantagem** | Mais caro que Brevo para o volume atual |

### Opção 4 — Nativo Tray (sem ferramenta externa)

| Item | Detalhe |
|------|---------|
| **Custo** | Incluído no plano Tray |
| **Capacidade** | E-mail básico, recuperação de carrinho |
| **Desvantagem** | Recursos limitados de segmentação |

---

## 7. Plano de Substituição

### ⚡ Fase 0 — Esta semana (URGENTE)

- [ ] Confirmar data exata de vencimento do contrato (26/06/2025 → 26/06/2026 = **21 dias**)
- [ ] Verificar cláusula de multa por cancelamento antecipado
- [ ] Listar as 40 listas e identificar quais automações estão ativas
- [ ] Identificar se o tracking da Tray está ativo (Universal Tracker instalado?)
- [ ] Identificar se Landing Pages estão em uso
- [ ] Exportar base de 96.718 contatos com segmentação

### Fase 1 — Decisão e Setup (semanas 1–2)

- [ ] Escolher substituto (Brevo recomendado)
- [ ] Criar conta e configurar domínio de envio (DNS: SPF, DKIM, DMARC)
- [ ] Importar base de contatos com segmentos preservados

### Fase 2 — Migração (semanas 2–3)

- [ ] Recriar automações ativas na nova plataforma
- [ ] Recriar templates de e-mail
- [ ] Testar envios e entregabilidade
- [ ] Configurar integração com Tray (webhooks/API)
- [ ] Se Universal Tracker em uso: avaliar alternativa (Klaviyo nativo Tray ou script próprio)

### Fase 3 — Cutover (semana 3–4)

- [ ] Transferir campanhas ativas para nova plataforma
- [ ] Validar todos os fluxos funcionando
- [ ] **Cancelar Flowbiz antes de 26/06/2026**

---

## 8. Economia Projetada

| Cenário | Custo/mês | Economia/mês | Economia/ano |
|---------|-----------|-------------|-------------|
| Flowbiz atual | R$ 1.978 | — | — |
| **Brevo** | ~R$ 200 | **~R$ 1.778** | **~R$ 21.336** |
| Klaviyo | ~R$ 600 | ~R$ 1.378 | ~R$ 16.536 |
| RD Station | ~R$ 650 | ~R$ 1.328 | ~R$ 15.936 |
| Nativo Tray | R$ 0 | ~R$ 1.978 | ~R$ 23.736 |

---

## 9. Questões Abertas

| Questão | Impacto na decisão |
|---------|-------------------|
| O Universal Tracker (script) está instalado na Tray? | Define se precisa de substituto para tracking comportamental |
| Landing Pages da Flowbiz estão em uso? | Define se precisa de módulo LP no substituto |
| Há recuperação de carrinho configurada? | Define prioridade da migração desse fluxo |
| Cláusula de multa no contrato? | Define se cancela agora ou aguarda 26/06 |
| O custo excedente de R$949 é recorrente ou pontual? | Define urgência da troca |

---

## 10. Fontes e Referências

- Central de ajuda: `cloudchat5.cloudhumans.com/hc/central-de-ajuda-flowbiz`
- Documentação API: `flowbiz.readme.io`
- Página de planos: `flowbiz.com.br/planos`
- Dados de uso capturados em: 05/06/2026

---

Ver também: [[HeziomOS — Arquitetura]] · [[Processos Financeiros/Mapa de Automação]]
