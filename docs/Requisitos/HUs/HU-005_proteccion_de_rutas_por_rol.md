# HU-005 — Protección de rutas por rol

<!--
  ¿Qué? Historia de usuario que describe: protección de rutas por rol.
  ¿Para qué? Formalizar la necesidad del usuario autenticado: que mi información y la de los demás esté protegida.
  ¿Impacto? Es el control de acceso del sistema; sin él cualquier usuario podría ejecutar acciones de otro rol.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-005 |
| **Título** | Protección de rutas por rol |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Usuario autenticado |
| **RF asociado** | RF-005 |
| **Reglas de negocio** | RN-003, RN-005 |

---

## Historia

**Como** usuario autenticado,
**quiero** ver y usar solo las pantallas y funciones que corresponden a mi rol,
**para** que mi información y la de los demás esté protegida.

---

## Criterios de aceptación

### CA-005.1 — Ruta sin sesión

- **Dado que** no he iniciado sesión,
- **cuando** intento abrir una ruta privada,
- **entonces** soy redirigido al inicio de sesión.

### CA-005.2 — Ruta de otro rol

- **Dado que** tengo sesión como aprendiz,
- **cuando** intento abrir `/admin`,
- **entonces** no accedo y soy dirigido a mi propio panel.

### CA-005.3 — Petición no autorizada

- **Dado que** hago una petición a la API sin permiso para ella,
- **cuando** el servidor la recibe,
- **entonces** responde que no tengo acceso, aunque la interfaz no muestre el botón.
