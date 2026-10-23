# Hallazgos de v11 — defectos conocidos

<!--
  ¿Qué? Defectos y riesgos de ZENDA v11 encontrados al revisar el código, con su severidad, su origen y cómo comprobarlos.
  ¿Para qué? Saber qué corregir antes de la entrega y qué prueba confirma cada corrección.
  ¿Impacto? Si se corrige uno, hay que actualizar esta tabla y volver a ejecutar la prueba asociada.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Versión revisada** | `ZENDA-develop` (v11) |
| **Método** | Lectura del código (`server.js`, rutas, controladores, esquema y Dockerfiles) |
| **Severidad** | Según el [plan de pruebas](plan-de-pruebas.md#8-gestión-de-defectos) |
| **Fecha** | Octubre 2026 |

> **Importante:** estos hallazgos salen de la **lectura del código**. Los comandos de la sección 2 describen cómo reproducirlos, pero **no se ejecutaron** contra una instancia real al redactar este documento; ejecútalos y confirma cada resultado antes de darlo por probado.

---

## 1. Resumen

| ID | Hallazgo | Severidad | Dónde | Requisito | Prueba que lo detecta |
|:---:|---|:---:|---|---|---|
| **H-01** | La recuperación de contraseña revela si un correo está registrado | Media | `authController` | [RNF-001.6](../requisitos/RNFs/RNF-001_seguridad.md) | PNF-S06 |
| **H-02** | Secreto JWT por defecto (`zenda_secret_key`) en el código | **Alta** | `authController` | [RS-001](../requisitos/restricciones.md#rs-001--secretos-fuera-del-código-y-del-repositorio) | PNF-S11 |
| **H-03** | El enlace de recuperación apunta a `http://localhost:5173` | Media | `authController` | [RT-007](../requisitos/restricciones.md#rt-007--correo-electrónico-limitado) | IT-09 |
| **H-04** | CORS abierto: `cors()` acepta cualquier origen | Media | `server.js` | [RNF-001.9](../requisitos/RNFs/RNF-001_seguridad.md) | PNF-S09 |
| **H-05** | El registro no valida la longitud de la contraseña | Media | `authController` | [RF-001](../requisitos/RFs/RF-001_registro_de_aprendiz.md) | CP-001 y PU de política |
| **H-06** | Recalificar una evidencia **sobrescribe** la evaluación y al instructor anterior | **Alta** | `instructorController` | [RN-017](../requisitos/reglas-de-negocio.md#rn-017--historial-de-evaluaciones) | IT-05, PNF-I04 |
| **H-07** | Reasignar instructores **borra y recrea** `instructor_ficha`: se pierde el historial | **Alta** | `coordinadorController`, `userController` | [RN-024](../requisitos/reglas-de-negocio.md#rn-024--asignación-instructorficha-con-historial) | IT-07 |
| **H-08** | Las observaciones no aceptan `evidencia_id` | Baja | `instructorController` | [RF-026](../requisitos/RFs/RF-026_observaciones_del_instructor.md) | CP-026.2 |
| **H-09** | `GET /programas` está registrado dos veces | Baja | `routes/admin/fichas.js` | [API](../referencia-tecnica/api-endpoints.md#13-inconsistencias-detectadas-en-v11) | Revisión de código |
| **H-10** | Mensajes de error informales o con groserías | Media | `auth.js`, `server.js`, `userController` | [RI-002](../requisitos/restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español) | Revisión de código |
| **H-11** | El *seed* adjunta el proyecto de ejemplo al grupo `General` y usa fases y estados que el sistema no genera | Media | `Database/zenda_bd.sql` | [RN-006](../requisitos/reglas-de-negocio.md#rn-006--grupo-general-por-ficha), [RN-011](../requisitos/reglas-de-negocio.md#rn-011--cinco-fases-fijas) | IT-13 |
| **H-12** | Dockerfiles: puerto 3000 frente a 4000, falta `nginx.conf`, archivos `dockerignore` sin punto, Node 20 | Media | `dockers.zip` | [RT-008](../requisitos/restricciones.md#rt-008--contenedores-con-docker) | PNF-C03 |
| **H-13** | El token de sesión vive en `localStorage` | Media | `frontend/src` | [RNF-001.2](../requisitos/RNFs/RNF-001_seguridad.md) | PNF-S21 |
| **H-14** | `nodemailer` está declarado en el `package.json` del frontend | Baja | `frontend/package.json` | [RNF-005](../requisitos/RNFs/RNF-005_mantenibilidad_y_calidad.md) | Revisión de código |
| **H-15** | Saltos de línea mezclados (CRLF en `coordinador.js` y `mailer.js`) | Baja | `routes/`, `utils/` | [RNF-005](../requisitos/RNFs/RNF-005_mantenibilidad_y_calidad.md) | Revisión de código |
| **H-16** | Las dependencias usan rangos `^` en lugar de versiones exactas | Baja | `package.json` (21 casos) | [RH-003](../requisitos/restricciones.md#rh-003--versiones-exactas-de-dependencias) | Revisión de código |

**Por severidad:** Alta 3 · Media 8 · Baja 5.

> **Estado tras la auditoría de Semana 2 (22-oct-2026):** H-01 a H-12, H-14, H-15 y H-16 quedaron corregidos en código/documentación. H-13 sigue **abierto**: la sesión continúa en `localStorage` y dura 24 h; el paso a 15 min + refresh pertenece a HU-004 (Semanas 3–6). H-12 queda pendiente de probar con Docker real.

> **H-12 ya tiene corrección** en la entrega de infraestructura (`docker-compose.yml`, Dockerfiles, `nginx.conf`, `.dockerignore`); queda pendiente que el equipo la pruebe.

---

## 2. Detalle y forma de comprobarlos

### H-01 — Enumeración de usuarios

**Qué pasa.** `forgot-password` responde `404` con el mensaje "El correo no se encuentra registrado" cuando el correo no existe, y `200` cuando existe. Cualquiera puede averiguar qué correos tienen cuenta.

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" -d '{"correo":"no.existe@soy.sena.edu.co"}'
# Esperado tras la corrección: 200 (igual que con un correo existente). Hoy: 404.
```

### H-02 — Secreto JWT por defecto

**Qué pasa.** En el flujo de recuperación, el token se firma con `process.env.JWT_SECRET || 'zenda_secret_key'`. Si falta la variable, el sistema sigue funcionando con una clave pública conocida y cualquiera puede fabricar tokens válidos.

```bash
grep -rn "zenda_secret_key" backend/src backend/server.js
# Esperado tras la corrección: sin resultados, y el servidor falla al iniciar si falta JWT_SECRET.
```

### H-03 — Enlace de recuperación fijo

**Qué pasa.** El correo siempre enlaza a `http://localhost:5173`. En producción el enlace no funciona. Se corrige con la variable `FRONTEND_URL` ([variables de entorno](../setup/variables-de-entorno.md)).

### H-04 — CORS abierto

**Qué pasa.** `server.js` llama a `cors()` sin opciones, así que cualquier sitio puede hacer peticiones a la API desde el navegador del usuario.

```bash
curl -i -X OPTIONS http://localhost:4000/api/auth/login \
  -H "Origin: https://sitio-ajeno.example" -H "Access-Control-Request-Method: POST"
# Esperado tras la corrección: sin cabecera Access-Control-Allow-Origin para ese origen.
```

### H-05 — Contraseña sin longitud mínima al registrarse

**Qué pasa.** La validación de 8 caracteres existe en el restablecimiento, pero no se encontró en el registro. Un aprendiz podría registrarse con una contraseña de un carácter.

### H-06 y H-07 — Pérdida de historial

**Qué pasa.** `evaluarEvidencia` hace un `UPDATE` sobre la evaluación existente, por lo que se pierde quién evaluó antes y qué resultado dio. La reasignación de fichas ejecuta `DELETE FROM instructor_ficha` y vuelve a insertar, sin guardar quién tuvo la ficha. Ambos chocan con la regla de que un cambio de instructor no debe borrar lo evaluado.

```sql
-- H-06: tras recalificar la misma evidencia dos veces
SELECT count(*) FROM evaluaciones WHERE evidencia_id = :id;
-- Esperado tras la corrección: 2 (con una sola vigente). Hoy: 1.
```

### H-08 — Observaciones sin evidencia

**Qué pasa.** El endpoint solo recibe `titulo` y `descripcion`; el campo `evidencia_id` existe en la tabla, pero no se llena desde la API.

**Corregido en Semana 2.** `crearObservacion` valida y guarda `evidencia_id`, la consulta devuelve `nombre_evidencia` y la UI permite asociar la observación a una evidencia.

### H-11 — Datos de prueba inconsistentes

**Qué pasa.** El *seed* crea el proyecto "ZENDA" colgado del grupo `General` de la ficha 2724285 (que no debe ser un proyecto), y las fases se llaman "Fase 1: Análisis…" con estados como `En proceso`, que no son los que genera `crearProyecto`. Las pruebas que dependen del *seed* pueden fallar por datos, no por código.

### H-12 — Dockerfiles

Corregidos en la entrega de infraestructura; ver [con-docker.md](../setup/con-docker.md#9-problemas-frecuentes).

### H-13 — Token en `localStorage`

**Qué pasa.** El token se guarda en `localStorage`, accesible a cualquier script de la página. Un defecto de XSS permitiría robarlo. Hoy el token dura **24 h**; la reducción a 15 min con refresh rotativo y, si es posible, cookie `HttpOnly` pertenece a HU-004 (Semanas 3–6). En Semana 2 se mitigó parcialmente con Helmet, CORS restringido, rate-limit y validación de URLs, pero el riesgo sigue abierto.

---

## 3. Qué se corrige primero

| Orden | Hallazgos | Motivo |
|:---:|---|---|
| 1 | H-02 | Compromete todas las sesiones si falta una variable. |
| 2 | H-06, H-07 | Pierden datos que no se pueden reconstruir. |
| 3 | H-01, H-04, H-05 | Seguridad de bajo costo de corrección. |
| 4 | H-10, H-11 | Imagen del proyecto y fiabilidad de las pruebas. |
| 5 | H-03, H-08, H-09, H-13 a H-16 | Mejoras de calidad y de despliegue. |

---

## Documentos relacionados

- [Plan de pruebas](plan-de-pruebas.md) · [Pruebas no funcionales](pruebas-no-funcionales.md) · [Pruebas de integración](pruebas-de-integracion.md)
- [API — inconsistencias detectadas](../referencia-tecnica/api-endpoints.md#13-inconsistencias-detectadas-en-v11)
