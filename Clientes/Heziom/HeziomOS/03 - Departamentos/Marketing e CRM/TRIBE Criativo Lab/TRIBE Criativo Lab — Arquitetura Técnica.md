---
titulo: TRIBE Criativo Lab — Arquitetura Técnica
projeto: TRIBE Criativo Lab
area: Marketing e CRM
tipo: documentacao-tecnica
criado: 2026-06-08
tags: [heziom, tribe, arquitetura, netlify, supabase, huggingface, openrouter]
---

# Arquitetura Técnica — TRIBE Criativo Lab

Relatório de configuração e estrutura do sistema (HF Space, Supabase, Netlify, front web e camada de IA). Serve também como referência de um padrão reaproveitável para outros sistemas do tipo "app leve mais tarefa pesada sob demanda".

Relacionado: [[TRIBE Criativo Lab — Visão Geral]]

## 1. Visão geral: o padrão

O sistema é composto por quatro camadas desacopladas, cada uma substituível e barata. A sacada central é separar o front do "cérebro pesado" (GPU): o site fica no ar 24/7 quase de graça, e a GPU só liga quando alguém roda de fato uma análise.

```
[Browser] -> [Netlify: front estatico + Functions] -> [Supabase: Auth / DB / Storage]
                       |                                         ^
                       +--> [HF Space + GPU] --(grava resultado)-+
                       +--> [OpenRouter: LLMs]
```

- Front e API leve: Netlify (estático mais serverless functions). Custo perto de zero.
- Estado (login, dados, arquivos): Supabase.
- Compute pesado (modelo de IA em GPU): Hugging Face Space, que dorme sozinho e acorda sob demanda. Só paga GPU enquanto roda.
- Camada de texto (IA generativa): OpenRouter (troca de modelo sem mudar código).

Nenhuma camada conhece a implementação da outra. Elas conversam por HTTP e por uma tabela compartilhada no Supabase.

## 2. As camadas em detalhe

### 2.1 Front — Netlify (estático)

- Stack: HTML, CSS e JS puro, sem framework e sem build. Cliente Supabase carregado via CDN (esm.sh). No `netlify.toml`: `base=web`, `publish=.`, e o comando de build é um `echo` (não compila nada).
- Páginas: `index` (analisar), `roteiro`, `ciencia` (skills), e as de admin (`admin`, `analises`, `custos`, `agente`, `usuarios`).
- Shell compartilhado (`shell.js` mais `shell.css`): injeta a sidebar, mostra itens de admin apenas para admin (checagem server-side), e tem drawer no mobile. URLs amigáveis vêm de redirects no `netlify.toml`.

### 2.2 Backend leve — Netlify Functions (Node 18, esbuild)

Oito funções, cada uma com um papel:

| Função | Acesso | Papel |
|---|---|---|
| `tribe-wake` | logado | Acorda o Space (restart se estiver dormindo) |
| `tribe-upload` | logado | Gera signed upload URL (sobe vídeo sem mexer em RLS) |
| `tribe-start` | logado | Assina a URL do vídeo e dispara o job no Space; aplica limites por IP e global |
| `tribe-status` | público | Faz polling do `analysis_log` até a análise ficar pronta; devolve sinais e URLs assinadas das imagens |
| `tribe-admin` | admin | Painel: overview, galeria, custos, config de IA, e os agentes Leitor e Otimizador (OpenRouter) |
| `tribe-ai` | logado | Agente Roteirista (OpenRouter), para o time de criação |
| `tribe-users` | admin | whoami, listar, convidar e set_role |
| `tribe-retention` | cron | Apaga vídeos antigos do bucket `uploads` (retenção) |

### 2.3 Dados e Auth — Supabase (projeto `clqbvtbyzpcexlogffst`)

- Auth: e-mail e senha. O front usa a anon key mais o JWT do usuário. As funções validam o JWT e, para admin, leem `profiles.role` com a service_role (server-side).
- Postgres (tabelas):
  - `analysis_log`: o coração do sistema. Guarda status, sinais neuro (JSON no campo `metrics`), caminhos das imagens, transcrição, leitura da IA e otimizações.
  - `ai_config`: config dos três agentes (modelo, prompt, tokens, temperatura). id=1 Leitor, id=2 Otimizador, id=3 Roteirista.
  - `profiles`: papel do usuário (`admin`).
  - `usage_log`: registro de uso (IP, usuário, vídeo) para rate limit e custo.
- Storage (buckets):
  - `uploads`: vídeos de entrada (limite global de 50MB; retenção configurável).
  - `analyses`: saídas (mapa cortical, timecourse, mapas por rede em png, e `preds.npz`).
- Padrões de acesso: signed upload URL (sobe arquivo driblando a RLS sem afrouxar a política) e signed download URL (expira em 1h) para tudo que o front exibe. A service_role nunca chega ao browser.

### 2.4 Compute pesado — Hugging Face Space (GPU)

