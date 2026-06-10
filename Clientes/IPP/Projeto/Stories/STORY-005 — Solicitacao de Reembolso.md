---
id: STORY-005
titulo: "Solicitação de Reembolso (câmera/upload)"
fase: 1
modulo: solicitacao
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-005 — Solicitação de Reembolso (câmera/upload)

## Contexto

O coração do produto. O líder abre uma solicitação de reembolso pelo celular, com um ou mais itens (cada nota/cupom), anexando o comprovante **pela câmera ou upload**. **Sem comprovante não dá pra enviar** — o financeiro precisa do documento para analisar.

## Spec de Referência

- [[Arquitetura e Fluxos]] (seção "Comprovante obrigatório")

## Critérios de Aceite

- [ ] Criar solicitação em `rascunho`: departamento, descrição, itens (descrição, valor, data) e dados de recebimento (PIX/conta)
- [ ] Cada item exige **comprovante** — captura por **câmera do celular** (`capture="environment"`) **ou** upload (foto/PDF)
- [ ] Imagem comprimida no cliente antes do upload
- [ ] Comprovantes em **bucket privado** do Storage; caminho por departamento/solicitação
- [ ] **Trava no app:** botão "enviar" só habilita com ≥1 item, cada item com anexo
- [ ] **Trava no servidor:** Edge Function `submit-solicitacao` recusa `rascunho → enviada` se faltar comprovante (à prova de burla)
- [ ] `valor_total` calculado no backend a partir dos itens
- [ ] Solicitante acompanha o status das suas solicitações
- [ ] RLS + FORCE em `solicitacoes` e `solicitacao_itens`; líder só acessa as dos seus departamentos
- [ ] Visualização de comprovante via **URL assinada** gerada no backend

## Segurança 🔒

PII (comprovantes, dados bancários), Storage e nova Edge Function → **security-gate obrigatório**. Bucket privado, policy por departamento, sem comprovante público.

## Dependências

STORY-002, STORY-003. Habilita 006, 009.
