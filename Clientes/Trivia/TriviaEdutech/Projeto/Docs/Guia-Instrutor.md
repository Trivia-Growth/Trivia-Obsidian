# Guia do instrutor — TriviaEdutech

Este guia mostra, passo a passo, como criar e gerenciar seu conteúdo na plataforma TriviaEdutech: cursos, vídeos, quizzes, biblioteca (e-books e audiobooks) e artigos do blog. Ele foi escrito para instrutores e professores que produzem conteúdo, sem exigir conhecimento técnico. Sempre que possível, os passos indicam o nome exato dos menus e botões que você verá na tela.

## Onde encontrar cada coisa no menu

O menu fica na barra lateral esquerda, organizado em seções que você pode abrir e fechar.

Se você for administrador, verá a seção **Administração** com os itens:

- **Painel Admin**
- **Relatórios**
- **Gerenciar Cursos**
- **Trilhas**
- **Artigos**
- **Biblioteca**
- **Usuários**
- **Vídeos**
- **Configurações**

Se você for apenas instrutor (e não administrador), verá a seção **Instrutor** com dois itens:

- **Meus Cursos**
- **Vídeos**

Tanto **Meus Cursos** quanto **Gerenciar Cursos** levam à mesma área de cursos.

## Criar um curso

1. No menu, clique em **Gerenciar Cursos** (ou **Meus Cursos**, se você for instrutor).
2. No canto superior direito, clique em **Novo Curso**. A plataforma cria um curso chamado "Novo Curso" e abre o editor automaticamente.
3. No bloco **Informações do Curso**, preencha:
   - **Título** — o nome do curso.
   - **Descrição** — um texto explicando o que o aluno vai aprender.
   - **Categoria** — por exemplo, "Programação" ou "Educação".
   - **Nível** — escolha entre **Iniciante**, **Intermediário** ou **Avançado**.
   - **Duração (horas)** — a carga horária estimada.
   - **Thumbnail do Curso** — a imagem de capa (use o enviador de imagem disponível nesse campo).
4. Monte a estrutura de **Módulos e Aulas** (veja a próxima seção).
5. Sempre que fizer alterações, clique em **Salvar** no topo da página. Os campos de informações do curso só são gravados quando você clica em **Salvar**.

Observação: o curso só fica visível para alunos depois que você o publica (veja "Publicar o curso e definir preço"). Antes disso, ele aparece com a etiqueta **Rascunho**.

### Criar módulos e aulas

1. Dentro do curso, vá até o bloco **Módulos e Aulas**.
2. Clique em **Módulo** para adicionar um módulo. Ele nasce com um nome padrão ("Módulo 1", "Módulo 2"...). Clique sobre o nome para renomeá-lo; a alteração é salva ao sair do campo.
3. Abra o módulo e clique em **Adicionar Aula** para criar uma aula. Cada aula tem:
   - **Título da aula**
   - **Descrição da aula**
   - **URL do material de apoio** — um link ou PDF complementar (opcional). Se o link for um PDF, aparece o botão **Contar** para descobrir o número de páginas.
   - **Tipo de conteúdo** — escolha entre **Vídeo**, **Artigo**, **Audiobook** ou **Texto**.
   - **Duração em minutos**.
4. O tipo de conteúdo muda os campos exibidos:
   - **Vídeo** — mostra o botão **Selecionar Vídeo** (ou **Trocar Vídeo**).
   - **Artigo** — abre um campo para escrever o conteúdo do artigo direto na aula.
   - **Audiobook** — abre um campo para a **URL do áudio (MP3, OGG...)**.
   - **Texto** — para conteúdo apenas em texto.
5. Para excluir uma aula, use o ícone de lixeira ao lado dela. Para excluir um módulo inteiro, use **Excluir Módulo** (isso apaga também todas as aulas do módulo).

As alterações nas aulas são salvas automaticamente quando você sai de cada campo.

## Importar um curso inteiro do Vimeo

Se seus vídeos já estão organizados em pastas no Vimeo, existe um atalho que cria o curso e as aulas de uma vez.

1. No menu, clique em **Gerenciar Cursos** (ou **Meus Cursos**).
2. No canto superior direito, clique em **Importar do Vimeo**.
3. Aguarde a lista de pastas carregar. Use o campo **Buscar pasta...** para localizar a pasta desejada. Cada pasta mostra quantos vídeos contém.
4. Clique na pasta que quer importar.
5. Confirme ou ajuste o **Título do curso** (por padrão, vem o nome da pasta).
6. Clique em **Importar**. A plataforma cria um novo curso e gera uma aula para cada vídeo da pasta, abrindo o editor do curso em seguida.

