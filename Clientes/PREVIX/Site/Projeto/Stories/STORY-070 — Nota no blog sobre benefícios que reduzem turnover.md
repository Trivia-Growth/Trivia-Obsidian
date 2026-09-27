---
id: STORY-070
titulo: "Nota no blog sobre benefícios que reduzem turnover"
fase: 7
modulo: "Conteúdo · Blog"
status: concluido
prioridade: alta
agente_responsavel: "@jg"
criado: 2026-08-05
atualizado: 2026-08-05
epico: EPIC-BRANDING-V7
tipo: conteudo
executor: painel
---

# STORY-070 — Nota no blog sobre benefícios que reduzem turnover

> Item 5 de [[A aplicar no Site Previx]], marcado **P0** e como **pedido explícito do
> Dr. Ricardo** na devolutiva de 26/05/2026. É o único item do checklist que o cliente
> pediu nominalmente para publicar.

## Contexto

A Previx passou a oferecer aos colaboradores de facilities (portaria, limpeza):

- **Prêmio de assiduidade adicional**, além do previsto na CCT
- **Plano assistencial de saúde**: atendimento por telemedicina 24h pelo aplicativo, com
  clínico geral. Custo integral da empresa, sem repasse ao cliente
  *(corrigido em 05/08/2026 — a story nasceu dizendo "plano de saúde", termo errado que veio
  dos documentos do vault. Ver a seção de correção no fim.)*

O pedido tem dois objetivos ao mesmo tempo: reforçar o argumento comercial **"menor turnover
no seu cliente"** e melhorar o branding de empregadora. O documento sugere o título:

> *"Como cuidamos de quem cuida do seu patrimônio: os benefícios que reduzem turnover na sua
> operação"*

## Diagnóstico (05/08/2026)

O blog está pronto para receber a nota, sem depender de código:

- Posts vivem em `site.posts` e são publicados por `/admin/posts`
  (`PostsListPage.tsx`, `PostEditor.tsx`), com preview em `/admin/posts/preview/:id`.
- A listagem `/noticias` mostra apenas `status = 'publicado'`
  (`src/lib/data/posts.ts:41-56`), ordenando por `ordem` e depois `publicado_em`.
- O rebuild dispara no salvamento (STORY-054), então publicar realmente coloca no ar.
- Existe geração assistida por IA (`GerarPostModal` → edge `generate-post`).

**Atenção ao usar a IA:** o prompt do gerador descreve a empresa com os números velhos —
"mais de 15 anos", "+500 colaboradores", "+100 empresas"
(`supabase/functions/generate-post/index.ts:87`). Um post gerado hoje nasce contradizendo o
branding v7. A correção do prompt é a **STORY-065**; até lá, revisar manualmente o texto
gerado ou escrever direto no editor.

## Escopo

### ✅ Inclui

1. Escrever e publicar a nota no blog.
2. **Ângulo comercial, não de RH.** Quem lê o site é o contratante, não o candidato. O
   benefício a vender é a operação sem troca constante de rosto; os benefícios ao
   colaborador são a causa, não a manchete.
3. Respeitar as regras de copy: sem travessões, sem emojis, "mais de 16 anos"
   ([[feedback_previx_branding_regras]], [[feedback_mensagens_clientes_estilo]]).
4. Capa e meta description alinhadas ao post.
5. Confirmar que o post aparece em `/noticias` **publicado**, não só salvo.

### ❌ NÃO inclui

- Comunicar os benefícios nas páginas institucionais — **STORY-069**.
- Criar página de carreiras ou trabalhe conosco.
- Divulgação em redes sociais (existe a [[Pauta Redes Sociais Previx]] à parte).

## Critérios de Aceite

- [x] CA1 — Post publicado e visível em `/noticias`, com URL própria funcionando.
- [x] CA2 — O texto cita o prêmio de assiduidade adicional à CCT e o **plano assistencial de
      saúde**, com o que ele é (telemedicina 24h com clínico geral) e quem paga (a Previx,
      sem repasse ao cliente).
- [x] CA3 — O ângulo é o benefício para o cliente contratante (menor rotatividade na
      operação), não uma comunicação interna de RH.
- [x] CA4 — Nenhum número do post contradiz o branding v7 (nada de "15 anos" ou "+500").
- [x] CA5 — Sem travessões e sem emojis no corpo.
- [x] CA6 — Post com capa e meta description preenchidas.

## Riscos

- **Compromisso público sobre benefício trabalhista.** O texto passa a ser prova de uma
  prática de RH. Confirmar com o Dr. Ricardo o alcance exato antes de publicar: vale para
  todos os colaboradores de facilities ou só parte, e desde quando.
- Se a nota for gerada por IA antes da STORY-065, ela sai com os números velhos. Esse é o
  caminho mais provável de erro nesta story.
