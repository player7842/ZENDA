# RF-022 — Versiones y eliminación de evidencias

<!--
  ¿Qué? Requisito funcional que define: versiones y eliminación de evidencias.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es el equilibrio entre dejar que todos suban y evitar que alguien borre o altere el trabajo de otro.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-022 |
| **Nombre** | Versiones y eliminación de evidencias |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Historia asociada** | HU-022 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir reemplazar una evidencia creando una versión nueva y eliminarla de forma lógica. Solo puede hacerlo quien la subió o el líder, y una evidencia aprobada queda protegida. Al subir una versión nueva de una evidencia reprobada, vuelve a revisión.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `evidenciaId` | Número | Sí | Evidencia existente y no aprobada |
| Archivo o enlace nuevo | Archivo o URL | Sí (al reemplazar) | Mismas validaciones de [RF-020](../RFs/RF-020_subida_de_evidencias.md) |

---

## Proceso

1. El usuario elige reemplazar o eliminar una evidencia.
2. El backend verifica que sea su autor o el líder y que la evidencia no esté aprobada.
3. Al reemplazar, crea una versión nueva y marca la anterior como histórica; al eliminar, la marca como eliminada.
4. Recalcula el estado de la carpeta y de la fase.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Operación exitosa | 200 | Evidencia con su nueva versión o confirmación |
| Sin permiso | 403 | Mensaje de acceso denegado |
| Evidencia aprobada | 409 | Mensaje que indica que está protegida |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/aprendiz/proyectos/evidencias/:id/versiones` | Sí (APRENDIZ) | Sube una versión nueva (propuesto) |
| DELETE | `/api/aprendiz/proyectos/evidencias/:id` | Sí (APRENDIZ) | Elimina de forma lógica (propuesto) |

---

## Reglas de negocio

- **RN-012** — Carpetas y evidencias por cualquier integrante.
- **RN-014** — Versionado y borrado lógico.
- **RN-015** — Sin bloqueo por fase.
- **RN-018** — Cascada de estados.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Es una función nueva: requiere una tabla de versiones y la columna `eliminada` en `evidencias`.
