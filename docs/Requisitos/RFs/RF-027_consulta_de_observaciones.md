# RF-027 — Consulta de observaciones

<!--
  ¿Qué? Requisito funcional que define: consulta de observaciones.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Cierra el ciclo de retroalimentación: sin leerlas, el aprendiz no puede actuar sobre ellas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-027 |
| **Nombre** | Consulta de observaciones |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-027 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe mostrar a cualquier integrante del grupo las observaciones que los instructores registraron sobre su proyecto, de la más reciente a la más antigua.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El backend identifica el proyecto del aprendiz.
2. Consulta las observaciones del proyecto.
3. Las devuelve ordenadas por fecha.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Observaciones del proyecto | 200 | Lista de observaciones |
| Sin proyecto | 404 | Mensaje del error |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/aprendiz/proyectos/observaciones` | Sí (APRENDIZ) | Observaciones de mi proyecto |

---

## Reglas de negocio

- **RN-023** — Observaciones del instructor.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).
