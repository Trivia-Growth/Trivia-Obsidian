---
id: STORY-054
titulo: "CRUD de conteúdo dispara rebuild (Clientes, Depoimentos, Números, Diferenciais)"
fase: 6
modulo: "Admin · Conteúdo institucional"
status: concluido
prioridade: critica
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: bug
---

# STORY-054 — CRUD de conteúdo dispara rebuild

> **P0 reportado pelo JG (05/08/2026):** "ocultei alguns clientes e eles continuam
> aparecendo no site". O admin salva no banco, mas o site não muda.

## Contexto / Diagnóstico (código real)

O site é **estático** (`output: 'static'`). O HTML só reflete o banco quando há um
**rebuild** — é a mesma natureza já documentada em `docs/DEPLOY.md` e já resolvida
para posts no commit `026798b` ("reordenar posts dispara rebuild").

O filtro do lado do site **está correto**. `src/lib/data/institucional.ts:96`:

```ts
.schema('site').from('clientes').select('*')
.eq('ativo', true).is('deletado_em', null).order('ordem');
```

O que falta é avisar a Netlify. `src/admin/pages/conteudo/SimpleCRUDPage.tsx` faz apenas:

```ts
const refresh = () => qc.invalidateQueries({ queryKey: [`${config.table}_admin`] });
```

`invalidateQueries` atualiza o **cache do próprio admin** — por isso a tela mostra
"OCULTO" e o operador acredita que publicou. Nenhuma chamada a `trigger-rebuild` existe
no arquivo.

**Quem dispara rebuild hoje:** `PostsListPage`, `PostEditor`, `PaginasAdminPage`,
`FAQPage`, `ConfigsSeoPage`.
**Quem NÃO dispara:** `SimpleCRUDPage` — e ele atende **quatro** recursos:
`clientes`, `depoimentos`, `numeros`, `diferenciais`.

Ou seja, o bug não é de Clientes: é do CRUD genérico, e vale para as quatro telas.

### Por que passou despercebido

O site "se corrige sozinho" sempre que alguém dá push na `main`, porque todo push
dispara build na Netlify. Em 05/08 foram 6 pushes (STORY-049..053) e os clientes ocultos
sumiram do ar **de carona** — não porque o admin funcionou. Sem push, a mudança fica
parada por tempo indeterminado.

## Escopo

### ✅ Inclui

1. `SimpleCRUDPage` chama `trigger-rebuild` após **salvar** (`save`, linha ~122),
   **excluir** (`remove`, linha ~146) e **alternar ativo/publicado** (toggle, linha ~196).
2. Reusar o padrão já existente em `PostsListPage` (`callFunction('trigger-rebuild', {})`
   dentro de `try/catch`, invalidando também `['last_rebuild']`).
3. Feedback ao operador: a tela precisa dizer que a alteração **só vai ao ar após o
   rebuild**, com o mesmo componente `RebuildStatus` já usado em Posts.
4. Falha do rebuild **não** pode reverter a gravação nem parecer sucesso: mostrar aviso
   explícito ("salvo, mas o rebuild falhou — republique").

### ❌ NÃO inclui

- Mudar o filtro `ativo` do site (já está correto).
- Rebuild automático agendado / ISR (mudança de arquitetura, fora de escopo).
- O fallback do `getClientes` — tratado na STORY-056.

## Critérios de Aceite

