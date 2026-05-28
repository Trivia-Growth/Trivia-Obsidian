# Contabilia — Reposicionamento (Alinhamento JG ↔ Lucas)

*Documento de alinhamento — 28/05/2026. Base: a spec do Lucas (`Apresentacao-Projeto.md`, `Especificacao-Tecnica.md`) + research da C Brasil + a evolução discutida pelo JG.*

---

## TL;DR

A spec atual está rica, mas posiciona o Contabilia como **"sistema operacional que substitui tudo"** — e aí ele compete de frente com Contmatic/Domínio/Fortes (inviável). A proposta é virar a chave: o Contabilia é uma **camada por cima** do sistema contábil que o escritório já tem. A **espinha** é um sistema financeiro do cliente (PME) que, como subproduto, gera o dado contábil já estruturado. O endgame é o contador deixar de "só contabilizar" e passar a **vender inteligência** pro negócio do cliente.

---

## O que muda em relação à spec atual

| Tema | Spec atual | Reposicionamento |
|---|---|---|
| Posicionamento | "Sistema operacional do escritório" (substitui) | **Camada por cima** do sistema contábil (não substitui) |
| Estrutura | 10-11 módulos paralelos | **1 espinha** (financeiro do cliente) + camadas penduradas nela |
| Distribuição | SaaS / implementação genérica | **Office-led / white-label**: vende pro escritório, que entrega aos clientes dele |
| Integrações | Nuvem Fiscal, BrasilAPI, Asaas | **+ Integra Contador (Serpro)** como aposta central (a spec ignora) |
| Tributos | Motor próprio de IBS/CBS | Emissão via provider; **sem motor próprio** (risco jurídico) |
| Norte | Operacional / automação | **Inteligência**: contador vira parceiro estratégico |
| Base de código | Implícito do zero | **Do zero**, mas com o `cbrasil-financeiro-app` como prova do loop |

---

## A tese em uma frase

> **Contabilia = a camada de relacionamento e operação cliente↔escritório, plugada por cima do sistema contábil existente, tendo o financeiro do cliente como espinha.**

Não brigamos com quem já é bom e consolidado:
- **Contmatic/Domínio/Fortes** fazem o motor contábil (lançamento, SPED, folha) — deixamos com eles.
- **ContaAzul/Omie** vendem gestão direto pro empresário — nosso diferencial é ser **office-led**: o escritório entrega aos clientes, nativamente fiado pro fluxo dele.

---

## A espinha: o financeiro do cliente ("a conversão")

O cliente usa porque precisa (fluxo de caixa é a isca). O dado contábil sai de graça, como subproduto:

```
Empresário lança: "Recebi R$ 3.000 do João pela consultoria"
        ↓
Sistema: cria conta a receber → sugere emitir NFS-e
         → IA classifica como receita de serviço → mapeia pra conta contábil
        ↓
Escritório: recebe o lançamento pronto, revisa só a exceção,
            exporta pro Contmatic (POST /v1/lancamentos)
```

O empresário nunca vê um plano de contas. O contador recebe lançamento limpo. **Essa tradução é o produto.**

> **Prova de que funciona:** o `cbrasil-financeiro-app` já faz esse loop (`cliente lança → partida dobrada → Contmatic`), validado com a Igreja IPP (408 lançamentos exportados). O Contabilia generaliza esse conceito — mas com código novo, multi-escritório.

---

## Endgame: do operacional à inteligência

O research da C Brasil nomeia bem (nível 3 = "inteligência fiscal"):

1. **Operação** — cumprir obrigação
2. **Automação** — acelerar o repetitivo *(o MVP entrega aqui)*
3. **Inteligência** — usar o dado pra antecipar risco e orientar decisão *(o destino)*

Com o dado financeiro fluindo, o escritório passa a vender consultoria/advisory que antes não conseguia. Isso muda o argumento de venda: não é só "economiza tempo", é **"aumenta seu ticket"**.

> A fase de inteligência **depende** de dado completo e confiável → é o que torna o **Open Finance** (feed bancário) o *unlock* dessa fase, não um luxo opcional.

---

## MVP proposto

**Lado cliente (PME)**
- Fluxo de caixa + contas a pagar/receber ← *a isca de uso diário*
- Emissão de NFS-e (gera recebível + lançamento automático)
- Anexar documento ao lançamento (coleta resolvida na origem)
- Painel simples: entrou/saiu, o que vence, meus impostos

**Lado escritório**
- CRM + honorários + régua de inadimplência
- Fila de classificação (IA sugere conta; humano revisa exceção)
- Exportação dos lançamentos pro Contmatic
- Status fiscal via **Integra Contador** (situação fiscal, DCTFWeb, caixa postal)
- Atendimento/demandas + WhatsApp
- Relatório fiscal mensal pro cliente

**Fora do MVP (roadmap):** Open Finance, DRE gerencial/centro de custo, apuração dual/SPED (fica no Contmatic), camada de inteligência.

> **Sequência sugerida:** validar primeiro o **loop central** (`cliente lança → IA classifica → exporta Contmatic + emite nota`) com a C Brasil como piloto. Só depois expandir CRM, atendimento e Integra Contador. Construir o MVP inteiro antes de um cliente real tocar o loop é o erro clássico que mata projeto de studio.

---

## Decisões já tomadas

- **Começar do zero** (não evoluir o cbrasil-financeiro-app).
- **Emissão de NFS-e entra no MVP**, via provider (Nuvem Fiscal/Focus). **Sem motor próprio de IBS/CBS.**
- **Integra Contador (Serpro)** como aposta de integração — funciona igual em qualquer escritório, independe do software dele.
- **Open Finance adiado**, mas tratado como unlock da fase de inteligência.
- **C Brasil = primeiro piloto**, mas produto **genérico** (terceiro setor = vertical futuro, não núcleo).

---

## Pontos pro Lucas decidir / discutir

1. **Quão "financeiro" o cliente vai no MVP?** Mínimo que engaja (fluxo de caixa + contas a pagar/receber) vs. algo mais perto de gestão completa.
2. **Stack do zero** — confirmar Next.js + Supabase (como na spec) ou alinhar com o que o time domina.
3. **Modelo comercial** — manter o Modelo A (implementação R$15-35K + recorrência) como principal?
4. **Quem é o escritório-alvo nº 2** (além da C Brasil) pra validar que o produto não ficou amarrado a um cliente só.
5. **Acesso ao Integra Contador** — depende de certificado/credenciais Serpro; vale confirmar custo e elegibilidade cedo.

---

*Próximo passo após alinhar com o Lucas: detalhar o schema da espinha financeira (nascer rico pra não travar a inteligência) e o desenho do loop central pro piloto.*
