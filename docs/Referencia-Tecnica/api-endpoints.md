# Referencia de la API — ZENDA

<!--
  ¿Qué? Contrato de la API REST de ZENDA: rutas, autorización, cuerpos de
  petición y respuestas.
  ¿Para qué? Que frontend, backend y pruebas trabajen contra el mismo contrato
  y que un cambio de ruta no rompa nada sin avisar.
  ¿Impacto? El frontend llama a la API desde un solo módulo (`api.js`); una
  ruta que cambia sin documentarse deja pantallas rotas.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Estilo** | REST sobre HTTP, cuerpos JSON |
| **URL base** | `http://localhost:4000` en desarrollo (el frontend usa `VITE_API_URL`) |
| **Prefijo** | Las rutas de negocio empiezan por `/api`; la salud también existe en `/health` |
| **Endpoints existentes** | **55** = 53 rutas de negocio + `/health` + `/api/health` |
| **Rutas declaradas en routers** | 53 |
| **Fuente** | [`backend/src/app.js`](../../backend/src/app.js) y [`backend/src/routes/`](../../backend/src/routes/) |
| **Fecha** | 23-oct-2026 |

**Leyenda de estado:** ✅ existe y está verificado en el código actual ·
🟡 existe con una limitación conocida · 🆕 aprobado pero **aún no implementado**
(Semanas 3–6).

> La versión anterior de este documento hablaba de “52 endpoints de v11 y 22 de
> v12”. Esa cuenta ya no aplica: el código actual tiene 53 rutas de negocio y
> 2 de salud. Las rutas no implementadas se listan aparte en la sección 12.

---

## 1. Convenciones

