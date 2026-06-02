---
projeto: "Contabilia"
cliente: "Trívia Studio (produto próprio)"
piloto: "T Lima Contabilidade"
status: "pré-venda / piloto em prospecção"
inicio: 2026-05-27
---

# Contabilia

> Camada inteligente que se pluga **por cima** do sistema contábil do escritório (Contmatic, Domínio…), sem substituí-lo. Espinha = um sistema financeiro que o cliente PME usa no dia a dia e que, como subproduto, alimenta o contábil com dado organizado. Vendido ao escritório (office-led), implementação por cliente. Pronúncia: **con-ta-BÍ-lia**.

---

## Estado atual (jun/2026)

- **Posicionamento e estratégia fechados** (camada por cima, office-led, base única configurável).
- **Pesquisa concluída**: providers fiscais, Contmatic × Domínio, fundamentos da reforma.
- **1º piloto em prospecção**: T Lima Contabilidade (usa sistema contábil Domínio + Onvio). Proposta e apresentação prontas.
- **Ainda não há código** — próximo passo é wireframe do loop central + setup.

---

## Navegação

### Estratégia e produto (ATUAL)
| Documento | O que é |
|---|---|
| [[Alinhamento-Reposicionamento]] | A virada de posicionamento vs a spec original do Lucas. **Comece por aqui.** |
| [[MVP-Especificacao]] | Spec de MVP atual: loop central, adapters plugáveis, schema, fases, riscos, stack |
| [[Reforma-Tributaria-Fundamentos]] | IBS/CBS, split payment, cronograma 2026-2033, Simples Híbrido, o que o Contabilia precisa fazer |

### Pesquisa (verificada)
| Documento | O que é |
|---|---|
| [[Comparativo-Provedores-Fiscais]] | Emissores de NF: Focus (principal) × nfe.io (plano B). Nuvem Fiscal descartada (descontinuada) |
| [[Comparativo-Contmatic-vs-Dominio]] | Sistemas contábeis: features, limites, preços, regra de bolso por porte |

### Piloto — T Lima Contabilidade
| Documento | O que é |
|---|---|
| [[Proposta-TLima]] | Proposta de parceria piloto (texto). Preço, escopo, custos |
| `Apresentacao-TLima.html` | **Deck de vendas** (abrir no navegador, navegar com setas). Design system Trívia |
| [[Brief-Reuniao-TLima]] | Brief interno de reunião: o que vender, o que NÃO vender (Onvio), perguntas-chave |

### Originais do Lucas (SUPERADOS — não usar como premissa)
| Documento | Observação |
|---|---|
| [[Apresentacao-Projeto]] | Visão inicial. Superada pelo reposicionamento |
| [[Especificacao-Tecnica]] | Spec inicial. Boa base, mas ver MVP-Especificacao |
| `apresentacao-vendas.html` · `prototype-contabilia.html` · `apresentacao-contabilia.pptx` · `roteiro-notebooklm-contabilia.md` · `gerar-apresentacao-contabilia.py` | Artefatos da versão original |

---

## Decisões-chave (snapshot)

| Tema | Decisão |
|---|---|
| Posicionamento | Camada **por cima** do sistema contábil, não substitui. SaaS por dentro (código único), implementação por fora |
| Espinha | Sistema financeiro do cliente → "conversão" → alimenta o contábil |
| Arquitetura | **Base única configurável**, nunca fork por escritório. Dois adapters plugáveis: contábil (Contmatic/Domínio/CSV) + emissão fiscal (Focus/nfe.io) |
| Quem emite a NF | **O escritório** (T Lima emite), não o cliente |
| Integração Domínio | API só inbound (recebe XML + baixa, automático). Não lê dados nem aceita lançamento |
| Provider fiscal | Focus NFe (principal) / nfe.io (plano B). Critério eliminatório: campos IBS/CBS antes de 01/04/2026 |
| NÃO construir | Motor próprio de IBS/CBS (risco regulatório) |
| V1 prioritário | Simulador de regime (janela set/2026) + controle de split payment |
| Modelo comercial | Implementação por escritório. T Lima = parceiro-piloto: **De R$12.900 Por R$7.900 à vista, ou 10x de R$850** (único); custos de IA + emissor por conta do cliente |
| Começar do zero | Sim. O `cbrasil-financeiro-app` (em `Clientes/Cbrasil/`) já prova o loop central, mas o código será novo |

---

## Pilotos

| Escritório | Sistema contábil | Papel | Status |
|---|---|---|---|
| C Brasil Contabilidade | Contmatic | Valida o adapter Contmatic | Cliente existente |
| T Lima Contabilidade | Domínio + Onvio | Valida o adapter Domínio; 1º case | Em prospecção |

---

## Contatos

| Papel | Nome | Contato |
|---|---|---|
| Sócios Trívia | JG Novais e Lucas | — |
| Contato T Lima | Wilber Vinícius (sócio) | +55 11 94863-4054 |

---

*Índice criado em 01/06/2026. Atualizar conforme o projeto evolui.*
