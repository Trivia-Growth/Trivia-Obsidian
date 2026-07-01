---
tags:
  - omie
  - estoque
  - integração
  - mapeamento
cliente: Move Gourmet
data: 2026-07-01
---

# Omie — Mapeamento de Estoque (Move Gourmet)

Levantamento feito em 01/07/2026 via API do Omie (somente leitura), antes de
implementar a divisão de estoque Salvador × São Paulo para acompanhar o frete
Shopify.

> ⚠️ **Credenciais expostas no chat** (APP_KEY 3323795676201 / APP_SECRET) —
> a Fernanda deve **rotacionar** no Portal do Desenvolvedor Omie após a entrega.

---

## Locais de estoque no Omie (6 cadastrados)

| Código | Local | ID Omie | Situação | Uso |
|---|---|---|---|---|
| 01 | **Fábrica Move** | 3390627692 | Ativo · **padrão** | Concentra TODO o estoque real hoje |
| 09 | **SÃO PAULO** | 10009035408 | Ativo | Criado 15/05/2026, **sem saldo** ainda |
| 04 | Assinantes | 9976573531 | Ativo | Sem saldo |
| 02 | ANGIOCLAM VILLAS | 9590120888 | Ativo | Outro negócio (não é Move) |
| 03 | Escolas | 9887572719 | Inativo | — |
| 06 | Quiosques | 9976573734 | Inativo | — |

**Conclusão:** o depósito "São Paulo" que estava pendente **já existe** (código 09).
Não precisa criar — precisa é abastecer e mapear.

---

## Estoque

- Catálogo: **1.432 produtos** (muitos zerados).
- Todo o saldo físico está no **Fábrica Move (Salvador)**. Ex.: NT CREATINE 300G = 5 un,
  NT CREATINE = 10 un, PURA FIBER 250G = 4 un — todos no local 3390627692.
- SÃO PAULO e Assinantes retornam saldo zero.
- **Limitação da API:** o relatório `ListarPosEstoque` consolida no local padrão
  (Fábrica). A leitura por local individual não é confiável por essa chamada —
  a conferência fina do que existe fisicamente em SP tem que ser na tela do Omie.

---

## Mapeamento pretendido Shopify ↔ Omie

| Shopify (local) | Papel | Omie (depósito) |
|---|---|---|
| Rua Dr Gerino Silva (Salvador) | Expedição BA/Norte/Nordeste | Fábrica Move (01) |
| Rua Dr João Toniolo (SP) | Expedição Sul/Sudeste | SÃO PAULO (09) |
| Shopping Barra (retirada) | Retirada em loja | **A DEFINIR** (ver decisão abaixo) |

---

## Decisão — estoque da loja física (Shopping Barra) ✅ RESOLVIDO (01/07/2026)

**Confirmado pela Nat (responsável Move Gourmet):** a loja do Shopping Barra tem
**estoque próprio** (opção B), e ele é controlado em **outro sistema — Linx**, NÃO no Omie.
Retira na hora no balcão; produtos aquecem rápido, então fica **pronto em ~1 hora**.

**Implicação importante:** como o estoque da loja está no Linx, ele **nunca sincroniza
com o Shopify via Omie.Hub**. O Omie só enxerga Fábrica Move (Salvador) e SÃO PAULO.

→ Para a retirada no Shopify: NÃO gatilhar disponibilidade no estoque do Omie. A loja
prepara sob demanda a partir do próprio estoque (Linx). Opções:
- Curto prazo: manter a retirada sempre disponível (preparo sob demanda), sem
  amarrar ao saldo Omie de Salvador.
- Integrar Linx→Shopify seria projeto à parte (fora de escopo agora).

### 🟨 RECOMENDAÇÃO (registrada a pedido do JG, 01/07/2026)
**Se a Move Gourmet quiser manter a função de retirada no site de forma confiável, o
aconselhável é o estoque da loja física ser gerido pelo Omie** (e não em paralelo no Linx).
Motivo: só o que está no Omie sincroniza pro Shopify via Omie.Hub. Com o estoque da loja
no Omie (ex.: depósito próprio "Loja Shopping Barra"), a disponibilidade de retirada no
site passa a refletir o saldo real. Enquanto ficar só no Linx, a retirada no site é um
contorno (amarrada ao saldo de Salvador) e pode divergir do que a loja realmente tem.

**Contatos da loja (Nat):** telefone loja 71 99993-8572; há gerente das unidades
disponível para dúvidas específicas dos bistrôs.

---

## Como a integração Shopify↔Omie está hoje

