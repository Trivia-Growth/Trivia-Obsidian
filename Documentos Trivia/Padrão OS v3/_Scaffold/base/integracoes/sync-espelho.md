# Integrações de sincronização — espelho / ETL contínuo

> **Escopo:** qualquer processo que replica dados de um sistema fonte (ERP, e-commerce, CRM,
> planilha) para um espelho lido por BI/produto — worker externo, cron, edge function. Se o
> projeto tem um "sync", este documento é norma e o checklist do fim entra no DoD.
>
> **Origem:** revisão adversarial do `literarius-sync` (2026-07-04) — sync em produção há semanas,
> dashboards "funcionando", e **6 defeitos críticos silenciosos**: janela incremental sem memória,
> fuso horário podendo zerar o incremental, cancelamentos que nunca propagavam, colunas de contrato
> gravadas como constantes, conciliação inoperante por design e zero alerta com o agente morto.
> Nenhum era visível por inspeção nem pelo log (tudo `success`). Cada regra abaixo existe porque
> uma violação real dela corrompeu dado de produção.

## As 12 regras

### 1. Watermark durável — nunca janela deslizante de relógio
O "de onde continuar" é **estado persistido** (ex.: tabela `sync_watermarks` no destino com
`max(updated_at)` processado por tabela), não `agora − lookback`. Ler a partir de
`watermark − overlap` (overlap ≥ 1 ciclo). Watermark ausente = bootstrap (regra 7).
**Por quê:** janela de 1h + servidor parado 4h = tudo do intervalo perdido para sempre, com log
de sucesso. **O relógio é o da FONTE** (`SELECT GETDATE()`/`now()` no banco de origem), nunca o
da máquina do agente — elimina skew e fuso de uma vez.

### 2. Fuso horário provado por teste, não por fé
Todo driver serializa data de um jeito (`useUTC` do mssql, timezone da sessão no Postgres/MySQL).
Antes do primeiro deploy — e como smoke test permanente — **alterar 1 registro na fonte e vê-lo
chegar ao espelho no ciclo seguinte**. Comparar também o VALOR gravado (deslocamento de 3h
bucketiza o dia errado no BI).
**Por quê:** parâmetro de corte serializado em UTC contra coluna em hora local deixa a janela
incremental **no futuro** → zero linhas por ciclo, status `success`, ninguém percebe.

### 3. Estado destrutivo propaga: cancelamento, estorno e DELETE
- Transição de estado (cancelada, estornado, inativo) **não pode sair do WHERE** — filtro
  `WHERE cancelada = 0` congela o registro espelhado no último estado válido para sempre. Traga a
  linha e deixe a coluna refletir o estado.
- DELETE físico na fonte exige **reconciliação periódica de PKs** (job noturno compara conjuntos
  e marca `deleted_at` nos órfãos do espelho). Upsert-only degrada monotonicamente: padrão
  delete+reinsert (comum em rateios/itens) **dobra valores** no BI.
- Consumidores filtram `deleted_at IS NULL` — e alguém **escreve** `deleted_at` (coluna filtrada
  que ninguém preenche é contrato falso).

### 4. Nenhuma coluna de contrato gravada como constante
`campo: null` / `campo: false` fixo no mapper é proibido. Se a fonte não fornece o dado, **não
crie a coluna** — coluna existente é promessa que o consumidor vai ler. O caso real: 4 colunas de
título financeiro hardcoded → o DRE por competência do consumidor filtrava por uma delas e
retornava **sempre vazio**, e títulos cancelados inflavam contas a pagar/receber.
Regra prática: `grep` por `: null,` e `: false,` nos mappers na revisão — cada um precisa de
justificativa ou de remoção da coluna.

### 5. Upsert em lote com dead-letter — 1 linha ruim não derruba a tabela
Lote (PostgREST/bulk insert) é tudo-ou-nada. No fracasso do lote: **fallback linha a linha**,
gravar as rejeitadas em dead-letter (`sync_rejects` com payload + erro) e **seguir o run**.
Classificar erros: constraint/tamanho/tipo são **permanentes** (não retenta — vai para dead-letter);
rede/timeout/5xx são transitórios (retry com backoff + jitter). Retentar constraint 3× e abortar o
loop no meio deixa o espelho incoerente (cabeçalhos sem itens).

### 6. Watchdog FORA do agente (dead man's switch)
Alerta disparado de dentro do processo **não cobre o processo morto** — que é o modo de falha mais
comum (task do agendador quebrada, máquina desligada, credencial expirada). Norma:
- Agente grava **heartbeat no destino** a cada run.
- **No destino** (pg_cron/scheduled function), um watchdog checa `max(heartbeat)` e alerta
  (Teams/e-mail) se passar do limiar (ex.: 2h). O alarme mora onde o defunto não mora.
