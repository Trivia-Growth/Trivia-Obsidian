# Comparativo de Provedores de API Fiscal — Contabilia

*Deep research realizada em 01/06/2026. 109 agentes, 26 fontes, 90 alegações extraídas, 25 verificadas adversarialmente, 19 confirmadas, 6 refutadas. Contexto: provider pra plataforma SaaS office-led que emite notas em nome dos clientes finais de escritórios contábeis.*

---

## TL;DR

1. **Focus NFe → recomendado como principal**: CNPJ ilimitado em todos os planos, ~3.000 municípios, RT/IBS-CBS já implementada com campos documentados, marco 01/04/2026 mapeado.
2. **nfe.io → Plano B forte**: SDK Node.js oficial v3.2.0 ativamente mantido, webhooks HMAC-SHA256, sandbox, preço de entrada baixo. Status RT não confirmado em claim sobrevivente — perguntar.
3. **eNotas → incompatível**: 1 CNPJ por assinatura, inviabiliza office-led.
4. **PlugNotas, WebmaniaBR, Tecnospeed → inconclusivos**: claims não sobreviveram à verificação. Tecnospeed historicamente é o provedor de softwarehouses contábeis no BR — vale 2ª rodada antes de descartar.

---

## Tabela comparativa

| Provider | CNPJ multi | NFS-e cobertura | Preço base | Excedente | RT/IBS-CBS | SDK Node | Veredito |
|---|---|---|---|---|---|---|---|
| **Focus NFe** | ✅ Ilimitado todos planos | ~3.000 mun. (declarado) + R$199 por novo município em até 15 dias | R$548/mês (4.000 notas) | R$0,12/nota | ✅ Implementado, campos documentados, marco 01/04/2026 | Não oficial | 🏆 **Principal** |
| **nfe.io** | ✅ Ilimitado (exceto Inicial anual com até 2 CNPJs) | Não enfatizado publicamente | R$190 (250) / R$265 (500) / R$375 (1.000) | ⚠️ Não publicado | ⚠️ Aviso na doc, claim não sobreviveu | ✅ v3.2.0 (abr/2026), HMAC-SHA256, sandbox | 🥈 **Plano B** |
| **eNotas** | ❌ 1 CNPJ por assinatura | "500+" (refutado 1-2) | "R$137-R$347" (refutado 0-3) | — | — | — | ❌ **Incompatível** com office-led |
| **PlugNotas** | ? | "1.600" (refutado 1-2) | ? | ? | ? | ? | ⏳ Inconclusivo |
| **Tecnospeed** | ? | ? | ? | ? | ✅ Roadmap publicado | ? | ⏳ Inconclusivo — vale 2ª rodada |
| **WebmaniaBR** | ? | ? | ? | ? | ? | ? | ⏳ Inconclusivo |

---

## Fichas dos finalistas

### 🏆 Focus NFe — Principal

**Documentos suportados (confirmado, voto 3-0):**
NF-e (mod. 55), NFC-e (mod. 65), NFS-e municipal, NFS-e Nacional, CT-e (mod. 57), CT-e OS (mod. 67), MDF-e, NFCom, DCe. Recepção (não emissão) limitada a NF-e, CT-e e NFS-e Nacional. BP-e não suportado.

**Cobertura municipal (confirmado, voto 2-1):**
~3.000 municípios declarados (~54% dos 5.570 do Brasil). Garantia de integração de novo município por R$199 fixo em até 15 dias corridos. **Caveat:** número autodeclarado, inclui municípios atendidos via NFS-e Nacional/ABRASF (não 3.000 integrações individuais). Validar com lista real dos clientes-piloto.

**Preços (confirmado, voto 3-0):**
- Growth: R$548/mês, pacote de 4.000 notas, R$0,12 por nota adicional, CNPJs ilimitados
- Enterprise: sob medida para >50.000 notas/mês, CNPJs ilimitados, **sem taxa de setup**

**RT/IBS-CBS (confirmado, voto 3-0):**
Implementação documentada para NF-e, NFC-e, CT-e, CT-e OS, NFS-e Nacional e NFCom. Campos específicos expostos: `ibs_cbs_situacao_tributaria`, `ibs_cbs_classificacao_tributaria`, `cbs_aliquota`, `cbs_valor`, `ibs_uf_aliquota`, `ibs_mun_aliquota` etc. Referência explícita ao Ato Conjunto RFB/CGIBS Nº 1/2025 e ao marco 01/04/2026.

