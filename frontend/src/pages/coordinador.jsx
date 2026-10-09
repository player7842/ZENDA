/*
  Panel de Coordinador de ZENDA · ADSO
  UI/UX Avanzado: Pestaña 'Resumen', Buscador Universal de Aprendices en la cabecera,
  Exportador de reportes pedagógicos y navegación fluida entre sub-módulos.
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  UserCheck, 
  Users, 
  Briefcase, 
  Activity, 
  LogOut, 
  Search,
  FileSpreadsheet,
  X
} from "lucide-react";
import { clearToken, getStoredUser } from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// Sub-páginas del Coordinador
import Dashboard from "./coordinador/Resumen"; // Ahora actúa como Resumen
import Fichas from "./coordinador/Fichas";
import Instructores from "./coordinador/Instructores";
import Grupos from "./coordinador/Grupos";
import Proyectos from "./coordinador/Proyectos";
import Seguimiento from "./coordinador/Seguimiento";

import "../styles/Admin.css";

const TABS = [
  { id: "resumen", label: "Resumen", icon: <LayoutDashboard size={18} /> },
  { id: "fichas", label: "Fichas", icon: <ClipboardList size={18} /> },
  { id: "instructores", label: "Instructores", icon: <UserCheck size={18} /> },
  { id: "grupos", label: "Grupos", icon: <Users size={18} /> },
  { id: "proyectos", label: "Proyectos", icon: <Briefcase size={18} /> },
  { id: "seguimiento", label: "Seguimiento", icon: <Activity size={18} /> },
];

function Coordinador() {
  const [pestana, setPestana] = useState("resumen");
  const [proyectoSeguimiento, setProyectoSeguimiento] = useState(null);
  const [busquedaAprendiz, setBusquedaAprendiz] = useState("");
  const [mostrarModalBusqueda, setMostrarModalBusqueda] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const coordinador = getStoredUser();

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  const irASeguimiento = (proyectoId) => {
    setProyectoSeguimiento(proyectoId);
    setPestana("seguimiento");
  };

  const logo = theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png";

  return (
    <div className="admin">
      {/* Header con Buscador Universal */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src={logo} alt="ZENDA" className="admin-logo" />
          <div>
            <p>Panel de Coordinación · ADSO</p>
          </div>
        </div>

        {/* BUSCADOR UNIVERSAL DE APRENDIZ EN CABECERA */}
        <div className="search-box-wrap" style={{ maxWidth: 380, flex: 1, margin: "0 20px" }}>
          <span className="search-box-icon">
            <Search size={15} />
          </span>
          <input
            className="modal-input"
            placeholder="Buscador universal (Aprendiz, Doc. o Ficha)..."
            value={busquedaAprendiz}
            onChange={(e) => {
              setBusquedaAprendiz(e.target.value);
              setMostrarModalBusqueda(e.target.value.length > 2);
            }}
          />
        </div>

        <div className="admin-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`admin-nav-btn ${pestana === t.id ? "active" : ""}`}
                onClick={() => setPestana(t.id)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user">
              <span className="admin-user-name">
                {coordinador ? `${coordinador.nombre} ${coordinador.apellido}` : "Coordinador"}
              </span>
              <span className="admin-user-email">{coordinador?.correo}</span>
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
          {pestana === "resumen" && <Dashboard />}
          {pestana === "fichas" && <Fichas />}
          {pestana === "instructores" && <Instructores />}
          {pestana === "grupos" && <Grupos />}
          {pestana === "proyectos" && <Proyectos onVerSeguimiento={irASeguimiento} />}
          {pestana === "seguimiento" && <Seguimiento proyectoId={proyectoSeguimiento} />}
        </main>
      </div>

      {/* MODAL / POPUP FLOTANTE DE BÚSQUEDA RÁPIDA DE APRENDIZ */}
      {mostrarModalBusqueda && (
        <div className="modal-overlay" onClick={() => setMostrarModalBusqueda(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <Search size={16} style={{ color: "var(--color-primary)" }} /> Resultados para "{busquedaAprendiz}"
              </h4>
              <button onClick={() => setMostrarModalBusqueda(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <p className="admin-count" style={{ marginBottom: 14 }}>
              Redirigiendo a consultas de aprendices del programa ADSO...
            </p>
            <button 
              className="btn-rol" 
              style={{ width: "100%" }}
              onClick={() => {
                setMostrarModalBusqueda(false);
                setPestana("grupos");
              }}
            >
              Verificar en listado de Grupos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coordinador;