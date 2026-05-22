---
id: STORY-006
titulo: "Painel do Contador"
fase: 1
modulo: revisao
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-006 — Painel do Contador (Revisao)

## Descricao

Interface para o contador revisar lancamentos dos clientes, aprovar em lote, editar classificacao individual, e rejeitar lancamentos com erro.

## Criterios de Aceite

- [ ] Dashboard com total de lancamentos pendentes por cliente
- [ ] Listagem filtravel por: cliente, periodo, status, categoria
- [ ] Visualizacao do lancamento ja convertido (mostra debito, credito, complemento)
- [ ] Acao: Aprovar (status → revisado) — individual e em lote
- [ ] Acao: Editar — alterar categoria, conta debito/credito, complemento manualmente
- [ ] Acao: Rejeitar — devolver ao cliente com observacao
- [ ] Alertas: lancamentos sem categoria mapeada, valores atipicos (>2x media)
- [ ] Indicador de lancamentos por status (pendente/revisado/exportado)
- [ ] Paginacao com limite de 50 por pagina
- [ ] Busca por fornecedor ou valor

## Interface

### Dashboard

```
┌──────────────────────────────────────┐
│ Lancamentos Pendentes de Revisao     │
├──────────────────────────────────────┤
│ IPP (Igreja Presb. Pinheiros)  │ 145 │
│ ONG Esperanca                  │  23 │
│ Empresa XYZ Servicos           │   8 │
└──────────────────────────────────────┘
```

### Lista de Revisao

```
┌────────┬──────────┬─────────┬────────┬────────────────────────────┬──────────┐
│ Data   │ Tipo     │ DB / CR │ Valor  │ Complemento                │ Acoes    │
├────────┼──────────┼─────────┼────────┼────────────────────────────┼──────────┤
│ 01/04  │ Entrada  │ 18/319  │ 1.400  │ RECEB. OFERTA PROJ. EXP... │ ✓ ✎ ✗  │
│ 01/04  │ Saida    │ 250/18  │ 3.200  │ PG NF 7350, CONCRETO BR... │ ✓ ✎ ✗  │
└────────┴──────────┴─────────┴────────┴────────────────────────────┴──────────┘
[ ] Selecionar todos    [Aprovar Selecionados]
```

## Notas Tecnicas

- A revisao e o gate de qualidade — nada vai para o Contmatic sem passar aqui
- O contador pode corrigir a classificacao antes de aprovar (util para novas categorias nao mapeadas)
- Rejeicao envia notificacao ao cliente (email via Edge Function — Fase futura, por ora apenas marca status)
- Performance: usar paginacao server-side com TanStack Query `keepPreviousData`
