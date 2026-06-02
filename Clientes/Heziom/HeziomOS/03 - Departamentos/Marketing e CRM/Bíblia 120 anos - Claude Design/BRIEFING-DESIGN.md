# Briefing de Design — LP Bíblia 120 Anos (IPP · Editora Heziom)

Documento para desenvolver o layout da landing page no Claude. Contém identidade visual, estrutura, conversão e os ativos disponíveis. Copie este texto e suba as imagens da pasta `imagens/` ao iniciar o design.

---

## 1. O produto

Bíblia Sagrada **comemorativa dos 120 anos da Igreja Presbiteriana de Pinheiros** (IPP), publicada pela Editora Heziom.

| Item | Valor |
|---|---|
| Título | Bíblia 120 anos · Letra Grande |
| Versões | Couro **Preto** e couro **Marrom** (mesmo conteúdo) |
| Preço | **R$ 159,90** · até 4x sem juros · Pix com desconto |
| Especificações | Couro · 1.276 páginas · 14 × 21 cm · letra grande |
| Acabamento | Gravação dourada, tulipa em relevo, fachada do templo na capa |
| Extra | Encarte histórico exclusivo dos 120 anos |
| Lançamento | **08/07/2026** (a IPP foi fundada em 08/07/1906) |
| ISBN | Preta 978-65-5265-134-1 · Marrom 978-65-5265-133-4 |

---

## 2. Direção visual: mescla claro + escuro

A LP alterna entre **escuro premium** (sofisticação do couro e do foil dourado) e **claro editorial** (narrativa histórica, leveza).

- 🌑 **Escuro** (marinho profundo + dourado): hero, seção de cupom, CTA final.
- ☀️ **Claro** (creme/off-white + marinho + dourado): história da igreja, variantes do produto, tema bíblico.

### Paleta (extraída dos arquivos originais)

| Cor | Hex | Uso |
|---|---|---|
| Azul-marinho quase preto | `#11151C` | Cor de marca, fundos escuros, tipografia |
| Marinho profundo | `#0B0E13` | Gradiente dos fundos escuros |
| Dourado foil | `#E5B875` | Destaques, CTAs, brilhos (cor da gravação da capa) |
| Dourado base | `#C9A24B` | Dourado mais fechado, bordas, ícones |
| Couro marrom (terracota) | `#8E3D1F` | Acento da edição marrom |
| Creme do encarte | `#F0E9DB` | Detalhes claros |
| Papel / off-white quente | `#F7F2E8` | Fundo das seções claras |
| Branco | `#FFFFFF` | Fundo principal claro |
| Texto escuro | `#171A1F` | Corpo de texto no claro |
| Texto sobre escuro | `#ECE6D8` | Corpo de texto no escuro |

### Tipografia

- **Títulos / display:** serifa clássica elegante — **Cormorant Garamond** (ou Fraunces). Dá o tom eclesiástico e atemporal, ecoando as capitais romanas do logo IPP.
- **Corpo e interface:** **Manrope** (sans humanista, legível).
- **Rótulos / eyebrows / preços técnicos:** **JetBrains Mono** (caixa-alta, letter-spacing largo).

### Elemento gráfico-chave

O **símbolo da tulipa** da IPP (`imagens/marca/simbolo-tulipa-*.png`) é o motivo recorrente: aparece no logo, gravado na fachada do templo e em relevo na capa. Use-o como selo, divisor de seções e marca-d'água. A gravura do templo em estilo xilogravura serve como textura de fundo sutil nas seções escuras.

### Tom de voz (regras Heziom obrigatórias)

- Sobriedade editorial da tradição reformada. Foco em curadoria, herança, permanência.
- **Nunca usar o travessão "—"** nem a palavra **"jornada"**.
- Evitar linguagem de "queima de estoque / saldão". Preferir "edição comemorativa", "edição limitada".

---

## 3. Estrutura sugerida da página

```
1.  Barra de anúncio (escuro)   — "Pré-lançamento 08/07/2026" + contagem regressiva
2.  Navbar (escuro)             — logo IPP+Heziom + CTA "Garantir minha Bíblia"
3.  HERO (escuro premium)       — selo "120 anos", título serifado, bullets,
                                  2 CTAs (comprar + cupom), mockup da capa + badge "120"
4.  Faixa de benefícios (escuro)— Couro · Letra grande · Edição limitada · Parcelamento
5.  HISTÓRIA (claro editorial)  — "Edificados em raízes profundas", timeline com as
                                  fotos: 1906, Casa de Oração, 1970, aquarela atual
6.  Citação do pastor (escuro)  — frase do Rev. Arival + tulipa dourada
7.  PRODUTO (claro)             — 2 cards de variante (preta/marrom, R$ 159,90) + specs
8.  CUPOM / LEAD (escuro)       — captura de e-mail → cupom IPP120
9.  Tema bíblico (claro)        — "Cristo é tudo em todos" (Cl 3.11)
10. FAQ (claro)                 — acordeão
11. CTA final (escuro)          — "Leve para casa a Bíblia dos 120 anos"
12. Footer (escuro)             — logo IPP+Heziom, links, CNPJ
+   Sticky CTA mobile + modal exit-intent de cupom
```

---

## 4. Conversão

- **CTAs de venda** ("Comprar edição preta/marrom") → levam à loja (Tray) com o SKU correspondente, já com o cupom aplicado.
- **Captura de lead** (form do hero/seção cupom + modal de saída) → entrega o cupom **IPP120** de pré-venda e cadastra o e-mail.
- Vários pontos de CTA distribuídos ao longo do scroll (hero, variantes, cupom, sticky mobile, CTA final).

---

## 5. Ativos disponíveis (pasta `imagens/`)

**`marca/`**
- `logo-ipp.png` / `logo-ipp-heziom.png` — logo IPP e logo combinado IPP+Heziom (marinho, fundo transparente)
- `logo-ipp-heziom-cream.png` / `logo-ipp-gold.png` — versões claras para fundo escuro
- `simbolo-tulipa.png` / `-gold.png` / `-cream.png` — só o símbolo da tulipa (3 cores)
- `logo-heziom.png` — hexágono Heziom

**`produto/`**
- `mockup-preta-frente.jpg` / `mockup-marrom-frente.jpg` — capas (fundo branco)
- `mockup-preta-frente-transparente.png` / `mockup-marrom-frente-transparente.png` — capas com fundo recortado (para usar sobre fundos escuros)
- `mockup-preta-verso.jpg` / `mockup-preta-lateral.jpg` — verso e lombada dourada

**`templo/`**
- `templo-aquarela.jpg` — aquarela linda da fachada atual (ótima para hero claro ou história)
- `arte-templo-gravura.png` — ilustração do templo em xilogravura P&B (textura/marca-d'água)
- `arte-templo-gold.png` / `arte-templo-cream.png` — a gravura recolorida

**`historia/`**
- `historia-templo-1906.jpg` — antigo templo gótico
- `historia-casa-oracao.jpg` — congregação diante da "Casa de Oração"
- `historia-segundo-templo-1970.jpg` — segundo templo (rua Fernão Dias)
- `historia-fundadores.png` — retrato sépia dos primeiros líderes

---

## 6. Layout de referência já pronto

Já existe uma versão funcional desta LP construída com esta identidade em
`~/heziom-lp-biblia120/index.html` (abra no navegador para ver uma realização do briefing).
Use como referência de partida e itere o layout no Claude design.

Textos prontos (sinopse, história, FAQ, citações) estão em `TEXTOS-PRONTOS.md`.
