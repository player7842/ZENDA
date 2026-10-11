# RNF-002 — Rendimiento

<!--
  ¿Qué? Requisito no funcional que define: rendimiento.
  ¿Para qué? Mantener tiempos de respuesta aceptables y un consumo de recursos sostenible.
  ¿Impacto? Una plataforma lenta desmotiva su uso y se satura con más fichas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-002 |
| **Nombre** | Rendimiento |
| **Categoría** | Eficiencia |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-002.1 — Tiempo de respuesta de la API

Meta: el 95 % de las consultas de lectura responde en menos de 500 ms y el de escritura en menos de 1 s, con la base de datos en la misma red.

**Estado:** Adoptada

### RNF-002.2 — Carga inicial del frontend

Meta: la página de inicio carga en menos de 3 s en una conexión de 10 Mbps, con compresión (`gzip`) y caché larga para archivos con hash.

**Estado:** Adoptada

### RNF-002.3 — Índices de base de datos

Las claves foráneas más consultadas (`ficha_id`, `grupo_id`, `proyecto_id`, `fase_id`, `carpeta_id`, `usuario_id`) cuentan con índices.

**Estado:** Parcial

### RNF-002.4 — Paginación de listados

Los listados que pueden crecer (usuarios, evidencias, fichas) se paginan en el servidor.

**Estado:** Adoptada

### RNF-002.5 — Pool de conexiones

El backend usa un `Pool` de PostgreSQL y libera siempre las conexiones, incluso ante errores.

**Estado:** Vigente

### RNF-002.6 — Almacenamiento eficiente

Los archivos viven fuera de la base de datos y las imágenes grandes se comprimen para ahorrar espacio.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