- Space: `Heziom/tribe-criativo-lab`, host `heziom-tribe-criativo-lab.hf.space`. SDK Gradio, licença cc-by-nc-4.0.
- Modelo: TRIBE v2 (Meta), trimodal: V-JEPA2 (vídeo), Wav2Vec-BERT (áudio) e Llama 3.2 (texto), com WhisperX para transcrever (roda isolado via `uvx`). Visualização cortical com nilearn e matplotlib. `ffmpeg` no `packages.txt`.
- Como é chamado: a `tribe-start` chama a API do Gradio em `POST /gradio_api/call/analisar_url` com `[url_do_video, objetivo, nome]`.
- Como devolve o resultado: o Space escreve direto no Supabase (`src/tribe_lab/history.py` usa a service_role). Faz insert no `analysis_log` e upload das imagens e preds no bucket `analyses`. O front nem fala com o Space para pegar o resultado; ele faz polling no Supabase.
- Economia (o ponto-chave): o Space fica em estado `SLEEPING`. Antes de disparar, a função checa o estágio em `GET huggingface.co/api/spaces/{space}`; se dormindo, dá `POST .../restart` e responde `{warming:true}` (o front espera e repassa). A GPU só gasta durante a inferência.

### 2.5 Camada de IA generativa — OpenRouter

- Um endpoint, vários modelos. Hoje: Leitor e Otimizador no `gemini-3.5-flash`; Roteirista no `claude-sonnet-4.6`. Trocar de modelo é mudar uma string no `ai_config`, sem deploy.
- Detalhes técnicos: o gemini-3.5-flash é modelo de raciocínio (exige `reasoning:{effort:"low"}`); a `temperature` vem como string do banco (precisa de parseFloat para não dar 400).

## 3. Fluxo de uma análise (ponta a ponta)

1. Usuário loga (Supabase Auth) e clica em "Ligar modelo". A `tribe-wake` acorda o Space.
2. Escolhe o vídeo. A `tribe-upload` dá uma signed URL e o browser sobe o arquivo direto para o bucket `uploads`.
3. `tribe-start`: confere o estágio do Space, assina a URL do vídeo (1h), dispara o job no Gradio, registra `usage_log` e devolve o `event_id`.
4. O Space (GPU) roda o TRIBE v2 e grava o resultado no Supabase (`analysis_log` mais imagens no `analyses`).
5. O front faz polling em `tribe-status` até `status=done` e renderiza sinais e mapas (URLs assinadas).
6. Camada de IA (sob demanda): `tribe-admin` (Leitor e Otimizador) e `tribe-ai` (Roteirista) chamam o OpenRouter e persistem em `analysis_log.metrics`.

## 4. Configuração (variáveis de ambiente)

- Netlify: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_TOKEN`, `OPENROUTER_API_KEY`, `GPU_HOURLY_USD`, `CAP_GLOBAL_DAY`, `CAP_IP_HOUR`, `RETENTION_DAYS`, `SITE_URL`.
- HF Space: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (para gravar o resultado).
- Segredos ficam só no servidor (Netlify e Space). O front só tem a anon key (pública por design).

## 5. Segurança

- A service_role nunca vai para o browser; toda ação sensível passa por uma function que valida o JWT.
- Admin é checado server-side (`profiles.role`), não no front.
- Storage por signed URL (que expira), nunca bucket público.
- Rate limit por IP e global (`usage_log` mais caps). Headers `X-Frame-Options` e `Referrer-Policy`.

## 6. Custos

- Netlify: free tier cobre front e functions desse volume.
- Supabase: free ou tier baixo (no free, pausa por inatividade).
- HF Space GPU: só roda na análise (dorme sozinho). Custo estimado por `GPU_HOURLY_USD`.
- OpenRouter: centavos por chamada (cerca de R$ 0,12 gemini e R$ 0,21 sonnet por geração).

## 7. Repositórios e deploy

- GitHub `heziom/tribe-criativo-lab`: o Netlify faz deploy automático no push da `main` (só publica `web/`).
- Repo do HF Space (separado): hospeda `app.py` e `src/tribe_lab/`; rebuild quando recebe push.
- Mesma raiz de código, dois destinos: `base=web` no Netlify ignora o `requirements.txt` do Python; o Space ignora o front.

## 8. O que dá para reaproveitar (template para outros sistemas)

Tirando o modelo TRIBE, sobra um esqueleto genérico que serve para qualquer sistema do tipo "app leve mais tarefa pesada ou GPU sob demanda":

> Netlify (front estático mais functions) + Supabase (Auth, DB e Storage com signed URLs) + worker em GPU que dorme (HF Space ou similar) + camada LLM plugável (OpenRouter).

Blocos diretamente reaproveitáveis:

- Shell de admin: sidebar, gate por papel, páginas de overview, itens, custos, usuários e config de agentes.
- Padrão de agentes de IA configuráveis: `ai_config` mais OpenRouter, com prompt e modelo editáveis sem deploy.
- Worker assíncrono com polling: dispara o job, o worker grava no banco, o front faz polling. Evita manter conexão aberta.
- GPU sob demanda: checar estágio, acordar, estado de "warming". Derruba o custo de manter um modelo no ar.
- Signed upload e download para mídia, sem afrouxar a RLS.
- Gestão de usuários (convite por link, papéis) e rate limit mais retenção.

Encaixa bem em produtos do tipo: processar vídeo, áudio ou imagem, rodar um modelo próprio, gerar relatório ou conteúdo com IA, qualquer coisa com o ciclo "upload, processa pesado, mostra resultado".
