# Relatório Verificado — APIs e Integrações para Escritórios Contábeis (Complemento)

**Data da verificação:** 2026-05-07
**Objetivo:** Validar e corrigir informações do relatório complementar anexado, confirmando o que é real e atual.

---

## Status de Cada Afirmação — Resumo

| Item | Status | Confiança |
|------|--------|-----------|
| Integra Contador (Serpro) — APIs REST oficiais | **CONFIRMADO** | Alta |
| APIs DCTFWeb (MIT, DARF, Encerramento) | **CONFIRMADO** (exceto "Importação JSON" e data exata "abril 2025") | Média-Alta |
| JUCESP APIs oficiais (Prodesp) | **CONFIRMADO** | Alta |
| Integra-Redesim / PNRCONTADOR | **CONFIRMADO** | Alta |
| MAT — vigente desde dez/2025 | **CONFIRMADO** | Alta |
| Resolução CGSN 183/2025 — MAED | **PARCIALMENTE CONFIRMADO** (ver correções) | Média |
| SIEG IriS, e-Auditoria, Acellerador Contábil | **CONFIRMADO** | Alta |
| Contmatic integra nativamente com Integra-PGDAS-D | **NÃO CONFIRMADO** | Baixa |
| PPI São Paulo prorrogado para 2026 | **NÃO CONFIRMADO** (PPI 2024 existiu com 95% desconto; prorrogação para 2026 sem evidência) | Média |
| Fim do e-CAC | **NÃO CONFIRMADO** (e-CAC continua ativo; há modernização gradual, não descontinuação) | Alta |

---

## 1. Integra Contador (Serpro) — CONFIRMADO

A plataforma é real, ativa e bem documentada.

**URL:** `apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador`

**Tipo:** REST API com autenticação via certificado digital e-CNPJ

### Módulos confirmados na documentação oficial:

| Módulo | Operações disponíveis |
|---|---|
| **Integra-CaixaPostal** | Leitura programática do DTE (Domicílio Tributário Eletrônico) |
| **Integra-Sitfis** | Emissão automatizada de relatórios de Situação Fiscal |
| **Integra-Sicalc** | Cálculo de DARF com atualização monetária e juros |
| **Integra-SN** | PGDAS-D, DEFIS, Regime de Apuração |
| **Integra-Parcelamento** | PARCSN, PARCSN-ESP, PERTSN, RELPSN, PARCMEI, PARCMEI-ESP, PERTMEI, RELPMEI |
| **Integra-DCTFWeb** | DCTFWEB + MIT (detalhado abaixo) |
| **Integra-Redesim** | PNRCONTADOR (detalhado abaixo) |
| **Integra-MEI** | Módulo específico para MEI (não citado no relatório original) |
| **Integra-Procurações** | Consulta de procurações eletrônicas vigentes |
| **Integra-Pagamento** | Módulo de pagamento (não citado no relatório original) |
| **Integra-eProcesso** | Consulta de processos eletrônicos (não citado no relatório original) |
| **Integra-Contador-Gerenciador** | Gerenciamento centralizado (não citado no relatório original) |

### Módulos adicionais NÃO mencionados no relatório complementar:
- Integra-MEI
- Integra-Pagamento
- Integra-eProcesso
- Integra-Contador-Gerenciador

**Credenciais:** Obtidas na Loja Serpro (loja.serpro.gov.br) — preços não confirmados (site com timeout durante a verificação).

---

## 2. APIs DCTFWeb — CONFIRMADO (com ressalvas)

### Operações confirmadas na documentação Serpro:

**Módulo DCTFWEB:**
- Gerar Documento de Arrecadação (= Emissão de DARF) ✓
- Consultar Recibo ✓
- Consultar Relatório ✓
- Consultar XML ✓
- Transmitir Declaração ✓
- Gerar DARF para Declaração em Andamento ✓

**Módulo MIT:**
- Encerrar Apuração ✓
- Consultar Situação Encerramento ✓
- Consultar Apuração (por ano/mês) ✓

### Correções:
- **"Importação JSON"**: NÃO encontrado como endpoint nomeado. Pode referir-se ao fato de que a API REST aceita payloads JSON (natural), mas não é um serviço específico documentado.
- **Data "abril 2025"**: Não foi possível confirmar notícia específica da Receita Federal nessa data sobre "novas APIs DCTFWeb". As APIs já constam na documentação Serpro sem data de lançamento visível. Existe live sobre "nova Caixa Postal" em 23/04/2025, mas não sobre DCTFWeb especificamente.

---

## 3. JUCESP APIs (Prodesp) — CONFIRMADO

O catálogo é real e acessível em `integrador.sp.gov.br/wps/portal/integrador/catalogoApis`.

### APIs JUCESP confirmadas:

