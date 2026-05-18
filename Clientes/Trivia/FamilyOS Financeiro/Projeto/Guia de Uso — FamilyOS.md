# Guia de Uso — FamilyOS Financeiro

---

## 1. Introducao

O **FamilyOS Financeiro** e o sistema financeiro da familia. Ele centraliza tudo: extratos bancarios, orcamento mensal, metas de poupanca, investimentos e planejamento de longo prazo — tudo num unico lugar.

A grande diferenca e que o sistema tem um **agente de IA** chamado **Fin** que funciona como seu consultor financeiro pessoal. Voce pode conversar com ele em linguagem natural, pedir analises, tirar duvidas e ate registrar gastos por WhatsApp.

**Para quem e?**
- Familia Azevedo (Lucas e Bianca)
- Qualquer membro convidado pelo administrador

**O que ele faz?**
- Importa e categoriza extratos bancarios automaticamente
- Controla orcamento mensal por categoria
- Acompanha metas financeiras (reserva de emergencia, viagens, compras)
- Gerencia carteira de investimentos
- Detecta anomalias nos gastos e gera alertas proativos
- Responde duvidas financeiras via chat ou WhatsApp

---

## 2. Primeiros Passos

### 2.1 Login

Acesse o sistema pelo navegador. A tela de login oferece duas opcoes:

**Opcao 1 — Magic Link (recomendado)**
1. Digite seu email no campo
2. Clique em "Enviar link de acesso"
3. Abra seu email e clique no link recebido
4. Pronto — voce sera redirecionado ao Dashboard

Nao precisa de senha. O link e seguro e expira apos o uso.

**Opcao 2 — Acesso Demo**
- Clique em "Acessar como Familia Trivia (demo)"
- O sistema cria um ambiente de demonstracao com dados fictícios
- Util para explorar todas as funcionalidades sem afetar dados reais

### 2.2 Onboarding (primeiro acesso)

Se e sua primeira vez, o sistema pede que voce crie ou entre numa familia:
- **Criar familia:** Defina o nome (ex: "Familia Azevedo") e voce se torna administrador
- **Aceitar convite:** Se alguem ja te convidou, use o link de convite recebido por email

### 2.3 Papeis

| Papel | O que pode fazer |
|-------|-----------------|
| **Admin** | Tudo: importar extratos, definir orcamento, configurar IA, convidar membros, integrar WhatsApp |
| **Membro (viewer)** | Visualizar todos os dados, conversar com o Fin, contribuir para metas |

---

## 3. Dashboard

O Dashboard e a pagina inicial apos o login. Ele mostra um resumo rapido da situacao financeira.

### Cards de metricas

| Card | O que mostra |
|------|-------------|
| **Saldo** | Diferenca entre entradas e saidas do mes (verde se positivo) |
| **Gastos do mes** | Total de despesas no mes atual |
| **Orcamento** | Percentual utilizado do teto mensal. Se passa de 80%, aparece "Atencao ao limite" |
| **Entradas** | Total recebido no mes |

### Grafico de fluxo de caixa

Um grafico de area mostra a evolucao de entradas (linha escura) e saidas (linha coral) nos ultimos meses. Permite identificar tendencias rapidamente.

### Barra de progresso do orcamento

Quando voce tem tetos definidos, uma barra mostra visualmente quanto ja foi gasto vs. o limite total do mes.

### Navegacao (Modulos)

Abaixo dos graficos, cards de navegacao levam voce a cada area do sistema:
- Visao Geral, Chat com Fin, Importar Extrato, Categorizar, Orcamento, Metas, Investimentos, Inteligencia, WhatsApp e Configuracoes

---

## 4. Agente IA — Chat com o Fin

O **Fin** e seu assistente financeiro pessoal. Ele vive na rota `/chat` e funciona como um chat comum.

### Personalidade

O Fin foi projetado para ser:
- **Direto e pratico** — responde sem enrolacao
- **Amigavel** — sem jargao tecnico, como um amigo que entende de financas
- **Proativo** — sugere acoes e alertas quando identifica algo relevante
- **Com memoria** — lembra do historico de conversas e decisoes anteriores

### O que voce pode perguntar

**Visao geral:**
- "Como estao minhas financas esse mes?"
- "Quanto gastei com alimentacao em abril?"
- "Estou acima do orcamento?"

**Metas:**
- "Quero juntar R$ 30.000 para reserva de emergencia"
- "Como esta minha meta de viagem?"
- "Se eu guardar R$ 1.500 por mes, quando atinjo a meta?"

