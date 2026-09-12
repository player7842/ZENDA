/*
  Sección "Observaciones" del panel de aprendiz.
  Lista de solo lectura de lo que el instructor ha comentado sobre el
  proyecto activo. Cualquier integrante del grupo puede verlas.
*/

import { useState, useEffect } from "react";
import { getObservacionesDeMiProyecto } from "../../api";

function Observaciones() {
  const [observaciones, setObservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getObservacionesDeMiProyecto()
      .then(setObservaciones)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando observaciones...</p>;

  return (
    <>
      {error && <div className="server-error">{error}</div>}
      <h2>Observaciones del instructor</h2>

      {observaciones.length === 0 ? (
        <p className="list-vacia">Aún no tienes observaciones.</p>
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
  );
}

export default Observaciones;