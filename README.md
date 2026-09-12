# ZENDA — Código funcional (`zenda/`)

> Esta carpeta contiene todo el código nuevo del proyecto (frontend + backend).
> Las carpetas del repo base (`backend/`, `Database/`, `Frontend/`, etc.)
> son del equipo original y **no se tocan**.

---

## 1. Qué necesitas para arrancarlo en otro computador

| Herramienta | Versión | Por qué |
|---|---|---|
| Node.js | 18+ (con `fetch` global) | El backend y el build del frontend |
| pnpm | cualquiera reciente | Gestor de paquetes (ya hay `pnpm-lock.yaml`) |
| PostgreSQL | 14+ | La base de datos `zenda` |
| Git | — | Para clonar el repo |

## 2. Pasos para ponerlo a correr

### 2.1 Clonar y entrar

```bash
git clone https://github.com/player7842/ZENDA.git
cd ZENDA/zenda
```

### 2.2 Crear la base de datos

Con PostgreSQL levantado, crea la base y ejecuta el script completo
(esquema oficial MR_ZENDA + datos de prueba):

```bash
# desde la raíz del repo
psql -U postgres -h localhost -c "CREATE DATABASE zenda;"
psql -U postgres -h localhost -d zenda -f zenda/Database/zenda_bd.sql
```

> `zenda_bd.sql` crea TODAS las tablas del esquema MR_ZENDA (`usuarios`,
> `programas`, `fichas`, `instructor_ficha`, `grupos`, `integrantes_grupo`,
> `evaluaciones`, `observaciones`, `tareas`, `evidencias`, `eventos`,
> `anuncios`, `proyectos`, etc.), agrega la extensión `tipo_documento` y
> `numero_documento` a `usuarios` (única desviación oficial) y siembra datos
> de prueba: 3 programas, 4 fichas, admin, coordinadores, instructores y 12
> aprendices ya vinculados a sus fichas por los grupos.

### 2.3 Configurar el backend

```bash
cd zenda/backend          # desde la raíz del repo
cp .env.example .env
pnpm install
```

Edita `.env` con tus credenciales reales:

```
PORT=4000
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zenda
JWT_SECRET=una_frase_secreta_bien_larga
```

> Los `.env` NO se suben a GitHub (están en `.gitignore`).

### 2.4 Configurar el frontend

```bash
cd zenda/frontend         # desde la raíz del repo
cp .env.example .env
pnpm install
```

### 2.5 Correr (dos terminales)

```bash
# Terminal 1 — backend (puerto 4000)
cd zenda/backend
node server.js
# o con recarga en caliente: npx nodemon server.js

# Terminal 2 — frontend (dev server Vite)
cd zenda/frontend
pnpm dev
```

Abre `http://localhost:5173` en el navegador.

### 2.6 El admin inicial

El script `zenda_bd.sql` ya siembra un admin. Si necesitas convertir un
usuario normal en admin directo en la BD:

```sql
UPDATE usuarios SET rol = 'ADMINISTRADOR' WHERE correo = 'elcorreo@ejemplo.com';
```

> Los roles son un ENUM en MAYÚSCULAS: `APRENDIZ`, `INSTRUCTOR`,
> `COORDINADOR`, `ADMINISTRADOR`.

---

## 3. Credenciales de prueba (local)

- Admin: `admin@zenda.com` / `Admin123!`
- Coordinadores: `maria@zenda.com`, `julian@zenda.com`
- Instructores: `felipe@zenda.com`, `rosa@zenda.com`, `pedro@zenda.com`
- Aprendices (12): `ana@zenda.com`, `luis@zenda.com`, etc.
- Contraseña de los no-admin: `Prueba123!`

> Son datos locales de desarrollo sembrados por `zenda_bd.sql`.
> La base final se poblará despues.

---

## 4. Estructura de la carpeta `zenda` (lo nuevo)

