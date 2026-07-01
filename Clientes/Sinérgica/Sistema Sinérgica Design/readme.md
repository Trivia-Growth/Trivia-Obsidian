# Sinérgica OS — Design System

Design system do **Sinérgica OS**, o sistema operacional interno da **Sinérgica ·
Manutenções Patrimoniais**. É um **dashboard SaaS multi-módulo** (PCM/Operação,
Atendimento IA, Comercial, Financeiro, Estoque, Marketing, Growth, Cockpit e Área
do Cliente) construído em **React + Tailwind CSS v4 + lucide-react**.

Este sistema faz duas coisas: (1) documenta os **padrões de UI reais do produto**
(extraídos do código) e (2) aplica por cima a **identidade visual oficial da
Sinérgica** (azul-marinho + laranja/âmbar), substituindo as cores de scaffold.

## Fontes deste sistema
- **Código:** `github.com/Trivia-Growth/Sinergica-OS` — monorepo SDD/OS-layer.
  Telas reais lidas: `apps/web/src/app/HomePage.tsx` (dashboard PCM) e
  `apps/web/src/features/auth/pages/LoginPage.tsx`. Cópias em `reference/`.
- **Marca:** entregáveis de logo da Sinérgica (`uploads/…`) — assinaturas PNG,
  posts e símbolo. Paleta extraída por amostragem dos PNGs oficiais.

> ⚠️ **Importante — a marca ainda não está no código.** O scaffold do repositório
> usa cores genéricas do Tailwind: **emerald-700** na marca/abas/itens ativos e
> **blue-600** no login. A Sinérgica é **navy `#202B59` + laranja `#EF7E25→#F7A600`**.
> Este DS aplica a marca correta. **Recomendação:** trocar `emerald`/`blue` por
> `navy`/`orange` no `apps/web` (ver seção "Mapa de migração" abaixo).

---

