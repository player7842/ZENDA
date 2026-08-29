/*
  Panel de administración = EL dashboard del app (ya no hay otro panel).
  Layout:
    - Header arriba: logo + toggle de tema (estático, esquina superior derecha)
    - Sidebar IZQUIERDO: navegación de paneles + botón de cerrar sesión abajo
    - Contenido a la derecha: el panel activo
  Paneles:
    1. Fichas        → listado de fichas, selecciona → CRUD de estudiantes
    2. Instructores  → listado de instructores, selecciona → fichas vinculadas (modificable)
    3. Usuarios      → mini menú por rol y edición completa de usuarios
  Toda acción delicada pide la contraseña del admin. Seguridad ante todo, hp.
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, clearToken, getStoredUser, isAdmin } from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import Fichas from "./admin/Fichas";
import Instructores from "./admin/Instructores";
import Usuarios from "./admin/Usuarios";
import "../styles/Admin.css";

const PESTANAS = [
  { id: "fichas", label: "Fichas" },
  { id: "instructores", label: "Instructores" },
  { id: "usuarios", label: "Usuarios" },
];

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pestana, setPestana] = useState("fichas");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const admin = getStoredUser();

  // Trae TODOS los usuarios del backend (lo usan todos los paneles)
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
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
    // Solo los admins entran aquí; el resto vuele al dashboard simple
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, []);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  // Logo según el tema (clarito u oscuro)
  const logo = theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png";

  return (
    <div className="admin">
      {/* Header: logo a la izquierda, toggle de tema a la derecha (estático) */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src={logo} alt="ZENDA" className="admin-logo" />
          <div>
            <h1>ZENDA</h1>
            <p>Panel de administración</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar IZQUIERDO */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                className={`admin-nav-btn ${pestana === p.id ? "active" : ""}`}
                onClick={() => setPestana(p.id)}
              >
                {p.label}
              </button>
            ))}
          </nav>

          {/* Sección inferior del sidebar: quién es y botón de salir */}
          <div className="admin-sidebar-footer">
            <div className="admin-user">
              <span className="admin-user-name">
                {admin ? `${admin.nombre} ${admin.apellido}` : "Admin"}
              </span>
              <span className="admin-user-email">{admin?.email}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Contenido del panel activo */}
        <main className="admin-content">
          {error && <div className="server-error">{error}</div>}

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <>
              {pestana === "fichas" && <Fichas users={users} onDataChanged={fetchUsers} />}
              {pestana === "instructores" && <Instructores users={users} onDataChanged={fetchUsers} />}
              {pestana === "usuarios" && <Usuarios users={users} onDataChanged={fetchUsers} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;