```
zenda/
├── README.md                          # este archivo
├── GUIA_DISTRIBUCION_Y_APIS.md        # (local) documentación interna de las APIs
│
├── Database/
│   └── zenda_bd.sql                   # ★ esquema MR_ZENDA completo + seed de prueba
│
├── backend/                           # Express + PostgreSQL
│   ├── .env.example                   # plantilla del .env (jamás se sube el .env)
│   ├── package.json
│   ├── server.js                      # ★ Express, CORS, arranca el puerto 4000
│   └── src/
│       ├── config/
│       │   └── db.js                  # Pool de PostgreSQL (usa las variables del .env)
│       ├── middleware/
│       │   ├── auth.js                # Valida el JWT → deja req.user
│       │   └── isAdmin.js             # ★ Solo deja pasar a rol='ADMINISTRADOR'
│       ├── routes/
│       │   ├── auth.js                # POST login / register
│       │   ├── users.js               # ★ CRUD de usuarios (todo protegido)
│       │   └── fichas.js              # ★ fichas, programas y vínculo de aprendices
│       ├── controllers/
│       │   ├── authController.js      # Login y registro (correo + estado)
│       │   ├── userController.js      # ★ CRUD + rol + fichas de instructor (con contraseña)
│       │   └── fichasController.js    # ★ CRUD fichas/programas + aprender por grupos
│       └── utils/
│           └── confirmarAdmin.js      # valida contraseña del admin en acciones delicadas
│
└── frontend/                          # React + Vite + pnpm
    ├── .env.example                   # plantilla (VITE_API_URL)
    ├── index.html
    ├── public/
    │   ├── favicon.svg
    │   ├── icons.svg
    │   └── logos/                     # logos claro/oscuro usados en los headers
    └── src/
        ├── main.jsx                   # punto de entrada (providers)
        ├── App.jsx                    # ★ rutas: / → /admin, /dashboard, /admin, /login...
        ├── api.js                     # ★ TODAS las llamadas HTTP al backend (incluye fichas)
        ├── context/
        │   └── ThemeContext.jsx       # tema claro/oscuro
        ├── components/
        │   ├── Auth/
        │   │   ├── Login.jsx          # form login (admin → /admin)
        │   │   ├── Register.jsx
        │   │   ├── ForgotPassword.jsx
        │   │   ├── ResetPassword.jsx
        │   │   ├── ProtectedRoute.jsx # ruta protegida por sesión
        │   │   └── AdminRoute.jsx     # ★ solo ADMINISTRADOR; no-admin → /dashboard
        │   ├── admin/
        │   │   └── Modals.jsx         # ★ modales: usuario, ficha y confirmar con contraseña
        │   └── ThemeToggle.jsx        # botón tema (estático, va en cada header)
        ├── pages/
        │   ├── Admin.jsx              # ★ PANEL ADMIN: carga usuarios + fichas + programas
        │   ├── Dashboard.jsx          # landing simple para NO admin
        │   └── admin/
        │       ├── Fichas.jsx         # ★ listado fichas (con programas) → CRUD estudiantes
        │       ├── Instructores.jsx   # ★ listado instructores → fichas vinculadas (editables)
        │       └── Usuarios.jsx       # ★ mini menú por rol + editar usuario completo
        └── styles/                    # CSS (Admin.css, Dashboard.css, Login.css, etc.)
```

---

## 5. El panel admin en dos pantallas

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] ZENDA                             [🌙 toggle tema]  │ ← header
├──────────────┬──────────────────────────────────────────────┤
│  Fichas      │                                               │
│  Instructores│      (contenido del panel activo)             │
│  Usuarios    │                                               │
│              │                                               │
│──────────────│                                               │
│  Admin       │                                               │
│  [Cerrar sesión]                                            │ ← sidebar izquierdo
└──────────────┴──────────────────────────────────────────────┘
```

- **Fichas** → lista todas las fichas (programa + cuántos aprendices); al
  pulsar una, CRUD de sus estudiantes. También crea/edita/elimina fichas.
- **Instructores** → al pulsar uno, se ven y se editan sus fichas vinculadas
  (agregar/quitar + Guardar, pide contraseña).
- **Usuarios** → mini menú por rol (Estudiantes, Instructores, Coordinadores,
  Administradores) y "Editar usuario" con todos los datos.
- **Roles** (ENUM mayúsculas): `APRENDIZ`, `INSTRUCTOR`, `COORDINADOR` y
  `ADMINISTRADOR`. Solo `ADMINISTRADOR` entra al panel; `COORDINADOR` es un
  rol de la BD, sin permisos de admin.
- **Seguridad**: crear, editar, eliminar, cambiar rol o guardar fichas siempre
  pide la contraseña del admin logueado para confirmar.

---

## 6. APIs principales (resumen rápido)

Todo en `/api/users` y `/api/fichas` requiere JWT de admin
(`Authorization: Bearer <token>`).

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/auth/login` | Logearse → `{ user, token }` |
| GET | `/api/users` | Listar usuarios (instructores traen `fichas`, aprendices `ficha`) |
| POST | `/api/users` | Crear usuario (body con `password` del admin) |
| PUT | `/api/users/:id` | Editar usuario completo |
| PUT | `/api/users/:id/fichas` | Reemplazar fichas vinculadas de un instructor |
| PUT | `/api/users/:id/rol` | Cambiar rol |
| DELETE | `/api/users/:id` | Eliminar usuario (body con `password`) |
| GET | `/api/fichas` | Listar fichas (programa + conteos de aprendices/instructores) |
| GET | `/api/fichas/programas` | Programas disponibles para el formulario |
| POST | `/api/fichas` | Crear ficha (body con `password` del admin) |
| PUT | `/api/fichas/:id` | Editar ficha |
| DELETE | `/api/fichas/:id` | Eliminar ficha (limpia dependientes) |
| PUT | `/api/fichas/:id/aprendiz` | Vincular aprendiz a la ficha (por grupos) |
| DELETE | `/api/fichas/:id/aprendiz/:usuario_id` | Desvincular aprendiz |

Errores típicos: `400` datos/rol/contraseña faltante · `401` token o
contraseña del admin mala · `403` rol no admin · `404` usuario o ficha no existe.