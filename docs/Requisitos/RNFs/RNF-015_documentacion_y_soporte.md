# RNF-015 — Documentación y soporte

<!--
  ¿Qué? Requisito no funcional que define: documentación y soporte.
  ¿Para qué? Garantizar que cualquier persona pueda entender, instalar y mantener el sistema.
  ¿Impacto? Sin documentación, el conocimiento queda en la cabeza de quien lo construyó.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-015 |
| **Nombre** | Documentación y soporte |
| **Categoría** | Documentación |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-015.1 — Documentación en el repositorio

La carpeta `docs/` contiene la documentación en Markdown, con la estructura del repositorio de referencia ([RO-006](../restricciones.md#ro-006--documentación-en-el-repositorio)).

**Estado:** Parcial

### RNF-015.2 — README como portada

El `README.md` presenta el proyecto, el inicio rápido y el índice de `docs/`.

**Estado:** Vigente

### RNF-015.3 — Guías de instalación

Existen guías de instalación con y sin Docker y la lista de variables de entorno.

**Estado:** Adoptada

### RNF-015.4 — Referencias vivas

El esquema de base de datos y la referencia de la API se actualizan en el mismo cambio que los modifica.

**Estado:** Adoptada

### RNF-015.5 — Registro de decisiones

Las decisiones de arquitectura se registran en `docs/decisiones/` con su contexto y consecuencias.

**Estado:** Adoptada

### RNF-015.6 — Guía rápida por rol

Una guía breve de uso para aprendiz, instructor, coordinador y administrador.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
