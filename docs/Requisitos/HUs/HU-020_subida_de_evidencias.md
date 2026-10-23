# HU-020 — Subida de evidencias

<!--
  ¿Qué? Historia de usuario que describe: subida de evidencias.
  ¿Para qué? Formalizar la necesidad del aprendiz: entregar los productos de mi proyecto para que el instructor los evalúe.
  ¿Impacto? Las evidencias son el insumo central del sistema; sin ellas no hay nada que evaluar.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-020 |
| **Título** | Subida de evidencias |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Alta |
| **Estado** | Parcial — solo enlaces; archivos reales fuera del alcance de Semanas 1–2 |
| **Rol** | Aprendiz |
| **RF asociado** | RF-020 |
| **Reglas de negocio** | RN-012, RN-013, RN-015 |

---

## Historia

**Como** aprendiz,
**quiero** subir archivos o enlaces como evidencias dentro de una carpeta,
**para** entregar los productos de mi proyecto para que el instructor los evalúe.

---

## Criterios de aceptación

### CA-020.1 — Subir archivo

- **Dado que** estoy en una carpeta de mi proyecto,
- **cuando** selecciono un archivo permitido y envío,
- **entonces** la evidencia aparece en la carpeta con mi nombre como autor.

### CA-020.2 — Subir enlace

- **Dado que** tengo un enlace a mi evidencia (Drive, GitHub, video),
- **cuando** lo registro con un nombre,
- **entonces** la evidencia queda guardada como enlace.

### CA-020.3 — Tipo o tamaño no permitido

- **Dado que** elijo un archivo de un tipo no permitido o demasiado grande,
- **cuando** envío,
- **entonces** el sistema lo rechaza y me indica el motivo.

### CA-020.4 — Imagen grande

- **Dado que** subo una imagen que supera el umbral de tamaño,
- **cuando** envío,
- **entonces** el sistema la comprime antes de almacenarla.

### CA-020.5 — Cualquier integrante

- **Dado que** soy un integrante que no es líder,
- **cuando** subo una evidencia,
- **entonces** el sistema me lo permite.

---

## Cambios frente a la versión v11

- Hoy solo se registran enlaces (`ubicacion`) y solo el líder puede subirlos ("Solo el líder del grupo puede subir evidencias").
- Se agregan archivos reales con almacenamiento compatible con S3 (ver [RT-006](../restricciones.md#rt-006--evidencias-como-archivo-o-enlace)), metadatos y compresión de imágenes.

## Alcance de las Semanas 1 y 2

**Decisión de alcance (auditoría del 22-oct-2026):** CA-020.1, CA-020.3 y CA-020.4 (archivos reales, lista blanca de tipos, tamaño máximo y compresión) **no se implementan en las Semanas 1 y 2**. Se trasladan a la **Semana 4**, junto con el almacenamiento S3/MinIO y HU-022 (versiones).

En Semana 2 sí queda cubierto:

- **CA-020.2:** registro de enlaces `http/https` con validación de esquema y longitud máxima.
- **CA-020.5:** cualquier integrante activo del grupo puede subir la evidencia; el autor se toma de `req.user`.

El formulario y la API siguen rechazando archivos; solo aceptan enlaces. Esta limitación debe reflejarse en la entrega y no declararse como HU-020 completa.