| API | Função |
|---|---|
| **JUCESP - Redesim** | Envio de solicitações empresariais |
| **JUCESP - Empresas por ID** | Pesquisa por identificador |
| **JUCESP - Registros** | Gravação de dados de registro empresarial |
| **JUCESP - GCE** | Gravação no banco de dados JUCESP |
| **JUCESP - E2DOC** | Gravação de imagens |
| **JUCESP - Viabilidades** | Consultas de viabilidade |
| **JUCESP - Risco Prévio** | Verificações de risco |
| **JUCESP - Atos, Cargos, CNAEs, Balcão Único** | Dados cadastrais |

### Nota importante:
Essas APIs estão classificadas como "APIs para governo" no portal Prodesp. O acesso para escritórios privados provavelmente exige convênio/credenciamento. Recomenda-se consulta formal à Prodesp para confirmar elegibilidade.

---

## 4. Integra-Redesim / PNRCONTADOR — CONFIRMADO

### Operações confirmadas:

| Operação | Status |
|---|---|
| Consultar Vínculos | ✓ Confirmado |
| Solicitar Renúncia | ✓ Confirmado |
| Consultar Renúncias | ✓ Confirmado |
| Emitir Comprovante | ✓ Confirmado |
| Situação Solicitar Renúncia | ✓ Confirmado (adicional, não citado no relatório) |

---

## 5. MAT — Módulo Administração Tributária — CONFIRMADO

**Data de vigência:** 1º de dezembro de 2025 — confirmada via notícia oficial da Receita Federal de 27/11/2025.

**Funcionalidades confirmadas:**
- Opção pelo Simples Nacional concomitante à inscrição no CNPJ
- Controle exclusivo do CRC pelo contador
- Contador precisa autorizar e confirmar sua vinculação à PJ

### Correção:
O relatório menciona "obrigatoriedade de assinatura do contador" — na realidade é uma **confirmação/autorização** do vínculo pelo contador (controle exclusivo), não necessariamente uma assinatura no sentido documental. O efeito prático é o mesmo: sem o contador confirmar, a empresa não abre.

---

## 6. Resolução CGSN 183/2025 — PARCIALMENTE CONFIRMADO

### O que é confirmado:
- A Resolução CGSN 183/2025 **existe** — confirmada por notícia da Receita Federal de 28/11/2025
- Há publicação do portal Simples Nacional (09/12/2025) sobre "Novas regras para multas por atraso na entrega das declarações do Simples Nacional — Entenda o que muda na entrega do PGDAS-D e da DEFIS a partir de 2026"

### O que NÃO é novidade:
- Os valores de MAED (2% ao mês, limitada a 20%, mínimo R$50 para PGDAS-D e R$500 para DEFIS) **já existiam na LC 123/2006, art. 38-B**
- O tema PRINCIPAL da Resolução 183/2025 é a **adaptação da CGSN 140/2018 à Reforma Tributária (CBS/IBS)**

### Correção:
O relatório complementar pode estar **inflacionando** a novidade da MAED. A multa já era prevista em lei. O que a Resolução 183/2025 parece ter feito é atualizar/reforçar as regras de aplicação, possivelmente eliminando período de tolerância ou ajustando critérios. Mas os valores em si não são novos.

**Impacto prático continua válido:** Independentemente de ser novidade ou reforço, a automação do PGDAS-D evita multas que se acumulam rapidamente com muitos clientes.

---

## 7. Ferramentas de Terceiros — CONFIRMADO

### e-Auditoria — CONFIRMADO
- Empresa: e-Auditoria Softwares como Serviço S.A. (CNPJ 10.750.188/0001-49)
- Fundação: 2009
- +35.000 profissionais contábeis
- R$5,2 bilhões em créditos tributários identificados
- 210.000 empresas auditadas mensalmente
- Funcionalidades: Motor do Simples, auditoria fiscal (190 bilhões de combinações), otimização tributária, análise SPED
- Site: www.e-auditoria.com.br

### Acellerador Contábil — CONFIRMADO
- Produto real e ativo
- Foco: Automação e RPA para escritórios contábeis
- Site: acelleradorcontabil.com.br

### SIEG IriS — CONFIRMADO (existência)
- Infraestrutura ativa (iris.sieg.com redireciona para auth.sieg.com com sistema de login)
- Site principal (sieg.com) retorna 403 nas páginas de produto (possível proteção de conteúdo)
- Existência confirmada pela infraestrutura de login dedicada

---

## 8. Contmatic + Integra Contador PGDAS-D — NÃO CONFIRMADO

### Evidências encontradas:
- No site principal da Contmatic, integrações mencionadas são: **Acessórias, Busca Legal, Jettax e Contbank** — nenhuma menção ao Serpro ou Integra Contador
- URL `contmatic.com.br/integra-contador` retorna 404
- Portal de autoatendimento retornou 403