**Forças:**
- Modelo comercial perfeito pra office-led (volume agregado, sem setup)
- Maior cobertura declarada
- Posicionamento explícito em Reforma Tributária
- Política de "sem taxa de setup" formalizada

**Fraquezas / atenção:**
- Sem SDK Node.js oficial — consumo via HTTP direto (não bloqueante, mas é fricção)
- Cobertura de 3.000 é autodeclarada
- Há reclamação registrada no Reclame Aqui sobre demora de suporte em integração crítica (validar reputação em call)

**Fontes:**
- https://focusnfe.com.br/precos/
- https://focusnfe.com.br/guides/reforma-tributaria/
- https://focusnfe.com.br/blog/cidades-integradas-nfse/
- https://doc.focusnfe.com.br/llms.txt
- https://campos.focusnfe.com.br/nfse_nacional/EmissaoDPSXml.html

---

### 🥈 nfe.io — Plano B

**Documentos suportados:**
NFS-e, NF-e (mod. 55), NFC-e (mod. 65), CFe-SAT (consulta), CT-e (consulta via Distribuição DFe). Não emite NFCom, MDF-e, BP-e.

**Preços públicos (confirmado, voto 3-0):**
- Inicial (só anual): R$1.075/ano, 100 notas/mês, até 2 CNPJs
- Base: R$190/mês, 250 notas, CNPJs ilimitados
- Crescimento: R$265/mês, 500 notas, CNPJs ilimitados
- Escala: R$375/mês, 1.000 notas, CNPJs ilimitados
- Enterprise sob medida

**SDK Node.js (confirmado, voto 3-0):**
v3.2.0 publicada em 26/04/2026. Cadência ativa: 5 releases em 3 meses no início de 2026. Cobre NF-e (emissão, cancelamento, CC-e, inutilização), emissão de NFS-e, consulta CFe-SAT, consulta CT-e via Distribuição DFe.

**Webhooks (confirmado, voto 3-0):**
HMAC-SHA256 com `crypto.timingSafeEqual` (timing-safe). Eventos: `invoice.issued`, `invoice.cancelled`, `invoice.failed`, `invoice.processing`, `company.created`, `company.updated`, `company.deleted`. Ambientes: production, sandbox, development.

**Forças:**
- SDK Node.js maduro + sandbox documentado = DX excelente pra stack Next.js
- Preço de entrada ~3x mais barato que Focus (R$190 vs R$548)
- CNPJ ilimitado na maioria dos planos
- Webhook signature pronta (segurança built-in)

**Fraquezas / atenção:**
- Cobertura municipal NFS-e não enfatizada publicamente — pode ser limitação
- Preço por nota excedente não publicado
- Status RT/IBS-CBS aparece como aviso na doc, mas claim de implementação completa não sobreviveu à verificação — precisa confirmar
- Cobertura de documentos menor (sem NFCom, MDF-e)

**Fontes:**
- https://nfe.io/precos/emissao-nfse/
- https://github.com/nfe/client-nodejs
- https://registry.npmjs.org/nfe-io

---

## Eliminado

### ❌ eNotas — incompatível com office-led

"Cada assinatura atende um único CNPJ" — verbatim do site oficial. Para 30-200 clientes finais por escritório = 30-200 assinaturas separadas. Inviabiliza pricing por volume agregado. Existe menção a "condições comerciais customizadas" mas não é o produto público.

Fonte: https://enotass.com.br/notas

---

## Inconclusivos (não descartar sem 2ª rodada)

### ⏳ Tecnospeed

**Por que vale 2ª rodada:** historicamente é o provedor de software houses contábeis no Brasil. É estranho não ter chegado ao shortlist — provavelmente reflete ausência de evidência pública verificável, não ausência de qualidade. Tem roadmap RT publicado.

### ⏳ PlugNotas

Alegação de cobertura de 1.600 cidades foi refutada (voto 1-2) — não significa que seja falsa, mas as fontes coletadas eram fracas. Modelo de cobrança e cobertura real precisam ser confirmados.

