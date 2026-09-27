---
id: STORY-056
titulo: "Fallback de conteúdo institucional ignora o campo ativo"
fase: 6
modulo: "Site · Dados institucionais"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: bug
---

# STORY-056 — Fallback de conteúdo institucional ignora o campo `ativo`

> Achado durante o diagnóstico da STORY-054. **Ninguém reportou** — é um defeito latente,
> que só aparece no pior momento possível.

## Contexto / Diagnóstico (código real)

`src/lib/data/institucional.ts:93-109` lê o banco e, se não vier nada, cai numa Content
Collection estática:

```ts
export async function getClientes(): Promise<Cliente[]> {
  const { data, error } = await sb
    .schema('site').from('clientes').select('*')
    .eq('ativo', true).is('deletado_em', null).order('ordem');
  if (!error && data && data.length > 0) {
    return data.map(...);              // caminho normal: respeita `ativo`
  }
  const entries = await getCollection('clientes');   // fallback
  return entries.sort(...).map(...);   // ⚠️ NENHUM filtro de `ativo`
}
```

O fallback lê `src/content/clientes/clientes.json` — **35 clientes, sem nenhum campo de
visibilidade**. Se durante um build o Supabase estiver fora, com credencial errada, ou a
query voltar vazia por qualquer motivo, o site publica **todos os 35 logos**, incluindo
os que o JG ocultou deliberadamente.

O mesmo padrão está em `getDepoimentos` (que ao menos filtra `e.data.publicado`),
`getNumeros`, `getDiferenciais`, `getServicos` e `getPaginas` — o de clientes é o único
sem filtro algum, porque o JSON não tem o campo.

### Por que isso é sério

Ocultar um cliente pode ser exigência contratual ou pedido do próprio cliente. Um build
que "deu certo" e republicou logos removidos é uma falha **silenciosa e visível para
terceiros** — ninguém no time recebe erro, e o site fica no ar assim até alguém reparar.

Ver [[feedback_fallback_seguro_esconde_defeito]]: fallback que devolve dado plausível é
pior que erro, porque some com o sinal.

## Escopo

### ✅ Inclui

1. Decidir e implementar a política de fallback (ver "Decisão pendente").
2. Qualquer que seja a decisão: o build **não pode publicar item oculto**.
3. Log explícito quando o fallback for acionado (hoje é completamente mudo).
4. Revisar as outras funções de `institucional.ts` sob a mesma ótica.

### ❌ NÃO inclui

- Remover as Content Collections do projeto (são usadas pelo `astro:content` e por outras rotas).
- Mudar o comportamento do admin (STORY-054).

## Critérios de Aceite

- [x] CA1 — Com o Supabase indisponível durante o build, nenhum cliente oculto vai para o HTML.
- [x] CA2 — O acionamento do fallback aparece no log do build (não é silencioso).
- [x] CA3 — As demais funções de `institucional.ts` foram auditadas e o resultado está registrado na story.
- [x] CA4 — `npm run build` verde.

## Decisão pendente (JG)

**O que fazer quando o banco não responde durante o build?**

- **(a) Falhar o build.** O site no ar continua a versão anterior (correta) e o time
  recebe erro na hora. Nenhum dado errado é publicado. Custo: uma publicação legítima
  pode ser bloqueada por instabilidade do Supabase.
- **(b) Manter o fallback, mas acrescentar `ativo` ao JSON** e sincronizá-lo a cada build
  bem-sucedido. Mais trabalho, e o JSON envelhece silenciosamente.
- **(c) Fallback vazio** — a seção "Nossos Clientes" simplesmente não aparece. Nunca
  publica dado errado, e a home degrada de forma visível mas discreta.

Recomendação: **(a)**, alinhada ao princípio de falhar alto em vez de publicar informação
errada. **(c)** é aceitável se a preferência for nunca bloquear publicação.

## Notas de Implementação (2026-08-05)

Commit `39735f7` na `main`. **Decisão resolvida como (a) falhar o build** — JG mandou
implementar sem escolher; seguida a recomendação da story.

### O defeito era mais preciso do que esta story descrevia

O código antigo tratava duas situações diferentes como se fossem a mesma:

```ts
if (!error && data && data.length > 0) { /* banco */ } else { /* fallback */ }
```

Isso junta **"a leitura falhou"** com **"não há nada visível"**. A segunda é decisão
legítima do operador: ocultar todos os clientes DEVE deixar a seção vazia, não
republicar a lista antiga. Agora são casos separados:

| Situação | Antes | Agora |
|---|---|---|
| Erro de leitura | fallback silencioso, publica lista errada | `throw` — build aborta com a razão |
| Zero resultados | fallback silencioso | seção vazia + `console.warn` no log |

Helper `exigirDados()` centraliza a regra; `getPagina` tem a mesma lógica adaptada
(erro → throw; não encontrado → `null`).

### Escopo real

Fallback removido das **seis** funções, não só de clientes: `getClientes`,
`getDepoimentos`, `getNumeros`, `getDiferenciais`, `getServicos`, `getPagina` — **CA3**.
Antes de remover, conferido que todas as tabelas estão populadas
(clientes 35, depoimentos 4, números 4, diferenciais 6, serviços 3, páginas 7), ou seja,
o fallback nunca era exercitado: era alçapão esperando o dia errado.

### Verificação

- ✅ `npm run build` verde: **37 páginas** geradas (home, serviços, sobre, notícias…),
  `validate:schema` e `lint:content` OK.
- ✅ **Nenhum** `[institucional]` no log — as seis leituras funcionaram.
- ✅ **Nenhum** aviso "nenhuma linha visível" — **CA2** (o caminho do log existe e não
  disparou porque não havia motivo).

### Ainda não verificado

- **CA1** — o comportamento com o Supabase indisponível **não foi simulado**. A lógica é
  direta (`if (error) throw`), mas ninguém derrubou a conexão para ver o build falhar de
  verdade. Testável apontando `PUBLIC_SUPABASE_URL` para um host inválido num build local.

### Achado fora de escopo

`src/components/layout/SiteFooter.astro:33` chama `getCollection('numeros')` **direto**,
sem passar por `getNumeros()`. Ou seja: número editado no painel provavelmente não muda no
rodapé, e essa leitura não passa por nenhuma das proteções desta story. Merece story
própria.

### Fechamento do CA1 (05/08, mesma sessão)

Build local com `PUBLIC_SUPABASE_URL` apontando para host inexistente. O build **abortou**
com a mensagem pretendida:

```
[institucional] Falha ao ler site.servicos: TypeError: fetch failed.
Build abortado de propósito (STORY-056): sem o banco não há como saber o que está
oculto, e publicar a lista errada pode expor item removido a pedido do cliente.
```

Antes desta story, esse mesmo cenário publicaria silenciosamente a lista antiga do JSON,
com os 11 clientes ocultos de volta no ar.
