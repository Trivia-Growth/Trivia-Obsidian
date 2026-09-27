---
id: STORY-059
titulo: "Mensagem do lead não aparece no painel"
fase: 6
modulo: "Admin · Leads"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: null
tipo: bug
---

# STORY-059 — Mensagem do lead não aparece no painel

> Achado na análise adversarial de 05/08/2026. A STORY-050 ensinou o chat a gravar
> telefone e a **transcrição inteira da conversa**. O painel não mostra nada disso.

## Contexto / Diagnóstico (código real)

`src/features/admin/LeadsPanel.tsx` declara o campo na interface…

```ts
interface Lead { …; mensagem: string | null; … }
```

…e **nunca o renderiza**. As colunas da tabela são: Recebido · Nome/Empresa · Contato ·
Motivo · Origem · Aviso por e-mail · Status. Não há detalhe, modal, expansão nem tooltip.

O dado está gravado e é inalcançável pela interface. Quem for dar retorno ao lead
continua sem saber o que a pessoa pediu — que é **exatamente a dor que originou a
STORY-050**.

### Por que passou

A STORY-050 mexeu no widget (produtor do dado) e validou olhando o **banco**. Ninguém
verificou o consumidor. Entregar o dado sem entregar a leitura é meio caminho: o esforço
aparece no schema, não para quem usa.

## Escopo

### ✅ Inclui

1. A mensagem passa a ser legível no painel de leads.
2. Precisa acomodar bem os dois formatos que existem hoje:
   - texto curto do formulário `/contato`;
   - **transcrição multi-linha** do chat (`--- Conversa no chat ---`, até 1900 chars).
3. Preservar quebras de linha — transcrição em parágrafo único é ilegível.
4. Deixar visível na listagem **quais leads têm mensagem**, sem precisar abrir um a um.
5. Escapar por renderização React (nunca `dangerouslySetInnerHTML`): o campo carrega
   texto livre de terceiros. Confirmado na análise adversarial que o banco guarda o HTML
   cru enviado pelo usuário.

### ❌ NÃO inclui

- Busca por conteúdo da mensagem.
- Edição da mensagem pelo painel (é registro do que o lead escreveu).
- Exportação (a planilha de 05/08 foi gerada por consulta direta).

## Critérios de Aceite

- [x] CA1 — É possível ler a mensagem completa de um lead pelo painel.
- [x] CA2 — A transcrição do chat aparece com as quebras de linha preservadas.
- [x] CA3 — Dá para saber quais leads têm mensagem sem abrir cada um.
- [x] CA4 — Lead sem mensagem não mostra área vazia nem quebra o layout.
- [x] CA5 — HTML no texto do lead é exibido como texto, não interpretado.
- [x] CA6 — `npm run typecheck` e `npm run build` verdes.

## Notas de Implementação (2026-08-05)

Commits `d6d8200` (implementação) e `341dbda` (migrada junto na STORY-062).

Coluna "Mensagem" com preview clicável + modal. `whiteSpace: pre-wrap` é o detalhe que
torna a transcrição legível — sem ele a conversa vira parágrafo único.

### Validação no painel (JG logado)

Lead de teste com transcrição multi-linha e payload de XSS embutido:

- ✅ **CA1/CA2** — modal abre com a conversa em **9 linhas distintas**; cabeçalho traz
  nome, motivo, e-mail e telefone.
- ✅ **CA3** — preview na listagem ("Vigilante patrimonial…") mostra quem tem mensagem
  sem abrir uma a uma.
- ✅ **CA4** — lead sem mensagem exibe "—", sem quebrar o layout.
- ✅ **CA5** — `<img src=x onerror=alert(1)>` renderizado como **texto**: não executou e
  não virou elemento no DOM (`querySelector('img')` → null).
- ✅ **CA6** — build e typecheck verdes.

Lead de teste removido ao final.

### Observação de uso

A tela deixou visível o que o backfill da STORY-051 registrou: **85 dos 85 leads** estão
como "Não enviado" em vermelho na coluna de aviso. É o histórico anterior ao rastreamento
— o painel agora conta essa história sozinho, sem precisar de planilha.
