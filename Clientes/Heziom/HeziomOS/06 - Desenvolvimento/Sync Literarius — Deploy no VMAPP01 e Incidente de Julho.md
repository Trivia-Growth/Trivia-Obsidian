# Sync Literarius — Deploy no VMAPP01 e Incidente de Julho

> ✅ **Estado em 26/09/2026:** em produção com o **Épico 84** (pacote `c7bfbbb`). Depois de um **terceiro** incidente (23–25/09, o banco recusou tudo por 46 h e o vigia do servidor disse "ok"), o robô passou a **dizer como terminou** (código de saída 0/2/3), o vigia distingue **"não roda"** de **"roda mas falha"**, e uma falha geral aborta em segundos em vez de horas. Tudo provado no servidor com provas negativas. O estado de 30/07 (SYSTEM, binário rastreável, verificador semanal) continua valendo.

O robô que copia os dados do Literarius (ERP) para o HeziomOS parou várias vezes em julho de 2026 — a maior parada durou **11 dias** (13/07 a 24/07). Esta nota registra por que parava, o que foi feito e o que checar quando parar de novo.

---

## A causa raiz (achada 30/07)

O sync foi instalado **amarrado à conta pessoal do JG** (`VMAPP01\joao.novais`). A Intelinove concede acesso de administrador para instalar e **revoga depois** — e o sync morria toda vez que isso acontecia.

Três amarras, qualquer uma fatal:

| # | Amarra | O que acontece sem admin |
|---|---|---|
| 1 | **Direito de "logon como tarefa em lote"** | Na VMAPP01 esse direito é dado **só a grupos**. O JG só o tinha por estar em Administradores. Sem ele, o Windows **deixa de disparar a tarefa** |
| 2 | **Permissão do arquivo `.env`** | Restrito a SYSTEM + Administradores. Fora do grupo, o robô não lê a própria senha |
| 3 | **"Executar com privilégio máximo"** | Não há privilégio elevado para assumir |

**O modo de falha era o pior possível:** o Windows não *tentava e falhava* — ele simplesmente **parava de tentar**. Resultado: nenhum erro, nenhum registro de evento, zero linhas no log, e o painel de tarefas mostrando "último resultado: 0" (sucesso). Tudo parecia certo em qualquer indicador que se olhasse.

**E o vigia morria junto.** O watchdog criado em 24/07 tinha sido registrado com a **mesma conta** do serviço que ele vigiava — então caía pela mesma causa e nunca reergueu nada. Lição que vale para qualquer monitor: *um vigia precisa depender de coisas diferentes daquilo que ele vigia.*

---

## O que foi feito

1. **As 4 tarefas passaram a rodar como SYSTEM** (a conta de serviço do próprio Windows). SYSTEM não sai de grupo, não tem senha para expirar e já tem acesso ao `.env`.
2. **Três falhas silenciosas fechadas** — situações em que o sync morria mas reportava sucesso:
   - `.env` ilegível: o script seguia sem credencial e o erro ia para o log; como o watchdog só olha *a data* do log, ele via "vida". Sync morto com o vigia dizendo "ok".
   - Executável ausente: a tarefa saía com **código 0** e log vazio.
   - Heartbeat: erro de banco era engolido em silêncio, deixando o monitor cego.
3. **`MultipleInstances` = StopExisting.** Antes era `IgnoreNew`, em que **uma** execução travada bloqueia todos os disparos seguintes — para sempre. Era o que transformava um travamento pontual em parada eterna. Precisou ser aplicado editando o XML da tarefa: nem o comando do PowerShell nem a via alternativa conseguem gravar esse valor nesta máquina.
4. **Binário carimbado com o commit.** Cada rodada registra qual versão está rodando, no log e no banco.
5. **Aviso automático de binário velho** — verificador semanal no GitHub que compara o servidor com o código atual e abre um aviso se ficar mais de 7 dias para trás. **No ar e testado.**
6. **Token de alcance mínimo para esse verificador.** Ele nasceu usando a chave que abre o banco inteiro da plataforma para fazer uma única leitura; hoje usa um token que só enxerga a linha da versão. A chave ampla foi removida do CI.

### A prova

Teste A/B na mesma máquina, no mesmo dia: com o JG **sem** acesso de administrador e **sem conseguir abrir o arquivo de credenciais**, o sync continuou rodando normalmente — gravando títulos financeiros, notas fiscais e a foto diária de estoque. Era exatamente esse o estado que derrubava tudo antes.

