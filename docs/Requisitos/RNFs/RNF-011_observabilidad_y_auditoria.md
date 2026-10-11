# RNF-011 — Observabilidad y auditoría

<!--
  ¿Qué? Requisito no funcional que define: observabilidad y auditoría.
  ¿Para qué? Saber qué ocurre en el sistema, quién hizo qué y cuándo.
  ¿Impacto? Sin registros ni auditoría, un error o una disputa sobre una evaluación no se pueden investigar.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-011 |
| **Nombre** | Observabilidad y auditoría |
| **Categoría** | Operación |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-011.1 — Registro de errores

El servidor registra los errores con fecha, ruta y usuario, sin contraseñas ni datos sensibles.

**Estado:** Parcial

### RNF-011.2 — Auditoría de acciones críticas

Crear, editar o eliminar usuarios, cambiar roles, reasignar liderazgo, eliminar evidencias y evaluar registran quién, qué y cuándo.

**Estado:** Adoptada

### RNF-011.3 — Verificación de salud

La API expone `/api/health` y el diagnóstico del administrador consume ese estado.

**Estado:** Parcial

### RNF-011.4 — Retención del historial

Debe definirse cuánto tiempo se conserva el historial del proyecto. El documento original proponía un mes; esto choca con el historial inmutable de [RNF-009.4](RNF-009_integridad_de_datos.md) y queda por decidir.

**Estado:** Por confirmar

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
