# PCM — Calendário de Manutenção Preventiva (Requisito Visual)

> Feature solicitada pela Sinérgica (Fabrício Medeiros).
> Módulo: **PCM / Operação** · bounded context `pcm` · spec a ser aberta no épico E01.
> Referência visual: printscreen compartilhado em 2026-06-29 (sistema concorrente — Real Building Enterprise).

---

## O que o cliente quer

Duas visões complementares do plano de manutenção preventiva:

| Visão | Quando usar | O que mostra |
|-------|-------------|--------------|
| **Padrão (compacta)** | Dia a dia, consulta rápida | Só a data da próxima manutenção por equipamento |
| **Calendário (expandida)** | Planejamento mensal/anual | Grid com todos os dias do mês/ano × cada frequência, com status colorido + código |

---

## Hierarquia de dados

A árvore de navegação do calendário segue a hierarquia de localização do equipamento:

```
Cliente / Condomínio
  └── Torre / Bloco
        └── Área (ex.: Bloco 1 / Térreo / Recepção)
              └── Equipamento (ex.: Aquecedor de Ar XPTO 3000)
                    └── Frequência (Diária / Mensal / Semestral / Anual)
                          └── Dias do mês com status
```

---

## Visão Calendário — especificação

### Layout
- **Linha de cabeçalho do mês**: nome do mês + ano
- **Seção por Área**: título em destaque (ex.: `Bloco 1 / Térreo / Recepção Área`)
- **Por equipamento**: nome em negrito; uma ou mais linhas de frequência abaixo
- **Grid**: colunas = dias do mês (1–31); linhas = frequência (Diária, Mensal, etc.)

### Células do grid
| Estado | Cor | Conteúdo da célula |
|--------|-----|--------------------|
| Programada sem pendência | Ciano/verde-água | ✓ (simples) |
| Programada com pendência | Amarelo/âmbar | ⚠ |
| Executada / baixada | Cinza | — |
| Não programada neste dia | Branco/vazio | — |

> **MVP:** células apenas com cor + ícone simples. Código de atividade (ex.: `B2`, `I0`) e mapeamento com tipos do Auvo ficam para depois — quando soubermos o que o Auvo devolve via webhook.

### Filtros e modos de exibição

| Controle | Opções |
|----------|--------|
| **Cliente** | Dropdown — selecionar um condomínio OU "Todos" |
| **Período** | Mês/ano (padrão: mês atual) ou visão anual (12 meses em scroll) |
| **Agrupamento** | Por Torre/Bloco → Área → Equipamento |
| **Visão** | Compacta (só próxima data) · Calendário (grid completo) |

### Exportação PDF
A definir em iteração futura.

---

## Visão Padrão (compacta)

Lista tabular simples — para consulta rápida sem abrir o calendário:

| Equipamento | Área | Frequência | Última execução | Próxima manutenção | Status |
|-------------|------|------------|-----------------|-------------------|--------|
| Aquecedor de Ar XPTO 3000 | Bloco 1 / Térreo | Diária | 28/06/2026 | 29/06/2026 | ✅ Em dia |
| Exaustor 498ADC | Bloco 1 / Térreo | Mensal | 11/06/2026 | 11/07/2026 | ✅ Em dia |
| Bomba d'água ABC123456 | Bloco 1 / Térreo | Mensal | 11/06/2026 | — | ⚠️ Pendente |

---

## Como isso se conecta ao PCM

A fonte de dados do calendário é o **Plano Preventivo** (`pcm.plano_preventivo`):
- Cada item do plano define: equipamento + frequência + dia de referência.
- O PCM gera as datas do calendário a partir dessas regras (sem depender do Auvo para o grid visual).
- Quando a OS preventiva é executada e fechada (via Auvo webhook), a célula muda para "executada".
- Pendências = OS preventiva que deveria ter sido executada mas não foi (data passada + status ≠ finalizado).

**Fluxo de dados:**
```
pcm.plano_preventivo (regras) 
  → gera datas esperadas por período 
  → cruza com pcm.ordens_servico (executadas)
  → calendário renderizado
```

---

## Onde abrir no ROADMAP

| Spec | Onde encaixa |
|------|-------------|
| `E01-S0X — Calendário de Manutenção Preventiva` | Épico E01 (PCM · Operação) |
| Dependência | E01-S0Y — Plano Preventivo (cadastro de regras por equipamento) deve estar implementado antes |

---

## Referência visual
Printscreen do sistema Real Building Enterprise (Curitiba, Dezembro 2024) — apenas como referência de layout. O design final deve seguir o Design System do Sinérgica OS (Tailwind + shadcn/ui).
