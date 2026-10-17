# RNF-012 — Gestión de archivos y almacenamiento

<!--
  ¿Qué? Requisito no funcional que define: gestión de archivos y almacenamiento.
  ¿Para qué? Definir los límites y el ciclo de vida de los archivos que suben los aprendices.
  ¿Impacto? Sin límites ni limpieza, el almacenamiento se llena y los archivos se vuelven un riesgo de seguridad.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-012 |
| **Nombre** | Gestión de archivos y almacenamiento |
| **Categoría** | Datos |
| **Prioridad** | Alta |
| **Estado** | Planificado |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-012.1 — Tamaño máximo

10 MB por archivo, medido después de comprimir las imágenes (valor del documento original).

**Estado:** Adoptada

### RNF-012.2 — Compresión de imágenes

Las imágenes mayores a 1 MB se redimensionan y se convierten a WebP antes de almacenarse. El umbral es una propuesta.

**Estado:** Por confirmar

### RNF-012.3 — Tipos permitidos

Lista blanca inicial: PDF, DOCX, XLSX, PPTX, PNG, JPG y WEBP. Los enlaces (Drive, GitHub, video) siguen permitidos. La lista final queda por confirmar.

**Estado:** Por confirmar

### RNF-012.4 — Cuota por proyecto

Cada proyecto tiene una cuota total de almacenamiento. Propuesta: 200 MB.

**Estado:** Por confirmar

### RNF-012.5 — Metadatos

Por cada archivo se guarda en PostgreSQL el nombre original, el tipo, el tamaño, el hash SHA-256 y la ruta de almacenamiento; el archivo se guarda con un nombre aleatorio.

**Estado:** Adoptada

### RNF-012.6 — Limpieza

Las evidencias eliminadas y las versiones antiguas se depuran del almacenamiento pasado un período por definir.

**Estado:** Por confirmar

### RNF-012.7 — Descarga con autorización

Los archivos se descargan solo después de validar que el usuario pertenece al grupo o a la ficha, mediante el backend o URLs firmadas de corta duración.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
