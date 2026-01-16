# Installer UX - Hyuga v2 (Spanish)

## 1) Installer Type
- Classic EXE wizard (Inno Setup)
- Offline-friendly, no command line required

## 2) Defaults
- Install path: `C:\Hyuga`
- Shortcuts: Desktop + Start Menu
- Language: Spanish (installer + app)

## 3) Wizard Steps (Spanish Copy)
1) **Bienvenida**
   - Texto: "Bienvenido al instalador de Hyuga"
   - Botones: Siguiente, Cancelar

2) **Ruta de instalación**
   - Texto: "Seleccione la carpeta de instalación"
   - Campo editable + botón Examinar
   - Default: `C:\Hyuga`

3) **Accesos directos**
   - Checkbox: "Crear acceso directo en el Escritorio" (on by default)
   - Checkbox: "Crear acceso directo en el Menú Inicio" (on by default)

4) **Listo para instalar**
   - Resumen de ruta y accesos directos
   - Botones: Instalar, Atrás, Cancelar

5) **Instalación completa**
   - Texto: "Hyuga se instaló correctamente"
   - Checkbox: "Abrir Hyuga ahora" (on by default)
   - Botón: Finalizar

## 4) Update Flow (Initial)
- Updates are applied by running a newer installer EXE.
- No in-app auto-update in MVP.
- If app is already installed, the installer should offer to continue and replace files.

## 5) First-Run Behavior
- On first launch, show a simple welcome screen with primary action: "Crear nuevo lote".

## 6) Nice-to-Have (Future)
- Installer detects newer versions and prompts "Actualizar".
