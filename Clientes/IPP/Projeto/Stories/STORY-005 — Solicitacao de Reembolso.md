---
id: STORY-005
titulo: "Solicitação de Reembolso (câmera/upload)"
fase: 1
modulo: solicitacao
status: em-review
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-005 — Solicitação de Reembolso (câmera/upload)

## Contexto

O coração do produto. O líder abre uma solicitação de reembolso pelo celular, com um ou mais itens (cada nota/cupom), anexando o comprovante **pela câmera ou upload**. **Sem comprovante não dá pra enviar** — o financeiro precisa do documento para analisar.

## Spec de Referência

- [[Arquitetura e Fluxos]] (seção "Comprovante obrigatório")

## Critérios de Aceite

- [x] Criar solicitação em `rascunho`: departamento, descrição, itens (descrição, valor, data) e dados de recebimento (PIX)
- [x] Cada item exige **comprovante** — captura por **câmera** (`capture="environment"`) **ou** upload (foto/PDF)
- [x] Imagem comprimida no cliente antes do upload (`lib/image`)
- [x] Comprovantes em **bucket privado** `comprovantes`; caminho `departamento/solicitacao/item`
- [x] **Trava no app:** botão "enviar" só habilita com ≥1 item, cada item com anexo
- [x] **Trava no servidor:** RPC `enviar_solicitacao` recusa `rascunho → enviada` se faltar comprovante (à prova de burla)
- [x] `valor_total` recalculado no backend por trigger a partir dos itens
- [x] Solicitante acompanha o status das suas solicitações (`/solicitacoes`)
- [x] RLS + FORCE; líder só acessa as dos seus departamentos
- [x] Visualização de comprovante via **URL assinada** (Storage RLS gateia o acesso)

## Implementação

**Commit:** `c7ce374` · **Migration:** `supabase/migrations/20260610150000_solicitacoes.sql`.

- **Decisão:** transição via **RPC SECURITY DEFINER** (não Edge Function) — a UPDATE policy trava o status em `rascunho`, então só o RPC avança. Acesso aos comprovantes via **Storage RLS** (createSignedUrl client-side, gateado). Edge Functions ficam para integrações externas (Resend/Prover). *(atualiza ADR-002)*
- Frontend: `features/solicitacoes` (nova solicitação, itens, `item-comprovante` com câmera/upload, lista) + `lib/image` (compressão).

## Segurança 🔒 — verificação

- [x] Enviar sem comprovante → erro "Todo item precisa de comprovante" (servidor)
- [x] Botão Enviar desabilitado no app até todos os itens terem anexo
- [x] Item não editável após `enviada`; cliente não muda status direto (RLS with-check)
- [x] Storage: upload só no path do dono/rascunho; **outro usuário recebe 404** ao tentar URL assinada
- [x] RLS+FORCE nas duas tabelas; `valor_total` calculado no backend
> Testado com usuários de teste (líder/outro, nomes neutros) e removidos; bucket limpo.

## Dependências

STORY-002, STORY-003. Habilita 006, 009.
