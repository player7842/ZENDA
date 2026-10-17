# RF-031 — Tablero y progreso de tareas

<!--
  ¿Qué? Requisito funcional que define: tablero y progreso de tareas.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Da visibilidad compartida del trabajo, tanto al líder como a los integrantes.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-031 |
| **Nombre** | Tablero y progreso de tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-031 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe mostrar a los integrantes el tablero de tareas del proyecto, agrupadas por estado, y el progreso como tareas confirmadas sobre el total.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El backend identifica el proyecto del aprendiz.
2. Consulta las tareas con su responsable.
3. Calcula el total y las tareas confirmadas.
4. Devuelve la lista y el progreso.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Tareas del proyecto | 200 | Lista de tareas |
| Progreso | 200 | Total y confirmadas |
| Sin proyecto activo | 404 | "No perteneces a ningún proyecto activo" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/aprendiz/proyectos/tareas` | Sí (APRENDIZ) | Lista las tareas del proyecto |
| GET | `/api/aprendiz/proyectos/tareas/progreso` | Sí (APRENDIZ) | Progreso de tareas |

---

## Reglas de negocio

- **RN-021** — Tareas creadas solo por el líder.
- **RN-022** — Flujo de estados de la tarea.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- La interfaz usa `Tareas.tsx`, el único archivo en TypeScript del frontend (ver [restricciones](../restricciones.md#pendientes-de-confirmación)).
