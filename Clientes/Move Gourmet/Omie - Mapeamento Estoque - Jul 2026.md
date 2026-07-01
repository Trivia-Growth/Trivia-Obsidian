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
| 01 | **Fábrica Move** | 3390627692 | Ativo · **padrão** | 1.009 itens com saldo (embalagem + produto acabado) |
| 09 | **SÃO PAULO** | 10009035408 | Ativo | Criado 15/05/2026, **COM saldo** de produto acabado (ver correção abaixo) |
| 04 | Assinantes | 9976573531 | Ativo | Sem saldo |
| 02 | ANGIOCLAM VILLAS | 9590120888 | Ativo | Outro negócio (não é Move) |
| 03 | Escolas | 9887572719 | Inativo | — |
| 06 | Quiosques | 9976573734 | Inativo | — |

**Conclusão:** o depósito "São Paulo" que estava pendente **já existe** (código 09)
**e já tem produto acabado em estoque** (ver correção abaixo). Não precisa criar nem
abastecer do zero. Falta **mapear** o local no Hub, e o Hub é justamente onde isso trava.

---

## Estoque

> ⚠️ **CORREÇÃO 01/07/2026** — a versão anterior desta seção dizia que SP estava
> zerado e que a API "consolidava tudo no depósito padrão". **Os dois estavam errados.**
> Nova varredura via API (somente leitura, `ListarPosEstoque` filtrando por
> `codigo_local_estoque`) provou que a API devolve saldo **separado por depósito** de
> forma confiável, e que o depósito de SP **já tem produto acabado em estoque**.

- Catálogo: **1.432 produtos** (muitos zerados).
- **A API lê estoque por local.** Passar `codigo_local_estoque` em `ListarPosEstoque`
  devolve o saldo daquele depósito específico. NÃO consolida no padrão (correção da
  conclusão anterior). Provado: mesmos produtos vêm com saldos diferentes por depósito.
- **Fábrica Move (Salvador): 1.009 itens com saldo.** Grande parte é embalagem e
  matéria-prima (copo 200ml = 499.727, cartão de recado = 100.000, sacolas, embalagem
  a vácuo), mais produto acabado. É onde se produz e embala.
- **SÃO PAULO (09): 19 produtos com saldo, todos produto ACABADO e vendável.**
  Pão de queijo grana padano (29), bombom brownie (26), pão fumeiro 340g (23),
  pão frango orgânico 340g (22), brownie 70% (21), mini tortas / coxinhas / quiches /
  pastéis / kits (4 a 19). SP funciona como ponto de distribuição de produto pronto,
  coerente com o papel de expedir Sul/Sudeste.
- ⚠️ **Dado a corrigir no Omie:** `PMUND PASTEL DE BACALHAU 65G` está com saldo **-1**
  (negativo) em SP. Provável venda sem baixa ou ajuste manual. Time Move deve ajustar.
- **Implicação estratégica:** os dois lados já têm o dado necessário (Omie por depósito
  via API + Shopify por localização via API). O único elo que falta é o Omie.Hub
  empurrar o saldo por localização. O split Salvador × SP é **tecnicamente viável** por
  integração própria ou conector de terceiro (ex.: OMS FullComm), independente do Hub.

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
1. **Integração viva = Omie.Hub, usando o app "Omie Shopify"** (set/2025). ✅ **PROVA
   DEFINITIVA (01/07/2026):** acesso ao Hub liberado — tela "Lojas > Editar" (loja
   "Shopify") mostra Chave API Loja Shopify terminada em `e9eb` e Senha API terminada
   em `b243`, batendo exatamente com as credenciais do app **"Omie Shopify"**
   (chave `3fa05824...e9eb`, token `...b243`). Já não é mais inferência por data — é
   confirmação direta.
2. **"Omie Move Gourmet" (ago/2025) é o legado morto** — chave `3c913c1e...01c` e token
   `...01ce` NÃO aparecem em nenhuma configuração do Hub. ✅ Seguro remover, confirmado.
3. **Hub deduz estoque só do depósito PADRÃO (Fábrica Move / Salvador).** Todos os 100
   pedidos Shopify vieram com `codigo_local_estoque: None` → cai no padrão. Ou seja, **o
   Hub não usa a divisão por local ao processar pedidos.** (Atenção: o ERP em si TEM
   divisão por local e SP tem saldo próprio — ver correção na seção "Estoque". O que não
   acontece é o Hub aproveitar essa divisão.)
4. Configuração vista na tela "Editar Loja": ERP = Omie, Categoria ERP = "Venda de Produtos
   Fabricados", Tipo Movimentação Estoque = "2 - Envia a nota fiscal de venda para Omie e
   movimenta estoque", "Atualiza Cliente ERP" ativado. ✅ **VERIFICADO 01/07: não existe
   campo de depósito/local de estoque em lugar nenhum da UI do Hub** — nem na página
   "Editar Loja" (vista até o rodapé), nem na ficha do produto (que carrega um saldo único).

### ⚠️ Blocker real para a divisão Salvador × SP
Pra SP deduzir do depósito SP, é preciso o mapeamento **local Shopify → depósito Omie**.
O acesso ao Hub já foi liberado (01/07), mas a UI **não tem esse campo em lugar nenhum**
(verificado em Editar Loja + ficha do produto). Então o mapeamento depende de: (a) o
suporte Omie habilitar no backend, OU (b) integração própria / conector externo lendo o
Omie por depósito via API (que funciona) e escrevendo no Shopify por localização (que a
API do Shopify aceita). Configuração no Shopify sozinha NÃO divide o estoque no ERP.
Chamado aberto com o suporte Omie (Kim) em 01/07, aguardando resposta.

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
- [x] **Destravar acesso ao painel do Omie.Hub** → liberado 01/07/2026 (suporte Omie)
- [ ] Mapear local Shopify → depósito Omie (Salvador→Fábrica Move, SP→SÃO PAULO).
      ⚠️ **A UI do Hub não tem campo de depósito** (verificado 01/07 em "Editar Loja" e
      na ficha do produto: o produto carrega um saldo único, sem separação por local).
      Depende de o suporte Omie habilitar no backend, ou de integração própria / conector
      externo. Chamado aberto com o suporte (Kim) em 01/07.
- [x] Confirmar com Fernanda/Nat se a loja física (Shopping Barra) tem estoque próprio → **sim, controlado no Linx**
- [x] Conferir saldo do depósito SÃO PAULO (09) → **NÃO está zerado**: 19 produtos acabados com saldo (via API, 01/07). Corrige a premissa anterior.
- [ ] Verificar se a sync do Hub ainda está ativa (último pedido visto: 15/06/2026)
- [ ] Remover app legado "Omie Move Gourmet" (confirmado seguro; não é urgente)
- [ ] Rotacionar credenciais da API Omie expostas no chat (APP_KEY 3323795676201)