---

## Setembro: o terceiro caso (23–25/09/2026)

Uma mudança no banco (HeziomOS, Story 81.2) apontou uma função que o PostgREST executa em **toda** requisição para um schema que o usuário do sync não alcança. Resultado: **toda chamada do sync recusada por 46 h** (código 42501). O conserto foi no banco (Story 81.11, 25/09 13:19 UTC) e o sync voltou 1 segundo depois — sem perder dados incrementais (a watermark religa de onde parou); só as fotos diárias de estoque de 24 e 25/09 se perderam.

**O que doeu não foi a parada, foi o servidor mentir durante ela:**

- o exe terminava cada rodada com `sync complete ✅` e código 0 — o desfecho era declarado sem olhar nada;
- o vigia do servidor via o log crescer (com erros) e escrevia "ok" 96 vezes por dia — media *escrita*, não *entrega*;
- uma rodada do fiscal durou **5 h 23 min** sob uma tarefa com limite de 10 min: o lote recusado degradava para linha a linha, ~300 mil requisições recusadas;
- duas rodadas gravaram ao mesmo tempo: a política "parar a instância anterior" **não sobrevive à reinstalação** (o XML aplicado em 30/07 tinha sido desfeito em 03/09).

O alerta que chegou a uma pessoa foi o do **banco** (e-mail "Sync do Literarius PAROU"), que funcionou. Ele continua sendo o único canal; o Épico 84 tirou a mentira do servidor e encurtou o diagnóstico de quem abre a máquina.

### O Épico 84 (25/09/2026) — o sync diz a verdade

| Camada | Antes | Agora |
|---|---|---|
| **Exe** | sempre `sync complete`, código 0 | código **0** tudo entregue · **3** parcial · **2** nenhum job entregou; `sync complete` só no 0; job que não consegue nem registrar o resultado conta como falha |
| **Falha geral** (permissão, token, schema) | degradava para linha a linha por horas | derruba a tabela na **primeira** requisição; toda chamada tem timeout; todo job (4 min) e rodada (8 min) têm teto |
| **Wrapper** | subia o código | grava `ultimo-sucesso-<tarefa>.txt` quando entregou (0 ou 3); impõe teto ao exe filho |
| **Vigia** | olhava a data do log | olha o marcador: **NÃO RODA** (log parado) → reergue; **RODA MAS FALHA** (log vivo, sem entrega) → **não** reergue, copia as 3 últimas linhas de erro |
| **Instalador** | política CIM que não persiste | grava `StopExisting` **pelo XML, relê e para com erro** se não pegou; sem retry automático na tarefa de 15 min |

**As provas no servidor acharam seis defeitos meus** que 83 testes automatizados não acharam — todos corrigidos no mesmo dia: o código de saída voltava vazio no PowerShell 5.1 (todo run virava 1), o vigia reerguia tarefas saudáveis (`continue` dentro de `switch`), o log ficou ilegível por mistura de codificações, e — o mais importante — com o banco morto, um job **sem nada a gravar** contava como sucesso e a rodada saía "parcial", invisível de novo. Lição: mudança em wrapper ou vigia só vale com **prova negativa no servidor real**.

### A nota 48181 (Story 65.39, fechada 26/09)

Depois que o sync voltou, o alarme do banco continuou armado por uma nota fiscal que "existia na fonte e nunca chegou ao espelho". Consultada na fonte: emitida sem gerar financeiro (fora do filtro), **cancelada 2 h 35 depois — e o cancelamento não move a data de alteração** que a janela de 1 h olha. A nota só passou a interessar quando a janela já tinha passado. Em 120 dias, 45 notas no mesmo padrão; 44 só chegaram porque as paradas releram meses; uma estava no espelho como **não cancelada** (receita fantasma). Conserto: nota com evento SEFAZ novo reentra na janela; reprocesso desde 20/08 trouxe tudo.

### O reconcile passou a consertar, não só contar (Story 65.40, 27/09)

Depois da 48181 e das 79 devoluções, ficou claro que "linha viva na fonte que nunca chegou ao espelho" é uma família de defeito que volta — e que a regra de runbook ("alargou o filtro, rode o reprocesso no mesmo dia") foi justamente o que falhou. Agora o reconcile, de hora em hora, **pede de volta à fonte** as linhas que faltam, pela mesma definição de tabela do sync, e grava na mesma passada (até 1.000 por hora). Só o que mesmo assim não vier vira alarme. Provado no servidor: uma devolução apagada do espelho voltou sozinha na passada seguinte, junto com outras seis linhas que ainda não tinham chegado. Reprocesso manual só para cargas grandes — e ele agora sobe os limites de tempo sozinho.

