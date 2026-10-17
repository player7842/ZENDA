# RF-004 — Sesión segura

<!--
  ¿Qué? Requisito funcional que define: sesión segura.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Reduce el daño si alguien obtiene un token o usa un equipo compartido del centro de formación.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-004 |
| **Nombre** | Sesión segura |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-004 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe usar un token de acceso de 15 minutos y un token de refresco de 7 días con rotación, cerrar la sesión tras 30 minutos de inactividad con aviso previo y permitir el cierre manual que revoca el token de refresco. Hoy el token dura 24 horas y el cierre solo borra el token del navegador.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `refresh_token` | Texto | Sí (renovación y cierre) | Vigente y no revocado |

---

## Proceso

1. Al iniciar sesión el backend entrega un token de acceso (15 minutos) y uno de refresco (7 días).
2. Cuando el acceso vence, el frontend pide uno nuevo con el refresco; el backend lo rota y revoca el anterior.
3. El frontend mide la inactividad; a los 29 minutos muestra el aviso y a los 30 cierra la sesión.
4. Al cerrar sesión, el backend revoca el refresco y el frontend borra los datos locales.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Renovación exitosa | 200 | Nuevo token de acceso y de refresco |
| Refresco inválido o revocado | 401 | Mensaje de sesión expirada |
| Cierre exitoso | 200 | Mensaje de confirmación |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/refresh` | Refresco | Renueva la sesión (propuesto) |
| POST | `/api/auth/logout` | Sí (JWT) | Revoca el refresco (propuesto) |

---

## Reglas de negocio

- **RN-003** — Solo las cuentas activas inician sesión.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy existe el cierre manual en el cliente y un token único de 24 horas guardado en `localStorage`.
- Los endpoints de renovación y de cierre son nuevos.
- Ver [RT-004](../restricciones.md#rt-004--método-de-autenticación).
