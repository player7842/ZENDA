/*
  Muestra el dashboard con el usuario real del backend y un botón de logout.
  Lee el usuario guardado en localStorage (zenda-user) al hacer login.
*/

import { useNavigate, Link } from "react-router-dom";
import { clearToken } from "../api";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("zenda-user") || null);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>ZENDA</h1>
          <p>Bienvenido, {user ? `${user.nombre} ${user.apellido}` : user?.email}</p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/admin" className="btn-admin">Panel Admin</Link>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2>Panel Principal</h2>
        <p>Has iniciado sesión correctamente. Este es tu panel de control.</p>
      </main>
    </div>
  );
}

export default Dashboard;
