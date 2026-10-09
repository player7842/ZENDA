/*
  Vista "Proyectos" del panel de Coordinación · ADSO.
  UI/UX Avanzado: Buscador inteligente, cálculo visual de progreso de fases, 
  badging dinámico por estado, navegación directa hacia el seguimiento y Skeleton Loader.
*/

import { useState, useEffect } from "react";
import {
    Briefcase,
    Search,
    Activity,
    Inbox,
    AlertTriangle,
    Hash,
    CheckCircle2,
    PauseCircle,
    XCircle,
    Layers
} from "lucide-react";
import { getProyectosCoordinador } from "../../api";
import ProgressBar from "../../components/ui/ProgressBar";

const BADGE_ESTADO = {
    Activo: { icono: <CheckCircle2 size={12} />, clase: "badge-activo" },
    Finalizado: { icono: <CheckCircle2 size={12} />, clase: "badge-finalizado" },
    Pausado: { icono: <PauseCircle size={12} />, clase: "badge-pausado" },
    Cancelado: { icono: <XCircle size={12} />, clase: "badge-cancelado" },
};

function Proyectos({ onVerSeguimiento }) {
    const [proyectos, setProyectos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getProyectosCoordinador()
            .then((data) => setProyectos(data || []))
            .catch((err) => setError(err?.message || "Error al cargar los proyectos del programa"))
            .finally(() => setLoading(false));
    }, []);

    const proyectosFiltrados = proyectos.filter((p) => {
        const q = busqueda.toLowerCase();
        return (
            p.nombre_proyecto?.toLowerCase().includes(q) ||
            p.nombre_grupo?.toLowerCase().includes(q) ||
            p.codigo_grupo?.toLowerCase().includes(q) ||
            String(p.numero_ficha).includes(q)
        );
    });

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="skeleton-box" style={{ height: 32, width: 240 }} />
                <div className="skeleton-box" style={{ height: 44, width: "100%" }} />
                <div className="skeleton-box" style={{ height: 320, width: "100%" }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 4px" }}>Proyectos de Formación · ADSO</h2>
                <p className="admin-count">Medición de avance basada en las 5 fases metodológicas aprobadas</p>
            </div>

            {error && (
                <div className="server-error" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* Header Contextual + Buscador */}
            <div className="panel-detail-header" style={{ marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
                    <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <Briefcase size={18} style={{ color: "var(--color-primary)" }} /> Registrados ({proyectosFiltrados.length})
                    </h3>

                    <div className="search-box-wrap" style={{ flex: 1, maxWidth: 360, margin: 0 }}>
                        <span className="search-box-icon">
                            <Search size={14} />
                        </span>
                        <input
                            className="modal-input"
                            placeholder="Buscar por proyecto, grupo o ficha..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de Resultados */}
            {proyectos.length === 0 ? (
                <div className="fases-empty-state" style={{ padding: "40px 0" }}>
                    <Briefcase size={40} opacity={0.4} />
                    <p style={{ margin: 0 }}>No hay proyectos de formación registrados en ADSO.</p>
                </div>
            ) : proyectosFiltrados.length === 0 ? (
                <div className="list-vacia-container" style={{ padding: "30px 0" }}>
                    <Inbox size={28} />
                    <p className="list-vacia" style={{ padding: 0 }}>No se encontraron coincidencias para "{busqueda}".</p>
                </div>
            ) : (
                <div className="bloque-separado" style={{ padding: 0, overflow: "hidden" }}>
                    <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Proyecto</th>
                                    <th>Célula / Grupo</th>
                                    <th>Ficha</th>
                                    <th>Estado</th>
                                    <th>Avance Metodológico</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proyectosFiltrados.map((p) => {
                                    const totalFases = p.total_fases || 5;
                                    const fasesAprobadas = p.fases_aprobadas || 0;
                                    const progreso = Math.round((fasesAprobadas / totalFases) * 100);
                                    const estadoInfo = BADGE_ESTADO[p.estado_proyecto] || null;

                                    return (
                                        <tr key={p.proyecto_id}>
                                            <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>
                                                {p.nombre_proyecto}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span>{p.nombre_grupo}</span>
                                                    <span className="admin-count" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.74rem" }}>
                                                        <Hash size={11} /> {p.codigo_grupo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ficha-badge" style={{ fontSize: "0.75rem" }}>
                                                    Ficha {p.numero_ficha}
                                                </span>
                                            </td>
                                            <td>
                                                {p.estado_proyecto ? (
                                                    <span className={`badge-rol ${estadoInfo?.clase || "badge-aprendiz"}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                        {estadoInfo?.icono} {p.estado_proyecto}
                                                    </span>
                                                ) : (
                                                    <span style={{ opacity: 0.5 }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ minWidth: 160 }}>
                                                <ProgressBar
                                                    porcentaje={progreso}
                                                    etiqueta={`${fasesAprobadas} de ${totalFases} fases aprobadas (${progreso}%)`}
                                                    tono={progreso >= 80 ? "verde" : progreso >= 40 ? "azul" : "neutro"}
                                                />
                                            </td>
                                            <td className="acciones-cell">
                                                <button
                                                    className="btn-accion"
                                                    onClick={() => onVerSeguimiento(p.proyecto_id)}
                                                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                                >
                                                    <Activity size={13} /> Ver seguimiento
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Proyectos;