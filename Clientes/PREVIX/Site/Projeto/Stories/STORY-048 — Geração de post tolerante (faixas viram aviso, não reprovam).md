---
id: STORY-048
titulo: "Geração de post tolerante: faixas de tamanho viram aviso, não reprovam o rascunho"
fase: 6
modulo: "Blog/CMS · Gerador de Post (IA)"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-07-14
atualizado: 2026-07-14
epico: null
tipo: fix
relacionado: STORY-043
---

# STORY-048 — Geração tolerante (fim do "Rascunho fora do contrato")

> Depois do fix de JSON (STORY-047), o JG bateu em: "Rascunho fora do contrato GEO/AEO:
> Seção 'Quais são os modelos...' tem 47 palavras (esperado 50-150)." (502). A cada
> regeneração caía num limite diferente.

## Diagnóstico (causa raiz)

O mapeador (`mapper.ts`, STORY-043) foi desenhado para **falhar explícito** em QUALQUER
campo fora de faixa (evitar post vazio, o anti-padrão do Jimmy Studio). Mas o LLM não
acerta contagem exata de palavras/chars, então **a geração inteira era rejeitada** por um
desvio mínimo (seção 47 vs 50, tldr, faq, intro, conclusão...). Resultado: gerar post
virou loteria — cada tentativa esbarrava num limite diferente.

O erro de conceito: o mapeador tratava "seção 47 palavras" (conteúdo REAL, só 3 curto)
igual a "campo vazio" (o anti-padrão que se queria evitar). São coisas diferentes.

## Decisão de arquitetura

Separar **gerar rascunho** (tolerante — é editável) de **publicar** (rígido, com
confirmação, que já existe: `validate-post` + gate da STORY-040, confirmação-não-bloqueio):
- **Hard-fail** só em quebra real: título/intro/conclusão/meta vazios, ZERO seções,
  invariante estrutural de assembly (bloco perdido/duplicado), imagem irresolvível.
- **Aviso (não reprova)**: toda faixa de tamanho/cardinalidade — intro 40-60, seção
  50-150, conclusão 50-150, tldr =3, faq 4-5, faq answer 40-150, tldr item 40-280, title
  >80 (trunca), meta >180 (trunca). Item incompleto (faq sem resposta, estatística sem
  fonte, seção sem título) é **descartado** com aviso, não derruba o rascunho.
- Os avisos voltam no response (`warnings`) e no audit. A UI não precisa mudar: assim que
  o rascunho carrega, o **painel de lint** (mesmo `validate-post`) já mostra o que revisar.

## Critérios de Aceite

- [x] CA1 — Seção fora de 50-150 palavras NÃO reprova a geração (vira aviso).
- [x] CA2 — intro/conclusão/tldr/faq fora de faixa NÃO reprovam (viram aviso).
- [x] CA3 — title>80 trunca; meta>180 trunca; image/cta/keywords vazios caem em fallback/default.
- [x] CA4 — Item incompleto (faq/estatística/seção) é descartado com aviso, não reprova.
- [x] CA5 — Hard-fail preservado em: título/intro/conclusão/meta vazios, ZERO seções, invariante de assembly.
- [x] CA6 — `warnings` no response + audit; publish gate (validate-post) inalterado (rígido, com confirmação).
- [x] CA7 — `deno test` verde: mapper 30, json-repair 7.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/generate-post/mapper.ts` | Faixas viram `warnings.push` (não `err`); item incompleto descartado; `buildSection` não reprova seção longa; `MapResult` ganha `warnings`; invariante estrutural continua hard. |
| `supabase/functions/generate-post/index.ts` | Repassa `mapped.warnings` no response e no audit. |
| `supabase/functions/generate-post/mapper.test.ts` | 6 testes de faixa reescritos (FALHA→AVISO) + split hard/leniente. |

## Notas de Implementação (2026-07-14)

- Deploy: `supabase functions deploy generate-post`. Sem migration, sem mudança de frontend.
- Contagem de palavras/chars continua espelhando `validate-post` (mesmas funções); o que
  mudou é só a AÇÃO (gerar = avisa; publicar = gate rígido com confirmação).
- Sequência do dia no gerador: STORY-045 (anti-concorrente) → 047 (JSON resiliente) →
  048 (geração tolerante). Cada uma tirou um motivo de falha da geração.
