---
projeto: "Shipping-Insights — Hub de Transportadoras"
tipo: "diagnóstico técnico"
criado: 2026-05-22
metodo: "Auditoria com 4 agentes (segurança/banco, edge functions, frontend, build/qualidade)"
---

# Diagnóstico Técnico — Shipping-Insights

> Auditoria completa do sistema (padrão Trivia, 4 agentes especializados).
> Analisado: 33 migrations, 21 Edge Functions, ~17 mil linhas de frontend, build e dependências.

## Resumo executivo

O sistema **funciona como protótipo**, mas **não está pronto para uso real seguro**.
Foram encontrados **~40 problemas**, sendo os mais graves de **segurança** e de
**controle de acesso**. Em linguagem simples:

1. **Qualquer pessoa na internet** consegue disparar as funções do sistema e injetar
   dados — não há tranca na maioria das portas de entrada.
2. **Qualquer usuário logado vê e altera tudo** — o controle de quem-pode-o-quê
   praticamente não existe. O "portal do fornecedor" não isola os fornecedores
   entre si: um fornecedor veria os dados de todos.
3. **Uma das integrações (LogManager) está com o código quebrado** — não compila.
4. As integrações **não são confiáveis** sob carga: sem retry, sem deduplicação,
   eventos fora de ordem corrompem o status das encomendas.

Nada disso é incomum num sistema gerado em ferramenta low-code (Lovable) que nunca
passou por uma revisão de engenharia. A boa notícia: tudo é corrigível, e o sistema
ainda está vazio — é o momento ideal para arrumar antes de entrar em produção.

**Legenda de severidade:** P0 crítico · P1 alto · P2 médio · P3 baixo

---

## 1. Segurança

### 🔴 Crítico (P0)

| # | Problema | Onde |
|---|----------|------|
| S1 | **17 funções (polling/scan/webhook) são endpoints públicos sem autenticação** e escrevem no banco com poder total (service_role). Qualquer um pode invocá-las repetidamente: consumir cota das APIs pagas das transportadoras, gerar custo, injetar dados, derrubar o sistema. | `supabase/config.toml` (`verify_jwt = false`) |
| S2 | **`tray-webhook` não valida nada** — aceita qualquer POST e grava em `orders`/`shipment_trackings`. | `tray-webhook/index.ts` |
| S3 | **`mercadolivre-webhook` "valida" só com um número público** (`user_id` vindo do próprio corpo da requisição — trivial de forjar). | `mercadolivre-webhook/index.ts:22-47` |
| S4 | **Rotas `/admin/*` não checam se o usuário é admin.** Qualquer conta logada acessa as telas de configuração, dispara integrações e vê credenciais. E o **auto-cadastro está aberto** — qualquer um cria uma conta. | `ProtectedRoute.tsx`, `App.tsx:119-130`, `Auth.tsx` |
| S5 | **Credenciais aparecem nos logs** — a função dos Correios registra pedaços da API key e a resposta de autenticação inteira (com token). | `_shared/correios-auth.ts:25-54` |
| S6 | **Credenciais embutidas no código do site** — Client ID da Amazon, IDs de marketplace e Seller ID do Mercado Livre estão escritos direto no frontend (vão para o navegador de qualquer visitante). | `AdminAmazonVendor.tsx`, `AdminMercadoLivre.tsx` |

### 🟠 Alto (P1)

| # | Problema | Onde |
|---|----------|------|
| S7 | **Os papéis `operação` e `fornecedor` não existem no banco** — só existe `admin` e `user`. O portal do fornecedor não tem isolamento: se um fornecedor receber acesso hoje, ele vê os dados de todos os outros. | enum `app_role` |
| S8 | **A regra de "cada um vê só o seu" está furada.** Todo dado que entra por integração fica "sem dono", e a regra de segurança libera dado sem dono para qualquer um. Na prática, **todo usuário logado lê e altera tudo** — inclusive dados pessoais de clientes (nome, e-mail, telefone, NF). | RLS de `shipments`, `orders`, etc. |
| S9 | **`pedidos_vendor` e `pedidos_itens` estão totalmente abertas** a qualquer usuário logado (ler e gravar). | migration `20260310191329` |
| S10 | **Tabelas financeiras** (`shipping_costs`, `daily_shipping_metrics`) e de contato (`alert_followups`) **sem restrição por papel** — visíveis a qualquer logado. | migrations diversas |
| S11 | Função de banco `validate_amazon_po_status()` sem proteção de `search_path` (vetor de ataque conhecido). | migration `20260318011543` |
| S12 | `invite-user` aceita papel sem validação; se a atribuição de papel falha, o erro é engolido e o usuário fica sem papel. | `invite-user/index.ts` |
| S13 | `send-shipping-alert` monta o HTML do e-mail sem tratamento — permite injeção de conteúdo. | `send-shipping-alert/index.ts` |
| S14 | **Vulnerabilidade na biblioteca `xlsx`** (sem correção disponível) — explorável quando um usuário sobe uma planilha em "Envios Módicos". | `EnviosModicos.tsx` |

### 🟡 Médio (P2)

| # | Problema |
|---|----------|
| S15 | CORS aberto (`*`) em todas as Edge Functions, inclusive nas autenticadas. |
| S16 | `melhor-envio-webhook` aceita requisição sem assinatura como "teste" — abre uma brecha de bypass. |
| S17 | `logmanager-webhook` grava registros atribuindo-os a um usuário aleatório, com um UUID fixo escrito no código. |
| S18 | `npm audit`: 18 vulnerabilidades nas dependências (10 graves). A maioria tem correção simples. |

