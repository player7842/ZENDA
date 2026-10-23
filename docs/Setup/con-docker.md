# Instalación con Docker — ZENDA

<!--
  ¿Qué? Guía para ejecutar ZENDA completo (base de datos, backend y frontend) con un solo comando usando Docker Compose.
  ¿Para qué? Obtener el mismo entorno en cualquier equipo y preparar el despliegue a un servidor.
  ¿Impacto? Evita el "en mi equipo sí funciona": todos corren las mismas versiones con la misma configuración.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Tiempo estimado** | 10 minutos (más la descarga de imágenes) |
| **Requisito principal** | Docker con Compose v2 |
| **Alternativa** | [Instalación sin Docker](sin-docker.md) |
| **Fecha** | Octubre 2026 |

> **Estado de verificación:** la sintaxis del `docker-compose.yml` fue validada, pero el equipo debe probar la construcción completa en su entorno antes de darla por buena ([RT-008](../requisitos/restricciones.md#rt-008--contenedores-con-docker)).

---

## 1. Requisitos previos

| Herramienta | Verificar con | Notas |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) o Docker Engine (Linux) | `docker --version` | Debe estar en ejecución. |
| Docker Compose v2 | `docker compose version` | Se usa `docker compose` (con espacio), no `docker-compose`. |
| Git | `git --version` | |

---

## 2. Qué se levanta

| Servicio | Imagen | Puerto en tu equipo | Función |
|---|---|:---:|---|
| `db` | `postgres:16-alpine` | *(no expuesto)* | Base de datos. Carga `Database/zenda_bd.sql` la primera vez. Datos en el volumen `pgdata`. |
| `backend` | `node:<LTS>-alpine` | **4000** | API REST de Express. |
| `frontend` | `nginx:alpine` | **8080** | SPA compilada con Vite y servida por Nginx. |

La base de datos no se expone al exterior a propósito: solo el backend la alcanza por la red interna de Compose.

---

## 3. Archivos necesarios

Deben existir en tu copia del repositorio:

```text
ZENDA/
├── docker-compose.yml
├── .env                    ← lo creas tú desde .env.example
├── Database/zenda_bd.sql
├── backend/
│   ├── Dockerfile
│   └── .dockerignore       ← con el punto inicial
└── frontend/
    ├── Dockerfile
    ├── .dockerignore       ← con el punto inicial
    └── nginx.conf
```

> Si el `Dockerfile` del frontend falla con `nginx.conf: not found`, falta ese archivo. Y los `.dockerignore` deben llamarse así, con el punto: sin él, Docker copiaría `node_modules` y `.env` a la imagen.

---

## 4. Primer arranque

### 4.1 Crear el archivo `.env`

```bash
cp .env.example .env          # Windows: Copy-Item .env.example .env
```

Edita `.env`: define `DB_PASSWORD`, `JWT_SECRET`, `EMAIL_USER` y `EMAIL_PASS` ([cómo obtenerlos](variables-de-entorno.md#5-cómo-obtener-los-valores)).

### 4.2 Construir y levantar

```bash
docker compose up --build
```

Agrega `-d` para dejarlo en segundo plano.

### 4.3 Comprobar

| Qué | Dónde | Resultado esperado |
|---|---|---|
| Aplicación | http://localhost:8080 | Página de inicio de ZENDA. |
| API | http://localhost:4000/api/health | `{"status":"OK", ...}` |
| Estado de los servicios | `docker compose ps` | `db` en estado *healthy*; `migrate` terminó con código 0; `backend` y `frontend` en ejecución. |

Los usuarios de prueba están en [Instalación sin Docker, sección 6](sin-docker.md#6-usuarios-de-prueba).

---

## 5. Migración automática

`zenda_bd.sql` crea el esquema completo solo cuando el volumen está vacío. En cada `docker compose up`, el servicio `migrate` aplica `Database/migrations/002_semana2.sql` sobre la base existente y termina; el backend solo arranca si la migración salió con código 0 (`service_completed_successfully`).

La migración es idempotente, así que también se puede ejecutar a mano si hace falta:

**Linux / macOS / Git Bash**

```bash
docker compose run --rm migrate
```

**PowerShell**

```powershell
docker compose run --rm migrate
```

> Haz antes una copia (sección 6). La migración elimina `rol_scrum` y `sub_rol_intencion`; solo debe aplicarse junto con el backend v12 ([esquema](../referencia-tecnica/esquema-bd.md#6-notas-de-migración)).

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

**Cambiar la versión de Node:**

```bash
docker compose build --build-arg NODE_VERSION=22
```

La versión se define con el argumento `NODE_VERSION` de cada `Dockerfile` ([RH-002](../requisitos/restricciones.md#rh-002--versión-lts-de-nodejs-fija)).

---

## 7. Cómo están construidas las imágenes

| Aspecto | Backend | Frontend |
|---|---|---|
| Etapas | Una | Dos: compilar con Node y servir con Nginx |
| Instalación | `pnpm install --frozen-lockfile --prod` | `pnpm install --frozen-lockfile` |
| Usuario del proceso | `node` (no `root`) | `nginx` |
| Configuración | Variables de entorno de Compose | `VITE_API_URL` incrustada al compilar |
| Excluido por `.dockerignore` | `node_modules`, `.env`, `.git` | `node_modules`, `dist`, `.env`, `.git` |
| Rutas de React Router | — | `nginx.conf` devuelve `index.html` para cualquier ruta |

---

## 8. Llevarlo a producción

Esta composición sirve para desarrollo y para un primer despliegue. Antes de publicarlo:

| Tema | Qué hacer |
|---|---|
| **HTTPS** | Poner un proxy inverso (Nginx, Caddy o el del proveedor) con certificado válido. |
| **URL del API** | Compilar el frontend con `VITE_API_URL` apuntando a la URL pública del backend. |
| **CORS** | Restringir `cors()` al dominio del frontend (`CORS_ORIGIN` 🆕). |
| **Secretos** | Usar valores nuevos y el gestor de secretos del proveedor; nunca los de prueba. |
| **Datos de prueba** | No cargar el *seed* en producción: quitar usuarios de ejemplo o crear una base limpia. |
| **Base de datos** | No exponer el puerto 5432; programar copias diarias ([RNF-008](../requisitos/RNFs/RNF-008_disponibilidad_y_despliegue.md)). |
| **Archivos** | Usar un almacenamiento S3 gestionado en lugar de MinIO ([RNF-012](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md)). |
| **Reinicio** | Mantener `restart: unless-stopped` en los servicios. |

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `nginx.conf: not found` al construir | Falta `frontend/nginx.conf`. | Agrégalo desde el paquete de infraestructura. |
| `port is already allocated` | El puerto 4000 u 8080 está ocupado. | Detén el otro proceso o cambia el puerto en `docker-compose.yml`. |
| `db` no pasa a *healthy* | Contraseña distinta a la del volumen existente. | `docker compose down -v` y vuelve a levantar (borra los datos). |
| El backend reinicia en bucle | Falta alguna variable en `.env`. | Revisa `docker compose logs backend`. |
| La web carga pero no hay datos | `VITE_API_URL` apunta a una URL que el navegador no alcanza. | Corrígela y reconstruye el frontend. |
| Error de CORS en el navegador | `cors()` o el origen no coinciden. | Verifica la URL del frontend y la configuración de CORS. |
| `variable is not set` al ejecutar Compose | No existe el `.env` en la raíz. | Cópialo desde `.env.example`. |
| Los cambios del código no se ven | La imagen no se reconstruyó. | Agrega `--build`. |
| Datos de la base desaparecen | Se ejecutó `down -v`. | Es lo esperado: ese comando borra el volumen. |

---

## Documentos relacionados

- [Instalación sin Docker](sin-docker.md) · [Variables de entorno](variables-de-entorno.md)
- [Arquitectura — contenedores y despliegue](../referencia-tecnica/arquitectura.md#3-contenedores-y-despliegue)
- [Restricciones](../requisitos/restricciones.md) · [RNF-006 Portabilidad](../requisitos/RNFs/RNF-006_compatibilidad_y_portabilidad.md)
