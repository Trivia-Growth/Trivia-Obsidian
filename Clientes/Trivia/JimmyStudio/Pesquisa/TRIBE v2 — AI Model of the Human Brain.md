---
tipo: pesquisa
tema: neurociência-computacional, foundation-model, fMRI, IA
fonte: Meta AI Research / aidemos.atmeta.com/tribev2
data: 2026-06-02
tags: [ia, neurociencia, meta, fmri, foundation-model, open-source]
relevância: JimmyStudio — referência de arquitetura multimodal e uso de IA multimodal
---

# TRIBE v2 — An AI Model of the Human Brain

> **"Predicting neural responses to sight, sound and language."**
> Pesquisa aberta da Meta AI — modelo de fundação que prediz atividade cerebral (fMRI) em resposta a qualquer estímulo de vídeo, áudio ou texto.

---

## O que é

O **TRIBE v2** (*Transfer Learning for Brain Encoding, v2*) é um **modelo de IA multimodal de fundação** desenvolvido pela Meta AI Research que funciona como um **espelho digital do cérebro humano**. Dado qualquer estímulo — um vídeo, um áudio, uma frase — o modelo prediz em segundos como o cérebro humano responderia, no formato de um mapa 3D de ativação de ~70.000 voxels de fMRI (ressonância magnética funcional).

É considerado o estado da arte em *brain encoding models* e foi o **vencedor do Algonauts Challenge 2025**, o principal benchmark internacional nessa área.

---

## O Problema que Resolve

Por décadas, a neurociência ficou presa num gargalo: cada experimento exige recrutar voluntários, colocá-los num scanner de fMRI (caro, lento, ruidoso) e coletar dados por meses. Isso tornou inviável testar hipóteses em escala.

O TRIBE v2 transforma **meses de laboratório em segundos de computação**, permitindo:
- Simular novos experimentos sem voluntários físicos
- Escalar a pesquisa neurocientífica radicalmente
- Guiar o desenvolvimento de arquiteturas de IA mais alinhadas ao cérebro humano

---

## Arquitetura: 3 Estágios

```
[Estímulo: vídeo + áudio + texto]
        ↓
┌──────────────────────────────────────┐
│ ESTÁGIO 1: Codificação Tri-modal     │
│  · V-JEPA2     → embeddings de vídeo│
│  · wav2vec 2.0 → embeddings de áudio│
│  · Llama 3.2   → embeddings de texto│
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ ESTÁGIO 2: Integração Universal      │
│  · Transformer compartilhado         │
│  · Aprende representações comuns     │
│    entre estímulos, tarefas e        │
│    indivíduos diferentes             │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ ESTÁGIO 3: Mapeamento Cerebral       │
│  · Subject Block (por indivíduo)     │
│  · Mapeia ~70.000 voxels do córtex   │
└──────────────────────────────────────┘
               ↓
     [Mapa 3D de atividade fMRI predita]
```

### Estágio 1 — Codificação Tri-modal
Usa três encoders de IA pré-treinados de última geração:
- **V-JEPA2** — encoder de vídeo da Meta, captura features visuais temporais
- **wav2vec 2.0** — encoder de áudio da Meta/Facebook, representa fala e som
- **Llama 3.2** — LLM da Meta para embeddings de texto/linguagem

O objetivo é capturar características que **vídeo, áudio e texto compartilham com o processamento cerebral humano**.

### Estágio 2 — Integração Universal (Transformer)
Um Transformer central processa os embeddings dos três encoders e aprende:
- Representações universais válidas para estímulos multimodais
- Padrões comuns entre tarefas diferentes
- Generalização entre indivíduos (zero-shot)

### Estágio 3 — Mapeamento Cerebral (Subject Block)
Uma camada específica por indivíduo mapeia as representações universais para os ~70.000 voxels do córtex. Isso permite generalização zero-shot para novos sujeitos nunca vistos no treino.

---

## Melhorias-Chave vs. TRIBE v1

| Dimensão | TRIBE v1 | TRIBE v2 |
|---|---|---|
| **Resolução** | ~1.000 voxels | ~70.000 voxels (cérebro inteiro) |
| **Voluntários** | 4 sujeitos | Grandes coortes (zero-shot) |
| **Modalidades** | Apenas visual | Visual + Auditivo + Linguagem |
| **Generalização** | Requer re-treino por pessoa | Zero-shot para novos indivíduos |
| **Benchmark** | — | Vencedor do Algonauts 2025 |

---

## Scaling Laws

