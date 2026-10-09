/*
  Pestaña "Resumen" del panel de instructor — vista agregada de TODAS
  las fichas asignadas (no solo la seleccionada en el sidebar).
  Refactorizado UI/UX: Skeleton Loading, Donut Chart de efectividad,
  Cards de atención con iconografía lucide-react y layout ejecutivo.
*/
import { useState, useEffect } from "react";
import {
    ClipboardList,
    ClipboardCheck,
    AlertTriangle,
    Clock,
    AlertCircle,
    PieChart,
    BarChart3,
    Layers,
    Inbox,
    CheckCircle2,
    ArrowUpRight
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import ChartBar from "../../components/ui/ChartBar";
import ChartDonut from "../../components/ui/ChartDonut";
import ProgressBar from "../../components/ui/ProgressBar";
import { getResumenInstructor } from "../../api";

const COLORES_EVIDENCIA = {
    "Sin evaluar": "#f59e0b",
    Aprobado: "#00b894",
    Reprobado: "#e74c3c",
};

function Resumen({ fichas = [] }) {
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getResumenInstructor();
                setResumen(data);
            } catch (err) {
                setError(err?.message || "Error al cargar el resumen del instructor");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    // UI State: Skeleton Loading
    if (loading) {
        return (
            <div>
                <h2 style={{ marginBottom: 20 }}>Resumen general</h2>
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

    // UI State: Error Banner
    if (error) {
        return (
            <div className="server-error">
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
        );
    }

    const { evidenciasPorResultado = [], fasesAlerta = [], progresoPorFicha = [] } = resumen || {};

    const sinEvaluar = evidenciasPorResultado.find((e) => e.nombre === "Sin evaluar")?.cantidad || 0;
    const evaluadas = evidenciasPorResultado.reduce((s, e) => s + (e.cantidad || 0), 0) - sinEvaluar;

    // Formato para gráfico Donut de resultados
    const dataDonutResultados = evidenciasPorResultado.map((e) => ({
        nombre: e.nombre,
        cantidad: e.cantidad,
    }));

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 4px" }}>Resumen general de desempeño</h2>
                <p className="admin-count">Vista consolidada e indicadores clave de todas tus fichas a cargo</p>
            </div>

            {/* Grid de Métricas KPI */}
            <div className="dash-section">
                <div className="dash-grid">
                    <StatCard
                        label="Fichas a cargo"
                        value={fichas.length}
                        icon={<ClipboardList size={24} />}
                        tono="azul"
                    />
                    <StatCard
                        label="Evidencias evaluadas"
                        value={evaluadas}
                        icon={<ClipboardCheck size={24} />}
                        tono="morado"
                    />
                    <StatCard
                        label="Fases desaprobadas"
                        value={fasesAlerta.length}
                        icon={<AlertTriangle size={24} />}
                        tono={fasesAlerta.length > 0 ? "rojo" : "verde"}
                    />
                    <StatCard
                        label="Pendientes por revisar"
                        value={sinEvaluar}
                        icon={<Clock size={24} />}
                        tono={sinEvaluar > 0 ? "rojo" : "neutro"}
                    />
                </div>
            </div>

            {/* Grid Intermedio: Gráficos Estadísticos */}
            <div className="dash-grid-2" style={{ marginBottom: 24 }}>
                {/* Distribución por Bar Chart */}
                <div className="dash-card">
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BarChart3 size={16} /> Volumen de evidencias por resultado
                    </p>
                    <ChartBar
                        data={evidenciasPorResultado}
                        dataKey="cantidad"
                        nameKey="nombre"
                        color="#0984e3"
                        alto={200}
                    />
                </div>

                {/* Proporción por Donut Chart */}
                <div className="dash-card">
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PieChart size={16} /> Proporción de evaluaciones
                    </p>
                    {dataDonutResultados.length > 0 ? (
                        <ChartDonut
                            data={dataDonutResultados}
                            dataKey="cantidad"
                            nameKey="nombre"
                            colores={dataDonutResultados.map((d) => COLORES_EVIDENCIA[d.nombre] || "#95a5a6")}
                            alto={200}
                        />
                    ) : (
                        <div className="list-vacia-container">
                            <Inbox size={28} />
                            <p className="list-vacia" style={{ padding: 0 }}>Sin registros de evidencias.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tarjeta de Atenciones Requeridas */}
            <div className="dash-card" style={{ marginBottom: 24 }}>
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <AlertTriangle size={16} style={{ color: fasesAlerta.length > 0 ? "#ef4444" : "var(--color-primary)" }} />
                    Fases que requieren atención prioritaria ({fasesAlerta.length})
                </p>

                {fasesAlerta.length === 0 ? (
                    <div className="list-vacia-container" style={{ padding: "20px 0" }}>
                        <CheckCircle2 size={32} style={{ color: "#00b894" }} />
                        <p className="list-vacia" style={{ padding: 0, fontWeight: 600 }}>
                            ¡Excelente! No hay fases desaprobadas pendientes en tus fichas.
                        </p>
                    </div>
                ) : (
                    <div className="dash-grid-2">
                        {fasesAlerta.map((a, idx) => (
                            <div
                                key={a.fase_id || idx}
                                className="bloque-separado"
                                style={{
                                    margin: 0,
                                    borderLeft: "4px solid var(--color-error)",
                                    display: "flex",
                                    justify: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <span className="badge-fase desaprobada" style={{ marginBottom: 6, display: "inline-block" }}>
                                        Ficha {a.ficha}
                                    </span>
                                    <h4 style={{ margin: "2px 0 4px", fontSize: "0.92rem", fontWeight: 700 }}>
                                        {a.grupo}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                                        Fase desaprobada: <strong>{a.fase}</strong>
                                    </p>
                                </div>
                                <ArrowUpRight size={18} style={{ opacity: 0.5 }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Progreso Consolidado por Ficha */}
            <div className="bloque-separado">
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Layers size={16} /> Progreso global por ficha activa
                </p>

                {progresoPorFicha.length === 0 ? (
                    <p className="list-vacia">No hay fichas registradas.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {progresoPorFicha.map((p) => (
                            <div key={p.numero_ficha}>
                                <ProgressBar
                                    porcentaje={p.porcentaje}
                                    etiqueta={`Ficha ${p.numero_ficha} — ${p.aprobadas}/${p.total} fases aprobadas (${p.porcentaje}%)`}
                                    tono={p.porcentaje === 100 ? "verde" : "azul"}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Resumen;