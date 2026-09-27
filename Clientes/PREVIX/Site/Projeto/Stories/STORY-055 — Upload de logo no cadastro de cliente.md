---
id: STORY-055
titulo: "Upload de logo no cadastro de cliente"
fase: 6
modulo: "Admin · Conteúdo institucional"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: melhoria
---

# STORY-055 — Upload de logo no cadastro de cliente

> **Reportado pelo JG (05/08/2026):** "a UI pra adicionar novos clientes está ruim, não
> tem onde anexar as novas logos do cliente".

## Contexto / Diagnóstico (código real)

O formulário de cliente (`src/admin/pages/conteudo/index.tsx`, config do recurso
`clientes`) declara o logo como campo de **texto**:

```ts
{ key: 'logo', label: 'Logo (URL)', required: true,
  placeholder: '/assets/logos-clientes/afeet.png' }
```

Para cadastrar um cliente hoje, o operador precisaria: conseguir o arquivo, colocá-lo em
algum lugar servível, descobrir a URL e colar no campo. Na prática, **não há caminho que
funcione pelo painel** — daí a percepção de UI quebrada.

### Os dois problemas somados

1. **Não existe upload no formulário.** Existe um `AssetUploader` funcional em
   `src/admin/pages/assets/AssetUploader.tsx` (usa `uploadAsset` → Storage do Supabase,
   registra em `site.assets`), mas as duas telas não conversam. Mesmo usando Assets, o
   operador teria que copiar a URL na mão.

2. **Os logos atuais não estão no Storage.** Os 35 logos existentes são **arquivos
   versionados no repositório**, em `public/assets/logos-clientes/` (`afeet.png`,
   `mackenzie.png`, ...). O uploader manda para o Storage do Supabase, que tem outra URL
   base. Ou seja, hoje convivem duas origens de imagem e só uma é alcançável pelo painel.

## Escopo

### ✅ Inclui

1. Novo tipo de campo `image` no `FieldConfig` do `SimpleCRUDPage`, com:
   - botão de upload que reaproveita `uploadAsset` (**não** reimplementar);
   - preview da imagem atual;
   - possibilidade de colar URL manualmente (não quebra os 35 registros existentes que
     apontam para `/assets/logos-clientes/*`).
2. Campo `logo` do recurso `clientes` passa a usar `type: 'image'`.
3. Validação no upload: extensão (`png`, `jpg`, `webp`, `svg`), tamanho máximo e aviso se
   a imagem for muito pequena para o carrossel.
4. Após o upload, o campo é preenchido **automaticamente** com a URL pública — o operador
   não copia nada.

### ❌ NÃO inclui

- Migrar os 35 logos de `public/` para o Storage (ver "Decisão pendente").
- Recorte/redimensionamento de imagem no navegador.
- Aplicar o campo `image` em depoimentos (`logo_empresa`) — fica como melhoria seguinte,
  embora o mesmo componente sirva.

## Critérios de Aceite

