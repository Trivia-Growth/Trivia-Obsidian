---
tags: [heziom, marketing, ia, pesquisa, criativos, nao-comercial]
status: em-construcao
criado: 2026-06-02
fase: 2.2
licenca: CC-BY-NC-4.0
---

# TRIBE Criativo Lab — Visão Geral

> Demo aberto e **não-comercial** que aplica o modelo de pesquisa **TRIBE v2** (Meta AI)
> a **criativos de anúncio**: prevê como o cérebro humano responderia ao criativo (mapa
> cortical de fMRI) e mostra quais redes cerebrais acendem ao longo dos primeiros segundos.
> Pesquisa/educação, sem fins lucrativos. Referência: [[TRIBE v2 — AI Model of the Human Brain]].

---

## Por que existe (e por que separado do Jimmy)

O TRIBE v2 é **CC-BY-NC-4.0** (uso NÃO-comercial). Não pode entrar no Jimmy Studio
(produto pago) nem em entrega vendida a cliente. Por isso vive como **laboratório aberto
e gratuito**, fora do produto, com crédito à Meta. É também conteúdo de autoridade da
Heziom/Trívia em marketing + neurociência aplicada a criativo.

---

## Onde está o código

> O código **não fica no vault**. Mora no repositório próprio:

| Item | Local |
|---|---|
| Repo local | `~/Documents/Obsidian/Github/tribe-criativo-lab` |
| GitHub | `heziom/tribe-criativo-lab` (privado) |
| Framework | TRIVIAIOX instalado (agentes + `.claude`) |
| Stack | Python, Gradio, GPU (Hugging Face Space). Sem React/Supabase. |

Stories do projeto: dentro do repo, em `docs/stories/` (STORY-001 setup ✅, STORY-002 deploy+inferência ▶️).

---

## Arquitetura

```
criativo de anúncio (vídeo)
   → prep (vídeo + áudio + transcrição)
   → TRIBE v2 (GPU)  → mapa cortical predito (~20k vértices, offset 5s)
   → leitura por rede (rostos/FFA, fala, lugares/PPA, emoção/ínsula, semântica)
   → interface Gradio (HF Space)
```

---

## Hospedagem: Hugging Face Space (GPU) — decidido

- GPU **L4 (24GB)** com **sleep on inactivity** (controla custo). Custo absorvido (não-comercial).
- Passo a passo em `tribe-criativo-lab/docs/SETUP.md`.

**Pendências (ações na conta Hugging Face):**
- [ ] Criar o Space (Gradio, Public) na org `heziom` da HF.
- [ ] Atribuir GPU L4 + sleep.
- [ ] Aceitar a licença do TRIBE v2 (pesos gated CC-BY-NC).
- [ ] Gerar `HF_TOKEN` e por nos Secrets do Space.

Depois disso: ligar a inferência (`inference.py`) + leitura por rede (`viz.py`) e validar com 1 criativo.

---

## Guardrail não-comercial (inviolável)

- Zero cobrança, anúncios, paywall ou captura de lead.
- Não vira feature do Jimmy nem entrega vendida a cliente.
- Crédito à Meta sempre visível. Não afiliado nem endossado pela Meta.
- Detalhes e diligência de licenças: `tribe-criativo-lab/ATTRIBUTION.md`.

---

## Links

- Pesquisa-base: [[TRIBE v2 — AI Model of the Human Brain]]
- TRIBE v2 (Meta): https://github.com/facebookresearch/tribev2 · demo https://aidemos.atmeta.com/tribev2

*Iniciativa de pesquisa. Fase 2.2. Não-comercial.*