**Investimentos:**
- "Quanto tenho investido no total?"
- "Qual investimento rendeu mais?"
- "Vale a pena resgatar o CDB que vence mes que vem?"

**Decisoes de compra:**
- "Posso comprar um celular de R$ 3.000 esse mes?"
- "Se eu gastar R$ 500 em jantar fora, como impacta meu orcamento?"

**Registros rapidos:**
- "Gastei R$ 150 no mercado hoje"
- "Recebi R$ 5.000 de freelance"

### Como usar

1. Acesse `/chat` pelo menu ou pelo card "Falar com o Fin" no Dashboard
2. Digite sua mensagem na caixa de texto
3. Pressione **Enter** para enviar (Shift+Enter para quebrar linha)
4. Aguarde a resposta do Fin (indicador de "digitando" aparece)

---

## 5. Extratos e Transacoes

### 5.1 Upload de Extrato (`/extratos/upload`)

Voce pode importar extratos bancarios nos formatos:
- **PDF** — extrato do banco em formato digital
- **CSV** — planilha exportada do app do banco
- **OFX** — formato padrao bancario (Open Financial Exchange)

**Como fazer:**
1. Acesse "Importar Extrato" no Dashboard
2. Arraste o arquivo ou clique para selecionar
3. O sistema usa IA para interpretar o extrato e extrair as transacoes
4. Revise as transacoes identificadas
5. Confirme a importacao

**Dica:** Quanto mais extratos voce importa, melhor o sistema entende seus padroes.

### 5.2 Categorizacao (`/extratos/categorizar`)

Apos importar, as transacoes precisam ser categorizadas (ex: Alimentacao, Transporte, Lazer, Moradia).

O sistema usa uma abordagem hibrida:
- **Regras automaticas** — transacoes recorrentes sao categorizadas automaticamente com base no historico
- **Sugestoes da IA** — para novas transacoes, o Fin sugere a categoria com base na descricao
- **Revisao manual** — voce confirma ou corrige a sugestao

**Como funciona:**
1. Acesse "Categorizar" no Dashboard
2. Voce vera as transacoes pendentes de revisao
3. Para cada uma, aceite a sugestao da IA ou escolha outra categoria
4. Confirme

Com o tempo, o sistema aprende suas preferencias e a categorizacao automatica fica cada vez mais precisa.

---

## 6. Orcamento

Acesse pela rota `/orcamento`.

O orcamento permite definir **tetos mensais por categoria** de gasto.

### Como configurar

1. Acesse "Orcamento" no Dashboard
2. Defina um valor maximo para cada categoria (ex: Alimentacao R$ 2.000, Lazer R$ 800)
3. Salve

### Acompanhamento

O sistema cruza as transacoes categorizadas com os tetos definidos e mostra:
- Quanto voce ja gastou em cada categoria
- Percentual utilizado do teto
- Alertas quando se aproxima ou ultrapassa o limite

### Alertas

- **Ate 80% usado:** "Dentro do teto" — tudo bem
- **Acima de 80%:** "Atencao ao limite" — hora de pisar no freio
- **Acima de 100%:** Teto estourado — o sistema notifica e o Fin pode enviar alerta

---

## 7. Metas

Acesse pela rota `/metas`.

Metas sao objetivos financeiros com valor-alvo e prazo. Voce contribui aos poucos ate atingir o valor.

### Tipos de meta disponiveis

| Tipo | Exemplo |
|------|---------|
| Reserva de Emergencia | Juntar 6 meses de custo de vida |
| Viagem | Ferias em familia |
| Bem Material | Carro novo, celular |
| Investimento | Capital para aporte |
| Aposentadoria | Planejamento longo prazo |
| Personalizada | Qualquer objetivo |

### Criar uma meta

**Pelo formulario:**
1. Acesse "Metas" no Dashboard
2. Clique em "+ Nova meta"
3. Preencha: nome, tipo, valor-alvo, prazo (opcional) e descricao
4. Clique em "Criar Meta"

**Pelo Fin (mais natural):**
- Diga no chat: "Quero juntar R$ 10.000 para uma viagem no fim do ano"
- O Fin cria a meta e confirma com voce

### Contribuir

1. Na tela de Metas, clique em "+ Contribuir" no card da meta
2. Informe o valor e uma observacao opcional
3. Confirme

### Projecoes

O sistema calcula automaticamente quanto tempo falta para atingir a meta com base na media de contribuicoes mensais.

Exemplo: se voce aporta R$ 1.000/mes e faltam R$ 12.000, a projecao mostra "12 meses".

---

## 8. Investimentos

Acesse pela rota `/investimentos`.

