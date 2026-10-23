# Pruebas no funcionales — ZENDA

<!--
  ¿Qué? Pruebas de los atributos de calidad: seguridad, rendimiento, accesibilidad, portabilidad, disponibilidad, integridad y manejo de archivos.
  ¿Para qué? Comprobar que el sistema, además de funcionar, es seguro, rápido, usable y mantenible.
  ¿Impacto? Un sistema que "funciona" pero filtra datos, se cae con diez usuarios o excluye a personas no está terminado.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Pruebas** | 82 |
| **Ejecutables hoy (v11)** | 49 |
| **Requieren v12** | 33 |
| **Origen** | Requisitos no funcionales [RNF-001 a RNF-015](../requisitos/RNFs/) y restricciones |
| **Plan** | [Plan de pruebas](plan-de-pruebas.md) |
| **Fecha** | Octubre 2026 |

**Columna "Ejecutable":** `Hoy` se puede ejecutar sobre v11 (y varias fallan a propósito: son los [hallazgos](hallazgos.md)); `v12` necesita una funcionalidad aprobada que aún no existe.

> Las metas numéricas (tiempos, umbrales) son **referencias propuestas** en los RNF; el equipo las confirma antes de usarlas como criterio de aprobación.

---

## 1. Resumen por categoría

| Categoría | Prefijo | Pruebas | Requisitos |
| --- | --- | --- | --- |
| Seguridad | `PNF-S` | 22 |  |
| Rendimiento | `PNF-R` | 10 |  |
| Usabilidad y accesibilidad | `PNF-A` | 15 |  |
| Compatibilidad y portabilidad | `PNF-C` | 6 |  |
| Disponibilidad y despliegue | `PNF-D` | 10 |  |
| Integridad y concurrencia | `PNF-I` | 12 |  |
| Archivos y almacenamiento | `PNF-F` | 7 |  |

---

## 2. Pruebas

### Seguridad

Basadas en el Top 10 de OWASP y en [RNF-001](../requisitos/RNFs/RNF-001_seguridad.md). Varias fallan hoy a propósito: son los [hallazgos](hallazgos.md) de v11.

