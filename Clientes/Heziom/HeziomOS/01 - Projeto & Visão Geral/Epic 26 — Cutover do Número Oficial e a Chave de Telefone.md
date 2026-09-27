---
tipo: estado
status: vivo
data: 2026-07-24
fonte_de_verdade: docs/HANDOFF-2026-07-24-pos-cutover.md no repo heziomos
pr: https://github.com/Org-Heziom/heziomos/pull/452
---

# Epic 26 — Cutover do Número Oficial e a Chave de Telefone

> Fonte viva: `docs/HANDOFF-2026-07-24-pos-cutover.md` e `docs/stories/BACKLOG.md` no repo. Esta nota é o resumo executivo.

## Onde estamos

O **+55 11 94498-6855**, número de atendimento da Heziom, saiu da Unnichat em 23/07 e opera no HeziomOS. Unnichat e Gupshup foram revogados como parceiros na Meta.

Em **24/07** todos os problemas que apareceram quando a triagem passou a ser nossa **foram resolvidos e estão em produção**. O atendimento funciona de ponta a ponta: o cliente recebe o menu uma vez, escolhe a opção e **ganha um atendente na hora**, da área certa. E a base de contatos foi saneada: telefones corrigidos, conversas religadas e cadastros repetidos removidos.

---

## Problema 1 (resolvido): o menu se repetia a cada mensagem

Era o mais visível — o cliente mandava qualquer coisa e recebia "Bem-vindo + Menu" de novo, em loop.

**Por que acontecia:** o sistema tinha uma trava para não inscrever a mesma pessoa duas vezes no fluxo, mas essa trava só valia enquanto o fluxo estava "em andamento". Como a mensagem de boas-vindas e o menu são enviados em poucos segundos, o fluxo já estava "concluído" quando a próxima mensagem chegava — e a trava não pegava. Foi um efeito colateral de tirarmos a espera de 15 minutos no dia anterior: antes, o fluxo ficava parado esperando e a trava funcionava.

**Como ficou:** um cliente recebe o menu **uma vez por conversa**. Conversa nova (outro atendimento) reabre normalmente.

**Confirmado com cliente real:** uma pessoa mandou 5 mensagens seguidas e recebeu **um único** menu.

## Problema 2 (resolvido): o clique no menu não chamava atendente

O cliente escolhia "Atacado" ou "SAC" e a conversa ficava sem dono até alguém abrir a tela e apertar "Distribuir".

**Por que acontecia:** eram seis travas em série — o fluxo só anotava a área pedida, quem distribuiria era outra parte do sistema que só roda sob demanda (sem automação), exige permissão de gestor, e ainda dependia de uma regra de distribuição que estava **desligada**.

**Decisão tomada:** em vez de atribuir a uma pessoa fixa por opção (que não equilibra carga e, pelos dados, não funcionaria na maioria das opções), o próprio fluxo agora distribui **respeitando a área pedida e a carga de cada atendente** — é o desenho que já havia sido construído na Story 26.8, agora com o disparo automático.

**Confirmado com cliente real:** 5 atribuições automáticas entre 17:07 e 19:32, **todas** para um atendente da área correta. O sistema está mandando tudo para quem tem menos conversa aberta (32) em vez de quem tem mais (139) — está corrigindo um desequilíbrio antigo de quase 4 vezes.

## Problema 3 (resolvido): o CRM não reconhecia clientes que já tinha

Este era o achado grande, e explicava as **608 conversas de WhatsApp sem cliente vinculado**.

O sistema identifica uma pessoa pelo telefone. Os contatos importados do Flowbiz estavam gravados **sem o código do país** (`11998809405`) e o WhatsApp entrega **com** (`5511998809405`). Para o sistema, duas pessoas diferentes. O cliente mandava mensagem, o CRM não o encontrava, a conversa nascia sem dono e a automação desistia em silêncio.

**O que foi feito:**

| Ação | Resultado |
|---|---|
| Corrigir o telefone dos contatos | **26.731 contatos** ganharam o código do país |
| Recuperar conversas sem dono | **189 conversas** foram ligadas ao cliente certo |
| Fechar a porta de entrada | Contato novo (formulário, importação, WhatsApp, cadastro manual) já nasce com o código do país |

**Os cuidados que foram tomados** (o motivo de isso não ter sido um "script simples"):

1. **Telefones de mentira ficaram intocados** — 5.246 registros do tipo `99999999999`. Corrigi-los teria criado telefones do Maranhão (DDD 99 existe) e misturado históricos de gente sem relação.
2. **Números estrangeiros ficaram intocados** — 1.266 com código de área que não existe no Brasil.
3. **899 casos suspeitos foram separados** — telefones onde a correção faria dois cadastros virarem "a mesma pessoa". Ficaram de fora da correção em massa e foram tratados depois, um a um (ver "Limpeza dos cadastros repetidos").
4. **Tudo é reversível** — o valor anterior de cada telefone foi guardado antes da mudança.
5. **A revisão de segurança reprovou a primeira versão** e evitou um vazamento: as tabelas de apoio nasceriam **legíveis publicamente** (26.731 telefones acessíveis sem login, por um detalhe de configuração do banco). Foi corrigido antes de qualquer alteração.