### Tipos suportados

| Tipo | Descricao |
|------|-----------|
| CDB | Certificado de Deposito Bancario |
| LCI | Letra de Credito Imobiliario |
| LCA | Letra de Credito do Agronegocio |
| Tesouro Direto | Titulos publicos |
| FII | Fundos Imobiliarios |
| Acoes | Acoes na bolsa |
| Cripto | Bitcoin, Ethereum, etc. |
| Fundo | Fundos de investimento |
| Outros | Qualquer ativo nao listado |

### Cadastrar investimento

1. Clique em "+ Adicionar"
2. Preencha: nome, instituicao, tipo, liquidez, valor investido, valor atual, data de vencimento (se aplicavel) e benchmark
3. Confirme

**Exemplo:**
- Nome: "CDB Nubank 13% a.a."
- Instituicao: Nubank
- Tipo: CDB
- Liquidez: Medio prazo
- Investido: R$ 10.000
- Valor atual: R$ 10.500
- Vencimento: dez/2025
- Benchmark: CDI

### Dashboard de investimentos

A pagina mostra:
- **Totais:** valor investido, valor atual e rentabilidade total (%)
- **Grafico de alocacao:** barra colorida mostrando a distribuicao por tipo de ativo
- **Alertas de vencimento:** investimentos que vencem nos proximos 30 dias
- **Cards individuais:** cada investimento com rentabilidade, valores e opcao de atualizar

### Atualizar valor

Clique no valor atual de qualquer investimento para editar. Util para atualizar posicoes que nao tem conexao automatica.

### Simulador de aportes

Na secao inferior, o simulador mostra quanto voce acumula com aportes mensais regulares:
- Informe: aporte mensal, taxa anual e periodo (anos)
- O sistema calcula: valor investido total, resultado final e rendimento

**Exemplo:** R$ 1.000/mes a 12% a.a. por 5 anos = R$ 81.670 (R$ 60.000 investidos + R$ 21.670 de rendimento)

---

## 9. WhatsApp

Acesse pela rota `/whatsapp` (apenas administradores).

A integracao com WhatsApp permite interagir com o Fin diretamente do celular, sem abrir o navegador.

### Configuracao (unica vez)