- Validar o agendador do SO **pós-reboot** (no Windows Task Scheduler: `-LogonType S4U` ou conta
  de serviço — task registrada com token interativo só volta quando alguém loga por RDP).
- Alertar também **"0 linhas processadas por N ciclos"** quando o volume esperado é > 0 — sucesso
  vazio repetido é sintoma (ver regra 2), não saúde.

### 7. Bootstrap e paginação são caminho de primeira classe
Primeira carga (espelho vazio ou watermark ausente) é um modo suportado: paginação por cursor de
PK (`WHERE pk > @cursor ORDER BY pk LIMIT n`), upsert por página, timeout dimensionado. "Setar
lookback de 1 ano" não é bootstrap, é gambiarra que estoura timeout e memória — e depois vira
perda de dados pela regra 1.

### 8. Prefira as views do dono da fonte a refazer JOINs
Se o sistema fonte mantém views prontas (ERPs costumam ter dezenas), **sincronize a partir delas**:
o dono da fonte mantém o JOIN quando o schema interno muda, e as colunas derivadas vêm de graça.
Refazer JOIN manual em tabela bruta foi exatamente o que deixou 4 colunas sem fonte (regra 4) e
trouxe 5× menos movimentos bancários que a view equivalente.

### 9. O schema do espelho tem UM dono
As migrations do espelho vivem no **repo consumidor** (é ele quem lê); o produtor referencia, não
cria. Dois repos criando tabela = drift garantido (`int` × `bigint` na mesma FK, `timestamp` ×
`timestamptz` misturados descartando fuso). **Smoke test obrigatório:** upsert de 1 linha por
tabela com a chave `onConflict` declarada — chave que não bate com a UNIQUE real falha **toda**
execução daquela tabela, para sempre.

### 10. Leitura consistente na fonte
Sem `WITH (NOLOCK)` / read-uncommitted em dado financeiro ou fiscal: dirty read de transação que
sofre rollback entra no espelho e (sem a regra 3) fica para sempre; scans sob page split pulam ou
duplicam linhas. Se houver bloqueio real na fonte, a resposta é `READ_COMMITTED_SNAPSHOT` (pedir
ao DBA da fonte), não sujar a leitura.

### 11. Mappers reais testados
O teste **importa o mapper de produção**. Reimplementar o mapper no arquivo de teste ("cópia para
testar") é teatro: o caso real tinha teste verde validando campos que nem existiam na query real,
enquanto a produção gravava constantes (regra 4). Exportar os mappers; testar borda (data mágica
`1899-12-30` → null, string vazia → null, dinheiro sem float quando a soma importa).

### 12. `sync_log` honesto
Por run e por tabela: linhas lidas / upsertadas / rejeitadas, duração, erro com nome da tabela.
`status = partial` se **qualquer** tabela falhou (não "menos de 3 erros"). Registro de log é
gravado nos dois caminhos (sucesso e catch). Config morta é proibida: variável de ambiente
documentada que nenhum código lê (`ALERT_AFTER_FAILURES`, `BOOTSTRAP_DAYS`) é promessa falsa —
implementar ou apagar.

## Checklist DoD (copiar para o PR de qualquer feature de sync)

- [ ] Watermark persistido por tabela, relógio da fonte, overlap ≥ 1 ciclo (§1)
- [ ] Smoke test de fuso: registro alterado na fonte chega com valor certo no ciclo seguinte (§2)
- [ ] Cancelamento/estorno refletem no espelho; reconciliação de DELETE agendada; `deleted_at`
      escrito e filtrado (§3)
- [ ] Nenhum `: null`/`: false` fixo em coluna de contrato nos mappers (§4)
- [ ] Fracasso de lote → linha a linha → dead-letter; erros permanentes não retentam (§5)
- [ ] Watchdog no DESTINO alertando sync parado + agendador validado pós-reboot (§6)
- [ ] Bootstrap paginado documentado e testado (§7)
- [ ] Fonte = views do dono quando existirem; JOIN manual justificado em ADR (§8)
- [ ] Migrations do espelho só no repo consumidor; smoke de `onConflict` por tabela (§9)
- [ ] Sem NOLOCK/read-uncommitted em dado financeiro (§10)
- [ ] Testes importam os mappers reais (§11)
- [ ] `sync_log` por tabela + sem config morta (§12)
