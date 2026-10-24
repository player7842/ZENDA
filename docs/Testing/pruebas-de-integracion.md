# Pruebas de integración — ZENDA

<!--
  ¿Qué? Escenarios que ejercitan varias capas a la vez (ruta, controlador, servicios y base de datos real) y la verificación de permisos por rol.
  ¿Para qué? Encontrar los defectos que las pruebas unitarias no ven: transacciones, historial, concurrencia, permisos y migración.
  ¿Impacto? Aquí se prueban las reglas que, si fallan, exponen datos de otros grupos o pierden el trabajo de los aprendices.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Escenarios documentados** | 13 |
| **Escenarios automatizados en Semana 2** | 8 (`backend/tests/integracion.test.js`) |
| **Pruebas de autorización** | 30 (documentadas; se amplían en Semana 3) |
| **Herramienta** | Vitest + Supertest contra PostgreSQL real ([entorno](plan-de-pruebas.md#4-entornos-y-datos)) |
| **Plan** | [Plan de pruebas](plan-de-pruebas.md) |
| **Fecha** | 23-oct-2026 |

---

## 0. Suite implementada en Semana 2

`backend/tests/integracion.test.js` usa Vitest + Supertest contra PostgreSQL real. Se omite si no hay base de datos o si falta el esquema actual, y en CI se ejecuta después de cargar `zenda_bd.sql` y aplicar dos veces la migración.

**Resultado local (23-oct-2026):** 8/8 escenarios aprobados sobre PostgreSQL 16, después de cargar `Database/zenda_bd.sql` y ejecutar `Database/migrations/002_semana2.sql` dos veces. Las 9 pruebas unitarias también pasaron (**17/17 en total**).

| Bloque | Qué comprueba |
|---|---|
| HU-001 | Registro con cuatro aceptaciones, correo institucional, tipo de documento y documento. |
| HU-014/HU-015 | Código `PRY-*`, cupo 1, rechazo por cupo lleno, edición de cupo por el líder y rechazo de un aprendiz de otra ficha. |
| HU-023/024/025 | Cascada, aprobación en bloque, historial de evaluaciones (4 filas), reprobación, re-aprobación y progreso 100 %. |
| RN-018 | Una carpeta con evidencia mixta queda `En revisión`, no `Aprobada`. |
| HU-019 | Nombre vacío y nombre de más de 150 caracteres responden `400`; fase inexistente `404`; fase ajena `403`; un integrante que no es líder crea la carpeta (`201`). |
| HU-026 | Observación asociada a `evidencia_id`, con nombre de evidencia en la consulta. |
| HU-011 | Creación de instructor, reasignación de fichas y conservación de una fila inactiva. |
| C-01 | Token de sesión rechazado en reset, token de reset de un solo uso, invalidación de sesión y login con la clave nueva. |

## 1. Convenciones

| Tema | Regla |
|---|---|
| **Base de datos** | Real (PostgreSQL), no simulada; recreada desde `zenda_bd.sql` y `002_semana2.sql`. |
| **Aislamiento** | Cada escenario crea sus propios datos y no depende de otro. |
| **Reloj** | Las expiraciones usan un reloj simulado. |
| **Marcadores** | `:id` es el identificador creado en el escenario. |
| **Verificación** | Además de la respuesta HTTP, se comprueba el estado en la base de datos. |

---

## 2. Escenarios

### IT-01 — Alta del aprendiz y acceso

**Requisitos:** [RF-001](../Requisitos/RFs/RF-001_registro_de_aprendiz.md), [RF-002](../Requisitos/RFs/RF-002_inicio_de_sesion.md)

**Objetivo:** Verificar que un aprendiz nuevo queda inscrito en su ficha y puede entrar.

**Precondiciones:** Ficha `2724285` existente; correo `nuevo@soy.sena.edu.co` sin registrar.

**Pasos**

1. `POST /api/auth/register` con datos válidos, `numero_ficha` 2724285 y las 4 aceptaciones.
2. `POST /api/auth/login` con ese correo y contraseña.
3. `GET /api/aprendiz/proyectos/mi-ficha` con el token.
4. Repetir el registro con el mismo correo.

**Resultado esperado**

- Registro `201` con rol `APRENDIZ`; el login `200` devuelve token; `mi-ficha` devuelve 2724285.
- El segundo registro responde `400` (correo duplicado).
- En `integrantes_grupo` hay una fila activa en el grupo `GEN-2724285`.

**Verificación en la base de datos**

```sql
SELECT g.codigo_grupo, i.estado_integrante FROM integrantes_grupo i JOIN grupos g USING (grupo_id)
 JOIN usuarios u USING (usuario_id) WHERE u.correo = 'nuevo@soy.sena.edu.co';
```

### IT-02 — Conformación del grupo y cupo

**Requisitos:** [RF-014](../Requisitos/RFs/RF-014_creacion_de_proyecto.md), [RF-015](../Requisitos/RFs/RF-015_unirse_a_un_proyecto.md)

**Objetivo:** Verificar que el líder crea el proyecto y que el cupo y la regla de un solo proyecto se respetan.

**Precondiciones:** Cuatro aprendices de la misma ficha sin proyecto (A, B, C y D).

**Pasos**

1. A crea el proyecto con `cupo_maximo` 3.
2. B y C se unen con el `codigo_grupo` recibido.
3. D intenta unirse.
4. B intenta crear otro proyecto.

**Resultado esperado**

- A queda como líder (`grupos.lider_id`), se crean 5 fases en `Pendiente` y se devuelve un código `PRY-XXXXXXXXXX`.
- B y C quedan como integrantes; D recibe `400` por grupo completo.
- B recibe `400` por ya tener un proyecto activo.

### IT-03 — Atomicidad al crear un proyecto

**Requisitos:** [RF-014](../Requisitos/RFs/RF-014_creacion_de_proyecto.md)

**Objetivo:** Verificar que un fallo a mitad de la creación no deja datos huérfanos.

**Precondiciones:** Aprendiz sin proyecto. Se fuerza un error al insertar las fases (por ejemplo, con una restricción temporal o un doble simulado).

**Pasos**

1. Intentar crear el proyecto con el fallo forzado.
2. Consultar `grupos`, `proyectos`, `fases` e `integrantes_grupo`.

**Resultado esperado**

- La petición responde `500`.
- No existe ningún grupo, proyecto ni fase nuevos: la transacción hizo `ROLLBACK`.
- El aprendiz puede reintentar sin el error "Ya perteneces a un proyecto".

### IT-04 — Entrega, evaluación y cascada

**Requisitos:** [RF-019](../Requisitos/RFs/RF-019_carpetas_de_una_fase.md), [RF-020](../Requisitos/RFs/RF-020_subida_de_evidencias.md), [RF-023](../Requisitos/RFs/RF-023_evaluacion_de_evidencias.md), [RF-025](../Requisitos/RFs/RF-025_estado_y_porcentaje_de_avance.md)

**Objetivo:** Verificar el flujo central: entregar, evaluar y recalcular estados.

**Precondiciones:** Proyecto con 5 fases; instructor vinculado a la ficha.

**Pasos**

1. Un integrante crea la carpeta "Requisitos" en la fase 1 y sube dos evidencias.
2. El instructor evalúa la primera como `APROBADO`.
3. El instructor evalúa la segunda como `REPROBADO`.
4. El aprendiz consulta `GET /mio` y la carpeta de la fase.

**Resultado esperado**

- Tras la primera evaluación la fase está `En revisión` y el avance es 50 %.
- Tras la segunda, la carpeta y la fase están `Desaprobada`.
- La respuesta incluye el porcentaje (1 de 2) y "0 de 1 carpetas aprobadas".

**Verificación en la base de datos**

```sql
SELECT estado_fase FROM fases WHERE proyecto_id = :id AND numero_fase = 1;
```

### IT-05 — Corrección tras una reprobación

**Requisitos:** [RF-022](../Requisitos/RFs/RF-022_versiones_y_eliminacion_de_evidencias.md), [RF-023](../Requisitos/RFs/RF-023_evaluacion_de_evidencias.md)

**Objetivo:** Verificar versiones, historial de evaluaciones y protección de lo aprobado.

**Precondiciones:** Escenario IT-04 terminado: una evidencia reprobada.

**Pasos**

1. El autor sube una versión nueva de la evidencia reprobada.
2. El instructor la evalúa `APROBADO`.
3. Se intenta reemplazar o eliminar la evidencia aprobada.
4. Se consultan las versiones y las evaluaciones.

**Resultado esperado**

- La versión 2 queda vigente y la 1 pasa a histórica.
- Hay 2 evaluaciones: una vigente `APROBADO` y una histórica `REPROBADO`.
- El intento sobre la evidencia aprobada responde `409`.
- La fase pasa a `Aprobada` si todas las demás evidencias lo están.

**Verificación en la base de datos**

```sql
SELECT resultado, vigente FROM evaluaciones WHERE evidencia_id = :id ORDER BY fecha_evaluacion;
```

### IT-06 — Ciclo completo de tareas

**Requisitos:** [RF-028](../Requisitos/RFs/RF-028_creacion_y_asignacion_de_tareas.md), [RF-029](../Requisitos/RFs/RF-029_avance_de_mis_tareas.md), [RF-030](../Requisitos/RFs/RF-030_confirmacion_de_tareas.md), [RF-031](../Requisitos/RFs/RF-031_tablero_y_progreso_de_tareas.md)

**Objetivo:** Verificar el flujo de estados y quién puede mover cada tarea.

**Precondiciones:** Grupo con un líder y dos integrantes.

**Pasos**

1. El líder crea una tarea asignada a un integrante.
2. El responsable la mueve a `En proceso` y luego a `Finalizada`.
3. El responsable intenta pasar otra tarea de `Pendiente` a `Finalizada`.
4. El líder marca la tarea como `Incompleta`; el responsable la retoma y la finaliza de nuevo.
5. El líder la confirma y se consulta el progreso.

**Resultado esperado**

- Cada transición permitida responde `200`; el salto inválido responde `400`.
- Tras confirmar, el progreso refleja la tarea como `Confirmada`.
- Un integrante que no es líder no puede crear ni confirmar tareas (`403`).

### IT-07 — Cambio de instructor conserva el historial

**Requisitos:** [RF-011](../Requisitos/RFs/RF-011_asignacion_de_instructores_a_fichas.md), [RF-023](../Requisitos/RFs/RF-023_evaluacion_de_evidencias.md)

**Objetivo:** Verificar que reasignar una ficha no borra lo evaluado.

**Precondiciones:** Instructor A con una ficha y evidencias ya evaluadas; instructor B sin esa ficha.

**Pasos**

1. El administrador reasigna la ficha de A a B con su contraseña.
2. A intenta evaluar una evidencia de esa ficha.
3. B consulta las evidencias de la ficha.
4. Consultar `instructor_ficha` y `evaluaciones`.

**Resultado esperado**

- A recibe `403` al evaluar; B ve las evaluaciones anteriores con A como autor.
- `instructor_ficha` conserva la fila de A con `fecha_fin` y crea la de B con `fecha_inicio`.
- Las evaluaciones de A siguen existiendo.

**Verificación en la base de datos**

```sql
SELECT instructor_id, fecha_inicio, fecha_fin FROM instructor_ficha WHERE ficha_id = :id ORDER BY fecha_inicio;
```

### IT-08 — Lista de chequeo de una ficha

**Requisitos:** [RF-036](../Requisitos/RFs/RF-036_creacion_de_lista_de_chequeo.md), [RF-037](../Requisitos/RFs/RF-037_importacion_exportacion_y_copia_de_listas.md), [RF-038](../Requisitos/RFs/RF-038_evaluacion_con_lista_de_chequeo.md)

**Objetivo:** Verificar la creación, importación, evaluación por grupo y herencia entre instructores.

**Precondiciones:** Ficha con dos grupos; instructor vinculado; un Excel con columnas fase, evidencia y descripción.

**Pasos**

1. Importar el Excel indicando la correspondencia de columnas.
2. Evaluar los ítems de cada grupo (`Aprobado` y `No aprobado`).
3. Consultar el avance por grupo y por ficha.
4. Copiar la lista a otra ficha del mismo instructor.
5. Cambiar de instructor y consultar la lista con el nuevo.

**Resultado esperado**

- Se crean los ítems por fase; las filas inválidas se informan.
- El avance del grupo cuenta solo los ítems obligatorios aprobados; el de la ficha es el promedio.
- La ficha copiada tiene una lista independiente.
- El nuevo instructor ve la lista y las evaluaciones con el autor original.

### IT-09 — Recuperación de contraseña

**Requisitos:** [RF-003](../Requisitos/RFs/RF-003_recuperacion_de_contrasena.md)

**Objetivo:** Verificar el flujo de recuperación y sus protecciones.

**Precondiciones:** Usuario registrado; reloj simulado.

**Pasos**

1. `POST /forgot-password` con un correo registrado y con uno inexistente.
2. Usar el token recibido en `POST /reset-password` con una contraseña válida.
3. Intentar usar el mismo token otra vez.
4. Usar un token vencido (reloj + 16 minutos).
5. Iniciar sesión con la contraseña nueva.

**Resultado esperado**

- Ambas solicitudes responden `200` con el mismo mensaje.
- El restablecimiento responde `200` y el login con la nueva contraseña funciona.
- El token reutilizado y el vencido responden `400`.

### IT-10 — Reasignación de liderazgo

**Requisitos:** [RF-018](../Requisitos/RFs/RF-018_reasignacion_de_liderazgo.md), [RF-007](../Requisitos/RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md)

**Objetivo:** Verificar que un grupo sin líder se recupera por la vía del administrador.

**Precondiciones:** Grupo con líder L y dos integrantes activos.

**Pasos**

1. El administrador desactiva a L.
2. Reasigna el liderazgo a un integrante con su contraseña.
3. Intenta reasignar a alguien que no es del grupo.
4. El nuevo líder crea una tarea.

**Resultado esperado**

- Al desactivar a L el sistema avisa que el grupo necesita líder.
- La reasignación responde `200` y `grupos.lider_id` cambia.
- El usuario ajeno recibe `400`; una contraseña incorrecta, `403`.
- El nuevo líder puede crear tareas.

### IT-11 — Sesión con refresco

**Requisitos:** [RF-004](../Requisitos/RFs/RF-004_sesion_segura.md)

**Objetivo:** Verificar la rotación de tokens y el cierre de sesión.

**Precondiciones:** Usuario activo; reloj simulado.

**Pasos**

1. Iniciar sesión y guardar acceso y refresco.
2. Renovar con el refresco.
3. Reutilizar el refresco anterior.
4. Cerrar sesión y volver a usar el último refresco.
5. Usar un token de acceso vencido (reloj + 16 minutos).

**Resultado esperado**

- La renovación entrega un par nuevo y revoca el anterior.
- La reutilización responde `401`.
- Tras cerrar sesión, el refresco responde `401`.
- El acceso vencido responde `401`.

### IT-12 — Concurrencia del último cupo

**Requisitos:** [RF-015](../Requisitos/RFs/RF-015_unirse_a_un_proyecto.md)

**Objetivo:** Verificar que dos uniones simultáneas no superen el cupo.

**Precondiciones:** Grupo con cupo 3 y 2 integrantes; dos aprendices libres.

**Pasos**

1. Enviar al mismo tiempo dos peticiones `POST /unirse` con el mismo código, de dos aprendices distintos.
2. Contar los integrantes activos del grupo.

**Resultado esperado**

- Exactamente una petición responde `200` y la otra `400`.
- El grupo nunca tiene más de 3 integrantes activos.

**Verificación en la base de datos**

```sql
SELECT count(*) FROM integrantes_grupo WHERE grupo_id = :id AND estado_integrante = 'Activo';
```

### IT-13 — Migración de v11 al esquema actual

**Requisito:** [esquema](../Referencia-Tecnica/esquema-bd.md#5-migración-002_semana2sql) y [migración](../../Database/migrations/002_semana2.sql)

**Objetivo:** Verificar que la migración conserva los datos y deja el esquema esperado.

**Precondiciones:** Copia de la base v11 con el *seed* cargado.

**Pasos**

1. Hacer `pg_dump` de la base.
2. Aplicar `002_semana2.sql`.
3. Comprobar el esquema y los datos.
4. Aplicar `002_semana2.sql` por segunda vez.
5. Arrancar el backend actual y ejecutar la lista de humo.

**Resultado esperado**

- Ya no existen `usuarios.sub_rol_intencion` ni `integrantes_grupo.rol_scrum`.
- Los grupos `General` tienen `es_general = true` y código `GEN-<número_ficha>`; los de proyecto tienen `es_general = false` y cupo.
- Cada evidencia evaluada conserva su historial; la vigente se obtiene por `evaluacion_id DESC`.
- La segunda ejecución no produce errores.
- Los conteos de usuarios, fichas, grupos y proyectos son iguales a los de antes (salvo normalizaciones documentadas: cupo mínimo y estados recalculados).

**Verificación en la base de datos**

```sql
-- Cada evidencia conserva su carpeta y su autor: no debe haber huérfanas.
SELECT count(*) FROM evidencias e
WHERE NOT EXISTS (SELECT 1 FROM carpetas c WHERE c.carpeta_id = e.carpeta_id)
   OR NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.usuario_id = e.usuario_id);  -- debe ser 0
```

---

## 3. Pruebas de autorización desde la matriz de permisos

Cada fila es una celda ❌ (o una condición) de la [matriz de permisos](../Requisitos/matriz-permisos.md) convertida en una petición que **debe ser rechazada**. Se ejecutan con tokens de usuarios del *seed*; cuando la ruta aún no existe (Semanas 3–6), la prueba queda pendiente.

| ID | Quién | Petición | Respuesta esperada | Regla o requisito |
| --- | --- | --- | --- | --- |
| PI-01 | Sin token | `GET /api/aprendiz/proyectos/mio` | 401 | Sin sesión |
| PI-02 | Token manipulado | `GET /api/users` | 401 | Firma inválida |
| PI-03 | Token vencido (reloj + 24 h) | `GET /api/aprendiz/proyectos/mio` | 401 | Sesión actual de 24 h; HU-004 la reducirá a 15 min |
| PI-04 | Aprendiz | `GET /api/users` | 403 | [RF-006](../Requisitos/RFs/RF-006_gestion_de_usuarios.md) |
| PI-05 | Aprendiz | `POST /api/fichas` | 403 | [RF-009](../Requisitos/RFs/RF-009_gestion_de_fichas.md) |
| PI-06 | Aprendiz | `GET /api/instructor/fichas` | 403 | Panel del instructor |
| PI-07 | Aprendiz | `GET /api/coordinador/dashboard` | 403 | Panel del coordinador |
| PI-08 | Instructor | `POST /api/aprendiz/proyectos` | 403 | Solo aprendices crean proyectos |
| PI-09 | Instructor | `PUT /api/users/:id/rol` | 403 | Solo el administrador |
| PI-10 | Coordinador | `GET /api/users` | 403 | Solo el administrador |
| PI-11 | Coordinador | `POST /api/instructor/evidencias/:id/evaluar` | 403 | Solo el instructor evalúa |
| PI-12 | Administrador | `POST /api/aprendiz/proyectos` | 403 | Solo aprendices |
| PI-13 | Administrador | `POST /api/instructor/evidencias/:id/evaluar` | 403 | Solo el instructor evalúa |
| PI-14 | Aprendiz integrante que no es líder | `POST /api/aprendiz/proyectos/tareas` | 403 | [RN-021](../Requisitos/reglas-de-negocio.md#rn-021--tareas-creadas-solo-por-el-líder) |
| PI-15 | Aprendiz que no es líder | `PUT .../tareas/:id/estado` a `Confirmada` | 403 | [RN-022](../Requisitos/reglas-de-negocio.md#rn-022--flujo-de-estados-de-la-tarea) |
| PI-16 | Aprendiz que no es el responsable | `PUT .../tareas/:id/estado` a `En proceso` | 403 | Solo el responsable mueve |
| PI-17 | Aprendiz de otro grupo | `GET .../fases/:faseId/carpetas` | 403 | Datos de otro grupo |
| PI-18 | Aprendiz de otro grupo | `POST .../fases/:faseId/carpetas` | 403 | [RN-012](../Requisitos/reglas-de-negocio.md#rn-012--carpetas-y-evidencias-por-cualquier-integrante) |
| PI-19 | Aprendiz de otro grupo | `POST .../carpetas/:id/evidencias` | 403 | [RN-012](../Requisitos/reglas-de-negocio.md#rn-012--carpetas-y-evidencias-por-cualquier-integrante) |
| PI-20 | Integrante que salió del grupo (inactivo) | `POST .../carpetas/:id/evidencias` | 403 | Debe ser integrante **activo** |
| PI-21 | Integrante que no es autor ni líder | `DELETE .../evidencias/:id` | 403 | [RN-014](../Requisitos/reglas-de-negocio.md#rn-014--versionado-y-borrado-lógico) |
| PI-22 | Autor o líder sobre evidencia aprobada | `DELETE .../evidencias/:id` | 409 | Evidencia protegida |
| PI-23 | Instructor de otra ficha | `POST /api/instructor/evidencias/:id/evaluar` | 403 | [RN-016](../Requisitos/reglas-de-negocio.md#rn-016--evaluación-por-el-instructor-asignado) |
| PI-24 | Instructor de otra ficha | `GET /api/instructor/fases/:faseId/carpetas` | 403 | Fuera de sus fichas |
| PI-25 | Instructor de otra ficha | `POST /api/instructor/proyectos/:id/observaciones` | 403 | [RN-023](../Requisitos/reglas-de-negocio.md#rn-023--observaciones-del-instructor) |
| PI-26 | Instructor desvinculado (con `fecha_fin`) | `POST /api/instructor/evidencias/:id/evaluar` | 403 | [RN-024](../Requisitos/reglas-de-negocio.md#rn-024--asignación-instructorficha-con-historial) |
| PI-27 | Coordinador | `PUT /api/coordinador/instructores/:id/fichas` con ficha de otro programa | 400 o 403 | [RN-025](../Requisitos/reglas-de-negocio.md#rn-025--alcance-del-coordinador) |
| PI-28 | Coordinador | `GET /api/coordinador/proyectos/:id/seguimiento` de otro programa | 403 o 404 | [RN-025](../Requisitos/reglas-de-negocio.md#rn-025--alcance-del-coordinador) |
| PI-29 | Administrador sin contraseña de confirmación | `DELETE /api/users/:id` | 400 o 403 | [RN-028](../Requisitos/reglas-de-negocio.md#rn-028--confirmación-con-contraseña) |
| PI-30 | Administrador sobre su propio rol | `PUT /api/users/:miId/rol` | 400 | [RF-006](../Requisitos/RFs/RF-006_gestion_de_usuarios.md) |

> **Regla de oro:** además de comprobar el código, verificar que **no cambió nada en la base de datos** (la petición rechazada no debe dejar efectos).

---

## Documentos relacionados

- [Plan de pruebas](plan-de-pruebas.md) · [Pruebas unitarias](pruebas-unitarias.md) · [Casos funcionales](casos/)
- [Matriz de permisos](../Requisitos/matriz-permisos.md) · [Reglas de negocio](../Requisitos/reglas-de-negocio.md) · [API](../Referencia-Tecnica/api-endpoints.md)
