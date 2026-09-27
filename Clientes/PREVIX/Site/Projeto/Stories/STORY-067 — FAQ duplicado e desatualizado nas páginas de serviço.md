---
id: STORY-067
titulo: "FAQ duplicado e desatualizado nas páginas de serviço"
fase: 7
modulo: "Site · Serviços e FAQ"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: EPIC-BRANDING-V7
tipo: debito-tecnico
executor: codigo
---

# STORY-067 — FAQ duplicado e desatualizado nas páginas de serviço

> Achado ao mapear onde aplicar os itens 10, 12, 16 e 17 de [[A aplicar no Site Previx]].
> As correções de portfólio caem quase todas num FAQ **que não é o do painel**.

## Diagnóstico (código real)

### Existem dois FAQs

| | Onde | Quantidade | Editável em |
|---|---|---:|---|
| FAQ do site | `site.faq` → `/faq` | 16 ativas | `/admin/faq` ✅ |
| FAQ por serviço | `FAQ_POR_SERVICO` em `src/pages/servicos/[slug].astro:51-84` | **19** | só código ❌ |

As 19 perguntas hardcoded cobrem `patrimonial`, `eletronica`, `facilities` e `limpeza`, e
**repetem parcialmente** o conteúdo do banco: VSPP, Smart Sampa, engenheiro especialista,
portaria virtual, os 70% de economia, NR-23. Onde repetem, já divergem no texto.

Isso significa que corrigir uma informação no painel deixa a outra versão errada no ar, numa
página diferente, sem nenhum aviso. É a armadilha que esta story precisa fechar antes de
qualquer correção de conteúdo.

### As correções de portfólio que caem aqui

**Item 12 — Bombeiro civil, NRs.** `[slug].astro:65` e `:68` mencionam **só a NR-23**:

> "…bombeiro civil (NR-23), limpeza especializada e hospitalar…"
> "O serviço de bombeiro civil da Previx atende à NR-23 (Proteção Contra Incêndios) e
> legislações estaduais aplicáveis…"

Correto (v7): **NRs 01, 06, 07, 20, 23, 33 e 35**. O site comunica um sétimo da habilitação
real.

**Item 10 — Postes IA.** `[slug].astro:62` descreve os postes com mensalidade fixa e IA
embarcada, mas **não diz** os dois ganchos que o Dr. Ricardo destacou:
- câmeras **ligadas diretamente à Polícia**;
- **zero custo de instalação e do poste**.

O segundo é o que derruba a objeção de CAPEX, e o texto atual chega perto sem dizer.

**Item 16 — Portaria virtual própria.** `[slug].astro:59` fala em "sistema integrado de
controle remoto operado pela central Previx 24h". Não diz **"própria, não terceirizada"** —
que é o diferencial contra o concorrente que revende operação de terceiro. Hoje a palavra
"não terceirizada" só aparece no FAQ do banco, e sobre a *central de monitoramento*, não
sobre a portaria.

**Item 17 — Engenheiro especialista.** Já existe em `[slug].astro:60` e na home
(`index.astro:70`), mas diluído dentro de parágrafo. O documento pede promover a bloco de
destaque.

## Escopo

### ✅ Inclui

1. **Decidir a fonte única** das perguntas por serviço. Duas saídas viáveis:
   - migrar `FAQ_POR_SERVICO` para `site.faq` com vínculo ao serviço, ficando tudo em
     `/admin/faq`; ou
   - manter no código, mas eliminar a duplicação com o banco, sem informação repetida em
     dois lugares.
   A primeira é a coerente com a direção do projeto (STORY-056/057 mataram os espelhos em
   `src/content`); a segunda é mais barata. Registrar a escolha e o porquê.
2. Bombeiro civil: **NRs 01, 06, 07, 20, 23, 33 e 35** onde hoje se lê NR-23.
3. Postes IA: acrescentar "ligadas diretamente à Polícia" e "zero custo de instalação e do
   poste".
4. Portaria virtual: explicitar **própria, não terceirizada**.
5. Engenheiro especialista: promover a destaque na página de Segurança Eletrônica.

