<!--
  Traduccion: ES
  Original: /docs/en/migration-guide.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Actualizacion de TriviaGrowth Triviaiox

> 🌐 [EN](../migration-guide.md) | [PT](../pt/migration-guide.md) | **ES**

---

Esta guia te ayuda a actualizar entre versiones de TriviaGrowth Triviaiox.

## Tabla de Contenidos

1. [Compatibilidad de Versiones](#compatibilidad-de-versiones)
2. [Lista de Verificacion Pre-Actualizacion](#lista-de-verificacion-pre-actualizacion)
3. [Procedimientos de Respaldo](#procedimientos-de-respaldo)
4. [Proceso de Actualizacion](#proceso-de-actualizacion)
5. [Verificacion Post-Actualizacion](#verificacion-post-actualizacion)
6. [Procedimientos de Rollback](#procedimientos-de-rollback)
7. [Solucion de Problemas](#solucion-de-problemas)

## Compatibilidad de Versiones

### Version Actual

**TriviaGrowth Triviaiox v4.2.11** (Version Actual del Repositorio)

### Rutas de Actualizacion

| Desde Version | A Version | Tipo de Actualizacion | Dificultad |
|---------------|-----------|----------------------|------------|
| v4.3.x | v4.2.11 | Menor | Baja |
| v4.0-4.2 | v4.2.11 | Menor | Media |
| v3.x | v4.2.11 | Mayor | Alta |

### Requisitos del Sistema

- **Node.js**: 20.0.0 o superior (recomendado)
- **npm**: 10.0.0 o superior
- **Git**: 2.0.0 o superior
- **Espacio en Disco**: 100MB minimo de espacio libre

## Lista de Verificacion Pre-Actualizacion

Antes de actualizar, asegurate de tener:

- [ ] Respaldado tu proyecto completo
- [ ] Documentadas las configuraciones personalizadas
- [ ] Listados todos los agentes y workflows activos
- [ ] Exportados cualquier dato critico
- [ ] Probada la actualizacion en un entorno de desarrollo
- [ ] Informado a los miembros del equipo del mantenimiento planificado
- [ ] Revisadas las notas de version para cambios que rompen compatibilidad

## Procedimientos de Respaldo

### 1. Respaldo Completo del Proyecto

```bash
# Crear respaldo con fecha y hora
tar -czf triviaiox-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .

# Mover a ubicacion segura
mv triviaiox-backup-*.tar.gz ../backups/
```

### 2. Exportar Configuracion

```bash
# Guardar configuracion actual
cp .triviaiox-core/config.json ../backups/config-backup.json

# Guardar componentes personalizados
cp -r .triviaiox-core/agents/custom ../backups/custom-agents/
cp -r .triviaiox-core/tasks/custom ../backups/custom-tasks/
```

### 3. Documentar Estado Actual

```bash
# Registrar version actual
npm list triviaiox-core/core > ../backups/version-info.txt

# Listar archivos personalizados
find .triviaiox-core -name "*.custom.*" -type f > ../backups/custom-files.txt
```

## Proceso de Actualizacion

### Opcion 1: Actualizacion In-Place (Recomendada)

```bash
# 1. Detener cualquier proceso en ejecucion
# Cerrar todas las integraciones de IDE y agentes activos

# 2. Actualizar a la ultima version
npm install -g triviaiox-core@latest

# 3. Ejecutar comando de actualizacion
triviaiox upgrade

# 4. Verificar instalacion
triviaiox --version
```

### Opcion 2: Instalacion Limpia

```bash
# 1. Eliminar instalacion anterior
npm uninstall -g triviaiox-core

# 2. Limpiar cache
npm cache clean --force

# 3. Instalar ultima version
npm install -g triviaiox-core@latest

# 4. Reinicializar proyecto
cd your-project
triviaiox init --upgrade
```

### Opcion 3: Actualizacion Especifica del Proyecto

```bash
# Actualizar dependencias del proyecto
cd your-project
npm update triviaiox-core/core

# Reinstalar dependencias
npm install

# Verificar actualizacion
npm list triviaiox-core/core
```

## Verificacion Post-Actualizacion

### 1. Verificar Instalacion

```bash
# Verificar version
triviaiox --version

# Verificar componentes principales
triviaiox verify --components

# Probar funcionalidad basica
triviaiox test --quick
```

### 2. Probar Agentes

```bash
# Listar agentes disponibles
triviaiox list agents

# Probar activacion de agente
triviaiox test agent triviaiox-developer

# Verificar dependencias de agentes
triviaiox verify --agents
```

### 3. Verificar Configuracion

```bash
# Validar configuracion
triviaiox config validate

# Revisar log de actualizacion
cat .triviaiox-core/logs/upgrade.log
```

### 4. Probar Workflows

```bash
# Listar workflows
triviaiox list workflows

# Probar ejecucion de workflow
triviaiox test workflow basic-dev-cycle
```

## Procedimientos de Rollback

Si encuentras problemas despues de actualizar:

### Rollback Rapido

```bash
# Restaurar desde respaldo
cd ..
rm -rf current-project
tar -xzf backups/triviaiox-backup-YYYYMMDD-HHMMSS.tar.gz

# Reinstalar version anterior
npm install -g triviaiox-core@<previous-version>

# Verificar rollback
triviaiox --version
```

### Rollback Selectivo

```bash
# Restaurar componentes especificos
cp ../backups/config-backup.json .triviaiox-core/config.json
cp -r ../backups/custom-agents/* .triviaiox-core/agents/custom/

# Reinstalar dependencias
npm install
```

## Solucion de Problemas

### Problemas Comunes

#### Falla la Instalacion

```bash
# Limpiar cache de npm
npm cache clean --force

# Intentar con logging detallado
npm install -g triviaiox-core@latest --verbose

# Verificar permisos de npm
npm config get prefix
```

#### Agentes No Cargan

```bash
# Reconstruir manifiestos de agentes
triviaiox rebuild --manifests

# Verificar dependencias de agentes
triviaiox verify --agents --verbose

# Verificar sintaxis de agentes
triviaiox validate agents
```

#### Errores de Configuracion

```bash
# Validar configuracion
triviaiox config validate --verbose

# Restablecer a valores por defecto (cuidado!)
triviaiox config reset --backup

# Reparar configuracion
triviaiox config repair
```

#### Problemas de Capa de Memoria

```bash
# Reconstruir indices de memoria
triviaiox memory rebuild

# Verificar integridad de memoria
triviaiox memory verify

# Limpiar y reinicializar
triviaiox memory reset
```

### Obtener Ayuda

Si encuentras problemas no cubiertos aqui:

1. **Verificar Logs**: Revisar `.triviaiox-core/logs/upgrade.log`
2. **GitHub Issues**: [github.com/Trivia-Growth/Triviaiox/issues](https://github.com/Trivia-Growth/Triviaiox/issues)
3. **Comunidad Discord**: [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)
4. **Documentacion**: [directorio docs](./getting-started.md)

## Notas Especificas de Version

### Actualizando a v4.2

**Cambios Clave:**
- Capacidades mejoradas del meta-agente
- Rendimiento mejorado de la capa de memoria
- Funciones de seguridad actualizadas
- Proceso de instalacion simplificado

**Cambios que Rompen Compatibilidad:**
- Ninguno (compatible hacia atras con v4.0+)

**Nuevas Funcionalidades:**
- Mejoras del meta-agente `triviaiox-developer`
- Asistente de instalacion interactivo
- Herramientas de monitoreo de rendimiento

**Deprecaciones:**
- Sintaxis de comandos legacy (aun soportada con advertencias)

---

**Ultima Actualizacion:** 2025-08-01
**Version Actual:** v4.2.11