**Descoberto em 01/07/2026 (Shopify → Apps → Desenvolver apps → Apps personalizados legados):**

Existem **DOIS apps personalizados legados da Omie** instalados ao mesmo tempo:

| App | Instalado | Histórico |
|---|---|---|
| **Omie Move Gourmet** | 04/08/2025 | Todos os eventos em 04/08 — 1ª tentativa, abandonada |
| **Omie Shopify** | 04/09/2025 | Todos os eventos em 04/09 — nome padrão Omie, provável ativo |

→ Duplicação. Risco de conflito de sincronização (dois apps escrevendo estoque/pedido).
A linha do tempo (ago = 1ª tentativa junto com Wix; set = refação) indica que
**"Omie Move Gourmet" é o legado a remover** e **"Omie Shopify" é o atual**.

**Cuidado:** o "Histórico de desenvolvimento" do Shopify só mostra eventos de setup
(install/token/escopo/webhook), NÃO tráfego de API ao vivo. Então é forte indício, mas
não prova 100% qual está sincronizando agora. **Confirmar pelo lado da Omie qual token
está plugado antes de remover.**

**Omie.Hub:** o painel NÃO abre pela conta (launcher cai na página de venda; login do Hub
retorna "Usuário e/ou senha inválidos. Por favor, contate o suporte."). Mesmo pagando o
plano, o acesso ao painel está bloqueado — em atendimento com o suporte Omie (Kim) em
01/07/2026. **Comprovação:** [[assets/omie-hub-sem-acesso-erro-login-01jul2026.png]]

PORÉM, pela API dos pedidos, a integração está **funcionando em segundo plano**:

### Prova de que o Hub está ativo (via API de pedidos)
- Pedidos do Shopify entram no Omie com `origem: SFY` e `codigo_pedido_integracao: "OH..."`
  (prefixo **OH = Omie.Hub**).
- ~100 pedidos Shopify importados, de **08/09/2025** (1º) até **15/06/2026** (mais recente).
- O 1º pedido (08/09/2025) coincide com a criação do app **"Omie Shopify" (04/09/2025)**.

### Conclusões travadas
1. **Integração viva = Omie.Hub, usando o app "Omie Shopify"** (set/2025).
2. **"Omie Move Gourmet" (ago/2025) é o legado morto** — precede qualquer pedido em 1 mês,
   era da fase Wix (cancelada). ✅ Seguro remover.
3. **Hub deduz estoque só do depósito PADRÃO (Fábrica Move / Salvador).** Todos os 100
   pedidos Shopify vieram com `codigo_local_estoque: None` → cai no padrão. **Hoje NÃO há
   divisão por local no ERP.**

### ⚠️ Blocker real para a divisão Salvador × SP
Pra SP deduzir do depósito SP, é preciso configurar o mapeamento **local Shopify → depósito
Omie** DENTRO do Omie.Hub. Esse painel está **inacessível** → depende de **suporte Omie /
acesso do Hub pela Fernanda**. Configuração no Shopify sozinha NÃO divide o estoque no ERP.

### A verificar
- Último pedido sincronizado é 15/06/2026 (hoje é 01/07). Confirmar se a sync ainda está
  ativa ou parou (pode ser só ausência de vendas, mas vale checar).
- ⚠️ Possível cobrança (~R$110/mês) do Hub — mas ELE ESTÁ EM USO, então não é desperdício;
  o problema é só o acesso ao painel.

**Histórico:** apps legados liberados em 04/08/2025 por Fernanda Ferrari. Saga de
integração: ago/2025 (Omie Move Gourmet + Wix, falhou) → set/2025 (Omie Shopify, vingou).

---

## Próximos passos Omie

- [x] Confirmar qual app de integração está ativo → **Omie Shopify (via Omie.Hub)**
- [ ] **Destravar acesso ao painel do Omie.Hub** (suporte Omie / Fernanda) — pré-requisito
      pra qualquer divisão de estoque por local
- [ ] Dentro do Hub: mapear local Shopify → depósito Omie (Salvador→Fábrica Move, SP→SÃO PAULO)
- [x] Confirmar com Fernanda/Nat se a loja física (Shopping Barra) tem estoque próprio → **sim, controlado no Linx**
- [ ] Abastecer / conferir saldo do depósito SÃO PAULO (09) — hoje zerado
- [ ] Verificar se a sync do Hub ainda está ativa (último pedido visto: 15/06/2026)
- [ ] Remover app legado "Omie Move Gourmet" (confirmado seguro; não é urgente)
- [ ] Rotacionar credenciais da API Omie expostas no chat (APP_KEY 3323795676201)
