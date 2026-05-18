---
tags: [processos, outros, sem-kr]
criado: 2026-05-07
atualizado: 2026-05-11
---

# Outros Processos

Processos documentados pelo financeiro que não pertencem aos KRs principais ou que têm características específicas que merecem nota separada.

---

## Fluxo de Caixa (geral)

🎬 [▶ Fluxo de caixa — visão geral](Outros%20processos/Fluxo%20de%20caixa.webm)
🎬 [▶ Fluxo de caixa — Pagamento](Outros%20processos/Fluxo%20de%20caixa%20Pagamento.webm)
🎬 [▶ Fluxo de caixa — Recebimento](Outros%20processos/Fluxo%20de%20caixa%20recebimento.webm)

**Como é hoje:** Montagem do DFC completo (entradas + saídas) de forma manual, consolidando dados de todas as contas bancárias e títulos financeiros.
**Ferramenta:** Literarius + planilha Excel compartilhada (pasta "Fechamento")
**HeziomOS:** 🟢 Substituído — Dashboard CEO (STORY-004/005) exibe DFC em tempo real; Fase 2 adiciona projeção de 12 semanas com entradas e saídas previstas por vencimento.
**Módulo:** [[DRE e Fluxo de Caixa]]
**Fase:** 1–2

---

## Antecipação de Recebíveis Amazon

🎬 [▶ Assistir ao vídeo](Outros%20processos/Antecipação%20de%20recebíveis%20da%20Amazon.webm)

**Como é hoje:** Processo eventual — quando há necessidade de caixa, a equipe solicita antecipação dos recebíveis da Amazon (valores de pedidos aprovados ainda não repassados). Feito pelo portal da Amazon Seller.
**Ferramenta:** Portal Seller Amazon
**HeziomOS:** ⚪ A definir — processo eventual e manual; baixa frequência. Pode entrar como alerta ("recebível Amazon disponível para antecipação acima de R$ X") na Fase 3.
**Fase:** A definir

### Passo a passo

1. Acessar o **Portal Seller Amazon**
2. Localizar a opção de **antecipação de recebíveis**
3. Verificar o valor disponível para antecipação
4. Solicitar a antecipação conforme necessidade de caixa

> ⚠️ **Decisão pendente:** definir o **valor mínimo para gerar alerta** de antecipação disponível no HeziomOS.

---

## Faturamento Bookwire

🎬 [▶ Assistir ao vídeo](Outros%20processos/Faturamento%20Bookwire.webm)

**Como é hoje:** A Bookwire é a distribuidora de eBooks da Heziom nas plataformas digitais (Kindle, Kobo, etc.).
**Ferramenta:** Portal Bookwire + planilha + Literarius
**Integração:** Não há API ou integração automática — processo **100% manual**.
**HeziomOS:** 🟡 Otimizado — Fase 3: upload do relatório Bookwire no HeziomOS → sistema parseia e sugere NFs a emitir → humano confirma.
**Fase:** 3

### Passo a passo

1. **Bookwire** gera relatório mensal de vendas de eBooks por plataforma
2. Equipe da Heziom recebe o relatório
3. Equipe emite as **NFs correspondentes** manualmente no Literarius
4. Receita entra como `TituloFinanceiro` a receber após emissão da NF

> 💡 **Obs:** Por enquanto, os títulos a receber gerados pelas NFs Bookwire entram naturalmente no sync do Literarius (STORY-002/003) — visibilidade já na Fase 1, automação plena na Fase 3.

> ⚠️ **Decisão pendente:** confirmar o **formato do relatório Bookwire** para definir como parsear automaticamente.

---

## Devolução de Compra

🎬 [▶ Assistir ao vídeo](Outros%20processos/Devolução%20de%20compra.mkv)

**Como é hoje:** Quando um cliente devolve um produto.
**Ferramenta:** Literarius
**HeziomOS:** 🔵 Mantido — HeziomOS detecta NFs de entrada que são devoluções (`EntSai = 'E'`) e exclui do faturamento bruto no cálculo do DRE.

### Passo a passo

1. Receber fisicamente a mercadoria devolvida
2. No Literarius: emitir **NF de entrada (devolução)**
3. Fazer o **estorno do título a receber** (ou gerar crédito ao cliente)
4. Retornar o produto ao estoque no Literarius

> ⚠️ **Premissa a confirmar:** devoluções são NFs de entrada com `EntSai = 'E'` — ver [[Premissas e Entendimentos]].

---

## Treinamento Literarius

🎬 [▶ Vídeo completo de treinamento (799 MB)](Treinamento_DA_Literarius.mkv)

**Descrição:** Vídeo completo de treinamento do sistema Literarius para novos membros da equipe financeira.
**Uso:** Material de onboarding — não impacta o HeziomOS diretamente.

> 💡 Recomendado para qualquer novo colaborador do financeiro antes de operar o sistema.

---

Ver também: [[Índice dos Processos]] · [[Mapa de Automação]] · [[Premissas e Entendimentos]]