### ⏳ WebmaniaBR

Sem claims sobreviventes nesta rodada. Sem evidência pública robusta nas buscas.

**Sugestão:** se a decisão entre Focus e nfe.io demorar, vale uma 2ª rodada de pesquisa focada nesses três antes da call comercial.

---

## Marco regulatório: 01/04/2026 (eliminatório)

Confirmado por múltiplas fontes oficiais (Focus, gov.br/receitafederal, CGIBS, Migalhas, Fenacon):

- A partir de 01/04/2026, Receita Federal e Comitê Gestor IBS **validam ativamente** os campos IBS/CBS nos documentos fiscais
- Durante 2026 a apuração é **informativa** (sem recolhimento), com alíquotas teste: **CBS 0,9% + IBS 0,1%**
- Receita Federal suspendeu até 01/04/2026 multas por nota emitida sem IBS e CBS
- Após 01/04/2026, nota sem campos IBS/CBS = rejeição na validação

**Implicação:** provider sem RT implementada antes de abr/2026 = operação do cliente trava. Critério eliminatório.

---

## Sistema Nacional NFS-e (gov.br/nfse) — contexto

Confirmado (voto 3-0): APIs em produção desde 01/10/2025, autenticação ICP-Brasil mTLS, padronizam emissão/consulta/parâmetros municipais.

**Impacto:** cobertura municipal dos providers cresce estruturalmente conforme municípios migram para o padrão Nacional. Risco de cobertura municipal cai no médio prazo.

---

## Perguntas pra call comercial

### Focus NFe
1. Lista real (CSV) dos ~3.000 municípios atendidos — comparar com cidades dos clientes-piloto da C Brasil
2. SLA contratual (% uptime, RTO) e status page de incidentes 2025-2026
3. Implementação dos campos IBS/CBS está em produção ou homologação? Tenho acesso a homologação intensiva em março/2026?
4. Modelo de cobrança quando 1 escritório implanta pra 100 clientes finais: cobra do escritório (uma conta) ou cada cliente final precisa de conta própria?
5. Webhooks: lista completa de eventos + política de retry + assinatura
6. Reputação no Reclame Aqui: há histórico de demora de suporte em integrações críticas?

### nfe.io
1. Preço por nota excedente nos planos Base, Crescimento, Escala
2. Status real da implementação RT/IBS-CBS — quais documentos já têm campos? Há sandbox específico pra RT?
3. Cobertura municipal NFS-e — quantos e qual o processo pra novo município? Custo?
4. Plano Enterprise: preço/condição para volume acima de 1.000 notas/mês
5. SLA contratual e status page
6. SDKs além de Node.js (se a stack mudar)

### Tecnospeed (se incluir)
1. Modelo multi-CNPJ pro caso office-led
2. Preços (não são públicos)
3. Programa de parceria pra software houses

---

## Caveats importantes

1. **Cobertura municipal é sempre autodeclarada e historicamente inflada em marketing.** Os 3.000 da Focus sobreviveram com voto 2-1; os de PlugNotas e eNotas foram refutados.
2. **Preços têm validade temporal** — confirmar valores em call antes de contrato.
3. **Implementação RT é declaração do próprio provider** — só será validada de verdade após 01/04/2026. Rodar emissões intensivas em homologação em março/2026.
4. **SLA contratual, status page, reputação Reclame Aqui** não foram avaliados — críticos pra entrar nas calls.
5. **Tecnospeed/PlugNotas/WebmaniaBR podem ser viáveis** — claims fracas não significam produto ruim.

---

## Histórico

- **Data da pesquisa:** 01/06/2026
- **Metodologia:** deep-research workflow (Claude Agent SDK) — fan-out de buscas em 6 ângulos, fetch de 26 fontes, extração de 90 claims, verificação adversarial 3-vote em 25 claims, 19 confirmadas e 6 refutadas, síntese final
- **Stats:** 109 agentes, 6 ângulos, 25 claims verificadas, 6 refutadas
- **Próximo passo:** calls comerciais com Focus NFe e nfe.io; pesquisa adicional sobre Tecnospeed antes de descartar
