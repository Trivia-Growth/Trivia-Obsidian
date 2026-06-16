---
cliente: Sinérgica Manutenções
projeto: Sinérgica OS
status: contrato assinado / em início
fechado_em: 2026-06-15
atualizado: 2026-06-16
---

# Sinérgica — Índice do Projeto (Sinérgica OS)

> **Status: CONTRATO ASSINADO em 15/06/2026 (assinatura digital).** Projeto oficialmente fechado. Aguardando pagamento da entrada para iniciar o kickoff.

Cliente vindo do **G4 Sprint de IA**. Primeiro case de OS da Trívia saído do Sprint. O produto entregue é o **Sinérgica OS** (implementação do M.A.P.A. OS), sistema de gestão sob medida que unifica a operação e a opera com agentes de IA.

---

## 1. Partes
- **CONTRATADA (Trívia):** TRIVIA STUDIO CONSULTORIA E MARKETING LTDA · CNPJ 41.429.534/0001-15 · São Paulo/SP. Representante: João Gabriel Novais Rocha dos Santos (sócio proprietário, CPF 363.639.278-62).
- **CONTRATANTE (Sinérgica):** SINERGICA MANUTENCOES PATRIMONIAIS LTDA · CNPJ 37.502.245/0001-27 · Rua Santos Dumont, 323, Sala 01, Cambuí, Campinas/SP. Representante: Fabrício Barbosa Nunes Medeiros (proprietário, RG 66.003.233-8 SSP/SP, CPF 057.769.621-10). E-mail (NF): engenharia@sinergicamanutencoes.com.br.
- **Testemunhas:** Aline Azevedo Nazário (CPF 112.777.477-84) e Lucas Moreira Azevedo (CPF 432.312.288-83). Com 2 testemunhas, o contrato é título executivo extrajudicial.

## 2. Comercial
- **Valor cheio:** R$ 120.000,00. **Preço de case:** R$ 30.000,00.
- **Pagamento:** entrada de **R$ 6.000,00 via PIX** (chave CNPJ da Trívia 41.429.534/0001-15) + saldo de **R$ 24.000,00 em 12x de R$ 2.000,00 no cartão de crédito**.
- **Contrapartida (case):** autorização para divulgar como caso de referência nas redes sociais e canais da Trívia, sem expor dados sensíveis da operação.
- **Suporte opcional pós-garantia:** R$ 990,00/mês (à parte).
- **Infra (por conta da Sinérgica):** estimada em R$ 800 a R$ 1.600/mês, a apurar no diagnóstico.

## 3. Escopo — Módulos do Sinérgica OS
1. Comercial (CRM) · 2. Atendimento com Agentes de IA · 3. Marketing (conteúdo multicanal) · 4. Growth (análise de Meta/Google Ads) · 5. Operação Técnica e Estoque · 6. Financeiro · 7. Dados (base única) · 8. Gestão (cockpit do dono) · 9. **Área do Cliente** (portal dos clientes finais).

## 4. Decisões técnicas
- **Auvo:** mantido como sistema de campo e **integrado via API** (não substituído).
- **PCM:** aproveita a estrutura existente (regras de negócio + integração com o Auvo), com ajustes/evoluções pra entrar na base única.
- **Agentes de IA:** ao menos **1 por área** no go-live.
- **Integrações previstas:** WhatsApp, Meta Ads, Google Ads, Auvo, Fiscal/NF-e, Resend (e-mails).
- **Garantia:** 90 dias corridos após o go-live. **Blueprint** formal ao fim do diagnóstico (marco que libera a construção). **Aceite por módulo:** homologação de 5 dias úteis.

## 5. Propriedade intelectual e LGPD (resguardos)
- **Cessão total** ao cliente após a quitação integral, com entrega do código-fonte (não fica refém da Trívia).
- **Propriedade Prévia da Trívia** = só componentes genéricos pré-existentes; **não** abrange regras de negócio, fluxos, modelagens, estruturas de dados, agentes ou funcionalidades feitos especificamente pra Sinérgica.
- **LGPD:** Sinérgica controladora / Trívia operadora. Responsabilidade ilimitada da Trívia só por conduta intencional ou da própria operação; incidentes via ferramentas de terceiros (nuvem/APIs) não entram (ficam no teto geral).
- Detalhes e racional em [[Contrato Sinérgica - Naming e Resguardos]].

## 6. Roadmap (3 meses)
- **Mês 1 — Fundação:** diagnóstico, base de dados única, e entrega do **Blueprint** para aprovação.
- **Mês 2 — Construção:** módulos centrais (Comercial/CRM, Operação & Estoque, Financeiro) + integração do Auvo + primeiros agentes.
- **Mês 3 — Ativação:** Atendimento, Marketing, Growth, Área do Cliente, integrações, testes, capacitação e go-live (1 agente por área).

## 7. Linha do tempo
- **G4 Sprint de IA:** construção do "Engenheiro de IA" de apoio aos técnicos (origem da relação).
- **Jun/2026:** proposta sob medida (deck) + oferta de case R$120k → R$30k; publicada como link rastreável (triviastudio.com.br/proposta/sinergica-qxpzts, servido com gate de status).
- Fabrício fechou e pediu o contrato.
- Contrato redigido (software sob encomenda, cessão total) e iterado; devolutiva do Fabrício com 8 pontos (Blueprint, Propriedade Prévia, garantia 90, exceções de responsabilidade, PCM) — todos acatados + recorte da LGPD.
- **15/06/2026:** contrato assinado digitalmente (Trívia, Sinérgica + 2 testemunhas).
- **16/06/2026:** envio do PIX da entrada; link do cartão (12x) a enviar.

## 8. Arquivos desta pasta
- **Contrato assinado (autoritativo):** [[Contrato_Sinergica_OS_Minuta_Assinado.pdf]]
- Contrato final gerado (apoio): [[Contrato Sinérgica - OS (Minuta)]] (.md), `Contrato Sinérgica - OS (Minuta).docx`, `Contrato Sinérgica - OS.pdf`
- Versão enviada ao Fabrício (histórico): `Contrato Sinérgica - OS (Minuta v2).*`
- Racional jurídico (PI/LGPD/naming): [[Contrato Sinérgica - Naming e Resguardos]]
- Proposta (deck sob medida): `Sinérgica - Proposta OS (Apresentação).html`
- Diagrama da arquitetura: `Arquitetura Sinérgica OS.png`

> Docs genéricos do produto (M.A.P.A. OS, plano de negócio, playbook do diagnóstico, LP) seguem em `Clientes/Trivia/Projeto Trívia OS/`.

## 9. Próximos passos
1. Confirmar **entrada de R$ 6.000 (PIX)** e enviar/ativar o **link do cartão (12x)**.
2. Marcar o **kickoff**.
3. Iniciar **Mês 1 (diagnóstico + fundação de dados)**, encerrando com o **Blueprint** para aprovação.
4. Pedir à Sinérgica os **acessos e dados** dos sistemas a integrar (Auvo, PCM, fiscal/NF-e, WhatsApp, Meta/Google).
