---
tags: [heziom, heziomos, whatsapp, waba, meta, migração, infraestrutura]
status: verificado
criado: 2026-06-22
fonte: "Meta Business Manager — verificação via browser (painel BM + WhatsApp Manager)"
---

# WABA — Ownership, Parceiros e Números

> Verificação feita em 22/06/2026 diretamente no Meta Business Manager da Heziom.
> Objetivo: confirmar que a infraestrutura WhatsApp é propriedade da Heziom e que os BSPs (Unnichat/Flowbiz) são apenas parceiros revogáveis.

---

## 1. Business Manager (proprietário)

| Campo | Valor |
|---|---|
| **Nome** | Editora Heziom |
| **BM ID** | `1195701987492301` |
| **Verificação empresarial** | Verificada |
| **Status** | Ativo |

---

## 2. WABAs dentro do BM

O BM da Heziom possui **6 WABAs**:

| # | WABA | ID | Número | Status | Parceiro (BSP) | Pagamento |
|---|---|---|---|---|---|---|
| 1 | Bianca - Marketing | `302508886272962` | (WhatsApp Business App) | — | Nenhum | — |
| 2 | **Unnichat** | `1140360874094314` | +55 11 94498-6855 | Conectado, Qualidade Alta | **Unnichat** (full control) | MASTERCARD *9094 |
| 3 | **Editora Heziom** | `1879204222622839` | +55 11 93329-5843 | Conectado, Qualidade Alta | **Nenhum** (controle direto) | MASTERCARD *9094 |
| 4 | Heziom | — | — | — | — | — |
| 5 | Test WhatsApp Business Account | — | — | — | — | — |
| 6 | Editora Heziom (antigo) | `371979279340981` | ~~+55 11 94498-6855~~ | **Transferido** | **Gupshup** (full control) | Linha de crédito |

---

## 3. Respostas às perguntas-chave

### O WABA está dentro do BM da Heziom?

**SIM.** Todos os 6 WABAs pertencem ao BM `1195701987492301` (Editora Heziom). A Heziom é a proprietária absoluta da infraestrutura.

### Unnichat e Flowbiz só têm acesso de parceiro?

**SIM.** Nenhum BSP é dono de nada:

| BSP | WABA com acesso | Tipo de acesso | Revogável? |
|---|---|---|---|
| Unnichat | `1140360874094314` | Parceiro com full control delegado | Sim — revogar no BM |
| Gupshup (Flowbiz) | `371979279340981` | Parceiro com full control delegado | Sim — número já transferido |

### Os dois números estão no mesmo WABA?

**NÃO.** Estão em WABAs separados:

| Número | WABA | Parceiro | Phone Number ID |
|---|---|---|---|
| +55 11 94498-6855 | Unnichat (`1140360874094314`) | Unnichat | `762698843599806` |
| +55 11 93329-5843 | Editora Heziom (`1879204222622839`) | Nenhum | `727100090484112` |

---

## 4. Histórico do número principal

O número **+55 11 94498-6855** passou por uma migração entre WABAs:

```
Gupshup WABA (371979279340981)  ──transferido──▶  Unnichat WABA (1140360874094314)
         (Flowbiz)                                      (Unnichat)
```

O WABA antigo da Gupshup agora mostra status "Transferido" — o número não está mais lá.

---

## 5. Implicações para o HeziomOS

### Token e acesso

O **System User Token** foi gerado no nível do **BM** (`1195701987492301`), com permissões:
- `whatsapp_business_messaging`
- `whatsapp_business_management`
- `ads_read`
- `ads_management`

Como ambos os WABAs pertencem ao mesmo BM, o token acessa **os dois números** sem configuração adicional.

### Plano de migração — duas fases (atualizado 27/06/2026)

> ⚠️ O número principal (+55 11 94498-6855) está em atendimento ativo na Unnichat. Não migrar até o HeziomOS estar 100% validado.

#### Fase 1 — Ativar HeziomOS com número de testes (sem risco)

1. **Cadastrar no HeziomOS** o número +55 11 93329-5843 (Phone Number ID `727100090484112`, WABA `1879204222622839`)
2. **Registrar webhook** na Meta para o WABA `1879204222622839` apontando para `crm-meta-wa-webhook`
3. **Testar envio/recebimento** completo via HeziomOS
4. **Validar Instagram DM** e demais integrações
5. Gravar vídeos para solicitação de Advanced Access da Meta

#### Fase 2 — Migrar número principal (após HeziomOS redondo)

1. **Registrar webhook** no WABA da Unnichat (`1140360874094314`, Phone Number ID `762698843599806`) apontando para o HeziomOS
2. **Testar em paralelo** (Unnichat ainda ativo, HeziomOS recebendo cópia)
3. **Revogar acesso de parceiro** da Unnichat no BM → perdem controle imediatamente
4. Os **templates aprovados** continuam no WABA (pertencem ao WABA, não ao parceiro)
5. **Cancelar assinatura** da Unnichat

### Segundo número (+55 11 93329-5843)

Já está sob controle direto da Heziom (sem parceiro). Phone Number ID: **`727100090484112`** (WABA `1879204222622839`). **Este é o número a usar na Fase 1.**

---

## 6. Riscos e atenções

| Risco | Mitigação |
|---|---|
| Revogar parceiro antes de configurar webhook | Configurar HeziomOS primeiro, testar, depois revogar |
| Templates podem ficar no WABA da Unnichat (não no novo) | Verificar via API se templates aparecem no WABA `1140360874094314` com o token |
| Número principal vinculado ao WABA da Unnichat | Após revogar parceiro, o WABA continua da Heziom — sem risco |
| Segundo número em WABA separado | Sem impacto — token acessa ambos |

---

## 7. Referências

- [[Unnichat — Extração Completa (Recipes & Config)]] — fluxos e templates a replicar
- [[Unnichat — Mapeamento Completo v2]] — funcionalidades e checklist de paridade
- [[Meta, Google Ads e WhatsApp — Credenciais]] — passo a passo de credenciais
- [[Flowbiz — Análise e Substituição]] — análise da Flowbiz (BSP anterior)

---

*Verificado em 22/06/2026 via acesso direto ao Meta Business Manager da Heziom.*
