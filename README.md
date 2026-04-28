# Savio App - Versión Multiplataforma (Windows / Mac / Android / iOS)

Savio App es la aplicación móvil oficial de la Universidad Tecnológica de Bolívar (UTB), basada en el núcleo de Moodle App (v5.1.0). Esta versión ha sido optimizada para ser 100% compatible con entornos de desarrollo Windows, eliminando las dependencias estrictas de Bash que impedían su compilación en PC.

*   [Universidad Tecnológica de Bolívar](https://www.utb.edu.co/)
*   [Basado en Moodle Mobile](https://github.com/moodlehq/moodleapp)
*   **Bundle ID:** com.utb.savioapp

---

## Configuración del Entorno de Compilación

### Requisitos de Software
*   **Node.js:** Versión v22.x (Recomendado v22.17.0+).
*   **JDK:** Versión 17 o 21.
*   **Android Studio:** Con SDK, Platform Tools, Build Tools y Command Line Tools.
*   **Para iOS:** macOS con Xcode 15+ (Opcional).

### Variables de Entorno (IMPORTANTE)
Para compilar correctamente en Windows, configura estas variables de entorno del sistema:

1.  **JAVA_HOME**: Ruta a la carpeta del JDK (Ej: C:\Program Files\Java\jdk-21).
2.  **ANDROID_HOME**: Ruta al SDK de Android.
3.  **NODE_OPTIONS**: Valor --max-old-space-size=8192 (Evita errores de memoria durante la compilación de Angular).
4.  **Path**: Asegúrate de incluir %JAVA_HOME%\bin, %ANDROID_HOME%\platform-tools y %ANDROID_HOME%\cmdline-tools\latest\bin.

---

## Instalación y Ejecución

Sigue estos pasos en una terminal (PowerShell o CMD) tras clonar el repositorio:

### 1. Preparar Herramientas Globales
```powershell
npm install -g @ionic/cli cordova native-run cordova-res
```

### 2. Instalar el proyecto
```powershell
npm install --legacy-peer-deps
```

### 3. Configurar plataforma Android
```powershell
ionic cordova platform add android
```

### 4. Lanzar la aplicación
*   **En el Navegador (Sólo diseño/lógica):**
    ```powershell
    ionic serve
    ```
    *Nota: Requiere desactivar CORS en el navegador para conectar con el servidor de Savio.*

*   **En el Celular (Físico):**
    Conecta tu móvil por USB con Depuración activada y ejecuta:
    ```powershell
    npm run dev:android
    ```

---

## Ajustes Multiplataforma Realizados
A diferencia de la versión original, este repositorio incluye:
*   **scripts/serve.js**: Puente en Node.js para que el servidor de Ionic funcione en Windows sin necesidad de Git Bash.
*   **Package.json Universal**: Comandos adaptados para invocar scripts de forma cruzada (node scripts/build.js).
*   **.gitignore Optimizado**: Se excluyen cachés pesadas de Angular (>300MB) para permitir subidas a GitHub sin errores de tamaño.

---

## Correcciones y Mejoras
*   Título de la App corregido a "Savio App".
*   Dark Mode completo y detallado.
*   Configuración de Firebase dividida (google-services.json y GoogleService-Info.plist).
*   Compatibilidad con Cordova y Capacitor simultánea.

---

## Licencia
[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
