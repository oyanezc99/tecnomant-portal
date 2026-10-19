# Verificación local del portal y su integración

Fecha: 19 de octubre de 2026.

## Ramas

- Portal: feature/mejoras-portal.
- API: feature/mantenimientos-equipos-tecnicos-ordenes.
- Android: feature/fotos-evidencia.

Se trabajó sobre esas ramas, conservando los cambios anteriores. No se hizo push.

## Cambios del portal

- Tablas de Órdenes, Equipos e Inspecciones adaptadas a celular y escritorio, filtros con etiquetas y acciones que se acomodan al ancho disponible.
- Órdenes con creación, asignación de equipo/técnico/fecha, edición y eliminación antes de inspeccionar. Consulta administrativa con todos los estados y calendario.
- Edición de equipos con la URL correcta y el ID de cliente numérico.
- Historial de órdenes y de inspecciones por ID de equipo.
- Carga de técnicos basada en órdenes activas por ID; perfil sin mezclar técnicos que compartan nombre.
- Dashboard que cuenta todas las inspecciones del mes, muestra período y total, sin confundir estado del equipo y avance de la orden.
- Sesión con token, cierre y manejo de expiración. Las claves de técnicos no se reciben ni se precargan al editar.
- Separación visual de Técnicos y botones de exportación sin emojis.
- Validación de Contacto alineada con el backend: admite nombres o teléfonos, hasta 150 caracteres.

## Resultados

- 68 pruebas unitarias del portal correctas, incluida regresión de carga operativa y mantenimiento de órdenes. Los cinco fallos antiguos quedaron resueltos: pruebas de menú/ruta actualizadas a módulos habilitados y validación de contacto corregida.
- Compilación de producción correcta.
- Listados comprobados a 320, 390, 768 y 1280 píxeles. Calendario y tablas de historial se desplazan dentro de su panel cuando necesitan más ancho.
- Pruebas HTTP de alta, edición y eliminación de órdenes sin inspección, edición de equipo, acceso por rol, recepción de inspecciones y reintento idempotente.
- API: 32 pruebas unitarias correctas.
- Android: 24 pruebas unitarias y una prueba instrumentada de integración correctas en emulador Android 16.
- La prueba instrumentada descargó órdenes, guardó checklist y fotos en SQLite, cortó Wi-Fi y datos, comprobó conservación sin red, recuperó la conexión y dejó que JobScheduler enviara la cola FIFO. Comprobó estado local Completada y bloqueo de edición/borrado tras sincronizar.
- El portal mostró las inspecciones generadas en Android, los cinco ítems y la fotografía servida con sesión. SQL Server confirmó el orden de inserción de la cola.

## Preparación necesaria

Actualizar los tres repositorios juntos. En la API ejecutar db/03_claves_seguras.sql sobre TecnoMantDB antes de arrancar; conservar config/db.local.env fuera de Git. Se amplía el campo de clave y se asegura unicidad de usuario. Las claves anteriores se convierten a PBKDF2 al iniciar la API. Reiniciar el servidor requiere iniciar sesión otra vez, ya que los tokens son locales al proceso y caducan a las 12 horas.

## Alcance de la comprobación

La prueba es local y utiliza registros ficticios y una foto generada para pruebas. No certifica disponibilidad del 99.5 %, rendimiento bajo carga, despliegue HTTPS ni cámara en teléfono físico. El informe Word y los PDF originales no fueron modificados en esta iteración.
