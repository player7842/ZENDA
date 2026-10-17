# HU-034 — Reporte en PDF

<!--
  ¿Qué? Historia de usuario que describe: reporte en pdf.
  ¿Para qué? Formalizar la necesidad del aprendiz o instructor: entregar o conservar un soporte formal del avance.
  ¿Impacto? Sirve como evidencia de seguimiento ante la coordinación y el SENA.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-034 |
| **Título** | Reporte en PDF |
| **Módulo** | Reportes |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Rol** | Aprendiz o instructor |
| **RF asociado** | RF-034 |
| **Reglas de negocio** | — |

---

## Historia

**Como** aprendiz o instructor,
**quiero** descargar un reporte en PDF del avance del proyecto o de la ficha,
**para** entregar o conservar un soporte formal del avance.

---

## Criterios de aceptación

### CA-034.1 — Reporte del aprendiz

- **Dado que** estoy en mi proyecto,
- **cuando** pido el reporte en PDF,
- **entonces** obtengo un documento con el estado de mis fases, evidencias y tareas.

### CA-034.2 — Reporte del instructor

- **Dado que** estoy en una ficha,
- **cuando** pido el reporte en PDF,
- **entonces** obtengo un documento con el avance de sus grupos.

### CA-034.3 — Diseño imprimible

- **Dado que** abro el reporte,
- **cuando** lo reviso en pantalla o impreso,
- **entonces** el contenido se ve completo y legible.

---

## Cambios frente a la versión v11

- Se evalúa generar el PDF en el servidor para un formato uniforme (ver [RNF-006](../RNFs/RNF-006_compatibilidad_y_portabilidad.md)).
