# STORY-025 — Documentação Completa da Plataforma

**Módulo:** Documentação  
**Sprint:** Qualidade  
**Prioridade:** P2  
**Status:** concluido
> **CONCLUÍDA 18/06/2026.**
> - `docs/EDGE_FUNCTIONS.md` criado e completo (23 funções documentadas) — inclui `accept-invite`, `import-vimeo-folder`, `batch-import-vimeo` adicionados nesta entrega; secret `BATCH_IMPORT_SECRET` registrado.
> - `PROJECT_REQUIREMENTS.md` atualizado: tabela de Edge Functions revisada (removido `panda-video` legado, adicionados `manage-ai`, `ai-tutor`, `import-vimeo-folder`, `batch-import-vimeo`, `pdf-info`, `submit-activity`).
> - `README.md` completo com stack, setup, comandos e deploy.
> - Guia do Administrador, Guia do Instrutor e Guia do Aluno escritos no vault (`Projeto/Docs/`).
> - `/ajuda` e `HelpCenter.tsx` existentes no frontend com FAQ e categorias.
> - Todos os CAs atendidos.  
**Estimativa:** 1 dia

---

## Contexto

A plataforma foi construída via Lovable e não possui documentação formal para nenhum dos públicos que a utilizam: alunos, instrutores, administradores de organização e times técnicos. Isso gera dependência de suporte humano para tarefas simples e dificulta onboarding de novos usuários e desenvolvedores.

A documentação deve ser gerada em 3 camadas:
1. **Docs técnicos** — para desenvolvedores e DevOps (este repositório)
2. **Docs de produto** — para admins e instrutores (Obsidian vault / Notion)
3. **Help Center in-app** — para alunos e admins diretamente na plataforma (usando o módulo FAQ já existente ou uma nova seção /help)

---

## Acceptance Criteria

- [ ] `README.md` do repositório completo: o que é, como rodar, como deployar, variáveis de ambiente, estrutura de pastas
- [ ] `PROJECT_REQUIREMENTS.md` atualizado com todas as features existentes
- [ ] Guia do Administrador escrito (criar organização, configurar vídeos, configurar IA, gerenciar usuários, criar cursos)
- [ ] Guia do Instrutor escrito (criar curso, adicionar aulas, gerar quiz com IA, publicar)
- [ ] Guia do Aluno escrito (matrícula, assistir aulas, usar Tutor IA, realizar quiz, certificado)
- [ ] Página `/help` ou `/ajuda` na plataforma com conteúdo de FAQ e links para os guias
- [ ] Diagrama de arquitetura atualizado (já existe base no vault Brownfield)
- [ ] Documentação de todas as Edge Functions (inputs, outputs, auth, erros esperados)

---

## Entregas por Público

### 1. Desenvolvedor / DevOps

**Arquivo:** `README.md` (repositório)

Seções:
- Visão geral da plataforma
- Stack tecnológico
- Pré-requisitos (Node, Supabase CLI, Netlify CLI)
- Como rodar localmente (`npm run dev`)
- Variáveis de ambiente necessárias (`.env.example` já existe — referenciar)
- Como deployar (Netlify + Supabase db push + functions deploy)
- Estrutura de pastas `src/` explicada
- Links para docs técnicos no vault

**Arquivo:** `docs/EDGE_FUNCTIONS.md` (novo)

Uma tabela por Edge Function com: nome, endpoint, autenticação (JWT/pública), actions disponíveis, exemplo de request/response, erros esperados.

Funções a documentar:
`ai-tutor`, `generate-quiz`, `optimize-content`, `manage-ai`, `manage-users`, `video-proxy`, `panda-video`, `submit-quiz`, `auto-enroll`, `batch-enroll`, `create-org`, `accept-invite`, `mp-create-preference`, `mp-webhook`, `mp-oauth`, `sitemap`, `llms-txt`

---

### 2. Administrador da Organização

**Destino:** Obsidian vault → `Projeto/Docs/Guia-Administrador.md`

Seções:
- Configuração inicial da organização (logo, domínio, branding)
- Gerenciar usuários (convidar, definir papéis)
- Configurar plataforma de vídeo (Mux / Panda / Vimeo)
- Configurar provedor de IA (OpenRouter, OpenAI, Gemini, Anthropic)
- Criar e organizar cursos e trilhas de aprendizado
- Gerenciar pagamentos (Mercado Pago)
- Monitorar relatórios e analytics
- Gerenciar blog e conteúdo SEO
- FAQ: como cadastrar dúvidas frequentes

---

### 3. Instrutor

**Destino:** Obsidian vault → `Projeto/Docs/Guia-Instrutor.md`

Seções:
- Criar um curso (título, descrição, capa, módulos, aulas)
- Adicionar vídeos (upload via plataforma configurada)
- Gerar quiz automático via IA a partir da transcrição
- Criar quiz manual
- Publicar curso e definir preço
- Acompanhar progresso dos alunos
- Criar ebooks e audiobooks na biblioteca
- Usar o editor de artigos do blog

---

### 4. Aluno

**Destino:** Obsidian vault → `Projeto/Docs/Guia-Aluno.md`  
**Destino 2:** In-app na página `/ajuda`

Seções:
- Como se matricular em um curso
- Assistir aulas (player, marcação de progresso)
- Usar o Tutor IA (como funciona, dicas de uso)
- Realizar quizzes e ver resultados
- Emitir certificado de conclusão
- Explorar trilhas de aprendizado
- Acessar biblioteca (ebooks e audiobooks)
- Comunidade e mensagens diretas
- Configurar perfil e notificações

---

### 5. Help Center In-App

**Arquivos frontend:**
- `src/pages/help/HelpCenter.tsx` (nova página)
- Rota: `/ajuda` (pública) e `/aluno/ajuda` (protegida)

Conteúdo:
- Busca nas FAQs (usando tabela `faqs` já existente)
- Cards de categorias: Primeiros Passos, Cursos, Quizzes, Certificados, Conta
- Links para os guias completos (PDF ou Notion)
- Botão de contato/suporte

---

## Passos de Execução

1. Atualizar `README.md` do repositório
2. Criar `docs/EDGE_FUNCTIONS.md`
3. Escrever Guia do Administrador no vault
4. Escrever Guia do Instrutor no vault
5. Escrever Guia do Aluno no vault
6. Criar página `/ajuda` no frontend com FAQ search + categorias
7. Adicionar rota em `src/App.tsx`
8. Popular tabela `faqs` com as principais dúvidas de cada público
9. Atualizar `PROJECT_REQUIREMENTS.md` com features existentes

---

## Observações

- Os guias de Admin, Instrutor e Aluno podem ser gerados com apoio do agente `@pm` ou `@analyst` usando como base o brownfield assessment já realizado em `Brownfield/system-architecture.md`
- O Help Center in-app deve ser acessível sem login (para alunos que ainda não se matricularam)
- Priorizar guia do Aluno e Help Center in-app — maior volume de usuários
- Screenshots e vídeos curtos de demonstração são desejáveis mas opcionais para a v1

---

## File List

- [ ] `README.md`
- [ ] `docs/EDGE_FUNCTIONS.md`
- [ ] `PROJECT_REQUIREMENTS.md`
- [ ] `src/pages/help/HelpCenter.tsx`
- [ ] `src/App.tsx` (nova rota `/ajuda`)
- [ ] Vault: `Projeto/Docs/Guia-Administrador.md`
- [ ] Vault: `Projeto/Docs/Guia-Instrutor.md`
- [ ] Vault: `Projeto/Docs/Guia-Aluno.md`
