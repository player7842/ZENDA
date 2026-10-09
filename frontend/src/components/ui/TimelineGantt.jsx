/*
  Componente Timeline / Diagrama de Gantt Simplificado
  Muestra la línea temporal del proyecto, porcentaje transcurrido
  y alertas de ritmo de ejecución.
*/
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

function TimelineGantt({ fechaInicio, fechaFin, progresoTareas = 0 }) {
    const calcularProgresoTiempo = () => {
        if (!fechaInicio || !fechaFin) return { porcentaje: 0, diasRestantes: 0, estado: "Sin fechas" };

        const inicio = new Date(fechaInicio).getTime();
        const fin = new Date(fechaFin).getTime();
        const hoy = new Date().getTime();

        if (isNaN(inicio) || isNaN(fin)) return { porcentaje: 0, diasRestantes: 0, estado: "Sin fechas" };

        const duracionTotal = fin - inicio;
        const tiempoTranscurrido = hoy - inicio;

        if (duracionTotal <= 0) return { porcentaje: 100, diasRestantes: 0, estado: "Finalizado" };

        let pct = Math.round((tiempoTranscurrido / duracionTotal) * 100);
        pct = Math.max(0, Math.min(100, pct)); // Clampar entre 0 y 100%

        const diasRestantes = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));

        let estado = "En tiempo";
        if (diasRestantes < 0) estado = "Vencido";
        else if (pct > progresoTareas + 25) estado = "Riesgo de retraso";

        return { porcentaje: pct, diasRestantes, estado };
    };

    const { porcentaje, diasRestantes, estado } = calcularProgresoTiempo();

    const formatear = (fechaStr) => {
        if (!fechaStr) return "N/A";
        try {
            return new Date(fechaStr).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
        } catch {
            return fechaStr;
        }
    };

    return (
        <div className="gantt-container">
            <div className="gantt-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={18} style={{ color: "var(--color-primary)" }} />
                    <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Cronograma del Proyecto (Gantt)</h4>
                </div>

                {estado === "En tiempo" && (
                    <span className="gantt-status-pill badge-scrum-dev">
                        <CheckCircle2 size={12} /> Al día ({porcentaje}% transcurrido)
                    </span>
                )}
                {estado === "Riesgo de retraso" && (
                    <span className="gantt-status-pill badge-scrum-po">
                        <AlertTriangle size={12} /> Ajustar ritmo ({diasRestantes} días restantes)
                    </span>
                )}
                {estado === "Vencido" && (
                    <span className="gantt-status-pill badge-fase desaprobada">
                        <AlertTriangle size={12} /> Fecha límite superada
                    </span>
                )}
            </div>

            {/* Track de Progreso Temporal */}
            <div className="gantt-track">
                <div
                    className={`gantt-progress-bar ${estado !== "En tiempo" ? "delayed" : ""}`}
                    style={{ width: `${porcentaje}%` }}
                />
            </div>

            <div className="gantt-dates-meta">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Inicio: <strong>{formatear(fechaInicio)}</strong>
                </span>
                <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                    {porcentaje}% del tiempo ejecutado
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Entrega Estimada: <strong>{formatear(fechaFin)}</strong>
                </span>
            </div>
        </div>
    );
}

export default TimelineGantt;