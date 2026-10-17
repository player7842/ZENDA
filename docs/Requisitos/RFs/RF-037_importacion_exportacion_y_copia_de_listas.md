# RF-037 — Importación, exportación y copia de listas

<!--
  ¿Qué? Requisito funcional que define: importación, exportación y copia de listas.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Ahorra tiempo a los instructores con varias fichas que usan la misma metodología.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-037 |
| **Nombre** | Importación, exportación y copia de listas |
| **Módulo** | Lista de chequeo |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Historia asociada** | HU-037 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir importar una lista desde un Excel con un asistente de correspondencia de columnas (el instructor indica cuál columna es la fase, el nombre y la descripción), exportarla a Excel y copiarla entre fichas del mismo instructor.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| Archivo Excel | Archivo `.xlsx` | Sí (importar) | Tamaño máximo por definir |
| Correspondencia de columnas | Selección | Sí (importar) | Columnas de fase, nombre y descripción |
| `ficha_destino_id` | Número | Sí (copiar) | Ficha a cargo del instructor |

---

## Proceso

1. El instructor sube el Excel y el sistema lee su primera hoja.
2. Muestra una vista previa y pide la correspondencia de columnas.
3. El backend valida las filas y crea los ítems; guarda el archivo original.
4. Para exportar, genera un Excel con los ítems; para copiar, duplica la lista en la ficha destino.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Importación, exportación o copia exitosa | 200 / 201 | Lista resultante o archivo |
| Archivo o columnas inválidos | 400 | Mensaje del error con las filas rechazadas |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/instructor/lista-chequeo/importar` | Sí (INSTRUCTOR) | Importa desde Excel (propuesto) |
| GET | `/api/instructor/lista-chequeo/:listaId/exportar` | Sí (INSTRUCTOR) | Exporta a Excel (propuesto) |
| POST | `/api/instructor/lista-chequeo/:listaId/copiar` | Sí (INSTRUCTOR) | Copia a otra ficha (propuesto) |

---

## Reglas de negocio

- **RN-026** — Lista de chequeo por ficha.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Función nueva. El asistente evita exigir una plantilla única: cada instructor puede traer su propio formato.
