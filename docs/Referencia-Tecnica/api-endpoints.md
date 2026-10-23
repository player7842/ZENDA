# Referencia de la API — ZENDA

<!--
  ¿Qué? Contrato de la API REST de ZENDA: rutas, autorización, cuerpos de petición y respuestas.
  ¿Para qué? Que frontend, backend y pruebas trabajen contra el mismo contrato y que un cambio de ruta no rompa nada sin avisar.
  ¿Impacto? El frontend llama a la API desde un solo módulo (`api.js`); una ruta que cambia sin documentarse deja pantallas rotas.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Estilo** | REST sobre HTTP, cuerpos JSON |
| **URL base** | `http://localhost:4000` en desarrollo (variable `VITE_API_URL` en el frontend) |
| **Prefijo** | Todas las rutas empiezan por `/api` |
| **Endpoints existentes (v11)** | 52 |
| **Endpoints propuestos (v12)** | 22 |
| **Fuente** | Código de `ZENDA-develop` (`server.js` y `src/routes/`) |
| **Fecha** | Octubre 2026 |

**Leyenda de estado:** ✅ existe en v11 · 🔄 existe y su contrato cambia en v12 · 🆕 propuesto (aún no existe).

---

## 1. Convenciones

| Tema | Regla |
|---|---|
| **Autenticación** | Cabecera `Authorization: Bearer <token>` en toda ruta no pública. |
| **Formato de error** | `{ "message": "texto en español" }` ([RNF-013.3](../requisitos/RNFs/RNF-013_interoperabilidad_y_api.md)). |
| **Códigos usados** | `200` éxito · `201` creado · `400` datos inválidos · `401` sin sesión o token inválido · `403` sin permiso · `404` no encontrado · `409` conflicto · `500` error del servidor. |
| **Roles** | `JWT` = cualquier usuario autenticado. `JWT · ROL` = además exige ese rol (middlewares `isAdmin`, `isCoordinador`, `isInstructor`, `isAprendiz`). |
| **Confirmación** | Las rutas marcadas con 🔑 exigen el campo `password` con la contraseña de quien actúa ([RN-028](../requisitos/reglas-de-negocio.md#rn-028--confirmación-con-contraseña)). |
| **Fechas** | `YYYY-MM-DD` para fechas y ISO 8601 para marcas de tiempo. |
| **Identificadores** | Enteros en la ruta (`:id`, `:faseId`, `:carpetaId`…). |

---

## 2. Resumen por módulo

| Módulo | Prefijo | Existentes | Propuestos | Requisitos |
|---|---|:---:|:---:|---|
| Sistema | `/api/health`, `/api/system` | 1 | 2 | RF-013 |
| Autenticación | `/api/auth` | 4 | 3 | RF-001 a RF-004 |
| Usuarios | `/api/users` | 7 | 1 | RF-006 a RF-008, RF-011 |
| Fichas y programas | `/api/fichas`, `/api/programas` | 8 | 3 | RF-009, RF-010, RF-012 |
| Grupos | `/api/grupos` | 0 | 1 | RF-018 |
| Aprendiz | `/api/aprendiz/proyectos` | 14 | 2 | RF-014 a RF-031 |
| Instructor | `/api/instructor` | 10 | 9 | RF-023 a RF-026, RF-033 a RF-038 |
| Coordinador | `/api/coordinador` | 8 | 1 | RF-011, RF-032, RF-033, RF-035 |
| **Total** | | **52** | **22** | |

---

## 3. Sistema

| Método | Ruta | Auth | Respuesta | RF | Estado |
|---|---|---|---|:---:|:---:|
| GET | `/api/health` | Público | `{ status: "OK", message }` | — | ✅ |
| GET | `/api/system/diagnostics` | JWT · ADMINISTRADOR | Estado del servidor, base de datos y última copia | [RF-013](../requisitos/RFs/RF-013_diagnostico_y_copia_de_seguridad.md) | 🆕 |
| GET | `/api/system/backup` 🔑 | JWT · ADMINISTRADOR | Archivo de volcado de la base de datos | [RF-013](../requisitos/RFs/RF-013_diagnostico_y_copia_de_seguridad.md) | 🆕 |

---

## 4. Autenticación — `/api/auth`

| Método | Ruta | Auth | Cuerpo | Respuesta exitosa | RF | Estado |
|---|---|---|---|---|:---:|:---:|
| POST | `/register` | Público | `nombre`, `apellido`, `correo`, `tipo_documento`, `numero_documento`, `password`, `numero_ficha`, ~~`sub_rol`~~ | `201` `{ message, user, token }` | [RF-001](../requisitos/RFs/RF-001_registro_de_aprendiz.md) | 🔄 |
| POST | `/login` | Público | `correo`, `password` | `200` `{ message, user, token }` | [RF-002](../requisitos/RFs/RF-002_inicio_de_sesion.md) | 🔄 |
| POST | `/forgot-password` | Público | `correo` | `200` `{ message }` | [RF-003](../requisitos/RFs/RF-003_recuperacion_de_contrasena.md) | 🔄 |
| POST | `/reset-password` | Público | `token`, `contrasena` | `200` `{ message }` | [RF-003](../requisitos/RFs/RF-003_recuperacion_de_contrasena.md) | ✅ |
| POST | `/refresh` | Token de refresco | `refresh_token` | `200` `{ token, refresh_token }` | [RF-004](../requisitos/RFs/RF-004_sesion_segura.md) | 🆕 |
| POST | `/logout` | JWT | `refresh_token` | `200` `{ message }` | [RF-004](../requisitos/RFs/RF-004_sesion_segura.md) | 🆕 |
| POST | `/verify-email` | Público | `token` | `200` `{ message }` | [RF-001](../requisitos/RFs/RF-001_registro_de_aprendiz.md) | 🆕 |

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
|---|---|---|---|:---:|:---:|
| POST 🔑 | `/` | `nombre`, `apellido`, `correo`, `tipo_documento`, `numero_documento`, `rol`, `fichas`, `estado`, `password` (de quien crea) y la contraseña del nuevo usuario | `201` usuario creado | [RF-006](../requisitos/RFs/RF-006_gestion_de_usuarios.md) | ✅ |
| GET | `/` | — | Lista de usuarios con sus fichas | [RF-006](../requisitos/RFs/RF-006_gestion_de_usuarios.md) | ✅ |
| GET | `/:id` | — | Un usuario | [RF-006](../requisitos/RFs/RF-006_gestion_de_usuarios.md) | ✅ |
| PUT 🔑 | `/:id` | `nombre`, `apellido`, `correo`, `tipo_documento`, `numero_documento`, `rol`, `fichas`, `estado`, `password` | Usuario actualizado | [RF-006](../requisitos/RFs/RF-006_gestion_de_usuarios.md) | ✅ |
| PUT 🔑 | `/:id/rol` | `rol`, `password` | Usuario con el rol nuevo | [RF-006](../requisitos/RFs/RF-006_gestion_de_usuarios.md) | ✅ |
| PUT 🔑 | `/:id/fichas` | `fichas`, `password` | Instructor con sus fichas | [RF-011](../requisitos/RFs/RF-011_asignacion_de_instructores_a_fichas.md) | 🔄 |
| DELETE 🔑 | `/:id` | `password` | `200` mensaje | [RF-007](../requisitos/RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md) | ✅ |
| POST 🔑 | `/bulk` | Archivo CSV | `200` creados y errores por fila | [RF-008](../requisitos/RFs/RF-008_carga_masiva_de_usuarios.md) | 🆕 |

---

## 6. Fichas y programas

| Método | Ruta | Auth | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|---|:---:|:---:|
| GET | `/api/fichas/publicas` | Público | — | Fichas para el selector del registro | [RF-001](../requisitos/RFs/RF-001_registro_de_aprendiz.md) | ✅ |
| GET | `/api/fichas/programas` | JWT · ADMINISTRADOR | — | Programas para el formulario | [RF-012](../requisitos/RFs/RF-012_gestion_de_programas_de_formacion.md) | ✅ |
| GET | `/api/fichas` | JWT · ADMINISTRADOR | — | Fichas con conteos | [RF-009](../requisitos/RFs/RF-009_gestion_de_fichas.md) | ✅ |
| POST 🔑 | `/api/fichas` | JWT · ADMINISTRADOR | `codigo_programa`, `numero_ficha`, `fecha_inicio`, `fecha_fin`, `jornada`, `password` | `201` listado actualizado | [RF-009](../requisitos/RFs/RF-009_gestion_de_fichas.md) | ✅ |
| PUT 🔑 | `/api/fichas/:id` | JWT · ADMINISTRADOR | `numero_ficha`, `fecha_inicio`, `fecha_fin`, `jornada`, `password` | Ficha actualizada | [RF-009](../requisitos/RFs/RF-009_gestion_de_fichas.md) | ✅ |
| DELETE 🔑 | `/api/fichas/:id` | JWT · ADMINISTRADOR | `password` | `200` mensaje | [RF-009](../requisitos/RFs/RF-009_gestion_de_fichas.md) | ✅ |
| PUT 🔑 | `/api/fichas/:id/aprendiz` | JWT · ADMINISTRADOR | `usuario_id`, `password` | `200` "Aprendiz vinculado a la ficha" | [RF-010](../requisitos/RFs/RF-010_aprendices_en_una_ficha.md) | ✅ |
| DELETE 🔑 | `/api/fichas/:id/aprendiz/:usuario_id` | JWT · ADMINISTRADOR | `password` | `200` "Aprendiz desvinculado de la ficha" | [RF-010](../requisitos/RFs/RF-010_aprendices_en_una_ficha.md) | ✅ |
| POST 🔑 | `/api/programas` | JWT · ADMINISTRADOR | `codigo_programa`, `nombre_programa`, `password` | `201` programa | [RF-012](../requisitos/RFs/RF-012_gestion_de_programas_de_formacion.md) | 🆕 |
| PUT 🔑 | `/api/programas/:id` | JWT · ADMINISTRADOR | `codigo_programa`, `nombre_programa`, `password` | Programa actualizado | [RF-012](../requisitos/RFs/RF-012_gestion_de_programas_de_formacion.md) | 🆕 |
| DELETE 🔑 | `/api/programas/:id` | JWT · ADMINISTRADOR | `password` | `200`; `409` si tiene fichas | [RF-012](../requisitos/RFs/RF-012_gestion_de_programas_de_formacion.md) | 🆕 |

---

## 7. Grupos — `/api/grupos` (JWT · ADMINISTRADOR)

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|:---:|:---:|
| PUT 🔑 | `/:id/lider` | `nuevo_lider_id`, `password` | Grupo con el nuevo líder | [RF-018](../requisitos/RFs/RF-018_reasignacion_de_liderazgo.md) | 🆕 |

---

## 8. Aprendiz — `/api/aprendiz/proyectos` (JWT · APRENDIZ)

### 8.1 Proyecto y ficha

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|:---:|:---:|
| POST | `/` | `nombre_proyecto`, `descripcion`, `problema`, `objetivo`, `alcance`, `tecnologias`, `fecha_inicio`, `fecha_fin_estimada`, `cupo_maximo` | `201` `{ grupo_id, proyecto_id, codigo_grupo, cupo_maximo }` | [RF-014](../requisitos/RFs/RF-014_creacion_de_proyecto.md) | ✅ |
| PUT | `/mio/cupo` | `cupo_maximo` (1–50, no menor al total actual; solo líder) | `200` `{ cupo_maximo }` | [RF-014](../requisitos/RFs/RF-014_creacion_de_proyecto.md) | ✅ |
| POST | `/unirse` | `codigo_grupo` (misma ficha, grupo con cupo) | `200` "Te uniste al proyecto correctamente" | [RF-015](../requisitos/RFs/RF-015_unirse_a_un_proyecto.md) | ✅ |
| GET | `/mio` | — | Proyecto, integrantes, líder y fases | [RF-016](../requisitos/RFs/RF-016_consulta_de_mi_proyecto.md) | 🔄 |
| GET | `/resumen` | — | Métricas y series para el panel | [RF-032](../requisitos/RFs/RF-032_paneles_de_resumen_por_rol.md) | ✅ |
| GET | `/mi-ficha` | — | Ficha actual | [RF-017](../requisitos/RFs/RF-017_cambio_de_ficha_del_aprendiz.md) | ✅ |
| PUT | `/mi-ficha` | `numero_ficha` | `200` "Ficha actualizada correctamente" | [RF-017](../requisitos/RFs/RF-017_cambio_de_ficha_del_aprendiz.md) | ✅ |

### 8.2 Carpetas, evidencias y observaciones

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|:---:|:---:|
| GET | `/fases/:faseId/carpetas` | — | Carpetas con evidencias y resultado | [RF-021](../requisitos/RFs/RF-021_consulta_de_evidencias_y_fases.md) | 🔄 |
| POST | `/fases/:faseId/carpetas` | `nombre_carpeta` | `201` carpeta | [RF-019](../requisitos/RFs/RF-019_carpetas_de_una_fase.md) | 🔄 |
| POST | `/carpetas/:carpetaId/evidencias` | `nombre_evidencia`, `tipo_evidencia` (`Documento`/`Imagen`/`Video`/`Enlace`), `ubicacion` (`http/https`, máx. 500) | `201` `{ evidencia_id }` | [RF-020](../requisitos/RFs/RF-020_subida_de_evidencias.md) | ✅ solo enlaces; archivos en Semana 4 |
| POST | `/evidencias/:id/versiones` | Archivo o enlace nuevo | `201` nueva versión | [RF-022](../requisitos/RFs/RF-022_versiones_y_eliminacion_de_evidencias.md) | 🆕 |
| DELETE | `/evidencias/:id` | — | `200`; `409` si está aprobada | [RF-022](../requisitos/RFs/RF-022_versiones_y_eliminacion_de_evidencias.md) | 🆕 |
| GET | `/observaciones` | — | Observaciones de mi proyecto | [RF-027](../requisitos/RFs/RF-027_consulta_de_observaciones.md) | ✅ |

### 8.3 Tareas

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|:---:|:---:|
| POST | `/tareas` | `titulo`, `descripcion`, `prioridad`, `responsable_id`, `fecha_inicio`, `fecha_limite` | `201` tarea (solo el líder) | [RF-028](../requisitos/RFs/RF-028_creacion_y_asignacion_de_tareas.md) | 🔄 |
| GET | `/tareas` | — | Tareas del proyecto | [RF-031](../requisitos/RFs/RF-031_tablero_y_progreso_de_tareas.md) | ✅ |
| GET | `/tareas/progreso` | — | Total y confirmadas | [RF-031](../requisitos/RFs/RF-031_tablero_y_progreso_de_tareas.md) | ✅ |
| PUT | `/tareas/:id/estado` | `estado` | Tarea con el nuevo estado | [RF-029](../requisitos/RFs/RF-029_avance_de_mis_tareas.md), [RF-030](../requisitos/RFs/RF-030_confirmacion_de_tareas.md) | 🔄 |

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

## 9. Instructor — `/api/instructor` (JWT · INSTRUCTOR)

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|:---:|:---:|
| GET | `/resumen` | — | Métricas del instructor | [RF-032](../requisitos/RFs/RF-032_paneles_de_resumen_por_rol.md) | ✅ |
| GET | `/fichas` | — | Fichas a su cargo | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | 🔄 |
| GET | `/fichas/:id/aprendices` | — | Aprendices de la ficha | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/fichas/:id/grupos` | — | Grupos de la ficha | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/fichas/:id/evidencias` | — | Evidencias de la ficha | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/proyectos/:proyectoId` | — | Detalle (README) del proyecto | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/fases/:faseId/carpetas` | — | Carpetas y evidencias de la fase | [RF-021](../requisitos/RFs/RF-021_consulta_de_evidencias_y_fases.md) | 🔄 |
| POST | `/evidencias/:evidenciaId/evaluar` | `resultado` (`APROBADO` o `REPROBADO`) | Evaluación y estado de la fase | [RF-023](../requisitos/RFs/RF-023_evaluacion_de_evidencias.md) | 🔄 |
| GET | `/proyectos/:proyectoId/observaciones` | — | Observaciones del proyecto | [RF-026](../requisitos/RFs/RF-026_observaciones_del_instructor.md) | ✅ |
| POST | `/proyectos/:proyectoId/observaciones` | `titulo`, `descripcion`, `evidencia_id` opcional | `201` observación con `nombre_evidencia` | [RF-026](../requisitos/RFs/RF-026_observaciones_del_instructor.md) | ✅ |
| POST | `/carpetas/:carpetaId/aprobar` | — | Estado de carpeta y fase | [RF-024](../requisitos/RFs/RF-024_aprobacion_de_carpetas_en_bloque.md) | 🆕 |
| POST | `/fichas/:id/lista-chequeo` | `nombre`, ítems | `201` lista | [RF-036](../requisitos/RFs/RF-036_creacion_de_lista_de_chequeo.md) | 🆕 |
| PUT | `/lista-chequeo/:listaId` | Lista e ítems | Lista actualizada | [RF-036](../requisitos/RFs/RF-036_creacion_de_lista_de_chequeo.md) | 🆕 |
| POST | `/lista-chequeo/importar` | Excel y correspondencia de columnas | Lista importada | [RF-037](../requisitos/RFs/RF-037_importacion_exportacion_y_copia_de_listas.md) | 🆕 |
| GET | `/lista-chequeo/:listaId/exportar` | — | Archivo `.xlsx` | [RF-037](../requisitos/RFs/RF-037_importacion_exportacion_y_copia_de_listas.md) | 🆕 |
| POST | `/lista-chequeo/:listaId/copiar` | `ficha_destino_id` | `201` lista copiada | [RF-037](../requisitos/RFs/RF-037_importacion_exportacion_y_copia_de_listas.md) | 🆕 |
| POST | `/lista-chequeo/items/:itemId/evaluar` | `grupo_id`, `resultado`, `comentario` | `201` evaluación y avance | [RF-038](../requisitos/RFs/RF-038_evaluacion_con_lista_de_chequeo.md) | 🆕 |
| GET | `/fichas/:id/lista-chequeo/avance` | — | Avance por grupo y por ficha | [RF-038](../requisitos/RFs/RF-038_evaluacion_con_lista_de_chequeo.md) | 🆕 |
| GET | `/fichas/:id/reporte` | — | Archivo `.xlsx` | [RF-035](../requisitos/RFs/RF-035_reporte_en_excel.md) | 🆕 |

**Ejemplo — evaluar una evidencia**

```http
POST /api/instructor/evidencias/41/evaluar
Authorization: Bearer <JWT>

{ "resultado": "REPROBADO" }
```

---

## 10. Coordinador — `/api/coordinador` (JWT · COORDINADOR)

| Método | Ruta | Cuerpo | Respuesta | RF | Estado |
|---|---|---|---|:---:|:---:|
| GET | `/dashboard` | — | Métricas del programa | [RF-032](../requisitos/RFs/RF-032_paneles_de_resumen_por_rol.md) | ✅ |
| GET | `/perfil` | — | Perfil del coordinador | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/fichas` | — | Fichas del programa ADSO | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/grupos` | — | Grupos del programa | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/proyectos` | — | Proyectos del programa | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/proyectos/:id/seguimiento` | — | Seguimiento de un proyecto | [RF-033](../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ✅ |
| GET | `/instructores` | — | Instructores del programa | [RF-011](../requisitos/RFs/RF-011_asignacion_de_instructores_a_fichas.md) | ✅ |
| PUT 🔑 | `/instructores/:id/fichas` | `fichas`, `password` | Instructor con sus fichas ADSO | [RF-011](../requisitos/RFs/RF-011_asignacion_de_instructores_a_fichas.md) | 🔄 |
| GET | `/reporte` | — | Archivo `.xlsx` del programa | [RF-035](../requisitos/RFs/RF-035_reporte_en_excel.md) | 🆕 |

---

## 11. Errores de los middlewares

| Situación | Código | Mensaje actual en v11 |
|---|:---:|---|
| Sin cabecera `Authorization` | `401` | "No se proporcionó token, ¿cómo entraste sin permiso?" |
| Token inválido o vencido | `401` | "Token inválido, intenta de nuevo" |
| Rol sin permiso | `403` | Mensaje propio de `isAdmin`, `isInstructor`, etc. |

> Los textos informales deben reemplazarse por mensajes profesionales ([RI-002](../requisitos/restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español)).

---

## 12. Cambios de contrato planificados

| Endpoint | Cambio en v12 | Compatibilidad |
|---|---|---|
| `POST /auth/register` | Se elimina `sub_rol`; se agregan aceptaciones legales y verificación de correo. | El backend puede ignorar `sub_rol` mientras el frontend se actualiza. |
| `POST /aprendiz/proyectos/unirse` | Se elimina `rol_scrum`. | Igual: se ignora primero y se elimina después. |
| `POST /aprendiz/proyectos` | Se agrega `cupo_maximo` (1–50, por defecto 6). | Compatible: si falta, se aplica 6. |
| `PUT /aprendiz/proyectos/mio/cupo` | Nuevo endpoint para que el líder ajuste el cupo. | No menor al total actual de integrantes. |
| `POST /carpetas/:id/evidencias` | En Semana 2 solo JSON con enlaces `http/https`. Archivos reales (`multipart/form-data`) en Semana 4. | Sin cambio para el JSON actual. |
| `POST /auth/login` | **Hoy:** token único de 24 h (`JWT_SESSION_EXPIRES`). **Objetivo HU-004:** token de acceso de 15 min + `refresh_token`. | La reducción de 15 min aún **no** está implementada; el frontend no debe renovar todavía. |
| `POST /auth/forgot-password` | Responde siempre `200`, exista o no el correo. | El frontend no debe depender del `404` actual. |
| `POST /instructor/evidencias/:id/evaluar` | Inserta una evaluación nueva en lugar de actualizar la anterior. | Compatible: la respuesta no cambia. |
| `POST /instructor/proyectos/:id/observaciones` | Acepta `evidencia_id` opcional. | Compatible. |
| `PUT /aprendiz/proyectos/tareas/:id/estado` | Los mensajes mencionan al líder, no al Scrum Master. | Compatible. |

---

## 13. Inconsistencias detectadas en v11

| # | Hallazgo | Acción sugerida |
|:---:|---|---|
| 1 | `GET /programas` está registrado **dos veces** en `routes/admin/fichas.js`. | Eliminar el duplicado. |
| 2 | El prefijo `/api/aprendiz/proyectos` contiene también ficha, tareas y resumen, que no son "proyectos". | A futuro, mover a `/api/aprendiz` conservando un alias. |
| 3 | Los programas se leen en `/api/fichas/programas`. | Mantener y agregar `/api/programas` para su gestión. |
| 4 | `server.js` usa `cors()` sin restricciones. | Limitar al origen del frontend ([RNF-001.9](../requisitos/RNFs/RNF-001_seguridad.md)). |
| 5 | `routes/coordinador/coordinador.js` usa saltos de línea CRLF y el resto LF. | Unificar con un `.gitattributes`. |
| 6 | Las respuestas de autenticación devuelven `user`, no `usuario`. | Mantener `user`: es parte del contrato. |
| 7 | Los listados no se paginan. | Agregar paginación ([RNF-002.4](../requisitos/RNFs/RNF-002_rendimiento.md)). |
| 8 | La API no tiene versión en la ruta. | Mantener `/api/...` durante el proyecto formativo ([pendiente](../requisitos/restricciones.md#pendientes-de-confirmación)). |
| 9 | Varios mensajes son informales o contienen groserías. | Reescribirlos ([RI-002](../requisitos/restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español)). |

---

## Documentos relacionados

- [Arquitectura](arquitectura.md) · [Esquema de base de datos](esquema-bd.md)
- [Matriz de permisos](../requisitos/matriz-permisos.md) · [Matriz de trazabilidad](../requisitos/matriz-trazabilidad.md)
- [RNF-013 Interoperabilidad y API](../requisitos/RNFs/RNF-013_interoperabilidad_y_api.md)
