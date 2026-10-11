# Reglas de negocio — ZENDA

<!--
  ¿Qué? Catálogo de reglas que gobiernan el comportamiento del sistema, independientes de la interfaz.
  ¿Para qué? Tener una única fuente de verdad que los requisitos, las pruebas y el código puedan citar.
  ¿Impacto? Si una regla cambia, se actualiza aquí y se revisan los requisitos que la citan.
-->

---

## Cómo leer este documento

| Estado | Significado |
| --- | --- |
| **Vigente** | Ya se cumple en la versión v11. |
| **Parcial** | Se cumple en parte; el resto es un cambio aprobado. |
| **Adoptada** | Decisión aprobada, aún no implementada. |

---

## Resumen

| ID | Regla | Estado |
| --- | --- | --- |
| RN-001 | Registro limitado a aprendices con correo institucional | Vigente |
| RN-002 | Contraseña protegida con hash | Vigente |
| RN-003 | Solo las cuentas activas inician sesión | Vigente |
| RN-004 | Aceptación legal obligatoria | Adoptada |
| RN-005 | Roles sin sub-roles | Adoptada |
| RN-006 | Grupo General por ficha | Vigente |
| RN-007 | Un proyecto activo por aprendiz | Vigente |
| RN-008 | Líder del grupo | Adoptada |
| RN-009 | Cupo del grupo | Adoptada |
| RN-010 | Código de invitación | Vigente |
| RN-011 | Cinco fases fijas | Vigente |
| RN-012 | Carpetas y evidencias por cualquier integrante | Adoptada |
| RN-013 | Tipos de evidencia y límites | Adoptada |
| RN-014 | Versionado y borrado lógico | Adoptada |
| RN-015 | Sin bloqueo por fase | Adoptada |
| RN-016 | Evaluación por el instructor asignado | Vigente |
| RN-017 | Historial de evaluaciones | Adoptada |
| RN-018 | Cascada de estados | Parcial |
| RN-019 | Aprobación de carpeta en bloque | Adoptada |
| RN-020 | Porcentaje de avance de la fase | Adoptada |
| RN-021 | Tareas creadas solo por el líder | Vigente |
| RN-022 | Flujo de estados de la tarea | Vigente |
| RN-023 | Observaciones del instructor | Vigente |
| RN-024 | Asignación instructor–ficha con historial | Adoptada |
| RN-025 | Alcance del coordinador | Vigente |
| RN-026 | Lista de chequeo por ficha | Adoptada |
| RN-027 | Avance de la lista de chequeo | Adoptada |
| RN-028 | Confirmación con contraseña | Vigente |
| RN-029 | Cambio de ficha del aprendiz | Vigente |
| RN-030 | Reasignación de liderazgo por el administrador | Adoptada |

---

## Detalle

### RN-001 — Registro limitado a aprendices con correo institucional

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-001, RF-006, RF-008 |

El autorregistro es solo para aprendices. El correo debe pertenecer al dominio `@soy.sena.edu.co` y ser único en el sistema. Las cuentas de instructor, coordinador y administrador las crea un administrador.

### RN-002 — Contraseña protegida con hash

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-001, RF-002, RF-003, RF-006, RF-008 |

Las contraseñas se almacenan con bcrypt (costo 10) y nunca se devuelven en respuestas, registros ni mensajes de error.

### RN-003 — Solo las cuentas activas inician sesión

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-002, RF-004, RF-005, RF-007 |

Una cuenta con estado distinto de `Activo` no puede iniciar sesión y recibe un mensaje para contactar al administrador.

### RN-004 — Aceptación legal obligatoria

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-001, RF-039 |

Para registrarse, el aprendiz debe aceptar de forma obligatoria los términos de uso, la política de privacidad, la política de cookies y la protección de datos personales (Ley 1581 de 2012).

### RN-005 — Roles sin sub-roles

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-001, RF-005, RF-006 |

Los roles son `APRENDIZ`, `INSTRUCTOR`, `COORDINADOR` y `ADMINISTRADOR`. Se eliminan los sub-roles Scrum (Scrum Master, Product Owner, Developer): todos los aprendices de un grupo tienen los mismos permisos, salvo las del líder.

### RN-006 — Grupo General por ficha

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-001, RF-010, RF-017 |

Cada ficha tiene un grupo especial llamado `General` (código `GEN-<número de ficha>`) que representa la inscripción del aprendiz a la ficha. No cuenta como proyecto.

### RN-007 — Un proyecto activo por aprendiz

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-014, RF-015, RF-016 |

Un aprendiz solo puede pertenecer a un proyecto activo a la vez, ya sea creándolo o uniéndose a uno.

### RN-008 — Líder del grupo

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-014, RF-016, RF-018, RF-028, RF-030 |

El aprendiz que crea el proyecto queda como líder del grupo. El liderazgo es fijo y no se transfiere entre aprendices.

### RN-009 — Cupo del grupo

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-014, RF-015 |

El líder define el cupo máximo de integrantes al crear el proyecto. No se admiten nuevos integrantes cuando el grupo está lleno y el cupo no puede ser menor que el número actual de integrantes. El rango permitido está por definir.

### RN-010 — Código de invitación

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-014, RF-015 |

Cada proyecto tiene un código único con formato `PRY-XXXXXX` que los demás aprendices usan para unirse.

### RN-011 — Cinco fases fijas

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-014, RF-016 |

Al crear el proyecto se crean automáticamente 5 fases: Fase 1 – Análisis, Fase 2 – Diseño, Fase 3 – Desarrollo, Fase 4 – Pruebas y Fase 5 – Cierre/Entrega.

