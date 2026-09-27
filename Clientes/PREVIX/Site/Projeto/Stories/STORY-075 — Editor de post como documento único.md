---
id: STORY-075
titulo: "Editor de post como documento único"
fase: 6
modulo: "Admin / Posts"
status: concluido
prioridade: alta
agente_responsavel: "Claude"
criado: 2026-09-25
atualizado: 2026-09-25
---

# STORY-075 — Editor de post como documento único

## Origem

JG, 25/09/2026: "a usabilidade para criar e manusear os textos de um post estão muito ruins,
tem que tornar mais fácil para o usuário editar os textos dos posts depois de gerados". Sobre
a primeira proposta (cards por seção): "tem que ser um bloco só pra visualizar tudo junto e
conseguir editar". Aprovou a segunda proposta (documento único).

A prova do problema é o post da síndica (STORY-073, adendo de 25/09): duas seções do corpo
foram parar dentro do campo *pergunta* do FAQ, um `<Citacao>` ficou aberto e URLs de fonte
saíram sem `https://`. Erros de ferramenta, não do autor.

## Diagnóstico da tela atual

1. O corpo é um `<textarea>` monoespaçado com `white-space: pre`: cada parágrafo é uma linha
   com rolagem lateral.
2. Componentes são tags digitadas à mão (`<Citacao autor="" cargo="" fonte="" fonteUrl="">`).
3. O texto fica atrás de uma coluna inteira de metadados e de 5 campos por estatística.
4. Erros ficam numa coluna à parte, em linguagem de código (`faq[3].resposta`), e a regra que
   mais reprova (H2 com 50-150 palavras) não aparece enquanto se escreve.
5. Prévia exige salvar e abre outra aba.

## Decisão de design (mockup aprovado)

Um documento só, corrido, como o leitor vê: título, lede, seções H2, citações, estatísticas,
callouts, figuras e FAQ no mesmo fluxo, editados no lugar (Tiptap/ProseMirror). Contadores de
palavras na margem esquerda, aviso só na seção com problema, painel "Antes de publicar" à
direita que leva ao trecho. Metadados e capa em painel lateral acionado pela barra.

**O banco não muda.** `corpo_mdx`, `lede` e `faq` continuam com o formato de hoje. A tela
converte MDX → documento ao abrir e documento → MDX ao salvar.

## Critérios de aceite

- [x] CA1. Os 29 posts do banco abrem no editor e, salvos sem edição, produzem o **mesmo HTML**
      pelo `renderMdxToHtml` e o **mesmo resultado** no `lintPost` (prova automatizada).
- [x] CA2. Construções que o editor não modela (tabela, HTML bruto, `import`) sobrevivem
      intactas como bloco de MDX bruto, editável como texto.
- [x] CA3. Estatística, Citação, Callout e Figura aparecem renderizados no documento e são
      editados por campos (nunca por tag).
- [x] CA4. Cada seção H2 e cada resposta de FAQ mostra a contagem de palavras com a faixa da
      Jimmy 3.0; o erro do `validate-post` aparece junto do trecho, em português.
- [x] CA5. FAQ é parte do documento; "virar seção" e "virar pergunta" movem o texto entre corpo
      e FAQ sem copiar e colar.
- [x] CA6. Metadados e capa continuam editáveis, num painel.
- [x] CA7. `npm run build` verde; `astro check` sem erro novo.

## Notas de implementação (25/09/2026)

**Conversão (`src/admin/lib/mdx-doc.ts`).** Espelha a gramática do `render-mdx.ts`: os
quatro componentes saem por regex para placeholders, o resto passa pelo lexer do `marked`
e vira nós do ProseMirror. Volta na ordem inversa. Três detalhes que a prova pegou:

1. `**[link](url)**` tem que voltar com o link POR DENTRO do negrito: `<strong><a>` é o
   HTML que os 12 posts com CTA publicam. Ordem fixa de marcas, link mais interno.
2. `### 1. Passo` não pode virar `### \1. Passo`: o escape de início de linha só vale
   em parágrafo, não depois do `## `.
3. `fonteUrl=""` explícito é diferente de ausente: o site troca ausente por `cite="#"`.
   Atributo ausente vira `null` no documento e não é emitido; vazio é emitido vazio.

