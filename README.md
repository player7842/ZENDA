# Seguimiento de Proyectos de Formación SENA

Sistema web para el seguimiento y gestión de proyectos de formación del SENA, desarrollado como proyecto integrador del programa ADSO (Análisis y Desarrollo de Software).

---

## Descripción general

Esta aplicación permite a instructores y administradores del SENA registrar, monitorear y evaluar el avance de los proyectos de formación de los aprendices. Centraliza la información de proyectos, aprendices, entregas y retroalimentaciones en una sola plataforma web de uso local.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React.js |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Control de versiones | Git + GitHub |
| Despliegue | Local (localhost) |

---

## Requisitos previos

Antes de ejecutar el proyecto, asegurate de tener instalado lo siguiente:

- **Node.js** v18 o superior → https://nodejs.org
- **npm** v9 o superior (viene incluido con Node.js)
- **PostgreSQL** v14 o superior → https://www.postgresql.org/download
- **Git** → https://git-scm.com

---

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/<usuario>/seguimiento-proyectos-sena.git
cd seguimiento-proyectos-sena
```

### 2. Configurar la base de datos

1. Abre pgAdmin o la terminal de PostgreSQL.
2. Crea una base de datos nueva:

```sql
CREATE DATABASE sena_proyectos;
```

3. Ejecuta el script de creación de tablas ubicado en `/database/script_bd.sql`:

```bash
psql -U postgres -d sena_proyectos -f database/script_bd.sql
```

### 3. Configurar las variables de entorno

Dentro de la carpeta `/backend`, crea un archivo `.env` con el siguiente contenido (ajusta los valores según tu configuración local):

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=sena_proyectos
```

### 4. Instalar dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 5. Iniciar el proyecto

**Backend (en una terminal):**
```bash
cd backend
npm run dev
```

**Frontend (en otra terminal):**
```bash
cd frontend
npm start
```

La aplicación estará disponible en: **http://localhost:3000**  
La API estará corriendo en: **http://localhost:3001**

---

## Cómo visualizar los prototipos HTML

Los prototipos de interfaz están en la carpeta `/prototipos`. Son archivos `.html` estáticos, no requieren servidor.

Para abrirlos:

1. Navega a la carpeta `/prototipos` del repositorio.
2. Abre cualquiera de los archivos directamente en el navegador:
   - `login.html` → pantalla de inicio de sesión
   - `dashboard.html` → panel principal del instructor/administrador
   - `registro_proyecto.html` → formulario de registro de proyecto

También puedes usar la extensión **Live Server** de VS Code para visualizarlos con recarga automática.

---

## Estructura del repositorio

```
seguimiento-proyectos-sena/
│
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Vistas principales
│   │   └── App.js
│   └── package.json
│
├── backend/                # API REST con Express
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── controllers/    # Lógica de negocio
│   │   └── db.js           # Conexión a PostgreSQL
│   └── package.json
│
├── database/
│   ├── script_bd.sql       # Script de creación de tablas
│   ├── MER.png             # Modelo Entidad-Relación
│   └── diccionario_datos.md
│
├── documentacion/
│   ├── SRS.md              # Especificación de Requisitos
│   ├── historias_usuario/  # Historias de usuario por rol
│   ├── casos_de_uso/       # Diagramas y descripción de casos de uso
│   ├── diagrama_clases.png # Diagrama de clases del sistema
│   └── MR.png              # Modelo Relacional normalizado (3FN)
│
├── prototipos/             # Prototipos HTML/CSS estáticos
│   ├── login.html
│   ├── dashboard.html
│   └── registro_proyecto.html
│
└── README.md
```

---

## Roles del sistema

El sistema contempla dos roles principales:

- **Instructor**: puede registrar proyectos, asignar aprendices, registrar avances y dar retroalimentación.
- **Administrador**: gestiona usuarios, fichas de formación y tiene acceso completo al sistema.

---

## Documentación del proyecto

Toda la documentación técnica y de análisis está en la carpeta `/documentacion`:

- Especificación de Requisitos del Software (SRS)
- Historias de usuario (10 por integrante)
- Casos de uso completos y corregidos
- Diagrama de clases (Lucidchart)
- Modelo Entidad-Relación (MER)
- Modelo Relacional normalizado hasta 3FN (MR)
- Diccionario de datos

---

## Equipo de desarrollo

| Integrante | Rol / Responsabilidad |
|-----------|----------------------|
| Leyner | Repositorio GitHub y documentación |
| Hernán | Modelo gráfico e interfaz (Figma) |
| Nicolás | Prototipo / avance de la página web |
| Omar | Base de datos |

---

## Programa

**ADSO** – Análisis y Desarrollo de Software  
**SENA** – Servicio Nacional de Aprendizaje  
**Año:** 2026
