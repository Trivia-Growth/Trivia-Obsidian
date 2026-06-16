# Estrutura de Preços — Leandro Solla

> Rascunho interno. **Valores são referências de mercado (BR, 2026) — validar com o custo/margem da Trívia antes de enviar.**
> Plano em [[01 - Plano e Escopo do Projeto]] · Contexto em [[00 - Contexto e Diagnóstico]].

---

## Princípios de precificação

1. **3 componentes separados sempre:**
   - **Setup** (one-time) — entregas pontuais (site, LP, sistema).
   - **Retainer** (mensal) — gestão recorrente (tráfego, conteúdo, IA, manutenção).
   - **Verba de mídia** (mensal) — paga direto pelo cliente, **não é receita da Trívia**. Deixar isso explícito evita o cliente achar que o fee "inclui" o anúncio.
2. **Reduzir atrito de entrada.** Leandro está inseguro, sem parâmetro, e acabou de perder pacientes ("mexeu com a planilha"). Entrada cara espanta. Melhor começar leve e escalar com prova.
3. **Ancorar no ROI dele.** Ticket = R$ 1.800/mês/paciente, terapia dura meses/anos (LTV alto). **1 a 2 pacientes novos já pagam o fee inteiro.** Esse é o argumento de venda.
4. **Vender ecossistema, faturar por fase.** Mostra o mapa completo, contrata Fase 0+1.

---

## MODELO RECOMENDADO — "Escalonado / como serviço"

Menos entrada, mais recorrência. Ideal para o perfil inseguro do Leandro e melhor para a Trívia (receita previsível + lock-in). O desenvolvimento dos sistemas é diluído no mensal em vez de cobrado tudo de uma vez.

### Fase 0 — Mapeamento & Estratégia
| Item | Valor ref. |
|------|-----------|
| Diagnóstico, marca/posicionamento, públicos, plano de mídia | **R$ 1.500** (ou cortesia/abatido na Fase 1 como gancho de fechamento) |

> Recomendação: oferecer como **abatível** na Fase 1 — tira a barreira do "primeiro sim".

### Fase 1 — Fundação de Aquisição
| Item | Tipo | Valor ref. |
|------|------|-----------|
| Site institucional + 1 LP (exterior) + setup tráfego (pixel/GA4) | Setup | **R$ 4.000 – 6.000** |
| Gestão de tráfego + conteúdo/feed + otimização | Retainer | **R$ 2.500 – 3.500/mês** |
| Verba de mídia (à parte, paga pelo cliente) | Mídia | **R$ 1.500 – 3.000/mês** (sugerido inicial) |

**Ponto de entrada típico:** ~R$ 5.000 setup + R$ 3.000/mês. ROI: ~2 pacientes/mês cobre tudo.

### Fase 2 — Conversão (Agente IA + CRM)
| Item | Tipo | Valor ref. |
|------|------|-----------|
| Agente IA de pré-atendimento (WhatsApp) + CRM/funil (React+Supabase) | Setup | **R$ 8.000 – 15.000** (ou diluído: +R$ 1.500/mês por 12 meses) |
| Manutenção IA + CRM + infra | Retainer add. | **+R$ 800 – 1.500/mês** |

### Fase 3 — Operação Clínica (prontuário + transcrição + mensagens)
| Item | Tipo | Valor ref. |
|------|------|-----------|
| Prontuário digital + transcrição Meet + rotina de mensagens terapêuticas | Setup | **R$ 10.000 – 20.000** (ou diluído no mensal) |
| Infra + manutenção (inclui custo de IA/transcrição) | Retainer add. | **+R$ 500 – 1.500/mês** |

> ⭐ Aqui está o item que ele mais amou (mensagens terapêuticas) — alto valor percebido, bom para justificar o ticket desta fase.

### Fase 4 — Inteligência & Escala
| Item | Tipo | Valor ref. |
|------|------|-----------|
| Dashboard unificado + alertas de churn | Setup | **R$ 5.000 – 10.000** |
| LP clínica local + setup Google Ads | Setup | **R$ 2.000 – 4.000** |
| Gestão de escala (mais campanhas/canais) | Retainer | ajustar conforme verba |

---

## MODELO ALTERNATIVO — "Projeto fechado" (se ele preferir CAPEX)

Para quem quer pagar o desenvolvimento de uma vez e ter mensal menor. Útil se ele tiver caixa e quiser "ser dono" do sistema.

| Fase | Setup (one-time) | Retainer |
|------|------------------|----------|
| 1 | R$ 5.000 | R$ 3.000/mês |
| 2 | R$ 12.000 | +R$ 1.000/mês |
| 3 | R$ 18.000 | +R$ 1.000/mês |
| 4 | R$ 12.000 | a definir |

---

## Resumo executivo para a proposta (sugestão do que enviar)

**Começamos pela Fase 1**, com o mapa completo apresentado:

> - **Implantação (setup único):** a partir de **R$ 5.000** — site institucional + LP + estrutura de tráfego.
> - **Mensalidade de gestão:** a partir de **R$ 3.000/mês** — tráfego, conteúdo e otimização.
> - **Verba de anúncios:** à parte, a partir de **R$ 1.500/mês** (você define e paga direto às plataformas).
> - **Mapeamento estratégico:** incluído ao fechar.

Conforme os resultados, avançamos para IA + CRM (Fase 2) e o sistema clínico completo (Fase 3).

---

## Argumentos de venda (para a conversa)

- **ROI direto:** "1 a 2 pacientes novos por mês já cobrem o investimento — e paciente de terapia fica meses."
- **Não é gasto, é máquina:** sai de 100% indicação (frágil) para aquisição previsível.
- **O que segura o paciente:** o sistema (CRM + follow-up) ataca o "esfriamento" que te preocupou.
- **Feito do jeito certo:** compliance LGPD/CFP — não é qualquer social media.

---

## ⚠️ Validar antes de enviar (decisões do JG)

- [ ] Confirmar **seu fee real** de gestão de tráfego (o retainer base).
- [ ] Modelo preferido: **escalonado/como serviço** (recomendado) × **projeto fechado**.
- [ ] Cobrar a Fase 0 ou oferecer abatível/cortesia?
- [ ] Faixa de verba de mídia a sugerir (depende da meta de pacientes/mês — pergunta aberta).
- [ ] Se vai parcelar o desenvolvimento das Fases 2/3 no mensal ou cobrar setup cheio.
