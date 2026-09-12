/*
  Ole gonorreas este archivo vale oro no lo rompan.

  CONFIGURACIÓN:
  La URL del backend está definida por VITE_API_URL (en .env del frontend).
  Si no existe, usa http://localhost:4000 (nuestro backend local).

  Cómo cambiar para producción:
  - Local: VITE_API_URL=http://localhost:4000
  - Vercel/Netlify: pones tu URL de backend desplegado (ej. https://zenda-api.railway.app)

  NOTA MR_ZENDA: en la BD el correo se llama `correo`, el id `usuario_id`
  y el rol es ENUM en MAYÚSCULAS (ADMINISTRADOR, no "admin").
*/

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

// Guardamos el token aquí para mandarlo en cada petición autenticada
export const getToken = () => localStorage.getItem("zenda-token");
export const setToken = (token) => localStorage.setItem("zenda-token", token);
export const clearToken = () => localStorage.removeItem("zenda-token");

// Obtener el usuario guardado al hacer login y saber si es admin
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("zenda-user"));
  } catch {
    return null;
  }
};
export const isAdmin = () => getStoredUser()?.rol === "ADMINISTRADOR";

// Login - devuelve { user, token } o lanza un error con el mensaje del backend
export async function login(correo, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
  return data;
}

// Registro crea un usuario y devuelve { user, token }
export async function register(userData) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al registrarse");
  return data;
}

// Obtener todos los usuarios (solo admin) - requiere token
export async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener usuarios");
  return data;
}

// Crear usuario/estudiante/instructor (solo admin). Todo cambio delicado pide
// la contraseña del admin logueado (password) como confirmación.
export async function createUser(data) {
  const res = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al crear usuario");
  return json;
}

// Editar usuario (solo admin) - password = contraseña del admin para confirmar
export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al actualizar usuario");
  return json;
}

// Vincular las fichas de un instructor (solo admin) - password de confirmación
export async function setInstructorFichas(id, fichas, password) {
  const res = await fetch(`${API_URL}/api/users/${id}/fichas`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ fichas, password }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al vincular fichas");
  return json;
}

// Eliminar usuario (solo admin) - password = contraseña del admin para confirmar
export async function deleteUser(id, password) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ password }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al eliminar usuario");
  return json;
}