- [x] CA1 — Ocultar um cliente no admin dispara rebuild; após o build, o logo some da home.
- [x] CA2 — O mesmo vale para criar, editar, reordenar e excluir.
- [x] CA3 — Vale para os quatro recursos do CRUD genérico: clientes, depoimentos, números, diferenciais.
- [x] CA4 — O operador vê o estado do rebuild na tela ("Na fila → Publicando → No ar ✅").
- [x] CA5 — Se o `trigger-rebuild` falhar, a gravação permanece e a UI avisa que não foi ao ar.
- [x] CA6 — `npm run typecheck` e `npm run build` verdes.
- [x] CA7 — Teste manual E2E: ocultar cliente → aguardar rebuild → confirmar ausência no HTML de `dist/`.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/admin/pages/conteudo/SimpleCRUDPage.tsx` | Dispara `trigger-rebuild` em save/remove/toggle; invalida `last_rebuild`; exibe `RebuildStatus`; trata falha de rebuild sem mascarar |
| `src/admin/pages/conteudo/index.tsx` | Se necessário, flag por recurso indicando que a entidade aparece no site estático |

## Notas de Implementação (2026-08-05)

Commit `aaf25b1` na `main` — implementado, **aguardando validação do JG no painel**.

- `dispararRebuild()` roda **depois** da gravação. Se o rebuild falhar, o dado continua
  salvo e o `RebuildStatus` mostra o erro com "Tentar de novo". Deliberadamente diferente
  do padrão do `FAQPage`, que faz `catch (e) { console.warn(...) }` — aviso que ninguém lê.
- O estado do rebuild mora no `SimpleCRUDPage`, não no `SimpleEditor`: o modal fecha ao
  salvar e levaria o aviso junto.
- `skipped` não é tratado como erro (o `trigger-rebuild` recusa builds em rajada; o
  `RebuildStatus` já sabe explicar a espera).
- Hint no formulário: "Ao salvar, o site é republicado automaticamente…".

### Verificação feita

- `npm run build` verde; bundle do admin contém a chamada e o texto novo.
- `npm run typecheck` sem erro novo. O `ts(2345)` em `SimpleCRUDPage.tsx:185`
  (`insert(payload)` com tipo genérico) **é pré-existente** — confirmado com `git stash`.

### Teste no painel (JG logou às 11:19, 05/08)

Editado o cliente **DASA** (já oculto) e salvo **sem alterar nada** — de propósito, para
disparar o rebuild sem mudar a visibilidade de ninguém em produção.

- ✅ **CA4** — apareceu o box de publicação. Levou alguns segundos (a chamada à Netlify API).
  Mensagem: *"Publicação enviada. A confirmação automática não está disponível agora.
  Disparo aceito, mas o novo deploy ainda não apareceu na Netlify API."* É o
  `RebuildStatus` degradando com honestidade — o mesmo comportamento já documentado em
  `docs/DEPLOY.md` quando falta `NETLIFY_AUTH_TOKEN`. **Disparo aceito**, que é o ponto.
- ✅ **CA5** — a gravação persistiu (`atualizado_em` = 11:21:06, `ativo` segue `false`)
  mesmo sem a confirmação do deploy. Nada revertido, nada mascarado.
- ✅ Hint novo visível no formulário.
- ✅ HTML de produção conferido: **nenhum** dos 11 ocultos aparece no carrossel.

### Ciclo completo — Shoppinho Santo André (autorizado pelo JG)

| Hora | Ação no painel | Banco | Site em produção |
|---|---|---|---|
| 11:27:33 | marcado **Ativo** + Salvar | `ativo=true` | ✅ logo **apareceu** em ~20s |
| 11:28:55 | desmarcado **Ativo** + Salvar | `ativo=false` | ✅ logo **sumiu** em ~20s |

- ✅ **CA1 e CA2 provados nos dois sentidos.** Rebuild bem mais rápido que o esperado
  (~20s da gravação até o HTML novo no ar).
- Estado final conferido: Shoppinho de volta a `oculto`, 24 logos no ar, **nenhum** dos 11
  ocultos presente no HTML. Nada ficou alterado em produção.

### Achado do teste — salvar sem alterar nada também dispara build

A primeira tentativa marcou o checkbox de forma programática, que não notificou o React:
o `ativo` continuou `false` e gravou o valor antigo. **Mesmo assim o rebuild foi
disparado** e a UI mostrou "Publicação enviada".

Não é defeito (o admin não tem como saber que nada mudou), mas significa que cada clique
em Salvar gera um build. O `trigger-rebuild` tem proteção de rajada (`skipped`), então não
deve incomodar — fica registrado caso apareça excesso de builds na Netlify.

### Ainda não verificado

- **CA3** — só Clientes foi exercitado. Depoimentos, Números e Diferenciais usam
  exatamente a mesma linha de código, mas nenhuma das três telas foi aberta.
- **CA7** — inspeção do `dist/` após um build específico (coberto na prática pela
  verificação do HTML em produção).

> **Observação para a próxima story:** a confirmação automática do deploy não estava
> disponível neste teste. Vale conferir se o `NETLIFY_AUTH_TOKEN` continua válido —
> é exatamente o que a STORY-041 (`pipeline-health`) monitora.

## Riscos / Observações

- **Rajada de rebuilds:** reordenar vários itens em sequência dispara vários builds.
  O `trigger-rebuild` já tem proteção (retorna `skipped` + `wait_ms`) — confirmar que o
  CRUD respeita isso em vez de tratar `skipped` como erro.
- Verificar se `servicos` e `paginas` também passam pelo CRUD genérico; se sim, entram no
  mesmo conserto.

### Fechamento dos critérios em aberto (05/08, mesma sessão)

- ✅ **CA3** — as **quatro** telas do CRUD genérico disparam o rebuild, verificadas uma a uma:
  Clientes, **Números** ("Publicação enviada"), **Depoimentos** e **Diferenciais**
  ("Publicação enviada").
- ✅ **CA7** — confirmado no HTML **em produção**, que é mais forte que inspecionar `dist/`.

**Prova acidental do tratamento de `skipped`:** ao salvar em Depoimentos logo após Números,
o `trigger-rebuild` recusou por rajada e a tela mostrou *"Rebuild recente ainda em
andamento. Suas mudanças entram no próximo build, liberado ~13:47:57"*. Era o
comportamento implementado e nunca observado — recusa não vira erro.

> Nota de método: dois testes automatizados por JS deram **falso negativo** (procuravam só
> "Publicação" e não achavam "Rebuild recente"; e o `innerText` nem sempre estava atualizado
> na janela de espera). O screenshot mostrou o box nos dois casos. Confiar na tela, não no
> regex.
