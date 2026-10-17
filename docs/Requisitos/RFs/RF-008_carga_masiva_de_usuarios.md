# RF-008 — Carga masiva de usuarios

<!--
  ¿Qué? Requisito funcional que define: carga masiva de usuarios.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Ahorra horas de digitación al inicio de cada ficha.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-008 |
| **Nombre** | Carga masiva de usuarios |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Historia asociada** | HU-008 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir importar usuarios desde un archivo CSV, validando cada fila con las mismas reglas de la creación individual y devolviendo un resumen de creados y rechazados. La interfaz ya existe; falta el endpoint del backend.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| Archivo CSV | Archivo | Sí | Columnas: nombre, apellido, correo, rol, documento; tamaño máximo por definir |

---

## Proceso

1. El administrador sube el archivo y ve la vista previa.
2. El backend valida el formato y cada fila.
3. Crea en una transacción los usuarios válidos.
4. Devuelve el número de creados y la lista de filas rechazadas con su motivo.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Importación completada | 200 | Cantidad creada y errores por fila |
| Archivo inválido | 400 | Mensaje del error |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/users/bulk` | Sí (ADMINISTRADOR) | Importa usuarios (propuesto) |

---

## Reglas de negocio

- **RN-001** — Registro limitado a aprendices con correo institucional.
- **RN-002** — Contraseña protegida con hash.
- **RN-028** — Confirmación con contraseña.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- El módulo `importUsersBulk` del frontend ya existe; el endpoint del backend está pendiente.
