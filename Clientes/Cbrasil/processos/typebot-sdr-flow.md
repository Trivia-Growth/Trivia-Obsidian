# Fluxo Typebot SDR - C. Brasil Contabilidade

## Objetivo
Qualificar leads que chegam pelo site, coletando informacoes essenciais para a equipe comercial priorizar e abordar com contexto.

## Fluxo de Perguntas

### 1. Boas-vindas
**Mensagem:** "Ola! Sou o assistente da C. Brasil Contabilidade. Vou te ajudar a encontrar a solucao certa para a sua organizacao. Posso fazer algumas perguntas rapidas?"
**Botao:** "Vamos la"

### 2. Nome
**Mensagem:** "Qual o seu nome?"
**Input:** Texto livre
**Variavel:** `nome`

### 3. Tipo de Organizacao
**Mensagem:** "Qual o tipo da sua organizacao, {{nome}}?"
**Opcoes (botoes):**
- Igreja ou comunidade religiosa
- ONG ou associacao
- Fundacao
- Empresa de servicos
- Outro

**Variavel:** `tipo_organizacao`

### 4. Nome da Organizacao
**Mensagem:** "Qual o nome da sua organizacao?"
**Input:** Texto livre
**Variavel:** `nome_organizacao`

### 5. Principal Necessidade
**Mensagem:** "O que voce mais precisa neste momento?"
**Opcoes (botoes):**
- Contabilidade mensal completa
- Prestacao de contas (convenios/financiadores)
- Abertura ou regularizacao
- Troca de contador
- Certificacao (CEBAS, OSCIP)
- Consultoria pontual

**Variavel:** `necessidade`

### 6. Tamanho (funcionarios)
**Mensagem:** "Quantas pessoas trabalham na organizacao (incluindo voluntarios remunerados)?"
**Opcoes (botoes):**
- Ate 5
- 6 a 20
- 21 a 50
- Mais de 50

**Variavel:** `tamanho`

### 7. Urgencia
**Mensagem:** "Qual a urgencia dessa demanda?"
**Opcoes (botoes):**
- Preciso para ontem (urgente)
- Proximo mes
- Estou pesquisando para o futuro

**Variavel:** `urgencia`

### 8. Contato
**Mensagem:** "Perfeito! Para enviarmos uma proposta, qual o melhor contato?"
**Submensagem:** "Pode ser WhatsApp ou e-mail"
**Input:** Texto livre
**Variavel:** `contato`

### 9. Finalizacao
**Mensagem:** "Obrigado, {{nome}}! Registramos tudo. Nossa equipe vai analisar e entrar em contato em ate 24 horas uteis. Se preferir, pode tambem nos chamar direto no WhatsApp:"
**Botao:** "Falar no WhatsApp" (link: wa.me/5511999999999)

---

## Variaveis Coletadas (para CRM)

| Variavel | Tipo | Exemplo |
|----------|------|---------|
| nome | texto | "Joao" |
| tipo_organizacao | escolha | "Igreja ou comunidade religiosa" |
| nome_organizacao | texto | "Igreja Presbiteriana Pinheiros" |
| necessidade | escolha | "Contabilidade mensal completa" |
| tamanho | escolha | "6 a 20" |
| urgencia | escolha | "Proximo mes" |
| contato | texto | "(11) 98765-4321" |

## Integracao

### Webhook de Saida
Ao finalizar o fluxo, disparar webhook com todas as variaveis para:
1. **Google Sheets** (planilha de leads) - para fase inicial
2. **CRM** (quando implementado) - fase futura

### Notificacao
Enviar notificacao por e-mail para a equipe comercial com os dados coletados.

## Regras de Qualificacao (score para priorizacao)

| Criterio | Pontos |
|----------|--------|
| Urgencia "para ontem" | +3 |
| Urgencia "proximo mes" | +2 |
| Tipo: Igreja/ONG/Fundacao | +2 (core business) |
| Necessidade: Contabilidade mensal | +3 (recorrente) |
| Necessidade: Troca de contador | +2 (decisao tomada) |
| Tamanho > 20 | +1 |

**Lead quente:** 5+ pontos (contato em ate 4h)
**Lead morno:** 3-4 pontos (contato em ate 24h)
**Lead frio:** 0-2 pontos (contato em ate 48h)

## Configuracao no Typebot

1. Criar conta em typebot.io (plano gratuito suporta ate 200 chats/mes)
2. Criar novo fluxo com o roteiro acima
3. Configurar webhook de saida para Google Sheets
4. Copiar o ID do typebot
5. Substituir `YOUR_TYPEBOT_ID` no arquivo `pages/contato.html`
6. Testar fluxo completo antes de publicar