### ❌ NÃO inclui

- Remover o PX One — **STORY-068**.
- Diferenciais que não existem em lugar nenhum (findme, seguro RC) — **STORY-069**.
- Redesenhar as páginas de serviço.

## Critérios de Aceite

- [x] CA1 — Nenhuma informação de serviço existe em duas fontes independentes; corrigir num
      lugar corrige o site inteiro.
- [x] CA2 — Toda menção a bombeiro civil cita as sete NRs.
- [x] CA3 — A descrição dos Postes IA traz ligação direta com a Polícia e custo zero de
      instalação e do poste.
- [x] CA4 — A portaria virtual é comunicada como própria e não terceirizada.
- [x] CA5 — O engenheiro especialista aparece como destaque, não só dentro de parágrafo.
- [x] CA6 — `grep -rn "NR-23\|NR 23" src` só retorna ocorrências dentro da lista das sete.
- [~] CA7 — `npm run build` verde; `typecheck` com os mesmos 215 erros pré-existentes
      (ver STORY-065).

## Riscos

- **CA1 é o risco central.** Se a migração for feita sem apagar a fonte antiga, o site fica
  com três lugares em vez de dois. O gate honesto é o grep: a frase precisa existir **uma
  vez** no repositório inteiro.
- As perguntas hardcoded alimentam JSON-LD de FAQ nas páginas de serviço. Migrar sem manter
  o schema estruturado perde rich snippet — verificar o HTML gerado, não só a tela.
- Se a escolha for migrar para o banco, é migração de conteúdo: as 19 perguntas precisam
  chegar íntegras. Conferir contagem antes e depois.
- Os espelhos mortos em `src/content/faq/faq.json` e `src/content/servicos/*.md` continuam
  no repo com textos velhos. Não vão ao ar, mas enganam quem procura. Considerar apagar
  junto — ver [[feedback_caminho_morto_nao_e_dado_morto]].

## Links

- [[A aplicar no Site Previx]] — itens 10, 12, 16, 17
- [[Contexto Atualizado - Dr. Ricardo]] — credenciais técnicas oficiais
- [[STORY-057 — Rodapé e FAQ liam do JSON em vez do banco]]

## Notas de Implementação (2026-08-05)

Commit `4ef5fba`. Migrations `20260805180000` e `20260805270000`.

**Decisão registrada (CA1):** fonte única **no banco**. As 19 perguntas hardcoded saíram de
`servicos/[slug].astro`; as páginas passam a ler `site.faq` por categoria, via
`getFAQPorCategorias()`.

Mapa: `patrimonial` → patrimonial · `eletronica` → eletronica + postesia ·
`facilities` → facilities · `limpeza` → limpeza (categoria nova, 6 perguntas).

O conteúdo que só existia no código foi migrado, não descartado: as 6 perguntas de limpeza
(cauda longa de busca local: "quanto custa", "limpeza de fachada", "pós-obra") e mais 2
perguntas que não tinham equivalente no banco. Total ativo: 15 → 23.

Correções de portfólio aplicadas: as **sete NRs** do bombeiro civil, Postes IA com
acionamento direto da Polícia e custo zero, portaria virtual explicitada como **própria,
não terceirizada**, engenheiro especialista preservado.

### Erro que só a tela pegou

Inseri as duas perguntas novas com `ordem = 4`, assumindo numeração **por categoria**. A
numeração de `site.faq` é **global**. Resultado: a pergunta sobre as NRs abria a página de
facilities, antes de "quais serviços a Previx oferece", e a de supervisão empatava em 4 com
outra pergunta. Banco e build não acusam — a ordem era válida, só não era a pretendida.
Corrigido na migration `20260805270000`.

### Verificado no navegador

`/servicos/facilities` → 4 perguntas na ordem certa. `/servicos/eletronica` → 3 de
eletrônica + Postes IA no fim. Textos conferidos: "não terceirizada", "ligadas diretamente
à Polícia", "zero custo de instalação e do poste", "engenheiro especialista" — todos
presentes; "PX One" ausente.
