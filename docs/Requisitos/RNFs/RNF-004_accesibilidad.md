# RNF-004 — Accesibilidad

<!--
  ¿Qué? Requisito no funcional que define: accesibilidad.
  ¿Para qué? Permitir que cualquier persona use el sistema, con independencia de sus capacidades o dispositivo.
  ¿Impacto? Una interfaz inaccesible excluye a aprendices y no cumple las buenas prácticas pedidas por el instructor.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-004 |
| **Nombre** | Accesibilidad |
| **Categoría** | Inclusión |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-004.1 — Contraste mínimo

Texto e iconos cumplen **WCAG 2.1 AA** en ambos temas: 4.5 : 1 para texto normal y 3 : 1 para texto grande y componentes de interfaz.

**Estado:** Adoptada

### RNF-004.2 — Navegación por teclado

Todas las acciones se pueden realizar con teclado, con un indicador de foco visible.

**Estado:** Parcial

### RNF-004.3 — Etiquetas y roles

Los campos de formulario tienen etiquetas asociadas; los iconos sin texto tienen `aria-label`; los menús y diálogos usan los roles ARIA adecuados.

**Estado:** Parcial

### RNF-004.4 — No depender solo del color

Los estados (aprobado, reprobado, pendiente) se distinguen también por texto o icono.

**Estado:** Adoptada

### RNF-004.5 — Gestores de contraseñas

Se permite el autocompletado y el pegado en el campo de contraseña. Solo se bloquea el pegado en la confirmación.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
