# Casos de prueba funcionales 01 — Autenticación y administración

<!--
  ¿Qué? Casos de prueba derivados de los criterios de aceptación de las historias de usuario del módulo.
  ¿Para qué? Verificar que cada requisito funcional hace lo que prometió, con pasos y resultados esperados concretos.
  ¿Impacto? Un criterio de aceptación sin caso de prueba nunca se verifica; un caso sin criterio no tiene dueño.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Módulos** | Autenticación, Administración |
| **Casos** | 51 |
| **Origen** | Criterios de aceptación (Dado/Cuando/Entonces) de las HU |
| **Plan** | [Plan de pruebas](../plan-de-pruebas.md) |
| **Fecha** | Octubre 2026 |

**Cómo leer las columnas**

| Columna | Significado |
|---|---|
| **ID** | `CP-<número de RF>.<número de criterio>`; coincide con el criterio `CA-<RF>.<n>` de la historia. |
| **Tipo** | *Positivo*: el camino feliz. *Negativo*: un dato o permiso inválido que debe rechazarse. |
| **Nivel** | Dónde conviene automatizarlo: `API` (petición HTTP) o `E2E` (navegador). |
| **Aplica a v11** | `Sí` se puede ejecutar hoy · `Parcial` el requisito cambia en v12 (ejecutar y comparar con "Cambios frente a la versión v11") · `No` la funcionalidad aún no existe. |

