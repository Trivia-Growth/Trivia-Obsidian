---
id: STORY-013
titulo: "MVP 5B — E-mail, Clusterização e Logs do Flow Builder"
modulo: "Flow Builder"
status: "backlog"
fase: 5
prioridade: 2
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-013 — MVP 5B: E-mail + Clusterização + Logs

## Contexto

Segunda metade do Flow Builder. Depende da STORY-012 concluída.
Adiciona integração Resend, clusters customizáveis, gatilhos avançados e log de execução visual.

## O que fazer

### Edge Function — send-email (nova ou refatorar existente)
- [ ] Wrapper Resend para e-mails do Flow Builder
- [ ] Suporte a variáveis dinâmicas: {{nome}}, {{empresa}}, {{vendedor}}, {{produto}}, {{link_agendamento}}
- [ ] Tracking de abertura via pixel 1x1 (Resend nativo)
- [ ] Tracking de cliques via Resend link wrapping
- [ ] Registrar resultado (enviado/aberto/clicado) em `flow_execution_log`

### Frontend — Templates de E-mail
- [ ] Editor rich text (Tiptap ou Quill) para templates
- [ ] Preview desktop/mobile lado a lado
- [ ] Variáveis: inserir via botão com lista de variáveis disponíveis
- [ ] CRUD de templates em Settings > E-mail
- [ ] Domínio customizado: configuração guiada SPF/DKIM com instruções step-by-step

### Frontend — Clusterização
- [ ] Settings > Clusterização: CRUD de clusters customizáveis
- [ ] Cluster = combinação de: ICP tier + segmento + fase da jornada + produto
- [ ] No canvas do Flow Builder: bloco Condição "Cluster de perfil" → seleciona cluster salvo
- [ ] Painel de clusters: quantos contatos em cada cluster (contador em tempo real)

### Frontend — Gatilhos Adicionais no Canvas
- [ ] "Score de lead atingiu X" → configurar threshold
- [ ] "Deal parado há X dias" → configurar dias por stage
- [ ] "Data relativa ao contrato" → X dias antes/depois de start_date/end_date de contact_products
- [ ] "NPS/CSAT recebido" → filtrar por nota ≤ X
- [ ] "Formulário Jimmy Studio" → via inbound_webhooks

### Frontend — Log de Execução
- [ ] Página de log por fluxo: tabela com enrollment_id, contato, nó atual, status, data
- [ ] Métricas por nó: quantos passaram, quantos converteram, taxa de saída
- [ ] Simulação de fluxo: "Se o lead fosse [João Silva], seguiria este caminho..."
- [ ] Filtros: status (ativo/completo/saiu), período, contato específico

### Frontend — Opt-out
- [ ] Lista de descadastro global por workspace (WhatsApp + e-mail separados)
- [ ] Import via CSV
- [ ] Ao processar enrollment: verificar opt-out antes de executar ação de envio

## Critérios de Aceite

- [ ] E-mail enviado via Resend com variáveis substituídas corretamente
- [ ] Abertura e clique registrados no log do fluxo
- [ ] Cluster criado no admin aparece como opção no canvas
- [ ] Gatilho "Score atingiu X" dispara quando lead-scorer atualiza o contato
- [ ] Log de execução mostra progresso real por contato
- [ ] Opt-out respeitado em todos os envios (WhatsApp e e-mail)
- [ ] `npm run build` sem erros
