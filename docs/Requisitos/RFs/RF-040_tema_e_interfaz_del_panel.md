# RF-040 — Tema e interfaz del panel

<!--
  ¿Qué? Requisito funcional que define: tema e interfaz del panel.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Mejora la comodidad y la accesibilidad de uso diario.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-040 |
| **Nombre** | Tema e interfaz del panel |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Historia asociada** | HU-040 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe ofrecer tema claro y oscuro, una barra lateral que pueda colapsarse a solo iconos y un menú de tres puntos para las acciones secundarias de listas y tablas, con contraste y animaciones consistentes.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El `ThemeContext` guarda y aplica el tema elegido.
2. La barra lateral alterna entre expandida y colapsada.
3. Las filas de listas y tablas muestran sus acciones secundarias en un menú desplegable.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Interfaz actualizada | — | Cambio inmediato en pantalla |

---

## Endpoints asociados

Este requisito se resuelve en la interfaz y no expone endpoints propios.

---

## Reglas de negocio

- No aplica.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- El tema claro y oscuro ya existe.
- La barra lateral colapsable y el menú de tres puntos son cambios pedidos por el instructor ([RD-003](../restricciones.md#rd-003--menú-de-tres-puntos-para-acciones-secundarias), [RD-004](../restricciones.md#rd-004--barra-lateral-colapsable)).
- Las animaciones de componentes equivalentes deben ser consistentes ([RD-002](../restricciones.md#rd-002--animaciones-consistentes)).