| ID | Requisito | Prueba | Procedimiento | Criterio de aceptación | Herramienta | Prioridad | Ejecutable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PNF-S01 | [RNF-001.1](../requisitos/RNFs/RNF-001_seguridad.md) | Hash de contraseñas | Consultar `usuarios.contrasena` y revisar las respuestas de la API. | Prefijo bcrypt (`$2a$` o `$2b$`, costo 10); ninguna respuesta incluye el campo `contrasena`. | SQL + Supertest | Alta | Hoy |
| PNF-S02 | [RNF-001.5](../requisitos/RNFs/RNF-001_seguridad.md) | Inyección SQL | Enviar `' OR '1'='1` y `'; DROP TABLE usuarios;--` en correo, contraseña y parámetros de ruta. | Respuesta `400` o `401` sin texto de error SQL; la base de datos no cambia. | Supertest, ZAP | Alta | Hoy |
| PNF-S03 | [RNF-001.2](../requisitos/RNFs/RNF-001_seguridad.md) | JWT manipulado | Alterar el payload (rol) o la firma, y probar `alg: none`. | `401` en todos los casos. | Supertest | Alta | Hoy |
| PNF-S04 | [RNF-001.2](../requisitos/RNFs/RNF-001_seguridad.md) | JWT vencido | Usar un token después de su expiración (reloj simulado). | `401`. | Vitest + reloj simulado | Alta | Hoy |
| PNF-S05 | [RNF-001.4](../requisitos/RNFs/RNF-001_seguridad.md) | Autorización en el servidor | Ejecutar las 30 [pruebas de autorización](pruebas-de-integracion.md#3-pruebas-de-autorización-desde-la-matriz-de-permisos). | 100 % rechazadas con el código esperado y sin cambios en la base. | Supertest | Alta | Hoy |
| PNF-S06 | [RNF-001.6](../requisitos/RNFs/RNF-001_seguridad.md) | Enumeración de usuarios | Comparar `forgot-password` y `login` con un correo existente y uno inexistente (código, cuerpo y tiempo). | Respuestas idénticas. **Falla hoy:** `forgot-password` responde `404` ([H-01](hallazgos.md)). | Supertest | Alta | Hoy |
| PNF-S07 | [RNF-001.7](../requisitos/RNFs/RNF-001_seguridad.md) | Límite de intentos | Enviar 10 inicios de sesión fallidos en un minuto desde la misma IP. | `429` o bloqueo temporal a partir del límite configurado. | k6, Supertest | Media | v12 |
| PNF-S08 | [RNF-001.7](../requisitos/RNFs/RNF-001_seguridad.md) | Campo trampa (*honeypot*) | Enviar el registro con el campo trampa relleno. | Rechazado sin crear la cuenta. | Supertest | Media | v12 |
| PNF-S09 | [RNF-001.9](../requisitos/RNFs/RNF-001_seguridad.md) | CORS | Enviar un preflight `OPTIONS` desde un origen no permitido y desde el del frontend. | Sin `Access-Control-Allow-Origin` para el origen ajeno. **Falla hoy:** `cors()` acepta cualquiera ([H-04](hallazgos.md)). | curl | Media | Hoy |
| PNF-S10 | [RNF-001.10](../requisitos/RNFs/RNF-001_seguridad.md) | Cabeceras de seguridad | `curl -I` al frontend y a la API. | Presentes `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`; `Strict-Transport-Security` bajo HTTPS. | curl, ZAP | Media | Hoy |
| PNF-S11 | [RNF-001.3](../requisitos/RNFs/RNF-001_seguridad.md) | Secretos en el repositorio | Ejecutar `gitleaks` sobre el historial y buscar `zenda_secret_key` en el código. | Cero hallazgos. **Falla hoy** ([H-02](hallazgos.md)). | gitleaks, grep | Alta | Hoy |
| PNF-S12 | [RNF-001.3](../requisitos/RNFs/RNF-001_seguridad.md) | Arranque sin `JWT_SECRET` | Iniciar el backend sin esa variable. | El servidor se detiene con un mensaje claro. | Manual | Alta | v12 |
| PNF-S13 | [RNF-001.5](../requisitos/RNFs/RNF-001_seguridad.md) | XSS almacenado | Crear nombre de proyecto, carpeta y observación con `<script>alert(1)</script>` y abrirlos. | Se muestra como texto; el script no se ejecuta. | Playwright, ZAP | Alta | Hoy |
| PNF-S14 | [RNF-001.4](../requisitos/RNFs/RNF-001_seguridad.md) | Asignación masiva (*mass assignment*) | Registrarse enviando `rol: "ADMINISTRADOR"`. | El rol ignorado: la cuenta se crea como `APRENDIZ`. | Supertest | Alta | Hoy |
| PNF-S15 | [RNF-001.11](../requisitos/RNFs/RNF-001_seguridad.md) | Confirmación de acciones críticas | Eliminar usuario y cambiar rol sin contraseña, y con una incorrecta. | Rechazadas; el usuario no cambia. | Supertest | Alta | Hoy |
| PNF-S16 | [RNF-001.12](../requisitos/RNFs/RNF-001_seguridad.md) | Archivos maliciosos | Subir un `.exe` renombrado `.pdf` y un SVG con script. | Rechazados por su contenido real. | Supertest | Alta | v12 |
| PNF-S17 | [RNF-001.12](../requisitos/RNFs/RNF-001_seguridad.md) | Descarga con autorización | Pedir el archivo de otro grupo con el token de un aprendiz. | `403`. | Supertest | Alta | v12 |
| PNF-S18 | [RNF-001.13](../requisitos/RNFs/RNF-001_seguridad.md) | Errores sin detalles técnicos | Provocar un JSON inválido, un identificador inexistente y una caída de la base de datos. | Mensaje genérico en español, sin trazas, SQL ni rutas del servidor. | Supertest | Media | Hoy |
| PNF-S19 | [RNF-001.5](../requisitos/RNFs/RNF-001_seguridad.md) | Dependencias vulnerables | `pnpm audit --prod` en backend y frontend. | Sin vulnerabilidades altas ni críticas. | pnpm audit | Alta | Hoy |
| PNF-S20 | [RNF-001.10](../requisitos/RNFs/RNF-001_seguridad.md) | Escaneo base con ZAP | Ejecutar ZAP *baseline* contra el entorno de pruebas. | Sin alertas de riesgo alto. | OWASP ZAP | Media | Hoy |
| PNF-S21 | [RNF-001.2](../requisitos/RNFs/RNF-001_seguridad.md) | Almacenamiento del token | Inspeccionar `localStorage` tras iniciar y cerrar sesión. | Solo el token necesario; se borra al cerrar sesión ([H-13](hallazgos.md)). | Playwright | Media | Hoy |
| PNF-S22 | [RNF-001.7](../requisitos/RNFs/RNF-001_seguridad.md) | Límite en recuperación de contraseña | Enviar 5 solicitudes por minuto para el mismo correo. | A partir del límite, `429`. | Supertest | Media | v12 |

### Rendimiento

Basadas en [RNF-002](../requisitos/RNFs/RNF-002_rendimiento.md) y [RNF-010](../requisitos/RNFs/RNF-010_escalabilidad.md). Las metas son referencias propuestas.

| ID | Requisito | Prueba | Procedimiento | Criterio de aceptación | Herramienta | Prioridad | Ejecutable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PNF-R01 | [RNF-002.1](../requisitos/RNFs/RNF-002_rendimiento.md) | Latencia de lectura | k6: 50 usuarios virtuales durante 2 minutos sobre `GET /aprendiz/proyectos/mio` y `GET /instructor/fichas`. | p95 menor a 500 ms y errores menores a 1 %. | k6 | Alta | Hoy |
| PNF-R02 | [RNF-002.1](../requisitos/RNFs/RNF-002_rendimiento.md) | Latencia de escritura | k6: crear evidencia (enlace), crear tarea y evaluar, con 20 usuarios virtuales. | p95 menor a 1 s. | k6 | Alta | Hoy |
| PNF-R03 | [RNF-002.7](../requisitos/RNFs/RNF-002_rendimiento.md) | Interacciones básicas | Medir abrir un listado y guardar un formulario. | Menos de 3 s. | Playwright | Media | Hoy |
| PNF-R04 | [RNF-002.8](../requisitos/RNFs/RNF-002_rendimiento.md) | Paneles de resumen | Cargar el panel de cada rol con un *seed* ampliado (1 000 evidencias). | Menos de 10 s. | Playwright | Media | Hoy |
| PNF-R05 | [RNF-002.2](../requisitos/RNFs/RNF-002_rendimiento.md) | Carga inicial del frontend | Lighthouse sobre la página de inicio con red de 10 Mbps simulada. | Carga menor a 3 s; rendimiento de 80 o más; `gzip` y caché de `/assets` activos. | Lighthouse | Media | Hoy |
| PNF-R06 | [RNF-002.3](../requisitos/RNFs/RNF-002_rendimiento.md) | Índices | `EXPLAIN ANALYZE` de las 5 consultas más frecuentes con datos ampliados. | Sin recorridos secuenciales completos en tablas grandes. | SQL | Media | v12 |
| PNF-R07 | [RNF-002.4](../requisitos/RNFs/RNF-002_rendimiento.md) | Paginación | Listar 5 000 usuarios. | La API responde por páginas, no todo el listado. | Supertest | Media | v12 |
| PNF-R08 | [RNF-002.5](../requisitos/RNFs/RNF-002_rendimiento.md) | Pool de conexiones | 200 peticiones concurrentes y revisión de `pg_stat_activity`. | Sin errores de "too many clients" ni conexiones colgadas. | k6, SQL | Alta | Hoy |
| PNF-R09 | [RNF-010.1](../requisitos/RNFs/RNF-010_escalabilidad.md) | Crecimiento esperado | Base con 50 fichas, 500 usuarios y 5 000 evidencias; repetir las pruebas de latencia. | Dentro de las mismas metas. | k6 | Media | v12 |
| PNF-R10 | [RNF-002.6](../requisitos/RNFs/RNF-002_rendimiento.md) | Compresión de imágenes | Subir una imagen de 5 MB. | Resultado de 1 MB o menos, en menos de 3 s. | Supertest | Media | v12 |

### Usabilidad y accesibilidad

Basadas en [RNF-003](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) y [RNF-004](../requisitos/RNFs/RNF-004_accesibilidad.md). Cubren lo pedido por el instructor (contrastes, consistencia, menús).

| ID | Requisito | Prueba | Procedimiento | Criterio de aceptación | Herramienta | Prioridad | Ejecutable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PNF-A01 | [RNF-004.1](../requisitos/RNFs/RNF-004_accesibilidad.md) | Contraste en tema claro | axe-core y Lighthouse sobre las pantallas principales de cada rol. | Cero violaciones de `color-contrast` (4.5 : 1 texto normal; 3 : 1 texto grande y componentes). | axe-core | Alta | Hoy |
| PNF-A02 | [RNF-004.1](../requisitos/RNFs/RNF-004_accesibilidad.md) | Contraste en tema oscuro | Repetir con el tema oscuro, incluidas las gráficas. | Igual que en el tema claro. | axe-core | Alta | Hoy |
| PNF-A03 | [RNF-004.2](../requisitos/RNFs/RNF-004_accesibilidad.md) | Navegación por teclado | Completar registro, inicio de sesión y subida de evidencia solo con teclado. | Todo es alcanzable y el foco es visible. | Manual, Playwright | Media | Hoy |
| PNF-A04 | [RNF-004.3](../requisitos/RNFs/RNF-004_accesibilidad.md) | Etiquetas y roles ARIA | axe-core sobre las 10 pantallas principales. | Cero violaciones críticas o serias. | axe-core | Alta | Hoy |
| PNF-A05 | [RNF-004.4](../requisitos/RNFs/RNF-004_accesibilidad.md) | No depender solo del color | Revisar estados (aprobado, reprobado, pendiente) con un simulador de daltonismo. | Se distinguen por texto o icono. | Manual | Media | Hoy |
| PNF-A06 | [RNF-004.5](../requisitos/RNFs/RNF-004_accesibilidad.md) | Gestores de contraseñas | Autocompletar y pegar en la contraseña; pegar en la confirmación. | Permitido en contraseña; bloqueado solo en la confirmación. | Playwright | Media | v12 |
| PNF-A07 | [RNF-003.6](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Responsive a 360 px | Abrir las 10 pantallas principales con ancho de 360 px. | Sin desplazamiento horizontal ni elementos cortados. | Playwright | Media | Hoy |
| PNF-A08 | [RNF-003.1](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Consistencia de animaciones | Comparar los componentes equivalentes de una misma página. | Todos animan igual o ninguno. | Revisión visual | Baja | Hoy |
| PNF-A09 | [RNF-003.3](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Barra lateral y menú de tres puntos | Colapsar la barra y abrir el menú de una fila de tabla. | Solo iconos al colapsar; acciones secundarias dentro del menú. | Playwright | Media | v12 |
| PNF-A10 | [RNF-003.9](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Máximo 3 clics | Contar los clics desde el menú principal hasta 8 funciones clave. | Ninguna requiere más de 3. | Manual | Media | Hoy |
| PNF-A11 | [RNF-003.12](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Mensajes temporales | Provocar un aviso informativo y un error. | El aviso desaparece a los 10 s; el error permanece hasta cerrarse. | Playwright | Baja | v12 |
| PNF-A12 | [RNF-003.13](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Acciones destructivas | Revisar los botones de eliminar. | Estilo distinto y confirmación previa. | Revisión visual | Media | Hoy |
| PNF-A13 | [RNF-003.14](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Pérdida de conexión | Detener el backend durante una acción. | Mensaje claro y opción de reintentar. | Playwright | Media | Hoy |
| PNF-A14 | [RNF-003.7](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Volver al inicio | Abrir inicio de sesión y registro. | Hay un botón que lleva al inicio. | Playwright | Baja | v12 |
| PNF-A15 | [RNF-003.11](../requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) | Movimiento reducido | Activar `prefers-reduced-motion`. | Las animaciones se reducen o desaparecen. | Playwright | Baja | v12 |

### Compatibilidad y portabilidad

Basadas en [RNF-006](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md).

| ID | Requisito | Prueba | Procedimiento | Criterio de aceptación | Herramienta | Prioridad | Ejecutable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PNF-C01 | [RNF-006.1](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md) | Navegadores soportados | Ejecutar los 3 recorridos E2E en Chromium, Firefox y WebKit. | Los tres recorridos pasan en los tres navegadores. | Playwright | Alta | Hoy |
| PNF-C02 | [RNF-006.7](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md) | Codificación UTF-8 | Crear un usuario "Peña Núñez" y un proyecto con tildes, ñ y emoji; exportar a CSV y Excel. | Se guardan, se muestran y se exportan sin caracteres dañados. | Playwright | Media | Hoy |
| PNF-C03 | [RNF-006.2](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md) | Docker desde cero | Clonar en un equipo limpio y ejecutar `docker compose up --build`. | Los tres servicios sanos en menos de 10 minutos. | Manual | Alta | Hoy |
| PNF-C04 | [RNF-006.3](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md) | Instalación sin Docker | Seguir la [guía](../setup/sin-docker.md) en Windows y en Linux. | Se completa sin pasos fuera de la guía. | Manual | Media | Hoy |
| PNF-C05 | [RNF-006.4](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md) | Configuración por entorno | Cambiar `VITE_API_URL` y el puerto sin tocar el código. | El sistema funciona con la nueva configuración. | Manual | Media | Hoy |
| PNF-C06 | [RNF-006.5](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md) | Reporte en PDF | Generar el reporte en los 3 navegadores. | Contenido completo y legible en todos. | Manual | Baja | Hoy |

### Disponibilidad y despliegue

Basadas en [RNF-008](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md).

| ID | Requisito | Prueba | Procedimiento | Criterio de aceptación | Herramienta | Prioridad | Ejecutable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PNF-D01 | [RNF-008.1](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Instalación reproducible | Construir con el `pnpm-lock.yaml` desactualizado. | La construcción falla (`--frozen-lockfile`). | Docker | Media | Hoy |
| PNF-D02 | [RNF-008.1](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Proceso sin `root` | `docker compose exec backend id -u`. | Distinto de `0`. | Docker | Media | Hoy |
| PNF-D03 | [RNF-008.2](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Copia y restauración | `pg_dump`, restaurar en una base vacía y comparar conteos de tablas. | Los conteos coinciden. | pg_dump, SQL | Alta | Hoy |
| PNF-D04 | [RNF-008.3](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Comprobación de salud | `GET /api/health` con la base encendida y apagada. | `200` con base; error o estado degradado sin base. | curl | Media | Hoy |
| PNF-D05 | [RNF-008.4](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Reinicio automático | `docker kill` del backend. | Vuelve a estar saludable solo. | Docker | Media | Hoy |
| PNF-D06 | [RNF-008.7](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Actualización sin interrupción | Reemplazar el backend mientras corre k6. | Menos de 1 % de errores durante el cambio. | k6, Docker | Media | v12 |
| PNF-D07 | [RNF-008.8](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Copia antes de desplegar | Ejecutar el procedimiento de despliegue. | Genera un archivo de copia no vacío antes de aplicar cambios. | Manual | Media | v12 |
| PNF-D08 | [RNF-008.6](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | HTTPS | Pedir la URL por HTTP en producción. | Redirige a HTTPS con certificado válido. | curl | Alta | v12 |
| PNF-D09 | [RNF-008.5](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Diagnóstico del administrador | Abrir la sección Sistema. | Muestra estado del servidor, base de datos y última copia. | Playwright | Baja | v12 |
| PNF-D10 | [RNF-008.1](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md) | Migración con respaldo | Aplicar `002_semana2.sql`, restaurar el respaldo y repetir. | Ambos caminos terminan sin pérdida de datos ([IT-13](pruebas-de-integracion.md#it-13--migración-de-v11-a-v12)). | psql | Alta | v12 |

### Integridad y concurrencia

Basadas en [RNF-009](../requisitos/RNFs/RNF-009_integridad_de_datos.md) y [RNF-014](../requisitos/RNFs/RNF-014_concurrencia_y_consistencia.md).

| ID | Requisito | Prueba | Procedimiento | Criterio de aceptación | Herramienta | Prioridad | Ejecutable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PNF-I01 | [RNF-009.1](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Integridad referencial | Eliminar una ficha con grupos. | Error controlado, sin registros huérfanos. | Supertest, SQL | Alta | Hoy |
| PNF-I02 | [RNF-009.2](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Transacciones | Fallo forzado al crear un proyecto ([IT-03](pruebas-de-integracion.md#it-03--atomicidad-al-crear-un-proyecto)). | Nada queda a medias. | Vitest | Alta | Hoy |
| PNF-I03 | [RNF-009.3](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Trazabilidad de autoría | Revisar `evidencias`, `evaluaciones`, `observaciones` y `tareas` recién creadas. | Todas tienen autor y fecha. | SQL | Media | Hoy |
| PNF-I04 | [RNF-009.4](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Historial inmutable | Recalificar una evidencia 3 veces. | Hay 3 registros y solo uno vigente. | SQL | Alta | v12 |
| PNF-I05 | [RNF-009.5](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Borrado lógico | Eliminar una evidencia. | Sigue en la base con `eliminada = true` y deja de verse. | SQL | Media | v12 |
| PNF-I06 | [RNF-009.6](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Un proyecto activo por aprendiz | Dos aprendices crean proyecto y se unen al otro a la vez. | Cada aprendiz queda en un solo proyecto activo. | Vitest | Alta | Hoy |
| PNF-I07 | [RNF-014.1](../requisitos/RNFs/RNF-014_concurrencia_y_consistencia.md) | Cupo concurrente | [IT-12](pruebas-de-integracion.md#it-12--concurrencia-del-último-cupo). | Nunca se supera el cupo. | Vitest | Alta | v12 |
| PNF-I08 | [RNF-014.3](../requisitos/RNFs/RNF-014_concurrencia_y_consistencia.md) | Doble envío | Hacer doble clic en "Subir evidencia". | Una sola evidencia; el botón se deshabilita durante el envío. | Playwright | Media | v12 |
| PNF-I09 | [RNF-014.2](../requisitos/RNFs/RNF-014_concurrencia_y_consistencia.md) | Edición simultánea | Dos usuarios editan la misma tarea. | El segundo recibe un aviso de conflicto. | Playwright | Media | v12 |
| PNF-I10 | [RNF-009.8](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Fecha de última modificación | Editar una tarea y un proyecto. | `fecha_actualizacion` cambia. | SQL | Media | v12 |
| PNF-I11 | [RNF-009.9](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Límite de texto | Enviar una descripción de 501 caracteres. | `400` con mensaje claro, no `500`. | Supertest | Media | Hoy |
| PNF-I12 | [RNF-009.7](../requisitos/RNFs/RNF-009_integridad_de_datos.md) | Esquema oficial | Comparar la base real con [esquema-bd.md](../referencia-tecnica/esquema-bd.md). | Sin diferencias. | SQL | Media | Hoy |

### Archivos y almacenamiento

Basadas en [RNF-012](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md). Todas esperan la funcionalidad de v12.

| ID | Requisito | Prueba | Procedimiento | Criterio de aceptación | Herramienta | Prioridad | Ejecutable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PNF-F01 | [RNF-012.1](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) | Límite de 10 MB | Subir un archivo de 10 MB y otro de 10 MB + 1 byte. | El primero se acepta; el segundo se rechaza. | Supertest | Alta | v12 |
| PNF-F02 | [RNF-012.2](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) | Compresión de imágenes | Subir un PNG de 5 MB. | Se guarda como WebP de 1 MB o menos. | Supertest | Media | v12 |
| PNF-F03 | [RNF-012.3](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) | Tipos permitidos | Subir PDF, DOCX, XLSX, PPTX, PNG, JPG, WEBP, y luego EXE, SVG y ZIP. | Los primeros se aceptan; el resto se rechaza. | Supertest | Alta | v12 |
| PNF-F04 | [RNF-012.4](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) | Cuota por proyecto | Superar la cuota del proyecto. | Rechazo con mensaje claro. | Supertest | Media | v12 |
| PNF-F05 | [RNF-012.5](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) | Metadatos y nombre aleatorio | Revisar `evidencia_versiones` y la ruta en el almacenamiento. | Hay `hash_sha256`, tipo y tamaño; la ruta no contiene el nombre original. | SQL | Media | v12 |
| PNF-F06 | [RNF-012.6](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) | Limpieza | Eliminar una evidencia y esperar el período de depuración. | El archivo desaparece del almacenamiento. | Manual | Baja | v12 |
| PNF-F07 | [RNF-012.1](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) | Duplicados | Subir dos veces el mismo archivo a la misma carpeta. | Se detecta por hash y se avisa. | Supertest | Baja | v12 |

---

## 3. Cómo ejecutarlas

| Tipo | Cómo |
|---|---|
| **k6** | `k6 run perf/lectura.js` con la base de pruebas ampliada; umbrales en el propio script (`http_req_duration: p(95)<500`). |
| **axe-core** | Dentro de Playwright: `new AxeBuilder({ page }).analyze()` en cada pantalla; fallar si hay violaciones serias o críticas. |
| **ZAP** | `docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host:8080` contra el entorno de pruebas, nunca contra producción. |
| **gitleaks** | `gitleaks detect --source .` desde la raíz. |
| **Auditoría de dependencias** | `pnpm audit --prod` en `backend/` y en `frontend/`. |

---

## Documentos relacionados

- [Plan de pruebas](plan-de-pruebas.md) · [Hallazgos](hallazgos.md) · [Pruebas de integración](pruebas-de-integracion.md)
- [Requisitos no funcionales](../requisitos/RNFs/) · [Restricciones](../requisitos/restricciones.md)