> Los usuarios y fichas de prueba están en [Instalación sin Docker](../../setup/sin-docker.md#6-usuarios-de-prueba).

---

### RF-001 — Registro de aprendiz

**Historia:** [HU-001](../../requisitos/HUs/HU-001_registro_de_aprendiz.md) · **Requisito:** [RF-001](../../requisitos/RFs/RF-001_registro_de_aprendiz.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-001.1 | Formulario completo | estoy en la página de registro | veo el formulario | encuentro los campos nombre, apellido, tipo y número de documento (CC, TI, CE, PA y PPT), correo institucional, ficha, contraseña y confirmación de contraseña | Positivo | E2E | Alta | Parcial |
| CP-001.2 | Correo institucional obligatorio | completo el formulario con un correo que no termina en `@soy.sena.edu.co` | envío el formulario | veo el mensaje "El correo debe ser institucional (@soy.sena.edu.co)" | Negativo | E2E | Alta | Parcial |
| CP-001.3 | Medidor de contraseña | escribo mi contraseña | cambia cada carácter | veo un medidor con cinco niveles: muy baja, baja, media, fuerte y muy segura | Positivo | E2E | Alta | Parcial |
| CP-001.4 | Confirmación sin pegar | estoy en el campo de confirmación de contraseña | intento pegar texto con el portapapeles | el campo no acepta el contenido pegado y debo escribirlo | Negativo | API | Alta | Parcial |
| CP-001.5 | Aceptación legal obligatoria | no he marcado alguna de las cuatro casillas legales (términos, privacidad, cookies y protección de datos) | intento enviar el formulario | el registro se bloquea y se indica cuál aceptación falta | Negativo | API | Alta | Parcial |
| CP-001.6 | Registro exitoso | completé todos los campos correctamente | envío el formulario | mi cuenta se crea como `APRENDIZ`, quedo inscrito en el grupo `General` de mi ficha y accedo a mi panel | Positivo | API | Alta | Parcial |
| CP-001.7 | Correo duplicado | intento registrarme con un correo que ya existe | envío el formulario | veo el mensaje "Este correo ya está registrado" | Negativo | E2E | Alta | Parcial |

### RF-002 — Inicio de sesión

**Historia:** [HU-002](../../requisitos/HUs/HU-002_inicio_de_sesion.md) · **Requisito:** [RF-002](../../requisitos/RFs/RF-002_inicio_de_sesion.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-002.1 | Acceso al panel según el rol | ingreso credenciales válidas de una cuenta activa | envío el formulario | soy dirigido al panel de mi rol (`/aprendiz`, `/instructor`, `/coordinador` o `/admin`) | Positivo | API | Alta | Sí |
| CP-002.2 | Credenciales incorrectas | ingreso un correo o una contraseña erróneos | envío el formulario | veo el mensaje "Credenciales incorrectas, intenta de nuevo" sin saber cuál de los dos falló | Negativo | E2E | Alta | Sí |
| CP-002.3 | Cuenta inactiva | mi cuenta tiene un estado distinto de `Activo` | intento iniciar sesión | veo un mensaje que me indica hablar con un administrador | Positivo | E2E | Alta | Sí |
| CP-002.4 | Volver al inicio | estoy en la pantalla de inicio de sesión | quiero regresar a la página principal | encuentro un botón "Volver al inicio" | Positivo | E2E | Alta | Sí |

### RF-003 — Recuperación de contraseña

**Historia:** [HU-003](../../requisitos/HUs/HU-003_recuperacion_de_contrasena.md) · **Requisito:** [RF-003](../../requisitos/RFs/RF-003_recuperacion_de_contrasena.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-003.1 | Solicitud de recuperación | estoy en la pantalla "Olvidé mi contraseña" | ingreso mi correo y envío | veo un mensaje que indica que, si el correo existe, recibirá un enlace | Positivo | E2E | Alta | Parcial |
| CP-003.2 | Correo con enlace | solicité la recuperación con un correo registrado | reviso mi bandeja | recibo un correo con un enlace válido por 15 minutos | Positivo | API | Alta | Parcial |
| CP-003.3 | Nueva contraseña | abro el enlace con un token vigente | ingreso una contraseña de al menos 8 caracteres y envío | mi contraseña se actualiza y puedo iniciar sesión con ella | Positivo | API | Alta | Parcial |
| CP-003.4 | Enlace vencido | abro un enlace con el token expirado o inválido | envío la nueva contraseña | veo el mensaje "El token es inválido o ha expirado" | Negativo | E2E | Alta | Parcial |

### RF-004 — Sesión segura

**Historia:** [HU-004](../../requisitos/HUs/HU-004_sesion_segura.md) · **Requisito:** [RF-004](../../requisitos/RFs/RF-004_sesion_segura.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-004.1 | Cierre manual | estoy dentro de mi panel | pulso "Cerrar sesión" | mi sesión se cierra y regreso al inicio | Positivo | E2E | Alta | Parcial |
| CP-004.2 | Renovación transparente | mi token de acceso está por vencer y sigo activo | la aplicación hace una petición | la sesión se renueva sin interrumpirme | Positivo | API | Alta | Parcial |
| CP-004.3 | Cierre por inactividad | paso 30 minutos sin actividad | se cumple el tiempo | mi sesión se cierra automáticamente | Positivo | API | Alta | Parcial |
| CP-004.4 | Aviso previo | faltan 60 segundos para el cierre por inactividad | la aplicación lo detecta | veo un aviso con la opción de continuar | Positivo | E2E | Alta | Parcial |

### RF-005 — Protección de rutas por rol

**Historia:** [HU-005](../../requisitos/HUs/HU-005_proteccion_de_rutas_por_rol.md) · **Requisito:** [RF-005](../../requisitos/RFs/RF-005_proteccion_de_rutas_por_rol.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-005.1 | Ruta sin sesión | no he iniciado sesión | intento abrir una ruta privada | soy redirigido al inicio de sesión | Negativo | API | Alta | Sí |
| CP-005.2 | Ruta de otro rol | tengo sesión como aprendiz | intento abrir `/admin` | no accedo y soy dirigido a mi propio panel | Positivo | API | Alta | Sí |
| CP-005.3 | Petición no autorizada | hago una petición a la API sin permiso para ella | el servidor la recibe | responde que no tengo acceso, aunque la interfaz no muestre el botón | Negativo | E2E | Alta | Sí |

### RF-006 — Gestión de usuarios

**Historia:** [HU-006](../../requisitos/HUs/HU-006_gestion_de_usuarios.md) · **Requisito:** [RF-006](../../requisitos/RFs/RF-006_gestion_de_usuarios.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-006.1 | Crear usuario | estoy en la sección Usuarios | completo los datos, el rol y confirmo con mi contraseña | el usuario se crea y aparece en el listado | Positivo | API | Alta | Sí |
| CP-006.2 | Contraseña inicial segura | creo un usuario | ingreso una contraseña de menos de 8 caracteres | veo el mensaje que exige mínimo 8 caracteres | Positivo | E2E | Alta | Sí |
| CP-006.3 | Consultar usuarios | estoy en la sección Usuarios | abro el listado | veo todos los usuarios con su rol, estado y fichas vinculadas | Positivo | E2E | Alta | Sí |
| CP-006.4 | Cambiar rol | selecciono un usuario | elijo un rol nuevo y confirmo con mi contraseña | el rol se actualiza | Positivo | API | Alta | Sí |
| CP-006.5 | No quitarme el rol | intento cambiar mi propio rol de administrador | envío el cambio | el sistema lo rechaza | Negativo | API | Alta | Sí |

### RF-007 — Desactivación y eliminación de usuarios

**Historia:** [HU-007](../../requisitos/HUs/HU-007_desactivacion_y_eliminacion_de_usuarios.md) · **Requisito:** [RF-007](../../requisitos/RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-007.1 | Desactivar usuario | selecciono un usuario activo | cambio su estado a inactivo y confirmo | el usuario ya no puede iniciar sesión y su historial se conserva | Positivo | API | Media | Parcial |
| CP-007.2 | Eliminar con confirmación | selecciono un usuario | pulso eliminar y confirmo con mi contraseña | el usuario se elimina | Positivo | E2E | Media | Parcial |
| CP-007.3 | Contraseña incorrecta | intento eliminar un usuario | ingreso una contraseña distinta a la mía | la acción se rechaza y el usuario no se elimina | Negativo | API | Media | Parcial |
| CP-007.4 | Líder desactivado | desactivo a un aprendiz que es líder de un grupo | se guarda el cambio | el sistema me avisa que el grupo necesita que reasigne el liderazgo | Positivo | API | Media | Parcial |

### RF-008 — Carga masiva de usuarios

**Historia:** [HU-008](../../requisitos/HUs/HU-008_carga_masiva_de_usuarios.md) · **Requisito:** [RF-008](../../requisitos/RFs/RF-008_carga_masiva_de_usuarios.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-008.1 | Subir archivo | estoy en la sección Usuarios | selecciono un CSV con el formato indicado | veo una vista previa de las filas a importar | Positivo | E2E | Media | Parcial |
| CP-008.2 | Filas con errores | el archivo tiene filas inválidas | confirmo la importación | las filas válidas se crean y recibo un resumen con los errores por fila | Positivo | API | Media | Parcial |
| CP-008.3 | Plantilla descargable | necesito el formato correcto | pulso "Descargar plantilla" | obtengo un CSV con las columnas esperadas | Positivo | E2E | Media | Parcial |

### RF-009 — Gestión de fichas

**Historia:** [HU-009](../../requisitos/HUs/HU-009_gestion_de_fichas.md) · **Requisito:** [RF-009](../../requisitos/RFs/RF-009_gestion_de_fichas.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-009.1 | Crear ficha | estoy en la sección Fichas | completo programa, número, fechas y jornada y confirmo con mi contraseña | la ficha se crea y aparece con su conteo de aprendices | Positivo | API | Alta | Sí |
| CP-009.2 | Número duplicado | intento crear una ficha con un número que ya existe | envío el formulario | veo el mensaje que indica que el número ya existe | Negativo | E2E | Alta | Sí |
| CP-009.3 | Fechas inválidas | ingreso una fecha de fin anterior a la de inicio | envío el formulario | veo un mensaje que exige fechas válidas | Negativo | E2E | Alta | Sí |
| CP-009.4 | Editar y eliminar | selecciono una ficha | edito sus datos o la elimino con confirmación | el listado se actualiza | Positivo | API | Alta | Sí |

### RF-010 — Aprendices en una ficha

**Historia:** [HU-010](../../requisitos/HUs/HU-010_aprendices_en_una_ficha.md) · **Requisito:** [RF-010](../../requisitos/RFs/RF-010_aprendices_en_una_ficha.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-010.1 | Vincular aprendiz | selecciono una ficha y un aprendiz | confirmo la vinculación | el aprendiz queda inscrito en el grupo `General` de esa ficha | Positivo | API | Media | Sí |
| CP-010.2 | Desvincular aprendiz | un aprendiz está inscrito en la ficha | lo desvinculo | su inscripción queda inactiva en esa ficha | Positivo | API | Media | Sí |
| CP-010.3 | Aprendiz inexistente | indico un usuario que no existe | envío la solicitud | veo el mensaje "Ese usuario no existe" | Positivo | E2E | Media | Sí |

### RF-011 — Asignación de instructores a fichas

**Historia:** [HU-011](../../requisitos/HUs/HU-011_asignacion_de_instructores_a_fichas.md) · **Requisito:** [RF-011](../../requisitos/RFs/RF-011_asignacion_de_instructores_a_fichas.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-011.1 | Vincular fichas | selecciono un instructor | elijo las fichas que atenderá y guardo | el instructor ve esas fichas en su panel | Positivo | API | Alta | Parcial |
| CP-011.2 | Solo instructores | selecciono un usuario que no es instructor | intento vincularle fichas | el sistema lo rechaza | Negativo | API | Alta | Parcial |
| CP-011.3 | Reasignación por el coordinador | soy coordinador | cambio las fichas de un instructor del programa ADSO | la asignación se actualiza solo para fichas ADSO | Positivo | API | Alta | Parcial |
| CP-011.4 | Historial conservado | se retira una ficha a un instructor | guardo el cambio | la vinculación anterior queda cerrada con su fecha y sus evaluaciones se conservan | Positivo | API | Alta | Parcial |

### RF-012 — Gestión de programas de formación

**Historia:** [HU-012](../../requisitos/HUs/HU-012_gestion_de_programas_de_formacion.md) · **Requisito:** [RF-012](../../requisitos/RFs/RF-012_gestion_de_programas_de_formacion.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-012.1 | Crear programa | estoy en la sección Programas | ingreso código y nombre del programa | el programa se crea y queda disponible al crear fichas | Positivo | API | Media | No |
| CP-012.2 | Código duplicado | ingreso un código que ya existe | envío el formulario | veo un mensaje que indica que el código ya existe | Negativo | E2E | Media | No |
| CP-012.3 | Programa con fichas | un programa tiene fichas asociadas | intento eliminarlo | el sistema lo impide y me indica por qué | Positivo | API | Media | No |

### RF-013 — Diagnóstico y copia de seguridad

**Historia:** [HU-013](../../requisitos/HUs/HU-013_diagnostico_y_copia_de_seguridad.md) · **Requisito:** [RF-013](../../requisitos/RFs/RF-013_diagnostico_y_copia_de_seguridad.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-013.1 | Ver diagnóstico | estoy en la sección Sistema | abro la pantalla | veo el estado del servidor, de la base de datos y de la última copia | Positivo | E2E | Baja | No |
| CP-013.2 | Descargar copia | estoy en la sección Sistema | pulso "Descargar copia de seguridad" y confirmo con mi contraseña | obtengo un archivo con la copia de la base de datos | Positivo | E2E | Baja | No |
| CP-013.3 | Solo administradores | no soy administrador | intento acceder a estas funciones | el sistema me lo niega | Negativo | API | Baja | No |

---

## Documentos relacionados

- [Plan de pruebas](../plan-de-pruebas.md) · [Matriz de cobertura](../matriz-cobertura.md)
- [Pruebas de integración](../pruebas-de-integracion.md) · [Pruebas no funcionales](../pruebas-no-funcionales.md)
