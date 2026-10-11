# RF-029 — Avance de mis tareas

<!--
  ¿Qué? Requisito funcional que define: avance de mis tareas.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Mantiene el tablero actualizado con la información de quien realmente hace la tarea.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-029 |
| **Nombre** | Avance de mis tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-029 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al responsable de una tarea moverla de `Pendiente` a `En proceso` y de `En proceso` a `Finalizada`, y de `Incompleta` a `En proceso`. No se permiten otras transiciones.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `id` | Número | Sí | Tarea asignada al aprendiz |
| `estado` | Opción | Sí | Siguiente estado permitido por el flujo |

---

## Proceso

1. El responsable arrastra o selecciona el nuevo estado.
2. El backend verifica la relación del usuario con la tarea y que la transición esté permitida.
3. Actualiza el estado; si vuelve de `Incompleta` a `En proceso`, borra la fecha de finalización.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Tarea actualizada | 200 | "Tarea actualizada" y nuevo estado |
| Transición no permitida | 400 | "No se puede pasar de X a Y" |
| No es el responsable | 403 | "Solo el responsable puede mover esta tarea" |
| Tarea no encontrada | 404 | "Tarea no encontrada" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| PUT | `/api/aprendiz/proyectos/tareas/:id/estado` | Sí (APRENDIZ) | Mueve la tarea en su flujo |

---

## Reglas de negocio

- **RN-022** — Flujo de estados de la tarea.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).
