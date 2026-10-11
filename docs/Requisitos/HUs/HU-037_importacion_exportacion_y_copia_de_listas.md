# HU-037 — Importación, exportación y copia de listas

<!--
  ¿Qué? Historia de usuario que describe: importación, exportación y copia de listas.
  ¿Para qué? Formalizar la necesidad del instructor: no rehacer la misma lista para cada ficha que acompaño.
  ¿Impacto? Ahorra tiempo a los instructores con varias fichas que usan la misma metodología.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-037 |
| **Título** | Importación, exportación y copia de listas |
| **Módulo** | Lista de chequeo |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Rol** | Instructor |
| **RF asociado** | RF-037 |
| **Reglas de negocio** | RN-026 |

---

## Historia

**Como** instructor,
**quiero** importar mi lista desde un Excel, exportarla y copiarla a otras fichas,
**para** no rehacer la misma lista para cada ficha que acompaño.

---

## Criterios de aceptación

### CA-037.1 — Importar con asistente

- **Dado que** tengo un Excel con mi lista,
- **cuando** lo subo y veo la vista previa,
- **entonces** puedo indicar qué columna es la fase, el nombre y la descripción.

### CA-037.2 — Importación completada

- **Dado que** confirmé la correspondencia de columnas,
- **cuando** importo,
- **entonces** los ítems se crean y el archivo original queda guardado como referencia.

### CA-037.3 — Exportar

- **Dado que** tengo una lista de chequeo,
- **cuando** pido exportarla,
- **entonces** obtengo un Excel con sus ítems en el mismo orden.

### CA-037.4 — Copiar a otra ficha

- **Dado que** acompaño varias fichas,
- **cuando** copio la lista a otra ficha,
- **entonces** la ficha destino recibe una lista independiente con los mismos ítems.

---

## Cambios frente a la versión v11

- Función nueva. El asistente evita exigir una plantilla única: cada instructor puede traer su propio formato.
