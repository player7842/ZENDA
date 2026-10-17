# RF-019 — Carpetas de una fase

<!--
  ¿Qué? Requisito funcional que define: carpetas de una fase.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Las carpetas son la unidad con la que el instructor revisa y aprueba las entregas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-019 |
| **Nombre** | Carpetas de una fase |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-019 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir que cualquier integrante activo del grupo cree carpetas dentro de las fases de su proyecto. El nombre es libre y define el aprendiz.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `faseId` | Número | Sí | Fase de mi proyecto |
| `nombre_carpeta` | Texto | Sí | Máximo 150 caracteres |

---

## Proceso

1. El aprendiz elige la fase y escribe el nombre.
2. El backend verifica que la fase exista y que el aprendiz sea integrante activo del grupo.
3. Guarda la carpeta con su fecha de creación.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Carpeta creada | 201 | Datos de la carpeta |
| Nombre vacío | 400 | "El nombre de la carpeta es obligatorio" |
| Fase no encontrada | 404 | "Fase no encontrada" |
| No es integrante | 403 | Mensaje de acceso denegado |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/aprendiz/proyectos/fases/:faseId/carpetas` | Sí (APRENDIZ) | Crea una carpeta en la fase |

---

## Reglas de negocio

- **RN-012** — Carpetas y evidencias por cualquier integrante.
- **RN-015** — Sin bloqueo por fase.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy solo el líder puede crear carpetas ("Solo el líder del grupo puede crear carpetas"); pasa a ser permitido a cualquier integrante.
- Se agrega `estado_carpeta` para la cascada de aprobación.
