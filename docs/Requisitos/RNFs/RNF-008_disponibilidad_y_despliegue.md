# RNF-008 — Disponibilidad y despliegue

<!--
  ¿Qué? Requisito no funcional que define: disponibilidad y despliegue.
  ¿Para qué? Asegurar que el sistema esté disponible, se pueda desplegar de forma repetible y se recupere de fallos.
  ¿Impacto? Un fallo sin copia de seguridad puede significar la pérdida del trabajo de todo un semestre.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-008 |
| **Nombre** | Disponibilidad y despliegue |
| **Categoría** | Operación |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-008.1 — Despliegue repetible

El despliegue se hace con imágenes Docker construidas con `pnpm install --frozen-lockfile`. El proceso del backend no corre como `root`.

**Estado:** Adoptada

### RNF-008.2 — Copias de seguridad

Se realiza una copia diaria de la base de datos y del almacenamiento de archivos, con un período de retención definido y una prueba de restauración documentada.

**Estado:** Adoptada

### RNF-008.3 — Comprobación de salud

La API expone `/api/health` y la composición de contenedores usa verificaciones de salud para la base de datos.

**Estado:** Parcial

### RNF-008.4 — Reinicio automático

Los contenedores se reinician automáticamente tras un fallo.

**Estado:** Adoptada

### RNF-008.5 — Registros y diagnóstico

El administrador puede consultar el estado del sistema; los errores se registran sin incluir datos sensibles.

**Estado:** Adoptada

### RNF-008.6 — HTTPS

En producción todo el tráfico viaja cifrado con HTTPS.

**Estado:** Adoptada

### RNF-008.7 — Actualizaciones sin interrupción

Las actualizaciones se despliegan sin afectar el funcionamiento general: se construye la imagen nueva, se reemplaza el contenedor y los cambios de esquema usan scripts compatibles con la versión anterior.

**Estado:** Adoptada

### RNF-008.8 — Copia antes de desplegar

Antes de cada despliegue o actualización se realiza una copia de seguridad de la base de datos.

**Estado:** Adoptada

### RNF-008.9 — Funcionamiento local estable

Ejecutado localmente, el sistema no presenta interrupciones durante su uso normal.

**Estado:** Parcial

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
