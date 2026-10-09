/*
  Sección "Mis fichas" del panel de instructor.
  Refactorizado UI/UX: Skeleton Loader al cambiar de ficha, badges estilizados 
  para resultados de evaluación, enlaces con iconografía y tarjetas delimitadas.
*/

import { useState } from "react";
import { 
  Layers, 
  Users, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Inbox, 
  AlertCircle 
} from "lucide-react";
import { getAprendicesFicha, getEvidenciasFicha } from "../../api";

function MisFichas({ fichas = [] }) {
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [aprendices, setAprendices] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState("");

  const seleccionarFicha = async (ficha) => {
    setFichaSeleccionada(ficha);
    setError("");
    setLoadingDetalle(true);
    try {
      const [aprendicesData, evidenciasData] = await Promise.all([
        getAprendicesFicha(ficha.ficha_id),
        getEvidenciasFicha(ficha.ficha_id),
      ]);
      setAprendices(aprendicesData || []);
      setEvidencias(evidenciasData || []);
    } catch (err) {
      setError(err?.message || "Error al obtener la información de la ficha");
    } finally {
      setLoadingDetalle(false);
    }
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
      {error && (
        <div className="server-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="panel-split">
        {/* Lista de fichas asignadas */}
        <div className="panel-list">
          <p className="panel-list-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={14} /> Fichas asignadas
          </p>
          {fichas.length === 0 && (
            <div className="list-vacia-container" style={{ padding: "20px 0" }}>
              <Inbox size={24} />
              <p className="list-vacia" style={{ padding: 0 }}>No tienes fichas asignadas.</p>
            </div>
          )}
          {fichas.map((f) => (
            <button
              key={f.ficha_id}
              className={`panel-list-item ${fichaSeleccionada?.ficha_id === f.ficha_id ? "active" : ""}`}
              onClick={() => seleccionarFicha(f)}
            >
              <span style={{ fontWeight: 600 }}>Ficha {f.numero_ficha}</span>
              <span className="ficha-badge">{f.jornada}</span>
            </button>
          ))}
        </div>

        {/* Detalle de la ficha seleccionada */}
        <div className="panel-detail">
          {!fichaSeleccionada ? (
            <div className="fases-empty-state">
              <Layers size={40} opacity={0.4} />
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Selecciona una ficha</h4>
                <p style={{ margin: 0, fontSize: "0.82rem" }}>
                  Elige una ficha del panel lateral para gestionar sus aprendices matriculados y evidencias.
                </p>
              </div>
            </div>
          ) : loadingDetalle ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="skeleton-box" style={{ height: 36, width: "60%" }} />
              <div className="skeleton-box" style={{ height: 160 }} />
              <div className="skeleton-box" style={{ height: 220 }} />
            </div>
          ) : (
            <>
              {/* Header de la Ficha */}
              <div className="panel-detail-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>
                    Ficha {fichaSeleccionada.numero_ficha}
                  </h3>
                  <span className="proyecto-header-badge" style={{ fontSize: "0.8rem" }}>
                    {fichaSeleccionada.nombre_programa}
                  </span>
                </div>
              </div>

              {/* Bloque: Aprendices Activos */}
              <div className="bloque-separado" style={{ marginBottom: 20 }}>
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Users size={16} /> Aprendices activos ({aprendices.length})
                </p>

                <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre y Apellido</th>
                        <th>Correo Institucional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aprendices.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="list-vacia" style={{ textAlign: "center", padding: "16px 0" }}>
                            Sin aprendices activos en esta ficha.
                          </td>
                        </tr>
                      ) : (
                        aprendices.map((a) => (
                          <tr key={a.usuario_id}>
                            <td style={{ fontWeight: 600 }}>
                              {a.nombre} {a.apellido}
                            </td>
                            <td style={{ opacity: 0.85 }}>{a.correo}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bloque: Evidencias de los Proyectos */}
              <div className="bloque-separado">
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <FileText size={16} /> Evidencias de los proyectos ({evidencias.length})
                </p>

                <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Evidencia / Recurso</th>
                        <th>Grupo</th>
                        <th>Fase</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidencias.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="list-vacia" style={{ textAlign: "center", padding: "16px 0" }}>
                            Sin evidencias subidas todavía.
                          </td>
                        </tr>
                      ) : (
                        evidencias.map((e) => (
                          <tr key={e.evidencia_id}>
                            <td>
                              <a
                                href={e.ubicacion}
                                target="_blank"
                                rel="noreferrer"
                                className="evidencia-link"
                              >
                                <FileText size={14} />
                                <span>{e.nombre_evidencia}</span>
                                <ExternalLink size={12} opacity={0.7} />
                              </a>
                            </td>
                            <td style={{ fontWeight: 600 }}>{e.nombre_grupo}</td>
                            <td style={{ opacity: 0.85 }}>{e.nombre_fase}</td>
                            <td>{renderBadgeResultado(e.resultado)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MisFichas;