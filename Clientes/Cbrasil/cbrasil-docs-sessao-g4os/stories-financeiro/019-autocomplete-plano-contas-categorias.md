# Story 019 — Autocomplete Plano de Contas nas Categorias

> ✅ **Concluída** — Deploy: 2026-05-08

## Objetivo
Substituir os inputs de texto livre dos campos `conta_debito` e `conta_credito` no formulário de categorias por um autocomplete que busca diretamente do plano de contas do cliente, mostrando código Contmatic + descrição.

## Contexto
Hoje o usuário precisa digitar manualmente o número da conta contábil (ex: "18", "319"). Com o plano de contas importado (Story 018), podemos oferecer busca inteligente por código, descrição ou nº Contmatic.

## Critérios de Aceite
- [x] Campos conta_debito/conta_credito usam autocomplete com dropdown
- [x] Busca por: codigo_contmatic, codigo hierárquico, ou descricao
- [x] Só mostra contas analíticas (is_analitica = true)
- [x] Mostra: "Nº Contmatic — Descrição" no dropdown
- [x] Valor salvo continua sendo o codigo_contmatic (string)
- [x] Na tabela de listagem, mostrar descrição ao lado do nº quando disponível
- [x] Funciona sem plano de contas (fallback para input livre)
- [x] Build sem erros TypeScript

## Escopo Técnico
1. Componente `AccountAutocomplete` reutilizável
2. Integração no `CategoryForm`
3. Lookup na tabela de listagem para mostrar descrição

## Fora de Escopo
- Edição inline de categorias existentes
- Paginação do autocomplete (606 contas analíticas é gerenciável)
