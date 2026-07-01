---
tags: [heziom, sales-hzm, pendências, operacional]
status: aberto
criado: 2026-06-15
atualizado: 2026-06-15
---

# Pendências JG — Operacional (Sales-Hzm)

> Ações que **dependem do JG** (acessos, painéis externos, decisões) e destravam ou
> completam entregas já feitas no código. O agente não consegue fazer sozinho.
> Marcar `[x]` ao concluir.

---

## 🔴 Agora / segurança

- [ ] **Revogar o Personal Access Token do Supabase** `sbp_bd50…` (painel → Account → Access Tokens). Foi usado na rodada das STORY-019/020 e já não é necessário. *Boa prática: revogar assim que a rodada termina.*
- [ ] **Trocar a API key do Resend** quando for para a conta/domínio definitivos. A atual (`re_H3K…`, conta de teste `joaonovais@triviastudio.com.br`) passou pelo chat → tratar como descartável. Onde fica: Supabase → Project Settings → Edge Functions → Secrets → `RESEND_API_KEY`. *Trocar a key não exige mexer no código.*

---

## 🟠 Para ligar o envio de verdade

- [ ] **Verificar o domínio `editoraheziom.com.br` no Resend** (registros DNS). Hoje o remetente é o sandbox `onboarding@resend.dev`, que **só entrega para o e-mail da conta Resend**. Com o domínio verificado, dá pra enviar para a lista toda. Depois é só trocar o secret `RESEND_FROM` para `Heziom <algo@editoraheziom.com.br>` — nada de código muda.
- [ ] **Ativar a webhook de carrinho abandonado da Tray** (quando formos para a Fatia 2 do carrinho abandonado) — apontar a URL de notificação no painel de parceiro da Tray. *Pré-requisito da régua de maior receita.*

---

## 🟡 Réguas e campanhas (STORY-019 / STORY-020)

- [ ] **Ativar as 4 réguas** em `/flows` (menu Marketing → Réguas) quando quiser que comecem a disparar. Elas nascem como **rascunho** (nada é enviado enquanto isso). Revisar os textos antes de ativar.
- [ ] **Criar os cupons no Tray:** `NEWSLETTER10` (boas-vindas, 10%), `VIP15` (VIP, 15%), `ANIVER` (aniversário), `EBDC` e `GENERO` (recompra). Os e-mails das réguas já citam esses cupons, mas o desconto só vale quando existirem no Tray. *(STORY-020 CA8.)*

---

## 🔗 Relacionados
- [[STORY-019 — Campanhas em massa]]
- [[STORY-020 — Réguas de relacionamento]]
- [[Flowbiz — Automações e Fluxos Mapeados]]
