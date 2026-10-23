# Despliegue en Render + Vercel + Neon

<!--
  ¿Qué? Guía paso a paso para publicar ZENDA con el backend en Render, el
  frontend en Vercel y PostgreSQL en Neon.
  ¿Para qué? Tener una URL pública antes de la semana 3 y dejar por escrito
  quién configura qué, para que no dependa de una sola persona.
  ¿Impacto? Si un origen, una variable o el SSL quedan mal, el login falla o
  el enlace de recuperación apunta a localhost.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Arquitectura** | Frontend estático (Vercel) → API Express (Render) → PostgreSQL (Neon) |
| **Costo** | Planes gratuitos de los tres servicios |
| **Archivos de configuración** | `render.yaml`, `frontend/vercel.json`, `.env.example` |
| **Responsable de las cuentas** | _(completar con el nombre del integrante)_ |
| **Fecha** | Octubre 2026 |

> **Advertencia:** los planes gratuitos suspenden el servicio tras un periodo
> de inactividad. La primera petición después de la pausa puede tardar entre
> 30 y 60 segundos. Avísalo en la demo y en el manual de usuario.

---

## 1. Orden de creación

```
1. Neon      → base de datos y cadena de conexión
2. Render    → API con esa cadena
3. Vercel    → frontend apuntando a la URL de Render
4. Render    → actualizar FRONTEND_URL con la URL de Vercel
```

El último paso es obligatorio: CORS y el enlace de recuperación usan
`FRONTEND_URL`, y Vercel solo entrega su dominio definitivo al terminar el
primer despliegue.

---

## 2. Base de datos en Neon

1. Crear una cuenta en <https://neon.tech> y un proyecto llamado `zenda`.
2. Elegir la región más cercana (por ejemplo, `us-east-1`).
3. Copiar la **connection string** que ofrece el panel. Tiene esta forma:

   ```
   postgresql://usuario:clave@ep-xxx.us-east-1.aws.neon.tech/zenda?sslmode=require
   ```

4. Abrir el **SQL Editor** de Neon y ejecutar el contenido de
   `Database/zenda_bd.sql`. Ese script crea el esquema y los datos de prueba.
   - Es destructivo (`DROP TABLE ... CASCADE`): úsalo solo en una base nueva.
   - Para una base que ya tiene datos, aplicar solo las migraciones de
     `Database/migrations/` en orden.
5. Verificar que existan datos:

   ```sql
   SELECT count(*) FROM usuarios;
   SELECT count(*) FROM proyectos;
   ```

> Neon exige SSL. El backend lo activa automáticamente cuando recibe
> `DATABASE_URL` (`backend/src/config/db.js`). No hace falta `DB_SSL=true`,
> aunque dejarlo también es correcto.

---

## 3. Backend en Render

### 3.1 Con el blueprint (`render.yaml`)

1. En Render: **New → Blueprint** y conectar el repositorio de GitHub.
2. Render detecta `render.yaml` y propone el servicio `zenda-api`.
3. Completar las variables marcadas con `sync: false`:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | Cadena de Neon del paso 2 |
   | `FRONTEND_URL` | Se completa en el paso 4 |
   | `EMAIL_USER` | Cuenta de Gmail institucional |
   | `EMAIL_PASS` | Contraseña de aplicación de Gmail |

   `JWT_SECRET` lo genera Render automáticamente. `PORT` lo inyecta Render;
   el valor 4000 del blueprint es solo una referencia y no estorba.

4. Esperar el primer despliegue y comprobar:

   ```bash
   curl https://<servicio>.onrender.com/api/health
   # {"status":"OK","message":"Servicio disponible"}
   ```

### 3.2 Sin blueprint

Crear **New → Web Service**, seleccionar el repositorio y configurar:

| Campo | Valor |
|---|---|
| Runtime | Docker |
| Dockerfile path | `backend/Dockerfile` |
| Docker context | `backend` |
| Health check path | `/api/health` |

Agregar a mano las variables de la tabla 3.1.