A partir daí, você complementa o curso normalmente: revisa títulos, organiza módulos, ajusta a capa e o preço, e publica.

## Adicionar vídeos às aulas

Os vídeos vêm das plataformas de vídeo configuradas pelo administrador em **Configurações de Vídeo**. As plataformas suportadas pelo seletor são **Panda Video**, **Vimeo** e **Mux Video**. Se nenhuma estiver ativa, o seletor mostra a mensagem "Nenhuma plataforma configurada".

Para vincular um vídeo a uma aula:

1. No editor do curso, certifique-se de que o **Tipo de conteúdo** da aula está em **Vídeo**.
2. Clique em **Selecionar Vídeo**.
3. Na janela **Selecionar Vídeo**, use as abas no topo para alternar entre as plataformas ativas (por exemplo, Panda Video, Vimeo, Mux Video).
4. Use o campo **Buscar vídeos...** para localizar o vídeo. Cada vídeo mostra a miniatura, a duração e o status (por exemplo, **Pronto**, **Processando**, **Aguardando**).
5. Clique no vídeo desejado. Ele é vinculado à aula, e a duração da aula é preenchida automaticamente quando disponível.
6. Para trocar depois, clique em **Trocar Vídeo**. Para desvincular, clique no "x" na etiqueta "(plataforma) vinculado".

Para enviar novos vídeos para a plataforma, use o menu **Vídeos** e o botão **Importar Vídeo** (que abre a janela **Enviar Vídeo**), onde é possível enviar por URL ou por arquivo, conforme a plataforma.

### Transcrição (apenas vídeos do Vimeo)

Quando a aula usa um vídeo do **Vimeo**, aparece o painel **Transcrição** logo abaixo do vídeo. Nele você pode:

- **Baixar legendas do Vimeo** — se o vídeo tiver legendas, escolha o idioma ou use **Melhor disponível**.
- **Extrair com IA (Whisper)** — gera a transcrição automaticamente. Esse recurso exige que o OpenAI esteja configurado e que os downloads estejam habilitados no Vimeo, e pode levar alguns minutos.

A transcrição é importante porque alimenta a geração de quiz por IA (veja a seção seguinte).

## Gerar quiz automático por IA a partir da transcrição

A plataforma pode criar perguntas de quiz automaticamente usando a transcrição dos vídeos. O botão **Gerar com IA** aparece no quiz quando há uma plataforma de vídeo compatível ativa (Mux ou Panda).

1. No editor do curso, localize a aula e role até o bloco do quiz.
2. Se a aula ainda não tiver quiz, clique em **Criar Quiz**.
3. No quiz, clique em **Gerar com IA**.
4. Na janela **Gerar Quiz com IA**, marque os vídeos que servirão de base. As transcrições desses vídeos serão usadas para criar as perguntas.
5. Informe o **Número de questões** (de 1 até no máximo 10).
6. Clique em **Gerar (N) Questões** e aguarde.
7. Revise as perguntas e alternativas geradas. A alternativa correta aparece destacada.
8. Clique em **Salvar Todas** para adicionar as questões ao quiz, ou em **Voltar** para refazer.

Importante: a qualidade do quiz depende de o vídeo ter transcrição. Se um vídeo não tiver transcrição disponível, gere-a antes (veja "Transcrição") para obter melhores perguntas.

## Criar quiz manual

Você também pode montar o quiz pergunta por pergunta, sem usar IA.

1. No editor do curso, localize a aula e o bloco do quiz.
2. Se ainda não existir quiz, clique em **Criar Quiz**. O quiz mostra a nota mínima de aprovação (por exemplo, "Mínimo: 70%").
3. Clique em **Questão** para abrir a janela de nova questão.
4. Em **Pergunta**, escreva o enunciado.
5. Em **Alternativas**, preencha as opções. Use o círculo à esquerda de cada alternativa para marcar qual é a **correta** (só pode haver uma correta por questão).
6. Use **Alternativa** para acrescentar opções (de 2 até 6 alternativas).
7. Clique em **Salvar**.
8. Para revisar as respostas dos alunos, use o botão **Respostas**. Para editar uma questão existente, use o ícone de salvar ao lado dela; para apagar, use a lixeira.

## Publicar o curso e definir preço

A publicação e o preço ficam no editor do curso.