1. Crie uma conta no [Z-API](https://z-api.io)
2. No FamilyOS, acesse Configuracoes > WhatsApp
3. Copie a URL do webhook exibida na tela
4. No painel do Z-API, configure essa URL como webhook "On Message Received"
5. Preencha: Instance ID, Token, Telefone do admin e Webhook Secret
6. Salve

### Vincular membros

Apos configurar, vincule o numero de telefone de cada membro da familia para que todos possam usar os comandos.

### Comandos disponiveis

| Comando | O que faz |
|---------|-----------|
| `/resumo` | Resumo financeiro do mes atual |
| `/meta` | Status de todas as metas ativas |
| `/carteira` | Situacao geral dos investimentos |
| `/gasto 150 Mercado` | Registra um gasto de R$ 150 na categoria Mercado |
| `/investir` | Recebe sugestao personalizada de investimento |

### Mensagens proativas

Alem de responder comandos, o Fin pode enviar mensagens proativamente:
- Alerta quando o orcamento de uma categoria passa de 80%
- Lembrete quando um investimento esta proximo do vencimento
- Resumo semanal automatico (se configurado)

---

## 10. Inteligencia Proativa

Acesse pela rota `/inteligencia`.

Esta secao usa IA para analisar seus dados e gerar insights que voce nao pediria sozinho.

### 10.1 Score de Saude Financeira

Um numero de 0 a 100 que resume a "saude" das suas financas no mes. Composto por:

| Componente | Peso | O que avalia |
|-----------|------|-------------|
| Orcamento | 30 pts | Se voce esta dentro dos tetos |
| Poupanca | 25 pts | Se esta guardando dinheiro |
| Reserva de emergencia | 20 pts | Se tem colchao para imprevistos |
| Metas | 15 pts | Se esta evoluindo nos objetivos |
| Investimentos | 10 pts | Se tem diversificacao minima |

**Classificacao:**
- 75+ = Otima (verde)
- 50-74 = Regular (amarelo)
- Abaixo de 50 = Atencao (vermelho)

### 10.2 Alertas de Gastos (Anomalias)

O sistema compara seus gastos atuais com o historico e alerta quando detecta algo fora do padrao.

**Exemplo:** Se voce costuma gastar R$ 800/mes com alimentacao e neste mes ja gastou R$ 1.500, o sistema alerta mostrando:
- Categoria afetada
- Valor atual
- Quantos desvios-padrao acima da media (quanto maior, mais fora do normal)
- Media historica para comparacao

Se nenhuma anomalia for detectada, aparece uma mensagem verde: "Nenhuma anomalia detectada este mes."

### 10.3 Score de Decisao

Antes de fazer uma compra grande, simule o impacto:

1. Digite a descricao (ex: "iPhone 15 Pro Max")
2. Informe o valor (ex: R$ 7.999)
3. Clique em "Analisar"

O Fin analisa como essa compra impacta:
- Seu orcamento do mes
- Suas metas em andamento
- Sua reserva de emergencia
- E retorna uma recomendacao personalizada

---

## 11. Configuracoes

Acesse pela rota `/familia/configuracoes` (apenas administradores).

### 11.1 Membros da familia

- Veja todos os membros cadastrados
- Altere papeis (promover para admin ou rebaixar para membro)

### 11.2 Convidar novo membro

1. Digite o email do convidado
2. Escolha o papel (Membro ou Admin)
3. Clique em "Enviar convite"
4. O convidado recebe um email com link de aceite

Convites pendentes ficam visiveis na tela com data de expiracao.

### 11.3 Configuracao de IA (LLM)

O FamilyOS usa inteligencia artificial via [OpenRouter](https://openrouter.ai). Aqui voce pode:

- **Inserir sua API Key** (BYOK — Bring Your Own Key): cada familia usa sua propria chave
- **Escolher o modelo padrao:** o recomendado e `anthropic/claude-sonnet-4-5`, mas voce pode mudar
- **Monitorar custos:** acompanhe quanto esta gastando com as chamadas de IA

A chave e criptografada e nunca fica exposta no navegador.

---

## 12. Seguranca

### Isolamento por familia

Cada familia so ve seus proprios dados. Isso e garantido pelo banco de dados (RLS — Row Level Security). Mesmo que alguem tente acessar dados de outra familia via API, o banco bloqueia automaticamente.

### Autenticacao sem senha

O login e feito por magic link (link unico enviado por email). Nao existe senha para ser roubada, vazada ou esquecida.

### Papeis e permissoes

- **Admin:** controle total
- **Membro:** somente visualizacao e interacao basica (contribuir para metas, conversar com Fin)

### Criptografia

- Chaves de API (OpenRouter, Z-API) sao criptografadas antes de salvar no banco
- Comunicacao sempre via HTTPS
- Tokens bancarios nunca ficam no navegador

### Calculos no backend

Todos os calculos financeiros (saldos, totais, scores) acontecem no servidor (Supabase Edge Functions). O frontend so exibe resultados — nao calcula valores.

---

## 13. FAQ

**P: Preciso instalar algo?**
R: Nao. O FamilyOS funciona 100% no navegador. Acesse pelo celular ou computador.

**P: E seguro colocar meus dados financeiros?**
R: Sim. O sistema usa isolamento por familia, criptografia e autenticacao segura. Seus dados nao sao compartilhados com ninguem.

**P: O Fin tem acesso ao meu banco?**
R: Nao diretamente. Voce importa os extratos manualmente (PDF, CSV ou OFX). O Fin nao se conecta ao banco automaticamente.

**P: Quanto custa?**
R: O sistema em si e gratuito. O unico custo e a chave de API do OpenRouter para o agente de IA (centavos por conversa). Voce controla o gasto pela sua propria conta no OpenRouter.

**P: Posso usar sem o WhatsApp?**
R: Sim! O WhatsApp e opcional. Todas as funcionalidades estao disponiveis pelo navegador e pelo chat web.

**P: O que acontece se eu estourar o orcamento?**
R: O sistema alerta voce (no Dashboard e no WhatsApp se configurado), mas nao bloqueia nada. A ideia e informar, nao restringir.

**P: Como o Fin aprende meus padroes?**
R: A cada extrato importado e categorizado, a cada conversa, a cada decisao — o Fin acumula memoria sobre seus habitos e preferencias. Quanto mais voce usa, mais personalizado fica.

**P: Bianca pode ver tudo que eu vejo?**
R: Se ambos estao na mesma familia, sim. Todos os membros veem os mesmos dados financeiros. A diferenca e apenas no papel (admin vs. membro) que define quem pode configurar o sistema.

**P: Posso apagar meus dados?**
R: Sim. O administrador pode remover transacoes, metas e investimentos a qualquer momento.

**P: E se eu esquecer meu email?**
R: O administrador da familia pode verificar os membros cadastrados e, se necessario, convidar novamente com outro email.

---

*Ultima atualizacao: maio/2026*
