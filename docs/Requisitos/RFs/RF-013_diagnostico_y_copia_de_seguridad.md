# RF-013 — Diagnóstico y copia de seguridad

<!--
  ¿Qué? Requisito funcional que define: diagnóstico y copia de seguridad.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Sin copias de seguridad, un fallo del servidor puede significar la pérdida de todas las evidencias registradas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-013 |
| **Nombre** | Diagnóstico y copia de seguridad |
| **Módulo** | Administración |
| **Prioridad** | Baja |
| **Estado** | Planificado |
| **Historia asociada** | HU-013 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe ofrecer al administrador un diagnóstico (servidor, conexión a la base de datos, versión y espacio) y la descarga de una copia de seguridad. La interfaz y las funciones `getSystemDiagnostics` y `downloadBackup` existen; faltan los endpoints.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| Contraseña del administrador | Texto | Sí (copia) | Debe coincidir con la del administrador |

---

## Proceso

1. El administrador abre la sección Sistema.
2. El backend consulta la conexión a la base de datos y reúne los datos de estado.
3. Para la copia, genera un volcado de la base de datos y lo entrega como descarga.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Diagnóstico | 200 | Estado de los componentes |
| Copia generada | 200 | Archivo de volcado |
| Contraseña incorrecta | 403 | Mensaje de confirmación fallida |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/system/diagnostics` | Sí (ADMINISTRADOR) | Estado del sistema (propuesto) |
| GET | `/api/system/backup` | Sí (ADMINISTRADOR) | Descarga la copia (propuesto) |

---

## Reglas de negocio

- **RN-028** — Confirmación con contraseña.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Ambos endpoints están pendientes en el backend.
