# RF-030 — Confirmación de tareas

<!--
  ¿Qué? Requisito funcional que define: confirmación de tareas.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es el control de calidad interno del equipo antes de presentar evidencias al instructor.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-030 |
| **Nombre** | Confirmación de tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-030 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir únicamente al líder pasar una tarea de `Finalizada` a `Confirmada` o a `Incompleta`. Una tarea `Incompleta` vuelve al responsable.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `id` | Número | Sí | Tarea en estado `Finalizada` |
| `estado` | Opción | Sí | `Confirmada` o `Incompleta` |

---

## Proceso

1. El líder revisa la tarea finalizada y elige el resultado.
2. El backend verifica que sea el líder del grupo y que la transición sea válida.
3. Actualiza el estado de la tarea.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Tarea confirmada o rechazada | 200 | "Tarea actualizada" y nuevo estado |
| No es el líder | 403 | Mensaje de acceso denegado |
| Transición no permitida | 400 | Mensaje del error |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| PUT | `/api/aprendiz/proyectos/tareas/:id/estado` | Sí (APRENDIZ) | Confirma o rechaza la tarea |

---

## Reglas de negocio

- **RN-008** — Líder del grupo.
- **RN-022** — Flujo de estados de la tarea.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- El mensaje "Solo el Scrum Master puede confirmar o rechazar esta tarea" pasa a mencionar al líder del grupo.
