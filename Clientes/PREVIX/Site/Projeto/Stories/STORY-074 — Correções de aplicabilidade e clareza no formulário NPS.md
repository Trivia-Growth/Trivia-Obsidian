---
id: STORY-074
titulo: "Correções de aplicabilidade e clareza no formulário NPS"
fase: 6
modulo: "NPS"
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-09-10
atualizado: 2026-09-10
---

# STORY-074 — Correções de aplicabilidade e clareza no formulário NPS

## Contexto

O time da Previx identificou respostas que reduzem artificialmente os indicadores das pesquisas de satisfação. Alguns contratos não incluem todos os serviços avaliados — por exemplo, um contrato pode ter limpeza, mas não portaria — e hoje o cliente é obrigado a dar uma nota mesmo quando a pergunta não se aplica.

Também existe ambiguidade entre as responsabilidades de **Recursos Humanos** e **Recrutamento e Seleção**. A pergunta atual atribui a captação de colaboradores ao RH, levando o respondente a avaliar o departamento errado. Para a Previx, RH cuida de rotinas administrativas, como documentação e holerites; Recrutamento e Seleção cuida do recrutamento, seleção e alocação dos colaboradores nos postos.

Por fim, as estrelas não selecionadas têm baixo contraste. O cliente pediu que elas sejam visualmente vermelhas, enquanto a pontuação escolhida permaneça amarela.

## Objetivo

Permitir que o respondente indique explicitamente quando um serviço não faz parte do contrato, impedir que essa escolha seja tratada como nota negativa e tornar mais clara a avaliação dos departamentos de RH e Recrutamento e Seleção.

## Escopo funcional

### 1. Estado visual das estrelas

- Estrelas ainda não selecionadas devem usar vermelho com contraste suficiente sobre o fundo branco.
- Ao selecionar uma nota, as estrelas que compõem a pontuação devem ficar amarelas.
- As estrelas restantes devem continuar vermelhas, deixando visualmente clara a diferença entre a nota atribuída e o restante da escala.
- Estados de hover, foco e seleção devem continuar perceptíveis no desktop e no celular.
- Cor não pode ser o único meio de identificar a escolha: o controle deve manter rótulo acessível e estado de seleção compreensível para tecnologia assistiva.

### 2. Opção “Não se aplica”

- Toda pergunta do tipo avaliação por estrelas (`escala_3`, nome legado da escala de 1 a 5) deve oferecer a opção **“Não se aplica”**.
- Escolher “Não se aplica” deve contar como pergunta respondida e permitir o envio do formulário.
- A escolha deve ser mutuamente exclusiva com a nota em estrelas: selecionar uma nota desmarca “Não se aplica”, e selecionar “Não se aplica” limpa a nota.
- O valor persistido deve ser canônico e explícito: `nao_se_aplica`.
- A Edge Function `submit-nps` deve aceitar o novo valor somente para perguntas do tipo `escala_3` e continuar rejeitando valores inválidos.

### 3. Indicadores e relatórios

- Respostas `nao_se_aplica` não entram em médias de estrelas, percentuais por faixa, distribuição por pergunta ou análises automáticas de consistência.
- O NPS oficial de 0 a 10 permanece inalterado.
- Quando todas as avaliações por estrelas de uma resposta forem “Não se aplica”, a interface deve mostrar média não disponível, sem converter o resultado para zero.
- Painel administrativo, detalhe da resposta, e-mail de notificação e exportações CSV/XLSX devem exibir o rótulo legível **“Não se aplica”**.
- Exportações e relatórios devem preservar a distinção entre ausência de resposta e “Não se aplica”.

### 4. Separação entre RH e Recrutamento e Seleção

O template padrão SGQ deve substituir a pergunta ambígua atual por duas avaliações independentes:

1. **RH** — “Como você avalia o atendimento do departamento de Recursos Humanos em assuntos administrativos, como documentação e holerites?”
2. **Recrutamento e Seleção** — “Como você avalia o recrutamento, a seleção e a alocação dos colaboradores no posto de serviço?”

As áreas exibidas no formulário devem ser, respectivamente, `RH` e `Recrutamento e Seleção`.

### 5. Pesquisas existentes

