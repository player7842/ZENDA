# RF-003 — Recuperación de contraseña

<!--
  ¿Qué? Requisito funcional que define: recuperación de contraseña.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Evita bloquear cuentas legítimas sin que un administrador intervenga.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-003 |
| **Nombre** | Recuperación de contraseña |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-003 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir recuperar la contraseña en dos pasos: solicitar un enlace por correo y establecer una contraseña nueva con el token recibido. Este es el único uso que ZENDA da al envío de correos.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `correo` | Texto | Sí (paso 1) | No vacío |
| `token` | Texto | Sí (paso 2) | JWT vigente, 15 minutos |
| `contrasena` | Texto | Sí (paso 2) | Mínimo 8 caracteres |

---

## Proceso

1. El usuario ingresa su correo.
2. El backend busca la cuenta y genera un token de 15 minutos.
3. Envía por SMTP de Gmail un correo con el enlace `/reset-password?token=...`.
4. El usuario abre el enlace y envía la nueva contraseña.
5. El backend valida el token y la longitud, hashea la contraseña con bcrypt y la actualiza.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Enlace enviado | 200 | "Se ha enviado un enlace de recuperación a tu correo electrónico" |
| Correo no registrado (comportamiento actual) | 404 | "El correo no se encuentra registrado" |
| Contraseña corta o faltan datos | 400 | Mensaje del error |
| Token inválido o expirado | 400 | "El token es inválido o ha expirado" |
| Contraseña actualizada | 200 | "Contraseña actualizada exitosamente" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/forgot-password` | No | Solicita el enlace de recuperación |
| POST | `/api/auth/reset-password` | No | Establece la contraseña nueva |

---

## Reglas de negocio

- **RN-002** — Contraseña protegida con hash.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- La solicitud debe responder siempre el mismo mensaje, exista o no el correo, para evitar la enumeración de usuarios (hoy responde 404 si no existe).
- La URL base del enlace se lee de una variable de entorno (hoy está fija en `http://localhost:5173`).
- El token debe poder usarse una sola vez.
- Se elimina el secreto JWT por defecto del código.
