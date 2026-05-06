# TRIVIAIOX Pro — Guia de Instalacao e Licenciamento

Guia completo para instalar, ativar e gerenciar o TRIVIAIOX Pro.

**Story:** PRO-6 — License Key & Feature Gating System

---

## Visao Geral

O TRIVIAIOX Pro e distribuido via npm publico. O pacote e livre para instalar, mas as features premium requerem uma **licenca ativa** para funcionar.

```
Comprar Licenca → Instalar → Ativar → Usar Features Pro
```

### Pacotes npm

| Pacote | Tipo | Proposito |
|--------|------|-----------|
| `triviaiox-pro` | CLI (1.8 KB) | Comandos de instalacao e gerenciamento |
| `@triviaiox-fullstack/pro` | Core (10 MB) | Features premium (squads, memory, metrics, integrations) |

---

## Instalacao Rapida

```bash
# Instalar TRIVIAIOX Pro (instala @triviaiox-fullstack/pro automaticamente)
npx triviaiox-pro install

# Ativar sua licenca
npx triviaiox-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX

# Verificar ativacao
npx triviaiox-pro status
```

---

## Passo a Passo

### Prerequisitos

- Node.js >= 18
- `triviaiox-core` >= 4.0.0 instalado no projeto

### Passo 1: Instalar TRIVIAIOX Pro

```bash
npx triviaiox-pro install
```

Isso executa `npm install @triviaiox-fullstack/pro` no seu projeto.

**Alternativa** (instalacao manual):

```bash
npm install @triviaiox-fullstack/pro
```

### Passo 2: Ativar Licenca

Apos a compra, voce recebera uma chave no formato `PRO-XXXX-XXXX-XXXX-XXXX`.

```bash
npx triviaiox-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX
```

Esse comando:
1. Valida a chave contra o License Server (`https://triviaiox-license-server.vercel.app`)
2. Registra sua maquina (machine ID unico)
3. Salva um cache local criptografado para uso offline

### Passo 3: Verificar

```bash
# Status da licenca
npx triviaiox-pro status

# Listar features disponiveis
npx triviaiox-pro features
```

---

## Comandos Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npx triviaiox-pro install` | Instala `@triviaiox-fullstack/pro` no projeto |
| `npx triviaiox-pro activate --key KEY` | Ativa uma chave de licenca |
| `npx triviaiox-pro status` | Mostra status da licenca atual |
| `npx triviaiox-pro features` | Lista todas as features pro e disponibilidade |
| `npx triviaiox-pro validate` | Forca revalidacao online da licenca |
| `npx triviaiox-pro deactivate` | Desativa a licenca nesta maquina |
| `npx triviaiox-pro help` | Mostra todos os comandos |

---

## Operacao Offline

Apos a instalacao e ativacao, o TRIVIAIOX Pro funciona offline:

- **30 dias** sem necessidade de revalidacao
- **7 dias de grace period** apos expirar o cache
- Verificacao de features 100% local no dia a dia

A internet so e necessaria para:
1. Ativacao inicial (`npx triviaiox-pro activate`)
2. Revalidacao periodica (automatica a cada 30 dias)
3. Desativacao (`npx triviaiox-pro deactivate`)

---

## CI/CD

Para pipelines, instale e ative usando secrets de ambiente:

**GitHub Actions:**
```yaml
- name: Install TRIVIAIOX Pro
  run: npx triviaiox-pro install

- name: Activate License
  run: npx triviaiox-pro activate --key ${{ secrets.TRIVIAIOX_PRO_LICENSE_KEY }}
```

**GitLab CI:**
```yaml
before_script:
  - npx triviaiox-pro install
  - npx triviaiox-pro activate --key ${TRIVIAIOX_PRO_LICENSE_KEY}
```

---

## Troubleshooting

### Chave de licenca invalida

```
License activation failed: Invalid key format
```

- Verifique o formato: `PRO-XXXX-XXXX-XXXX-XXXX` (4 blocos de 4 caracteres hex)
- Sem espacos extras
- Abra uma issue em https://github.com/Trivia-Growth/Triviaiox/issues se a chave foi fornecida a voce

### Maximo de seats excedido

```
License activation failed: Maximum seats exceeded
```

- Desative a licenca na outra maquina: `npx triviaiox-pro deactivate`
- Ou contate support para aumentar o limite de seats

### Erro de rede na ativacao

```
License activation failed: ECONNREFUSED
```

- Verifique sua conexao com a internet
- O License Server pode estar temporariamente indisponivel
- Tente novamente em alguns minutos

---

## Arquitetura do Sistema

```
┌─────────────────┐     ┌─────────────────────────────────┐     ┌──────────┐
│  Cliente (CLI)   │────>│  License Server (Vercel)        │────>│ Supabase │
│  npx triviaiox-pro    │<────│  triviaiox-license-server.vercel.app │<────│ Database │
└─────────────────┘     └─────────────────────────────────┘     └──────────┘
                                                                      │
                                                                      │
                        ┌─────────────────────────────────┐           │
                        │  Admin Dashboard (Vercel)       │───────────┘
                        │  triviaiox-license-dashboard         │
                        │  Cria/revoga/gerencia licencas  │
                        └─────────────────────────────────┘
```

| Componente | URL | Proposito |
|-----------|-----|-----------|
| License Server | `https://triviaiox-license-server.vercel.app` | API de ativacao/validacao |
| Admin Dashboard | `https://triviaiox-license-dashboard.vercel.app` | Gestao de licencas (admin) |
| Database | Supabase PostgreSQL | Armazena licencas e ativacoes |

---

## Suporte

- **Documentacao:** https://triviagrowth.ai/pro/docs
- **Comprar:** https://triviagrowth.ai/pro
- **Suporte:** https://github.com/Trivia-Growth/Triviaiox/issues
- **Issues:** https://github.com/Trivia-Growth/Triviaiox/issues

---

*TRIVIAIOX Pro Installation Guide v3.0*
*Story PRO-6 — License Key & Feature Gating System*
