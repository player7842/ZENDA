# Instalación con Docker — ZENDA

<!--
  ¿Qué? Guía para ejecutar ZENDA completo (base de datos, migración, backend y
  frontend) con Docker Compose.
  ¿Para qué? Obtener el mismo entorno en cualquier equipo y preparar el
  despliegue a un servidor.
  ¿Impacto? Evita el "en mi equipo sí funciona": todos corren las mismas
  versiones con la misma configuración.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Tiempo estimado** | 10 minutos (más la descarga de imágenes) |
| **Requisito principal** | Docker con Compose v2 |
| **Alternativa** | [Instalación sin Docker](sin-docker.md) |
| **Fecha** | 23-oct-2026 |

> **Estado de verificación:** **verificado**. `docker compose up --build -d`
> construye `zenda-backend` y `zenda-frontend`, y levanta `db`, `migrate`,
> `backend` y `frontend`. `GET /api/health` responde 200, el frontend responde
> 200 y el login de administrador y aprendiz responde 200. La migración se
> aplicó dos veces sin errores y el *fixture* v11 terminó con
> `V11_MIGRATION_OK`.

---

## 1. Requisitos previos

| Herramienta | Verificar con | Notas |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) o Docker Engine (Linux) | `docker --version` | Debe estar en ejecución. |
| Docker Compose v2 | `docker compose version` | Se usa `docker compose` (con espacio), no `docker-compose`. |
| Git | `git --version` | |
| Puerto 4000 y 8080 libres | `docker compose ps` | Si están ocupados, cambia el mapeo en `docker-compose.yml`. |

No hace falta instalar Node, pnpm ni PostgreSQL en el equipo: todo corre dentro
de los contenedores.

---

## 2. Qué se levanta

| Servicio | Imagen | Puerto en tu equipo | Función |
|---|---|:---:|---|
| `db` | `postgres:16-alpine` | *(no expuesto)* | Base de datos. Carga `Database/zenda_bd.sql` la primera vez. Datos en el volumen `pgdata`. |
| `migrate` | `postgres:16-alpine` | — | Aplica `Database/migrations/002_semana2.sql` y termina. |
| `backend` | `node:22-alpine` | **4000** | API REST de Express. |
| `frontend` | `nginx:alpine` | **8080** | SPA compilada con Vite y servida por Nginx. |

Orden de arranque:

```text
db (healthy) → migrate (exit 0) → backend (healthy) → frontend
```

La base de datos no se expone al exterior a propósito: solo el backend la
alcanza por la red interna de Compose.

---

## 3. Archivos necesarios

Deben existir en tu copia del repositorio:

```text
ZENDA/
├── docker-compose.yml
├── .env                    ← lo creas tú desde .env.example
├── Database/
│   ├── zenda_bd.sql
│   └── migrations/002_semana2.sql
├── backend/
│   ├── Dockerfile
│   └── .dockerignore       ← con el punto inicial
└── frontend/
    ├── Dockerfile
    ├── .dockerignore       ← con el punto inicial
    └── nginx.conf
```

> Si el `Dockerfile` del frontend falla con `nginx.conf: not found`, falta ese
> archivo. Y los `.dockerignore` deben llamarse así, con el punto: sin él,
> Docker copiaría `node_modules` y `.env` a la imagen.

---

## 4. Primer arranque

### 4.1 Crear el archivo `.env`

```bash
cp .env.example .env          # Windows: Copy-Item .env.example .env
```

Edita `.env` y cambia al menos:

- `DB_PASSWORD`
- `JWT_SECRET` (obligatorio; genéralo con `openssl rand -hex 32`)

`EMAIL_USER` y `EMAIL_PASS` son **opcionales**: si faltan, la aplicación
arranca igual y solo falla el envío del correo de recuperación. El resto de
variables está explicado en [variables de entorno](variables-de-entorno.md).

### 4.2 Construir y levantar

