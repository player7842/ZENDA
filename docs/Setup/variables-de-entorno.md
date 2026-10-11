# Variables de entorno — ZENDA

<!--
  ¿Qué? Lista de todas las variables de configuración de ZENDA, qué hace cada una y dónde se define.
  ¿Para qué? Poder instalar y desplegar el sistema sin tocar el código ni exponer secretos.
  ¿Impacto? Una variable mal puesta deja el sistema sin base de datos, sin correo o con una sesión insegura.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Aplica a** | Backend, frontend y Docker Compose |
| **Archivos de ejemplo** | `.env.example` (raíz), `backend/.env.example`, `frontend/.env.example` |
| **Regla** | Los archivos `.env` **nunca se suben a GitHub** ([RS-001](../requisitos/restricciones.md#rs-001--secretos-fuera-del-código-y-del-repositorio), [RS-002](../requisitos/restricciones.md#rs-002--archivos-envexample-obligatorios)) |
| **Fecha** | Octubre 2026 |

**Leyenda:** ✅ la lee el código de v11 · 🆕 planificada para v12.

---

## 1. Qué archivo usar según cómo ejecutes ZENDA

| Forma de ejecución | Archivo `.env` | Quién lo lee |
|---|---|---|
| **Local sin Docker** (backend) | `backend/.env` | `dotenv` desde `backend/src/config/db.js` y `server.js` |
| **Local sin Docker** (frontend) | `frontend/.env` | Vite, al arrancar o compilar |
| **Docker Compose** | `.env` en la **raíz** | Docker Compose, que lo pasa a los contenedores |

Para crearlos, copia el ejemplo y edita los valores:

```bash
cp .env.example .env                              # Docker Compose
cp backend/.env.example backend/.env              # backend local
cp frontend/.env.example frontend/.env            # frontend local
```

> En Windows (PowerShell) usa `Copy-Item .env.example .env`.

---

## 2. Backend

| Variable | Estado | Obligatoria | Ejemplo | Descripción |
|---|:---:|:---:|---|---|
| `PORT` | ✅ | No | `4000` | Puerto del servidor Express. Por defecto, 4000. |
| `DB_HOST` | ✅ | Sí | `localhost` | Servidor de PostgreSQL. En Docker Compose es `db`. |
| `DB_PORT` | ✅ | Sí | `5432` | Puerto de PostgreSQL. |
| `DB_USER` | ✅ | Sí | `postgres` | Usuario de la base de datos. |
| `DB_PASSWORD` | ✅ | Sí | *(secreto)* | Contraseña del usuario. |
| `DB_NAME` | ✅ | Sí | `zenda` | Nombre de la base de datos. |
| `JWT_SECRET` | ✅ | **Sí** | *(secreto largo)* | Clave con la que se firman los tokens. |
| `EMAIL_USER` | ✅ | Sí | `cuenta@gmail.com` | Cuenta de Gmail que envía los correos. |
| `EMAIL_PASS` | ✅ | Sí | *(16 caracteres)* | **Contraseña de aplicación** de Gmail. |
| `FRONTEND_URL` | 🆕 | Sí | `https://zenda.ejemplo.com` | URL base del enlace de recuperación. Hoy está fija en `http://localhost:5173`. |
| `CORS_ORIGIN` | 🆕 | Sí en producción | `https://zenda.ejemplo.com` | Origen permitido por CORS. Hoy `cors()` acepta cualquiera. |
| `JWT_ACCESS_EXPIRES` | 🆕 | No | `15m` | Duración del token de acceso ([RT-004](../requisitos/restricciones.md#rt-004--método-de-autenticación)). |
| `JWT_REFRESH_EXPIRES_DAYS` | 🆕 | No | `7` | Duración del token de refresco. |
| `S3_ENDPOINT` | 🆕 | Sí (archivos) | `http://minio:9000` | Servicio compatible con S3 ([RT-006](../requisitos/restricciones.md#rt-006--evidencias-como-archivo-o-enlace)). |
| `S3_BUCKET` | 🆕 | Sí (archivos) | `zenda-evidencias` | Bucket de las evidencias. |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY` | 🆕 | Sí (archivos) | *(secretos)* | Credenciales del almacenamiento. |
| `MAX_UPLOAD_MB` | 🆕 | No | `10` | Tamaño máximo por archivo ([RNF-012.1](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md)). |
| `PROJECT_QUOTA_MB` | 🆕 | No | `200` | Cuota de almacenamiento por proyecto (por confirmar). |

> **Atención:** en v11 el código tiene un valor de respaldo para `JWT_SECRET` (`zenda_secret_key`) y credenciales de ejemplo para el correo. Hay que eliminarlos para que el servidor falle al iniciar si faltan ([RS-001](../requisitos/restricciones.md#rs-001--secretos-fuera-del-código-y-del-repositorio)).

---

## 3. Frontend

| Variable | Estado | Obligatoria | Ejemplo | Descripción |
|---|:---:|:---:|---|---|
| `VITE_API_URL` | ✅ | No | `http://localhost:4000` | URL del backend **tal como la ve el navegador**. Si no existe, el código usa `http://localhost:4000`. |

> **Se incrusta al compilar.** Vite copia el valor dentro del *build*. Si cambias `VITE_API_URL`, debes **volver a compilar** (en Docker: `docker compose up --build frontend`). Todas las variables que expone Vite empiezan por `VITE_` y son públicas: nunca pongas un secreto ahí.

---

## 4. Docker Compose (archivo `.env` de la raíz)

| Variable | Obligatoria | Usada por | Descripción |
|---|:---:|---|---|
| `DB_USER` | Sí | `db`, `backend` | Usuario que crea PostgreSQL y que usa el backend. |
| `DB_PASSWORD` | Sí | `db`, `backend` | Contraseña de ese usuario. |
| `DB_NAME` | Sí | `db`, `backend` | Base de datos que se crea. |
| `JWT_SECRET` | Sí | `backend` | Clave de firma de tokens. |
| `EMAIL_USER`, `EMAIL_PASS` | Sí | `backend` | Cuenta de Gmail y contraseña de aplicación. |
| `VITE_API_URL` | No | `frontend` (build) | URL pública del backend. Por defecto, `http://localhost:4000`. |

El `docker-compose.yml` fija por su cuenta `DB_HOST=db`, `DB_PORT=5432` y `PORT=4000`, así que **no** debes ponerlos en el `.env`.

> **Cuidado:** `POSTGRES_PASSWORD` solo se aplica la **primera vez** que se crea el volumen `pgdata`. Si cambias `DB_PASSWORD` después, la base seguirá con la contraseña anterior. Para reiniciar desde cero: `docker compose down -v` (borra los datos).

---

## 5. Cómo obtener los valores

### 5.1 `JWT_SECRET`

Debe ser largo y aleatorio (mínimo 32 bytes):

```bash
openssl rand -hex 32
```

Sin `openssl` (Node.js):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5.2 `EMAIL_PASS` (contraseña de aplicación de Gmail)

1. Activa la **verificación en dos pasos** en la cuenta de Google.
2. Entra en **Cuenta de Google → Seguridad → Contraseñas de aplicaciones**.
3. Crea una con el nombre `ZENDA` y copia los **16 caracteres** (sin espacios).
4. Pégalos en `EMAIL_PASS`. `EMAIL_USER` es el correo de esa misma cuenta.

> La contraseña normal de Gmail **no funciona**. Si la contraseña de aplicación se expone, revócala y crea otra.

---

## 6. Buenas prácticas

| Práctica | Detalle |
|---|---|
| Un valor distinto por entorno | Desarrollo, pruebas y producción no comparten `JWT_SECRET` ni contraseñas. |
| No reutilizar contraseñas | La contraseña de la base de datos no debe ser la de ninguna otra cuenta. |
| Rotación | Si un secreto pudo exponerse, cámbialo; cambiar `JWT_SECRET` cierra todas las sesiones. |
| Revisar antes de cada commit | `git status` no debe mostrar archivos `.env` (el `.gitignore` los excluye). |
| Mantener los ejemplos al día | Si agregas una variable al código, agrégala al `.env.example` en el mismo cambio. |
| Producción | Usar el gestor de secretos del proveedor en lugar de archivos en disco. |

---

## 7. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `ECONNREFUSED` o "password authentication failed" | `DB_*` incorrectas o PostgreSQL apagado. | Revisa host, puerto, usuario y contraseña; comprueba que PostgreSQL esté activo. |
| El frontend llama a `localhost:4000` en producción | `VITE_API_URL` no estaba definida al compilar. | Defínela y vuelve a compilar. |
| "Token inválido" tras reiniciar | `JWT_SECRET` cambió. | Es lo esperado: inicia sesión de nuevo. |
| No llegan los correos de recuperación | Contraseña normal en lugar de contraseña de aplicación, o verificación en dos pasos desactivada. | Genera una contraseña de aplicación (sección 5.2). |
| El enlace del correo abre `localhost:5173` | URL fija en el código (v11). | Se corrige con `FRONTEND_URL` 🆕. |
| `.env` aparece en `git status` | Falta el `.gitignore` en la raíz. | Copia el `.gitignore` entregado y ejecuta `git rm --cached .env`. |

---

## Documentos relacionados

- [Instalación sin Docker](sin-docker.md) · [Instalación con Docker](con-docker.md)
- [Restricciones](../requisitos/restricciones.md) · [RNF-001 Seguridad](../requisitos/RNFs/RNF-001_seguridad.md)
- [Arquitectura](../referencia-tecnica/arquitectura.md)
