/*
  Sección "Grupos de proyecto" del panel de instructor.
  Recibe la ficha seleccionada por props, trae los grupos de proyecto de
  esa ficha (Scrum teams reales, no el grupo "General" de inscripción) y,
  al seleccionar uno, muestra el README completo del proyecto: descripción,
  problema, objetivo, alcance, tecnologías, fechas, integrantes y fases.
  También incluye la lista de chequeo por fase: al elegir una fase se ven
  sus carpetas y evidencias, con botones para calificar APROBADO/REPROBADO.
  Regla de cascada: si una evidencia queda REPROBADA, toda la fase pasa a
  "Desaprobada" (la lógica vive en el backend); el frontend actualiza el
  estado de la fase al instante con la respuesta de la evaluación, sin
  esperar a recargar la página.
  Las observaciones al grupo se ven siempre que hay un grupo seleccionado
  (no dependen de que además hayas abierto una fase).
*/

import { useState, useEffect } from "react";
import { getGruposDeFicha, getReadmeProyecto, getCarpetasDeFase, evaluarEvidencia, getObservacionesProyecto, crearObservacion } from "../../api";

function Proyectos({ ficha }) {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [readme, setReadme] = useState(null);
  const [faseSeleccionada, setFaseSeleccionada] = useState(null);
  const [carpetas, setCarpetas] = useState([]);
  const [observaciones, setObservaciones] = useState([]);
  const [tituloObs, setTituloObs] = useState("");
  const [descripcionObs, setDescripcionObs] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Cada vez que cambia la ficha seleccionada, trae sus grupos de proyecto
  useEffect(() => {
    setGrupoSeleccionado(null);
    setReadme(null);
    setFaseSeleccionada(null);
    setCarpetas([]);
    setObservaciones([]);
    setLoading(true);
    getGruposDeFicha(ficha.ficha_id)
      .then(setGrupos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ficha]);

  // Al elegir un grupo, trae su README y sus observaciones
  const seleccionarGrupo = async (grupo) => {
    setGrupoSeleccionado(grupo);
    setFaseSeleccionada(null);
    setCarpetas([]);
    setError("");
    try {
      const [data, obs] = await Promise.all([
        getReadmeProyecto(grupo.proyecto_id),
        getObservacionesProyecto(grupo.proyecto_id),
      ]);
      setReadme(data);
      setObservaciones(obs);
    } catch (err) {
      setError(err.message);
    }
  };

  // Publica una observación nueva y refresca la lista
  const publicarObservacion = async () => {
    if (!tituloObs || !descripcionObs) return;
    try {
      await crearObservacion(grupoSeleccionado.proyecto_id, tituloObs, descripcionObs);
      const obs = await getObservacionesProyecto(grupoSeleccionado.proyecto_id);
      setObservaciones(obs);
      setTituloObs("");
      setDescripcionObs("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Trae la lista de chequeo (carpetas + evidencias) de una fase
  const verListaDeChequeo = async (fase) => {
    setFaseSeleccionada(fase);
    setError("");
    try {
      const data = await getCarpetasDeFase(fase.fase_id);
      setCarpetas(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Califica una evidencia y actualiza en el momento, sin esperar a recargar:
  // 1) refresca la lista de chequeo (para ver el nuevo resultado de la evidencia)
  // 2) actualiza el estado de la fase tanto en la tabla de arriba (readme.fases)
  //    como en faseSeleccionada (para la alerta de cascada), con lo que ya
  //    devuelve el backend en la misma respuesta
  const calificar = async (evidenciaId, resultado) => {
    try {
      const data = await evaluarEvidencia(evidenciaId, resultado);

      setReadme((prev) => ({
        ...prev,
        fases: prev.fases.map((f) =>
          f.fase_id === faseSeleccionada.fase_id ? { ...f, estado_fase: data.estado_fase } : f
        ),
      }));
      setFaseSeleccionada((prev) => ({ ...prev, estado_fase: data.estado_fase }));

      const carpetasActualizadas = await getCarpetasDeFase(faseSeleccionada.fase_id);
      setCarpetas(carpetasActualizadas);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Cargando grupos...</p>;

  return (
    <div className="panel-split">
      {error && <div className="server-error">{error}</div>}

      {/* Lista de grupos de proyecto de la ficha */}
      <div className="panel-list">
        <p className="panel-list-title">Grupos de proyecto</p>
        {grupos.length === 0 && <p className="list-vacia">Esta ficha no tiene grupos de proyecto todavía.</p>}
        {grupos.map((g) => (
          <button
            key={g.grupo_id}
            className={`panel-list-item ${grupoSeleccionado?.grupo_id === g.grupo_id ? "active" : ""}`}
            onClick={() => seleccionarGrupo(g)}
          >
            <span>{g.nombre_grupo}</span>
            <span className="ficha-badge">{g.estado_proyecto}</span>
          </button>
        ))}
      </div>

      {/* README del proyecto seleccionado */}
      <div className="panel-detail">
        {!grupoSeleccionado ? (
          <div className="panel-empty">Selecciona un grupo para ver el README de su proyecto.</div>
        ) : !readme ? (
          <p>Cargando proyecto...</p>
        ) : (
          <>
            <div className="panel-detail-header">
              <h3>{readme.proyecto.nombre_proyecto}</h3>
            </div>

            <p className="admin-count">Descripción</p>
            <p>{readme.proyecto.descripcion}</p>

            <p className="admin-count">Problema</p>
            <p>{readme.proyecto.problema}</p>

            <p className="admin-count">Objetivo</p>
            <p>{readme.proyecto.objetivo}</p>

            <p className="admin-count">Alcance</p>
            <p>{readme.proyecto.alcance}</p>

            {readme.proyecto.tecnologias && (
              <>
                <p className="admin-count">Tecnologías</p>
                <p>{readme.proyecto.tecnologias}</p>
              </>
            )}

            <p className="admin-count instructor-evidencias-title">Integrantes</p>
            <div className="admin-table-wrap">
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
                      <td>{i.nombre} {i.apellido}</td>
                      <td>{i.correo}</td>
                      <td>{i.rol_scrum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="admin-count instructor-evidencias-title">Fases</p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fase</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {readme.fases.map((f) => (
                    <tr key={f.fase_id}>
                      <td>{f.nombre_fase}</td>
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

            {/* Alerta de cascada: si la fase quedó desaprobada por algún archivo */}
            {faseSeleccionada && faseSeleccionada.estado_fase === "Desaprobada" && (
              <div className="server-error">
                La fase {faseSeleccionada.nombre_fase} presenta elementos pendientes de aprobación.
              </div>
            )}

            {/* Lista de chequeo de la fase seleccionada */}
            {faseSeleccionada && (
              <>
                <p className="admin-count instructor-evidencias-title">
                  Lista de chequeo — {faseSeleccionada.nombre_fase}
                </p>
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
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.evidencias.map((e) => (
                            <tr key={e.evidencia_id}>
                              <td><a href={e.ubicacion} target="_blank" rel="noreferrer">{e.nombre_evidencia}</a></td>
                              <td>{e.tipo_evidencia}</td>
                              <td>
                                <span className={`badge-evidencia ${e.resultado === "APROBADO" ? "entregado" : e.resultado === "REPROBADO" ? "pendiente" : ""}`}>
                                  {e.resultado || "Sin evaluar"}
                                </span>
                              </td>
                              <td className="acciones-cell">
                                <button className="btn-accion" onClick={() => calificar(e.evidencia_id, "APROBADO")}>Aprobar</button>
                                <button className="btn-accion btn-accion-danger" onClick={() => calificar(e.evidencia_id, "REPROBADO")}>Reprobar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </>
            )}

            <p className="admin-count instructor-evidencias-title">Observaciones al grupo</p>

            <div className="instructor-fichas" style={{ marginBottom: 14 }}>
              <input
                className="modal-input"
                placeholder="Título de la observación"
                value={tituloObs}
                onChange={(e) => setTituloObs(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <textarea
                className="modal-input"
                placeholder="Descripción"
                rows={3}
                value={descripcionObs}
                onChange={(e) => setDescripcionObs(e.target.value)}
                style={{ marginBottom: 8, resize: "vertical" }}
              />
              <button className="btn-rol" onClick={publicarObservacion}>Publicar observación</button>
            </div>

            {observaciones.length === 0 ? (
              <p className="list-vacia">Sin observaciones todavía.</p>
            ) : (
              observaciones.map((o) => (
                <div key={o.observacion_id} className="instructor-fichas" style={{ marginBottom: 10 }}>
                  <h4>{o.titulo}</h4>
                  <p>{o.descripcion}</p>
                  <p className="admin-user-email">
                    {o.nombre} {o.apellido} — {new Date(o.fecha_observacion).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Proyectos;