/*
  Landing SIMPLE para usuarios sin rol admin (aprendiz/instructor).
  Los admins ya no pasan por aquí: su dashboard es el panel de administración.
  Aquí solo saludamos y damos la opción de cerrar sesión.
*/

import { useNavigate } from "react-router-dom";
import { clearToken } from "../api";
import { useTheme } from "../context/ThemeContext";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("zenda-user") || null);
  const { theme } = useTheme();
  const logo = theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png";

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <img src={logo} alt="ZENDA" className="dashboard-logo" />
          <p>Bienvenido, {user ? `${user.nombre} ${user.apellido}` : user?.email}</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2>Panel de aprendiz</h2>
        <p>
          Tu cuenta no tiene permisos de administración. Si crees que esto es un error,
          contacta a un administrador para que cambie tu rol.
        </p>
      </main>
    </div>
  );
}

export default Dashboard;