### 3.3 Comprobar el login del seed

```bash
curl -X POST https://<servicio>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@zenda.com","password":"Admin123!"}'
```

Debe responder `200` con un `token`. Si responde `500`, revisar los logs:
casi siempre es `DATABASE_URL` mal copiada o el esquema sin cargar.

---

## 4. Frontend en Vercel

1. En Vercel: **Add New → Project** e importar el repositorio.
2. Configurar el proyecto:

   | Campo | Valor |
   |---|---|
   | Framework preset | Vite |
   | Root Directory | `frontend` |
   | Build Command | `pnpm build` |
   | Output Directory | `dist` |
   | Install Command | `pnpm install --frozen-lockfile` |

3. En **Environment Variables** agregar:

   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | `https://<servicio>.onrender.com` (sin `/api`) |

   `frontend/vercel.json` ya define el build, el fallback de la SPA y las
   cabeceras de caché y seguridad.

4. Desplegar. Vercel entrega un dominio parecido a
   `https://zenda-equipo.vercel.app`.
5. Volver a Render y poner ese dominio en `FRONTEND_URL`
   (sin barra final). Si también pruebas desde local, sepáralos con coma:

   ```
   https://zenda-equipo.vercel.app,http://localhost:8080
   ```

6. Redesplegar el backend para que tome la variable.

---

## 5. Verificación de extremo a extremo

| # | Prueba | Resultado esperado |
|:--:|---|---|
| 1 | Abrir la URL de Vercel | Carga el login |
| 2 | Entrar con `admin@zenda.com` / `Admin123!` | Llega al panel de administración |
| 3 | Entrar con `carlos@zenda.com` / `Prueba123!` | Llega al panel de aprendiz con su proyecto |
| 4 | Recargar una ruta interna (por ejemplo `/aprendiz/fases`) | No devuelve 404 (fallback de la SPA) |
| 5 | Pedir recuperación con un correo inexistente | Responde 200 con el mismo mensaje que con uno real |
| 6 | Revisar la consola del navegador | Sin errores de CORS |
| 7 | `curl .../api/health` desde otra red | Responde `OK` |

---

## 6. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| El navegador bloquea las peticiones con error de CORS | `FRONTEND_URL` no coincide exactamente con el dominio de Vercel | Copiar el dominio sin barra final y redesplegar Render |
| `password authentication failed` | Contraseña mal copiada de Neon | Volver a copiar la cadena completa |
| `relation "usuarios" does not exist` | No se ejecutó `zenda_bd.sql` | Ejecutarlo en el SQL Editor de Neon |
| El frontend llama a `localhost:4000` | `VITE_API_URL` no estaba definida al compilar | Definirla en Vercel y redesplegar |
| El enlace del correo abre localhost | `FRONTEND_URL` sin actualizar | Actualizarla y redesplegar el backend |
| El backend tarda 30–60 s en responder | Suspensión del plan gratuito de Render | Esperar la primera petición o cambiar de plan |
| El despliegue de Render falla en `pnpm install` | `pnpm-lock.yaml` desactualizado | Ejecutar `pnpm install` en `backend/` y commitear el lockfile |

---

## 7. Límites de los planes gratuitos

| Servicio | Límite | Efecto en ZENDA |
|---|---|---|
| Render Free | Suspensión por inactividad | Primera petición lenta |
| Render Free | 512 MB de RAM | Suficiente para la API, no para procesar archivos grandes |
| Neon Free | 0.5 GB de almacenamiento | Alcanza para el proyecto; las evidencias son enlaces, no archivos |
| Vercel Hobby | Uso no comercial | Aceptable para el proyecto formativo |

Las evidencias como archivo (S3 o volumen) quedan para la semana 3 según el
roadmap; hoy se guardan como enlace.

---

## Documentos relacionados

- [Variables de entorno](variables-de-entorno.md)
- [Instalación con Docker](con-docker.md)
- [Arquitectura](../Referencia-Tecnica/arquitectura.md)
