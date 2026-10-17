# RF-017 — Cambio de ficha del aprendiz

<!--
  ¿Qué? Requisito funcional que define: cambio de ficha del aprendiz.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Evita inscripciones incorrectas, pero debe impedirse cuando ya hay un proyecto en curso.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-017 |
| **Nombre** | Cambio de ficha del aprendiz |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Historia asociada** | HU-017 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir que el aprendiz consulte su ficha actual y la cambie por otra existente, siempre que no tenga un proyecto activo.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `numero_ficha` | Número | Sí | Ficha existente |

---

## Proceso

1. El aprendiz elige la nueva ficha.
2. El backend verifica que no tenga un proyecto activo.
3. Valida que la ficha exista.
4. Traslada su inscripción al grupo `General` de la nueva ficha.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Ficha actualizada | 200 | "Ficha actualizada correctamente" |
| Con proyecto activo o ficha inexistente | 400 | Mensaje del error |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/aprendiz/proyectos/mi-ficha` | Sí (APRENDIZ) | Consulta mi ficha |
| PUT | `/api/aprendiz/proyectos/mi-ficha` | Sí (APRENDIZ) | Cambia mi ficha |

---

## Reglas de negocio

- **RN-006** — Grupo General por ficha.
- **RN-029** — Cambio de ficha del aprendiz.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).