---

## Por que ninguém percebeu por 3 semanas

Uma correção importante (o heartbeat que não engolia mais erro) ficou **três semanas fora de produção** sem ninguém notar. O motivo é instrutivo:

- O deploy no VMAPP01 é **manual** — o pacote não se atualiza sozinho.
- Não havia como saber qual versão estava lá. O log dizia `version: 1.0.0`, fixo desde sempre e igual em todo build.
- E havia uma **crença errada anotada como fato**: "compilar para Windows demora mais de 1 hora". Ninguém tentou de novo por causa disso. Na verdade leva **4 segundos** — o que travava era o iCloud (o repositório fica no Desktop sincronizado, e o Deno escaneava a pasta `node_modules` nele).

Hoje o servidor **se anuncia**: publica a versão que está rodando, e um verificador semanal compara com o código atual e abre um aviso se ficar para trás mais de 7 dias.

---

## Quando parar de novo — o que fazer

**Primeiro passo, sempre** (roda **sem** precisar de admin, não altera nada):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\heziom-sync\diagnostico-permissao.ps1
```

Ele responde em 30 segundos se a causa é permissão, quem executa as tarefas, quando cada uma rodou, a idade dos **marcadores de último sucesso** e se os logs estão avançando. Se o veredito final disser **SAUDÁVEL**, o problema é outro — olhe os logs em `C:\heziom-sync\logs\`.

**Segundo passo: ler o vigia** (`C:\heziom-sync\logs\watchdog.log`, últimas linhas). Ele escreve um de quatro estados por tarefa:

| Ele diz | Significa | O que fazer |
|---|---|---|
| `ok -- ultimo sucesso ha N min` | entregando | nada |
| `ok (parcial, exit 3)` | entregou em parte (uma linha ou tabela ficou fora) | ver `[WARN]` no log; não é parada |
| **`NAO RODA`** | a tarefa não dispara (agendador, permissão, `.env`, programa) | o vigia reergue sozinho; se persistir, diagnóstico e `fatal.log` |
| **`RODA MAS FALHA`** | dispara e o banco recusa (token, permissão, schema) | **não reiniciar** — a causa está nas 3 linhas de erro que ele copia; 42501 → RB-13 §2 no heziomos |

No Agendador de Tarefas, a coluna "Resultado da última execução" agora fala: **0** completo · **3** parcial · **2** nenhum job entregou · **78** `.env` ilegível · **127** programa ausente · **124** passou do tempo.

Depois de uma parada **longa** (dias), rode uma vez à mão com teto maior: `$env:SYNC_TETO_JOB_MIN=30; & C:\heziom-sync\run-sync.ps1`.

### Ferramentas no servidor (`C:\heziom-sync`)

| Arquivo | Para quê | Precisa admin? |
|---|---|---|
| `diagnostico-permissao.ps1` | Diagnóstico — **use primeiro** | Não |
| `migrar-tasks-para-system.ps1` | Se alguém reinstalar amarrado a uma conta pessoal | Sim |
| `corrigir-multipleinstances.ps1` | Se a política voltar para `IgnoreNew` | Sim |
| `proteger-e-testar.ps1` | Protege o `.env` e testa | Sim |
| `consultar-nf.ps1 -Id N` | Lê uma nota fiscal na fonte e diz se passa no filtro do sync (foi o que provou a 65.39) | Sim |
| `run-sync.ps1 -Job fiscal -Since 2026-08-20` | Reprocessa um job a partir de uma data (quando um conserto precisa buscar linhas antigas) | Sim |

---

## Atualizar o binário

Só é necessário quando muda **o que o robô lê do ERP** — tabela ou campo novo, mudança de schema no Literarius, correção de lógica. Trocar senha, ajustar horário das tarefas ou mexer no banco **não** exige binário novo.

1. No Mac: `bash deploy/windows/pacote/build-sem-segredos.sh` (~4s, gera o zip)
2. Copiar para o servidor e extrair
3. PowerShell **como Administrador**: `Get-ChildItem *.ps1 | Unblock-File` e depois `.\instalar.ps1`

O instalador preserva o `.env` e os logs, para as tarefas antes de trocar o programa, e **força uma execução para provar que a versão nova roda** — só diz "ATUALIZADO" se o log andar.

> ⚠️ Arquivos copiados de outra máquina chegam **bloqueados** pelo Windows e o PowerShell recusa executá-los. Daí o `Unblock-File`.
>
> ⚠️ **Onde colar (25/09/2026, custou 40 min):** a **pasta inteira** na **Área de Trabalho do servidor** (que na VMAPP01 fica no OneDrive) e rodar o `instalar.ps1` de lá. Colar os arquivos direto em `C:\heziom-sync` dá "acesso negado" nos existentes — só arquivos novos entram, o que faz parecer que trocou — e o programa em uso pela tarefa não é substituído. Só o instalador (como Administrador) para as tarefas, troca tudo e prova o run novo.

---

## Armadilhas registradas (custaram tempo)

- **Conferir com uma ferramenta cega ao valor esperado não é conferir.** Aconteceu duas vezes no mesmo dia: um script reprovou uma migração bem-sucedida porque procurava `SYSTEM` num Windows em português que responde `SISTEMA`; outro declarou falha porque o comando do PowerShell não sabe representar `StopExisting` e devolvia vazio. Nos dois casos o veredito falso mandaria **desfazer o que funcionou**.
- **Ausência de erro não é prova de saúde.** Quando o Windows deixa de armar o gatilho, não há erro para registrar — porque não houve tentativa.
- **Nunca apagar e recriar tarefas agendadas.** Se o script morrer no meio, o servidor fica sem automação nenhuma — e o watchdog não se recria sozinho. Usar substituição atômica.
- **"Compilar demora 1 hora" era falso** e custou 3 semanas de binário desatualizado. Leva 4 segundos. O que travava era o iCloud (o repositório fica no Desktop sincronizado). Crença errada anotada como fato vira decisão errada repetida — vale desconfiar de "não adianta tentar, isso demora".
- **Chave de API restrita não passa no `apikey` do Supabase.** O gateway valida esse cabeçalho contra as chaves oficiais e recusa qualquer token customizado. O token restrito vai no `Authorization`; o `apikey` leva a chave pública. Isso já estava escrito no código do projeto desde 06/07 e mesmo assim foi repetido.

---

- **Teste unitário não substitui prova no servidor.** Os 83 testes estavam verdes e o servidor achou seis defeitos em duas horas — comportamento do PowerShell 5.1, codificação de arquivo, e uma regra de negócio ("job sem linhas é sucesso?") que só a falha real expôs. Prova negativa (`.env` renomeado; chave inválida) é obrigatória para wrapper e vigia.
- **O cancelamento da nota fiscal não move a data de alteração.** Qualquer filtro incremental por "data de alteração" perde o que muda por outro caminho (evento SEFAZ). Mesma família da baixa a pagar de agosto (65.30).
- **Linha longa colada na RDP chega cortada** e o PowerShell recusa a linha inteira sem rodar nada — o erro parece de parâmetro. Colar de novo.

## O que ainda é frágil

O deploy continua **manual**, num servidor de terceiro, com um executável copiado à mão — em 25/09 foram **quatro** reinstalações numa noite para fechar os defeitos achados pelas provas. O que mudou é que agora existe **aviso** quando ele fica para trás — antes, a descoberta dependia de alguém desconfiar. É mitigação, não solução: a solução seria automatizar o deploy.

Duas dívidas conscientes, ambas pela mesma razão (este repositório não é dono das migrations do banco):

1. A versão do binário é publicada num campo de texto reaproveitado (`job_name` do heartbeat). O certo seria uma coluna própria.
2. A permissão de leitura do verificador (role + policy) foi criada **à mão** no banco. Se alguém rodar um `db reset` a partir do monorepo, ela some e o verificador passa a falhar — em silêncio, justamente o defeito que ele existe para evitar. A receita está versionada no repositório e precisa virar migration no `heziomos`.

---

**Repositório:** `Org-Heziom/literarius-sync` · PR #4 (30/07/2026) · PRs #15–#27 (25–27/09/2026, Épico 84, Stories 65.39 e 65.40)
**Épico:** `heziomos/docs/epics/epic-84-sync-fala-a-verdade.md` · **Runbook:** RB-13 (`docs/runbooks/literarius-sync-pacote.md`), seção "Sync parado: o que fazer"
**Relacionado:** [[Réplica Supabase — Schema e Estratégia de Sync]] · [[Supabase — Configuração e Migrations]] · [[ADR-002 — Segurança do Sync Agent]]