### RN-012 — Carpetas y evidencias por cualquier integrante

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-019, RF-020, RF-021, RF-022 |

Cualquier integrante activo del grupo puede crear carpetas dentro de las fases y subir evidencias. Cada evidencia registra qué usuario la subió.

### RN-013 — Tipos de evidencia y límites

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-020 |

Una evidencia es un archivo o un enlace. Los archivos se validan por tipo (lista blanca), por contenido real y por tamaño máximo; las imágenes grandes se comprimen antes de almacenarse.

### RN-014 — Versionado y borrado lógico

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-022 |

Reemplazar una evidencia crea una versión nueva y conserva las anteriores. Eliminar una evidencia solo la oculta. Solo quien la subió o el líder pueden reemplazarla o eliminarla, y una evidencia aprobada queda protegida.

### RN-015 — Sin bloqueo por fase

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-019, RF-020, RF-022 |

Los aprendices pueden seguir subiendo carpetas y evidencias aunque la fase esté en revisión, aprobada o desaprobada. La evaluación no detiene el avance.

### RN-016 — Evaluación por el instructor asignado

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-021, RF-023, RF-024, RF-026, RF-033, RF-035, RF-036, RF-038 |

Solo un instructor vinculado a la ficha del grupo puede evaluar sus evidencias. El resultado es `APROBADO` o `REPROBADO`.

### RN-017 — Historial de evaluaciones

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-023, RF-024 |

Cada evaluación conserva su autor y su fecha. Recalificar agrega un registro nuevo (el último es el vigente) en lugar de sobrescribir el anterior.

### RN-018 — Cascada de estados

| Estado | Requisitos relacionados |
| --- | --- |
| Parcial | RF-022, RF-023, RF-024, RF-025 |

Una evidencia reprobada desaprueba su carpeta, y una carpeta desaprobada desaprueba la fase. Una fase queda `Aprobada` solo si todas sus evidencias están aprobadas; en cualquier otro caso queda `En revisión`. Hoy la cascada se calcula de la evidencia a la fase; el estado de la carpeta es un cambio pendiente.

### RN-019 — Aprobación de carpeta en bloque

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-024, RF-025 |

El instructor puede aprobar una carpeta completa, lo que aprueba todas sus evidencias. Si una sola evidencia queda reprobada, la carpeta pasa a `Desaprobada`.

### RN-020 — Porcentaje de avance de la fase

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-025 |

El porcentaje de una fase es el número de evidencias aprobadas sobre el total de evidencias de la fase. Aparte se muestra cuántas carpetas están aprobadas (por ejemplo, 3 de 4).

### RN-021 — Tareas creadas solo por el líder

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-028, RF-031 |

Solo el líder del grupo crea y asigna tareas. El responsable debe ser un integrante activo del mismo grupo y la prioridad debe ser `Alta`, `Media` o `Baja`.

### RN-022 — Flujo de estados de la tarea

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-029, RF-030, RF-031 |

`Pendiente` → `En proceso` → `Finalizada` los mueve el responsable. Desde `Finalizada`, el líder la pasa a `Confirmada` o `Incompleta`. Una tarea `Incompleta` vuelve a `En proceso` por el responsable.

### RN-023 — Observaciones del instructor

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-026, RF-027 |

Solo el instructor de la ficha crea observaciones. Siempre pertenecen a un proyecto y pueden referirse a una evidencia concreta.

### RN-024 — Asignación instructor–ficha con historial

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-011, RF-033, RF-038 |

Un instructor se vincula a una o varias fichas. Al reasignar, la vinculación anterior se cierra con su fecha y no se borra. El instructor desvinculado conserva sus evaluaciones pero ya no puede evaluar esa ficha.

### RN-025 — Alcance del coordinador

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-011, RF-032, RF-033, RF-035 |

El coordinador supervisa y reasigna instructores solo en las fichas del programa Análisis y Desarrollo de Software (código `2338`).

### RN-026 — Lista de chequeo por ficha

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-036, RF-037, RF-038 |

Cada ficha tiene una lista de chequeo, creada por un instructor, que pertenece a la ficha y no al instructor. Si cambia el instructor, el nuevo hereda la lista y sus evaluaciones. La lista puede copiarse a otras fichas.

### RN-027 — Avance de la lista de chequeo

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-038 |

El instructor evalúa cada ítem por grupo (`Aprobado`, `No aprobado` o `Pendiente`). El avance de un grupo es el porcentaje de ítems obligatorios aprobados y el de la ficha es el promedio de sus grupos. Es independiente de la cascada de evidencias.

### RN-028 — Confirmación con contraseña

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-006, RF-007, RF-008, RF-009, RF-011, RF-012, RF-013, RF-018 |

Las acciones críticas del administrador (crear o editar usuarios y fichas, cambiar roles, eliminar) exigen confirmar con su contraseña.

### RN-029 — Cambio de ficha del aprendiz

| Estado | Requisitos relacionados |
| --- | --- |
| Vigente | RF-010, RF-017 |

Un aprendiz puede cambiar de ficha solo si no tiene un proyecto activo. El cambio lo traslada al grupo `General` de la nueva ficha.

### RN-030 — Reasignación de liderazgo por el administrador

| Estado | Requisitos relacionados |
| --- | --- |
| Adoptada | RF-007, RF-018 |

Si el líder abandona el grupo o su cuenta se desactiva, solo el administrador puede asignar a otro integrante activo como líder.
