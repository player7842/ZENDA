# RF-032 — Paneles de resumen por rol

<!--
  ¿Qué? Requisito funcional que define: paneles de resumen por rol.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es la primera pantalla tras iniciar sesión; orienta qué atender primero.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-032 |
| **Nombre** | Paneles de resumen por rol |
| **Módulo** | Seguimiento |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Historia asociada** | HU-032 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe ofrecer a cada rol un panel con métricas y gráficas (Recharts) calculadas sobre los datos que ese rol puede ver.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El panel solicita el resumen a la API con el token del usuario.
2. El backend calcula las métricas según el rol.
3. El frontend las dibuja en tarjetas y gráficas.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Resumen del rol | 200 | Métricas y series para las gráficas |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/aprendiz/proyectos/resumen` | Sí (APRENDIZ) | Resumen del aprendiz |
| GET | `/api/instructor/resumen` | Sí (INSTRUCTOR) | Resumen del instructor |
| GET | `/api/coordinador/dashboard` | Sí (COORDINADOR) | Resumen del coordinador |
| GET | `/api/users`, `/api/fichas` | Sí (ADMINISTRADOR) | Datos para el resumen del administrador |

---

## Reglas de negocio

- **RN-025** — Alcance del coordinador.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Barra lateral colapsable que muestre solo iconos (ver [RD-004](../restricciones.md#rd-004--barra-lateral-colapsable)).
- Todas las gráficas deben cumplir el contraste mínimo ([RD-001](../restricciones.md#rd-001--contraste-mínimo-accesible)).
