/*
  Sección "Fases" del panel de aprendiz.
  Muestra las 5 fases del proyecto y su estado (Pendiente/En revisión/
  Aprobada/Desaprobada). Al hacer clic en una fase, trae su lista de
  chequeo (carpetas + evidencias + resultado de evaluación).
  Solo el LÍDER (Scrum Master) puede crear carpetas y subir evidencias
  (nuevas, tipo link). El resto de integrantes solo puede ver el estado
  y el resultado de cada evidencia — es de solo lectura para ellos.
*/

import { useState } from "react";
import { getCarpetasDeFaseAprendiz, crearCarpetaAprendiz, subirEvidenciaAprendiz } from "../../api";

function Fases({ fases, esLider }) {
  const [faseSeleccionada, setFaseSeleccionada] = useState(null);
  const [carpetas, setCarpetas] = useState([]);
  const [cargandoCarpetas, setCargandoCarpetas] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Formulario de nueva carpeta
  const [nombreCarpeta, setNombreCarpeta] = useState("");

  // Formulario de nueva evidencia: guarda a qué carpeta pertenece
  const [carpetaEvidencia, setCarpetaEvidencia] = useState(null);
  const [formEvidencia, setFormEvidencia] = useState({
    nombre_evidencia: "",
    tipo_evidencia: "Documento",
    ubicacion: "",
  });

  const seleccionarFase = async (fase) => {
    setFaseSeleccionada(fase);
    setError("");
    setExito("");
    setCarpetaEvidencia(null);
    setCargandoCarpetas(true);
    try {
      const data = await getCarpetasDeFaseAprendiz(fase.fase_id);
      setCarpetas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoCarpetas(false);
    }
  };

  const refrescarCarpetas = async () => {
    if (!faseSeleccionada) return;
    const data = await getCarpetasDeFaseAprendiz(faseSeleccionada.fase_id);
    setCarpetas(data);
  };

  const handleCrearCarpeta = async (e) => {
    e.preventDefault();
    if (!nombreCarpeta.trim()) return;
    setError("");
    setExito("");
    try {
      await crearCarpetaAprendiz(faseSeleccionada.fase_id, nombreCarpeta);
      setNombreCarpeta("");
      setExito("Carpeta creada correctamente");
      await refrescarCarpetas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubirEvidencia = async (e) => {
    e.preventDefault();
    if (!formEvidencia.nombre_evidencia || !formEvidencia.ubicacion) return;
    setError("");
    setExito("");
    try {
      await subirEvidenciaAprendiz(carpetaEvidencia, formEvidencia);
      setFormEvidencia({ nombre_evidencia: "", tipo_evidencia: "Documento", ubicacion: "" });
      setCarpetaEvidencia(null);
      setExito("Evidencia subida correctamente");
      await refrescarCarpetas();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel-split">
      {error && <div className="server-error">{error}</div>}
      {exito && <div className="server-exito">{exito}</div>}

      {/* Lista de fases */}
      <div className="panel-list">
        <p className="panel-list-title">Fases del proyecto</p>
        {fases.map((f) => (
          <button
            key={f.fase_id}
            className={`panel-list-item ${faseSeleccionada?.fase_id === f.fase_id ? "active" : ""}`}
            onClick={() => seleccionarFase(f)}
          >
            <span>{f.nombre_fase}</span>
            <span className={`badge-fase ${f.estado_fase === "Desaprobada" ? "desaprobada" : f.estado_fase === "Aprobada" ? "aprobada" : ""}`}>
              {f.estado_fase}
            </span>
          </button>
        ))}
      </div>

      {/* Detalle de la fase seleccionada */}
      <div className="panel-detail">
        {!faseSeleccionada ? (
          <div className="panel-empty">Selecciona una fase para ver su lista de chequeo.</div>
        ) : cargandoCarpetas ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="panel-detail-header">
              <h3>{faseSeleccionada.nombre_fase}</h3>
            </div>

            {faseSeleccionada.estado_fase === "Desaprobada" && (
              <div className="server-error">
                Esta fase tiene evidencias reprobadas por el instructor.
              </div>
            )}

            {/* Solo el líder puede crear carpetas nuevas */}
            {esLider && (
              <form onSubmit={handleCrearCarpeta} className="instructor-fichas" style={{ marginBottom: 16 }}>
                <label className="modal-label">Nueva carpeta</label>
                <div className="add-ficha">
                  <input
                    className="add-ficha-input"
                    placeholder="Nombre de la carpeta"
                    value={nombreCarpeta}
                    onChange={(e) => setNombreCarpeta(e.target.value)}
                  />
                  <button className="btn-rol" type="submit">Crear</button>
                </div>
              </form>
            )}

            {carpetas.length === 0 && <p className="list-vacia">Esta fase no tiene carpetas todavía.</p>}

            {carpetas.map((c) => (
              <div key={c.carpeta_id} className="instructor-fichas" style={{ marginBottom: 12 }}>
                <h4>{c.nombre_carpeta}</h4>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Evidencia</th>
                        <th>Tipo</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.evidencias.length === 0 ? (
                        <tr><td colSpan={3} className="list-vacia">Sin evidencias todavía.</td></tr>
                      ) : (
                        c.evidencias.map((e) => (
                          <tr key={e.evidencia_id}>
                            <td><a href={e.ubicacion} target="_blank" rel="noreferrer">{e.nombre_evidencia}</a></td>
                            <td>{e.tipo_evidencia}</td>
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

                {/* Solo el líder puede subir evidencias, carpeta por carpeta */}
                {esLider && (
                  carpetaEvidencia === c.carpeta_id ? (
                    <form onSubmit={handleSubirEvidencia} style={{ marginTop: 10 }}>
                      <input
                        className="modal-input"
                        placeholder="Nombre de la evidencia"
                        value={formEvidencia.nombre_evidencia}
                        onChange={(e) => setFormEvidencia({ ...formEvidencia, nombre_evidencia: e.target.value })}
                      />
                      <select
                        className="modal-select"
                        value={formEvidencia.tipo_evidencia}
                        onChange={(e) => setFormEvidencia({ ...formEvidencia, tipo_evidencia: e.target.value })}
                      >
                        <option value="Documento">Documento</option>
                        <option value="Imagen">Imagen</option>
                        <option value="Video">Video</option>
                        <option value="Enlace">Enlace</option>
                      </select>
                      <input
                        className="modal-input"
                        placeholder="Link de la evidencia (Drive, GitHub, etc.)"
                        value={formEvidencia.ubicacion}
                        onChange={(e) => setFormEvidencia({ ...formEvidencia, ubicacion: e.target.value })}
                      />
                      <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={() => setCarpetaEvidencia(null)}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn-rol">Subir evidencia</button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="btn-accion"
                      style={{ marginTop: 10 }}
                      onClick={() => setCarpetaEvidencia(c.carpeta_id)}
                    >
                      + Subir evidencia
                    </button>
                  )
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Fases;