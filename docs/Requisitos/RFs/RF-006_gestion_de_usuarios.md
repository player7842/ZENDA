# RF-006 — Gestión de usuarios

<!--
  ¿Qué? Requisito funcional que define: gestión de usuarios.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es la única vía para crear instructores, coordinadores y otros administradores.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-006 |
| **Nombre** | Gestión de usuarios |
| **Módulo** | Administración |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-006 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al administrador crear usuarios de cualquier rol, consultarlos, editarlos y cambiar su rol. Las operaciones de creación, edición y cambio de rol exigen su contraseña y un administrador no puede quitarse su propio rol.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `nombre`, `apellido`, `correo` | Texto | Sí | Correo único |
| `rol` | Opción | Sí | `APRENDIZ`, `INSTRUCTOR`, `COORDINADOR` o `ADMINISTRADOR` |
| `contrasena` | Texto | Sí (al crear) | Mínimo 8 caracteres |
| `estado` | Opción | No | `Activo` o inactivo |
| Contraseña del administrador | Texto | Sí | Debe coincidir con la del administrador |

---

## Proceso

1. El administrador abre el formulario y completa los datos.
2. El frontend pide confirmar con su contraseña.
3. El backend valida el rol, la longitud de la contraseña y la unicidad del correo.
4. Hashea la contraseña y guarda el usuario.
5. Devuelve el usuario sin contraseña, con sus fichas.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Usuario creado | 201 | "Usuario creado exitosamente" y el usuario |
| Datos incompletos, rol inválido o correo duplicado | 400 | Mensaje del error |
| Usuario no encontrado | 404 | "Usuario no encontrado" |
| Cambio de rol propio | 400 | Mensaje que impide quitarse el rol de administrador |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/users` | Sí (ADMINISTRADOR) | Crea un usuario |
| GET | `/api/users` | Sí (ADMINISTRADOR) | Lista usuarios con sus fichas |
| GET | `/api/users/:id` | Sí (ADMINISTRADOR) | Consulta un usuario |
| PUT | `/api/users/:id` | Sí (ADMINISTRADOR) | Edita un usuario |
| PUT | `/api/users/:id/rol` | Sí (ADMINISTRADOR) | Cambia el rol |

---

## Reglas de negocio

- **RN-001** — Registro limitado a aprendices con correo institucional.
- **RN-002** — Contraseña protegida con hash.
- **RN-005** — Roles sin sub-roles.
- **RN-028** — Confirmación con contraseña.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Los mensajes de error de la API deben reescribirse en un tono profesional (hoy algunos contienen groserías, ver [RI-002](../restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español)).
- Menú de tres puntos para las acciones de cada fila.
