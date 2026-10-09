/*
  Vista "Seguimiento" del panel de Coordinación · ADSO.
  UI/UX Avanzado: Auditoría integral de proyecto, desglose visual de aprendices/roles Scrum,
  inspección de evidencias por fases, historial de observaciones e iconografía 100% lucide-react.
*/

import { useState, useEffect } from "react";
import {
    Activity,
    Users,
    FolderCheck,
    MessageSquare,
    Crown,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    Inbox,
    AlertTriangle,
    FileText,
    Layers,
    BookOpen
} from "lucide-react";
import { getSeguimientoProyecto } from "../../api";

const BADGE_EVALUACION = {
    APROBADO: { icono: <CheckCircle2 size={12} />, clase: "badge-activo" },
    REPROBADO: { icono: <XCircle size={12} />, clase: "badge-cancelado" },
    "Sin evaluar": { icono: <Clock size={12} />, clase: "badge-pausado" },
};

function Seguimiento({ proyectoId }) {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!proyectoId) return;
        setLoading(true);
        setError("");
        getSeguimientoProyecto(proyectoId)
            .then((res) => setDatos(res || null))
            .catch((err) => setError(err?.message || "Error al cargar el seguimiento del proyecto"))
            .finally(() => setLoading(false));
    }, [proyectoId]);

    if (!proyectoId) {
        return (
            <div className="fases-empty-state" style={{ padding: "60px 0" }}>
                <Activity size={48} opacity={0.3} />
                <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>No se ha seleccionado un proyecto</h4>
                    <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--color-text-muted)" }}>
                        Dirígete a la pestaña <strong>"Proyectos"</strong> y selecciona <strong>"Ver seguimiento"</strong> en el proyecto que deseas inspeccionar.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="skeleton-box" style={{ height: 36, width: 300 }} />
                <div className="skeleton-box" style={{ height: 120, width: "100%" }} />
                <div className="skeleton-box" style={{ height: 200, width: "100%" }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="server-error" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={18} /> {error}
            </div>
        );
    }

    if (!datos || !datos.proyecto) return null;

    const { proyecto, integrantes = [], fases = [], observaciones = [] } = datos;

    return (
        <div>
            {/* Header Contextual del Proyecto */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <h2 style={{ margin: 0 }}>{proyecto.nombre_proyecto}</h2>
                    <span className="ficha-badge">Ficha {proyecto.numero_ficha}</span>
                    <span className="proyecto-header-badge">Grupo {proyecto.codigo_grupo}</span>
                </div>
                <p className="admin-count" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <BookOpen size={14} /> Auditoría pedagógica de avance y repositorio de evidencias
                </p>
            </div>

            {/* Descripción del Proyecto */}
            {proyecto.descripcion && (
                <div className="bloque-separado" style={{ marginBottom: 20, padding: 16 }}>
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: "0.85rem" }}>
                        <FileText size={15} /> Descripción General
                    </p>
                    <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.6", opacity: 0.9 }}>
                        {proyecto.descripcion}
                    </p>
                </div>
            )}

            {/* Seccion 1: Integrantes del Grupo (Nomenclatura SENA + Iconografía Lucide) */}
            <div className="bloque-separado" style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(128,128,128,0.12)", background: "rgba(128,128,128,0.03)" }}>
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                        <Users size={16} /> Aprendices del Grupo ({integrantes.length})
                    </p>
                </div>

                <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Aprendiz</th>
                                <th>Correo Institucional</th>
                                <th>Rol Scrum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {integrantes.map((i, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 600 }}>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                            {i.rol_scrum?.toLowerCase().includes("scrum") && <Crown size={14} style={{ color: "#f59e0b" }} />}
                                            <span>{i.nombre} {i.apellido}</span>
                                        </div>
                                    </td>
                                    <td style={{ opacity: 0.85 }}>{i.correo}</td>
                                    <td>
                                        <span className="ficha-badge" style={{ fontSize: "0.75rem" }}>
                                            {i.rol_scrum || "Integrante"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sección 2: Desglose de Fases y Evidencias */}
            <div style={{ marginBottom: 24 }}>
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <FolderCheck size={16} /> Estado de Fases y Evidencias Subidas
                </p>

                {fases.length === 0 ? (
                    <div className="fases-empty-state" style={{ padding: "30px 0" }}>
                        <Inbox size={28} />
                        <p className="list-vacia" style={{ padding: 0 }}>No hay fases estructuradas para este proyecto.</p>
                    </div>
                ) : (
                    fases.map((f) => (
                        <div key={f.fase_id} className="bloque-separado" style={{ marginBottom: 16, padding: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: "0.98rem" }}>
                                    <Layers size={16} style={{ color: "var(--color-primary)" }} /> {f.nombre_fase}
                                </h4>
                                <span className={`badge-rol ${f.estado_fase === "Aprobada" ? "badge-activo" : f.estado_fase === "Desaprobada" ? "badge-cancelado" : "badge-pausado"}`}>
                                    {f.estado_fase || "En proceso"}
                                </span>
                            </div>

                            {!f.carpetas || f.carpetas.length === 0 ? (
                                <p className="admin-count" style={{ margin: 0, fontStyle: "italic" }}>Sin carpetas de evidencias aún.</p>
                            ) : (
                                f.carpetas.map((c) => (
                                    <div key={c.carpeta_id} style={{ marginTop: 12, padding: "10px 14px", background: "rgba(128,128,128,0.04)", borderRadius: 8 }}>
                                        <p style={{ margin: "0 0 8px", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                                            <FolderCheck size={14} /> {c.nombre_carpeta}
                                        </p>

                                        <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                                            <table className="admin-table" style={{ fontSize: "0.78rem" }}>
                                                <thead>
                                                    <tr>
                                                        <th>Evidencia</th>
                                                        <th>Tipo</th>
                                                        <th>Resultado Evaluación</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {!c.evidencias || c.evidencias.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={3} className="list-vacia" style={{ padding: "8px 0", textAlign: "center" }}>
                                                                Sin entregas registradas en esta carpeta.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        c.evidencias.map((e) => {
                                                            const evalInfo = BADGE_EVALUACION[e.resultado] || BADGE_EVALUACION["Sin evaluar"];
                                                            return (
                                                                <tr key={e.evidencia_id}>
                                                                    <td>
                                                                        <a
                                                                            href={e.ubicacion}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
                                                                        >
                                                                            {e.nombre_evidencia} <ExternalLink size={12} />
                                                                        </a>
                                                                    </td>
                                                                    <td>{e.tipo_evidencia || "Enlace / Documento"}</td>
                                                                    <td>
                                                                        <span className={`badge-rol ${evalInfo.clase}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                                            {evalInfo.icono} {e.resultado || "Sin evaluar"}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Sección 3: Historial de Observaciones del Instructor */}
            <div className="bloque-separado" style={{ padding: 16 }}>
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <MessageSquare size={16} /> Observaciones del Instructor ({observaciones.length})
                </p>

                {observaciones.length === 0 ? (
                    <p className="admin-count" style={{ margin: 0, fontStyle: "italic" }}>
                        No hay observaciones pedagógicas registradas para este proyecto.
                    </p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {observaciones.map((o) => (
                            <div key={o.observacion_id} style={{ padding: 12, borderLeft: "3px solid var(--color-primary)", background: "rgba(128,128,128,0.05)", borderRadius: "0 8px 8px 0" }}>
                                <h5 style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>{o.titulo}</h5>
                                <p style={{ margin: "0 0 8px", fontSize: "0.84rem", opacity: 0.9, lineHeight: "1.5" }}>{o.descripcion}</p>
                                <span className="admin-count" style={{ fontSize: "0.75rem" }}>
                                    Publicado por <strong>{o.nombre} {o.apellido}</strong> — {new Date(o.fecha_observacion).toLocaleString("es-ES")}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Seguimiento;