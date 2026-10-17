# HU-042 — Página de inicio pública

<!--
  ¿Qué? Historia de usuario que describe: página de inicio pública.
  ¿Para qué? Formalizar la necesidad del visitante: entender para qué sirve el sistema antes de crear una cuenta.
  ¿Impacto? Es la primera impresión del sistema y la puerta a los formularios de acceso.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-042 |
| **Título** | Página de inicio pública |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Rol** | Visitante |
| **RF asociado** | RF-042 |
| **Reglas de negocio** | — |

---

## Historia

**Como** visitante,
**quiero** conocer qué es ZENDA y poder iniciar sesión o registrarme desde la página principal,
**para** entender para qué sirve el sistema antes de crear una cuenta.

---

## Criterios de aceptación

### CA-042.1 — Presentación

- **Dado que** entro a la página principal,
- **cuando** la reviso,
- **entonces** entiendo qué es ZENDA y cómo me ayuda.

### CA-042.2 — Navegación clara

- **Dado que** uso la barra de navegación,
- **cuando** reviso sus apartados,
- **entonces** "Funcionalidad" y "Cómo funciona" tienen contenido claro, o no aparecen.

### CA-042.3 — Acceso

- **Dado que** quiero entrar o registrarme,
- **cuando** pulso "Iniciar sesión" o "Registrarse",
- **entonces** accedo al formulario correspondiente.

### CA-042.4 — Pie de página

- **Dado que** bajo hasta el final de la página,
- **cuando** lo reviso,
- **entonces** veo el año vigente automático y los enlaces legales.

---

## Cambios frente a la versión v11

- Aclarar el contenido de "Funcionalidad" y "Cómo funciona" o retirarlos de la barra de navegación.
- Año vigente automático en el pie de página.
- Animaciones consistentes entre tarjetas.
