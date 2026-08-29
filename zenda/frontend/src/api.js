/*
  Ole gonorreas este archivo vale oro no lo rompan.

  CONFIGURACIÓN:
  La URL del backend está definida por VITE_API_URL (en .env del frontend).
  Si no existe, usa http://localhost:4000 (nuestro backend local).

  Cómo cambiar para producción:
  - Local: VITE_API_URL=http://localhost:4000
  - Vercel/Netlify: pones tu URL de backend desplegado (ej. https://zenda-api.railway.app)
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
export const isAdmin = () => getStoredUser()?.rol === "admin";

// Login - devuelve { user, token } o lanza un error con el mensaje del backend
export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
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