- Uma migration deve atualizar pesquisas existentes que ainda contenham exatamente a pergunta padrão antiga sobre “captação de colaboradores conduzida pelo Departamento de Recursos Humanos”.
- A migration deve substituir essa pergunta pela pergunta correta de RH e inserir a nova pergunta de Recrutamento e Seleção logo depois.
- Perguntas personalizadas ou já editadas manualmente não devem ser sobrescritas.
- A migration deve ser idempotente e não pode inserir a pergunta de Recrutamento e Seleção duas vezes.
- Respostas históricas devem permanecer intactas. A nova regra de cálculo deve continuar interpretando corretamente todas as respostas anteriores.

## Fora do escopo

- Alterar a fórmula oficial do NPS.
- Tornar perguntas individuais opcionais sem uma escolha explícita do respondente.
- Criar configuração de serviços por contrato ou esconder perguntas automaticamente.
- Reestruturar o modelo de dados das pesquisas além do novo valor `nao_se_aplica` no JSON de respostas.
- Redesenhar outras áreas do site ou do painel administrativo.

## Critérios de aceite

- [x] CA1 — Estrelas não pontuadas aparecem em vermelho e estrelas pontuadas aparecem em amarelo, inclusive após mudar a nota.
- [x] CA2 — Todas as perguntas de estrelas exibem a opção “Não se aplica”.
- [x] CA3 — “Não se aplica” e nota em estrelas são mutuamente exclusivas e o progresso do formulário é atualizado corretamente.
- [x] CA4 — O formulário pode ser enviado com `nao_se_aplica` e a Edge Function rejeita esse valor em tipos de pergunta incompatíveis.
- [x] CA5 — “Não se aplica” é ignorado em médias, distribuições e análises, sem ser convertido em zero ou uma estrela.
- [x] CA6 — Painel, detalhe, e-mail, CSV e XLSX mostram “Não se aplica” de forma legível e distinta de campo vazio.
- [x] CA7 — O template SGQ contém perguntas separadas para RH e Recrutamento e Seleção, com responsabilidades explicitadas.
- [x] CA8 — Pesquisas existentes com a pergunta padrão antiga são atualizadas por migration idempotente, sem alterar perguntas customizadas nem respostas históricas.
- [x] CA9 — O formulário continua utilizável em telas móveis e por teclado.
- [ ] CA10 — `npm run typecheck` e `npm run build` passam sem regressões.

## Resultado da implementação — 10/09/2026

- Commit integrado à `main`: `b8e0736`.
- Migration aplicada e Edge Function `submit-nps` publicada no Supabase.
- Build, validação de schema e lint de conteúdo passaram.
- E2E seguro confirmou a função publicada sem inserir resposta nem disparar e-mail; entradas inválidas retornaram HTTP 400.
- Teste manual confirmou 11 perguntas, progresso completo e exclusividade entre estrelas e “Não se aplica”.
- Validação pós-deploy confirmou a nova interface em produção.
- Análise adversarial identificou o risco de reinterpretar a antiga `q5` como RH. A correção foi feita em tempo de leitura, preservando o JSON histórico e exibindo a nota antiga sob Recrutamento e Seleção.
- CA10 permanece parcialmente aberta: o build passou, mas o `typecheck` global continua com 143 erros preexistentes de configuração Node/Deno e tipagens legadas, sem regressão nova atribuída a esta story.

## Arquivos previstos

- `src/pages/pesquisa/[slug].astro`
- `src/admin/pages/nps/NpsEditorPage.tsx`
- `src/admin/pages/nps/NpsRespostasPage.tsx`
- `supabase/functions/submit-nps/index.ts`
- `supabase/migrations/<timestamp>_nps_nao_se_aplica_e_separacao_rh_rs.sql`

## Diff Plan

1. Atualizar o template SGQ e criar migration segura para pesquisas existentes.
2. Implementar “Não se aplica” e o novo estado visual das estrelas no formulário público.
3. Atualizar validação e persistência na Edge Function.
4. Adequar métricas, análises, detalhe, notificações e exportações.
5. Validar typecheck, build e os fluxos com nota, “Não se aplica” e respostas históricas.
