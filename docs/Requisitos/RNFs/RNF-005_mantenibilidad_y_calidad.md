# RNF-005 — Mantenibilidad y calidad

<!--
  ¿Qué? Requisito no funcional que define: mantenibilidad y calidad.
  ¿Para qué? Hacer que el código sea ordenado, entendible y fácil de evolucionar por cualquier integrante del equipo.
  ¿Impacto? Un código desordenado multiplica el costo de cada cambio y los errores.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-005 |
| **Nombre** | Mantenibilidad y calidad |
| **Categoría** | Calidad del código |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-005.1 — Estructura de carpetas

Backend organizado en `routes`, `controllers`, `middleware`, `config` y `utils`; frontend en `pages`, `components`, `context` y `styles`. Los nombres de archivo describen su función.

**Estado:** Vigente

### RNF-005.2 — Nombres en español de dominio

Tablas, columnas, rutas y funciones del negocio se nombran en español; los términos técnicos estándar, en inglés.

**Estado:** Vigente

### RNF-005.3 — Gestor de paquetes y versiones

Solo **pnpm**, con lockfile versionado y versiones exactas (sin `^`, `~`, `*`). Node.js en versión LTS fijada en `.nvmrc`, `engines` y Docker.

**Estado:** Adoptada

### RNF-005.4 — Análisis estático

El frontend se analiza con **oxlint**; se define un linter para el backend.

**Estado:** Parcial

### RNF-005.5 — Comentarios y mensajes profesionales

El código, los comentarios y los mensajes de la API usan un lenguaje profesional, sin groserías ni coloquialismos.

**Estado:** Adoptada

### RNF-005.6 — Un solo lenguaje en el frontend

El frontend usa JavaScript (`.jsx`); el archivo `Tareas.tsx` debe unificarse (pendiente de confirmar).

**Estado:** Parcial

### RNF-005.7 — Documentación viva

La carpeta `docs/` se actualiza con cada cambio de reglas o de modelo de datos.

**Estado:** Adoptada

### RNF-005.8 — Pruebas automatizadas

Existen pruebas unitarias, de integración y no funcionales, y se ejecutan en cada Pull Request.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
