# HU-022 — Versiones y eliminación de evidencias

<!--
  ¿Qué? Historia de usuario que describe: versiones y eliminación de evidencias.
  ¿Para qué? Formalizar la necesidad del aprendiz: corregir un error o atender una observación sin perder el historial ni afectar a mis compañeros.
  ¿Impacto? Es el equilibrio entre dejar que todos suban y evitar que alguien borre o altere el trabajo de otro.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-022 |
| **Título** | Versiones y eliminación de evidencias |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-022 |
| **Reglas de negocio** | RN-012, RN-014, RN-015, RN-018 |

---

## Historia

**Como** aprendiz,
**quiero** reemplazar o eliminar una evidencia que subí,
**para** corregir un error o atender una observación sin perder el historial ni afectar a mis compañeros.

---

## Criterios de aceptación

### CA-022.1 — Reemplazar evidencia

- **Dado que** subí una evidencia reprobada,
- **cuando** subo una versión nueva,
- **entonces** la nueva versión queda activa y la anterior se conserva en el historial.

### CA-022.2 — Eliminar evidencia propia

- **Dado que** soy quien subió la evidencia,
- **cuando** la elimino,
- **entonces** deja de verse en la carpeta pero queda registrada.

### CA-022.3 — El líder elimina

- **Dado que** soy el líder del grupo,
- **cuando** elimino una evidencia de otro integrante,
- **entonces** el sistema me lo permite.

### CA-022.4 — Evidencia ajena

- **Dado que** no la subí yo y no soy el líder,
- **cuando** intento eliminarla o reemplazarla,
- **entonces** el sistema me lo niega.

### CA-022.5 — Evidencia aprobada

- **Dado que** la evidencia ya fue aprobada,
- **cuando** intento reemplazarla o eliminarla,
- **entonces** el sistema me lo impide.

---

## Cambios frente a la versión v11

- Es una función nueva: requiere una tabla de versiones y la columna `eliminada` en `evidencias`.