// Cambiar el rol de un usuario (solo admin) - pide la contraseña del admin que actúa
export async function updateUserRol(id, rol, password) {
  const res = await fetch(`${API_URL}/api/users/${id}/rol`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ rol, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al cambiar el rol");
  return data;
}

// ------------------------------------------------------------------
// FICHAS (esquema oficial MR_ZENDA)
// ------------------------------------------------------------------

// Listar todas las fichas con su programa y conteos (solo admin)
export async function getFichas() {
  const res = await fetch(`${API_URL}/api/fichas`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener fichas");
  return data;
}

// Listar los programas disponibles para el formulario de fichas (solo admin)
export async function getProgramas() {
  const res = await fetch(`${API_URL}/api/fichas/programas`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener programas");
  return data;
}

// Crear una ficha (solo admin) - password de confirmación
export async function createFicha(data) {
  const res = await fetch(`${API_URL}/api/fichas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al crear la ficha");
  return json;
}

// Editar una ficha (solo admin) - password de confirmación
export async function updateFicha(id, data) {
  const res = await fetch(`${API_URL}/api/fichas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al actualizar la ficha");
  return json;
}

// Eliminar una ficha (solo admin) - password de confirmación
export async function deleteFicha(id, password) {
  const res = await fetch(`${API_URL}/api/fichas/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ password }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al eliminar la ficha");
  return json;
}

// Vincular un aprendiz a una ficha (solo admin) - password de confirmación
export async function addAprendizAFicha(fichaId, usuarioId, password) {
  const res = await fetch(`${API_URL}/api/fichas/${fichaId}/aprendiz`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ usuario_id: usuarioId, password }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al vincular aprendiz");
  return json;
}

// Desvincular un aprendiz de una ficha (solo admin) - password de confirmación
export async function removeAprendizDeFicha(fichaId, usuarioId, password) {
  const res = await fetch(`${API_URL}/api/fichas/${fichaId}/aprendiz/${usuarioId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ password }),
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al desvincular aprendiz");
  return json;
}

//INSTRUCTOR
// Obtener las fichas asignadas al instructor logueado
export async function getMisFichasInstructor() {
  const res = await fetch(`${API_URL}/api/instructor/fichas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener fichas del instructor");
  return json;
}

// Obtener los aprendices activos de una ficha (solo si es del instructor logueado)
export async function getAprendicesFicha(fichaId) {
  const res = await fetch(`${API_URL}/api/instructor/fichas/${fichaId}/aprendices`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener aprendices de la ficha");
  return json;
}


// Obtener los grupos de proyecto de una ficha (solo si es del instructor logueado)
export async function getGruposDeFicha(fichaId) {
  const res = await fetch(`${API_URL}/api/instructor/fichas/${fichaId}/grupos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener los grupos de la ficha");
  return json;
}

// Obtener el README completo de un proyecto (solo si es del instructor logueado)
export async function getReadmeProyecto(proyectoId) {
  const res = await fetch(`${API_URL}/api/instructor/proyectos/${proyectoId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener el proyecto");
  return json;
}




// Lista de chequeo: carpetas y evidencias de una fase (solo si es del instructor logueado)
export async function getCarpetasDeFase(faseId) {
  const res = await fetch(`${API_URL}/api/instructor/fases/${faseId}/carpetas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener la lista de chequeo");
  return json;
}

// Evaluar una evidencia como APROBADO o REPROBADO
export async function evaluarEvidencia(evidenciaId, resultado) {
  const res = await fetch(`${API_URL}/api/instructor/evidencias/${evidenciaId}/evaluar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ resultado }),
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al evaluar la evidencia");
  return json;
}

// Evidencias reales de los proyectos de una ficha
export async function getEvidenciasFicha(fichaId) {
  const res = await fetch(`${API_URL}/api/instructor/fichas/${fichaId}/evidencias`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener las evidencias");
  return json;
}



// Historial de observaciones de un proyecto
export async function getObservacionesProyecto(proyectoId) {
  const res = await fetch(`${API_URL}/api/instructor/proyectos/${proyectoId}/observaciones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener las observaciones");
  return json;
}

// Crear una observación hacia un proyecto/grupo
export async function crearObservacion(proyectoId, titulo, descripcion) {
  const res = await fetch(`${API_URL}/api/instructor/proyectos/${proyectoId}/observaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ titulo, descripcion }),
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al crear la observación");
  return json;
}

// Crear grupo de proyecto (el aprendiz queda como Scrum Master/líder)
export async function crearProyectoAprendiz(data) {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al crear el proyecto");
  return json;
}

// Unirse a un grupo existente con su código de invitación
export async function unirseProyectoAprendiz(codigo_grupo, rol_scrum) {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos/unirse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ codigo_grupo, rol_scrum }),
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al unirse al proyecto");
  return json;
}

// Obtener el proyecto activo del aprendiz logueado (o 404 si no tiene ninguno)
export async function getMiProyectoAprendiz() {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos/mio`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (res.status === 404) return null;
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener el proyecto");
  return json;
}

// Crear una carpeta dentro de una fase (solo el líder del grupo)
export async function crearCarpetaAprendiz(faseId, nombreCarpeta) {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos/fases/${faseId}/carpetas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ nombre_carpeta: nombreCarpeta }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al crear la carpeta");
  return json;
}

// Subir una evidencia (link) dentro de una carpeta (solo el líder del grupo)
export async function subirEvidenciaAprendiz(carpetaId, data) {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos/carpetas/${carpetaId}/evidencias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al subir la evidencia");
  return json;
}

// Ver la lista de chequeo (carpetas + evidencias) de una fase del proyecto propio
export async function getCarpetasDeFaseAprendiz(faseId) {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos/fases/${faseId}/carpetas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al obtener la lista de chequeo");
  return json;
}

// Ver las observaciones que el instructor publicó al proyecto propio
export async function getObservacionesDeMiProyecto() {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos/observaciones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al obtener las observaciones");
  return json;
}

// Fichas públicas de ADSO, para el dropdown del registro (sin token)
export async function getFichasPublicas() {
  const res = await fetch(`${API_URL}/api/fichas/publicas`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener las fichas");
  return data;
}

// El aprendiz corrige su propia ficha (solo si no tiene proyecto activo)
export async function cambiarMiFicha(numeroFicha) {
  const res = await fetch(`${API_URL}/api/aprendiz/proyectos/mi-ficha`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ numero_ficha: numeroFicha }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al cambiar de ficha");
  return json;
}

export const getFichasCoordinador = async () => {
  const res = await fetch(`${API_URL}/api/coordinador/fichas`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener fichas');
  return data;
};

export const getInstructoresCoordinador = async () => {
  const res = await fetch(`${API_URL}/api/coordinador/instructores`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener instructores');
  return data;
};

export const setFichasInstructorCoordinador = async (id, fichas, password) => {
  const res = await fetch(`${API_URL}/api/coordinador/instructores/${id}/fichas`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ fichas, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al vincular fichas');
  return data;
};

export const getRutaPorRol = (rol) =>
  ({ ADMINISTRADOR: "/admin", COORDINADOR: "/coordinador", INSTRUCTOR: "/instructor", APRENDIZ: "/aprendiz" }[rol] || "/dashboard");