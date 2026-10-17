# RF-041 — Mensajes guiados

<!--
  ¿Qué? Requisito funcional que define: mensajes guiados.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Aporta dinamismo y acompañamiento sin llenar el sistema de notificaciones.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-041 |
| **Nombre** | Mensajes guiados |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Baja |
| **Estado** | Planificado |
| **Historia asociada** | HU-041 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe mostrar mensajes guiados contextuales dentro de la interfaz (estados vacíos, pasos pendientes, logros) en lugar de recordatorios por correo o notificaciones masivas.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El frontend evalúa el estado del usuario (sin proyecto, fase incompleta, tarea pendiente).
2. Muestra el mensaje que corresponde a ese estado.
3. El usuario puede descartarlo y no se repite durante la sesión.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Mensaje contextual | — | Mensaje en pantalla |

---

## Endpoints asociados

Este requisito se resuelve en la interfaz y no expone endpoints propios.

---

## Reglas de negocio

- No aplica.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Sustituye a los recordatorios, que quedaron fuera del alcance ([RO-004](../restricciones.md#ro-004--alcance-excluido)).
