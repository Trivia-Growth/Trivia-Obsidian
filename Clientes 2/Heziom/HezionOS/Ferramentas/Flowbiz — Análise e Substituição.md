---
tags: [ferramentas, flowbiz, substituicao, custo, marketing]
status: substituição-urgente
criado: 2026-06-05
---

# Flowbiz — Análise Completa e Plano de Substituição

> **Alerta:** Custo de junho/2026 chegou a **R$ 1.978,00** — substituição prioritária.

---

## Situação Atual (junho 2026)

| Item | Dados |
|------|-------|
| **Plano** | CORP 200 — 200.000 envios/mês |
| **Valor do plano** | R$ 1.029,00/mês |
| **Início do plano** | 26/06/2025 |
| **Utilização do plano** | 7% (faltam ~186.500 envios para o limite) |
| **Custo total junho** | **R$ 1.978,00** (plano + excedentes) |
| **Custo excedente** | ~R$ 949,00 (provavelmente WhatsApp pay-as-you-go) |
| **Conta** | Editora Hez |

### Uso do plano — 01/06/2026 a 30/06/2026

| Canal | Tipo | Volume |
|-------|------|--------|
| **E-mail** | Campanhas | 12.462 |
| **E-mail** | Envios Automáticos | 246 |
| **E-mail** | Fluxos | 803 |
| **E-mail** | **Total enviado** | **13.511 de 200.000** |
| **WhatsApp** | Campanhas | 0 |
| **Contatos** | Base total | 96.718 |
| **Listas** | Total | 40 |
| **Campanhas enviadas** | Total | 3 (todas de e-mail) |

**Conclusão de uso:** A Heziom usa apenas **6,7% do limite de e-mail** e **zero WhatsApp** — o plano CORP 200 está superdimensionado. O custo extra de R$949 deve vir de taxa fixa de WhatsApp (mínimo mensal R$99) + outra cobrança não visível nas telas.

---

## O que é a Flowbiz

Plataforma de **CRM de Marketing para e-commerce**, recentemente adquirida pela Sankhya. Foca em automação de vendas e fidelização via e-mail e WhatsApp.

**Posicionamento:** "Régua de relacionamento automatizada" — recuperação de carrinho, recompra, reativação, fidelização.

---

## Funcionalidades Mapeadas

### Módulos principais

| Módulo | Descrição | Uso atual Heziom |
|--------|-----------|-----------------|
| **Campanhas de E-mail** | Editor drag-and-drop, templates, envio em massa | ✅ Em uso (3 campanhas/mês) |
| **Fluxos (Automação)** | Jornadas multicanal automáticas (boas-vindas, pós-venda, recompra) | ✅ Em uso parcial (803 envios/mês) |
| **Envios Automáticos** | Autoresponders por gatilho | ✅ Em uso parcial (246 envios/mês) |
| **Jornadas** | Recuperação de carrinho, WhatsApp + e-mail combinados | ❌ Não usa |
| **Campanhas WhatsApp** | Disparos em massa via API Meta | ❌ Não usa |
| **CRM** | Segmentação por histórico de compras e comportamento | ❌ Não claro se usa |
| **Landing Pages** | Criador de páginas de captura | ❌ Não claro se usa |
| **Audiência/Pop-ups** | Captação de leads no site | ❌ Não claro se usa |
| **Dashboard de ROI** | Receita influenciada pelas automações | ❌ Não claro se usa |
| **Universal Tracker** | Rastreamento comportamental no site (scripts front-end) | ❌ Não claro se usa |

### Canais suportados
- **E-mail** — principal canal em uso
- **WhatsApp** — via Meta Business API (pay-as-you-go; mínimo R$99/mês)

