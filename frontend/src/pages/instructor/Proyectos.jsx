/*
  Sección "Grupos de proyecto" del panel de instructor.
  Refactorizado UI/UX: Buscador centrado, Matriz de salud, TopBar holgado,
  Modal de Revisión Rápida de Evidencias (Paso 2) y Exportador a PDF de Ficha (Paso 3).
*/

import { useState, useEffect } from "react";
import {
  Briefcase,
  Layers,
  FileText,
  Target,
  AlertCircle,
  Compass,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Send,
  AlertTriangle,
  Clock,
  Inbox,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Printer,
  X
} from "lucide-react";
import {
  getGruposDeFicha,
  getReadmeProyecto,
  getCarpetasDeFase,
  evaluarEvidencia,
  getObservacionesProyecto,
  crearObservacion,
  getEvidenciasFicha
} from "../../api";

function Proyectos({ fichas = [], fichaSeleccionada, setFichaSeleccionada }) {
  const [grupos, setGrupos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [readme, setReadme] = useState(null);
  const [faseSeleccionada, setFaseSeleccionada] = useState(null);
  const [carpetas, setCarpetas] = useState([]);
  const [observaciones, setObservaciones] = useState([]);
  const [tituloObs, setTituloObs] = useState("");
  const [descripcionObs, setDescripcionObs] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProyecto, setLoadingProyecto] = useState(false);

  // Estados para Modal de Revisión Rápida
  const [mostrarModalRapido, setMostrarModalRapido] = useState(false);
  const [evidenciasPendientes, setEvidenciasPendientes] = useState([]);
  const [indiceModal, setIndiceModal] = useState(0);

  useEffect(() => {
    if (!fichaSeleccionada) return;
    setGrupoSeleccionado(null);
    setReadme(null);
    setFaseSeleccionada(null);
    setCarpetas([]);
    setObservaciones([]);
    setBusqueda("");
    setLoading(true);
    getGruposDeFicha(fichaSeleccionada.ficha_id)
      .then((data) => setGrupos(data || []))
      .catch((err) => setError(err?.message || "Error al obtener los grupos"))
      .finally(() => setLoading(false));
  }, [fichaSeleccionada]);

  const seleccionarGrupo = async (grupo) => {
    setGrupoSeleccionado(grupo);
    setFaseSeleccionada(null);
    setCarpetas([]);
    setError("");
    setLoadingProyecto(true);
    try {
      const [data, obs] = await Promise.all([
        getReadmeProyecto(grupo.proyecto_id),
        getObservacionesProyecto(grupo.proyecto_id),
      ]);
      setReadme(data);
      setObservaciones(obs || []);
    } catch (err) {
      setError(err?.message || "Error al cargar el proyecto");
    } finally {
      setLoadingProyecto(false);
    }
  };

  const publicarObservacion = async (e) => {
    e.preventDefault();
    if (!tituloObs.trim() || !descripcionObs.trim()) return;
    try {
      await crearObservacion(grupoSeleccionado.proyecto_id, tituloObs, descripcionObs);
      const obs = await getObservacionesProyecto(grupoSeleccionado.proyecto_id);
      setObservaciones(obs || []);
      setTituloObs("");
      setDescripcionObs("");
    } catch (err) {
      setError(err?.message || "Error al publicar la observación");
    }
  };

  const verListaDeChequeo = async (fase) => {
    setFaseSeleccionada(fase);
    setError("");
    try {
      const data = await getCarpetasDeFase(fase.fase_id);
      setCarpetas(data || []);
    } catch (err) {
      setError(err?.message || "Error al cargar la lista de chequeo");
    }
  };

  const calificar = async (evidenciaId, resultado) => {
    try {
      const data = await evaluarEvidencia(evidenciaId, resultado);

      if (readme && faseSeleccionada) {
        setReadme((prev) => ({
          ...prev,
          fases: prev.fases.map((f) =>
            f.fase_id === faseSeleccionada.fase_id ? { ...f, estado_fase: data.estado_fase } : f
          ),
        }));
        setFaseSeleccionada((prev) => ({ ...prev, estado_fase: data.estado_fase }));
        const carpetasActualizadas = await getCarpetasDeFase(faseSeleccionada.fase_id);
        setCarpetas(carpetasActualizadas || []);
      }
    } catch (err) {
      setError(err?.message || "Error al evaluar la evidencia");
    }
  };

  // Abrir Modal de Revisión Rápida
  const abrirRevisionRapida = async () => {
    if (!fichaSeleccionada) return;
    try {
      const todas = await getEvidenciasFicha(fichaSeleccionada.ficha_id);
      const sinEvaluar = (todas || []).filter((e) => !e.resultado || e.resultado === "Sin evaluar");
      setEvidenciasPendientes(sinEvaluar);
      setIndiceModal(0);
      setMostrarModalRapido(true);
    } catch (err) {
      setError(err?.message || "Error al cargar evidencias pendientes");
    }
  };

  const calificarEnModal = async (resultado) => {
    const evActual = evidenciasPendientes[indiceModal];
    if (!evActual) return;
    await calificar(evActual.evidencia_id, resultado);
    const restantes = evidenciasPendientes.filter((_, idx) => idx !== indiceModal);
    setEvidenciasPendientes(restantes);
    if (indiceModal >= restantes.length) {
      setIndiceModal(Math.max(0, restantes.length - 1));
    }
  };

  const handleExportarPDF = () => {
    window.print();
  };

  const gruposFiltrados = grupos.filter((g) =>
    g.nombre_grupo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularSaludGrupo = (estadoProyecto) => {
    if (estadoProyecto === "Desaprobada" || estadoProyecto === "Crítico") {
      return { nivel: "rojo", etiqueta: "En Riesgo", icono: <ShieldAlert size={10} /> };
    }
    if (estadoProyecto === "Pendiente") {
      return { nivel: "amarillo", etiqueta: "Pendiente", icono: <Clock size={10} /> };
    }
    return { nivel: "verde", etiqueta: "Al día", icono: <ShieldCheck size={10} /> };
  };

  const renderBadgeResultado = (resultado) => {
    if (resultado === "APROBADO") {
      return (
        <span className="badge-evidencia entregado" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <CheckCircle2 size={12} /> APROBADO
        </span>
      );
    }
    if (resultado === "REPROBADO") {
      return (
        <span className="badge-evidencia reprobado" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <XCircle size={12} /> REPROBADO
        </span>
      );
    }
    return (
      <span className="badge-evidencia pendiente" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Clock size={12} /> Sin evaluar
      </span>
    );
  };

  return (
    <div>
      {/* TOPBAR LIMPIO: FICHA EN EVALUACIÓN + HERRAMIENTAS */}
      <div className="topbar-ficha-container">
        {/* Lado Izquierdo: Ficha en Evaluación + Desplegable */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "rgba(9, 132, 227, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
            flexShrink: 0
          }}>
            <Layers size={20} />
          </div>

          <div>
            <h3 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700 }}>
              Ficha en Evaluación
            </h3>
            {fichas.length > 0 && (
              <select
                className="modal-select topbar-ficha-select"
                style={{ display: "block", marginTop: 2 }}
                value={fichaSeleccionada?.ficha_id || ""}
                onChange={(e) =>
                  setFichaSeleccionada(fichas.find((f) => f.ficha_id === Number(e.target.value)))
                }
              >
                {fichas.map((f) => (
                  <option key={f.ficha_id} value={f.ficha_id}>
                    Ficha {f.numero_ficha} — {f.jornada}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Lado Derecho: Herramientas de Acción */}
        <div className="topbar-ficha-actions">
          <button
            className="btn-accion"
            onClick={abrirRevisionRapida}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38 }}
          >
            <Zap size={14} style={{ color: "#f59e0b" }} /> Revisión Rápida
          </button>

          <button
            className="btn-rol"
            onClick={handleExportarPDF}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px" }}
          >
            <Printer size={14} /> Reporte PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="server-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* MODAL DE REVISIÓN RÁPIDA (PASO 2) */}
      {mostrarModalRapido && (
        <div className="modal-overlay">
          <div className="modal-content-lg">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={20} style={{ color: "#f59e0b" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Revisión Rápida de Evidencias</h3>
              </div>
              <button
                onClick={() => setMostrarModalRapido(false)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {evidenciasPendientes.length === 0 ? (
              <div className="fases-empty-state" style={{ padding: "30px 0" }}>
                <CheckCircle2 size={40} style={{ color: "#00b894" }} />
                <p style={{ margin: 0, fontWeight: 600 }}>¡No hay evidencias pendientes por evaluar en esta ficha!</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  <span>Evidencia {indiceModal + 1} de {evidenciasPendientes.length} pendientes</span>
                  <span>Grupo: <strong>{evidenciasPendientes[indiceModal]?.nombre_grupo}</strong></span>
                </div>

                <div className="bloque-separado" style={{ margin: 0, background: "var(--surface, rgba(128,128,128,0.06))" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "1rem" }}>
                    {evidenciasPendientes[indiceModal]?.nombre_evidencia}
                  </h4>
                  <p style={{ margin: "0 0 12px", fontSize: "0.84rem", color: "var(--color-text-muted)" }}>
                    Fase: <strong>{evidenciasPendientes[indiceModal]?.nombre_fase}</strong>
                  </p>
                  <a
                    href={evidenciasPendientes[indiceModal]?.ubicacion}
                    target="_blank"
                    rel="noreferrer"
                    className="evidencia-link"
                    style={{ fontSize: "0.9rem" }}
                  >
                    <FileText size={16} /> Abrir recurso enviado <ExternalLink size={14} />
                  </a>
                </div>

                <div className="modal-actions" style={{ marginTop: 10 }}>
                  <button
                    className="btn-accion btn-accion-danger"
                    style={{ flex: 1, padding: "10px 14px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    onClick={() => calificarEnModal("REPROBADO")}
                  >
                    <XCircle size={16} /> Reprobar
                  </button>
                  <button
                    className="btn-rol"
                    style={{ flex: 1, padding: "10px 14px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    onClick={() => calificarEnModal("APROBADO")}
                  >
                    <CheckCircle2 size={16} /> Aprobar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PANEL SPLIT */}
      <div className="panel-split">
        {/* Lista de Grupos */}
        <div className="panel-list">
          <p className="panel-list-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Briefcase size={14} /> Grupos de Proyecto ({gruposFiltrados.length})
          </p>

          {/* Buscador de Grupos con icono centrado */}
          <div className="search-box-wrap">
            <span className="search-box-icon">
              <Search size={14} />
            </span>
            <input
              className="modal-input"
              placeholder="Buscar grupo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding: 10 }}>
              <div className="skeleton-box" style={{ height: 40, marginBottom: 8 }} />
              <div className="skeleton-box" style={{ height: 40 }} />
            </div>
          ) : gruposFiltrados.length === 0 ? (
            <div className="list-vacia-container" style={{ padding: "20px 0" }}>
              <Inbox size={24} />
              <p className="list-vacia" style={{ padding: 0 }}>Sin coincidencias.</p>
            </div>
          ) : (
            gruposFiltrados.map((g) => {
              const salud = calcularSaludGrupo(g.estado_proyecto);
              return (
                <button
                  key={g.grupo_id}
                  className={`panel-list-item ${grupoSeleccionado?.grupo_id === g.grupo_id ? "active" : ""}`}
                  onClick={() => seleccionarGrupo(g)}
                >
                  <span style={{ fontWeight: 600 }}>{g.nombre_grupo}</span>
                  <span className={`health-badge ${salud.nivel}`}>
                    {salud.icono}
                    {salud.etiqueta}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Detalle y README del Proyecto */}
        <div className="panel-detail">
          {!grupoSeleccionado ? (
            <div className="fases-empty-state">
              <Briefcase size={40} opacity={0.4} />
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Selecciona un grupo</h4>
                <p style={{ margin: 0, fontSize: "0.82rem" }}>
                  Elige un grupo de la lista lateral para auditar el README de su proyecto y calificar fases.
                </p>
              </div>
            </div>
          ) : loadingProyecto ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="skeleton-box" style={{ height: 40, width: "50%" }} />
              <div className="skeleton-box" style={{ height: 180 }} />
              <div className="skeleton-box" style={{ height: 220 }} />
            </div>
          ) : !readme ? null : (
            <>
              {/* Header del Proyecto */}
              <div className="panel-detail-header" style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>{readme.proyecto.nombre_proyecto}</h3>
              </div>

              {/* Grid del README */}
              <div className="dash-grid-2" style={{ marginBottom: 20 }}>
                <div className="bloque-separado" style={{ margin: 0 }}>
                  <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} /> Descripción
                  </p>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.6", opacity: 0.9 }}>
                    {readme.proyecto.descripcion}
                  </p>
                </div>

                <div className="bloque-separado" style={{ margin: 0 }}>
                  <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={16} /> Problema
                  </p>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.6", opacity: 0.9 }}>
                    {readme.proyecto.problema}
                  </p>
                </div>

                <div className="bloque-separado" style={{ margin: 0 }}>
                  <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Target size={16} /> Objetivo
                  </p>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.6", opacity: 0.9 }}>
                    {readme.proyecto.objetivo}
                  </p>
                </div>

                <div className="bloque-separado" style={{ margin: 0 }}>
                  <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Compass size={16} /> Alcance
                  </p>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.6", opacity: 0.9 }}>
                    {readme.proyecto.alcance}
                  </p>
                </div>
              </div>

              {/* Integrantes del Grupo */}
              <div className="bloque-separado" style={{ marginBottom: 20 }}>
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Users size={16} /> Integrantes del Equipo
                </p>
                <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol Scrum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readme.integrantes.map((i, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{i.nombre} {i.apellido}</td>
                          <td style={{ opacity: 0.85 }}>{i.correo}</td>
                          <td>
                            <span className="proyecto-header-badge" style={{ fontSize: "0.72rem" }}>
                              {i.rol_scrum || "Developer"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla de Fases */}
              <div className="bloque-separado" style={{ marginBottom: 20 }}>
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Layers size={16} /> Fases del Proyecto y Calificación
                </p>
                <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Fase</th>
                        <th>Estado Actual</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readme.fases.map((f) => (
                        <tr key={f.fase_id}>
                          <td style={{ fontWeight: 600 }}>{f.nombre_fase}</td>
                          <td>
                            <span className={`badge-fase ${f.estado_fase === "Desaprobada" ? "desaprobada" : f.estado_fase === "Aprobada" ? "aprobada" : ""}`}>
                              {f.estado_fase}
                            </span>
                          </td>
                          <td>
                            <button className="btn-accion" onClick={() => verListaDeChequeo(f)}>
                              Ver lista de chequeo
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alerta de Desaprobación */}
              {faseSeleccionada && faseSeleccionada.estado_fase === "Desaprobada" && (
                <div className="server-error" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertTriangle size={18} />
                  <span>La fase "{faseSeleccionada.nombre_fase}" ha sido desaprobada por evidencias reprobadas.</span>
                </div>
              )}

              {/* Lista de Chequeo y Evaluador */}
              {faseSeleccionada && (
                <div className="bloque-separado" style={{ marginBottom: 20, background: "var(--surface, rgba(128,128,128,0.06))" }}>
                  <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <CheckCircle2 size={16} /> Lista de chequeo — {faseSeleccionada.nombre_fase}
                  </p>

                  {carpetas.length === 0 ? (
                    <p className="list-vacia">Esta fase no tiene carpetas creadas por el equipo.</p>
                  ) : (
                    carpetas.map((c) => (
                      <div key={c.carpeta_id} style={{ marginBottom: 16 }}>
                        <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem" }}>{c.nombre_carpeta}</h4>
                        <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Evidencia</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Evaluación</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.evidencias.map((e) => (
                                <tr key={e.evidencia_id}>
                                  <td>
                                    <a href={e.ubicacion} target="_blank" rel="noreferrer" className="evidencia-link">
                                      <FileText size={14} />
                                      <span>{e.nombre_evidencia}</span>
                                      <ExternalLink size={12} />
                                    </a>
                                  </td>
                                  <td>{e.tipo_evidencia}</td>
                                  <td>{renderBadgeResultado(e.resultado)}</td>
                                  <td>
                                    <div style={{ display: "flex", gap: 6 }}>
                                      <button
                                        className="btn-rol"
                                        style={{ padding: "4px 8px", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                                        onClick={() => calificar(e.evidencia_id, "APROBADO")}
                                      >
                                        <CheckCircle2 size={12} /> Aprobar
                                      </button>
                                      <button
                                        className="btn-accion btn-accion-danger"
                                        style={{ padding: "4px 8px", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                                        onClick={() => calificar(e.evidencia_id, "REPROBADO")}
                                      >
                                        <XCircle size={12} /> Reprobar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Panel de Observaciones */}
              <div className="bloque-separado">
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <MessageSquare size={16} /> Publicar Observación al Grupo
                </p>

                <form onSubmit={publicarObservacion} style={{ marginBottom: 20 }}>
                  <input
                    className="modal-input"
                    placeholder="Título de la observación"
                    value={tituloObs}
                    onChange={(e) => setTituloObs(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <textarea
                    className="modal-input"
                    placeholder="Escribe la retroalimentación técnica o metodológica..."
                    rows={3}
                    value={descripcionObs}
                    onChange={(e) => setDescripcionObs(e.target.value)}
                    style={{ marginBottom: 10, resize: "vertical" }}
                  />
                  <button className="btn-rol" type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Send size={14} /> Publicar observación
                  </button>
                </form>

                <p className="dash-section-title" style={{ fontSize: "0.85rem", marginBottom: 10 }}>
                  Historial de observaciones ({observaciones.length})
                </p>

                {observaciones.length === 0 ? (
                  <p className="list-vacia" style={{ padding: 0 }}>Sin observaciones aún.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {observaciones.map((o) => (
                      <div key={o.observacion_id} className="observacion-card" style={{ padding: 12, background: "var(--surface, rgba(128,128,128,0.06))", borderRadius: 8 }}>
                        <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>{o.titulo}</h4>
                        <p style={{ margin: 0, fontSize: "0.84rem", opacity: 0.9 }}>{o.descripcion}</p>
                        <p className="admin-user-email" style={{ marginTop: 6, marginBottom: 0 }}>
                          {o.nombre} {o.apellido} — {new Date(o.fecha_observacion).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Proyectos;