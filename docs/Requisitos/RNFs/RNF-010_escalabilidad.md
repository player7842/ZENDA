# RNF-010 — Escalabilidad

<!--
  ¿Qué? Requisito no funcional que define: escalabilidad.
  ¿Para qué? Permitir que el sistema crezca en fichas, usuarios y archivos sin rediseñarlo.
  ¿Impacto? Sin escalabilidad, el sistema se satura al sumar más fichas o al aceptar archivos reales.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-010 |
| **Nombre** | Escalabilidad |
| **Categoría** | Capacidad |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-010.1 — Crecimiento esperado

Meta: soportar decenas de fichas, cientos de usuarios y miles de evidencias sin cambios de arquitectura.

**Estado:** Adoptada

### RNF-010.2 — Backend sin estado

La autenticación con JWT permite ejecutar varias réplicas del backend detrás de un balanceador. El backend no guarda archivos ni sesiones en su disco local.

**Estado:** Adoptada

### RNF-010.3 — Almacenamiento escalable

Los archivos se guardan en un servicio compatible con S3, que crece sin depender del disco del servidor ([RT-006](../restricciones.md#rt-006--evidencias-como-archivo-o-enlace)).

**Estado:** Adoptada

### RNF-010.4 — Pool configurable

El tamaño del pool de conexiones a PostgreSQL se define por variable de entorno.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