Uma das descobertas mais importantes do paper: o desempenho do TRIBE v2 **cresce log-linearmente com mais dados de fMRI**, sem atingir platô. Assim como LLMs (GPT, Claude, Llama), mais dados de treinamento = modelo mais preciso, de forma **previsível e contínua**.

Isso sugere que o cérebro humano obedece às mesmas leis de escala de outros domínios de IA — uma descoberta com implicações profundas para o campo.

---

## Superando Scans Individuais de fMRI

Resultado contraintuitivo: **as predições do TRIBE v2 são mais correlacionadas com a resposta média do grupo do que qualquer scan real individual**.

Por quê? Scans reais têm ruído — movimento da cabeça, batimentos cardíacos, variações de oxigenação. O modelo aprende a "resposta canônica" limpa, tornando-se mais representativo do que o dado bruto.

### Métricas de Correlação de Pearson (r)

| Modalidade | Linear | Outros Scans | **TRIBE v2** |
|---|---|---|---|
| Speech (fala) | 0.07 | 0.12 | **0.20** |
| Movies (filmes) | 0.11 | 0.15 | **0.28** |

---

## Experimentos In-Silico

O TRIBE v2 permite **replicar descobertas clássicas da neurociência sem voluntários físicos**, apenas simulando estímulos computacionalmente. Ao apresentar sentenças ao modelo, ele identifica automaticamente as redes cerebrais clássicas:

| Categoria | Área Cerebral Ativada |
|---|---|
| **Places** (lugares) | Córtex parahipocampal (PPA) |
| **Bodies** (corpos) | Área extraestriada de corpos (EBA) |
| **Faces** (rostos) | Área fusiforme de faces (FFA) |
| **Speech** (fala) | Córtex auditivo / Área de Wernicke |
| **Semantics** (semântica) | Rede semântica distribuída (córtex temporal) |
| **Emotions** (emoções) | Ínsula e córtex cingulado anterior |

---

## Multimodalidade — Como o Cérebro Integra o Mundo

A seção mais avançada usa o modelo para estudar: *onde e como o cérebro combina visão, som e linguagem?* O TRIBE v2 permite experimentos de **ablação in-silico** — remover uma modalidade e observar quais áreas cerebrais "apagam" —, algo eticamente impossível de fazer em humanos.

---

## Datasets de Treinamento

- **Human Connectome Project (HCP)**
- **Algonauts Project** (benchmark internacional)
- **BOLD5000** — 5.000 imagens com fMRI correspondente
- **Natural Scenes Dataset (NSD)** — maior dataset de fMRI para imagens naturais
- Total estimado: **>6.000 horas** de registros de fMRI

---

## Aplicações Futuras (declaradas pela Meta)

1. **Simular experimentos neurocientíficos** — planejar pesquisas com mais eficiência antes de ir ao laboratório
2. **Guiar design de arquiteturas de IA** — usar o cérebro como benchmark para modelos mais eficientes
3. **Diagnóstico de distúrbios neurológicos** — identificar desvios entre predição do modelo e atividade real do paciente
4. **Interfaces cérebro-computador (BCIs)** — base para sistemas de comunicação neural

---

## Custo e Licença

| Item | Detalhe |
|---|---|
| **Demo interativa** | Gratuita — roda nos servidores da Meta |
| **Código** | Open-source (GitHub Meta) |
| **Pesos do modelo** | Download gratuito (Hugging Face) |
| **Paper** | Acesso livre |
| **Uso comercial** | Licença de pesquisa — não autorizado para fins comerciais |
| **Rodar localmente** | Custo de compute (GPU) por conta do usuário |

---

## Recursos

| Recurso | URL |
|---|---|
| Demo interativa | https://aidemos.atmeta.com/tribev2 |
| Paper | Disponível via nav "Paper" na demo |
| Blog | AI.meta.com/research |
| Código | Nav "Code" na demo (GitHub Meta) |
| Pesos | Nav "Weights" na demo (Hugging Face) |

---

## Relevância para a Trivia / JimmyStudio

O TRIBE v2 é relevante como **referência arquitetural e conceitual** para projetos de IA da Trivia:

1. **Arquitetura tri-modal** (vídeo + áudio + texto num único Transformer) é um padrão que pode influenciar como o Jimmy Agent integra contextos multimodais no futuro
2. **Subject Block** (adaptação por indivíduo com base numa representação universal) é análogo a personalização por usuário em produtos de IA
3. **Scaling Laws validadas** em domínios além de linguagem — reforça a aposta em modelos maiores com mais dados
4. **Open-source + pesos gratuitos** — possibilidade de uso experimental sem custo de licença

---

*Pesquisa realizada em 2026-06-02. Sistema analisado via demo interativa e documentação pública da Meta AI.*
