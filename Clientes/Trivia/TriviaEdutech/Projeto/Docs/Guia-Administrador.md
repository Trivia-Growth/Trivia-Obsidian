# Guia do administrador — TriviaEdutech

A TriviaEdutech é uma plataforma de ensino a distância (EAD) multi-organização e white-label. Cada cliente recebe a sua própria **organização** (também chamada de "tenant" no sistema): um ambiente isolado, com a sua marca, os seus usuários, os seus cursos e as suas configurações. Tudo o que você cria ou ajusta como administrador vale apenas para a sua organização — os dados de uma organização nunca aparecem em outra.

Sua organização tem um endereço próprio no formato `suaorganizacao.triviaedutech.com` (o "slug" é a primeira parte desse endereço) e pode, opcionalmente, usar um domínio próprio.

Este guia descreve as tarefas de administração disponíveis no menu lateral, na seção **Administração**, que aparece apenas para quem tem o papel de administrador. Os itens dessa seção são: **Painel Admin**, **Relatórios**, **Gerenciar Cursos**, **Trilhas**, **Artigos**, **Biblioteca**, **Usuários**, **Vídeos** e **Configurações**.

---

## Configuração inicial da organização

A personalização visual fica em **Configurações** (menu **Administração** > **Configurações**), na aba **Personalização**. Lá você encontra o cartão **Personalização** (logo e cores) e, ao lado, o cartão **Dados da Empresa**, que mostra em modo leitura o nome, o slug/subdomínio e o status da organização.

Para configurar a identidade visual:

1. Abra **Configurações** e selecione a aba **Personalização**.
2. **Logo da empresa**: clique na área tracejada "Clique para enviar logo" e escolha uma imagem. São aceitos arquivos PNG ou JPG de até 2 MB.
3. **Cor primária**: escolha uma das cores prontas (Coral, Azul, Verde, Roxo, Laranja, Rosa, Teal) ou clique no seletor de cor para definir um tom personalizado. A prévia é aplicada na hora. Use o botão **Padrão** para voltar à cor original (Coral).
4. **Domínio customizado** (quando habilitado para o seu plano): informe o seu domínio próprio, por exemplo `academia.suaempresa.com.br`. Para funcionar, aponte um registro CNAME desse domínio para `triviaedutech.com`.
5. Clique em **Salvar Personalização**. A página recarrega para aplicar as mudanças em toda a plataforma.

Observação: o campo de domínio customizado só aparece quando esse recurso está liberado para a sua organização. Se você não o vê, sua organização continua acessível pelo subdomínio `suaorganizacao.triviaedutech.com`.

---

## Gerenciar usuários

A gestão de pessoas fica em **Usuários** (menu **Administração** > **Usuários**). A tela lista todos os usuários da organização com nome, e-mail, função e data de entrada, além de uma busca por nome ou e-mail.

Existem três papéis (funções):

- **Aluno**: acessa os cursos em que está matriculado.
- **Instrutor**: cria e gerencia cursos e conteúdo.
- **Admin**: tem acesso completo à gestão da organização (cursos, usuários e configurações).

### Convidar um usuário

1. Clique em **Convidar Usuário** (botão no topo da tela).
2. Escolha o modo de convite:
   - **Via Link**: o sistema gera um link de convite para você copiar e enviar à pessoa (por e-mail, WhatsApp etc.). A pessoa abre o link e conclui o próprio cadastro.
   - **Criação direta**: você cria a conta na hora, informando **Nome completo** e uma **Senha inicial** (mínimo de 6 caracteres).
3. Informe o **E-mail** da pessoa.
4. Selecione a **Função** (Aluno, Instrutor ou Admin).
5. Opcionalmente, marque cursos em **Pré-matrícula em cursos** para já deixar a pessoa matriculada (a lista mostra os cursos publicados).
6. Conclua com **Gerar Link de Convite** (modo link) ou **Convidar** (criação direta). No modo link, use o botão de copiar para pegar o endereço.

### Alterar a função de um usuário

Na tabela de usuários, use o seletor de função na linha da pessoa e escolha **Aluno**, **Instrutor** ou **Admin**. A mudança é aplicada imediatamente.

### Outras ações na lista

- **Ver relatório** (ícone de gráfico): abre o relatório individual de progresso daquele usuário.
- **Remover** (ícone de lixeira): exclui o usuário da organização. A ação pede confirmação e é permanente.
- **Matrícula em Lote**: botão no topo que permite matricular vários alunos de uma vez.

---

## Configurar a plataforma de vídeo

As plataformas de streaming ficam em **Configurações** > aba **Vídeos** (também acessível pelo item **Vídeos** do menu Administração). Cada organização escolhe e configura a própria plataforma — as credenciais e o provedor ativo valem só para a sua organização.

