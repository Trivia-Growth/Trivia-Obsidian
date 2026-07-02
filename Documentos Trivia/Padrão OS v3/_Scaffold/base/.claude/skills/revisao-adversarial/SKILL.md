---
name: revisao-adversarial
description: Use antes de dar PASS numa feature/PR — revisão que ASSUME que o trabalho está errado e tenta quebrá-lo (edge cases, caminhos de erro, buracos na spec, concorrência, abuso), em vez de confirmar que está certo. Acha o que a revisão confirmatória não vê. Agentes: @qa (correção) + @security (superfície de ataque). Acione com /revisao-adversarial.
---

# Skill: Revisão adversarial (tente quebrar, não confirme)

A revisão confirmatória ("tem teste? gate verde?") sofre de **viés de confirmação** — você lê o
código esperando que funcione. Esta skill inverte a postura: **parta do princípio de que a feature
está quebrada e prove onde.** É a passada que "sempre acha erro". **Dono:** `@qa` conduz;
`@security` (Cipher) faz a parte de superfície de ataque. Rode-a **depois** dos gates verdes e
**antes** de emitir PASS — gate verde é pré-requisito, não substituto.

> **Não confunda com self-critique.** O `self-critique-checklist` é o **autor** revisando o próprio
> código (mesmos pontos cegos). Esta é uma passada **independente**, de outro papel. Ganho extra:
> rode como **subagente** (contexto isolado, `CLAUDE.md`) — menos viés ainda.

## Como conduzir (falsificação, não opinião)
Para **cada `AC` da spec** e cada caminho crítico, gere **hipóteses de falha concretas** — "com a
entrada X, o resultado deveria ser A mas será B" — e então **tente reproduzir cada uma**. Nada de
"pode ter problema": ou você reproduz (vira achado) ou descarta com motivo.

Percorra os vetores (marque "sem risco" no que não se aplica — não invente cerimônia):

1. **Valores de borda:** 0, vazio, nulo, negativo, máximo, string enorme, unicode/emoji, data no
   limite de fuso, número quebrado (centavos!), coleção com 1 e com N itens.
2. **Caminhos de erro e falha parcial:** e se o banco/serviço externo falhar **no meio**? escrita
   parcial? timeout? retry? a transação fecha? o estado fica consistente?
3. **Buraco/ambiguidade na spec:** existe uma entrada que o `AC` **não** especifica e o código
   **adivinhou**? Onde o código decidiu algo que a spec não mandou? (isso é `SPEC_DEVIATION`.)
4. **Concorrência e idempotência:** duplo submit, corrida entre dois usuários, retry de rede →
   efeito dobrado? (mutação monetária tem chave de idempotência? — `os-grade.md`.)
5. **Integridade e autorização de dado:** um papel consegue **ler/mutar o que não devia**? RLS tem
   GRANT (senão nem roda)? o teste de RLS testa por **efeito**, não só por erro? (`db/rls-test.md`.)
6. **Abuso / superfície de ataque** (→ `@security`): entrada maliciosa, bypass de authz, IDOR,
   injection, PII em log, secret vazando. "O que um atacante tentaria primeiro?"
7. **Suposições implícitas:** o que o código assume sobre input, ambiente, ordem, unicidade — que
   **não está garantido**? Liste cada suposição e ataque-a.

## Saída (gate)
- Uma lista de **achados verificados**: cada um com a entrada/estado que quebra, o resultado errado
  observado, e o `AC`/arquivo afetado. Achado que você **não** conseguiu reproduzir → registre como
  descartado (com o motivo), não como bug.
- **Veredito:** se houver ao menos um achado reproduzido → **FAIL** (volta ao `@dev` com os casos;
  vire cada um em teste antes de corrigir). Sem achado reproduzível após percorrer os vetores →
  **PASS adversarial**. Achado real de segurança sem correção → bloqueia (P0 em `SECURITY_DEBT.md`).
- Todo achado reproduzido **vira um teste de regressão** — o bug não pode voltar em silêncio.
