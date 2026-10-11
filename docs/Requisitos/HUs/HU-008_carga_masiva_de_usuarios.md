# HU-008 — Carga masiva de usuarios

<!--
  ¿Qué? Historia de usuario que describe: carga masiva de usuarios.
  ¿Para qué? Formalizar la necesidad del administrador: registrar rápidamente a los aprendices e instructores de una ficha.
  ¿Impacto? Ahorra horas de digitación al inicio de cada ficha.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-008 |
| **Título** | Carga masiva de usuarios |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Rol** | Administrador |
| **RF asociado** | RF-008 |
| **Reglas de negocio** | RN-001, RN-002, RN-028 |

---

## Historia

**Como** administrador,
**quiero** importar muchos usuarios a la vez desde un archivo CSV,
**para** registrar rápidamente a los aprendices e instructores de una ficha.

---

## Criterios de aceptación

### CA-008.1 — Subir archivo

- **Dado que** estoy en la sección Usuarios,
- **cuando** selecciono un CSV con el formato indicado,
- **entonces** veo una vista previa de las filas a importar.

### CA-008.2 — Filas con errores

- **Dado que** el archivo tiene filas inválidas,
- **cuando** confirmo la importación,
- **entonces** las filas válidas se crean y recibo un resumen con los errores por fila.

### CA-008.3 — Plantilla descargable

- **Dado que** necesito el formato correcto,
- **cuando** pulso "Descargar plantilla",
- **entonces** obtengo un CSV con las columnas esperadas.

---

## Cambios frente a la versión v11

- El módulo `importUsersBulk` del frontend ya existe; el endpoint del backend está pendiente.