As plataformas disponíveis são apresentadas em cartões:

- **Panda Video** — streaming brasileiro com boa relação custo-benefício. Campo: **API Key**.
- **Vimeo** — plataforma profissional com player premium. Campo: **Access Token** (Personal Access Token do Vimeo).
- **Mux Video** — plataforma premium com analytics avançado. Campos: **Token ID** e **Token Secret**.

Para configurar uma plataforma:

1. Abra **Configurações** > **Vídeos**.
2. No cartão da plataforma desejada, preencha o(s) campo(s) de credencial. Use o ícone de olho para revelar ou ocultar o valor digitado.
3. Ative o seletor (chave) no topo do cartão para habilitar a plataforma.
4. Clique em **Salvar**.
5. Clique em **Testar** para validar a conexão. O cartão exibe o status: **Conectado**, **Erro**, **Não testado** ou **Não configurado**.

Observação: as plataformas que aparecem podem variar conforme o plano da sua organização. Se uma plataforma esperada não estiver visível, ela pode não estar liberada no seu plano (veja a aba **Plano**).

---

## Configurar o provedor de IA

A inteligência artificial é usada pelo **Tutor IA**, pela **geração automática de quizzes** e pela **otimização de conteúdo** (SEO). A configuração fica em **Configurações** > aba **IA**.

Regra importante: **apenas um provedor pode estar ativo por vez**.

Os provedores disponíveis são:

- **OpenRouter** — acesso unificado a vários modelos (Gemini, GPT, Claude, Llama, Mistral).
- **OpenAI** — modelos GPT-4o e GPT-4o-mini, entre outros.
- **Google Gemini** — Gemini 2.0 Flash e 1.5 Pro.
- **Anthropic Claude** — Claude 3.5 Haiku e Sonnet, entre outros.

Para configurar:

1. Abra **Configurações** > **IA**.
2. No cartão do provedor escolhido, informe a **API Key**. O link **Obter chave** leva à página onde você gera a chave no site do provedor. Se já existir uma chave salva, deixe o campo em branco para mantê-la.
3. Selecione o **Modelo para Chat / Tutor IA** e o **Modelo para Geração de Conteúdo**.
4. Ative o seletor (chave) no topo do cartão para tornar esse provedor o ativo.
5. Clique em **Salvar**.
6. Use o botão ao lado (ícone de Wi-Fi) para **testar a conexão**; um visto verde indica sucesso e um X vermelho indica falha.

A etiqueta do cartão mostra **Ativo** (em uso) ou **Configurado** (chave salva, mas não ativo).

---

## Criar e organizar cursos e trilhas

### Cursos

Os cursos ficam em **Gerenciar Cursos** (menu **Administração** > **Gerenciar Cursos**). A tela mostra os cursos em cartões, com miniatura, título, nível, duração e a etiqueta **Publicado** ou **Rascunho**, além de uma busca por título.

Para criar um curso:

1. Clique em **Novo Curso**. Um curso é criado com o título "Novo Curso" e você é levado direto à tela de edição, onde define título, descrição, módulos e aulas.
2. Como alternativa, use **Importar do Vimeo**: escolha uma pasta do Vimeo e o sistema cria um curso com uma aula para cada vídeo da pasta. Informe o título do curso e clique em **Importar**.

Outras ações no cartão de cada curso: **Editar** (abre a edição completa) e o ícone de lixeira para **excluir** (a exclusão remove também todos os módulos e aulas e é irreversível).

Observação sobre limites: a criação de cursos respeita o limite do plano da organização. Quando você se aproxima do limite, aparece um aviso; ao atingi-lo, os botões de criar e importar ficam desabilitados. Os limites do plano podem ser consultados em **Configurações** > aba **Plano**.

### Trilhas

As trilhas ficam em **Trilhas** (menu **Administração** > **Trilhas**). Uma trilha organiza vários cursos em sequência.

Para criar e montar uma trilha:

1. Clique em **Nova Trilha**, informe **Título** e (opcional) **Descrição** e clique em **Criar**.
2. No cartão da trilha, clique em **Cursos** para escolher quais cursos fazem parte dela e em que ordem (a ordem é indicada por uma numeração ao lado de cada curso marcado). Salve ao final.
3. Use **Publicar** / **Despublicar** para controlar a visibilidade da trilha.
4. Pelo botão de edição (lápis) você também pode definir se a trilha é **pública** (visível sem login e indexável por buscadores), além de **Slug**, **Título SEO** e **Descrição SEO**. Há um auxiliar de SEO que sugere título e descrição.

---

## Gerenciar pagamentos (Mercado Pago)

A integração de pagamentos fica em **Configurações** > aba **Pagamentos**, no cartão **Mercado Pago**. A ideia é conectar a conta Mercado Pago da sua organização para receber os pagamentos dos alunos diretamente nela.

