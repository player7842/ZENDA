/*
  Panel del administrador.
  Lista todos los usuarios registrados, muestra sus datos y permite eliminarlos
  Usa el token JWT guardado en localStorage para autenticarse contra el backend

  Nota: por ahora cualquier usuario logueado puede entrar aquí
  Más adelante se puede proteger con un campo "rol" en la base de datos
*/

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUsers, deleteUser, clearToken } from "../api";
import "../styles/Admin.css";

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Al montar el componente trae los usuarios del backend
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      // Si el token es inválido va a mandar al login
      setError(err.message);
      if (err.message.includes("Token")) {
        clearToken();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      await deleteUser(id);
      // Recarga la lista sin el eliminado
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  return (
    <div className="admin">
      <header className="admin-header">
        <div>
          <h1>ZENDA Admin</h1>
          <p>Gestión de usuarios</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/dashboard" className="admin-link">Volver al panel</Link>
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main className="admin-content">
        <h2>Usuarios registrados</h2>
        <p className="admin-count">{users.length} usuario(s)</p>

        {error && <div className="server-error">{error}</div>}

        {loading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Ficha</th>
                  <th>Documento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6">No hay usuarios registrados todavía.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.nombre} {u.apellido}</td>
                      <td>{u.email}</td>
                      <td>{u.ficha}</td>
                      <td>{u.tipo_documento} {u.numero_documento}</td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(u.id)}
                          title="Eliminar usuario"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
