---
tags: [processos, outros, sem-kr]
criado: 2026-05-07
---

# Outros Processos

Processos documentados pelo financeiro que não pertencem aos KRs principais ou que têm características específicas que merecem nota separada.

---

## Fluxo de Caixa (geral)

**Como é hoje:** Montagem do DFC completo (entradas + saídas) de forma manual, consolidando dados de todas as contas bancárias e títulos financeiros.
**Ferramenta:** Literarius + planilha Excel compartilhada (pasta "Fechamento")
**HeziomOS:** 🟢 Substituído — Dashboard CEO (STORY-004/005) exibe DFC em tempo real; Fase 2 adiciona projeção de 12 semanas com entradas e saídas previstas por vencimento.
**Módulo:** [[DRE e Fluxo de Caixa]]
**Fase:** 1–2

---

## Antecipação de Recebíveis Amazon

**Como é hoje:** Processo eventual — quando há necessidade de caixa, a equipe solicita antecipação dos recebíveis da Amazon (valores de pedidos aprovados ainda não repassados). Feito pelo portal da Amazon.
**Ferramenta:** Portal Seller Amazon
**HeziomOS:** ⚪ A definir — processo eventual e manual; baixa frequência. Pode entrar como alerta ("recebível Amazon disponível para antecipação acima de R$ X") na Fase 3.
**Fase:** A definir

---

## Faturamento Bookwire

**Como é hoje:** A Bookwire é a distribuidora de eBooks da Heziom nas plataformas digitais (Kindle, Kobo, etc.). O processo é:
1. Bookwire gera relatório mensal de vendas de eBooks por plataforma
2. Equipe da Heziom recebe o relatório
3. Equipe emite as NFs correspondentes manualmente no Literarius
4. Receita entra como `TituloFinanceiro` a receber após emissão da NF

**Ferramenta:** Portal Bookwire + planilha + Literarius
**Integração:** Não há API ou integração automática — processo 100% manual.
**HeziomOS:** 🟡 Otimizado — Fase 3: upload do relatório Bookwire no HeziomOS → sistema parseia e sugere NFs a emitir → humano confirma → [futuro] criação automática de NF no Literarius (depende de acesso de escrita).
**Obs:** Por enquanto, os títulos a receber gerados pelas NFs Bookwire entram naturalmente no sync do Literarius (STORY-002/003) — visibilidade já na Fase 1, automação na Fase 3.
**Fase:** 3

---

## Devolução de Compra

**Como é hoje:** Quando um cliente devolve um produto, o processo envolve:
1. Recebimento físico da mercadoria
2. Emissão de NF de entrada (devolução) no Literarius
3. Estorno do título a receber (ou geração de crédito ao cliente)
4. Retorno ao estoque

**Ferramenta:** Literarius
**HeziomOS:** 🔵 Mantido — operação de escrita no Literarius; HeziomOS detecta NFs de entrada que são devoluções (`EntSai = 'E'`) e exclui do faturamento bruto no cálculo do DRE.
**Obs:** Premissa a confirmar: devoluções são NFs de entrada com `EntSai = 'E'` — ver [[Premissas e Entendimentos]].

---

## Treinamento Literarius

**Arquivo registrado:** `Treinamento_DA_Literarius.mkv` (799 MB) — vídeo completo de treinamento do sistema Literarius para novos membros da equipe financeira.
**HeziomOS:** Referência de onboarding — não impacta o sistema diretamente.

---

Ver também: [[Índice dos Processos]] · [[Mapa de Automação]] · [[Premissas e Entendimentos]]