### Integrações relevantes
- Tray (e-commerce da Heziom) ✅ — integração nativa disponível
- VTEX, Shopify, Nuvemshop, Loja Integrada
- Google Analytics
- Sankhya (ERP — pós-aquisição)
- API própria (REST, suporte a NodeJS, PHP, Go, C#)

---

## Estrutura de Custos

### Plano base
| Plano | Envios/mês | Valor |
|-------|-----------|-------|
| CORP 200 (atual) | 200.000 | R$ 1.029,00/mês |

### WhatsApp — pay-as-you-go (Flowbiz)
| Volume | Valor unitário | Mínimo mensal |
|--------|---------------|---------------|
| 1 – 5.000 | R$ 0,099 | **R$ 99,00** |
| 5.001 – 10.000 | R$ 0,079 | — |
| 10.001 – 25.000 | R$ 0,059 | — |
| 25.001 – 50.000 | R$ 0,055 | — |
| 50.001 – 1.000.000 | R$ 0,050 | — |

⚠️ **Importante:** Além do custo Flowbiz, a Meta cobra separadamente por conversa. Mensagens enviadas via módulo "Jornadas" são cobradas **só pela Meta** (sem taxa Flowbiz).

### Por que o custo chegou a R$ 1.978?
- Plano CORP 200: **R$ 1.029,00**
- Excedente estimado: **~R$ 949,00**
- Possíveis origens do excedente: taxa WhatsApp mínimo + cobranças de e-mail excedente de meses anteriores + taxa de envios automáticos fora do plano

> ⚠️ **Ponto crítico:** A Heziom usa apenas 13.511 de 200.000 envios mensais (6,7%) e paga R$1.029 de plano. O plano está ~15x superdimensionado para o uso real.

---

## Análise: O que a Heziom realmente usa

Com base nos dados de uso:

| Funcionalidade real | Volume | Alternativa óbvia |
|---------------------|--------|-------------------|
| E-mail marketing (campanhas) | ~3/mês, ~12.500 envios | Qualquer ESP básico |
| Automações simples | ~1.000 envios/mês | Brevo, Klaviyo, RD Station |
| Recuperação de carrinho | Não confirmado | Nativo da Tray ou Klaviyo |
| WhatsApp | Zero | Não necessário agora |
| CRM segmentado | Não confirmado | Nativo Tray + Literarius |

**Necessidade real:** Ferramenta de **e-mail marketing com automações básicas** para ~96.718 contatos com volume de ~15.000 envios/mês.

---

## Alternativas para Substituição

### Opção 1 — Brevo (ex-Sendinblue) ⭐ Recomendada
| Item | Detalhe |
|------|---------|
| **Custo estimado** | ~R$ 150–300/mês para 15k envios |
| **Contatos** | Ilimitados (cobra por envio, não por contato) |
| **E-mail** | ✅ Campanhas, automações, transacional |
| **WhatsApp** | ✅ Disponível se necessário |
| **Integração Tray** | ✅ Via Zapier ou API |
| **Economia estimada** | ~R$ 700–900/mês vs. atual |

### Opção 2 — Klaviyo
| Item | Detalhe |
|------|---------|
| **Custo estimado** | ~R$ 400–600/mês para 96k contatos |
| **Foco** | E-commerce (recuperação de carrinho nativa) |
| **Integração Tray** | ✅ Nativa |
| **Desvantagem** | Cobra por contato ativo — base de 96k pode encarecer |

### Opção 3 — RD Station Marketing
| Item | Detalhe |
|------|---------|
| **Custo estimado** | ~R$ 499–799/mês |
| **Foco** | Marketing brasileiro, suporte local |
| **Integração Tray** | ✅ Via RD Station |
| **Desvantagem** | Mais caro que Brevo para o uso atual |

### Opção 4 — Nativo Tray (sem ferramenta extra)
| Item | Detalhe |
|------|---------|
| **Custo** | Incluído no plano Tray |
| **Capacidade** | E-mail básico, recuperação de carrinho |
| **Desvantagem** | Menos recursos de segmentação e automação |

---

## Plano de Substituição

### Fase 0 — Imediato (esta semana)
- [ ] Confirmar quais automações e fluxos estão ativos na Flowbiz hoje (listar os 40 fluxos/listas)
- [ ] Exportar base de contatos (96.718) com segmentação
- [ ] Identificar quais templates de e-mail estão em uso
- [ ] Verificar se há contrato de fidelidade ou multa de cancelamento (início: 26/06/2025 → 1 ano = 26/06/2026 — **vence em ~3 semanas**)

### Fase 1 — Escolha e setup (semanas 1–2)
- [ ] Definir substituto (Brevo recomendado para o perfil de uso)
- [ ] Criar conta e configurar domínio de envio (DNS SPF/DKIM)
- [ ] Importar base de contatos com segmentos

### Fase 2 — Migração (semanas 2–3)
- [ ] Recriar automações ativas na nova plataforma
- [ ] Recriar templates de e-mail
- [ ] Testar envios e entregabilidade
- [ ] Configurar integração com Tray

### Fase 3 — Cutover (semana 3–4)
- [ ] Transferir campanhas ativas
- [ ] Validar que todos os fluxos estão funcionando no novo ambiente
- [ ] Cancelar Flowbiz (atentar à data de vencimento: ~26/06/2026)

---

## Economia Projetada

| Cenário | Custo mensal | Economia vs. atual |
|---------|-------------|-------------------|
| Flowbiz atual | R$ 1.978,00 | — |
| Brevo (estimado) | R$ 200,00 | **~R$ 1.778/mês** |
| Klaviyo (estimado) | R$ 500,00 | **~R$ 1.478/mês** |
| RD Station (estimado) | R$ 650,00 | **~R$ 1.328/mês** |

**Economia anual estimada com Brevo: ~R$ 21.000/ano**

---

## Próxima ação

1. **Checar contrato Flowbiz** — verificar se há multa de rescisão (vencimento estimado 26/06/2026)
2. **Levantar automações ativas** — o que não pode parar durante a migração
3. **Decidir substituto** — Brevo é a recomendação inicial, mas validar com o time

---

Ver também: [[HeziomOS — Arquitetura]] · [[Processos Financeiros/Mapa de Automação]]
