# HU-035 — Reporte en Excel

<!--
  ¿Qué? Historia de usuario que describe: reporte en excel.
  ¿Para qué? Formalizar la necesidad del instructor o coordinador: analizarlo y compartirlo en las herramientas que ya uso.
  ¿Impacto? Es el formato de trabajo habitual del instructor y la coordinación.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-035 |
| **Título** | Reporte en Excel |
| **Módulo** | Reportes |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Rol** | Instructor o coordinador |
| **RF asociado** | RF-035 |
| **Reglas de negocio** | RN-016, RN-025 |

---

## Historia

**Como** instructor o coordinador,
**quiero** exportar a Excel el avance de mis fichas, grupos y aprendices,
**para** analizarlo y compartirlo en las herramientas que ya uso.

---

## Criterios de aceptación

### CA-035.1 — Exportar ficha

- **Dado que** estoy en una ficha,
- **cuando** pido el reporte en Excel,
- **entonces** obtengo un `.xlsx` con grupos, aprendices y estado de las fases.

### CA-035.2 — Exportar el coordinador

- **Dado que** soy coordinador,
- **cuando** pido el reporte del programa,
- **entonces** obtengo el reporte con las fichas y proyectos de ADSO.

### CA-035.3 — Datos completos

- **Dado que** abro el archivo,
- **cuando** reviso las columnas,
- **entonces** encuentro encabezados claros y los datos sin truncar.

---

## Cambios frente a la versión v11

- Hoy el coordinador exporta un CSV generado en el navegador; el instructor no tiene exportación a Excel.