### ⚠️ A confirmar — possível questão de LGPD

As funções `correios-scan-objects` e `mandae-poll-trackings` **descobrem encomendas
varrendo códigos de rastreio em sequência numérica**. Se a faixa de códigos não for
100% exclusiva da Heziom, o sistema pode estar coletando dados de encomendas de
terceiros (incluindo nome de quem recebeu). **Ação:** confirmar com a logística se a
faixa de prefixo é exclusiva do contrato da Heziom.

---

## 2. Bugs confirmados

| # | Problema | Onde |
|---|----------|------|
| B1 | **A integração LogManager está com o código quebrado** — não compila (uma variável é declarada duas vezes). A função no ar pode ser uma versão antiga. | `logmanager-webhook/index.ts:9` |
| B2 | **Editar um lançamento SOMA em vez de substituir.** Corrigir um lançamento de 100 envios resulta em 200. O botão diz "Atualizar" mas o comportamento é acumular. | `useShippingData.tsx:116-134` |
| B3 | A importação de planilha (Relatórios) aceita datas inválidas em silêncio e grava no banco. | `Relatorios.tsx:173-195` |
| B4 | Em `melhor-envio-sync`, o filtro de data é decorativo — não filtra nada de verdade. | `melhor-envio-sync/index.ts` |
| B5 | A URL de webhook da Tray está "chumbada" no código (as outras telas montam dinamicamente). Hoje aponta para o projeto certo, mas é frágil. | `AdminTray.tsx:11` |

---

## 3. Confiabilidade das integrações

| # | Problema |
|---|----------|
| C1 | **Webhooks sem deduplicação.** Transportadoras reenviam avisos e mandam fora de ordem; sem controle, um aviso antigo sobrescreve um novo — a encomenda "volta no tempo" (de *entregue* para *em trânsito*). |
| C2 | **O login automático nas APIs (OAuth) é frágil** — Mercado Livre, Amazon e Tray. O "token de renovação" não é guardado quando muda, então a integração tende a quebrar sozinha no médio prazo. |
| C3 | **Sem retry e sem tratar limite de uso (HTTP 429).** Uma única recusa temporária da transportadora aborta o lote inteiro de sincronização. |
| C4 | Erro em uma transportadora derruba o processamento das outras no mesmo lote. |
| C5 | Só 1 das ~6 funções de webhook valida o conteúdo recebido; só 1 valida a assinatura. As demais confiam cegamente no que chega. |

---

## 4. Qualidade de código e build

| # | Problema |
|---|----------|
| Q1 | O modo rigoroso do TypeScript (`strict`) **está desligado**, apesar de 3 documentos afirmarem que está ligado. Sem ele, o compilador não pega a maior classe de erros. |
| Q2 | ~30 usos de `any` no código; o módulo de Pedidos do Fornecedor inteiro opera sem verificação de tipo. |
| Q3 | **Não existe nenhum teste automatizado.** Para um sistema com 8 integrações e sync automático, é um risco alto de regressão silenciosa. |
| Q4 | 3 arquivos de "trava de dependências" coexistindo (npm + bun) — fonte de divergência. |
| Q5 | O site é entregue num pacote único de 1,67 MB, sem divisão — carregamento inicial lento. |
| Q6 | Sem tratamento de erro global; a maioria das telas não mostra nada quando uma consulta falha (fica em "carregando" para sempre). |
| Q7 | Cálculos executivos (SLA, % no prazo) feitos no navegador — a regra do projeto pede que fiquem no servidor. |
| Q8 | Listas grandes renderizadas sem otimização (até 5.000 linhas de uma vez na tela do Melhor Envio). |

---

## 5. Documentação desatualizada

| # | Problema |
|---|----------|
| D1 | **O `CLAUDE.md` do repositório ainda aponta para o Supabase ANTIGO** (`sjciabkjuqefponkfqan`). Quem seguir o documento faz deploy no projeto errado. |
| D2 | O `README.md` é o texto-padrão cru da Lovable, com campos não preenchidos. |
| D3 | Os documentos subestimam o problema de segurança: dizem que só os webhooks são abertos, quando na verdade são 17 funções. |

---

## Plano de ação sugerido

Proposta de organização das correções em stories, por prioridade:

| Story | Escopo | Prioridade |
|-------|--------|------------|
| **STORY-003** | Controle de acesso: criar papéis reais (`operação`, `fornecedor`), proteger rotas admin, corrigir as regras de RLS para isolar dados por papel | 🔴 P0 |
| **STORY-004** | Blindar as Edge Functions: segredo de cron nas funções de polling, validação de assinatura/origem nos webhooks, fechar CORS | 🔴 P0 |
| **STORY-005** | Corrigir bugs confirmados: LogManager que não compila, edição de lançamentos, parse de planilha, credenciais nos logs e no frontend | 🔴 P0 / 🟠 P1 |
| **STORY-006** | Confiabilidade das integrações: deduplicação de eventos, retry/limite de uso, login OAuth robusto | 🟠 P1 |
| **STORY-007** | Saúde do código: ligar TypeScript strict, `npm audit fix`, trocar a `xlsx`, unificar lockfiles, primeira suíte de testes | 🟠 P1 / 🟡 P2 |
| **STORY-008** | Correções de documentação (Supabase ref no `CLAUDE.md`, README, contagens) — ganho rápido | 🟡 P2 |

> Observação: vários itens P0 só fazem sentido depois que as integrações estiverem
> reconfiguradas (STORY-002). Sugestão de ordem: STORY-008 (rápida) → STORY-005 →
> STORY-003 + STORY-004 → STORY-002 (credenciais) → STORY-006 → STORY-007.
