# ADE Architecture - Motor de Desarrollo Autónomo

> **Versión:** 1.0
> **Última Actualización:** 2026-01-29
> **Estado:** Estándar Oficial del Framework
> **ES** | [EN](../architecture/ade-architecture.md) | [PT](../pt/architecture/ade-architecture.md)

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Principios de Diseño](#principios-de-diseño)
- [Arquitectura de Epics](#arquitectura-de-epics)
- [Componentes del Sistema](#componentes-del-sistema)
- [Puntos de Integración](#puntos-de-integración)
- [Gestión del Estado en Tiempo de Ejecución](#gestión-del-estado-en-tiempo-de-ejecución)
- [Configuración](#configuración)
- [Sistema de Inteligencia de Flujos de Trabajo (WIS)](#sistema-de-inteligencia-de-flujos-de-trabajo-wis)
- [Manejo de Errores y Recuperación](#manejo-de-errores-y-recuperación)

---

## Descripción General

El **Motor de Desarrollo Autónomo (ADE)** es la infraestructura de TRIVIAIOX para flujos de trabajo de desarrollo autónomo. Permite que los agentes de IA trabajen de forma independiente a través de pipelines inteligentes, bucles autorreparables y aprendizaje persistente.

### Capacidades Clave

| Capacidad                      | Descripción                                      | Epic   |
| ------------------------------ | ------------------------------------------------ | ------ |
| **Aislamiento de Historias**   | Aislamiento de rama basado en git worktree      | Epic 1 |
| **Estado del Proyecto**         | Seguimiento del estado del proyecto basado en YAML | Epic 2 |
| **Pipeline de Especificaciones** | Automatización de Requisitos → Especificación    | Epic 3 |
| **Planificación de Implementación** | Generación de planes y seguimiento de progreso | Epic 4 |
| **Autorreparación**             | Detección de estancamiento y recuperación        | Epic 5 |
| **Evolución de QA**             | Bucles de revisión automatizada → corrección     | Epic 6 |
| **Capa de Memoria**             | Aprendizaje de patrones y documentación de gotchas | Epic 7 |

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Marco TRIVIAIOX                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    ADE - Motor de Desarrollo Autónomo                  │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Epic 1    │  │   Epic 2    │  │   Epic 3    │  │   Epic 4    │   │ │
│  │  │  Worktree   │→│   Estado    │→│    Spec     │→│    Plan     │   │ │
│  │  │  Manager    │  │   Loader    │  │  Pipeline   │  │   Tracker   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                     Estado en Tiempo de Ejecución .triviaiox/        │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Epic 5    │  │   Epic 6    │  │   Epic 7    │  │     WIS     │   │ │
│  │  │ Bucle de    │←│   Bucle de  │←│   Capa de   │←│  Motor de   │   │ │
│  │  │ Autorrep.   │  │   QA        │  │   Memoria   │  │ Aprendizaje │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Principios de Diseño

### 1. Determinismo Primero

```yaml
Prioridad:
  1. Scripts determinísticos    # Siempre preferir
  2. Consultas SQL/JSON         # Predecibles, auditables
  3. Coincidencia de regex/patrones # Reproducible
  4. LLM como último recurso     # Solo cuando se necesita creatividad
```

### 2. Persistencia de Estado

Todo el estado de ADE se persiste en `.triviaiox/` para:

- Recuperación de sesión
- Seguimiento de progreso
- Continuidad del aprendizaje

### 3. Pipelines Componibles

Los flujos de trabajo se construyen a partir de tareas componibles:

- Cada tarea tiene entradas/salidas definidas
- Las tareas se pueden ejecutar de forma independiente o en secuencia
- Los pipelines se adaptan según la complejidad

### 4. Bucles Autorreparables

Cada pipeline tiene recuperación integrada:

- Detección de estancamiento con umbrales configurables
- Capacidades de reversión automática
- Caminos de escalada para estados irrecuperables

---

## Arquitectura de Epics

### Epic 1: Aislamiento de Rama de Historia

**Propósito:** Aislar el desarrollo de historias en worktrees de Git dedicados.

```
Componente: worktree-manager.js
Ubicación: .triviaiox-core/infrastructure/scripts/

Flujo:
  1. Historia iniciada → Crear worktree
  2. Desarrollo → Trabajar en aislamiento
  3. Historia completada → Fusionar y limpiar
```

**Funciones Clave:**

- `createWorktree(storyId)` - Crea rama aislada
- `switchWorktree(storyId)` - Cambia contexto
- `mergeWorktree(storyId)` - Fusiona hacia main
- `cleanupWorktree(storyId)` - Elimina worktree

### Epic 2: Sistema de Estado del Proyecto

**Propósito:** Rastrear el estado del proyecto en YAML legible por humanos.

```
Componente: project-status-loader.js
Ubicación: .triviaiox-core/infrastructure/scripts/

Archivo de Estado: .triviaiox/project-status.yaml
```

**Esquema de Estado:**

```yaml
proyecto:
  nombre: 'nombre-proyecto'
  historiaActual: 'STORY-001'

historias:
  STORY-001:
    estado: en_progreso
    rama: feat/story-001
    estadoSpec: aprobado
    estadoQA: pendiente
```

### Epic 3: Pipeline de Especificaciones

**Propósito:** Transformar requisitos en especificaciones.

```
Componentes:
  - Flujo: spec-pipeline.yaml
  - Tareas: spec-gather-requirements.md
           spec-assess-complexity.md
           spec-research-dependencies.md
           spec-write-spec.md
           spec-critique.md
```

**Fases del Pipeline:**

| Fase         | Agente      | Salida            |
| ------------ | ----------- | ----------------- |
| 1. Recopilar | @pm         | requirements.json |
| 2. Evaluar   | @architect  | complexity.json   |
| 3. Investigar | @analyst    | research.json     |
| 4. Escribir  | @pm         | spec.md           |
| 5. Crítica   | @qa         | critique.json     |

**Adaptación de Complejidad:**

```yaml
SIMPLE: Recopilar → Escribir → Crítica
STANDARD: Recopilar → Evaluar → Investigar → Escribir → Crítica → Plan
COMPLEX: Recopilar → Evaluar → Investigar → Escribir → Crítica → Revisar → Crítica2 → Plan
```

### Epic 4: Planificación de Implementación

**Propósito:** Generar y rastrear planes de implementación.

```
Componentes:
  - Scripts: plan-tracker.js
             subtask-verifier.js
  - Tareas: plan-create-context.md
           plan-create-implementation.md
           plan-execute-subtask.md
           verify-subtask.md
  - Checklist: self-critique-checklist.md
```

**Estructura del Plan:**

```json
{
  "storyId": "STORY-001",
  "subtareas": [
    { "id": 1, "estado": "completada", "verificada": true },
    { "id": 2, "estado": "en_progreso", "verificada": false },
    { "id": 3, "estado": "pendiente", "verificada": false }
  ],
  "progreso": { "completadas": 1, "total": 3, "porcentaje": 33 }
}
```

### Epic 5: Bucles Autorreparables

**Propósito:** Detectar estados de estancamiento y recuperarse automáticamente.

```
Componentes:
  - Scripts: stuck-detector.js
             recovery-tracker.js
             rollback-manager.js
             approach-manager.js
  - Plantilla: current-approach-tmpl.md
```

**Señales de Detección de Estancamiento:**

| Señal                | Umbral        | Acción              |
| -------------------- | ------------- | ------------------- |
| Mismo error 3x       | 3 ocurrencias | Sugerir alternativa  |
| Sin progreso         | 10 minutos    | Solicitar revisión   |
| Reversión repetida   | 2 reversiones | Escalar              |

**Flujo de Recuperación:**

```
Estancamiento Detectado → Registrar Enfoque → Intentar Alternativa → ¿Éxito?
                                                      ↓ No
                                              Reversión → Escalar
```

### Epic 6: Evolución de QA

**Propósito:** Revisión de QA automatizada con bucles de corrección.

```
Componentes:
  - Flujo: qa-loop.yaml
  - Scripts: qa-loop-orchestrator.js
             qa-report-generator.js
  - Tareas: qa-review-build.md (10 fases)
           qa-create-fix-request.md
           qa-fix-issues.md
  - Plantilla: qa-report-tmpl.md
```

**Flujo del Bucle de QA:**

```
┌─────────────────────────────────────────────────────────────┐
│                      Bucle de QA                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Revisar │ → │ Generar │ → │ Verifi- │ → │ ¿Corregir? │  │
│  │ Build   │    │ Reporte │    │ car     │    │         │  │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘  │
│                                                     │       │
│                 ┌───────────────────────────────────┘       │
│                 │                                           │
│          ┌──────▼──────┐                                    │
│          │  APROBADO   │ → Finalizado                        │
│          └─────────────┘                                    │
│          ┌──────▼──────────────┐                            │
│          │NECESITA_REVISIÓN    │ → Crear Solicitud de       │
│          └─────────────────────┘    Corrección → @dev       │
│                                      Corregir     │         │
│                 ┌────────────────────┘             │        │
│                 │ (máx 5 iteraciones)             │        │
│                 └──────→ Volver a Revisar         │        │
│                                                   │        │
│          ┌──────▼──────┐                          │        │
│          │   BLOQUEADO │ → Escalar a @architect   │        │
│          └─────────────┘                          │        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Revisión de 10 Fases:**

1. Sintaxis y Formato
2. Estructura del Código
3. Convenciones de Nomenclatura
4. Manejo de Errores
5. Patrones de Seguridad
6. Patrones de Rendimiento
7. Cobertura de Pruebas
8. Documentación
9. Accesibilidad
10. Evaluación Final

### Epic 7: Capa de Memoria

**Propósito:** Aprendizaje persistente entre sesiones.

```
Componentes:
  - Scripts: codebase-mapper.js
             pattern-extractor.js
             gotchas-documenter.js
  - Tareas: capture-session-insights.md
           extract-patterns.md
           document-gotchas.md
```

**Tipos de Memoria:**

| Tipo              | Descripción                     | Almacenamiento                    |
| ----------------- | ------------------------------- | --------------------------------- |
| Patrones de Código | Patrones reutilizables de la base de código | .triviaiox/patterns/code-patterns.json |
| Gotchas           | Trampas conocidas y soluciones  | .triviaiox/patterns/gotchas.json       |
| Insights de Sesión | Descubrimientos durante sesiones | .triviaiox/sessions/                   |
| Mapa de Base de Código | Análisis de estructura del proyecto | .triviaiox/codebase-map.json           |

---

## Componentes del Sistema

### Scripts de Infraestructura

| Script                     | Epic | Propósito                      |
| -------------------------- | ---- | ------------------------------ |
| `worktree-manager.js`      | 1    | Gestión de worktree de Git     |
| `project-status-loader.js` | 2    | Seguimiento de estado YAML     |
| `spec-pipeline-runner.js`  | 3    | Automatización de pipeline spec |
| `plan-tracker.js`          | 4    | Seguimiento del progreso del plan |
| `subtask-verifier.js`      | 4    | Verificación de subtareas      |
| `approach-manager.js`      | 5    | Seguimiento de enfoque         |
| `stuck-detector.js`        | 5    | Detección de estado atascado   |
| `recovery-tracker.js`      | 5    | Registro de recuperación       |
| `rollback-manager.js`      | 5    | Gestión de reversión           |
| `qa-report-generator.js`   | 6    | Generación de reporte QA       |
| `qa-loop-orchestrator.js`  | 6    | Automatización del bucle QA    |
| `codebase-mapper.js`       | 7    | Mapeo de estructura del proyecto |
| `pattern-extractor.js`     | 7    | Extracción de patrones         |
| `gotchas-documenter.js`    | 7    | Documentación de gotchas       |

### Flujos de Trabajo

| Flujo                | Propósito          | Fases                                    |
| -------------------- | ------------------ | ---------------------------------------- |
| `spec-pipeline.yaml` | Requisitos → Spec  | 5-8 fases según complejidad              |
| `qa-loop.yaml`       | Revisar → Bucle de corrección | 5 fases, máx 5 iteraciones     |

### Tareas

**Tareas del Pipeline de Especificaciones:**

- `spec-gather-requirements.md` - Fase 1: Recopilar requisitos
- `spec-assess-complexity.md` - Fase 2: Evaluar complejidad
- `spec-research-dependencies.md` - Fase 3: Investigar dependencias
- `spec-write-spec.md` - Fase 4: Escribir especificación
- `spec-critique.md` - Fase 5: Puerta de QA

**Tareas de Implementación:**

- `plan-create-context.md` - Generar contexto del proyecto
- `plan-create-implementation.md` - Crear plan de implementación
- `plan-execute-subtask.md` - Ejecutar subtarea
- `verify-subtask.md` - Verificar finalización de subtarea

**Tareas de QA:**

- `qa-review-build.md` - Revisión de 10 fases
- `qa-create-fix-request.md` - Generar solicitud de corrección
- `qa-fix-issues.md` - Flujo de corrección de problemas

**Tareas de Memoria:**

- `capture-session-insights.md` - Capturar aprendizajes de sesión
- `extract-patterns.md` - Extraer patrones de código
- `document-gotchas.md` - Documentar gotchas

---

## Puntos de Integración

### Integración de Agentes

ADE se integra con agentes TRIVIAIOX a través de:

```yaml
autoClaude:
  especificacionPipeline:
    fase: spec-gather
    rol: primario

  bucleQA:
    fase: review
    rol: revisor
```

### Integración de Status.json

Todos los componentes de ADE actualizan `.triviaiox/status.json`:

```json
{
  "historiaActual": "STORY-001",
  "pipelineEspec": {
    "fase": "critique",
    "iteracion": 1
  },
  "bucleQA": {
    "iteracion": 2,
    "veredicto": "NEEDS_REVISION"
  }
}
```

### Integración de devLoadAlwaysFiles

La documentación de ADE se carga vía devLoadAlwaysFiles:

- `docs/framework/source-tree.md` - Estructura del framework
- `docs/framework/coding-standards.md` - Estándares de codificación
- `docs/framework/tech-stack.md` - Referencia de tech stack

---

## Gestión del Estado en Tiempo de Ejecución

### Estructura del Directorio de Estado

```
.triviaiox/
├── project-status.yaml        # Estado a nivel de proyecto
├── status.json                # Estado en tiempo de ejecución
├── patterns/                  # Patrones aprendidos (Epic 7)
│   ├── code-patterns.json
│   └── gotchas.json
├── worktrees/                 # Estado de worktree (Epic 1)
│   └── story-{id}.json
├── sessions/                  # Insights de sesión (Epic 7)
│   └── session-{timestamp}.json
└── qa-loops/                  # Estado del bucle QA (Epic 6)
    └── {story-id}/
        ├── iteration-1.json
        ├── iteration-2.json
        └── qa-report.md
```

### Ciclo de Vida del Estado

```
Inicio de Sesión → Cargar Estado → Ejecutar → Actualizar Estado → Fin de Sesión
                      │                              │
                      └── Recuperación si es necesario ──┘
```

---

## Configuración

### Configuración Core

Ubicado en `.triviaiox-core/core-config.yaml`:

```yaml
ade:
  habilitado: true

  worktrees:
    habilitado: true
    dirBase: .worktrees
    limpiezaAutomatica: true

  pipelineEspec:
    habilitado: true
    maxIteraciones: 3
    puerstaEstricta: true

  bucleQA:
    habilitado: true
    maxIteraciones: 5
    correccionAutomatica: true

  capaMemoria:
    habilitado: true
    almacenPatrones: .triviaiox/patterns/
    capturaSessionía: true

  autorreparacion:
    habilitado: true
    umbraEntancamiento: 3
    reversionAutomatica: false
```

---

## Sistema de Inteligencia de Flujos de Trabajo (WIS)

El WIS proporciona sugerencias inteligentes basadas en patrones aprendidos.

### Componentes

```
.triviaiox-core/workflow-intelligence/
├── engine/
│   ├── confidence-scorer.js   # Puntuación de confianza de patrones
│   ├── output-formatter.js    # Formateo de salida
│   ├── suggestion-engine.js   # Sugerencias inteligentes
│   └── wave-analyzer.js       # Análisis de patrón de onda
├── learning/
│   ├── capture-hook.js        # Hooks de captura de patrones
│   ├── pattern-capture.js     # Motor de captura de patrones
│   ├── pattern-store.js       # Persistencia de patrones
│   └── pattern-validator.js   # Validación de patrones
└── registry/
    └── workflow-registry.js   # Registro de flujos de trabajo
```

### Integración con ADE

WIS se integra con ADE a través de:

1. **Captura de Patrones** - Aprende de flujos de trabajo exitosos
2. **Motor de Sugerencias** - Sugiere enfoques basados en contexto
3. **Puntuación de Confianza** - Clasifica sugerencias por confiabilidad

---

## Manejo de Errores y Recuperación

### Categorías de Error

| Categoría  | Manejo               | Ejemplo             |
| ---------- | -------------------- | ------------------- |
| Transitorio | Reintentar (3x)      | Tiempo de espera de red |
| Recuperable | Enfoque alternativo  | Fallo de lint       |
| Bloqueante  | Escalar              | Problema de seguridad |
| Fatal      | Detener + notificar  | Corrupción          |

### Estrategias de Recuperación

```yaml
estrategias:
  reintentar:
    maxIntentos: 3
    retraso: exponencial

  alternativa:
    disparador: mismo_error_3x
    accion: sugerir_enfoque

  reversión:
    disparador: corrupcion_detectada
    accion: restaurar_checkpoint

  escalar:
    disparador: max_iteraciones
    accion: notificar_arquitecto
```

---

## Historial de Versiones

| Versión | Fecha      | Cambios                                    | Autor            |
| ------- | ---------- | ------------------------------------------ | ---------------- |
| 1.0     | 2026-01-29 | Documentación inicial de arquitectura ADE  | Aria (architect) |

---

_Este es un estándar oficial del framework TRIVIAIOX que documenta el Motor de Desarrollo Autónomo._
