---
tipo: skill
projeto: angioclam-relatorio-eficiencia
versao: 2.0
data: 2026-05-14
tags:
  - skill
  - claude
  - documentacao-tecnica
parent: "[[00 - Sistema Angioclam - MOC]]"
arquivos_relacionados:
  - SKILL.md
  - motor_relatorio_v2.py
---

# 10 - SKILL.md v2 - Conteúdo Completo

## O que é

Documento de instruções para o Claude executar a geração do relatório quando recebe os 3 exports do Klingo. É o "prompt estruturado" que orienta a IA a aplicar todas as regras travadas.

## Status

**v2.0 funcional.** Validada contra dados reais. HTML gerado bate 100% com o motor Python.

## Onde fica

- **Arquivo:** `SKILL.md`
- **Localização:** Claude.ai > Settings > Capabilities > Skills (upload manual)
- **Backup do conteúdo:** repositório `triviastudio/angioclam-skill` (criar)

## Quando usar a Skill

- Geração pontual de relatório
- Prova de conceito
- Validação de novas planilhas
- Enquanto o sistema final (Lenira) não está pronto

## Quando NÃO usar a Skill

- Para integração no sistema da Angioclam (usar [[11 - Motor Python v2 - Código Referência]])
- Para automação em produção
- Quando precisar de parâmetros editáveis dinamicamente

## Estrutura do SKILL.md

### Seções principais

1. **Visão geral** — descrição do que faz
2. **Inputs esperados** — detecção automática dos 3 tipos de arquivo
3. **Validação de integridade** — confere que toda linha foi lida
4. **Lógica de identificação de pacientes** — hierarquia de chaves
5. **Taxonomia de procedimentos** — 50+ categorias com regex
6. **Coluna Qtd** — convenção de bilateral
7. **Deduplicação de exames** — regra obrigatória
8. **Conversão de tipos** — valor BR, idade, data
9. **Cálculos dos indicadores** — fórmulas e benchmarks
10. **Fontes específicas** — decisões travadas
11. **Estrutura dos 9 slides** — layout esperado
12. **Paleta por operadora** — detecção automática
13. **Geração técnica do HTML** — formato output
14. **QA automático** — checks antes de entregar
15. **Bugs corrigidos da v1** — registro histórico
16. **Resultados esperados nos dados de teste** — referência

## Hierarquia de chaves de identificação

### Tier 1 - ID determinístico

- `ID Atend` (B2) ↔ `id_atendimento` (B3): chave numérica forte
- `id_paciente` (B3 apenas): chave única de paciente

### Tier 2 - Nome normalizado (única chave em todas as 3 bases)

```python
def normalizar_nome(s):
    s = str(s).strip().upper()
    s = unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode()
    return ' '.join(s.split())
```

## Limitações conhecidas da Skill (vs Motor Python)

| Limitação | Skill | Motor Python |
|---|---|---|
| Parâmetros editáveis | Não (precisa editar SKILL.md) | Sim (input dict) |
| Determinismo | Alto, mas IA pode variar | 100% |
| Custo por execução | Tokens do Claude | Zero (CPU local) |
| Integração com sistema | Não | Sim (API/script) |
| Robustez a falhas | Depende de Claude online | Independente |

## Bugs corrigidos da skill v1 (registrados na v2)

1. ✅ Doppler Carótidas: usar B2 (1.172) e não soma bruta de B1 (1.397)
2. ✅ Comorbidades: contar paciente único com SIM em qualquer atendimento
3. ✅ Slide 3: garantir consistência entre cards e tabelas
4. ✅ Cateterismo: R$ 10.000 em todos os slides
5. ✅ Apresentar versões A e B das "evitadas" para transparência

## Links relacionados

- [[11 - Motor Python v2 - Código Referência]]
- [[12 - Taxonomia de Exames]]
- [[13 - Validação HTML Gerado]]
- [[20 - Design das 3 Camadas]]
