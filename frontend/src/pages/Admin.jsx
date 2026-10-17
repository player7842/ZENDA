/*
  Panel de administración principal de ZENDA.
  Refactorizado UI/UX: Iconografía lucide-react, Skeleton loading,
  validación de rol isAdmin(), y soporte para el nuevo módulo de Programas.
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  UserCheck,
  Users,
  ShieldCheck, // Icono agregado
  LogOut,
  AlertCircle
} from "lucide-react";
import { getUsers, getFichas, getProgramas, clearToken, getStoredUser, isAdmin } from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// Sub-módulos del Administrador
import Resumen from "./admin/Resumen";
import Fichas from "./admin/Fichas";
import Programas from "./admin/Programas";
import Instructores from "./admin/Instructores";
import Usuarios from "./admin/Usuarios";

import Sistema from "./admin/Sistema"; // Componente agregado

import "../styles/Admin.css";

const PESTANAS = [
  { id: "resumen", label: "Resumen", icon: <LayoutDashboard size={18} /> },
  { id: "fichas", label: "Fichas", icon: <ClipboardList size={18} /> },
  { id: "programas", label: "Programas", icon: <BookOpen size={18} /> },
  { id: "instructores", label: "Instructores", icon: <UserCheck size={18} /> },
  { id: "usuarios", label: "Usuarios", icon: <Users size={18} /> },
  { id: "sistema", label: "Sistema", icon: <ShieldCheck size={18} /> }, // Pestaña nueva
];

function Admin() {
  const [users, setUsers] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pestana, setPestana] = useState("resumen");

  const navigate = useNavigate();
  const { theme } = useTheme();
  const admin = getStoredUser();

  const fetchTodo = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, fichasData, programasData] = await Promise.all([
        getUsers(),
        getFichas(),
        getProgramas(),
      ]);
      setUsers(usersData || []);
      setFichas(fichasData || []);
      setProgramas(programasData || []);
    } catch (err) {
      setError(err?.message || "Error al cargar los datos del sistema");
      if (err?.message?.includes("Token")) {
        clearToken();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }
    fetchTodo();
  }, []);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  const logo = theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png";

  return (
    <div className="admin">
      {/* Header General */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src={logo} alt="ZENDA" className="admin-logo" />
          <div>
            <p>Panel de administración</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar Lateral */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                className={`admin-nav-btn ${pestana === p.id ? "active" : ""}`}
                onClick={() => setPestana(p.id)}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer del Sidebar con Usuario y Salir */}
          <div className="admin-sidebar-footer">
            <div className="admin-user">
              <span className="admin-user-name">
                {admin ? `${admin.nombre} ${admin.apellido}` : "Admin"}
              </span>
              <span className="admin-user-email">{admin?.correo}</span>
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

        {/* Contenido Dinámico */}
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
              <div className="dash-grid" style={{ marginBottom: 16 }}>
                <div className="skeleton-box stat-card-skeleton" />
                <div className="skeleton-box stat-card-skeleton" />
                <div className="skeleton-box stat-card-skeleton" />
                <div className="skeleton-box stat-card-skeleton" />
              </div>
              <div className="skeleton-box" style={{ height: 260 }} />
            </div>
          ) : (
            <>
              {pestana === "resumen" && <Resumen users={users} fichas={fichas} programas={programas} />}
              {pestana === "fichas" && <Fichas users={users} fichas={fichas} programas={programas} onDataChanged={fetchTodo} />}
              {pestana === "programas" && <Programas programas={programas} fichas={fichas} onDataChanged={fetchTodo} />}
              {pestana === "instructores" && <Instructores users={users} onDataChanged={fetchTodo} />}
              {pestana === "usuarios" && <Usuarios users={users} onDataChanged={fetchTodo} />}
              {pestana === "sistema" && <Sistema users={users} fichas={fichas} programas={programas} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;