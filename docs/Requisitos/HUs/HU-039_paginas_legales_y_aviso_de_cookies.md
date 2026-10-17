# HU-039 — Páginas legales y aviso de cookies

<!--
  ¿Qué? Historia de usuario que describe: páginas legales y aviso de cookies.
  ¿Para qué? Formalizar la necesidad del visitante: saber cómo se usan mis datos y aceptar de forma informada.
  ¿Impacto? Es una obligación legal (Ley 1581 de 2012) y condición para registrar usuarios.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-039 |
| **Título** | Páginas legales y aviso de cookies |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Visitante |
| **RF asociado** | RF-039 |
| **Reglas de negocio** | RN-004 |

---

## Historia

**Como** visitante,
**quiero** consultar los términos de uso, la política de privacidad, la de cookies y la protección de datos,
**para** saber cómo se usan mis datos y aceptar de forma informada.

---

## Criterios de aceptación

### CA-039.1 — Enlaces en el pie de página

- **Dado que** estoy en cualquier pantalla pública,
- **cuando** miro el pie de página,
- **entonces** encuentro enlaces a las cuatro páginas legales.

### CA-039.2 — Página legal

- **Dado que** pulso uno de los enlaces,
- **cuando** se abre la página,
- **entonces** veo el texto legal completo en una página propia.

### CA-039.3 — Enlaces desde el registro

- **Dado que** estoy en el registro,
- **cuando** miro las casillas de aceptación,
- **entonces** cada casilla enlaza a su página legal.

### CA-039.4 — Aviso de cookies

- **Dado que** entro por primera vez,
- **cuando** veo el aviso de cookies,
- **entonces** puedo aceptarlo y no vuelve a mostrarse.

---

## Cambios frente a la versión v11

- Hoy existe el aviso de cookies (`CookieBanner.jsx`), pero no las cuatro páginas legales ni sus enlaces.
- El pie de página debe mostrar el año vigente de forma automática (hoy está fijo).