Como funciona hoje:

1. Abra **Configurações** > **Pagamentos**.
2. Clique em **Conectar Mercado Pago**.
3. Quando conectado, o cartão mostra o **ID do vendedor** e a data da conexão, com a etiqueta **Conectado**. Há também o botão **Desconectar**.

**Importante — recurso em configuração:** a integração com o Mercado Pago opera atualmente em **modo de teste (mock)** enquanto as credenciais oficiais do Mercado Pago não forem configuradas na plataforma. Nesse modo, a conexão é simulada (aparece como "conectado em modo teste") e os fluxos de cobrança geram registros simulados, sem cobrança real. A cobrança em produção passa a valer quando as credenciais do Mercado Pago forem ativadas. Trate essa área como pronta no fluxo de uso, mas pendente de ativação para transações reais.

---

## Monitorar relatórios e analytics

Os indicadores ficam em **Relatórios** (menu **Administração** > **Relatórios**). No topo há quatro indicadores principais: **Matrículas Totais**, **Taxa de Conclusão**, **Certificados Emitidos** e **Score Médio Quizzes** (com a taxa de aprovação). O conteúdo é dividido em quatro abas:

- **Visão Geral**: matrículas dos últimos 30 dias, distribuição de progresso dos alunos, horas de vídeo assistidas, total de quizzes realizados e atividades pendentes de correção.
- **Conteúdo**: desempenho por curso (matrículas, progresso médio, concluídos e certificados) e um gráfico de matrículas por curso.
- **Alunos**: ranking de **Top Alunos** e lista de **Alunos em Risco** (matriculados há mais de 14 dias com menos de 25% de progresso).
- **Avaliações**: desempenho por quiz (tentativas, score médio e taxa de aprovação).

Use o botão **Exportar CSV** (no topo) para baixar uma planilha com o desempenho por curso. Para ver o desempenho de uma pessoa específica, vá a **Usuários** e clique no ícone de relatório na linha dela.

---

## Gerenciar blog e conteúdo SEO

Os artigos do blog ficam em **Artigos** (menu **Administração** > **Artigos**). A tela lista os artigos com etiqueta **Publicado** ou **Rascunho**, categoria, número de visualizações e tempo de leitura, além de uma busca por título.

Para criar um artigo:

1. Clique em **Novo Artigo**.
2. Preencha **Título**, **Resumo** (usado como meta description), **Categoria**, **Autor**, **Tags** (separadas por vírgula) e o **Conteúdo (Markdown)**.
3. Clique em **Criar**.

Para gerenciar um artigo existente, use os botões na linha dele:

- **Publicar / Despublicar** (ícone de olho).
- **Editar** (lápis): além dos campos acima, permite definir **Título SEO** (até 60 caracteres) e **Descrição SEO** (até 160 caracteres). Há um auxiliar de SEO que sugere automaticamente esses campos a partir do conteúdo.
- **Excluir** (lixeira): remove o artigo de forma permanente.

Recursos de SEO também estão presentes nas **Trilhas** (Slug, Título SEO, Descrição SEO e opção de tornar a trilha pública e indexável), conforme descrito na seção de trilhas.

---

## Central de Ajuda e FAQ

A plataforma tem uma Central de Ajuda com perguntas frequentes (FAQ). É importante entender que existem **duas áreas distintas**:

1. **Central de Ajuda dos usuários logados** — acessível pelo item **Ajuda** no rodapé do menu lateral. Essa página mostra as perguntas frequentes **da sua organização**, organizadas por categoria, com busca.

2. **Gerenciamento de FAQ (administrador)** — fica em **Configurações** > aba **FAQ**. Aqui você cria, edita, publica/despublica e remove as perguntas que aparecem na Central de Ajuda dos usuários logados (item 1).

Para gerenciar as FAQs da sua organização:

1. Abra **Configurações** > aba **FAQ**.
2. Em **Nova FAQ**, preencha **Pergunta**, **Resposta** e, opcionalmente, **Categoria**; clique em **Adicionar**.
3. Na lista **FAQs Cadastradas**, use o seletor (chave) para publicar ou ocultar cada pergunta, o lápis para editar e a lixeira para remover.

Observação importante sobre a página pública: além da Central de Ajuda dos usuários logados, existe uma página de ajuda pública (endereço `/ajuda`) com um conjunto de perguntas frequentes **fixas, definidas no próprio sistema** (sobre matrícula, acesso a aulas, Tutor IA, certificados, pagamentos e conta). Essa página pública **não é editável pelo painel administrativo** no momento — ela serve como material de apoio padrão da plataforma. A edição via painel descrita acima vale para a Central de Ajuda dos usuários logados.
