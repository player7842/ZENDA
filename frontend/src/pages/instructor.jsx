/*
  Panel de instructor de ZENDA.
  Refactorizado UI/UX: Sidebar limpio sin selectores duplicados,
  control de fichas 100% integrado en la barra de contenido.
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Briefcase, 
  LogOut, 
  AlertCircle 
} from "lucide-react";
import { getMisFichasInstructor, clearToken, getStoredUser } from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import MisFichas from "./instructor/MisFichas";
import Resumen from "./instructor/Resumen";
import Proyectos from "./instructor/Proyectos";
import "../styles/Admin.css";
import "../styles/Instructor.css";

function Instructor() {
  const [fichas, setFichas] = useState([]);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [pestana, setPestana] = useState("resumen");
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
      setFichas(data || []);
      if (data && data.length > 0) setFichaSeleccionada(data[0]);
    } catch (err) {
      setError(err?.message || "Error al obtener las fichas asignadas");
      if (err?.message?.includes("Token")) {
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
            <button
              className={`admin-nav-btn ${pestana === "resumen" ? "active" : ""}`}
              onClick={() => setPestana("resumen")}
            >
              <LayoutDashboard size={18} />
              <span>Resumen</span>
            </button>

            <button
              className={`admin-nav-btn ${pestana === "fichas" ? "active" : ""}`}
              onClick={() => setPestana("fichas")}
            >
              <FolderKanban size={18} />
              <span>Mis fichas</span>
            </button>

            <button
              className={`admin-nav-btn ${pestana === "proyectos" ? "active" : ""}`}
              onClick={() => setPestana("proyectos")}
            >
              <Briefcase size={18} />
              <span>Proyectos</span>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user">
              <span className="admin-user-name">
                {instructor ? `${instructor.nombre} ${instructor.apellido}` : "Instructor"}
              </span>
              <span className="admin-user-email">{instructor?.correo}</span>
            </div>
            <button
              className="btn-logout"
              onClick={handleLogout}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <LogOut size={14} /> Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="admin-content">
          {error && (
            <div className="server-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="skeleton-box" style={{ height: 32, width: 220 }} />
              <div className="skeleton-box" style={{ height: 260 }} />
            </div>
          ) : pestana === "resumen" ? (
            <Resumen fichas={fichas} />
          ) : !fichaSeleccionada ? (
            <div className="fases-empty-state">
              <FolderKanban size={40} opacity={0.4} />
              <p style={{ margin: 0 }}>No tienes fichas asignadas actualmente.</p>
            </div>
          ) : pestana === "fichas" ? (
            <MisFichas 
              fichas={fichas} 
              fichaSeleccionada={fichaSeleccionada} 
              setFichaSeleccionada={setFichaSeleccionada} 
            />
          ) : (
            <Proyectos 
              fichas={fichas} 
              fichaSeleccionada={fichaSeleccionada} 
              setFichaSeleccionada={setFichaSeleccionada} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Instructor;