### Conclusão:
**Não há evidência pública** de que a Contmatic integra nativamente com a API Integra-PGDAS-D do Serpro. Pode existir em versões internas ou ser recurso não documentado publicamente, mas não foi possível confirmar.

### Impacto para a C Brasil:
- O Integra Contador pode ser consumido **diretamente** pelo escritório (sem depender do Contmatic)
- Alternativamente, parceiros como Jettax e Acessórias (que já integram com Contmatic) podem ser o canal indireto

---

## 9. PPI São Paulo — PARCIALMENTE CONFIRMADO

### O que é confirmado:
- PPI 2024 é real: Lei 18.095 de 19/03/2024
- Desconto de até 95% sobre juros de mora: CONFIRMADO
- Prorrogação dentro de 2024: CONFIRMADA (Decreto 63.865/2024 reabriu adesão)

### O que NÃO é confirmado:
- Prorrogação para 2025 ou 2026: **SEM EVIDÊNCIA**
- Pode existir novo programa (PPI 2025) ou reabertura, mas não foi encontrada documentação

### Correção:
O relatório afirma "prorrogado para fevereiro de 2026" — isso **não foi confirmado**. Pode ser informação incorreta ou referente a prazo de pagamento de quem já aderiu (não de novas adesões).

---

## 10. Fim do e-CAC — NÃO CONFIRMADO

### Evidências encontradas:
- Em 17/11/2025, a Receita Federal anunciou integração com "Portal de Serviços da Receita Federal" para Autorizações de Acesso
- O domínio `servicos.receita.fazenda.gov.br` existe ("Portal Receita")
- Porém, na mesma notícia, o e-CAC continua listado como canal ativo
- Notícia de 26/11/2025 sobre parcelamentos menciona acesso via e-CAC
- **Nenhuma notícia de 2025 ou 2026 menciona "fim do e-CAC" ou "descontinuação"**

### Conclusão:
- **Existe** modernização/migração gradual para novo Portal de Serviços
- **NÃO existe** anúncio oficial de descontinuação do e-CAC
- Ambos coexistem atualmente
- O relatório complementar está **impreciso** ao afirmar que o e-CAC será descontinuado em 12-24 meses

### Correção para uso no roadmap:
A recomendação de migrar para APIs oficiais (Integra Contador) continua válida — não porque o e-CAC vai acabar, mas porque as APIs são mais eficientes, confiáveis e escaláveis que RPA sobre portal web.

---

## Conclusões para o Roadmap da C Brasil

### O que é SÓLIDO e pode ser incorporado com confiança:

1. **Integra Contador (Serpro)** — plataforma real com APIs REST documentadas cobrindo e-CAC, PGDAS-D, DCTFWeb, Redesim. É o investimento mais estratégico de curto prazo.

2. **APIs JUCESP (Prodesp)** — existem e são documentadas. Acesso requer credenciamento. Vale consulta formal.

3. **MAT obrigatório desde dez/2025** — real, muda o fluxo de abertura, exige participação ativa do contador.

4. **e-Auditoria, Acellerador Contábil, SIEG** — ferramentas reais que encapsulam complexidade. Avaliar custo-benefício.

5. **APIs DCTFWeb** — operações de MIT, emissão de DARF e transmissão são reais e funcionais.

### O que precisa ser VERIFICADO antes de planejar:

1. **Integração Contmatic + Integra Contador** — não confirmada. Verificar diretamente com suporte Contmatic.
2. **Preços do Integra Contador** — loja Serpro estava inacessível. Verificar valores antes de comprometer.
3. **PPI SP 2026** — sem evidência de programa ativo. Monitorar site da Prefeitura.

### O que está INCORRETO e deve ser descartado do roadmap:

1. **"Fim do e-CAC"** — não há descontinuação anunciada. Modernização sim, fim não.
2. **"Importação JSON" na DCTFWeb** — não é endpoint nomeado; APIs aceitam JSON por ser REST, mas não é funcionalidade específica.
3. **MAED como "novidade" da Res. 183/2025** — os valores já existiam em lei; a resolução atualiza/reforça regras.

---

## Próximos Passos Recomendados

1. **Contratar Integra Contador** — solicitar demonstração/preços na Loja Serpro com certificado digital da C Brasil
2. **Verificar com suporte Contmatic** — perguntar se há integração nativa com Integra Contador e quais módulos
3. **Consultar Prodesp** — sobre elegibilidade de escritórios privados para APIs JUCESP
4. **Avaliar e-Auditoria ou SIEG IriS** — como camada intermediária para sistemas sem API (Dívida Ativa Municipal, NFP)
5. **Acompanhar Portal do Simples Nacional** — sobre detalhes da Reforma Tributária (CBS/IBS) impactando PGDAS-D em 2026
