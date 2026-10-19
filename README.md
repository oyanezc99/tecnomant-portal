# TecnoMant · Portal administrativo

Portal web para el personal administrativo de TecnoMant. Permite ver cómo van las órdenes de trabajo, revisar las inspecciones que registran los técnicos (checklist y fotos) y mantener los datos de los clientes.

Está hecho con Angular 18 (componentes standalone) y CSS propio, sin librerías de interfaz. Consume la API REST de TecnoMant.

## Funciones de esta rama

- Login de administrador con sesión Bearer; la API valida los permisos de cada petición.
- Dashboard con órdenes por estado e inspecciones realizadas por día del mes.
- Mantenimiento de clientes, equipos y técnicos. La clave del técnico no se devuelve al navegador y puede conservarse al editar.
- Órdenes: crear, asignar equipo/técnico/fecha, editar y eliminar antes de la inspección; consulta de todos los estados, filtros y calendario.
- Historial por ID de equipo, órdenes asociadas e inspecciones con checklist y fotos protegidas por sesión.
- Carga operativa calculada con órdenes Pendiente y En proceso por ID de técnico.
- Listados adaptables, paginación y exportación CSV.

## Requisitos previos

- **Node.js** 18.19 o superior (también sirven 20.11 o superior y 22). Trae `npm`.
- **Git**, para clonar el repositorio.
- **Google Chrome**, solo para ejecutar las pruebas.
- **La API de TecnoMant** en marcha en `http://localhost:5080`.

## Dependencias

Se instalan solas con `npm install`; la lista completa está en `package.json`.

| Para qué | Paquetes |
|---|---|
| La aplicación | Angular 18.2 (`@angular/core`, `@angular/common`, `@angular/compiler`, `@angular/forms`, `@angular/router`, `@angular/platform-browser`, `@angular/platform-browser-dynamic`, `@angular/animations`), `rxjs` 7.8, `zone.js` 0.14 y `tslib` |
| Compilar | `@angular/cli` y `@angular-devkit/build-angular` 18.2, `@angular/compiler-cli` y `typescript` 5.5 |
| Pruebas | `jasmine-core` 5.2, `karma` 6.4, `karma-jasmine`, `karma-chrome-launcher`, `karma-coverage` y `karma-jasmine-html-reporter` |

No usa librerías de interfaz, de estilos ni de gráficos.

## Instalación

```bash
git clone https://github.com/oyanezc99/tecnomant-portal.git
cd tecnomant-portal
npm install
```

## Configuración

El portal no usa variables de entorno ni archivos `.env`. Su única configuración es la dirección de la API:

| Archivo | Valor | Qué es |
|---|---|---|
| `src/environments/environment.ts` | `apiUrl: 'http://localhost:5080'` | Dirección base de la API de TecnoMant |

Si la API está en otra dirección, cambia ese valor y vuelve a ejecutar el portal.

Estas variables se configuran en el proyecto de la API, no en este:

| Variable de la API | Para qué sirve |
|---|---|
| `ConnectionStrings__TecnoMantDB` | Conexión a la base de datos |
| `Admin__Usuario` y `Admin__Clave` | Usuario y clave del administrador que entra al portal |

La API debe escuchar en el puerto 5080 y aceptar llamadas del navegador (CORS) desde `http://localhost:4200`. Por eso el portal se abre siempre en esa dirección.

Opcional, solo para las pruebas: si Karma no encuentra Chrome, define la variable de entorno `CHROME_BIN` con la ruta de `chrome.exe`.

## Cómo se ejecuta

1. Enciende la API de TecnoMant en `http://localhost:5080`.
2. En la carpeta del portal, ejecuta:

   ```bash
   npm start
   ```

3. Abre `http://localhost:4200` en Chrome o Edge.
4. Inicia sesión con el usuario administrador configurado en la API.

La primera vez, Angular puede preguntar si quieres compartir datos de uso anónimos; responde lo que prefieras.

Este repositorio no guarda usuarios ni claves. Si la API está apagada, el portal muestra "No se pudo conectar con la API" con el botón **Reintentar**.

## Ejecutar las pruebas

Las pruebas unitarias usan Jasmine y Karma, y corren en Chrome sin ventana. No necesitan la API: todas las llamadas se simulan.

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include "src/app/**/*.spec.ts"
```

## Compilar

```bash
npm run build
```

El resultado queda en `dist/tecnomant-portal`.

## Estructura del código

```text
src/
  styles.css             Variables de color, tipografía, piezas comunes y animaciones
  environments/          Dirección de la API
  app/
    core/                Modelos, acceso a la API, sesión, guard, errores, avisos, fecha y conteo
    shared/              Avisos, badge, error de conexión, filas esqueleto y modal
    layout/              Barra superior, menú lateral y contenido
    pages/               Login, Dashboard, Clientes, Inspecciones y detalle de inspección
    testing/             Datos y ayudas de las pruebas
```

## Sesión y entorno local

La sesión caduca a las 12 horas y se invalida al cerrar sesión. Reiniciar la API requiere iniciar sesión otra vez, porque el registro de tokens es local al proceso. El portal guarda rol, nombre y token en sessionStorage; nunca la contraseña. Las fotografías requieren la cookie HttpOnly emitida al iniciar sesión.

Usar la rama feature/mantenimientos-equipos-tecnicos-ordenes de la API con la migración db/03_claves_seguras.sql. El despliegue con HTTPS y la medición de disponibilidad/rendimiento quedan fuera de la prueba local.
