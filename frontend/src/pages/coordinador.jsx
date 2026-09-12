/*
  Panel de coordinador de ZENDA.
  Ámbito: SOLO el programa ADSO (codigo_programa 2338).
  Dos pestañas:
    - "Fichas": listado de solo lectura de las fichas ADSO.
    - "Instructores": listado de instructores; al seleccionar uno se ven
      y modifican las fichas ADSO a las que está vinculado (mismo patrón
      de chips que el panel admin, acotado a ADSO).
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFichasCoordinador,
  getInstructoresCoordinador,
  setFichasInstructorCoordinador,
  clearToken,
  getStoredUser,
} from "../api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { ConfirmPasswordModal } from "../components/admin/Modals";
import "../styles/Admin.css";

function Coordinador() {
  const [pestana, setPestana] = useState("fichas");
  const [fichas, setFichas] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [fichasEdit, setFichasEdit] = useState([]);
  const [nuevaFicha, setNuevaFicha] = useState("");
  const [modalFichas, setModalFichas] = useState(false);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme();
  const coordinador = getStoredUser();

  const fetchTodo = async () => {
    setLoading(true);
    setError("");
    try {
      const [f, i] = await Promise.all([getFichasCoordinador(), getInstructoresCoordinador()]);
      setFichas(f);
      setInstructores(i);
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

  useEffect(() => { fetchTodo(); }, []);

  const seleccionado = instructores.find((u) => u.usuario_id === selectedId) || null;

  const seleccionar = (u) => {
    setSelectedId(u.usuario_id);
    setFichasEdit(u.fichas || []);
    setNuevaFicha("");
  };

  const agregarFicha = () => {
    const f = nuevaFicha.trim();
    if (!f) return;
    const existeEnADSO = fichas.some((fi) => String(fi.numero_ficha) === f);
    if (!existeEnADSO) {
      setError(`La ficha ${f} no existe en tu ámbito (ADSO)`);
      return;
    }
    if (!fichasEdit.includes(f)) setFichasEdit((prev) => [...prev, f].sort());
    setNuevaFicha("");
  };

  const quitarFicha = (f) => setFichasEdit((prev) => prev.filter((x) => x !== f));

  const guardarFichas = async (password) => {
    setCargando(true);
    setError("");
    try {
      await setFichasInstructorCoordinador(selectedId, fichasEdit, password);
      setModalFichas(false);
      await fetchTodo();
    } catch (e) {
      setError(e.message);
      setModalFichas(false);
    } finally {
      setCargando(false);
    }
  };

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
            <p>Panel de coordinador · ADSO</p>
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
              Fichas
            </button>
            <button className={`admin-nav-btn ${pestana === "instructores" ? "active" : ""}`} onClick={() => setPestana("instructores")}>
              Instructores
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user">
              <span className="admin-user-name">
                {coordinador ? `${coordinador.nombre} ${coordinador.apellido}` : "Coordinador"}
              </span>
              <span className="admin-user-email">{coordinador?.correo}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="admin-content">
          {error && <div className="server-error">{error}</div>}

          {loading ? (
            <p>Cargando...</p>
          ) : pestana === "fichas" ? (
            <div>
              <h2>Fichas (ADSO)</h2>
              <p className="admin-hint">Vista de solo lectura de las fichas de tu ámbito.</p>
              {fichas.length === 0 ? (
                <p className="list-vacia">No hay fichas registradas en ADSO.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ficha</th><th>Jornada</th><th>Inicio</th><th>Fin</th>
                      <th>Aprendices</th><th>Instructores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichas.map((f) => (
                      <tr key={f.ficha_id}>
                        <td>{f.numero_ficha}</td>
                        <td>{f.jornada}</td>
                        <td>{f.fecha_inicio}</td>
                        <td>{f.fecha_fin}</td>
                        <td>{f.cantidad_aprendices}</td>
                        <td>{f.cantidad_instructores}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div>
              <h2>Instructores</h2>
              <p className="admin-hint">Selecciona un instructor para ver y modificar sus fichas ADSO vinculadas.</p>

              <div className="panel-split">
                <div className="panel-list">
                  <div className="panel-list-head">
                    <h3 className="panel-list-title">Instructores</h3>
                  </div>
                  {instructores.length === 0 ? (
                    <p className="list-vacia">No hay instructores.</p>
                  ) : (
                    instructores.map((u) => (
                      <button
                        key={u.usuario_id}
                        className={`panel-list-item ${selectedId === u.usuario_id ? "active" : ""}`}
                        onClick={() => seleccionar(u)}
                      >
                        <span className="panel-list-num">{u.nombre} {u.apellido}</span>
                        <span className="panel-list-count">{(u.fichas || []).length}</span>
                      </button>
                    ))
                  )}
                </div>

                <div className="panel-detail">
                  {!seleccionado ? (
                    <div className="panel-empty">Selecciona un instructor del listado.</div>
                  ) : (
                    <>
                      <div className="panel-detail-header">
                        <div>
                          <h3>{seleccionado.nombre} {seleccionado.apellido}</h3>
                          <p className="admin-count">{seleccionado.correo}</p>
                        </div>
                      </div>

                      <div className="instructor-fichas">
                        <h4>Fichas ADSO vinculadas</h4>

                        {fichasEdit.length === 0 ? (
                          <p className="list-vacia">Este instructor no tiene fichas ADSO vinculadas todavía.</p>
                        ) : (
                          <div className="chips-wrap">
                            {fichasEdit.map((f) => (
                              <span key={f} className="chip-ficha chip-ficha-quitable">
                                Ficha {f}
                                <button className="chip-quitar" onClick={() => quitarFicha(f)} title="Quitar ficha">×</button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="add-ficha">
                          <input
                            type="text"
                            className="add-ficha-input"
                            placeholder="Ej: 2724285"
                            value={nuevaFicha}
                            onChange={(e) => setNuevaFicha(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarFicha(); } }}
                          />
                          <button className="btn-accion" onClick={agregarFicha}>Agregar ficha</button>
                        </div>

                        <div className="instructor-fichas-actions">
                          <button className="btn-rol" onClick={() => setModalFichas(true)}>
                            Guardar cambios
                          </button>
                          <span className="admin-count">Pide tu contraseña para guardar</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {modalFichas && seleccionado && (
        <ConfirmPasswordModal
          titulo="Guardar fichas vinculadas"
          mensaje={`Vas a guardar ${fichasEdit.length} ficha(s) ADSO para ${seleccionado.nombre} ${seleccionado.apellido}. Confirma con tu contraseña.`}
          textoBoton="Guardar fichas"
          cargando={cargando}
          onConfirmar={guardarFichas}
          onCerrar={() => setModalFichas(false)}
        />
      )}
    </div>
  );
}

export default Coordinador;