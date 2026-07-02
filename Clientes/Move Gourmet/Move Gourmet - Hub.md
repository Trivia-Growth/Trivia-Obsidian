---
tags:
  - cliente
  - ecommerce
  - shopify
  - omie
status: ativo
desde: 2026-06-24
---

# Move Gourmet

> Marca de alimentos funcionais ultracongelados com operação em Salvador (BA) e São Paulo (SP).
> Ecommerce: [movegourmet.com.br](https://movegourmet.com.br)
> Shopify Admin: [admin.shopify.com/store/9ja6tr-1i](https://admin.shopify.com/store/9ja6tr-1i)

---

## Contato

| Campo | Info |
|---|---|
| Proprietária | Fernanda Ferrari |
| Email | movegourmet@gmail.com |

---

## Stack Técnica

| Sistema | Situação |
|---|---|
| Shopify | Plano estimado Basic/Grow |
| ERP | Omie (integrado via custom app) |
| Pagamentos | Mercado Pago Cartões (provedor principal) + MP Checkout Pro + MP Pix |
| Frete | Melhor Envio (instalado), Frenet (desinstalado mas em config) |
| Assinatura | Appstle Subscription (Business $30/mês) |
| Reviews | Yotpo |
| Email/WhatsApp | SendWILL, Retentionly WhatsApp |

---

## Localizações de Estoque

| Localização | Cidade | CEP | Location ID Shopify |
|---|---|---|---|
| Rua Dr Gerino Silva | Lauro de Freitas / BA | 42703-160 | `85518483692` |
| Rua Dr João Toniolo, 112 - Jd São José, Pirituba | São Paulo / SP | 02969-000 | `92526051564` |

---

## Documentos e Notas

- [[Credenciais - Move Gourmet]]
- [[Diagnóstico Shopify - Jun 2026]]
- [[Problema - Pagamentos sem provedor principal]]
- [[Problema - Omie sem Local de Estoque SP]] *(achado original refutado — ver nota abaixo)*
- [[Omie - Mapeamento Estoque - Jul 2026]] ← levantamento atual + plano de ação estoque
- [[Integrador Estoque Multi-CD - Especificação Técnica - Jul 2026]] ← spec técnica p/ construir o integrador Omie↔Shopify multi-CD
- [[Configuração Frete Shopify - Jun 2026]] ← frete, perfis, retirada em loja (concluído)
- [[Proposta Comercial - Correção Shopify e Omie]]

---

## Plano de Ação - Acompanhamento

> Legenda: [x] resolvido | [ ] pendente | [~] em andamento

### Urgente - primeiros 5 dias

- [x] Corrigir falha ativa nos pagamentos - ver [[Problema - Pagamentos sem provedor principal]] *(resolvido 24/06 - Fernanda)*
- [~] Consolidar apps Omie: desativar "Omie Move Gourmet", manter apenas "Omie Shopify" *(01/07: confirmado com PROVA definitiva via Hub que "Omie Shopify" é o app vivo e "Omie Move Gourmet" é seguro remover — falta só executar a remoção, ver [[Omie - Mapeamento Estoque - Jul 2026]])*
- [~] Configurar Omie para enviar estoque à localização SP *(achado original de 25/06 estava ERRADO — o depósito SP existe e já tem saldo. O que falta é o Omie.Hub mapear local Shopify→depósito Omie, travado por limitação da UI do Hub; chamado aberto com suporte Omie. Ver [[Omie - Mapeamento Estoque - Jul 2026]])*
- [x] Adicionar localização SP às tarifas de frete *(01/07: consolidado num único "Perfil Geral" com origens Salvador+SP, ver [[Configuração Frete Shopify - Jun 2026]])*
- [x] Adicionar tarifa de frete na zona Bahia do Perfil Geral *(01/07: Bahia incluída na zona Norte/Nordeste do Perfil Geral)*

### Alta prioridade - dias 6 a 15

- [ ] Cadastrar telefone na localização SP (Rua Dr João Toniolo) *(resp: Agência)*
- [x] Excluir perfis de frete AMIGAS e BRASIL TESTE (sem uso) *(feito — 0 produtos / produto realocado)*
- [ ] Limpar produtos duplicados com "(Cópia)" e "(Plano anual via pix)" *(resp: Agência)*
- [x] Verificar e resolver inconsistência do Frenet *(decisão: MANTER como está — uso exclusivo p/ produto congelado com entrega agendada, não mexer)*
- [ ] Configurar Melhor Envio com CEP SP como remetente *(depósito SP confirmado ativo com saldo — não é mais bloqueante; falta só executar)*
- [x] Configurar retirada em loja (Shopping Barra, Salvador) *(01/07: concluído, ver [[Configuração Frete Shopify - Jun 2026]] — ressalva: estoque da loja é controlado no Linx, não no Omie)*

### Estratégico - 30 a 60 dias

- [ ] Avaliar upgrade para plano Advanced (US$299/mês) para ativar frete calculado por transportadora *(resp: Fernanda decidir)*
- [ ] Definir política de estoque mínimo por SKU por localização *(resp: Fernanda + Omie)*
- [ ] Decidir caminho para o split de estoque Salvador×SP no Omie.Hub — ver "Plano B" em [[Omie - Mapeamento Estoque - Jul 2026]] (3 opções: híbrido pragmático / conector terceiro / integração própria)
- [ ] Recomendação registrada: se quiserem manter a retirada em loja confiável, migrar o estoque da loja física do Linx para o Omie

---

## Histórico de Atividades

| Data | Atividade | Resultado |
|---|---|---|
| 2026-06-24 | Auditoria técnica completa do Shopify | Diagnóstico gerado |
| 2026-06-24 | Diagnóstico de integração Omie | 2 apps conflitantes identificados |
| 2026-06-24 | Diagnóstico de pagamentos | Provedor principal ausente identificado |
| 2026-06-24 | Mercado Pago Cartões ativado como provedor principal | Resolvido por Fernanda |
| 2026-06-25 | Auditoria do Omie - Locais de Estoque | Achado inicial (depois refutado, ver 01/07) |
| 2026-06-30/01-07 | Consolidação de frete: Perfil Geral único (Salvador+SP), 27 estados em 2 zonas, perfis órfãos excluídos | ✅ Concluído |
| 2026-07-01 | Retirada em loja configurada (Shopping Barra, Salvador) | ✅ Concluído — ressalva: estoque no Linx, não no Omie |
| 2026-07-01 | Auditoria via API do Omie (locais, produtos, estoque, pedidos) | Refuta achado de 25/06: 6 locais existem, SP tem saldo real |
| 2026-07-01 | Identificação definitiva do app Shopify↔Omie ativo | "Omie Shopify" confirmado vivo (credenciais batem no Hub); "Omie Move Gourmet" seguro remover |
| 2026-07-01 | Acesso ao Omie.Hub liberado + investigação do mapeamento local→depósito | Confirmado: Hub NÃO tem campo de depósito na UI; chamado aberto com suporte Omie (Kim) |

---

## Próxima Sessão

> **DECISÃO 02/07: construir integrador próprio Omie↔Shopify multi-CD e colocar em produção.**
> O Hub é single-location (não resolve o split). Spec técnica completa + certificada via API em
> [[Integrador Estoque Multi-CD - Especificação Técnica - Jul 2026]].

**Fila de execução (produção):**
- [ ] Obter token da Admin API do Shopify via **Dev Dashboard → instalar app na loja** (apps legados desativados pela Shopify em 01/01/2026; não mexer no "Omie Shopify" do Hub)
- [ ] Cruzamento de SKU Omie `cCodigo` ↔ Shopify `variant.sku` (lado Omie já extraído: 1.432 SKUs)
- [ ] Mapear a etapa de faturamento no Kanban da Omie (vistos "60"/"70", não "50")
- [ ] Fase 0 (PoC leitura+escrita) → Fase 1 (sync de estoque, cutover do Hub via Strangler Fig)
- [ ] Excluir/rotacionar o app OAuth criado por engano (client secret `shpss_` exposto no chat 02/07)

**Pendências paralelas:**
- Configurar Melhor Envio com CEP de SP como origem para pedidos de SP
- Remover app legado "Omie Move Gourmet" (já confirmado seguro — só falta executar)
- Rotacionar credenciais Omie (APP_KEY/APP_SECRET) expostas no chat durante a auditoria
- Ajustar no Omie o saldo -1 do `PMUND PASTEL DE BACALHAU` em SP
- Verificar se o Appstle portal do cliente está ativo com troca de produtos habilitada
