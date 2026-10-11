# RF-028 — Creación y asignación de tareas

<!--
  ¿Qué? Requisito funcional que define: creación y asignación de tareas.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Organiza el trabajo del equipo; es la función que distingue al líder de los demás integrantes.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-028 |
| **Nombre** | Creación y asignación de tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-028 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir únicamente al líder crear tareas y asignarlas a integrantes activos de su grupo, con título, descripción, prioridad (`Alta`, `Media`, `Baja`) y fechas de inicio y límite. Toda tarea nace en estado `Pendiente`.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `titulo` | Texto | Sí | Máximo 150 caracteres |
| `responsable_id` | Número | Sí | Integrante activo del grupo |
| `descripcion` | Texto | No | Máximo 500 caracteres |
| `prioridad` | Opción | No | `Alta`, `Media` (por defecto) o `Baja` |
| `fecha_inicio`, `fecha_limite` | Fecha | No | Límite posterior al inicio |

---

## Proceso

1. El líder completa el formulario de la tarea.
2. El backend busca su proyecto activo y verifica que sea el líder.
3. Verifica que el responsable sea integrante activo del grupo.
4. Guarda la tarea en estado `Pendiente`.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Tarea creada | 201 | Datos de la tarea |
| Faltan datos, prioridad inválida o responsable ajeno | 400 | Mensaje del error |
| No es líder | 403 | Mensaje de acceso denegado |
| Sin proyecto activo | 404 | "No perteneces a ningún proyecto activo" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/aprendiz/proyectos/tareas` | Sí (APRENDIZ) | Crea y asigna una tarea |

---

## Reglas de negocio

- **RN-008** — Líder del grupo.
- **RN-021** — Tareas creadas solo por el líder.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- El mensaje de error "Solo el Scrum Master puede crear y asignar tareas" pasa a mencionar al líder del grupo.
