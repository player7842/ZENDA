# RF-002 — Inicio de sesión

<!--
  ¿Qué? Requisito funcional que define: inicio de sesión.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Controla el acceso a toda la plataforma; un fallo expone datos de los proyectos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-002 |
| **Nombre** | Inicio de sesión |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-002 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe autenticar a cualquier usuario mediante correo y contraseña, y entregarle un token de sesión (JWT) con su identificador y su rol. Los mensajes de error no revelan si el correo existe.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `correo` | Texto | Sí | Correo registrado |
| `password` | Texto | Sí | No vacía |

---

## Proceso

1. El usuario envía correo y contraseña.
2. El backend busca al usuario por correo.
3. Compara la contraseña con el hash almacenado (bcrypt).
4. Verifica que el estado de la cuenta sea `Activo`.
5. Genera un token JWT con `usuario_id` y `rol` y devuelve los datos públicos del usuario.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Acceso exitoso | 200 | "Login exitoso", usuario sin contraseña y token |
| Credenciales incorrectas | 401 | "Credenciales incorrectas, intenta de nuevo" |
| Cuenta inactiva | 403 | "Tu cuenta está inactiva, habla con un administrador" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Inicia sesión y devuelve el token |

---

## Reglas de negocio

- **RN-002** — Contraseña protegida con hash.
- **RN-003** — Solo las cuentas activas inician sesión.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- El token pasa de 24 horas a 15 minutos, con renovación (ver [RF-004](../RFs/RF-004_sesion_segura.md)).
- Se agrega límite de intentos fallidos.
- Se agrega el botón "Volver al inicio".
