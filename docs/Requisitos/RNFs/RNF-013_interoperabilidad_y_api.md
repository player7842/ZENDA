# RNF-013 — Interoperabilidad y API

<!--
  ¿Qué? Requisito no funcional que define: interoperabilidad y api.
  ¿Para qué? Mantener un contrato claro y consistente entre el frontend, el backend y otros sistemas.
  ¿Impacto? Una API inconsistente complica el frontend, las pruebas y cualquier integración futura.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-013 |
| **Nombre** | Interoperabilidad y API |
| **Categoría** | Integración |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-013.1 — API REST con JSON

Toda la comunicación usa HTTP con cuerpos JSON bajo el prefijo `/api`.

**Estado:** Vigente

### RNF-013.2 — Códigos HTTP coherentes

Se usan 200, 201, 400, 401, 403, 404, 409 y 500 con el significado estándar.

**Estado:** Parcial

### RNF-013.3 — Formato de error uniforme

Todas las respuestas de error devuelven un objeto con el campo `message`.

**Estado:** Vigente

### RNF-013.4 — Fechas

Las fechas se transmiten en formato ISO 8601 y se muestran en la zona horaria de Colombia.

**Estado:** Adoptada

### RNF-013.5 — Contrato documentado

Cada endpoint se documenta en `referencia-tecnica/api-endpoints.md` con método, ruta, autorización y respuestas.

**Estado:** Adoptada

### RNF-013.6 — Intercambio de archivos de datos

Las importaciones y exportaciones usan CSV o XLSX con codificación UTF-8.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
