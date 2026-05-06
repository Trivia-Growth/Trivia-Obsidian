### 1. Visão geral do ecossistema

**Nome de trabalho sugerido:** Trívia Hunter (ou plugue dentro do Trívia Studio como uma engine de prospecção).

**Tese:** SMB sem site é prospect quente pra Trívia Studio. Em vez de prospectar manualmente, um pipeline de agentes descobre, qualifica, gera uma demo personalizada como isca de alto valor percebido, e dispara abordagem multicanal. Você só toca em dois pontos: definir alvo e aprovar quais demos geram.

**Princípio arquitetural:** isolamento entre agentes via fila de eventos (não chamada direta). Cada agente é uma Edge Function ou worker independente que consome de uma fila Supabase, processa, e empurra pro próximo estágio. Isso te dá observabilidade, retry, kill switch por estágio, e custo controlado.

### 2. Fluxo macro

![[Pasted image 20260506173948.png]]

### 3. Spec de cada agente

**1. Hunter** — descobre prospects. Input: nicho + região + meta de prospects/dia. Tools: Apify (Google Maps Scraper actor) + validação HTTP (checa se o "site" listado é Instagram, Linktree, Facebook ou genuinamente ausente). Output: registro `prospect` com nome, telefone, endereço, categoria, presença digital atual. LLM: nenhum nessa etapa, só scraping + regex/heurística. Custo dominante é Apify (centavos por prospect). 

**2. Qualifier** — enriquece e prioriza. Input: prospect bruto. Tools: busca extra (Instagram público, Reclame Aqui, Google reviews), LLM leve. Output: score 0-100 + reasoning curto + flags (tem WhatsApp Business, tem Instagram ativo, ticket médio estimado por categoria). LLM sugerido: Haiku 4.5 via OpenRouter. Custo: ~$0.001-0.003 por prospect. Entra em contato e valida se é do interesse a disponibilização de uma LandingPage, qual o ganho esperado em ter esse serviços e que o custo é unico pela disponibilização e caso queira manutenção, ajustes é cobrado por hora.

**3. Gate humano** — sua aprovação. UI: lista filtrada por score, com cards de prospect. Você aprova em massa (checkbox) ou individualmente. Aprovados viram job pro Dev. Rejeitados ficam logados pra calibrar o Qualifier.

**4. Dev** — gera site demo híbrido. Input: prospect aprovado. Tools: template base (3-4 templates por categoria: serviços locais, varejo, restaurante, profissional liberal), LLM gera copy + paleta + estrutura, gerador de imagens (Flux/SDXL via Replicate ou DALL-E) pra hero e seções. Output: bundle do site (HTML/Next.js estático) + assets + metadados. LLM sugerido: Sonnet 4.5 pra copy estruturado. Custo: $0.10-0.30 por site (LLM + imagens). Gera priorizando AEO/GEO e se nao conflitar use tambem SEO

**5. Publisher** — coloca o site no ar. Tools: deploy automático em subdomínio do tipo `nomedaempresa.demo.triviastudio.com.br` (Vercel/Netlify via API ou Cloudflare Pages). Output: URL pública + screenshot da home (pra usar no WhatsApp).

**6. Seller** — primeiro contato. Input: prospect + URL do site demo + screenshot. Tools: Z-API (WhatsApp), Resend ou similar (email). Output: mensagem inicial enviada. Template parametrizado, não LLM em runtime — você aprova os templates uma vez e ele só preenche variáveis. Reduz risco regulatório e custo.

**7. Closer** — conversa autônoma. Input: resposta do prospect. Tools: Sonnet 4.5 com prompt SPIN/BANT (você já tem o playbook), histórico da conversa, FAQ Trívia, calendário pra agendar reunião. Output: respostas, agendamento, qualificação BANT em tempo real. Kill switch por conversa (se score de risco subir, escala).

**8. Handoff** — entrega lead quente. Quando BANT validado e prospect topa reunião, vira deal no seu CRM (Jimmy ou Pipedrive) e notifica você/Julia.

### 4. Schema Supabase (essencial)

sql

```sql
prospects (id, nome, categoria, regiao, telefone, email, 
           website_atual, fonte, raw_data, score, qualifier_reasoning,
           status, created_at)
-- status: discovered, qualified, approved, rejected, 
--         site_generating, site_ready, contacted, in_conversation,
--         handoff, lost

generated_sites (id, prospect_id, template_id, preview_url, 
                 assets_url, copy_data, generation_cost, status)

conversations (id, prospect_id, channel, started_at, last_message_at,
               bant_score, status, kill_switch_active)

messages (id, conversation_id, direction, content, llm_model, 
          tokens_in, tokens_out, cost, created_at)

agent_executions (id, agent_name, prospect_id, started_at, finished_at,
                  status, cost, error, tokens_used)

deals (id, prospect_id, stage, value_estimate, owner, notes)

approvals (id, prospect_id, decided_by, decision, decided_at)
```

Status do prospect é a máquina de estados que conecta tudo.

### 5. Dashboard de analytics (a única tela que você opera)

Três abas:

**Funil** — gráfico de conversão por estágio (descoberto → qualificado → aprovado → site gerado → contatado → respondendo → handoff). Identifica gargalos.

**Aprovação** — fila de prospects qualificados aguardando seu OK. Score, reasoning, link do Instagram pra validar rápido. Aprovação em lote.

**Operações** — custo por lead handoff (LLM + Apify + imagens), agentes ativos, erros recentes, kill switch global, kill switch por agente. Top 10 conversas em andamento com BANT score.

### 6. Riscos e decisões pendentes

**LGPD em prospect frio.** Mensagem inicial precisa ter opt-out claro, base legal de legítimo interesse documentada, e respeito imediato a "pare". Recomendo registrar todo "pare" em blocklist permanente.

**TOS do WhatsApp.** Z-API funciona, mas envio massivo em conta nova queima rápido. Estratégia: aquecimento progressivo (10/dia → 30 → 100 ao longo de 4 semanas), múltiplos números, conteúdo variado (não copy-paste idêntico). Considere WhatsApp Business API oficial (Meta) pra volume — mais caro mas durável.

**Site demo como ativo.** Decisão importante: o site demo fica no seu subdomínio sempre, ou se o cliente fechar você migra pra domínio dele? Sugiro: subdomínio Trívia até fechar; se fecha, migra como parte do pacote (gancho de venda).

**Posicionamento da mensagem.** "Olha o site que fiz pra você, sem você pedir" pode soar invasivo. Alternativa: "Trabalhamos com SMBs do seu segmento. Montei uma demo do que faríamos pra [nome empresa]. Quer dar uma olhada?". Tom de portfólio, não de cobrança.

**Calibragem do Qualifier.** Primeiras 200-300 aprovações/rejeições viram dataset pra ajustar o prompt do Qualifier. Esse loop fechado é o que diferencia um sistema vivo de um spam-bot.