# RF-035 — Reporte en Excel

<!--
  ¿Qué? Requisito funcional que define: reporte en excel.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es el formato de trabajo habitual del instructor y la coordinación.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-035 |
| **Nombre** | Reporte en Excel |
| **Módulo** | Reportes |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Historia asociada** | HU-035 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir exportar a Excel el avance por ficha, por grupo y por aprendiz (aprobados y desaprobados). Hoy el coordinador exporta un CSV desde el navegador.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| Ficha o filtro | Opción | No | Ficha dentro del alcance del usuario |

---

## Proceso

1. El usuario elige el alcance del reporte.
2. El backend reúne los datos y genera el archivo `.xlsx`.
3. El frontend lo descarga.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Reporte generado | 200 | Archivo `.xlsx` |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/instructor/fichas/:id/reporte` | Sí (INSTRUCTOR) | Reporte de una ficha (propuesto) |
| GET | `/api/coordinador/reporte` | Sí (COORDINADOR) | Reporte del programa (propuesto) |

---

## Reglas de negocio

- **RN-016** — Evaluación por el instructor asignado.
- **RN-025** — Alcance del coordinador.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy el coordinador exporta un CSV generado en el navegador; el instructor no tiene exportación a Excel.
