# RF-015 — Unirse a un proyecto

<!--
  ¿Qué? Requisito funcional que define: unirse a un proyecto.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es la forma en que los demás integrantes entran al proyecto creado por el líder.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-015 |
| **Nombre** | Unirse a un proyecto |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-015 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir que un aprendiz se una a un proyecto usando su código de invitación, siempre que no tenga otro proyecto activo, pertenezca a la misma ficha y el grupo no haya alcanzado su cupo.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `codigo` | Texto | Sí | Formato `PRY-XXXXXX`, existente |

---

## Proceso

1. El aprendiz ingresa el código.
2. El backend verifica que no tenga un proyecto activo y que el código exista.
3. Verifica que el grupo no haya alcanzado su cupo.
4. Inscribe al aprendiz como integrante activo del grupo.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Unión exitosa | 200 | "Te uniste al proyecto correctamente" |
| Ya tiene proyecto o grupo lleno | 400 | Mensaje del error |
| Código no encontrado | 404 | "Código de grupo no encontrado" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/aprendiz/proyectos/unirse` | Sí (APRENDIZ) | Une al aprendiz al grupo |

---

## Reglas de negocio

- **RN-007** — Un proyecto activo por aprendiz.
- **RN-009** — Cupo del grupo.
- **RN-010** — Código de invitación.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Se elimina la selección de rol Scrum al unirse y la validación "Este grupo ya tiene un Product Owner".
- Se agrega la validación del cupo.
