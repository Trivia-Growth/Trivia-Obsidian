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
- [[Problema - Omie sem Local de Estoque SP]]
- [[Proposta Comercial - Correção Shopify e Omie]]

---

## Plano de Ação - Acompanhamento

> Legenda: [x] resolvido | [ ] pendente | [~] em andamento

### Urgente - primeiros 5 dias

- [x] Corrigir falha ativa nos pagamentos - ver [[Problema - Pagamentos sem provedor principal]] *(resolvido 24/06 - Fernanda)*
- [ ] Consolidar apps Omie: desativar "Omie Move Gourmet", manter apenas "Omie Shopify" *(resp: Agência + Omie)*
- [ ] Configurar Omie para enviar estoque à localização SP - ver [[Problema - Omie sem Local de Estoque SP]] *(resp: Equipe Omie)*
- [ ] Adicionar localização SP ao Perfil Avulsas com tarifas de frete *(resp: Agência)*
- [ ] Adicionar tarifa de frete na zona Bahia do Perfil Geral *(resp: Agência)*

### Alta prioridade - dias 6 a 15

- [ ] Cadastrar telefone na localização SP (Rua Dr João Toniolo) *(resp: Agência)*
- [ ] Excluir perfis de frete AMIGAS e BRASIL TESTE (sem uso) *(resp: Agência)*
- [ ] Limpar produtos duplicados com "(Cópia)" e "(Plano anual via pix)" *(resp: Agência)*
- [ ] Verificar e resolver inconsistência do Frenet (desinstalado mas aparece ativo) *(resp: Agência)*
- [ ] Configurar Melhor Envio com CEP SP como remetente após depósito SP ativo *(resp: Agência)*

### Estratégico - 30 a 60 dias

- [ ] Avaliar upgrade para plano Advanced (US$299/mês) para ativar frete calculado por transportadora *(resp: Fernanda decidir)*
- [ ] Definir política de estoque mínimo por SKU por localização *(resp: Fernanda + Omie)*

---

## Histórico de Atividades

| Data | Atividade | Resultado |
|---|---|---|
| 2026-06-24 | Auditoria técnica completa do Shopify | Diagnóstico gerado |
| 2026-06-24 | Diagnóstico de integração Omie | 2 apps conflitantes identificados |
| 2026-06-24 | Diagnóstico de pagamentos | Provedor principal ausente identificado |
| 2026-06-24 | Mercado Pago Cartões ativado como provedor principal | Resolvido por Fernanda |
| 2026-06-25 | Auditoria do Omie - Locais de Estoque | Confirmado: nenhum local adicional configurado |

---

## Próxima Sessão

- Acionar time técnico do Omie para criar Depósito SP e mapear no Shopify - ver [[Problema - Omie sem Local de Estoque SP]]
- Executar configurações de frete (Perfil Avulsas + Perfil Geral zona BA)
- Verificar se o Appstle portal do cliente está ativo com troca de produtos habilitada
