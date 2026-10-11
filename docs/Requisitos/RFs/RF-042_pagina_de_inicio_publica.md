# RF-042 — Página de inicio pública

<!--
  ¿Qué? Requisito funcional que define: página de inicio pública.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es la primera impresión del sistema y la puerta a los formularios de acceso.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-042 |
| **Nombre** | Página de inicio pública |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Historia asociada** | HU-042 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe ofrecer una página de inicio pública con la presentación de ZENDA, una navegación clara, acceso al inicio de sesión y al registro, y un pie de página con el año vigente y los enlaces legales.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El visitante abre la página principal (`Home.jsx`).
2. El frontend muestra las secciones y los accesos.
3. El pie de página calcula el año con la fecha actual.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Página principal | — | Página pública |

---

## Endpoints asociados

Este requisito se resuelve en la interfaz y no expone endpoints propios.

---

## Reglas de negocio

- No aplica.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Aclarar el contenido de "Funcionalidad" y "Cómo funciona" o retirarlos de la barra de navegación.
- Año vigente automático en el pie de página.
- Animaciones consistentes entre tarjetas.
