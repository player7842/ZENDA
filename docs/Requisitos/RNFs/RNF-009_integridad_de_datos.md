# RNF-009 — Integridad de datos

<!--
  ¿Qué? Requisito no funcional que define: integridad de datos.
  ¿Para qué? Mantener consistentes y trazables los datos del proyecto formativo.
  ¿Impacto? Datos inconsistentes llevan a evaluaciones erróneas y a conflictos entre aprendices e instructores.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-009 |
| **Nombre** | Integridad de datos |
| **Categoría** | Datos |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-009.1 — Integridad referencial

Las relaciones entre tablas se garantizan con claves foráneas y restricciones `UNIQUE`/`NOT NULL`/`CHECK`.

**Estado:** Vigente

### RNF-009.2 — Transacciones

Las operaciones compuestas (crear proyecto con sus fases, evaluar y recalcular estados, importar usuarios) usan transacciones con `COMMIT` y `ROLLBACK`.

**Estado:** Parcial

### RNF-009.3 — Trazabilidad de autoría

Cada evidencia, evaluación, observación y tarea registra quién la creó y cuándo.

**Estado:** Parcial

### RNF-009.4 — Historial inmutable

Las evaluaciones y las versiones de evidencias no se sobrescriben; se agregan registros nuevos.

**Estado:** Adoptada

### RNF-009.5 — Borrado lógico

Eliminar evidencias y desvincular instructores y aprendices conserva el registro con su estado y fecha.

**Estado:** Adoptada

### RNF-009.6 — Unicidad de reglas clave

La base de datos impide que un aprendiz tenga dos proyectos activos y que una ficha o un correo se repitan.

**Estado:** Parcial

### RNF-009.7 — Esquema oficial

`Database/zenda_bd.sql` es la única fuente del esquema; los cambios se aplican con scripts versionados.

**Estado:** Parcial

### RNF-009.8 — Fecha de última modificación

Las entidades editables (usuarios, proyectos, tareas, evidencias, listas de chequeo) guardan la fecha y hora de su última modificación. Hoy solo `usuarios` tiene `fecha_actualizacion`.

**Estado:** Parcial

### RNF-009.9 — Límite de texto

Los campos de texto respetan el límite del esquema (150 a 500 caracteres según el campo). El documento original proponía 1000; se conserva el valor del esquema salvo que se amplíe.

**Estado:** Por confirmar

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
