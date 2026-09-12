import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMisFichasInstructor, clearToken, getStoredUser } from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import MisFichas from "./instructor/MisFichas";
import Proyectos from "./instructor/Proyectos";
import "../styles/Admin.css";
import "../styles/Instructor.css";

function Instructor() {
  const [fichas, setFichas] = useState([]);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [pestana, setPestana] = useState("fichas"); // "fichas" | "proyectos"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const instructor = getStoredUser();

  const fetchFichas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMisFichasInstructor();
      setFichas(data);
      if (data.length > 0) setFichaSeleccionada(data[0]);
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
    fetchFichas();
  }, []);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  const logo = theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png";

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src={logo} alt="ZENDA" className="admin-logo" />
          <div>
            <h1>ZENDA</h1>
            <p>Panel de instructor</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button className={`admin-nav-btn ${pestana === "fichas" ? "active" : ""}`} onClick={() => setPestana("fichas")}>
              Mis fichas
            </button>
            <button className={`admin-nav-btn ${pestana === "proyectos" ? "active" : ""}`} onClick={() => setPestana("proyectos")}>
              Proyectos
            </button>
          </nav>

          {/* Selector de ficha, visible en ambas pestañas */}
          {fichas.length > 0 && (
            <div className="instructor-fichas">
              <h4>Ficha activa</h4>
              <select
                className="modal-select"
                value={fichaSeleccionada?.ficha_id || ""}
                onChange={(e) => setFichaSeleccionada(fichas.find((f) => f.ficha_id === Number(e.target.value)))}
              >
                {fichas.map((f) => (
                  <option key={f.ficha_id} value={f.ficha_id}>Ficha {f.numero_ficha}</option>
                ))}
              </select>
            </div>
          )}

          <div className="admin-sidebar-footer">
            <div className="admin-user">
              <span className="admin-user-name">
                {instructor ? `${instructor.nombre} ${instructor.apellido}` : "Instructor"}
              </span>
              <span className="admin-user-email">{instructor?.correo}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="admin-content">
          {error && <div className="server-error">{error}</div>}
          {loading ? (
            <p>Cargando datos...</p>
          ) : !fichaSeleccionada ? (
            <div className="panel-empty">No tienes fichas asignadas.</div>
          ) : pestana === "fichas" ? (
            <MisFichas fichas={[fichaSeleccionada]} />
          ) : (
            <Proyectos ficha={fichaSeleccionada} />
          )}
        </main>
      </div>
    </div>
  );
}

export default Instructor;