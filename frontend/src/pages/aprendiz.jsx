/*
  Panel de aprendiz de ZENDA.
  Mismo patrón que instructor.jsx: header + sidebar con pestañas + contenido.
  Al entrar, consulta si el aprendiz ya pertenece a un proyecto activo:
    - Si NO tiene proyecto: según su sub_rol_intencion (elegido al registrarse)
      muestra SOLO el formulario de crear (Scrum Master) o SOLO el de unirse
      (Product Owner / Developer). También puede corregir su ficha aquí,
      mientras no tenga proyecto activo.
    - Si SÍ tiene proyecto: sidebar con 3 pestañas (Mi proyecto, Fases,
      Observaciones), cada una en su propio componente.
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMiProyectoAprendiz,
  crearProyectoAprendiz,
  unirseProyectoAprendiz,
  getFichasPublicas,
  cambiarMiFicha,
  clearToken,
  getStoredUser,
} from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import MiProyecto from "./aprendiz/MiProyecto";
import Fases from "./aprendiz/Fases";
import Observaciones from "./aprendiz/Observaciones";
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
  const [datos, setDatos] = useState(null); // { grupo, proyecto, integrantes, fases }
  const [pestana, setPestana] = useState("proyecto"); // "proyecto" | "fases" | "observaciones"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [form, setForm] = useState(FORM_INICIAL);
  const [codigo, setCodigo] = useState("");

  // Fichas disponibles (ADSO) para el selector de "cambiar mi ficha"
  const [fichasDisponibles, setFichasDisponibles] = useState([]);

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
    fetchMiProyecto();
  }, []);

  // Solo se necesitan las fichas públicas mientras el aprendiz no tiene proyecto
  useEffect(() => {
    if (!loading && !datos) {
      getFichasPublicas().then(setFichasDisponibles).catch(() => setFichasDisponibles([]));
    }
  }, [loading, datos]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    try {
      const data = await crearProyectoAprendiz(form);
      setExito(`Proyecto creado. Código de invitación: ${data.codigo_grupo}`);
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
      e.target.value = ""; // resetea el select a la opción "placeholder"
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

  // El líder del grupo es quien puede crear carpetas / subir evidencias
  const esLider = datos && aprendiz && datos.grupo.lider_id === aprendiz.usuario_id;

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src={logo} alt="ZENDA" className="admin-logo" />
          <div>
            <h1>ZENDA</h1>
            <p>Panel de aprendiz</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {datos && (
              <>
                <button className={`admin-nav-btn ${pestana === "proyecto" ? "active" : ""}`} onClick={() => setPestana("proyecto")}>
                  Mi proyecto
                </button>
                <button className={`admin-nav-btn ${pestana === "fases" ? "active" : ""}`} onClick={() => setPestana("fases")}>
                  Fases
                </button>
                <button className={`admin-nav-btn ${pestana === "observaciones" ? "active" : ""}`} onClick={() => setPestana("observaciones")}>
                  Observaciones
                </button>
              </>
            )}
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
          {error && <div className="server-error">{error}</div>}
          {exito && <div className="server-exito">{exito}</div>}

          {loading ? (
            <p>Cargando...</p>
          ) : datos ? (
            // ---------- Ya tiene proyecto: pestañas ----------
            pestana === "proyecto" ? (
              <MiProyecto datos={datos} />
            ) : pestana === "fases" ? (
              <Fases fases={datos.fases} esLider={esLider} />
            ) : (
              <Observaciones />
            )
          ) : (
            // ---------- No tiene proyecto: según sub_rol_intencion ----------
            <>
              {/* Corrección de ficha: solo visible mientras no hay proyecto activo */}
              <div className="panel-empty" style={{ marginBottom: 16, textAlign: "left" }}>
                <p className="admin-hint" style={{ marginBottom: 8 }}>
                  ¿Te equivocaste de ficha al registrarte? Puedes corregirla aquí mientras no tengas un proyecto activo.
                </p>
                <select
                  className="modal-select"
                  onChange={handleCambiarFicha}
                  defaultValue=""
                >
                  <option value="">Cambiar ficha...</option>
                  {fichasDisponibles.map((f) => (
                    <option key={f.ficha_id} value={f.numero_ficha}>
                      {f.numero_ficha} — {f.jornada}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-split">
                {aprendiz?.sub_rol_intencion === "Scrum Master" ? (
                  <div className="panel-detail">
                    <h3>Crear un grupo de proyecto</h3>
                    <p className="admin-hint">Quedarás como Scrum Master (líder) del grupo.</p>
                    <form onSubmit={handleCrear}>
                      <label className="modal-label">Nombre del grupo</label>
                      <input className="modal-input" required value={form.nombre_grupo}
                        onChange={(e) => setForm({ ...form, nombre_grupo: e.target.value })} />

                      <label className="modal-label">Nombre del proyecto</label>
                      <input className="modal-input" required value={form.nombre_proyecto}
                        onChange={(e) => setForm({ ...form, nombre_proyecto: e.target.value })} />

                      <label className="modal-label">Descripción</label>
                      <input className="modal-input" required value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

                      <label className="modal-label">Problema</label>
                      <input className="modal-input" required value={form.problema}
                        onChange={(e) => setForm({ ...form, problema: e.target.value })} />

                      <label className="modal-label">Objetivo</label>
                      <input className="modal-input" required value={form.objetivo}
                        onChange={(e) => setForm({ ...form, objetivo: e.target.value })} />

                      <label className="modal-label">Alcance</label>
                      <input className="modal-input" required value={form.alcance}
                        onChange={(e) => setForm({ ...form, alcance: e.target.value })} />

                      <label className="modal-label">Tecnologías (opcional)</label>
                      <input className="modal-input" value={form.tecnologias}
                        onChange={(e) => setForm({ ...form, tecnologias: e.target.value })} />

                      <div className="modal-grid">
                        <div>
                          <label className="modal-label">Fecha de inicio</label>
                          <input className="modal-input" type="date" required value={form.fecha_inicio}
                            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
                        </div>
                        <div>
                          <label className="modal-label">Fecha fin estimada</label>
                          <input className="modal-input" type="date" required value={form.fecha_fin_estimada}
                            onChange={(e) => setForm({ ...form, fecha_fin_estimada: e.target.value })} />
                        </div>
                      </div>

                      <button className="btn-rol" type="submit">Crear proyecto</button>
                    </form>
                  </div>
                ) : (
                  <div className="panel-detail">
                    <h3>Unirme a un grupo existente</h3>
                    <p className="admin-hint">Pídele el código de invitación al Scrum Master del grupo.</p>
                    <form onSubmit={handleUnirse}>
                      <label className="modal-label">Código de invitación</label>
                      <input className="modal-input" required value={codigo}
                        onChange={(e) => setCodigo(e.target.value)} placeholder="PRY-XXXXXX" />

                      {/* Ya no se elige rol: viene fijo de su registro */}
                      <p className="admin-hint">
                        Te unirás como: <strong>{aprendiz?.sub_rol_intencion || "Developer"}</strong>
                      </p>

                      <button className="btn-rol" type="submit">Unirme</button>
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