Linhas `import` dos posts migrados do Git são descartadas na abertura (o renderizador já
as ignora). Tabela, HTML cru e `#` de nível 1/5/6 viram `mdxBruto`; componente que caiu
no meio de uma linha (dentro de item de lista) vira átomo cru inline.

**Prova (`npm run check:mdx-doc`):** 26 posts (publicados e rascunhos), 0 diferenças de
HTML, de lint, de título, de lede e de FAQ. 14 falhavam na primeira rodada (os dois
primeiros pontos acima), 2 na segunda (o terceiro).

**Editor (`src/admin/components/editor/`).** Tiptap 3.31. Documento = `postTitulo
postLede block* faqBloco`. Contadores e avisos são *widget decorations* de um plugin
(`Margem`), recalculados a cada transação; a contagem por seção serializa a seção para MDX
e chama o `countContentWords` do módulo compartilhado, então a margem e o gate dizem o
mesmo número. Os erros do `lintPost` (rodando no navegador, sem rede) são classificados
por âncora (`lede`, `secao:<título>`, `faq:<i>`, `corpo`, ou metadados) e aparecem como
nota logo abaixo do trecho; o painel "Antes de publicar" leva ao trecho ou abre o painel
de metadados.

Comandos próprios: `secaoParaFaq` (seção sob o cursor vira pergunta; lista vira um
parágrafo por item), `faqParaSecao` (pergunta vira H2 no fim do corpo),
`inserirPerguntaFaq`, `inserirBlocoNaSecao`. Enter em título, lede e pergunta pula para o
bloco seguinte em vez de dividir.

**Verificado num harness** (Vite apontando para o repo, sem login), com o post do Arthur
como veio do painel: os 7 contadores de FAQ batem com o lint (38/33/39 depois de corrigir
a junção de parágrafos), "Virar pergunta do FAQ" move a seção inteira, "Virar seção"
traz de volta, Enter no título vai para o lede, "+ Estatística" insere o bloco e o painel
de campos escreve no MDX na hora (`<Estatistica valor="78,2%" ... />`).

**Não verificado:** o `PostEditor` completo logado (exige credenciais). O build compila o
bundle do admin; o comportamento de salvar, publicar e o painel de metadados dependem de
teste do JG ou do Arthur.

**Pendência com o Arthur (da STORY-073):** a pergunta "Quais práticas da Previx
garantiram o resultado" lista práticas que a carta não menciona.

## E2E e análise adversarial (25/09/2026)

**Fuzz da conversão** (14 casos de texto com sintaxe solta + documento composto): 4 defeitos
achados e corrigidos (`0cc9656`): escape perdido na segunda abertura (nós de texto
vizinhos agora se fundem antes de serializar), `<Estatistica>` digitado virando componente
(`<` antes de letra vira `&lt;`), `\1.` vazando (escapa o ponto), itálico com espaço na
borda (espaço fica fora da marca).

**Editor no harness:** Backspace no início da primeira seção engolia o H2 para o lede;
Delete no fim do lede fazia o inverso. Fronteiras de título, lede, pergunta e FAQ não fundem
mais. Parágrafo vazio deixa de virar linha em branco. Select-all + Delete preserva a
estrutura; colar HTML vira negrito, link e lista; Undo funciona.

**E2E no painel logado (JG logou na aba):** post novo → título, lede, seção com `*`, `<b>`
e `1.`, negrito e link pela barra, estatística pelo painel de campos, pergunta do FAQ,
categoria pelo painel de metadados → Salvar rascunho → linha no banco conferida
(`corpo_mdx` escapado corretamente, `faq` no formato do site) → reaberto idêntico →
excluído (soft delete). Dois defeitos achados e corrigidos (`b853fc7`, `de9632d`): post
novo nascia sem parágrafo no corpo e Enter no lede mandava o cursor para o FAQ; nota da
seção não grudava quando o título tinha caractere especial (o lint cita o H2 escapado).

**Não coberto:** publicar de verdade (exigiria um post completo no ar) e o fluxo "Gerar
com IA" → editor. O caminho é o mesmo `setContent` do carregamento, que o E2E cobriu.
