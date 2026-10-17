/*
  Panel de Aprendiz de ZENDA.
  UI/UX Refinado: Formulario centrado para Scrum Master, validación de inputs,
  restricciones de longitud para documentos de identidad e iconografía lucide-react.
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMiProyectoAprendiz,
  crearProyectoAprendiz,
  unirseProyectoAprendiz,
  getFichasPublicas,
  cambiarMiFicha,
  getMiFichaActual,
  clearToken,
  getStoredUser,
} from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import MiProyecto from "./aprendiz/MiProyecto";
import Fases from "./aprendiz/Fases";
import Observaciones from "./aprendiz/Observaciones";
import Tareas from "./aprendiz/Tareas";
import Resumen from "./aprendiz/Resumen";
import Equipo from "./aprendiz/Equipo";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Layers, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  PlusCircle, 
  UserPlus, 
  AlertCircle 
} from "lucide-react";
import "../styles/Admin.css";
import "../styles/Instructor.css";

const FORM_INICIAL = {
  nombre_grupo: "",
  nombre_proyecto: "",
  descripcion: "",
  problema: "",
  objetivo: "",
  alcance: "",
  tecnologias: "",
  fecha_inicio: "",
  fecha_fin_estimada: "",
};

function Aprendiz() {
  const [datos, setDatos] = useState(null);
  const [pestana, setPestana] = useState("resumen");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [form, setForm] = useState(FORM_INICIAL);
  const [codigo, setCodigo] = useState("");

  const [fichasDisponibles, setFichasDisponibles] = useState([]);
  const [fichaActual, setFichaActual] = useState(null);

  const navigate = useNavigate();
  const { theme } = useTheme();
  const aprendiz = getStoredUser();

  const fetchMiProyecto = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMiProyectoAprendiz();
      setDatos(data);
    } catch (err) {
      setError(err?.message || "Error al cargar el proyecto");
      if (err?.message?.includes("Token")) {
        clearToken();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiProyecto();
  }, []);

  useEffect(() => {
    if (!loading && !datos) {
      getFichasPublicas().then(setFichasDisponibles).catch(() => setFichasDisponibles([]));
      getMiFichaActual().then((r) => setFichaActual(r?.numero_ficha || null)).catch(() => setFichaActual(null));
    }
  }, [loading, datos]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    try {
      const data = await crearProyectoAprendiz(form);
      setExito(`Proyecto creado con éxito. Código de invitación: ${data.codigo_grupo}`);
      setForm(FORM_INICIAL);
      await fetchMiProyecto();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnirse = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    try {
      await unirseProyectoAprendiz(codigo, aprendiz?.sub_rol_intencion || "Developer");
      setCodigo("");
      await fetchMiProyecto();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCambiarFicha = async (e) => {
    const numeroFicha = e.target.value;
    if (!numeroFicha) return;
    setError("");
    setExito("");
    try {
      await cambiarMiFicha(numeroFicha);
      setExito("Ficha actualizada correctamente");
      setFichaActual(Number(numeroFicha));
      e.target.value = "";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("zenda-user");
    navigate("/login");
  };

  const logo = theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png";
  const esLider = datos && aprendiz && datos.grupo.lider_id === aprendiz.usuario_id;

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src={logo} alt="ZENDA" className="admin-logo" />
          <div>
            <h1></h1>
            <p>Panel de Aprendiz</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button className={`admin-nav-btn ${pestana === "resumen" ? "active" : ""}`} onClick={() => setPestana("resumen")}>
              <LayoutDashboard size={18} />
              <span>Resumen</span>
            </button>
            <button className={`admin-nav-btn ${pestana === "proyecto" ? "active" : ""}`} onClick={() => setPestana("proyecto")}>
              <FolderGit2 size={18} />
              <span>Mi proyecto</span>
            </button>
            <button className={`admin-nav-btn ${pestana === "equipo" ? "active" : ""}`} onClick={() => setPestana("equipo")}>
              <Users size={18} />
              <span>Equipo</span>
            </button>
            <button className={`admin-nav-btn ${pestana === "fases" ? "active" : ""}`} onClick={() => setPestana("fases")}>
              <Layers size={18} />
              <span>Fases</span>
            </button>
            <button className={`admin-nav-btn ${pestana === "observaciones" ? "active" : ""}`} onClick={() => setPestana("observaciones")}>
              <MessageSquare size={18} />
              <span>Observaciones</span>
            </button>
            <button className={`admin-nav-btn ${pestana === "tareas" ? "active" : ""}`} onClick={() => setPestana("tareas")}>
              <CheckSquare size={18} />
              <span>Tareas</span>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user">
              <span className="admin-user-name">
                {aprendiz ? `${aprendiz.nombre} ${aprendiz.apellido}` : "Aprendiz"}
              </span>
              <span className="admin-user-email">{aprendiz?.correo}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="admin-content">
          {error && <div className="server-error" style={{ marginBottom: 16 }}><AlertCircle size={16} /> {error}</div>}
          {exito && <div className="server-exito" style={{ marginBottom: 16 }}>{exito}</div>}

          {loading ? (
            <div className="skeleton-box" style={{ height: 300, width: "100%" }} />
          ) : datos ? (
            pestana === "resumen" ? <Resumen fases={datos.fases} /> :
            pestana === "proyecto" ? <MiProyecto datos={datos} /> :
            pestana === "equipo" ? <Equipo integrantes={datos.integrantes} grupo={datos.grupo} /> :
            pestana === "fases" ? <Fases fases={datos.fases} esLider={esLider} /> :
            pestana === "tareas" ? <Tareas esLider={esLider} integrantes={datos.integrantes} usuarioId={aprendiz?.usuario_id} /> :
            <Observaciones />
          ) : (
            <>
              {/* Corrección contextual de ficha */}
              <div className="bloque-separado" style={{ marginBottom: 20, maxWidth: 580, margin: "0 auto 20px" }}>
                <p className="admin-hint" style={{ marginBottom: 10 }}>
                  {fichaActual
                    ? <>Tu ficha actual registrada es la <strong>{fichaActual}</strong>. Si necesitas hacer una corrección, elígela a continuación:</>
                    : "Selecciona tu ficha asignada para continuar:"}
                </p>
                <select className="modal-select" onChange={handleCambiarFicha} defaultValue="">
                  <option value="">Cambiar ficha...</option>
                  {fichasDisponibles
                    .filter((f) => f.numero_ficha !== fichaActual)
                    .map((f) => (
                      <option key={f.ficha_id} value={f.numero_ficha}>
                        Ficha {f.numero_ficha} — {f.jornada}
                      </option>
                    ))}
                </select>
              </div>

              {/* CONTENEDOR CENTRADO Y COMPACTO DE FORMULARIO */}
              <div style={{ maxWidth: 580, margin: "0 auto" }}>
                {aprendiz?.sub_rol_intencion === "Scrum Master" ? (
                  <div className="bloque-separado" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <PlusCircle size={22} style={{ color: "var(--color-primary)" }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Crear Grupo de Proyecto</h3>
                        <span className="admin-count" style={{ fontSize: "0.78rem" }}>
                          Asumirás el rol de Scrum Master (Líder de célula)
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleCrear}>
                      <label className="modal-label">Nombre del Grupo</label>
                      <input className="modal-input" required value={form.nombre_grupo}
                        onChange={(e) => setForm({ ...form, nombre_grupo: e.target.value })} placeholder="Ej: Célula Alpha ADSO" style={{ marginBottom: 10 }} />

                      <label className="modal-label">Nombre del Proyecto</label>
                      <input className="modal-input" required value={form.nombre_proyecto}
                        onChange={(e) => setForm({ ...form, nombre_proyecto: e.target.value })} placeholder="Ej: Sistema ZENDA" style={{ marginBottom: 10 }} />

                      <label className="modal-label">Descripción Ejecutiva (Máx. 500 caract.)</label>
                      <textarea className="modal-input" maxLength={500} rows={3} required value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Resumen del proyecto..." style={{ marginBottom: 10, resize: "vertical" }} />

                      <div className="modal-grid" style={{ marginBottom: 10 }}>
                        <div>
                          <label className="modal-label">Problema a Resolver</label>
                          <input className="modal-input" maxLength={500} required value={form.problema}
                            onChange={(e) => setForm({ ...form, problema: e.target.value })} placeholder="Problema identificado" />
                        </div>
                        <div>
                          <label className="modal-label">Objetivo Principal</label>
                          <input className="modal-input" maxLength={500} required value={form.objetivo}
                            onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="Objetivo de desarrollo" />
                        </div>
                      </div>

                      <label className="modal-label">Alcance</label>
                      <input className="modal-input" maxLength={500} required value={form.alcance}
                        onChange={(e) => setForm({ ...form, alcance: e.target.value })} placeholder="Delimitación de entregables" style={{ marginBottom: 10 }} />

                      <label className="modal-label">Tecnologías (Opcional)</label>
                      <input className="modal-input" maxLength={300} value={form.tecnologias}
                        onChange={(e) => setForm({ ...form, tecnologias: e.target.value })} placeholder="Ej: React, Node.js, PostgreSQL" style={{ marginBottom: 12 }} />

                      <div className="modal-grid" style={{ marginBottom: 16 }}>
                        <div>
                          <label className="modal-label">Fecha de Inicio</label>
                          <input className="modal-input" type="date" required value={form.fecha_inicio}
                            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
                        </div>
                        <div>
                          <label className="modal-label">Fecha Fin Estimada</label>
                          <input className="modal-input" type="date" required value={form.fecha_fin_estimada}
                            onChange={(e) => setForm({ ...form, fecha_fin_estimada: e.target.value })} />
                        </div>
                      </div>

                      <button className="btn-rol" type="submit" style={{ width: "100%", height: 40 }}>
                        Crear e Iniciar Proyecto
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bloque-separado" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <UserPlus size={22} style={{ color: "var(--color-primary)" }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Unirme a un Grupo Existente</h3>
                        <span className="admin-count" style={{ fontSize: "0.78rem" }}>
                          Solicita el código al Scrum Master de tu célula
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleUnirse}>
                      <label className="modal-label">Código de Invitación</label>
                      <input 
                        className="modal-input" 
                        required 
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)} 
                        placeholder="PRY-XXXXXX" 
                        style={{ marginBottom: 14, textTransform: "uppercase" }}
                      />

                      <div className="ficha-dates-badge" style={{ display: "block", textAlign: "center", marginBottom: 16, padding: "8px 12px" }}>
                        Rol asignado: <strong>{aprendiz?.sub_rol_intencion || "Developer"}</strong>
                      </div>

                      <button className="btn-rol" type="submit" style={{ width: "100%", height: 40 }}>
                        Unirme al Proyecto
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Aprendiz;