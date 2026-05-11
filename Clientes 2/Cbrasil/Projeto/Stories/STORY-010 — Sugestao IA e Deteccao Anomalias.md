---
status: backlog
tipo: feature
sprint: 5
prioridade: baixa
fase: 3
---

# STORY-010 — Sugestao de Categoria por IA e Deteccao de Anomalias

## Descricao

Usar historico de lancamentos para sugerir categorias automaticamente quando o cliente registra ou importa dados. Detectar anomalias (valores atipicos, possiveis duplicatas) para alertar o contador na revisao.

## Contexto (Research)

Conforme pesquisa "IA em Contabilidade 2025-2026":
- Reconciliacao bancaria com IA atinge 97% de acuracia
- Lancamentos automatizados chegam a 98-100% de autonomia em declaracoes
- O maior gargalo manual e a classificacao de despesas (cada linha pode ser algo diferente)
- Regras deterministicas cobrem 70-80% dos casos; os 20-30% restantes precisam de heuristica/IA

## Criterios de Aceite

### Sugestao de Categoria

- [ ] Ao digitar fornecedor, sugerir categoria com base em lancamentos anteriores do mesmo fornecedor
- [ ] Confidence score: so sugere se >80% de confianca (historico consistente)
- [ ] Cliente pode aceitar ou ignorar a sugestao
- [ ] Na importacao em lote: pre-preencher categorias sugeridas, destacar as incertas
- [ ] Aprendizado: cada aprovacao do contador reforça o mapeamento

### Deteccao de Anomalias

- [ ] Alerta no painel do contador para valores >2x a media historica do fornecedor/categoria
- [ ] Deteccao de possivel duplicata: mesmo valor + mesmo fornecedor + mesma data (ou ±1 dia)
- [ ] Lancamentos sem categoria mapeada destacados visualmente
- [ ] Relatorio de anomalias por periodo (opcional)

## Abordagem Tecnica

### Sugestao (regra simples primeiro, ML depois)

```typescript
// Fase 1: Lookup por fornecedor (deterministico)
async function suggestCategory(clientId: string, fornecedor: string) {
  const history = await supabase
    .from('transactions')
    .select('categoria_id, count(*)')
    .eq('client_id', clientId)
    .ilike('fornecedor', `%${fornecedor}%`)
    .eq('status', 'revisado') // so aprende de aprovados
    .group('categoria_id')
    .order('count', { ascending: false })
    .limit(1);

  if (history[0]?.count > 3) {
    return { categoria_id: history[0].categoria_id, confidence: 0.9 };
  }
  return null;
}

// Fase 2 (futuro): Embedding de descricao + similarity search
```

### Anomalias

```typescript
// Media e desvio por categoria
async function detectAnomalies(clientId: string, transactions: Transaction[]) {
  const stats = await getStatsByCategory(clientId); // media, stddev por categoria

  return transactions.filter(t => {
    const cat = stats[t.categoria_id];
    if (!cat) return true; // categoria desconhecida = anomalia
    return t.valor > cat.media + 2 * cat.stddev;
  });
}
```

## Notas Tecnicas

- Fase 1 e puramente deterministico (lookup por fornecedor no historico) — nao requer modelo de ML
- Fase 2 pode usar pg_vector + embeddings para similarity search em descricoes
- A pesquisa mostra que tools como Acellerador Contabil e SIEG IriS ja fazem isso no mercado
- Diferencial: nosso sistema e focado no terceiro setor (igrejas, ONGs) — nicho pouco atendido
- Performance: queries de sugestao devem ser rapidas (<200ms) para UX no formulario
- Deteccao de duplicatas pode rodar como cron job ou trigger apos insercao em lote
