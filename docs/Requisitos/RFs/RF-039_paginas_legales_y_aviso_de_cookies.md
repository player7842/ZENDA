# RF-039 — Páginas legales y aviso de cookies

<!--
  ¿Qué? Requisito funcional que define: páginas legales y aviso de cookies.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es una obligación legal (Ley 1581 de 2012) y condición para registrar usuarios.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-039 |
| **Nombre** | Páginas legales y aviso de cookies |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-039 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe ofrecer cuatro páginas legales públicas (términos de uso, política de privacidad, política de cookies y protección de datos), enlazadas desde el pie de página y desde las casillas de aceptación del registro, y mantener el aviso de cookies.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El frontend muestra los enlaces legales en el pie de página y en el registro.
2. Cada enlace abre una página pública con el texto correspondiente.
3. El aviso de cookies recuerda la decisión del usuario en el navegador.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Página legal | — | Texto legal completo |

---

## Endpoints asociados

Este requisito se resuelve en la interfaz y no expone endpoints propios.

---

## Reglas de negocio

- **RN-004** — Aceptación legal obligatoria.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy existe el aviso de cookies (`CookieBanner.jsx`), pero no las cuatro páginas legales ni sus enlaces.
- El pie de página debe mostrar el año vigente de forma automática (hoy está fijo).