- É o item que o cliente pediu nominalmente. Ficar pronto sem ser publicado equivale a não
  fazer.

## Links

- [[A aplicar no Site Previx]] — item 5 e "Nota de notícia a publicar"
- [[Contexto Atualizado - Dr. Ricardo]] — diferencial 3, equipe com menor turnover
- [[STORY-069 — Diferenciais v7 não existem no site]]
- [[STORY-065 — Copy institucional preso no código]]

## Notas de Implementação (2026-08-05)

Commit `1ac3958`. Migration `20260805290000`.

Post publicado em `/noticias/beneficios-que-reduzem-turnover-na-sua-operacao`, com o título
sugerido pelo Dr. Ricardo.

### Ângulo

Comercial, não de RH, como a story exigia. A manchete não é "cuidamos da nossa equipe", é
**o custo que a rotatividade transfere para a operação do cliente**. Os benefícios entram
como causa. A seção final entrega três perguntas que o leitor pode usar para avaliar
**qualquer** fornecedor, inclusive a Previx — é o que separa nota institucional de material
que o gestor guarda.

### Article IV (No Invention)

As duas estatísticas do corpo são dados proprietários da Previx (+700 colaboradores, 99% de
retenção), ambas com `fonte` e `fonteUrl`. **Nenhum número de mercado foi usado**: não havia
fonte neutra verificada em mãos, e inventar estatística é recusa por constituição. O texto
sustenta o argumento qualitativamente onde não há dado.

### Verificado

- Post no ar (**200**) e listado em `/noticias`.
- Estrutura: 5 blocos H2 + FAQ com 4 perguntas + sumário + 2 estatísticas + 2 callouts.
- **Zero travessões e zero emojis** na copy. Os 5 travessões que o `grep` acusa no HTML da
  página estão em **comentários de JavaScript** do widget de chat, não no texto.
- Nenhum número velho ("15 anos", "+500", "100 empresas", "PX One").

### Ressalva que continua valendo

O post afirma publicamente uma prática trabalhista em nome do cliente. **Confirme com o
Dr. Ricardo o alcance exato** antes de divulgar: se vale para todos os colaboradores de
facilities ou só parte, e desde quando. Ajustar o texto depois é uma edição no painel;
publicar um alcance maior do que o real é outra conversa.

---

## Correção pós-publicação (2026-08-05)

Commit `ea1cd98`. Migration `20260805300000`.

**O benefício não é "plano de saúde".** Correção do Dr. Ricardo depois de ver o conteúdo no ar:

> "não pode aparecer o nome plano de saúde. Porque não é um plano de saúde, é um atendimento
> por telemedicina. O funcionário tem 24 horas no aplicativo, ele faz o atendimento com o
> médico, 24 horas com o clínico geral. Teria que ser **plano assistencial de saúde**. [...]
> **sem custo nenhum para o cliente, sem custo nenhum para o colaborador, um custo total da
> empresa.**"

### De onde veio o erro

Não foi invenção do texto: **"plano de saúde" estava escrito nos três documentos do vault**
que registram a devolutiva de 26/05 ([[Contexto Atualizado - Dr. Ricardo]],
[[Branding Previx]], [[A aplicar no Site Previx]]). A fonte interna estava errada e o site
apenas propagou. Eu li a fonte e não questionei o termo.

Por isso os **três documentos foram corrigidos junto com o site**, com aviso explícito em
cada um. Corrigir só o site deixaria a fonte pronta para reintroduzir o mesmo termo no
próximo folder, post ou proposta, e nem o redator nem o agente teriam como saber.

"Plano de saúde" é produto regulado pela ANS. Chamar assim um serviço de telemedicina é
**erro factual publicado em nome do cliente**, não preferência de vocabulário.

### O que mudou

Corrigido em `site.diferenciais`, bloco `why` da `/sobre`, sub-serviço de facilities, os
**cinco campos** do post e o `llms.txt`.

A correção trouxe informação que faltava e que vende melhor: **o custo é integralmente da
Previx**, sem desconto ao colaborador e sem repasse ao cliente. Responde à objeção antes que
ela apareça. O post ganhou uma pergunta no FAQ deixando explícito que não é plano regulado
pela ANS.

Verificado em produção: `/`, `/sobre` e `/servicos/facilities` trazem apenas "plano
assistencial de saúde"; o post cita telemedicina 12 vezes e não tem nenhuma ocorrência solta
de "plano de saúde".

### Tempo verbal: decidido

O Dr. Ricardo disse "a Previx **está fechando** um plano assistencial de saúde", o que abria
dúvida sobre comunicar como vigente ou em contratação. **JG decidiu em 05/08/2026: fica como
vigente.** Nenhuma alteração de texto necessária. Débito encerrado.
