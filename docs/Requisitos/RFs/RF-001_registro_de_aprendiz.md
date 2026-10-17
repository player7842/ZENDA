# RF-001 — Registro de aprendiz

<!--
  ¿Qué? Requisito funcional que define: registro de aprendiz.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es la puerta de entrada de los aprendices; sin registro no hay usuarios que formen grupos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-001 |
| **Nombre** | Registro de aprendiz |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-001 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir que un aprendiz cree su cuenta con sus datos personales, su correo institucional, su ficha y una contraseña. Al registrarse, queda inscrito automáticamente en el grupo `General` de su ficha, que el sistema crea si todavía no existe. El registro exige aceptar los textos legales y aplica medidas contra el registro automatizado.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `nombre`, `apellido` | Texto | Sí | No vacíos |
| `tipo_documento` | Opción | Sí | `CC`, `TI`, `CE`, `PA` o `PPT` (Permiso por Protección Temporal) |
| `numero_documento` | Texto | Sí | Máximo 30 caracteres |
| `correo` | Texto (correo) | Sí | Dominio `@soy.sena.edu.co`; único en el sistema |
| `password` | Texto | Sí | Mínimo 8 caracteres; se evalúa con el medidor de fortaleza |
| `numero_ficha` | Número | Sí | Debe corresponder a una ficha existente |
| Aceptaciones legales | 4 casillas | Sí | Las cuatro deben estar marcadas |

---

## Proceso

1. El aprendiz completa el formulario; el frontend valida los campos y bloquea el pegado en la confirmación de contraseña.
2. El backend verifica los campos obligatorios y que el correo termine en `@soy.sena.edu.co`.
3. Verifica que el correo no esté registrado y que la ficha exista.
4. Hashea la contraseña con bcrypt y crea el usuario con rol `APRENDIZ`.
5. Busca el grupo `General` de la ficha (lo crea si no existe) e inscribe al aprendiz.
6. Genera el token de sesión y devuelve los datos públicos del usuario.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Registro exitoso | 201 | Mensaje, datos públicos del usuario y token |
| Faltan datos, correo no institucional, ficha inexistente o correo duplicado | 400 | Mensaje del error |
| Error del servidor | 500 | "Error del servidor, inténtalo de nuevo" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Crea la cuenta del aprendiz |
| GET | `/api/fichas/publicas` | No | Lista las fichas para el selector del registro |

---

## Reglas de negocio

- **RN-001** — Registro limitado a aprendices con correo institucional.
- **RN-002** — Contraseña protegida con hash.
- **RN-004** — Aceptación legal obligatoria.
- **RN-005** — Roles sin sub-roles.
- **RN-006** — Grupo General por ficha.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Se elimina el campo `sub_rol` (Scrum Master, Product Owner, Developer) del formulario, de la validación y de la base de datos.
- Se agrega el tipo de documento `PPT`.
- Se agregan las cuatro casillas legales obligatorias, el medidor de contraseña y el bloqueo de pegado en la confirmación.
- Se agregan límite de intentos, campo trampa (*honeypot*) y verificación del correo (ver [RS-006](../restricciones.md#rs-006--registro-seguro-y-humano)).
- Hoy el registro no valida la longitud de la contraseña; solo lo hace el restablecimiento.
