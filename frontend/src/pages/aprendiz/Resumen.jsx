/*
  Pestaña "Resumen" del panel de aprendiz.
  UI/UX Avanzado: Skeleton loading, StatCards, Dona de fases,
  Gráfico de barras para flujo de tareas y ratio de aprobación.
*/
import { useState, useEffect } from "react";
import {
    CheckCircle2,
    Paperclip,
    ClipboardCheck,
    Clock,
    AlertCircle,
    Inbox,
    BarChart3,
    Award
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import ChartDonut from "../../components/ui/ChartDonut";
import ChartBar from "../../components/ui/ChartBar";
import { getResumenAprendiz } from "../../api";

const COLORES_FASE = {
    Pendiente: "#95a5a6",
    "En revisión": "#0984e3",
    Aprobada: "#00b894",
    Desaprobada: "#e74c3c",
};

const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Sin pendientes";
    try {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return fechaStr.split("T")[0];
    }
};

function Resumen({ fases }) {
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getResumenAprendiz();
                setResumen(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    if (loading) {
        return (
            <div>
                <h2 style={{ marginBottom: 20 }}>Resumen del proyecto</h2>
                <div className="dash-section">
                    <div className="dash-grid">
                        <div className="stat-card skeleton-box stat-card-skeleton" />
                        <div className="stat-card skeleton-box stat-card-skeleton" />
                        <div className="stat-card skeleton-box stat-card-skeleton" />
                        <div className="stat-card skeleton-box stat-card-skeleton" />
                    </div>
                </div>
                <div className="dash-grid-2">
                    <div className="dash-card skeleton-box" style={{ height: 220 }} />
                    <div className="dash-card skeleton-box" style={{ height: 220 }} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="server-error">
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
        );
    }

    const { progreso, proxima_fecha_limite, evidencias, tareas_por_estado } = resumen;

    // Transformación de datos para la gráfica de fases
    const fasesPorEstado = Object.entries(
        fases.reduce((acc, f) => {
            acc[f.estado_fase] = (acc[f.estado_fase] || 0) + 1;
            return acc;
        }, {})
    ).map(([nombre, cantidad]) => ({ nombre, cantidad }));

    // Datos mock/calculados para el desglose de tareas (si el endpoint los entrega o como fallback visual)
    const datosTareasBarra = tareas_por_estado || [
        { estado: "Pendientes", cantidad: progreso.total - progreso.confirmadas },
        { estado: "Confirmadas", cantidad: progreso.confirmadas },
    ];

    // Cálculo de ratio de efectividad
    const ratioEvaluacion = evidencias.total > 0
        ? Math.round((evidencias.evaluadas / evidencias.total) * 100)
        : 0;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 4px" }}>Resumen general del proyecto</h2>
                <p className="admin-count">Métricas generales de desempeño, fases y entregas</p>
            </div>

            {/* Grid de Métricas Principales */}
            <div className="dash-section">
                <div className="dash-grid">
                    <StatCard
                        label="Fases aprobadas"
                        value={`${fases.filter((f) => f.estado_fase === "Aprobada").length}/${fases.length}`}
                        icon={<CheckCircle2 size={24} />}
                        tono="verde"
                    />
                    <StatCard
                        label="Evidencias subidas"
                        value={evidencias.total}
                        icon={<Paperclip size={24} />}
                        tono="azul"
                    />
                    <StatCard
                        label="Evidencias evaluadas"
                        value={evidencias.evaluadas}
                        icon={<ClipboardCheck size={24} />}
                        tono="morado"
                    />
                    <StatCard
                        label="Próxima fecha límite"
                        value={formatearFecha(proxima_fecha_limite)}
                        icon={<Clock size={24} />}
                        tono={proxima_fecha_limite ? "rojo" : "neutro"}
                    />
                </div>
            </div>

            {/* Grid Secundario: Gráficos de Progreso y Fases */}
            <div className="dash-grid-2" style={{ marginBottom: 20 }}>
                <div className="dash-card">
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BarChart3 size={16} /> Progreso global de tareas
                    </p>
                    {progreso.total > 0 ? (
                        <div>
                            <ProgressBar
                                porcentaje={progreso.porcentaje}
                                etiqueta={`${progreso.confirmadas}/${progreso.total} tareas confirmadas por el líder`}
                                tono="verde"
                            />
                            <div style={{ marginTop: 20 }}>
                                <ChartBar
                                    data={datosTareasBarra}
                                    dataKey="cantidad"
                                    nameKey="estado"
                                    color="#00b894"
                                    alto={160}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="list-vacia-container">
                            <Inbox size={28} />
                            <p className="list-vacia" style={{ padding: 0 }}>Aún no hay tareas registradas en este proyecto.</p>
                        </div>
                    )}
                </div>

                <div className="dash-card">
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Award size={16} /> Fases por estado
                    </p>
                    <ChartDonut
                        data={fasesPorEstado}
                        dataKey="cantidad"
                        nameKey="nombre"
                        colores={fasesPorEstado.map((f) => COLORES_FASE[f.nombre] || "#95a5a6")}
                        alto={200}
                    />
                </div>
            </div>

            {/* Bloque Inferior: Cobertura de Evidencias */}
            <div className="bloque-separado">
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <ClipboardCheck size={16} /> Cobertura de revisión del instructor
                </p>
                <ProgressBar
                    porcentaje={ratioEvaluacion}
                    etiqueta={`${evidencias.evaluadas} de ${evidencias.total} evidencias revisadas (${ratioEvaluacion}%)`}
                    tono="morado"
                />
            </div>
        </div>
    );
}

export default Resumen;