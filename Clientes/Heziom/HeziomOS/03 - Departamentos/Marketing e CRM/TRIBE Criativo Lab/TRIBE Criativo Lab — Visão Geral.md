---
tags: [heziom, marketing, ia, pesquisa, criativos, nao-comercial]
status: operacional
criado: 2026-06-02
atualizado: 2026-06-03
fase: 2.2
licenca: CC-BY-NC-4.0 (TRIBE) + Llama 3.2 Community License
---

# TRIBE Criativo Lab — Visão Geral

> [!success] Validado em 2026-06-03 — roda ponta a ponta
> Subi um criativo real e o lab previu a resposta cerebral: **19 janelas temporais, 20.484
> vértices corticais** (malha fsaverage5), gerando o **mapa cortical** + a **curva de
> intensidade ao longo do vídeo**, com o registro salvo no **histórico (Supabase)**. A
> curva do criativo testado fica baixa no miolo e **dispara no fecho** (pico de engajamento
> previsto no clímax). Ver seção "Validação" abaixo.

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

Stories do projeto: dentro do repo, em `docs/stories/` (STORY-001 setup ✅, STORY-002
deploy+inferência ✅, STORY-003 histórico Supabase ✅, **STORY-004 arquitetura desacoplada
Netlify+Supabase+HF ▶️ próxima**).

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

**Setup concluído:**
- [x] Space `Heziom/tribe-criativo-lab` criado (Gradio, **privado**), GPU **L4** + sleep.
- [x] Licença do TRIBE v2 (não-gated) + **Llama 3.2 aceita** (acesso gated concedido à conta Heziom).
- [x] `HF_TOKEN` (+ `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`) nos Secrets; variável `HF_HUB_ENABLE_HF_TRANSFER=0`.
- [x] Inferência ligada e **validada** com criativo real (ver abaixo).

---

## Validação (2026-06-03)

Funciona ponta a ponta: vídeo → áudio → transcrição (WhisperX) → encoders (Llama 3.2 texto,
V-JEPA2 vídeo, Wav2Vec-BERT áudio) → predição cerebral (TRIBE) → mapa cortical + curva →
histórico no Supabase. ~7,5 min por criativo na 1ª vez (depois mais rápido até o Space dormir).

A subida não foi trivial: caiu uma cadeia de 6 incompatibilidades, todas reais e resolvidas.
A principal foi o `transformers` vir numa versão nova demais para o PyTorch que o TRIBE exige
(fixado em `transformers==4.53.3`). Detalhe técnico completo em `tribe-criativo-lab/docs/stories/STORY-002.md`.

> [!note] Aprendizado p/ a próxima fase
> Rodadas longas presas a uma aba do navegador morrem se a conexão oscilar. A validação final
> rodou disparando pela **API do Gradio via script** (mais firme). Isso confirma a **STORY-004**:
> tirar a inferência do navegador (front no Netlify + Supabase chamando o Space server-side).

**Segurança (ações suas):** rotacionar o token do GitHub e o do HF usados na sessão; apagar o
repo perdido `Triviastudio/tribe-criativo-lab`.

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
