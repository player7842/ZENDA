# RF-005 — Protección de rutas por rol

<!--
  ¿Qué? Requisito funcional que define: protección de rutas por rol.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es el control de acceso del sistema; sin él cualquier usuario podría ejecutar acciones de otro rol.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-005 |
| **Nombre** | Protección de rutas por rol |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-005 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe validar la sesión y el rol tanto en el frontend (rutas protegidas por rol) como en el backend (middlewares `auth` y `is<Rol>`). El control del backend es el que cuenta como seguridad.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El frontend revisa el token y el rol guardados antes de mostrar una ruta.
2. El backend `auth` valida el token JWT de cada petición protegida.
3. El middleware `isAdmin`, `isCoordinador`, `isInstructor` o `isAprendiz` verifica el rol del token.
4. Si falla alguna validación, responde con error y no ejecuta la acción.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Token ausente o inválido | 401 | Mensaje de no autenticado |
| Rol sin permiso | 403 | Mensaje de acceso denegado |
| Acceso permitido | 200 | La respuesta de la ruta solicitada |

---

## Endpoints asociados

Este requisito se resuelve en la interfaz y no expone endpoints propios.

---

## Reglas de negocio

- **RN-003** — Solo las cuentas activas inician sesión.
- **RN-005** — Roles sin sub-roles.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).
