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

**Estado vivo do desenvolvimento** (não duplicar aqui — só ponteiro):
- Repo `Trivia-Growth/integradormovegourmet` (local: `~/Documents/Obsidian/Github/Move Gourmet`) →
  `docs/STATE.md` é a memória de trabalho viva (o que foi feito, próximo passo, bloqueios).
  `docs/ROADMAP.md` + `specs/000N-*/` são o backlog e as features entregues.

**Catálogo regional por CEP (🟢 deployado e testado ao vivo, INERTE; go-live segurado, 13/07):**
- [[CATALOGO-REGIONAL-CEP]] ← tudo (dados + tema + Function + App Proxy) **DEPLOYADO e INATIVO**.
  Classificação por estoque (regra do JG: `NACIONAL` só com saldo nos 2 CDs → **~62/82 viraram BA, a Nat
  precisa confirmar**) aplicada + metafields sincronizados. **Tema v3 testado AO VIVO no rascunho** (filtro
  BA×SP, guard PDP, aviso de disponibilidade, atributo de carrinho — tudo passou, 0 erros). **Function 6/6
  no runtime Wasm real** + e2e adversarial (21 agentes). App `integrador Movegourmet` (Dev Dashboard):
  versão **-6 LIVE** (Function INATIVA + App Proxy), versão **-7 staged** (checkout ext auto-fill do CEP,
  não liberada). **Nada customer-facing.** Go-live segurado (ordem: Nat confirma → publica tema → ativa
  Function → libera -7): passo-a-passo em `runbooks/catalogo-regional.md` (seção GO-LIVE) e §12.1.

**Reconciliação de catálogo (Omie × integrador × Shopify, em andamento desde 08/07):**
- [[RECONCILIACAO-CATALOGO-HANDOFF]] ← ponteiro pro handoff real (`docs/reconciliacao-catalogo/HANDOFF.md` no repo)
- [[Conferencia de estoque - devolutiva Nat - Jul 2026]]
- [[Relatorio - Atualizacao do Sistema e Estoque - Jul 2026]]
- `dados/Move Gourmet - De-Para Omie x Shopify (para Nat).xlsx` ← planilha original do de-para (30 alta, 10 revisar, 7 kit); base p/ o `product_map`
- `dados/` ← demais exports/planilhas de trabalho da reconciliação (CSVs do Shopify, backups Omie)

**Runbooks:**
- [[Runbook - Go-live do Integrador (Supabase) - Jul 2026]]
- [[Runbook - Packs no Omie (SKUs novos + Ordem de Producao) - Jul 2026]]

**Fundação do integrador (histórico da construção):**
- [[Omie - Mapeamento Estoque - Jul 2026]] ← levantamento inicial + plano de ação estoque
- [[Integrador Estoque Multi-CD - Especificação Técnica - Jul 2026]] ← spec técnica original
- [[Achado - SKUs Shopify x Omie - Jul 2026]] ← achado que motivou o integrador próprio (Hub casa por SKU, sem GID)
- [[Modelo de Sincronização de Estoque (regra oficial) - Jul 2026]] ← regra por tipo de item (final/variante/kit)
- [[Integrador - Status de Construção - Jul 2026]] ← diário da construção até o Fluxo A (histórico; estado atual está no `docs/STATE.md` do repo)

**Onboarding/diagnóstico inicial (24-30/06, histórico):**
- [[Credenciais - Move Gourmet]]
- [[Diagnóstico Shopify - Jun 2026]]
- [[Diagnóstico Appstle - Jun 2026]]
- [[Configuração Frete Shopify - Jun 2026]] ← frete, perfis, retirada em loja (concluído)
- [[Problema - Pagamentos sem provedor principal]] *(resolvido 24/06)*
- [[Problema - Omie sem Local de Estoque SP]] *(achado original refutado — ver nota abaixo)*
- [[Proposta Comercial - Correção Shopify e Omie]]
- [[Solução YOUMOVE — Business Premium]]

**Relatórios entregues:** ver `relatorios/` (Relatório Técnico Jun/2026, HTML+PDF).

---

## Plano de Ação - Acompanhamento

> Legenda: [x] resolvido | [ ] pendente | [~] em andamento

### Urgente - primeiros 5 dias

- [x] Corrigir falha ativa nos pagamentos - ver [[Problema - Pagamentos sem provedor principal]] *(resolvido 24/06 - Fernanda)*
- [~] Consolidar apps Omie: desativar "Omie Move Gourmet", manter apenas "Omie Shopify" *(01/07: confirmado com PROVA definitiva via Hub que "Omie Shopify" é o app vivo e "Omie Move Gourmet" é seguro remover — falta só executar a remoção, ver [[Omie - Mapeamento Estoque - Jul 2026]])*
- [x] Split de estoque Salvador×SP *(resolvido via integrador próprio — Fluxo A em produção desde a primeira semana de julho, sincronizando os 2 CDs; ver `docs/STATE.md` no repo)*
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
| 2026-07-02 | Construção do integrador próprio (repo `integradormovegourmet`, padrão Trivia) | Backlog de 8 épicos; fundação + banco Supabase |
| 2026-07-02 | Cruzamento de SKU Omie×Shopify (via API) | 🚨 Achado crítico: só 9/124 casam; 97 sem SKU |
| 2026-07-02 | Token Shopify resolvido (client_credentials) + Fluxo A construído | ✅ Sync de estoque por CD PRONTO no código, provado no real (shadow + write @idempotent) |
| 2026-07-02/11 | Integrador completo: Fluxo A+B em produção, painel no ar, reconciliação de catálogo, Padrão OS v3 instalado | ✅ — detalhe dia-a-dia no `docs/STATE.md` do repo (não duplicado aqui) |

---

## Próxima Sessão

> **Esta seção descrevia o arranque do projeto (02-03/07) e ficou desatualizada — muito já foi
> entregue desde então.** Estado vivo agora é o `docs/STATE.md` do repo. Resumo do que mudou desde
> a última atualização desta seção:
> - Token Shopify obtido, integrador construído e **em produção**: Fluxo A (sync de estoque
>   multi-CD) e Fluxo B (gravação de pedido no Omie, com fix de desconto) rodando.
> - Cruzamento de SKU concluído + reconciliação de catálogo completa (descontinuados, kits,
>   produtos novos) — ver [[RECONCILIACAO-CATALOGO-HANDOFF]].
> - Padrão OS v3 completo instalado no repo (squad `trivia-os`, hook de autoridade de push —
>   **push direto revogado, agora exclusivo do `@devops`**).
> - Painel do integrador no ar: https://movegourmet.netlify.app.
> - Catálogo regional por CEP (0009): 5/12 stories EM PROD (13/07) — ver [[CATALOGO-REGIONAL-CEP]] §12.

**Pendências conhecidas (não duplicar detalhe — ver fonte):**
- Rotacionar tokens expostos em chat (Supabase `sbp_`, Netlify `nfp_`, Omie APP_KEY/SECRET) —
  lista completa e atual no `docs/STATE.md` do repo.
- Itens manuais do Shopify aguardando a Nat (gramatura Mini Brownie, sucos naturais, possível
  duplicata) — `docs/reconciliacao-catalogo/acoes_manuais_shopify.md` no repo.
- Melhor Envio com CEP de SP como origem para pedidos de SP.
- Rotacionar credenciais Omie (APP_KEY/APP_SECRET) expostas durante a auditoria de junho.
- Verificar se o Appstle portal do cliente está ativo com troca de produtos habilitada.
