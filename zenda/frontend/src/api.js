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

// Eliminar usuario (solo admin)
export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al eliminar usuario");
  return data;
}
