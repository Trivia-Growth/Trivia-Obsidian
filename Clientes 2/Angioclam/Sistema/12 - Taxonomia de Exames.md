---
tipo: tecnico
projeto: angioclam-relatorio-eficiencia
versao: 1.0
data: 2026-05-14
tags:
  - taxonomia
  - classificacao
  - regex
parent: "[[00 - Sistema Angioclam - MOC]]"
arquivos_relacionados:
  - taxonomia_exames_v1.csv
---

# 12 - Taxonomia de Exames

## O que é

Tabela canônica que mapeia cada nome de procedimento/exame do Klingo em uma categoria determinística, via regex sobre nome normalizado.

## Cobertura validada

| Base | Total distintos | Classificados | Cobertura |
|---|---|---|---|
| B2 (Realizados) | 41 procedimentos | 41 | 100% |
| B1 (Solicitados) | 627 nomes | 612 | 97,57% |

## Famílias de categorias

| Família | Quantidade |
|---|---|
| Cardiologia | 8 categorias |
| Angiologia/Vascular | 10 categorias |
| USG não vascular | 10 categorias |
| Consultas | 8 categorias |
| Procedimentos | 2 categorias |
| Cirurgias (importantes para evitação) | 2 categorias |
| Laboratório | 17 subcategorias |
| Imagem avançada | 6 categorias |

**Total:** 63 categorias canônicas.

## Princípios da taxonomia

### 1. Ordem importa

Padrões mais específicos vêm antes dos genéricos. O primeiro regex que casa, vence.

```python
# CORRETO:
('doppler_arterio_venoso_mmii', [r'ARTERIAL\s+E\s+VENOSO.*INFERIORES']),
('doppler_venoso_mmii',         [r'VENOSO.*INFERIOR']),
('doppler_arterial_mmii',       [r'ARTERIAL.*INFERIOR']),

# Sem essa ordem, 'DOPPLER ARTERIAL E VENOSO DE MEMBROS INFERIORES' 
# seria classificado errado.
```

### 2. Resistente a typos do Klingo

A taxonomia cobre 5 grafias diferentes de Doppler de Carótidas, incluindo o typo "CARÓRTIDAS":

```python
('doppler_carotidas', [
    r'CAROTID', r'CAROT(I|R)?D', r'CARORTID',
    r'VASOS\s+CERVICAIS\s+ARTERIAIS', r'DUPLEX.*CAROT',
]),
```

Outros typos cobertos:
- ABDOMEM (sic) → cobre ABDOM(E|EM)
- Múltiplas grafias de DOPPLER (DOPPLER, ECODOPPLER, DOPPLER COLORIDO)

### 3. Categorias clinicamente coerentes

Crioescleroterapia foi classificada como `proc_pele` (procedimento estético), NÃO como `cirurgia_varizes`. Foi um erro inicial corrigido durante a auditoria.

## Categorias críticas para os indicadores

### Para Indicador 1 (Ergometria → Cintilografia)
- `ergometria`: ergometrias realizadas pela Angioclam
- `cintilografia`: solicitações de cintilografia

### Para Indicador 2 (Ergometria → Cateterismo)
- `ergometria` (mesma base)
- `cateterismo`: solicitações de cateterismo

### Para Indicador 3 (Doppler Venoso MMII → Varizes)
- `doppler_venoso_mmii`: Doppler venoso MMII faturado
- `cirurgia_varizes`: APENAS termos cirúrgicos reais (SAFENECT, FLEBECT, etc). NÃO incluir crioescleroterapia.

### Para Indicador 4 (Consulta Angio → AngioTC + Cateterismo)
- Consulta Angiologia: B2 com Categoria=CONSULTAS + Especialidade=ANGIO
- `angiotc`: angiotomografias solicitadas
- `cateterismo` (mesma de cima)

### Para Indicador 5 (Doppler Carótidas → Endarterectomia)
- `doppler_carotidas`: faturado em B2
- `endarterectomia`: cirurgias vasculares carotídeas solicitadas

## Procedimentos com Qtd=2 (bilateral)

Convenção: 1 linha = 1 exame, mesmo com Qtd=2.

Lista conhecida:
- DOPPLER COLORIDO VENOSO DE MEMBRO INFERIOR
- DOPPLER COLORIDO ARTERIAL DE MEMBRO INFERIOR
- DOPPLER COLORIDO ARTERIAL DE MEMBRO SUPERIOR
- DOPPLER COLORIDO VENOSO DE MEMBRO SUPERIOR
- DOPPLER COLORIDO DE ORGÃO OU ESTRUTURA ISOLADA

## Manutenção da taxonomia

A cada novo export do Klingo, pode aparecer:
- Nova grafia de exame conhecido (basta adicionar ao regex)
- Exame completamente novo (criar nova categoria)

**Processo sugerido:**
1. Após cada execução, revisar `validacao_qa.txt`
2. Se houver itens em `OUTROS_NAO_CLASSIFICADO` com volume > 10, classificar
3. Atualizar a taxonomia
4. Re-executar para confirmar

## Arquivo de referência

`taxonomia_exames_v1.csv` (33 KB, 668 linhas) — tabela completa com:
- Fonte (B1 ou B2)
- Nome original do Klingo
- Categoria atribuída
- Quantidade de ocorrências

## Links relacionados

- [[11 - Motor Python v2 - Código Referência]]
- [[10 - SKILL.md v2 - Conteúdo Completo]]