- [x] CA1 — É possível cadastrar um cliente novo inteiramente pelo painel, com upload do logo, sem tocar no repositório.
- [x] CA2 — O logo enviado aparece no carrossel da home após o rebuild (depende da STORY-054).
- [x] CA3 — Os 35 clientes existentes continuam funcionando sem alteração de dados.
- [x] CA4 — Preview do logo atual visível ao editar um cliente.
- [x] CA5 — Arquivo inválido (tipo/tamanho) é recusado com mensagem clara, sem gravar registro quebrado.
- [x] CA6 — `npm run typecheck` e `npm run build` verdes.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/admin/pages/conteudo/SimpleCRUDPage.tsx` | Novo `type: 'image'` no `FieldConfig` + render do campo (upload, preview, URL manual) |
| `src/admin/pages/conteudo/index.tsx` | Campo `logo` do recurso `clientes` passa a `type: 'image'` |
| `src/admin/lib/assets.ts` | Reuso do `uploadAsset`; possível parâmetro de pasta/bucket para logos |

## Decisão pendente (JG)

**Onde os logos novos devem viver?**

- **(a) Storage do Supabase** — cadastro 100% pelo painel, sem commit. Porém o site passa
  a depender do Storage para renderizar a home, e as imagens saem do CDN da Netlify.
- **(b) Repositório (`public/assets/logos-clientes/`)** — mantém tudo no CDN e versionado,
  mas exige commit a cada cliente novo, o que **não resolve** a dor original.

Recomendação: **(a)**, aceitando a dependência do Storage, e numa story futura migrar os
35 logos antigos para lá, ficando com uma origem só. Enquanto as duas origens coexistirem,
o campo precisa aceitar as duas formas de URL.

## Notas de Implementação (2026-08-05)

Commit `93bb3a0` na `main`. **Decisão pendente resolvida como (a) Storage do Supabase**,
conforme recomendação — JG mandou implementar sem escolher explicitamente.

- Novo `src/admin/components/ImageField.tsx`: preview + botão de upload + URL editável.
- Reusa `uploadAsset` (bucket `site-assets`, pasta `logos/<recurso>/`), que já valida MIME
  e tamanho, calcula dimensões e faz rollback do Storage se a metadata falhar. Nenhuma
  dessas regras foi duplicada.
- **O tipo `'image'` já existia no `FieldConfig`** desde a criação do `SimpleCRUDPage`, mas
  nunca teve render — caía no input de texto. Porta declarada e nunca ligada
  (ver [[feedback_porta_opcional_nunca_ligada]]).
- Pré-requisitos conferidos antes de implementar: `img-src` da CSP em `netlify.toml` já tem
  `https:` (imagem do Storage renderiza no site) e o bucket `site-assets` é público.

### Teste no painel

Arquivo injetado no input via JS (o seletor de arquivo nativo não é acionável pelo agente),
exercitando o mesmo caminho do clique real:

- ✅ Upload concluído sem erro; campo preenchido **automaticamente** com
  `.../site-assets/logos/clientes/<stamp>-teste-interno-logo.png`.
- ✅ URL pública resolve: `HTTP 200 · image/png`.
- ✅ Subpasta por recurso respeitada (`logos/clientes/`).
- ✅ Botão alternou para "Trocar imagem"; nenhum erro exibido.
- ✅ Registro legado (DASA, `/assets/logos-clientes/dasa.png`) abre com preview correto e
  segue editável — **CA3**.
- Modal cancelado ao fim: o logo do DASA **não** foi alterado. Asset de teste removido do
  Storage e de `site.assets` (URL agora devolve HTTP 400).

### Ainda não verificado

- **CA1** — cadastro de um cliente **novo** de ponta a ponta (só a edição de um existente
  foi exercitada).
- **CA2** — logo enviado aparecendo no carrossel após rebuild. Depende de gravar um cliente
  de verdade, que exigiria alterar produção.
- **CA5** — recusa de arquivo inválido (tipo/tamanho). A validação vive no `uploadAsset`,
  que já era usado pela tela de Assets, mas **não foi exercitada por este caminho**.

### Fechamento dos critérios em aberto (05/08, mesma sessão)

- ✅ **CA1** — cliente novo cadastrado **inteiramente pelo painel**, com upload do logo,
  sem tocar no repositório (`teste-interno-055`, ordem 99, ativo).
- ✅ **CA2** — o logo hospedado no **Storage** apareceu no carrossel de
  grupoprevix.com.br ~20s depois. Prova que a origem nova funciona ponta a ponta:
  upload → Storage → banco → rebuild → HTML no ar.
- ✅ **CA5** — upload de PDF recusado: *"Tipo não permitido (application/pdf). Use JPEG,
  PNG, WebP ou SVG."* Campo permaneceu vazio; nenhum registro quebrado gravado.

Limpeza: cliente excluído **pelo painel** (exercitando exclusão + rebuild), arquivo
removido do Storage, metadata removida de `site.assets`. Estado final conferido:
24 ativos / 35 totais, como antes do teste.
