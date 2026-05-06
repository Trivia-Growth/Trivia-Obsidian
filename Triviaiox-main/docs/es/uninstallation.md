<!--
  Traducción: ES
  Original: /docs/en/uninstallation.md
  Última sincronización: 2026-01-26
-->

# Guía de Desinstalación

> 🌐 [EN](../uninstallation.md) | [PT](../pt/uninstallation.md) | **ES**

---

Esta guía proporciona instrucciones completas para desinstalar TriviaGrowth Triviaiox de su sistema.

## Tabla de Contenidos

1. [Antes de Desinstalar](#antes-de-desinstalar)
2. [Desinstalación Rápida](#desinstalación-rápida)
3. [Desinstalación Completa](#desinstalación-completa)
4. [Desinstalación Selectiva](#desinstalación-selectiva)
5. [Preservación de Datos](#preservación-de-datos)
6. [Eliminación Limpia del Sistema](#eliminación-limpia-del-sistema)
7. [Resolución de Problemas de Desinstalación](#resolución-de-problemas-de-desinstalación)
8. [Limpieza Post-Desinstalación](#limpieza-post-desinstalación)
9. [Reinstalación](#reinstalación)

## Antes de Desinstalar

### Consideraciones Importantes

⚠️ **Advertencia**: Desinstalar TriviaGrowth Triviaiox:

- Eliminará todos los archivos del framework
- Borrará configuraciones de agentes (a menos que se preserven)
- Limpiará datos de la capa de memoria (a menos que se respalden)
- Eliminará todos los flujos de trabajo personalizados
- Borrará logs y archivos temporales

### Checklist Pre-Desinstalación

- [ ] Respaldar datos importantes
- [ ] Exportar agentes y flujos de trabajo personalizados
- [ ] Guardar claves API y configuraciones
- [ ] Documentar modificaciones personalizadas
- [ ] Detener todos los procesos en ejecución
- [ ] Informar a los miembros del equipo

### Respalde Sus Datos

```bash
# Crear respaldo completo
npx triviaiox-core backup --complete

# O respaldar manualmente directorios importantes
tar -czf triviaiox-backup-$(date +%Y%m%d).tar.gz \
  .triviaiox/ \
  agents/ \
  workflows/ \
  tasks/ \
  --exclude=.triviaiox/logs \
  --exclude=.triviaiox/cache
```

## Desinstalación Rápida

### Usando el Desinstalador Incorporado

La forma más rápida de desinstalar TriviaGrowth Triviaiox:

```bash
# Desinstalación básica (preserva datos de usuario)
npx triviaiox-core uninstall

# Desinstalación completa (elimina todo)
npx triviaiox-core uninstall --complete

# Desinstalación con preservación de datos
npx triviaiox-core uninstall --keep-data
```

### Desinstalación Interactiva

Para desinstalación guiada:

```bash
npx triviaiox-core uninstall --interactive
```

Esto le preguntará:

- Qué mantener/eliminar
- Opciones de respaldo
- Confirmación para cada paso

## Desinstalación Completa

### Paso 1: Detener Todos los Servicios

```bash
# Detener todos los agentes en ejecución
*deactivate --all

# Detener todos los flujos de trabajo
*stop-workflow --all

# Apagar meta-agent
*shutdown
```

### Paso 2: Exportar Datos Importantes

```bash
# Exportar configuraciones
*export config --destination backup/config.json

# Exportar agentes
*export agents --destination backup/agents/

# Exportar flujos de trabajo
*export workflows --destination backup/workflows/

# Exportar datos de memoria
*export memory --destination backup/memory.zip
```

### Paso 3: Ejecutar el Desinstalador

```bash
# Eliminación completa
npx triviaiox-core uninstall --complete --no-backup
```

### Paso 4: Eliminar Instalación Global

```bash
# Eliminar paquete npm global
npm uninstall -g triviaiox-core

# Eliminar cache de npx
npm cache clean --force
```

### Paso 5: Limpiar Archivos del Sistema

#### Windows

```powershell
# Eliminar archivos de AppData
Remove-Item -Recurse -Force "$env:APPDATA\triviaiox-core"

# Eliminar archivos temporales
Remove-Item -Recurse -Force "$env:TEMP\triviaiox-*"

# Eliminar entradas del registro (si las hay)
Remove-Item -Path "HKCU:\Software\TriviaGrowth Triviaiox" -Recurse
```

#### macOS/Linux

```bash
# Eliminar archivos de configuración
rm -rf ~/.triviaiox
rm -rf ~/.config/triviaiox-core

# Eliminar cache
rm -rf ~/.cache/triviaiox-core

# Eliminar archivos temporales
rm -rf /tmp/triviaiox-*
```

## Desinstalación Selectiva

### Eliminar Componentes Específicos

```bash
# Eliminar solo agentes
npx triviaiox-core uninstall agents

# Eliminar solo flujos de trabajo
npx triviaiox-core uninstall workflows

# Eliminar capa de memoria
npx triviaiox-core uninstall memory-layer

# Eliminar agente específico
*uninstall agent-name
```

### Mantener Core, Eliminar Extensiones

```bash
# Eliminar todos los plugins
*plugin remove --all

# Eliminar Squads
rm -rf Squads/

# Eliminar plantillas personalizadas
rm -rf templates/custom/
```

## Preservación de Datos

### Qué Mantener

Antes de desinstalar, identifique lo que desea preservar:

1. **Agentes Personalizados**

   ```bash
   # Copiar agentes personalizados
   cp -r agents/custom/ ~/triviaiox-backup/agents/
   ```

2. **Flujos de Trabajo y Tareas**

   ```bash
   # Copiar flujos de trabajo
   cp -r workflows/ ~/triviaiox-backup/workflows/
   cp -r tasks/ ~/triviaiox-backup/tasks/
   ```

3. **Datos de Memoria**

   ```bash
   # Exportar base de datos de memoria
   *memory export --format sqlite \
     --destination ~/triviaiox-backup/memory.db
   ```

4. **Configuraciones**

   ```bash
   # Copiar todos los archivos de configuración
   cp .triviaiox/config.json ~/triviaiox-backup/
   cp .env ~/triviaiox-backup/
   ```

5. **Código Personalizado**
   ```bash
   # Encontrar y respaldar archivos personalizados
   find . -name "*.custom.*" -exec cp {} ~/triviaiox-backup/custom/ \;
   ```

### Script de Preservación

Crear `preserve-data.sh`:

```bash
#!/bin/bash
BACKUP_DIR="$HOME/triviaiox-backup-$(date +%Y%m%d-%H%M%S)"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Función de respaldo
backup_if_exists() {
    if [ -e "$1" ]; then
        echo "Backing up $1..."
        cp -r "$1" "$BACKUP_DIR/"
    fi
}

# Respaldar todos los datos importantes
backup_if_exists ".triviaiox"
backup_if_exists "agents"
backup_if_exists "workflows"
backup_if_exists "tasks"
backup_if_exists "templates"
backup_if_exists ".env"
backup_if_exists "package.json"

echo "Backup completed at: $BACKUP_DIR"
```

## Eliminación Limpia del Sistema

### Script de Limpieza Completa

Crear `clean-uninstall.sh`:

```bash
#!/bin/bash
echo "TriviaGrowth Triviaiox Complete Uninstall"
echo "================================="

# Confirmación
read -p "This will remove ALL TriviaGrowth Triviaiox data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Detener todos los procesos
echo "Stopping all processes..."
pkill -f "triviaiox-core" || true
pkill -f "triviaiox-developer" || true

# Eliminar archivos del proyecto
echo "Removing project files..."
rm -rf .triviaiox/
rm -rf agents/
rm -rf workflows/
rm -rf tasks/
rm -rf templates/
rm -rf Squads/
rm -rf node_modules/triviaiox-core/

# Eliminar archivos globales
echo "Removing global files..."
npm uninstall -g triviaiox-core

# Eliminar datos de usuario
echo "Removing user data..."
rm -rf ~/.triviaiox
rm -rf ~/.config/triviaiox-core
rm -rf ~/.cache/triviaiox-core

# Limpiar cache de npm
echo "Cleaning npm cache..."
npm cache clean --force

# Eliminar de package.json
echo "Updating package.json..."
npm uninstall triviaiox-core/core
npm uninstall triviaiox-core/memory
npm uninstall triviaiox-core/meta-agent

echo "Uninstall complete!"
```

### Limpieza del Registro (Windows)

```powershell
# Script PowerShell para limpieza de Windows
Write-Host "Cleaning TriviaGrowth Triviaiox from Windows Registry..."

# Eliminar del PATH
$path = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = ($path.Split(';') | Where-Object { $_ -notmatch 'triviaiox-core' }) -join ';'
[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")

# Eliminar claves del registro
Remove-ItemProperty -Path "HKCU:\Environment" -Name "TRIVIAIOX_*" -ErrorAction SilentlyContinue

# Eliminar asociaciones de archivos
Remove-Item -Path "HKCU:\Software\Classes\.triviaiox" -Recurse -ErrorAction SilentlyContinue

Write-Host "Registry cleanup complete!"
```

## Resolución de Problemas de Desinstalación

### Problemas Comunes

#### 1. Permiso Denegado

```bash
# Linux/macOS
sudo npx triviaiox-core uninstall --complete

# Windows (Ejecutar como Administrador)
npx triviaiox-core uninstall --complete
```

#### 2. Proceso Todavía en Ejecución

```bash
# Forzar detención de todos los procesos
# Linux/macOS
killall -9 node
killall -9 triviaiox-core

# Windows
taskkill /F /IM node.exe
taskkill /F /IM triviaiox-core.exe
```

#### 3. Archivos Bloqueados

```bash
# Encontrar procesos usando archivos
# Linux/macOS
lsof | grep triviaiox

# Windows (PowerShell)
Get-Process | Where-Object {$_.Path -like "*triviaiox*"}
```

#### 4. Eliminación Incompleta

```bash
# Limpieza manual
find . -name "*triviaiox*" -type d -exec rm -rf {} +
find . -name "*.triviaiox*" -type f -delete
```

### Desinstalación Forzada

Si la desinstalación normal falla:

```bash
#!/bin/bash
# force-uninstall.sh
echo "Force uninstalling TriviaGrowth Triviaiox..."

# Matar todos los procesos relacionados
pkill -9 -f triviaiox || true

# Eliminar todos los archivos
rm -rf .triviaiox* triviaiox* *triviaiox*
rm -rf agents workflows tasks templates
rm -rf node_modules/triviaiox-core
rm -rf ~/.triviaiox* ~/.config/triviaiox* ~/.cache/triviaiox*

# Limpiar npm
npm cache clean --force
npm uninstall -g triviaiox-core

echo "Force uninstall complete!"
```

## Limpieza Post-Desinstalación

### 1. Verificar Eliminación

```bash
# Buscar archivos restantes
find . -name "*triviaiox*" 2>/dev/null
find ~ -name "*triviaiox*" 2>/dev/null

# Verificar paquetes npm
npm list -g | grep triviaiox
npm list | grep triviaiox

# Verificar procesos en ejecución
ps aux | grep triviaiox
```

### 2. Limpiar Variables de Entorno

```bash
# Eliminar de .bashrc/.zshrc
sed -i '/TRIVIAIOX_/d' ~/.bashrc
sed -i '/triviaiox-core/d' ~/.bashrc

# Eliminar de archivos .env
find . -name ".env*" -exec sed -i '/TRIVIAIOX_/d' {} \;
```

### 3. Actualizar Archivos del Proyecto

```javascript
// Eliminar de los scripts de package.json
{
  "scripts": {
    // Eliminar estas entradas
    "triviaiox": "triviaiox-core",
    "meta-agent": "triviaiox-core meta-agent"
  }
}
```

### 4. Limpiar Repositorio Git

```bash
# Eliminar hooks de git específicos de TRIVIAIOX
rm -f .git/hooks/*triviaiox*

# Actualizar .gitignore
sed -i '/.triviaiox/d' .gitignore
sed -i '/triviaiox-/d' .gitignore

# Commit de eliminación
git add -A
git commit -m "Remove TriviaGrowth Triviaiox"
```

## Reinstalación

### Después de Desinstalación Completa

Si desea reinstalar TriviaGrowth Triviaiox:

1. **Esperar la limpieza**

   ```bash
   # Asegurar que todos los procesos se detuvieron
   sleep 5
   ```

2. **Limpiar cache de npm**

   ```bash
   npm cache clean --force
   ```

3. **Instalación fresca**
   ```bash
   npx triviaiox-core@latest init my-project
   ```

### Restaurar desde Respaldo

```bash
# Restaurar datos guardados
cd my-project

# Restaurar configuraciones
cp ~/triviaiox-backup/config.json .triviaiox/

# Restaurar agentes
cp -r ~/triviaiox-backup/agents/* ./agents/

# Importar memoria
*memory import ~/triviaiox-backup/memory.zip

# Verificar restauración
*doctor --verify-restore
```

## Checklist de Verificación de Desinstalación

- [ ] Todos los procesos TRIVIAIOX detenidos
- [ ] Archivos del proyecto eliminados
- [ ] Paquete npm global desinstalado
- [ ] Archivos de configuración de usuario eliminados
- [ ] Directorios de cache limpiados
- [ ] Variables de entorno eliminadas
- [ ] Entradas del registro limpiadas (Windows)
- [ ] Repositorio Git actualizado
- [ ] No se encontraron archivos TRIVIAIOX restantes
- [ ] PATH del sistema actualizado

## Obtener Ayuda

Si encuentra problemas durante la desinstalación:

1. **Consultar Documentación**
   - [FAQ](https://github.com/Trivia-Growth/Triviaiox/wiki/faq#uninstall)
   - [Solución de Problemas](https://github.com/Trivia-Growth/Triviaiox/wiki/troubleshooting)

2. **Soporte de la Comunidad**
   - Discord: #uninstall-help
   - GitHub Issues: Etiquetar con "uninstall"

3. **Soporte de Emergencia**
   ```bash
   # Generar reporte de desinstalación
   npx triviaiox-core diagnose --uninstall > uninstall-report.log
   ```

---

**Recuerde**: Siempre respalde sus datos antes de desinstalar. El proceso de desinstalación es irreversible, y la recuperación de datos puede no ser posible sin respaldos adecuados.
