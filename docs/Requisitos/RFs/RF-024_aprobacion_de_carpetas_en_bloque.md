# RF-024 — Aprobación de carpetas en bloque

<!--
  ¿Qué? Requisito funcional que define: aprobación de carpetas en bloque.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Reduce el tiempo de evaluación en carpetas con muchos documentos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-024 |
| **Nombre** | Aprobación de carpetas en bloque |
| **Módulo** | Evaluación |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Historia asociada** | HU-024 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al instructor aprobar de una vez todas las evidencias vigentes de una carpeta. Si una evidencia queda reprobada, la carpeta pasa a `Desaprobada`.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `carpetaId` | Número | Sí | Carpeta de una ficha a cargo del instructor |

---

## Proceso

1. El instructor elige aprobar una carpeta.
2. El backend verifica que la carpeta sea de su ficha y que tenga evidencias.
3. Registra una evaluación `APROBADO` por cada evidencia vigente en una sola transacción.
4. Recalcula el estado de la carpeta y de la fase.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Carpeta aprobada | 200 | Estado de la carpeta y de la fase |
| Carpeta vacía | 400 | Mensaje del error |
| No está a su cargo | 403 | Mensaje de acceso denegado |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/instructor/carpetas/:carpetaId/aprobar` | Sí (INSTRUCTOR) | Aprueba la carpeta (propuesto) |

---

## Reglas de negocio

- **RN-016** — Evaluación por el instructor asignado.
- **RN-017** — Historial de evaluaciones.
- **RN-018** — Cascada de estados.
- **RN-019** — Aprobación de carpeta en bloque.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Es una función nueva.
