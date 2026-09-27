---
id: STORY-072
titulo: "Geração de post morre quando a IA erra a pontuação do JSON"
fase: 7
modulo: "Admin · Geração de conteúdo"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-09-02
atualizado: 2026-09-02
epico: EPIC-002
tipo: correcao
executor: cli
---

# STORY-072 — Geração de post morre quando a IA erra a pontuação do JSON

## Incidente (02/09/2026)

JG tentou gerar o post "Vale a pena contratar portaria e segurança terceirizada?" em
`/admin/posts/novo` e recebeu:

> IA retornou JSON inválido: Expected double-quoted property name in JSON at position 7649
> (line 93 column 7)

A geração inteira foi perdida: pesquisa do Perplexity, redação do Sonnet e o custo das duas.

## Diagnóstico

A edge `generate-post` pede ao Sonnet **um objeto JSON** (contrato GEO/AEO) e faz `JSON.parse`.
`response_format: { type: 'json_object' }` é enviado, mas **não é garantido para modelos
Anthropic no OpenRouter**: na prática a validade do JSON dependia só da instrução no prompt.

Três defeitos somados:

1. **O reparo cobria um caso só.** `json-repair.ts` removia vírgula pendente antes de `}` ou
   `]`. Reproduzido no `deno eval`: **vírgula pendente, vírgula dupla (`,,`), vírgula logo
   depois de `{`/`[` e resposta cortada produzem a MESMA mensagem do V8**. Os três últimos
   passavam direto e derrubavam a geração.
2. **Nenhuma tentativa de recuperação.** Uma vírgula errada, com temperatura 0.7, matava uma
   geração que uma segunda chamada quase certamente completaria.
3. **A evidência era descartada.** A function devolvia `raw_content_tail` e `finish_reason` no
   corpo, mas o `callFunction` (`api.ts`) só relançava o campo `error` e o modal só lia esse
   campo. Não havia `console.log` nenhum. **O conteúdo cru não sobrevivia em lugar nenhum**,
   então a causa exata deste incidente é indeterminável em retrospecto: só era possível dizer
   "foi um destes quatro".

## O que mudou

`supabase/functions/generate-post/json-repair.ts`
- `collapseExtraCommas`: remove `,,` e vírgula depois de `{`/`[`, com o mesmo scanner com
  estado de string (não toca em vírgula dentro de texto ou URL).
- A cadeia de reparo é `strip -> collapse -> strip`: **remover vírgula dupla CRIA vírgula
  pendente** (`},,\n]` vira `},\n]`), então o strip precisa rodar de novo no fim. Descoberto
  por teste que falhou, não por leitura.
- `descreverFalha`: o erro agora traz o **trecho ofensor marcado** (`>>>x<<<`). Cobre as duas
  formas de mensagem do V8: a nova, com `at position N`, e a legada `Unexpected token`.
- `pareceTruncado`: separa "modelo pontuou mal" de "resposta não chegou inteira".

`supabase/functions/generate-post/index.ts`
- **Retry único** com aviso explícito de sintaxe ao modelo. Não devolve o texto quebrado ao
  Sonnet: ecoar a resposta inválida convida o modelo a repeti-la.
- `console.error` com o conteúdo cru (20k chars), `finish_reason` e o indício de corte nas duas
  tentativas. É o que faltava para diagnosticar em produção.
- **Orçamento de parede** (`ORCAMENTO_TOTAL_MS` 140s): o retry só acontece se couber no que
  sobrou. Duas chamadas de 100s mais a pesquisa estourariam a Edge, e "sem resposta" é um erro
  pior do que o original.
- `audit_log` passa a gravar `tentativas_redacao` e `erro_json_1a_tentativa`: dá para medir a
  frequência real do defeito em vez de estimá-la.

`src/admin/lib/api.ts` — `FunctionError` preserva o corpo da resposta (status + detalhes).
`src/admin/components/GerarPostModal.tsx` — mostra o diagnóstico e, quando o erro é de formato,
diz que é intermitente e que gerar de novo costuma resolver.

## Critérios de Aceite

- [x] CA1 — Vírgula dupla e vírgula após `{`/`[` são reparadas sem quebrar strings.
- [x] CA2 — Falha de parse dispara UMA nova redação, dentro do orçamento de tempo da Edge.
- [x] CA3 — Conteúdo cru, `finish_reason` e indício de corte vão para o log da function.
- [x] CA4 — O editor vê o diagnóstico, não só "JSON inválido".
- [x] CA5 — `deno test json-repair.test.ts` verde: 15 testes, 8 novos.
- [x] CA6 — `deno check` da function e `npm run build` verdes; `astro check` sem erro novo nos
      arquivos tocados (a base já tinha 223).

## Ressalva

**O retry reduz a frequência, não elimina a causa.** Enquanto o `response_format` não for
honrado de ponta a ponta, a validade do JSON continua dependendo do prompt. Se o `audit_log`
mostrar `tentativas_redacao = 2` com frequência, o caminho seguinte é trocar a chamada por
tool use com schema (saída estruturada de verdade), não empilhar mais reparo textual.

## Links

- [[STORY-047 — Geração de post com pesquisa em tempo real]] — origem do parse resiliente
- [[reference_previx_generate_post_json_invalido]]

## Notas de Implementação (2026-09-02)

Commit `70ec05a`. Edge `generate-post` versão 21 no ar.

- Edge publicada com `TMPDIR="$HOME/.supabase-tmp"` ([[reference_supabase_deploy_colima_tmpdir]]).
- Frontend: **a Action falhou** no passo Deploy to Netlify com `Unauthorized: could not retrieve
  project` (run 33626599968). O token temporário gravado em 07/08/2026 venceu. Publicado pela
  sessão local do `netlify-cli`, e confirmado em produção: o chunk `App.CnDcvFCF.js` servido por
  `grupoprevix.com.br` contém o novo aviso do modal.
- Pendência para o JG: gerar token definitivo do Netlify e gravar em GitHub Secrets **e** nos
  secrets do Supabase. Enquanto isso, todo push exige publicação manual.

## Achado colateral: o audit_log nunca gravou (2026-09-02)

Commit `5105cc1`.

Fui medir `tentativas_redacao` na primeira geração bem-sucedida e a consulta morreu em
`column "dados" does not exist`. O insert de auditoria da `generate-post` usava
`tipo`/`ator_id`/`dados`; `site.audit_log` tem `user_id`/`recurso`/`recurso_id`/`acao`/
`payload_after`, com CHECK de vocabulário fechado em `acao`.

**Nenhum post gerado desde a STORY-047 deixou rastro.** A CA22 daquela story dizia "audit log
estendido" e passou porque ninguém consultou a tabela depois.

Duas camadas de silêncio explicam a sobrevida do defeito:

1. O PostgREST **devolve** o erro em `{ error }`, não lança. O `try/catch` em volta nunca foi
   acionado.
2. O retorno era descartado sem checagem.

Ou seja: "best-effort" virou "não acontece". Agora o erro é checado e vai para `console.error`;
a auditoria continua não bloqueando a geração, mas falhar sem rastro é o mesmo que não existir.

Formato novo verificado direto em produção com `insert ... rollback`: aceito pelo CHECK, e a
consulta seguinte confirmou zero linha deixada para trás.

⚠️ **A métrica de `tentativas_redacao` só vale a partir de hoje.** Não há histórico anterior
para comparar.