## CONTENT FUNDAMENTALS — como o produto escreve
- **Idioma:** português (BR), tom **operacional e direto**. Saudação pessoal
  ("Olá, Marina! 👋"), subtítulos curtos de contexto ("Últimas 5 abertas ou
  atualizadas").
- **Rótulos de seção** em CAIXA-ALTA com tracking largo (`OPERAÇÃO`, `PREVENTIVO`).
- **Domínio técnico de manutenção predial:** OS, Backlog GUT, SLA, Preventivas,
  Inspeções, SPDA, condomínio, síndico. Números de OS em fonte mono (`CH-047`).
- **Status** sempre nomeados em PT: Solicitação · Planejado · Em andamento ·
  Concluído. Prioridade: Crítica · Alta · Média · Baixa.
- Emoji aparece **só** na saudação (👋) — não usar em UI funcional. Na marca
  (marketing) emoji não é usado.

## VISUAL FOUNDATIONS — direção "instrumento de operação"
O Sinérgica OS NÃO é mais um dashboard SaaS genérico. A direção é **industrial /
utilitária**: papel quente, navy como tinta estrutural, **laranja cirúrgico** e
tipografia de engenharia. Princípios:
- **Papel quente, não slate frio.** Fundo `#F4F2EC` (herda o off-white da marca) —
  diferencia de todo dashboard de IA. Superfícies `#FFF`, **hairlines quentes**
  `#E5E2D9` em vez de sombras infladas.
- **Navy é a estrutura.** Sidebar e cabeçalhos institucionais em `#1C2748`/`#141C36`
  (chapado, sem gradiente). Navy também é a tinta dos numerais e títulos.
- **Laranja é cirúrgico.** `#E8731B` aparece SÓ em: ação principal (Nova OS),
  indicador de item/aba ativa, prioridade crítica/alta e deltas de alerta. Nunca
  como preenchimento decorativo. Botões laranja são **chapados** com um degrau de
  sombra inferior (`shadow-[0_2px_0_0_#C5590C]`), não gradiente.
- **Tipografia de engenharia.** **Saira** (peso 700/800, tabular-nums) nos títulos,
  KPIs, números de OS e códigos — dá caráter técnico. **Poppins** no texto corrido.
  Labels de seção em CAIXA-ALTA Saira com tique laranja (`▎`).
- **KPI rail tipográfico** (assinatura do redesign): um único painel branco dividido
  por hairlines em colunas — label small-caps, número Saira grande tabular, micro
  delta. **Sem ícone em quadradinho colorido** (padrão "lovable" abolido).
- **Raios contidos** (6–10px) — instrumento, não card inflado. Grão de papel sutil
  (~2.5% opacity) para textura.
- **Status** = barra/traço colorido + texto, não pílula gorda. **Prioridade GUT**
  como traço lateral na linha + ponto + label; score em selo Saira.
- **Ícones:** **Lucide** stroke ~1.8. Símbolo da marca (`assets/symbol-*.png`) como
  watermark no navy e no login. **Zero emoji** em qualquer parte da UI.
- **Page-load:** reveal escalonado (8px/40ms stagger) nos KPIs e linhas.

## ICONOGRAPHY
- **Lucide** (`lucide-react` no código; `lucide@latest` via CDN nos kits). Mantenha
  stroke 1.8–2 e os mesmos glyphs do produto: `hard-hat, bot, briefcase, bar-chart-3,
  package, megaphone, trending-up, layout-dashboard, user-circle, clipboard-list,
  layout-grid, check-circle-2, calendar, wrench, file-text, zap, settings, log-out`.
- **Símbolo da marca** (`assets/symbol-*.png`) — engrenagem + edifício; use no brand
  tile / login no lugar de ícones genéricos.
- Sem emoji em UI (exceto a saudação 👋, herdada do produto).

---

## Mapa de migração (scaffold → marca autoral)
O scaffold do `apps/web` usa cores genéricas do Tailwind. Aplique a direção autoral:
| Onde (no `apps/web`) | Scaffold atual | Trocar por |
|---|---|---|
| Fundo da app | `bg-slate-50` / `gray-50` | papel quente `#F4F2EC` |
| Sidebar | claro / emerald | navy chapado `#141C36` + logo off-white + watermark |
| Item de nav ativo | `bg-emerald-50 text-emerald-700` | `bg-white/7 text-white` + tique laranja `#E8731B` |
| Aba ativa | `border-emerald-600 text-emerald-700` | `border-orange text-navy` (ícone laranja) |
| KPI cards | card + ícone em quadradinho | **KPI rail** tipográfico Saira, sem ícone |
| Botão primário | `bg-blue-600` | `bg-orange #E8731B` chapado + `shadow-[0_2px_0_0_#C5590C]` |
| Bordas / cards | `rounded-xl shadow` | hairline quente `#E5E2D9`, raio 6–10px, sem sombra |
| Numerais / códigos | Inter | **Saira** tabular-nums |
| Anel de foco input | `ring-blue-500` | `border-orange ring-orange/20` |

Status (cores semânticas) e prioridade GUT permanecem — mudam só de **pílula** para
**traço + texto**. Veja `ui_kits/app/index.html` como referência viva da implementação.

## Índice / manifesto
- **`Documentação.html`** — **porta de entrada**: documentação visual completa do DS
  (símbolo, cor/laranja, tipografia, componentes, telas, princípios). Comece por aqui.
- `styles.css` — entrada global (só `@import`).
- `tokens/` — `fonts, colors, typography, spacing, effects` (marca) + **`product.css`** (app).
  `colors.css` inclui a **rampa Laranja 50–900** + governança de uso do laranja.
- `guidelines/` — specimen cards (Cores, Tipo, Marca, Espaçamento, Sombras).
- `components/core/` — primitivos React de marca (Button, Badge, Checklist, Card).
- `components/app/` — specimen dos primitivos do dashboard (KPI rail, status, prioridade, abas).
- `ui_kits/app/` — **telas reais do produto** (shell navegável):
  `index.html` com **5 páginas** — Painel · Ordens de Serviço (tabela) · Plano de
  Manutenção (matriz de calendário, ref. do cliente) · Backlog GUT (matriz/heatmap) ·
  Cockpit (linha, gauge, donut, barras + infográfico do ciclo) — e `login.html`.
- `ui_kits/social/` · `ui_kits/web/` — superfícies de **marketing** da marca.
- `assets/` — logos, símbolos recortados (laranja/azul/off-white/preto), posts de referência.
- `reference/` — cópias dos fontes do repositório (HomePage, LoginPage, etc).

## Exploração do símbolo & do laranja
- **Símbolo** (engrenagem + setas de ciclo + edifício) usado como: marca-d'água em
  sidebar/cards, tile de app/login, favicon laranja, e **infográfico do ciclo de
  manutenção** (Inspeção → Diagnóstico → Plano → Execução → Validação) no Cockpit.
- **Laranja** ganhou rampa completa (50–900) para data-viz e profundidade; aplicado
  como linha de SLA, gauge, prioridade crítica/alta e ação — sempre cirúrgico.

## Caveats / pedido
- **A marca não está aplicada no código.** Posso abrir um PR temático trocando os
  utilitários emerald/blue por navy/orange — **quer que eu prepare esse diff?**
- **Fontes são substituições** (Poppins/Saira via Google Fonts). O repositório não
  declara família custom; confirme se há fonte oficial no manual da marca.
- Os módulos além do PCM estão "Em construção" no produto — recriei o estado real.

> **Compartilhamento:** defina o tipo do arquivo como **Design System** no menu
> *Share* para a equipe visualizar.
