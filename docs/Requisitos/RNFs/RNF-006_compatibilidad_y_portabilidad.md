# RNF-006 — Compatibilidad y portabilidad

<!--
  ¿Qué? Requisito no funcional que define: compatibilidad y portabilidad.
  ¿Para qué? Garantizar que el sistema funcione en distintos navegadores y entornos de ejecución.
  ¿Impacto? Sin portabilidad, el sistema funciona en un equipo y falla en el servidor.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-006 |
| **Nombre** | Compatibilidad y portabilidad |
| **Categoría** | Portabilidad |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-006.1 — Navegadores soportados

Últimas dos versiones de Chrome, Edge, Firefox y Safari.

**Estado:** Adoptada

### RNF-006.2 — Ejecución con Docker

Cada servicio tiene su `Dockerfile` y un `docker-compose.yml` levanta base de datos, backend y frontend con un solo comando.

**Estado:** Parcial

### RNF-006.3 — Ejecución sin Docker

El sistema se puede ejecutar localmente con Node.js LTS, pnpm y PostgreSQL 14 o superior.

**Estado:** Vigente

### RNF-006.4 — Configuración por entorno

El comportamiento se configura con variables de entorno, sin cambiar código entre desarrollo y producción (por ejemplo, `VITE_API_URL` y la URL del enlace de recuperación).

**Estado:** Parcial

### RNF-006.5 — Formato de reportes

Los reportes PDF se ven igual en los navegadores soportados; se evalúa generarlos en el servidor.

**Estado:** Adoptada

### RNF-006.6 — Sistema operativo

Los scripts y la documentación funcionan en Windows, macOS y Linux.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
