# Instalación sin Docker — ZENDA

<!--
  ¿Qué? Guía paso a paso para ejecutar ZENDA en tu equipo con Node.js, pnpm y PostgreSQL instalados directamente.
  ¿Para qué? Desarrollar y depurar con recarga automática, sin depender de contenedores.
  ¿Impacto? Es la forma más rápida de trabajar en el código día a día.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Tiempo estimado** | 15 a 20 minutos |
| **Sistemas** | Windows, macOS y Linux |
| **Alternativa** | [Instalación con Docker](con-docker.md) |
| **Fecha** | 23-oct-2026 |

---

## 1. Requisitos previos

| Herramienta | Versión | Verificar con | Notas |
|---|---|---|---|
| [Node.js](https://nodejs.org/) | **LTS** (ver [RH-002](../Requisitos/restricciones.md#rh-002--versión-lts-de-nodejs-fija)) | `node -v` | Usa solo versiones LTS. Se recomienda `nvm` para cambiar de versión. |
| [pnpm](https://pnpm.io/installation) | reciente | `pnpm -v` | **Único** gestor de paquetes permitido ([RH-001](../Requisitos/restricciones.md#rh-001--gestor-de-paquetes)). |
| [PostgreSQL](https://www.postgresql.org/download/) | **16** | `psql --version` | Debe incluir el cliente `psql`. |
| [Git](https://git-scm.com/) | cualquiera | `git --version` | |

Para activar pnpm con Corepack (incluido en Node.js LTS):

```bash
corepack enable
pnpm -v
```

> **No uses `npm install` ni `yarn`**: generan otros archivos de bloqueo y rompen la reproducibilidad.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/player7842/ZENDA.git
cd ZENDA
git checkout develop
```

Tu estructura debe verse así:

```text
ZENDA/
├── Database/     zenda_bd.sql · migrations/
├── backend/
├── frontend/
└── docs/
```

---

## 3. Base de datos

### 3.1 Crear la base

```bash
psql -U postgres -h localhost -c "CREATE DATABASE zenda;"
```

### 3.2 Cargar el esquema y los datos de prueba

```bash
psql -U postgres -h localhost -d zenda -f Database/zenda_bd.sql
```

> ⚠️ **Este script borra y recrea todas las tablas.** No lo ejecutes sobre una base con datos que quieras conservar.

### 3.3 Aplicar la migración de Semana 2

`zenda_bd.sql` ya crea el esquema actual (14 tablas), pero **no** crea las dos
funciones SQL de cascada. La migración las añade y deja la base idéntica a la
que usa Docker:

```bash
psql -U postgres -h localhost -d zenda -v ON_ERROR_STOP=1 \
  -f Database/migrations/002_semana2.sql
```

La migración es idempotente: se puede ejecutar varias veces. Si ya tenías una
base de una versión anterior, la actualiza sin borrar evidencias, grupos ni
proyectos. Si el script detecta ubicaciones heredadas inválidas, las conserva
y deja `chk_evidencias_ubicacion` como `NOT VALID`.

> Antes de migrar una base con datos reales haz una copia:
> `pg_dump -U postgres zenda > respaldo.sql`.

### 3.4 Comprobar

```bash
psql -U postgres -h localhost -d zenda -c "SELECT count(*) FROM usuarios;"
psql -U postgres -h localhost -d zenda -c "SELECT count(*) FROM grupos WHERE es_general;"
```

Con los datos de prueba debe devolver `18` usuarios y un General por cada una
de las 4 fichas. El detalle del esquema está en
[esquema de base de datos](../Referencia-Tecnica/esquema-bd.md).

---

## 4. Backend

### 4.1 Configurar

```bash
cd backend
cp .env.example .env        # Windows: Copy-Item .env.example .env
```

Edita `backend/.env` con tus valores. Las variables obligatorias son `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `JWT_SECRET`; `EMAIL_USER` y `EMAIL_PASS` solo hacen falta para la recuperación de contraseña. Detalle en [variables de entorno](variables-de-entorno.md).

### 4.2 Instalar y arrancar

```bash
pnpm install
pnpm dev
```

Debes ver en la consola que el servidor corre en el puerto `4000` y que la base de datos conectó.

### 4.3 Verificar

```bash
curl http://localhost:4000/api/health
```

Respuesta esperada: `{"status":"OK", ...}`.

---

## 5. Frontend

En **otra terminal**:

```bash
cd frontend
cp .env.example .env        # opcional: sin él usa http://localhost:4000
pnpm install
pnpm dev
```

Abre **http://localhost:5173**.

---

## 6. Usuarios de prueba

Cargados por `zenda_bd.sql`. **Solo para desarrollo**: cámbialos o elimínalos antes de cualquier despliegue.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@zenda.com` | `Admin123!` |
| Instructor | `felipe@zenda.com`, `rosa@zenda.com`, `pedro@zenda.com` | `Prueba123!` |
| Coordinador | `maria@zenda.com`, `julian@zenda.com` | `Prueba123!` |
| Aprendiz | `carlos@zenda.com`, `juan@zenda.com`, `marta@zenda.com`, `laura@zenda.com`, `luis@zenda.com`, `ana@zenda.com`, `sofia@zenda.com`, `camila@zenda.com`, `jose@zenda.com`, `diego@zenda.com`, `valentina@zenda.com`, `sara@zenda.com` | `Prueba123!` |

Fichas de prueba: `2724285`, `2724310`, `2724290` y `2724315`. El proyecto de ejemplo "ZENDA" pertenece a la ficha `2724285` (grupo de `carlos@zenda.com`).

---

## 7. Comandos útiles

| Dónde | Comando | Para qué |
|---|---|---|
| `backend/` | `pnpm dev` | Servidor con recarga automática (`nodemon`). |
| `backend/` | `pnpm start` | Servidor sin recarga (como en producción). |
| `backend/` | `pnpm test` | 9 pruebas unitarias + 7 de integración (16). Las de integración se omiten si no hay base. |
| `backend/` | `pnpm lint` | Analiza el código con ESLint. |
| `frontend/` | `pnpm dev` | Servidor de desarrollo de Vite. |
| `frontend/` | `pnpm build` | Compila a `frontend/dist`. |
| `frontend/` | `pnpm preview` | Sirve el *build* localmente para probarlo. |
| `frontend/` | `pnpm lint` | Analiza el código con `oxlint`. |
| raíz | `pg_dump -U postgres zenda > respaldo.sql` | Copia de seguridad de la base. |

**Reiniciar la base a su estado inicial:**

```bash
psql -U postgres -h localhost -d zenda -f Database/zenda_bd.sql
```

---

## 8. Lista de humo (comprobación rápida)

Después de instalar o de cualquier cambio grande, verifica en unos 10 minutos:

| # | Prueba | Resultado esperado |
|:---:|---|---|
| 1 | Iniciar sesión como administrador | Abre `/admin` con su panel. |
| 2 | Iniciar sesión como instructor, coordinador y aprendiz | Cada uno abre su panel. |
| 3 | Aprendiz: abrir "Mi proyecto" | Muestra el proyecto, integrantes y fases. |
| 4 | Aprendiz: crear una carpeta y subir una evidencia | Aparece en la fase. |
| 5 | Instructor: evaluar esa evidencia | El estado de la fase se actualiza. |
| 6 | Aprendiz: mover una tarea | Cambia de estado. |
| 7 | Recuperar contraseña | Llega el correo (requiere `EMAIL_*`). |

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `pnpm: command not found` | pnpm no está activado. | Ejecuta `corepack enable` o instálalo según su guía. |
| `psql: command not found` (Windows) | `psql` no está en el `PATH`. | Agrega la carpeta `bin` de PostgreSQL al `PATH` o usa la consola SQL Shell. |
| `password authentication failed for user` | Contraseña de PostgreSQL incorrecta. | Corrige `DB_PASSWORD` en `backend/.env`. |
| `database "zenda" does not exist` | No se creó la base. | Repite el paso 3.1. |
| `EADDRINUSE: address already in use :::4000` | Otro proceso usa el puerto. | Cierra ese proceso o cambia `PORT`. |
| La pantalla carga pero los datos fallan | Backend apagado o `VITE_API_URL` errónea. | Verifica `/api/health` y reinicia `pnpm dev` del frontend. |
| `Unsupported engine` o errores raros de instalación | Versión de Node distinta a la LTS del proyecto. | Cambia con `nvm use` y reinstala (`pnpm install`). |
| No llegan los correos | Contraseña de aplicación mal configurada. | Revisa [variables de entorno](variables-de-entorno.md#52-email_pass-contraseña-de-aplicación-de-gmail). |

---

## Documentos relacionados

- [Instalación con Docker](con-docker.md) · [Variables de entorno](variables-de-entorno.md)
- [Esquema de base de datos](../Referencia-Tecnica/esquema-bd.md) · [Arquitectura](../Referencia-Tecnica/arquitectura.md)
- [Restricciones](../Requisitos/restricciones.md)