| Tema | Regla |
|---|---|
| **Autenticación** | Cabecera `Authorization: Bearer <token>` en toda ruta no pública. |
| **Token** | JWT de sesión con `usuario_id`, `correo`, `rol` y `token_version`; dura 24 h (`JWT_SESSION_EXPIRES`). |
| **Formato de error** | `{ "message": "texto en español" }` ([RNF-013.3](../Requisitos/RNFs/RNF-013_interoperabilidad_y_api.md)). |
| **Códigos usados** | `200` éxito · `201` creado · `400` datos inválidos · `401` sin sesión o token inválido · `403` sin permiso o cuenta inactiva · `404` no encontrado · `409` conflicto · `500` error del servidor. |
| **Roles** | `JWT` = cualquier usuario autenticado. `JWT · ROL` = además exige ese rol (`isAdmin`, `isCoordinador`, `isInstructor`, `isAprendiz`). |
| **Confirmación** | Las rutas marcadas con 🔑 exigen `password` con la contraseña de quien actúa ([RN-028](../Requisitos/reglas-de-negocio.md#rn-028--confirmación-con-contraseña)). |
| **Fechas** | `YYYY-MM-DD` para `DATE` e ISO 8601 para `TIMESTAMP`. |
| **Identificadores** | Enteros en la ruta (`:id`, `:faseId`, `:carpetaId`, `:evidenciaId`, `:proyectoId`). |
| **Límite de peticiones** | 300 por IP cada 15 min en `/api/`; 20 cada 15 min en login, registro, olvido y reset. |
| **CORS** | Lista blanca por `FRONTEND_URL`; sin `Origin` se permite (Postman, health checks). |

---

## 2. Resumen por módulo

| Módulo | Prefijo | Rutas | Requisitos |
|---|---|:---:|---|
| Salud | `/health`, `/api/health` | 2 | — |
| Autenticación | `/api/auth` | 4 | RF-001 a RF-003 |
| Usuarios | `/api/users` | 7 | RF-006, RF-007, RF-011 |
| Fichas | `/api/fichas` | 8 | RF-001, RF-009, RF-010, RF-012 |
| Aprendiz | `/api/aprendiz/proyectos` | 15 | RF-014 a RF-032 |
| Instructor | `/api/instructor` | 11 | RF-021, RF-023, RF-024, RF-026, RF-032, RF-033 |
| Coordinador | `/api/coordinador` | 8 | RF-011, RF-032, RF-033 |
| **Total** | | **55** | |

---

## 3. Salud

| Método | Ruta | Auth | Respuesta | Estado |
|---|---|---|---|:---:|
| GET | `/health` | Público | `{ status: "OK", message }` | ✅ |
| GET | `/api/health` | Público | El mismo cuerpo | ✅ |

`/api/health` es el `healthCheckPath` de Render y el que usa el `HEALTHCHECK`
del contenedor.

---

## 4. Autenticación — `/api/auth`

| Método | Ruta | Auth | Cuerpo | Respuesta exitosa | RF | Estado |
|---|---|---|---|---|---|:---:|:---:|
| POST | `/register` | Público | `nombre`, `apellido`, `correo`, `tipo_documento`, `numero_documento`, `password`, `numero_ficha`, `acepta_terminos`, `acepta_privacidad`, `acepta_cookies`, `acepta_tratamiento_datos` | `201` `{ message, user, token }` | RF-001 | ✅ |
| POST | `/login` | Público | `correo` (o `email`), `password` | `200` `{ message, user, token }` | RF-002 | ✅ |
| POST | `/forgot-password` | Público | `correo` | `200` `{ message }` uniforme | RF-003 | ✅ |
| POST | `/reset-password` | Público | `token`, `contrasena` | `200` `{ message }` | RF-003 | ✅ |

Reglas del registro:

- El rol siempre es `APRENDIZ`: el autoregistro no permite elegir rol ni
  sub-rol Scrum.
- El correo debe cumplir `usuario@soy.sena.edu.co`.
- `tipo_documento` ∈ `CC`, `TI`, `CE`, `PA`, `PPT`.
- `numero_documento` debe tener entre 6 y 11 dígitos.
- Las cuatro aceptaciones deben llegar en `true`.
- La contraseña debe tener al menos 8 caracteres.
- El aprendiz queda vinculado al grupo General de su ficha.

Reglas de recuperación:

- `forgot-password` responde **siempre** lo mismo, exista o no el correo.
- El token dura 15 minutos, lleva `purpose: 'reset'` y se guarda como hash
  SHA-256.
- Un token de sesión **no** sirve para resetear la contraseña.
- El token es de un solo uso: se marca `usado_en` y se incrementa
  `usuarios.token_version`, lo que invalida las sesiones anteriores.

**Ejemplo — inicio de sesión**

```http
POST /api/auth/login
Content-Type: application/json

{ "correo": "carlos@zenda.com", "password": "********" }
```

```json
{
  "message": "Login exitoso",
  "user": { "usuario_id": 7, "rol": "APRENDIZ", "nombre": "Carlos", "apellido": "Mendez", "correo": "carlos@zenda.com", "estado": "Activo" },
  "token": "<JWT>"
}
```

---

## 5. Usuarios — `/api/users` (JWT · ADMINISTRADOR)

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|---|
| POST 🔑 | `/` | `nombre`, `apellido`, `correo`, `tipo_documento`, `numero_documento`, `rol`, `fichas` (solo instructores), `userPassword`, `password` | `201` usuario creado | RF-006 | ✅ |
| GET | `/` | — | Lista de usuarios con `fichas` / `ficha` derivadas | RF-006 | ✅ |
| GET | `/:id` | — | Un usuario | RF-006 | ✅ |
| PUT 🔑 | `/:id` | `nombre`, `apellido`, `correo`, `tipo_documento`, `numero_documento`, `rol`, `fichas`, `estado`, `password` | Usuario actualizado | RF-006 | ✅ |
| PUT 🔑 | `/:id/rol` | `rol`, `password` | Usuario con el rol nuevo | RF-006 | ✅ |
| PUT 🔑 | `/:id/fichas` | `fichas` (códigos), `password` | Instructor con sus fichas vigentes | RF-011 | ✅ |
| DELETE 🔑 | `/:id` | `password` | `200` mensaje | RF-007 | ✅ |

> `fichas` son **números de ficha**, no IDs. En instructores se sincroniza
> `instructor_ficha` conservando el historial; las asignaciones cerradas no se
> muestran como vigentes.

---

## 6. Fichas — `/api/fichas`

| Método | Ruta | Auth | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|---|---|
| GET | `/publicas` | Público | — | Fichas para el selector del registro | RF-001 | ✅ |
| GET | `/programas` | JWT · ADMINISTRADOR | — | Programas para el formulario | RF-012 | ✅ |
| GET | `/` | JWT · ADMINISTRADOR | — | Fichas con conteos | RF-009 | ✅ |
| POST 🔑 | `/` | JWT · ADMINISTRADOR | `codigo_programa`, `numero_ficha`, `fecha_inicio`, `fecha_fin`, `jornada`, `password` | `201` listado actualizado | RF-009 | ✅ |
| PUT 🔑 | `/:id` | JWT · ADMINISTRADOR | `numero_ficha`, `fecha_inicio`, `fecha_fin`, `jornada`, `password` | Ficha actualizada | RF-009 | ✅ |
| DELETE 🔑 | `/:id` | JWT · ADMINISTRADOR | `password` | `200` mensaje | RF-009 | ✅ |
| PUT 🔑 | `/:id/aprendiz` | JWT · ADMINISTRADOR | `usuario_id`, `password` | `200` "Aprendiz vinculado a la ficha" | RF-010 | ✅ |
| DELETE 🔑 | `/:id/aprendiz/:usuario_id` | JWT · ADMINISTRADOR | `password` | `200` "Aprendiz desvinculado de la ficha" | RF-010 | ✅ |

> La gestión de **programas** (crear, editar, eliminar) no está implementada.
> Solo existe la lectura en `/api/fichas/programas`. Ver sección 12.

---

## 7. Aprendiz — `/api/aprendiz/proyectos` (JWT · APRENDIZ)

### 7.1 Proyecto y ficha

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|---|
| POST | `/` | `nombre_proyecto`, `descripcion`, `problema`, `objetivo`, `alcance`, `tecnologias`, `fecha_inicio`, `fecha_fin_estimada`, `cupo_maximo` | `201` `{ grupo_id, proyecto_id, codigo_grupo, cupo_maximo }` | RF-014 | ✅ |
| PUT | `/mio/cupo` | `cupo_maximo` (1–50, no menor al total actual; solo líder) | `200` `{ cupo_maximo }` | RF-014 | ✅ |
| POST | `/unirse` | `codigo_grupo` (misma ficha, grupo con cupo) | `200` "Te uniste al proyecto correctamente" | RF-015 | ✅ |
| GET | `/mio` | — | Proyecto, integrantes, líder y fases | RF-016 | ✅ |
| GET | `/resumen` | — | Métricas y series para el panel | RF-032 | ✅ |
| GET | `/mi-ficha` | — | Ficha actual | RF-017 | ✅ |
| PUT | `/mi-ficha` | `numero_ficha` | `200` "Ficha actualizada correctamente" | RF-017 | ✅ |

Reglas:

- Un aprendiz solo puede tener **un proyecto activo** ([RN-007](../Requisitos/reglas-de-negocio.md)).
- La creación bloquea la fila del usuario con `SELECT … FOR UPDATE` para
  evitar dos proyectos simultáneos.
- `cupo_maximo` por defecto es 6; rango 1–50; el líder cuenta como integrante.
- Solo se puede unir a grupos de la **misma ficha**.

### 7.2 Carpetas, evidencias y observaciones

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|---|
| GET | `/fases/:faseId/carpetas` | — | Carpetas con evidencias y resultado | RF-021 | ✅ |
| POST | `/fases/:faseId/carpetas` | `nombre_carpeta` | `201` carpeta | RF-019 | ✅ |
| POST | `/carpetas/:carpetaId/evidencias` | `nombre_evidencia`, `tipo_evidencia` (`Documento`/`Imagen`/`Video`/`Enlace`), `ubicacion` (`http/https`, máx. 500) | `201` `{ evidencia_id }` | RF-020 | 🟡 solo enlaces; archivos en Semana 4 |
| GET | `/observaciones` | — | Observaciones de mi proyecto, con `nombre_evidencia` | RF-027 | ✅ |

> Cualquier integrante activo del grupo puede crear carpetas y subir enlaces;
> la autoría queda en `evidencias.usuario_id`.

### 7.3 Tareas

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|---|
| POST | `/tareas` | `titulo`, `descripcion`, `prioridad`, `responsable_id`, `fecha_inicio`, `fecha_limite` | `201` tarea (solo el líder) | RF-028 | ✅ |
| GET | `/tareas` | — | Tareas del proyecto | RF-031 | ✅ |
| GET | `/tareas/progreso` | — | Total y confirmadas | RF-031 | ✅ |
| PUT | `/tareas/:id/estado` | `estado` | Tarea con el nuevo estado | RF-029, RF-030 | ✅ |

Flujo permitido:

```text
Pendiente → En proceso → Finalizada → Confirmada
                                    ↘ Incompleta → En proceso
```

- El **responsable** mueve `Pendiente → En proceso → Finalizada`.
- Solo el **líder** confirma o marca incompleta una tarea finalizada.
- La autorización usa `grupos.lider_id`; no existe sub-rol Scrum.

**Ejemplo — crear proyecto**

```http
POST /api/aprendiz/proyectos
Authorization: Bearer <JWT>

{ "nombre_proyecto": "ZENDA", "descripcion": "…", "problema": "…", "objetivo": "…",
  "alcance": "…", "tecnologias": "React, Express", "fecha_inicio": "2026-03-01",
  "fecha_fin_estimada": "2026-12-01", "cupo_maximo": 5 }
```

```json
{ "grupo_id": 12, "proyecto_id": 9, "codigo_grupo": "PRY-A3F9C1D2E4", "cupo_maximo": 5 }
```

---

## 8. Instructor — `/api/instructor` (JWT · INSTRUCTOR)

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|---|
| GET | `/resumen` | — | Métricas del instructor | RF-032 | ✅ |
| GET | `/fichas` | — | Fichas con asignación vigente | RF-033 | ✅ |
| GET | `/fichas/:id/aprendices` | — | Aprendices de la ficha | RF-033 | ✅ |
| GET | `/fichas/:id/grupos` | — | Grupos de la ficha | RF-033 | ✅ |
| GET | `/fichas/:id/evidencias` | — | Evidencias de la ficha | RF-033 | ✅ |
| GET | `/proyectos/:proyectoId` | — | Detalle (README) del proyecto | RF-033 | ✅ |
| GET | `/fases/:faseId/carpetas` | — | Carpetas y evidencias de la fase | RF-021 | ✅ |
| POST | `/evidencias/:evidenciaId/evaluar` | `resultado` (`APROBADO` o `REPROBADO`) | Evaluación y estado de la fase | RF-023 | ✅ |
| POST | `/carpetas/:carpetaId/aprobar` | — | `{ aprobadas, estado_carpeta, estado_fase }` | RF-024 | ✅ |
| GET | `/proyectos/:proyectoId/observaciones` | — | Observaciones del proyecto | RF-026 | ✅ |
| POST | `/proyectos/:proyectoId/observaciones` | `titulo`, `descripcion`, `evidencia_id` opcional | `201` observación con `nombre_evidencia` | RF-026 | ✅ |

Reglas:

- El instructor solo puede evaluar evidencias de fichas con asignación
  **vigente** (`instructor_ficha.fecha_fin IS NULL`).
- Cada evaluación es un `INSERT`: recalificar no borra el historial. La
  vigente es la de mayor `evaluacion_id`.
- La aprobación en bloque rechaza la carpeta si ya tiene una evaluación
  vigente y aprueba todas sus evidencias en una transacción.
- Después de evaluar o aprobar se recalculan `estado_carpeta` y `estado_fase`
  (RN-018).

**Ejemplo — evaluar una evidencia**

```http
POST /api/instructor/evidencias/41/evaluar
Authorization: Bearer <JWT>

{ "resultado": "REPROBADO" }
```

---

## 9. Coordinador — `/api/coordinador` (JWT · COORDINADOR)

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|---|
| GET | `/dashboard` | — | Métricas del programa | RF-032 | ✅ |
| GET | `/perfil` | — | Perfil del coordinador | RF-033 | ✅ |
| GET | `/fichas` | — | Fichas del programa ADSO | RF-033 | ✅ |
| GET | `/grupos` | — | Grupos del programa | RF-033 | ✅ |
| GET | `/proyectos` | — | Proyectos del programa | RF-033 | ✅ |
| GET | `/proyectos/:id/seguimiento` | — | Seguimiento de un proyecto | RF-033 | ✅ |
| GET | `/instructores` | — | Instructores del programa | RF-011 | ✅ |
| PUT 🔑 | `/instructores/:id/fichas` | `fichas`, `password` | Instructor con sus fichas ADSO | RF-011 | ✅ |

> El reporte CSV/Excel del coordinador se genera en el navegador; no hay
> endpoint de archivo en el servidor (ver sección 12).

---

## 10. Errores de los middlewares

| Situación | Código | Mensaje actual |
|---|---|:---:|---|
| Sin cabecera `Authorization` | `401` | "No se proporcionó token, ¿cómo entraste sin permiso?" |
| Token inválido, vencido o con `token_version` viejo | `401` | "Token inválido, intenta de nuevo" |
| Cuenta inactiva | `403` | "Tu cuenta está inactiva, habla con un administrador" |
| Rol sin permiso | `403` | Mensaje propio de `isAdmin`, `isInstructor`, etc. |
| Límite de peticiones | `429` | Mensaje del `rate-limit` |

> Los textos informales deben reemplazarse por mensajes profesionales
> ([RI-002](../Requisitos/restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español)).
> Es un pendiente de estilo, no de seguridad.

---

## 11. Cambios de contrato ya aplicados (Semanas 1–2)

| Endpoint | Cambio aplicado |
|---|---|
| `POST /api/auth/register` | Se eliminó `sub_rol`; se agregaron las cuatro aceptaciones legales, el tipo `PPT`, la validación de contraseña y el vínculo automático al General. |
| `POST /api/aprendiz/proyectos/unirse` | Se eliminó `rol_scrum`; solo valida ficha, cupo y grupo activo. |
| `POST /api/aprendiz/proyectos` | Acepta `cupo_maximo` (1–50, 6 por defecto). |
| `PUT /api/aprendiz/proyectos/mio/cupo` | Nuevo; solo el líder y nunca por debajo del total actual. |
| `POST /api/aprendiz/proyectos/carpetas/:carpetaId/evidencias` | En Semana 2 solo JSON con enlaces `http/https`; archivos reales en Semana 4. |
| `POST /api/auth/forgot-password` | Responde siempre `200` y guarda solo el hash del token. |
| `POST /api/instructor/evidencias/:id/evaluar` | Inserta una evaluación nueva en lugar de actualizar la anterior. |
| `POST /api/instructor/carpetas/:carpetaId/aprobar` | Nuevo; aprobación en bloque (HU-024). |
| `POST /api/instructor/proyectos/:id/observaciones` | Acepta `evidencia_id` opcional. |
| `PUT /api/aprendiz/proyectos/tareas/:id/estado` | Los mensajes mencionan al líder, no al Scrum Master. |
| `PUT /api/users/:id/fichas` | Sincroniza `instructor_ficha` conservando el historial. |

---

## 12. Endpoints aprobados pero **no implementados**

Estos endpoints pertenecen a las Semanas 3–6. **No existen en el código
actual** y no deben usarse desde el frontend todavía.

| Método | Ruta propuesta | Requisito | Semana |
|---|---|---|---|
| POST | `/api/users/bulk` | RF-008 · carga masiva por CSV | 3–6 |
| POST/PUT/DELETE | `/api/programas`, `/api/programas/:id` | RF-012 · gestión de programas | 3–6 |
| GET | `/api/system/diagnostics` | RF-013 · diagnóstico | 3–6 |
| GET 🔑 | `/api/system/backup` | RF-013 · copia de seguridad | 3–6 |
| POST | `/api/auth/refresh` | RF-004 · refresh token | 3–6 |
| POST | `/api/auth/logout` | RF-004 · cierre de sesión | 3–6 |
| POST | `/api/auth/verify-email` | RF-001 · verificación de correo | 3–6 |
| POST | `/api/aprendiz/proyectos/evidencias/:id/versiones` | RF-022 · versiones | 4 |
| DELETE | `/api/aprendiz/proyectos/evidencias/:id` | RF-022 · eliminación | 4 |
| POST | `/api/instructor/fichas/:id/lista-chequeo` | RF-036 | 5 |
| PUT | `/api/instructor/lista-chequeo/:listaId` | RF-036 | 5 |
| POST | `/api/instructor/lista-chequeo/importar` | RF-037 | 5 |
| GET | `/api/instructor/lista-chequeo/:listaId/exportar` | RF-037 | 5 |
| POST | `/api/instructor/lista-chequeo/:listaId/copiar` | RF-037 | 5 |
| POST | `/api/instructor/lista-chequeo/items/:itemId/evaluar` | RF-038 | 5 |
| GET | `/api/instructor/fichas/:id/lista-chequeo/avance` | RF-038 | 5 |
| GET | `/api/instructor/fichas/:id/reporte` | RF-035 · Excel en servidor | 6 |
| GET | `/api/coordinador/reporte` | RF-035 · Excel en servidor | 6 |

---

## 13. Inconsistencias conocidas (no bloqueantes)

| # | Hallazgo | Estado |
|:---:|---|---|
| 1 | El prefijo `/api/aprendiz/proyectos` también contiene ficha, tareas y resumen. | Se mantiene por compatibilidad con el frontend. |
| 2 | Los programas se leen en `/api/fichas/programas`, no en `/api/programas`. | Se mantiene hasta implementar RF-012. |
| 3 | Los listados no se paginan. | Pendiente de RNF-002.4. |
| 4 | La API no tiene versión en la ruta. | Decisión del proyecto formativo. |
| 5 | Varios mensajes son informales. | Pendiente de RI-002. |

---

## Documentos relacionados

- [Arquitectura](arquitectura.md) · [Esquema de base de datos](esquema-bd.md)
- [Matriz de permisos](../Requisitos/matriz-permisos.md) · [Matriz de trazabilidad](../Requisitos/matriz-trazabilidad.md)
- [RNF-013 Interoperabilidad y API](../Requisitos/RNFs/RNF-013_interoperabilidad_y_api.md)
