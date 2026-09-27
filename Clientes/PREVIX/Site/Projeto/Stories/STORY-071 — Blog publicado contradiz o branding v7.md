---
id: STORY-071
titulo: "Blog publicado contradiz o branding v7"
fase: 7
modulo: "Conteúdo · Blog"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: EPIC-BRANDING-V7
tipo: bug
executor: codigo
---

# STORY-071 — Blog publicado contradiz o branding v7

> Não estava no checklist. Apareceu ao varrer o HTML gerado depois de corrigir as páginas
> institucionais: **18 dos 25 posts publicados** repetiam os números antigos.

## Por que ninguém tinha visto

O documento [[A aplicar no Site Previx]] inventariou home, sobre, serviços e FAQ. O blog
ficou de fora — e é a **maior superfície de texto do site**, além da mais indexada.

A causa é conhecida: os posts foram gerados por IA com um prompt
(`supabase/functions/generate-post/index.ts:87`) que descrevia a empresa como "mais de 15
anos de mercado (desde 2009)", "+500 colaboradores", "+100 empresas" e citava DASA e
Pernambucanas como âncoras. **Cada post nascia com o defeito.** Corrigir os 18 sem corrigir
o prompt transformaria isso em trabalho recorrente.

## O achado que vale guardar

Os números erravam em **cinco campos diferentes** da mesma tabela, e cada rodada de
auditoria voltava verde porque olhava um campo por vez:

| Rodada | Onde estava | Como escapou |
|---:|---|---|
| 1 | `corpo_mdx` | — |
| 2 | `descricao_seo`, `lede` | auditei só o corpo |
| 3 | `faq` (jsonb) | texto que **não aparece na leitura** do artigo, só no JSON-LD que o Google consome |
| 4 | `faq` de novo (DASA) | substituição literal cobria 2 das 3 variantes de citação |
| 5 | `<Estatistica valor="+500">` no MDX | valor e palavra separados por `" descricao="` — a regex procurava `500 colaboradores` colado |

Foram necessárias **cinco migrations** e, em nenhuma delas, a consulta ao banco foi o que
denunciou o problema. Quem denunciou foi sempre a mesma coisa: `grep` no `dist/` depois do
build. É o único ponto que vê todos os campos ao mesmo tempo, porque é o que o visitante
recebe.

> Verificar pelo padrão que se espera encontrar confirma a expectativa, não o estado.
> Ver também [[feedback_gates_cegos_por_runtime]].

## Escopo entregue

### ✅ Feito

1. Números corrigidos nos cinco campos, em todos os posts.
2. DASA e Pernambucanas trocados por clientes da lista aprovada.
3. Prompt do `generate-post` reescrito com os números v7 + proibições explícitas
   (não citar datas de fundação/expansão, DASA, Pernambucanas, Oscar, PX One).
4. `public/llms.txt` reescrito: era o retrato mais desatualizado do site inteiro, e é o
   arquivo que os LLMs leem para responder sobre a Previx.
5. Post `px-one` despublicado.
6. Post `seguranca-condominio-residencial`: removidas duas seções H2, um Callout, uma
   conclusão e a meta description. **Depois disso o produto ainda aparecia cinco vezes** —
   linha de tabela, Callout de fechamento, dois itens de lista e uma recomendação inteira
   ("Prioridade: PX One") que É a resposta do artigo para um perfil de leitor.
   **Despublicado até reescrita editorial.**

### Onde eu parei de propósito

Continuar cortando o post de condomínios deixaria de ser remoção e viraria **reescrita
editorial**: mudar o que o artigo recomenda ao leitor. Isso é decisão de quem responde
pela comunicação do cliente, não de quem está limpando menções.

## Critérios de Aceite

- [x] CA1 — Nenhum post publicado cita "15 anos", "10 anos", "+500 colaboradores" ou
      "+100 empresas", em nenhum campo.
- [x] CA2 — Nenhum post publicado cita DASA, Pernambucanas ou PX One.
- [x] CA3 — O `llms.txt` reflete os números e o posicionamento v7.
- [x] CA4 — Um post novo gerado pela IA nasce com os números corretos (prompt corrigido).
- [x] CA5 — A verificação é feita sobre o **HTML gerado**, não sobre o banco.
- [x] CA6 — `npm run build` verde.

## Custo assumido

Dois posts saíram do ar e suas URLs passam a responder 404:

- `/noticias/px-one` — some junto com o produto, volta quando ele voltar
- `/noticias/seguranca-condominio-residencial` — **artigo bom, precisa voltar**

Ambos voltam com uma linha:

```sql
update site.posts set status = 'publicado' where slug = '<slug>';
```

Se tiverem tráfego relevante, o certo é um redirect em `public/_redirects` enquanto não
voltam.

## Notas de Implementação (2026-08-05)

Commit `4ef5fba`. Migrations `20260805190000`, `200000`, `210000`, `220000`, `230000`,
`240000`, `250000`, `260000`.

O `scripts/validate-schema.ts` exigia `noticias/px-one/index.html` no build e derrubou a
compilação quando o post saiu. O gate funcionou — só que pelo motivo errado. A linha foi
removida com comentário para voltar junto com o produto.

## Links

- [[Branding Previx]] — 🚫 O que NÃO comunicar
- [[STORY-068 — Remover PX One da comunicação]]
- [[feedback_gates_cegos_por_runtime]]
