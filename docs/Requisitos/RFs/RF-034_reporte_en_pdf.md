# RF-034 — Reporte en PDF

<!--
  ¿Qué? Requisito funcional que define: reporte en pdf.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Sirve como evidencia de seguimiento ante la coordinación y el SENA.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-034 |
| **Nombre** | Reporte en PDF |
| **Módulo** | Reportes |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Historia asociada** | HU-034 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir generar reportes en PDF del proyecto (aprendiz) y de la ficha (instructor). Hoy se genera con la impresión del navegador (`window.print()`).

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El usuario pulsa el botón de reporte.
2. El frontend arma la vista imprimible con los datos ya cargados.
3. El navegador la guarda como PDF.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Reporte generado | — | Archivo PDF en el navegador del usuario |

---

## Endpoints asociados

Este requisito se resuelve en la interfaz y no expone endpoints propios.

---

## Reglas de negocio

- No aplica.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Se evalúa generar el PDF en el servidor para un formato uniforme (ver [RNF-006](../RNFs/RNF-006_compatibilidad_y_portabilidad.md)).
