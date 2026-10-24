# Autenticación, JWT y contraseñas — ZENDA

> [!NOTE]
> **Estado actual:** ZENDA usa un único JWT de sesión de **24 h** guardado en
> `localStorage` (hallazgo H-13). Las secciones sobre *access token* de 15 min,
> *refresh token* y `sesiones_refresh` describen el objetivo de **HU-004**
> (Semanas 3–6) y **no** están implementadas. Lo que sí existe hoy es el
> token de recuperación de un solo uso, el hash SHA-256 y `token_version`.

<!--
  ¿Qué? Cómo funciona la identidad en ZENDA: tokens JWT de acceso y de refresco, almacenamiento de contraseñas con bcrypt y política de sesiones.
  ¿Para qué? Entender por qué cada decisión (15 minutos, refresco rotativo, hash, límites) existe y cómo implementarla sin errores comunes.
  ¿Impacto? La autenticación es la puerta del sistema: si se rompe, se rompen todos los permisos que dependen de ella.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Tema** | Autenticación sin estado con JWT, refresco de sesión y credenciales |
| **Requisitos** | [RF-002](../Requisitos/RFs/RF-002_inicio_de_sesion.md), [RF-003](../Requisitos/RFs/RF-003_recuperacion_de_contrasena.md), [RF-004](../Requisitos/RFs/RF-004_sesion_segura.md), [RT-004](../Requisitos/restricciones.md#rt-004--método-de-autenticación), [RT-005](../Requisitos/restricciones.md#rt-005--algoritmo-de-hash-de-contraseñas) |
| **Tablas actuales** | `usuarios`, `recuperacion_contrasena` ([esquema](../Referencia-Tecnica/esquema-bd.md)) |
| **Tablas propuestas** | `sesiones_refresh`, `tokens_verificacion_correo` (Semanas 3–6) |
| **Fecha** | 23-oct-2026 |

---

## 1. Autenticación y autorización

| Concepto | Pregunta que responde | En ZENDA |
|---|---|---|
| **Autenticación** | ¿Quién eres? | Correo y contraseña → token ([RF-002](../Requisitos/RFs/RF-002_inicio_de_sesion.md)) |
| **Autorización** | ¿Qué puedes hacer? | Rol del token + pertenencia al grupo o a la ficha ([matriz de permisos](../Requisitos/matriz-permisos.md)) |

El token **identifica** al usuario; los **permisos se verifican en cada petición** en el servidor.

---

## 2. Qué es un JWT

Un **JSON Web Token** es una cadena de tres partes separadas por puntos, firmada por el servidor:

```text
eyJhbGciOiJIUzI1NiJ9 . eyJ1c3VhcmlvX2lkIjo3LCJyb2wiOiJBUFJFTkRJWiJ9 . 3x9Qe…firma…
   encabezado               contenido (payload)                         firma
```

| Parte | Contiene | Ejemplo decodificado |
|---|---|---|
| **Encabezado** | Algoritmo de firma | `{ "alg": "HS256" }` |
| **Contenido** | Datos (*claims*) | `{ "usuario_id": 7, "rol": "APRENDIZ", "iat": 1760000000, "exp": 1760000900 }` |
| **Firma** | Huella del encabezado y el contenido con la clave secreta | Verifica que nadie lo alteró |

> **El contenido NO está cifrado, solo firmado.** Cualquiera puede leerlo (está en Base64). Por eso **nunca** se guardan en él contraseñas, documentos ni datos sensibles.

| Dato del token | Para qué |
|---|---|
| `usuario_id` | Identificar a la persona |
| `rol` | Primer filtro de permisos |
| `iat` / `exp` | Cuándo se emitió y cuándo caduca |

### Cómo se valida

1. El cliente envía `Authorization: Bearer <token>`.
2. El servidor recalcula la firma con su `JWT_SECRET`; si no coincide → `401`.
3. Comprueba la caducidad (`exp`); si venció → `401`.
4. Carga `usuario_id` y `rol` y deja pasar a los controles de rol y de pertenencia.

```js
import jwt from 'jsonwebtoken';

// Emitir: contenido mínimo y vida corta
const token = jwt.sign({ usuario_id: usuario.usuario_id, rol: usuario.rol }, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '15m',
});

// Verificar: SIEMPRE con lista blanca de algoritmos
const datos = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
```

---

## 3. Por qué hay dos tokens

| | **Token de acceso** | **Token de refresco** |
|---|---|---|
| **Para qué** | Autorizar cada petición a la API | Obtener un acceso nuevo sin volver a pedir la contraseña |
| **Vida** | **15 minutos** | **7 días** |
| **Qué pasa si se roba** | Sirve solo unos minutos | Sirve más tiempo, por eso se **rota** y se puede **revocar** |
| **Dónde se guarda en el servidor** | En ningún lado (sin estado) | Solo su **hash SHA-256** en `sesiones_refresh` |
| **Se envía** | En cada petición | Solo a `/api/auth/refresh` y `/logout` |

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant S as Servidor
    C->>S: login (correo y contraseña)
    S-->>C: acceso (15 min) + refresco (7 días)
    C->>S: peticiones con el acceso
    Note over C,S: el acceso vence
    C->>S: refresh con el refresco
    S->>S: revoca el refresco usado y crea uno nuevo
    S-->>C: acceso nuevo + refresco nuevo
    C->>S: refresh con un refresco ya usado
    S-->>C: 401 y revoca la sesión (posible robo)
```

### Rotación y detección de reutilización

| Regla | Motivo |
|---|---|
| Cada refresco **se usa una sola vez**; al usarlo se emite otro | Un refresco robado deja de servir en cuanto el dueño legítimo renueva |
| Si llega un refresco **ya usado**, se revoca la sesión entera | Es señal de que alguien lo copió |
| Se guarda el **hash**, no el token | Si se filtra la base de datos, los tokens no sirven |
| El cierre de sesión **revoca** el refresco | Para que "cerrar sesión" signifique algo |

---

## 4. Dónde guardar el token en el navegador

| Opción | Ventaja | Riesgo |
|---|---|---|
| **`localStorage`** (hoy en ZENDA) | Simple; no se envía solo en cada petición | Cualquier script de la página lo lee: un XSS lo roba ([H-13](../Testing/hallazgos.md)) |
| **Cookie `HttpOnly` + `Secure` + `SameSite`** | JavaScript no puede leerla | Requiere configurar CORS con credenciales y protección CSRF |
| **En memoria** (variable de JavaScript) | No persiste ante XSS posterior | Se pierde al recargar la página |

**Decisión pendiente (HU-004):** pasar a un acceso de corta duración (15 min) con refresco rotativo, idealmente en cookie `HttpOnly`. Hoy el token vive en `localStorage` y dura 24 h ([H-13](../Testing/hallazgos.md)); la decisión final depende del dominio de producción ([pendientes](../Requisitos/restricciones.md#pendientes-de-confirmación)).

---

## 5. Sesión y cierre por inactividad

| Regla | Valor | Cómo se implementa |
|---|---|---|
| Vida del acceso | 15 minutos | `expiresIn` del JWT |
| Vida del refresco | 7 días | `fecha_expiracion` en `sesiones_refresh` |
| Inactividad | **30 minutos** | El frontend mide eventos de usuario; aviso a los 29 |
| Cierre manual | Revoca el refresco | `POST /api/auth/logout` |

La renovación cuesta una petición liviana cada 15 minutos; a cambio, un token robado deja de servir rápido.

---

## 6. Contraseñas

### Almacenamiento con bcrypt

| Idea | Explicación |
|---|---|
| **Hash, no cifrado** | Se guarda una huella irreversible; nadie (ni el administrador) puede recuperar la contraseña. |
| **Sal (*salt*)** | bcrypt agrega un valor aleatorio por contraseña: dos usuarios con la misma clave tienen hashes distintos. |
| **Costo (*work factor*)** | ZENDA usa **costo 10**: cada intento tarda lo suficiente para frenar la fuerza bruta. |
| **Nunca se devuelve** | Ni el hash ni la contraseña aparecen en respuestas, registros ni errores ([RS-003](../Requisitos/restricciones.md#rs-003--no-exponer-contraseñas)). |

```js
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 10);        // al registrar o restablecer
const coincide = await bcrypt.compare(password, hash); // al iniciar sesión
```

### Política de contraseña

| Regla | Detalle |
|---|---|
| Mínimo | **8 caracteres** con al menos **un número** ([RNF-001.8](../Requisitos/RNFs/RNF-001_seguridad.md)) |
| Medidor | 5 niveles: muy baja, baja, media, fuerte, muy segura |
| Contraseñas comunes | No superan el nivel `baja` |
| Pegado | Permitido en el campo de contraseña (gestores de contraseñas); bloqueado solo en la confirmación |
| Algoritmo del medidor | Propuesta en [pruebas unitarias, sección 7](../Testing/pruebas-unitarias.md#7-medidor-de-fortaleza-propuesta-de-algoritmo) (por confirmar) |

> Una contraseña larga y fácil de recordar (una frase) es más segura que una corta con símbolos. Por eso la longitud pesa más que las reglas de composición.

---

## 7. Recuperación de contraseña

| Paso | Detalle | Por qué |
|---|---|---|
| 1 | El usuario pide el enlace con su correo | — |
| 2 | La respuesta es **siempre la misma**, exista o no el correo | Evita descubrir qué correos tienen cuenta ([H-01](../Testing/hallazgos.md)) |
| 3 | Se envía un token de **15 minutos** de **un solo uso** | Limita la ventana de ataque |
| 4 | Al restablecer, el token se invalida | No se puede reutilizar |
| 5 | El enlace sale de `FRONTEND_URL`, no de `localhost` | Funciona en producción ([H-03](../Testing/hallazgos.md)) |

---

## 8. Errores comunes y cómo evitarlos

| Error | Consecuencia | Prevención en ZENDA |
|---|---|---|
| Secreto débil o con valor por defecto en el código | Cualquiera fabrica tokens válidos ([H-02](../Testing/hallazgos.md)) | El servidor no arranca sin `JWT_SECRET`; mínimo 32 bytes aleatorios |
| Aceptar `alg: none` o no fijar el algoritmo | Tokens sin firma aceptados | `verify` con `algorithms: ['HS256']` |
| Tokens que no caducan | Un robo es permanente | `exp` de 15 minutos |
| Datos sensibles dentro del token | Quedan visibles | Solo `usuario_id`, `rol` y fechas |
| Confiar en el `rol` del token **sin** más controles | Un rol viejo sigue vigente hasta que venza | Vida corta y verificación de pertenencia en el servidor |
| Mensajes distintos para "correo no existe" y "clave incorrecta" | Enumeración de usuarios | Mensaje único: "Credenciales incorrectas" |
| Sin límite de intentos | Fuerza bruta | Límite por IP y por correo ([RF-001](../Requisitos/RFs/RF-001_registro_de_aprendiz.md)) |

---

## 9. Hoy y mañana

| Aspecto | Antes (v11) | Actual (Semanas 1–2) |
|---|---|---|
| Duración del token | 24 horas | 24 horas (sin cambio) |
| Refresco y revocación | No existe | No existe; `token_version` invalida sesiones al cambiar la clave |
| Cierre por inactividad | No | No |
| Política de contraseña | Solo al restablecer | Registro y restablecimiento, mínimo 8 caracteres y medidor en el frontend |
| Recuperación | `404` si el correo no existe | Respuesta idéntica; token de un solo uso con hash SHA-256 |
| Límite de intentos | No | 20 intentos cada 15 min en autenticación |
| Verificación de correo | No | No (pendiente de RS-006) |

---

## Documentos relacionados

- [Seguridad y OWASP](seguridad-owasp.md) · [Protección de datos personales](proteccion-de-datos-personales.md)
- [Arquitectura — flujo de login](../Referencia-Tecnica/arquitectura.md#61-inicio-de-sesión-y-renovación-objetivo-hu-004) · [API de autenticación](../Referencia-Tecnica/api-endpoints.md#4-autenticación--apiauth)
- [Pruebas de integración — sesión](../Testing/pruebas-de-integracion.md#it-11--sesión-con-refresco)
