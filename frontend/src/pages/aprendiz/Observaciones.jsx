/*
  Sección "Observaciones" del panel de aprendiz.
  Refactorizado UI/UX: Skeleton loading, iconografía lucide-react,
  empty state visual y tarjetas estructuradas para las notas del instructor.
*/

import { useState, useEffect } from "react";
import { MessageSquare, UserCheck, Calendar, Inbox, AlertCircle } from "lucide-react";
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

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fechaStr;
    }
  };

  // UI State: Skeleton Loading
  if (loading) {
    return (
      <div>
        <h2 style={{ marginBottom: 20 }}>Observaciones del instructor</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton-box" style={{ height: 110, borderRadius: 12 }} />
          <div className="skeleton-box" style={{ height: 110, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px" }}>Observaciones del instructor</h2>
        <p className="admin-count">
          Retroalimentación e indicaciones registradas sobre tu proyecto activo
        </p>
      </div>

      {error && (
        <div className="server-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {observaciones.length === 0 ? (
        <div className="fases-empty-state">
          <Inbox size={40} opacity={0.4} />
          <div>
            <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Sin observaciones aún</h4>
            <p style={{ margin: 0, fontSize: "0.82rem" }}>
              Tu instructor aún no ha registrado notas u observaciones sobre este proyecto.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {observaciones.map((o) => (
            <div key={o.observacion_id} className="bloque-separado observacion-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                <MessageSquare size={18} style={{ color: "var(--color-primary)", marginTop: 2, flexShrink: 0 }} />
                <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700 }}>{o.titulo}</h4>
              </div>

              <p style={{ margin: "0 0 0 30px", fontSize: "0.88rem", lineHeight: "1.6", opacity: 0.9 }}>
                {o.descripcion}
              </p>

              <div className="observacion-meta" style={{ marginLeft: 30 }}>
                <div className="observacion-meta-item">
                  <UserCheck size={14} style={{ color: "var(--color-primary)" }} />
                  <span style={{ fontWeight: 600 }}>
                    {o.nombre} {o.apellido}
                  </span>
                </div>

                <div className="observacion-meta-item">
                  <Calendar size={14} />
                  <span>{formatearFecha(o.fecha_observacion)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Observaciones;