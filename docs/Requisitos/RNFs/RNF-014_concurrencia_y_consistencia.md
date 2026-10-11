# RNF-014 — Concurrencia y consistencia

<!--
  ¿Qué? Requisito no funcional que define: concurrencia y consistencia.
  ¿Para qué? Evitar resultados inconsistentes cuando varias personas usan el sistema al mismo tiempo.
  ¿Impacto? Con equipos de varios aprendices, dos acciones simultáneas son habituales.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-014 |
| **Nombre** | Concurrencia y consistencia |
| **Categoría** | Datos |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-014.1 — Cupo del grupo

La unión a un grupo usa una transacción con bloqueo de fila (`SELECT ... FOR UPDATE`) para que dos uniones simultáneas no sobrepasen el cupo.

**Estado:** Adoptada

### RNF-014.2 — Edición simultánea

Para recursos editables (proyecto, tarea) se usa control optimista con la fecha de última modificación; si el recurso cambió, se avisa al usuario.

**Estado:** Adoptada

### RNF-014.3 — Doble envío

Los botones de envío se deshabilitan mientras la petición está en curso y las subidas repetidas se detectan con el hash del archivo.

**Estado:** Adoptada

### RNF-014.4 — Unicidad garantizada por la base de datos

La regla de un solo proyecto activo por aprendiz se refuerza con restricciones únicas en la base de datos, no solo con validaciones del backend.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
