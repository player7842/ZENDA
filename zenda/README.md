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

Con PostgreSQL levantado, crea la base y ejecuta este script (dos tablas):

```sql
CREATE DATABASE zenda;

\c zenda

CREATE TABLE usuarios (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  ficha            VARCHAR(20),
  tipo_documento   VARCHAR(10),
  numero_documento VARCHAR(30),
  password         VARCHAR(255) NOT NULL,
  rol              VARCHAR(20) NOT NULL DEFAULT 'aprendiz',
  created_at       TIMESTAMP DEFAULT now()
);

CREATE TABLE instructor_fichas (
  instructor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ficha         VARCHAR(20) NOT NULL,
  PRIMARY KEY (instructor_id, ficha)
);
```

> `instructor_fichas` existe porque un instructor puede estar vinculado a
> **varias** fichas. Un estudiante en cambio tiene **una sola** ficha en la
> columna `usuarios.ficha`.

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

### 2.6 Crear el admin inicial

La app no tiene seed automático: registra un usuario normal por la página de
registro y luego cambia su rol a `admin` directo en la BD:

```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'elcorreo@ejemplo.com';
```

Reinicia sesión y ya entras al panel de administración.

---

## 3. Credenciales de prueba (local)

- Admin: `admin@zenda.com` / `Admin123!`
- Usuarios de prueba: `carlos@zenda.com`, `laura@zenda.com`, etc. contraseña `Prueba123!`

> Son datos locales de desarrollo. La base final se poblará despues.

---

## 4. Estructura de la carpeta `zenda` (lo nuevo)

```
zenda/
├── README.md                          # este archivo
├── GUIA_DISTRIBUCION_Y_APIS.md        # (local) documentación interna de las APIs
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
│       │   └── isAdmin.js             # ★ Solo deja pasar a rol='admin'
│       ├── routes/
│       │   ├── auth.js                # POST login / register / etc.
│       │   └── users.js               # ★ CRUD de usuarios (todo protegido)
│       └── controllers/
│           ├── authController.js      # Login y registro
│           └── userController.js      # ★ CRUD + cambio de rol + fichas (con contraseña)
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
        ├── api.js                     # ★ TODAS las llamadas HTTP al backend
        ├── context/
        │   └── ThemeContext.jsx       # tema claro/oscuro
        ├── components/
        │   ├── Auth/
        │   │   ├── Login.jsx          # form login (admin → /admin)
        │   │   ├── Register.jsx
        │   │   ├── ForgotPassword.jsx
        │   │   ├── ResetPassword.jsx
        │   │   ├── ProtectedRoute.jsx # ruta protegida por sesión
        │   │   └── AdminRoute.jsx     # ★ solo admin; no-admin → /dashboard
        │   ├── admin/
        │   │   └── Modals.jsx         # ★ modales: formulario usuario + confirmar con contraseña
        │   └── ThemeToggle.jsx        # botón tema (estático, va en cada header)
        ├── pages/
        │   ├── Admin.jsx              # ★ PANEL ADMIN: header + sidebar izquierdo
        │   ├── Dashboard.jsx          # landing simple para NO admin
        │   └── admin/
        │       ├── Fichas.jsx         # ★ listado fichas → CRUD estudiantes
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

- **Fichas** → lista todas las fichas; al pulsar una, CRUD de sus estudiantes.
- **Instructores** → al pulsar uno, se ven y se editan sus fichas vinculadas
  (agregar/quitar + Guardar, pide contraseña).
- **Usuarios** → mini menú por rol (Estudiantes, Instructores, Coordinadores,
  Administradores) y "Editar usuario" con todos los datos.
- **Roles**: `aprendiz`, `instructor`, `coordinador` y `admin`. Solo `admin`
  entra al panel; `coordinador` es un rol de la BD, sin permisos de admin.
- **Seguridad**: crear, editar, eliminar, cambiar rol o guardar fichas siempre
  pide la contraseña del admin logueado para confirmar.

---

## 6. APIs principales (resumen rápido)

Todo en `/api/users` requiere JWT de admin (`Authorization: Bearer <token>`).

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/auth/login` | Logearse → `{ user, token }` |
| GET | `/api/users` | Listar usuarios (con array `fichas`) |
| POST | `/api/users` | Crear usuario (body con `password` del admin) |
| PUT | `/api/users/:id` | Editar usuario completo |
| PUT | `/api/users/:id/fichas` | Reemplazar fichas vinculadas de un instructor |
| PUT | `/api/users/:id/rol` | Cambiar rol |
| DELETE | `/api/users/:id` | Eliminar usuario (body con `password`) |

Errores típicos: `400` datos/rol/contraseña faltante · `401` token o
contraseña del admin mala · `403` rol no admin · `404` usuario no existe.