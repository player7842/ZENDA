# Seguimiento de Proyectos de Formación SENA

Sistema web para el seguimiento y gestión de proyectos de formación del SENA, desarrollado como proyecto integrador del programa ADSO (Análisis y Desarrollo de Software).

---

## Descripción general

Esta aplicación permite a instructores y administradores del SENA registrar, monitorear y evaluar el avance de los proyectos de formación de los aprendices. Centraliza la información de proyectos, aprendices, entregas y retroalimentaciones en una sola plataforma web de uso local.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | html, css |
| Backend | javaScript |
| Base de datos | PostgreSQL |
| Control de versiones | Git + GitHub |
| Despliegue | Local (localhost) |

---

## Requisitos previos

Antes de ejecutar el proyecto en python, asegurate de tener instalado lo siguiente:

- **python** v3.1 o superior 
- **Visual studio code** Ejecutador de codigo

---

## Cómo ejecutar el proyecto de python

### 1. Descargar los archivos main.py del repositorio
### 2. abrir desde visual studio code con un equipo que cuente con python instalado y en el visual studio code la extencion de python 
### 3. Ejecutar el codigo y poner en funcionamiento el sistema 


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
│   │   └── index.html
│   └── package.json
│
├── backend/            # Archivos python           
│   ├── src/
|       └── app.js / main.py 
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

El sistema contempla tres roles principales:

- **Instructor**: puede registrar proyectos, asignar aprendices, registrar avances y dar retroalimentación.
- **Administrador**: gestiona usuarios, fichas de formación y tiene acceso completo al sistema.
- **Aprendiz**: puede subir proyectos, puede ver calendario de actividades y ser evaluado por el instructor.

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
| Hernán | Modelo gráfico e interfaz (Figma, canva) |
| Nicolás | Prototipo / avance de la página web |
| Omar | Base de datos |

---

## Programa

**ADSO** – Análisis y Desarrollo de Software  
**SENA** – Servicio Nacional de Aprendizaje  
**Año:** 2026