1. Abra o curso em **Gerenciar Cursos** (ou **Meus Cursos**).
2. Para publicar, ative a chave **Publicado** no topo da página e clique em **Salvar**. Enquanto desativada, o curso fica como **Rascunho** e não aparece para os alunos.
3. No bloco **Visibilidade Pública & SEO**, opcionalmente:
   - Ative **Tornar público** para deixar o curso visível sem login (na vitrine pública) e indexável por buscadores.
   - Defina o **Slug (URL amigável)**, o **Título SEO** (até 60 caracteres) e a **Descrição SEO** (até 160 caracteres). Há um assistente de otimização que pode sugerir título e descrição.
4. No bloco **Monetização**, defina o preço:
   - A chave **Curso gratuito** deixa o curso sem preço. Desative-a para cobrar.
   - Com a cobrança ativa, informe o **Preço (R$)** e a **Moeda** (BRL, USD ou EUR).
5. Clique em **Salvar** para gravar as alterações.

## Acompanhar o progresso dos alunos (relatórios)

O acompanhamento fica em **Relatórios** (seção **Administração**). A tela traz indicadores no topo: **Matrículas Totais**, **Taxa de Conclusão**, **Certificados Emitidos** e **Score Médio Quizzes** (com a taxa de aprovação).

Os dados são organizados em abas:

- **Visão Geral** — gráfico de matrículas dos últimos 30 dias, distribuição de progresso dos alunos, horas de vídeo assistidas, quizzes realizados e atividades pendentes de correção.
- **Conteúdo** — desempenho por curso (matrículas, progresso médio, concluídos e certificados) e gráfico de matrículas por curso.
- **Alunos** — ranking de **Top Alunos** e lista de **Alunos em Risco** (matriculados, com menos de 25% de progresso e mais de 14 dias sem avançar).
- **Avaliações** — desempenho por quiz (tentativas, score médio e taxa de aprovação).

Para levar os números para fora da plataforma, clique em **Exportar CSV** no canto superior direito. O arquivo traz o resumo por curso (curso, matrículas, progresso médio, concluídos e certificados).

## Criar e-books e audiobooks na biblioteca

A biblioteca fica em **Biblioteca** (seção **Administração**).

1. No menu, clique em **Biblioteca**.
2. Clique em **Novo Item**.
3. Em **Tipo**, escolha **E-Book (PDF)** ou **Audiobook**.
4. Preencha o **Título** (obrigatório) e, se quiser, a **Descrição**.
5. No campo **Arquivo**, informe a URL ou clique em **Upload** para enviar:
   - Para e-book, um PDF (também aceita .doc/.docx).
   - Para audiobook, um arquivo de áudio (MP3/M4A).
6. Opcionalmente, adicione uma **Capa** (por URL ou Upload).
7. Informe os dados específicos do tipo:
   - E-book: **Número de páginas**.
   - Audiobook: **Duração (segundos)**.
8. Se fizer sentido, escolha um **Curso relacionado**.
9. Defina a visibilidade:
   - **Publicado** — torna o item disponível para os alunos.
   - **Tornar público** — visível sem login e indexável por buscadores.
   - Opcionalmente, preencha **Slug**, **Título SEO** e **Descrição SEO**.
10. Clique em **Criar** (ou **Salvar**, ao editar um item existente).

Na tela da biblioteca, use as abas **Todos**, **E-Books** e **Audiobooks** para filtrar. Cada item pode ser editado (ícone de lápis) ou excluído (ícone de lixeira).

## Usar o editor de artigos do blog

Os artigos do blog ficam em **Artigos** (seção **Administração**).

1. No menu, clique em **Artigos**.
2. Clique em **Novo Artigo**.
3. Preencha os campos:
   - **Título**
   - **Resumo** — texto curto, usado também como meta description.
   - **Categoria** e **Autor**.
   - **Tags** — separadas por vírgula (por exemplo: leitura, cultura, história).
   - **Conteúdo (Markdown)** — o corpo do artigo, escrito em Markdown.
4. Clique em **Criar**. O artigo nasce como **Rascunho**.
5. Para publicar ou despublicar, use o ícone de olho na lista de artigos.
6. Para editar, clique no ícone de lápis. Na edição, além dos campos acima, você pode preencher **Título SEO** e **Descrição SEO**, e usar o assistente de otimização para gerar sugestões.
7. Para excluir um artigo, use o ícone de lixeira (a ação não pode ser desfeita).

Na lista, cada artigo mostra também o número de visualizações e o tempo estimado de leitura. Use o campo **Buscar artigos...** para localizar um artigo pelo título.
