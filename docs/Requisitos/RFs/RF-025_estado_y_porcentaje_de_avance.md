# RF-025 — Estado y porcentaje de avance

<!--
  ¿Qué? Requisito funcional que define: estado y porcentaje de avance.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Convierte las evaluaciones en un indicador claro para el aprendiz y para el seguimiento.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-025 |
| **Nombre** | Estado y porcentaje de avance |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-025 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe calcular automáticamente el estado de cada carpeta y de cada fase a partir de las evaluaciones, y mostrar el porcentaje de avance como evidencias aprobadas sobre el total, junto con las carpetas aprobadas sobre las totales.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. Cada vez que se registra una evaluación, el sistema recalcula las evidencias de la carpeta.
2. Si alguna está reprobada, la carpeta pasa a `Desaprobada`; si todas están aprobadas, a `Aprobada`; si no, queda en revisión.
3. La fase se desaprueba si alguna carpeta está desaprobada y se aprueba si todas lo están.
4. Calcula el porcentaje de la fase y el conteo de carpetas aprobadas.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Estados y porcentaje | 200 | Estado de carpeta y fase, porcentaje y conteo de carpetas |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/aprendiz/proyectos/mio` | Sí (APRENDIZ) | Incluye el estado y el avance de cada fase |
| GET | `/api/aprendiz/proyectos/resumen` | Sí (APRENDIZ) | Resumen con los porcentajes |

---

## Reglas de negocio

- **RN-018** — Cascada de estados.
- **RN-019** — Aprobación de carpeta en bloque.
- **RN-020** — Porcentaje de avance de la fase.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy la cascada recorre todas las evidencias de la fase; no existe el estado de carpeta ni el porcentaje.
- Se agrega `estado_carpeta` a `carpetas`.
