---
tags: [heziom, editorial, módulo]
status: planejado
criado: 2026-05-19
fase: 2.4
substitui: ClickUp + Google Sheets + OneDrive (parcial)
---

# Editorial — Índice do Módulo

> Módulo que absorve o fluxo editorial completo: 10 etapas sequenciais, orçamento por lauda, gestão de profissionais terceirizados, e distribuição multi-plataforma.
> Referência: [[Mapeamento Completo da Operação Heziom]] §4 e [[HeziomOS — Módulos e Escopo Completo]]

---

## Equipe

- 1 coordenadora interna (acumula todas as responsabilidades)
- Tradutores, capistas, diagramadores, revisores (terceirizados)
- ~2 lançamentos/mês em 2026
- 60+ títulos ativos no catálogo

---

## Submódulos

| Submódulo | Status | Nota |
|---|---|---|
| [[Calendário de Publicações]] | ⬜ A criar | Visão anual, ponto de partida de todo fluxo |
| [[Orçamento Editorial]] | ⬜ A criar | Motor custo/prazo por lauda, 3 complexidades, tetos |
| [[Pipeline Editorial]] | ⬜ A criar | Kanban 9 etapas + alocação de profissionais |
| [[Orçamento Gráfico]] | ⬜ A criar | Cotações, markup ×7, comparativo |
| [[Hub de Lançamento]] | ⬜ A criar | Materiais para marketing, checklist |
| [[Ficha Catalográfica]] | ⬜ A criar | ISBN, metadados, distribuição multi-plataforma |
| [[Contratos Editoriais]] | ⬜ A criar | Status, assinatura digital, armazenamento |
| [[Gestão de E-book]] | ⬜ A criar | Status no fluxo, Bookwire |

---

## Regras de Negócio

1. **Teto custo/lauda:** Nacional R$ 40 · Internacional R$ 60
2. **Markup gráfico:** Preço capa = custo gráfico unitário × 7 (configurável)
3. **Sequência obrigatória:** Tradução → Leitura → Preparação → Edição → Diagramação → Revisão → Conferência → Plotter (capa paralela à diagramação)
4. **Prazo = laudas ÷ produtividade** (laudas/dia por tarefa)
5. **Calendário é ponto de partida:** nenhum projeto avança sem estar no calendário

---

## Integrações

- Literarius: custo consolidado → TituloFinanceiro (financeiro vê o custo editorial)
- Literarius: produto cadastrado → `TProdutoController`
- Tray: `POST /products` quando obra é publicada
- OneDrive: arquivos de obras (manter ou migrar para Supabase Storage — decisão pendente)
- DocuSign: assinaturas (manter ou substituir — decisão pendente)
- Bookwire: upload de e-book (integração futura)
- BookInfo: metadados ISBN (integração futura)

---

## Evolução IA (Fase 3+)

Substituição progressiva de profissionais de texto (tradução, preparação, edição, revisão, conferência) por agentes especialistas IA. Diagramação, capa e plotter permanecem humanos.

---

*Fase: 2.4 · Prioridade: Média-Alta (coordenadora editorial opera com 9 ferramentas desconectadas)*