## Problema 4 (resolvido): cadastros repetidos da mesma pessoa

Os 899 casos separados acima eram telefones com dois ou mais cadastros. **A descoberta principal: não era tudo duplicata.** Foi preciso separar, com critérios cada vez mais rigorosos, quem era a mesma pessoa de quem apenas divide um telefone.

**Resultado: 212 cadastros repetidos removidos**, em 6 rodadas. Nenhum dado perdido — compras, conversas e histórico foram transferidos para o cadastro que ficou, e cada remoção tem cópia de segurança para desfazer.

**Como a identidade foi confirmada** (em ordem de força):

| sinal | o que significa |
|---|---|
| Nome completo idêntico | `Renata` e `RENATA MACEDO TORRES` no mesmo telefone = mesma pessoa |
| CPF **não contraditório** | a base não permite dois cadastros com o mesmo CPF, então o sinal útil é "no máximo um dos lados tem CPF" |
| E-mail pessoal igual | mesmo endereço antes do @, com erro de digitação só no final |

**E o CPF foi decisivo para NÃO juntar:** onde os dois cadastros tinham CPFs diferentes e válidos, são pessoas diferentes — confirmado testando o dígito verificador de todos (nenhum inválido, ou seja, não eram erros de digitação). Isso evitou juntar, por exemplo, `MANOEL` e `MANOEL CAMILO DA SILVA JUNIOR`: pai e filho.

**De quebra, corrigimos e-mails errados.** Em 15 casos o endereço tinha erro de digitação no provedor — `gmail.con`, `gamil.com`, `hotmaul.com`, `iclood.com`, `yahoo.com.bt`. Como o cadastro repetido tinha o endereço certo, o e-mail foi corrigido no processo. Critério: o provedor certo é o que aparece milhares de vezes na base; o errado, duas ou três.

## Como sabemos que fechou

- Das conversas de WhatsApp criadas em 24/07, **33 de 33** nasceram com o cliente vinculado. Antes, nasciam órfãs.
- **Nenhum** contato criado no dia nasceu com telefone sem código do país.
- Sobraram 2.165 contatos sem código do país — que é **exatamente** a soma dos que decidimos não tocar (1.266 estrangeiros + 899 suspeitos). Ou seja, corrigimos 100% do que era seguro corrigir.

---

## O que fica registrado no repo

| Story | O que é | Estado |
|---|---|---|
| 6.39 | Texto da triagem alinhado entre código e produção | ✅ Em produção |
| 6.42 | Menu se repetia a cada mensagem | ✅ Em produção |
| 26.9 | Atribuir atendente na hora, por área e carga | ✅ Em produção |
| 6.41 | Busca de contato falhava quando havia telefone duplicado | ✅ Em produção |
| 6.40 | Corrigir a chave de telefone dos contatos | ✅ Executada (26.731) |
| 6.38 | Recuperar conversas sem dono | ✅ Executada (189) |
| — | Limpeza de cadastros repetidos (6 rodadas) | ✅ Executada (212 removidos) |

Também há uma auditoria com 41 apontamentos sobre telefone no sistema (`docs/auditoria/2026-07-24-normalizacao-telefone.md`). **Atenção ao ler:** ela foi mapeada mas não conferida — a checagem parou por limite de gasto da conta. Três pontos foram conferidos à mão depois, e **um deles caiu**. Nada dali deve virar tarefa sem antes abrir o código e confirmar.

## O que continua aberto

### 1. Os 189 telefones que ficaram (decisão de parar)

Restam 189 telefones com mais de um cadastro, e a decisão foi **deixar como estão** — não por falta de trabalho, mas porque os dados não permitem decidir:

- **85** têm CPFs diferentes e válidos: são pessoas diferentes, ponto.
- **11** são igreja + pessoa (o cliente e seu representante) — juntar apagaria a distinção entre empresa e pessoa física, que é informação de negócio.
- **60** têm só o primeiro nome de um lado, sem e-mail que confirme. Exemplo do risco: `Tatiane` e `TATIANE GOMES SOUSA`, com e-mail de uma **Talita** Gomes Sousa — provavelmente irmãs.
- **~33** são telefones de casa ou de empresa usados por várias pessoas.

Só ligar para o cliente resolveria, e o impacto de manter é baixo: o sistema sempre escolhe o cadastro mais antigo, de forma previsível. **Não é pendência técnica, é escolha consciente.**

### 2. Outros
- **419 conversas antigas** sem cliente na base — JG optou por não criar cadastros novos agora. Não afeta atendimento novo.
- **Cancelar a assinatura da Unnichat** depois de um período de estabilidade (decisão de negócio).

## Referência do número

| Item | Valor |
|---|---|
| Número oficial | +55 11 94498-6855 |
| Phone Number ID | `762698843599806` |
| WABA | `1140360874094314` |
| Número de Campanhas (teste) | +55 11 93329-5843 |