```bash
docker compose up --build -d
```

Sin `-d` ves los registros en primer plano. La primera vez tarda porque
descarga las imágenes y compila el frontend.

### 4.3 Comprobar

| Qué | Dónde | Resultado esperado |
|---|---|---|
| Aplicación | <http://localhost:8080> | Página de inicio de ZENDA. |
| API | <http://localhost:4000/api/health> | `{"status":"OK", ...}` |
| Estado de los servicios | `docker compose ps` | `db` y `backend` en *healthy*; `migrate` con código 0; `frontend` en ejecución. |
| Login de administrador | <http://localhost:8080> | `admin@zenda.com` / `Admin123!` |

Los usuarios de prueba están en [Instalación sin Docker, sección 6](sin-docker.md#6-usuarios-de-prueba).

> **Seguridad:** las credenciales del *seed* son de demostración. Cámbialas
> antes de publicar la aplicación.

---

## 5. Migración automática

`zenda_bd.sql` crea el esquema completo solo cuando el volumen está vacío. En
cada `docker compose up`, el servicio `migrate` aplica
`Database/migrations/002_semana2.sql` sobre la base existente y termina; el
backend solo arranca si la migración salió con código 0
(`service_completed_successfully`).

La migración es idempotente, así que también se puede ejecutar a mano:

```bash
docker compose run --rm migrate
```

Para comprobar que no destruye datos:

```bash
# 1. Base v11 con datos
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' \
  < Database/fixtures/v11_migracion.sql

# 2. Migración dos veces
docker compose run --rm migrate
docker compose run --rm migrate

# 3. Assertions
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' \
  < Database/fixtures/v11_migracion_assert.sql
```

Resultado esperado: `V11_MIGRATION_OK` y exactamente un grupo General por
ficha. El detalle de lo que cambia está en
[esquema de base de datos](../Referencia-Tecnica/esquema-bd.md#5-migración-002_semana2sql).

> [!WARNING]
> Haz una copia antes de migrar una base con datos reales. La migración
> **elimina** `usuarios.sub_rol_intencion` e `integrantes_grupo.rol_scrum`,
> pero conserva evidencias, grupos y proyectos.

---

## 6. Comandos del día a día

| Objetivo | Comando |
|---|---|
| Ver el estado | `docker compose ps` |
| Ver registros de todo | `docker compose logs -f` |
| Ver registros de un servicio | `docker compose logs -f backend` |
| Detener (conserva los datos) | `docker compose down` |
| Detener **y borrar la base de datos** | `docker compose down -v` |
| Reconstruir un servicio tras cambiar código | `docker compose up -d --build backend` |
| Reconstruir el frontend tras cambiar `VITE_API_URL` | `docker compose up -d --build frontend` |
| Abrir una consola SQL | `docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'` |
| Copia de seguridad | `docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > respaldo.sql` |
| Entrar al contenedor del backend | `docker compose exec backend sh` |
| Aplicar la migración a mano | `docker compose run --rm migrate` |

**Versión de Node:** está fijada en `node:22-alpine` dentro de los dos
Dockerfiles ([RH-002](../Requisitos/restricciones.md#rh-002--versión-lts-de-nodejs-fija)).
Para cambiarla hay que editar el `FROM` de cada Dockerfile y reconstruir; no
existe un `build-arg NODE_VERSION`.

---

## 7. Cómo están construidas las imágenes

| Aspecto | Backend | Frontend |
|---|---|---|
| Etapas | Una | Dos: compilar con Node 22 y servir con Nginx |
| Instalación | `pnpm install --frozen-lockfile --prod` | `pnpm install --frozen-lockfile` |
| Usuario del proceso | `node` (no `root`) | `nginx` |
| Configuración | Variables de entorno de Compose | `VITE_API_URL` incrustada al compilar |
| Excluido por `.dockerignore` | `node_modules`, `.env`, `.git` | `node_modules`, `dist`, `.env`, `.git` |
| Rutas de React Router | — | `nginx.conf` devuelve `index.html` para cualquier ruta |
| Salud | `wget --spider http://127.0.0.1:4000/api/health` | `wget --spider http://127.0.0.1:80/` |

El backend incluye `Database/migrations/002_semana2.sql` en la imagen porque el
contexto de build es la raíz del repositorio. Ese mismo contexto usa Render.

---

## 8. Llevarlo a producción

Esta composición sirve para desarrollo y para un primer despliegue. Antes de
publicarlo:

| Tema | Qué hacer |
|---|---|
| **HTTPS** | Poner un proxy inverso (Nginx, Caddy o el del proveedor) con certificado válido. |
| **URL del API** | Compilar el frontend con `VITE_API_URL` apuntando a la URL pública del backend. |
| **CORS y correo** | Definir `FRONTEND_URL` con el dominio real. Se usa para la lista blanca de CORS **y** para el enlace de recuperación. |
| **Secretos** | Usar valores nuevos y el gestor de secretos del proveedor; nunca los de prueba. |
| **Datos de prueba** | No cargar el *seed* en producción: quitar usuarios de ejemplo o crear una base limpia. |
| **Base de datos** | No exponer el puerto 5432; programar copias diarias ([RNF-008](../Requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md)). |
| **Archivos** | En Semana 2 las evidencias son enlaces; los archivos reales con almacenamiento compatible con S3 son de la Semana 4 ([RNF-012](../Requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md)). |
| **Reinicio** | Mantener `restart: unless-stopped` en los servicios. |
| **Render free** | No admite `preDeployCommand`: la migración va en `startCommand` ([guía de despliegue](despliegue-render-vercel-neon.md)). |

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `nginx.conf: not found` al construir | Falta `frontend/nginx.conf`. | Restáuralo desde el repositorio. |
| `port is already allocated` | El puerto 4000 u 8080 está ocupado. | Detén el otro proceso o cambia el mapeo en `docker-compose.yml`. |
| `db` no pasa a *healthy* | Contraseña distinta a la del volumen existente. | `docker compose down -v` y vuelve a levantar (borra los datos). |
| `migrate` termina con código distinto de 0 | Error de SQL o base inaccesible. | `docker compose logs migrate`; corrige y vuelve a ejecutar. |
| El backend reinicia en bucle | Falta `JWT_SECRET` o alguna variable de `DB_*`. | Revisa `docker compose logs backend`. |
| La web carga pero no hay datos | `VITE_API_URL` apunta a una URL que el navegador no alcanza. | Corrígela y reconstruye el frontend. |
| Error de CORS en el navegador | `FRONTEND_URL` no coincide con el origen real. | Ajusta `FRONTEND_URL` (admite varias URLs separadas por coma) y reinicia el backend. |
| La recuperación de contraseña no envía correo | `EMAIL_USER`/`EMAIL_PASS` vacíos o SMTP bloqueado. | Configura una contraseña de aplicación de Gmail o prueba el flujo en local. |
| `variable is not set` al ejecutar Compose | No existe el `.env` en la raíz. | Cópialo desde `.env.example`. |
| Los cambios del código no se ven | La imagen no se reconstruyó. | Agrega `--build`. |
| Datos de la base desaparecen | Se ejecutó `down -v`. | Es lo esperado: ese comando borra el volumen. |

---

## Documentos relacionados

- [Instalación sin Docker](sin-docker.md) · [Variables de entorno](variables-de-entorno.md)
- [Despliegue en Render + Vercel + Neon](despliegue-render-vercel-neon.md)
- [Arquitectura — contenedores y despliegue](../Referencia-Tecnica/arquitectura.md#3-contenedores-y-despliegue)
- [Restricciones](../Requisitos/restricciones.md) · [RNF-006 Portabilidad](../Requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md)
