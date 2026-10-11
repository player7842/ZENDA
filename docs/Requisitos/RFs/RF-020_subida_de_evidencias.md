# RF-020 — Subida de evidencias

<!--
  ¿Qué? Requisito funcional que define: subida de evidencias.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Las evidencias son el insumo central del sistema; sin ellas no hay nada que evaluar.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-020 |
| **Nombre** | Subida de evidencias |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-020 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir que cualquier integrante activo suba evidencias como archivo o como enlace. Los archivos se validan por tipo, contenido y tamaño, se almacenan en un servicio compatible con S3 y las imágenes grandes se comprimen. Cada evidencia registra quién la subió.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `nombre_evidencia` | Texto | Sí | Máximo 200 caracteres |
| `tipo_evidencia` | Opción | Sí | `ARCHIVO` o `ENLACE` |
| `ubicacion` / archivo | URL o archivo | Sí | URL válida, o archivo de un tipo permitido y dentro del tamaño máximo |

---

## Proceso

1. El aprendiz elige un archivo o escribe un enlace.
2. El backend verifica que sea integrante activo del grupo dueño de la carpeta.
3. Si es archivo, valida su tipo real y su tamaño, comprime las imágenes grandes y lo guarda en el almacenamiento con un nombre aleatorio.
4. Guarda en la base de datos el nombre, el tipo, la ubicación, el autor y la fecha.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Evidencia creada | 201 | `evidencia_id` |
| Faltan datos o archivo no permitido | 400 | Mensaje del error |
| Carpeta no encontrada | 404 | "Carpeta no encontrada" |
| No es integrante | 403 | Mensaje de acceso denegado |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/aprendiz/proyectos/carpetas/:carpetaId/evidencias` | Sí (APRENDIZ) | Registra una evidencia |

---

## Reglas de negocio

- **RN-012** — Carpetas y evidencias por cualquier integrante.
- **RN-013** — Tipos de evidencia y límites.
- **RN-015** — Sin bloqueo por fase.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy solo se registran enlaces (`ubicacion`) y solo el líder puede subirlos ("Solo el líder del grupo puede subir evidencias").
- Se agregan archivos reales con almacenamiento compatible con S3 (ver [RT-006](../restricciones.md#rt-006--evidencias-como-archivo-o-enlace)), metadatos y compresión de imágenes.
