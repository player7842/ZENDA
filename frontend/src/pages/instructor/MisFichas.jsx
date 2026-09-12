/*
  Sección "Mis fichas" del panel de instructor.
  Recibe las fichas asignadas por props (ya cargadas en instructor.jsx) y
  maneja su propio estado de selección: al elegir una ficha, trae los
  aprendices activos de esa ficha y las evidencias reales de sus proyectos
  (ya no es una vista de ejemplo, viene directo de la base de datos).
  Estructura visual: panel-split (lista a la izquierda, detalle a la
  derecha), igual que Fichas.jsx en el panel de admin.
*/

import { useState } from "react";
import { getAprendicesFicha, getEvidenciasFicha } from "../../api";

function MisFichas({ fichas }) {
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [aprendices, setAprendices] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [error, setError] = useState("");

  // Al seleccionar una ficha, trae sus aprendices activos y las evidencias reales
  const seleccionarFicha = async (ficha) => {
    setFichaSeleccionada(ficha);
    setError("");
    try {
      const [aprendicesData, evidenciasData] = await Promise.all([
        getAprendicesFicha(ficha.ficha_id),
        getEvidenciasFicha(ficha.ficha_id),
      ]);
      setAprendices(aprendicesData);
      setEvidencias(evidenciasData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel-split">
      {error && <div className="server-error">{error}</div>}

      {/* Lista de fichas asignadas */}
      <div className="panel-list">
        <p className="panel-list-title">Fichas asignadas</p>
        {fichas.length === 0 && <p className="list-vacia">No tienes fichas asignadas.</p>}
        {fichas.map((f) => (
          <button
            key={f.ficha_id}
            className={`panel-list-item ${fichaSeleccionada?.ficha_id === f.ficha_id ? "active" : ""}`}
            onClick={() => seleccionarFicha(f)}
          >
            <span>Ficha {f.numero_ficha}</span>
            <span className="ficha-badge">{f.jornada}</span>
          </button>
        ))}
      </div>

      {/* Detalle de la ficha seleccionada */}
      <div className="panel-detail">
        {!fichaSeleccionada ? (
          <div className="panel-empty">Selecciona una ficha para ver sus aprendices y evidencias.</div>
        ) : (
          <>
            <div className="panel-detail-header">
              <h3>Ficha {fichaSeleccionada.numero_ficha} — {fichaSeleccionada.nombre_programa}</h3>
            </div>

            <p className="admin-count">Aprendices activos</p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                  </tr>
                </thead>
                <tbody>
                  {aprendices.length === 0 ? (
                    <tr><td colSpan={2} className="list-vacia">Sin aprendices activos.</td></tr>
                  ) : (
                    aprendices.map((a) => (
                      <tr key={a.usuario_id}>
                        <td>{a.nombre} {a.apellido}</td>
                        <td>{a.correo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="admin-count instructor-evidencias-title">Evidencias de los proyectos</p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Grupo</th>
                    <th>Fase</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {evidencias.length === 0 ? (
                    <tr><td colSpan={4} className="list-vacia">Sin evidencias subidas todavía.</td></tr>
                  ) : (
                    evidencias.map((e) => (
                      <tr key={e.evidencia_id}>
                        <td><a href={e.ubicacion} target="_blank" rel="noreferrer">{e.nombre_evidencia}</a></td>
                        <td>{e.nombre_grupo}</td>
                        <td>{e.nombre_fase}</td>
                        <td>
                          <span className={`badge-evidencia ${e.resultado === "APROBADO" ? "entregado" : e.resultado === "REPROBADO" ? "pendiente" : ""}`}>
                            {e.resultado || "Sin evaluar"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MisFichas;