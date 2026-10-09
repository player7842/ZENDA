/*
  Sección "Tareas" del panel de aprendiz.
  Metodología Scrum: Pendiente -> En proceso -> Finalizada -> Confirmada
                                             -> Incompleta -> En proceso
  UI/UX Avanzado: Doble vista (Kanban / Tabla), Skeletons, Badges por prioridad,
  manejo defensivo de tipos e iconografía lucide-react.
*/

import { useState, useEffect } from "react";
import {
    CheckSquare,
    Plus,
    Clock,
    AlertCircle,
    PlayCircle,
    CheckCircle2,
    RotateCcw,
    XCircle,
    User,
    Calendar,
    AlertTriangle,
    Inbox,
    LayoutGrid,
    List
} from "lucide-react";
import {
    getTareasAprendiz,
    crearTareaAprendiz,
    cambiarEstadoTareaAprendiz,
    getProgresoTareasAprendiz,
} from "../../api";

import ProgressBar from "../../components/ui/ProgressBar";

const COLUMNAS_KANBAN = [
    { id: "Pendiente", titulo: "Pendientes", color: "#95a5a6" },
    { id: "En proceso", titulo: "En Proceso", color: "#0984e3" },
    { id: "Finalizada", titulo: "Finalizadas", color: "#f59e0b" },
    { id: "Confirmada", titulo: "Confirmadas", color: "#00b894" },
];

const FORM_INICIAL = {
    titulo: "",
    descripcion: "",
    prioridad: "Media",
    responsable_id: "",
    fecha_inicio: "",
    fecha_limite: "",
};

function Tareas({ esLider = false, integrantes = [], usuarioId = null }) {
    const [tareas, setTareas] = useState([]);
    const [progreso, setProgreso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [vista, setVista] = useState("kanban"); // "kanban" | "tabla"
    const [form, setForm] = useState(FORM_INICIAL);

    const cargar = async () => {
        setLoading(true);
        setError("");
        try {
            const [t, p] = await Promise.all([getTareasAprendiz(), getProgresoTareasAprendiz()]);
            setTareas(t || []);
            setProgreso(p || null);
        } catch (err) {
            setError(err?.message || "Error al cargar las tareas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        setError("");
        setExito("");
        try {
            await crearTareaAprendiz(form);
            setForm(FORM_INICIAL);
            setMostrarForm(false);
            setExito("Tarea creada correctamente");
            await cargar();
        } catch (err) {
            setError(err?.message || "Error al crear la tarea");
        }
    };

    const cambiarEstado = async (tareaId, estado) => {
        setError("");
        setExito("");
        try {
            await cambiarEstadoTareaAprendiz(tareaId, estado);
            await cargar();
        } catch (err) {
            setError(err?.message || "Error al actualizar estado");
        }
    };

    const renderBadgePrioridad = (prioridad) => {
        switch (prioridad) {
            case "Alta":
                return (
                    <span className="badge-fase desaprobada" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={12} /> Alta
                    </span>
                );
            case "Baja":
                return (
                    <span className="badge-fase aprobada" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Baja
                    </span>
                );
            default:
                return (
                    <span className="badge-fase badge-fase-revision" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Media
                    </span>
                );
        }
    };

    const renderBadgeEstado = (estado) => {
        switch (estado) {
            case "En proceso":
                return (
                    <span className="badge-fase badge-fase-revision" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> En proceso
                    </span>
                );
            case "Finalizada":
                return (
                    <span className="badge-fase" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.35)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={12} /> Finalizada
                    </span>
                );
            case "Confirmada":
                return (
                    <span className="badge-fase aprobada" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={12} /> Confirmada
                    </span>
                );
            case "Incompleta":
                return (
                    <span className="badge-fase desaprobada" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <XCircle size={12} /> Incompleta
                    </span>
                );
            default:
                return (
                    <span className="badge-fase" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> Pendiente
                    </span>
                );
        }
    };

    const renderAcciones = (t) => {
        const esResponsable = Number(t?.responsable_id) === Number(usuarioId);

        if (esResponsable && (t?.estado === "Pendiente" || t?.estado === "Incompleta")) {
            return (
                <button
                    className="btn-accion"
                    style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6 }}
                    onClick={() => cambiarEstado(t.tarea_id, "En proceso")}
                >
                    {t?.estado === "Incompleta" ? <RotateCcw size={14} /> : <PlayCircle size={14} />}
                    {t?.estado === "Incompleta" ? "Reintentar" : "Iniciar"}
                </button>
            );
        }
        if (esResponsable && t?.estado === "En proceso") {
            return (
                <button
                    className="btn-accion"
                    style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6 }}
                    onClick={() => cambiarEstado(t.tarea_id, "Finalizada")}
                >
                    <CheckCircle2 size={14} /> Marcar finalizada
                </button>
            );
        }
        if (esLider && t?.estado === "Finalizada") {
            return (
                <div style={{ display: "flex", gap: 6, width: "100%" }}>
                    <button
                        className="btn-rol"
                        style={{ flex: 1, padding: "6px 8px", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                        onClick={() => cambiarEstado(t.tarea_id, "Confirmada")}
                    >
                        <CheckCircle2 size={12} /> Confirmar
                    </button>
                    <button
                        className="btn-cancelar"
                        style={{ flex: 1, padding: "6px 8px", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                        onClick={() => cambiarEstado(t.tarea_id, "Incompleta")}
                    >
                        <XCircle size={12} /> Rechazar
                    </button>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div>
                <h2 style={{ marginBottom: 20 }}>Tareas del proyecto</h2>
                <div className="dash-card skeleton-box" style={{ height: 60, marginBottom: 20 }} />
                <div className="kanban-board">
                    <div className="kanban-column skeleton-box" />
                    <div className="kanban-column skeleton-box" />
                    <div className="kanban-column skeleton-box" />
                    <div className="kanban-column skeleton-box" />
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header con Switch de Vista */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ margin: "0 0 4px" }}>Tareas del proyecto</h2>
                    <p className="admin-count">Gestión de actividades según metodología Scrum</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Switch Kanban / Tabla */}
                    <div className="view-toggle-wrap">
                        <button
                            className={`view-toggle-btn ${vista === "kanban" ? "active" : ""}`}
                            onClick={() => setVista("kanban")}
                        >
                            <LayoutGrid size={15} /> Kanban
                        </button>
                        <button
                            className={`view-toggle-btn ${vista === "tabla" ? "active" : ""}`}
                            onClick={() => setVista("tabla")}
                        >
                            <List size={15} /> Tabla
                        </button>
                    </div>

                    {esLider && !mostrarForm && (
                        <button
                            className="btn-rol"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                            onClick={() => setMostrarForm(true)}
                        >
                            <Plus size={16} /> Nueva tarea
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="server-error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}
            {exito && (
                <div className="server-exito" style={{ marginBottom: 16 }}>
                    <CheckCircle2 size={18} /> {exito}
                </div>
            )}

            {/* Widget de Progreso */}
            {progreso && (
                <div className="bloque-separado" style={{ marginBottom: 20 }}>
                    <ProgressBar
                        porcentaje={progreso.porcentaje || 0}
                        etiqueta={`Progreso: ${progreso.confirmadas || 0}/${progreso.total || 0} tareas confirmadas por el líder`}
                        tono="verde"
                    />
                </div>
            )}

            {/* Formulario Crear Tarea (Líder) */}
            {esLider && mostrarForm && (
                <div className="bloque-separado" style={{ marginBottom: 24, background: "var(--surface, rgba(128,128,128,0.08))" }}>
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <CheckSquare size={16} /> Crear nueva tarea
                    </p>

                    <form onSubmit={handleCrear}>
                        <label className="modal-label">Título de la tarea</label>
                        <input
                            className="modal-input"
                            required
                            placeholder="Ej. Diseñar prototipos en Figma"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                        />

                        <label className="modal-label">Descripción (opcional)</label>
                        <input
                            className="modal-input"
                            placeholder="Detalles sobre entregables o criterios de aceptación..."
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        />

                        <div className="modal-grid">
                            <div>
                                <label className="modal-label">Responsable</label>
                                <select
                                    className="modal-select"
                                    required
                                    value={form.responsable_id}
                                    onChange={(e) => setForm({ ...form, responsable_id: e.target.value })}
                                >
                                    <option value="">Seleccionar integrante...</option>
                                    {(integrantes || []).map((i) => (
                                        <option key={i.usuario_id} value={i.usuario_id}>
                                            {i.nombre} {i.apellido} ({i.rol_scrum || "Developer"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="modal-label">Prioridad</label>
                                <select
                                    className="modal-select"
                                    value={form.prioridad}
                                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                                >
                                    <option value="Alta">Alta</option>
                                    <option value="Media">Media</option>
                                    <option value="Baja">Baja</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-grid">
                            <div>
                                <label className="modal-label">Fecha de inicio (opcional)</label>
                                <input
                                    className="modal-input"
                                    type="date"
                                    value={form.fecha_inicio}
                                    onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="modal-label">Fecha límite (opcional)</label>
                                <input
                                    className="modal-input"
                                    type="date"
                                    value={form.fecha_limite}
                                    onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-rol" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <Plus size={14} /> Guardar tarea
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Renderizado de Vistas (Kanban o Tabla) */}
            {tareas.length === 0 ? (
                <div className="fases-empty-state">
                    <Inbox size={40} opacity={0.4} />
                    <p className="list-vacia" style={{ margin: 0, padding: 0 }}>
                        No hay tareas registradas todavía en este proyecto.
                    </p>
                </div>
            ) : vista === "kanban" ? (
                /* VISTA KANBAN */
                <div className="kanban-board">
                    {COLUMNAS_KANBAN.map((col) => {
                        // Filtrar tareas por estado en esta columna
                        const tareasColumna = tareas.filter((t) => {
                            if (col.id === "Pendiente") return t.estado === "Pendiente" || t.estado === "Incompleta";
                            return t.estado === col.id;
                        });

                        return (
                            <div key={col.id} className="kanban-column">
                                <div className="kanban-column-header">
                                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: col.color }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                                        {col.titulo}
                                    </span>
                                    <span className="kanban-count-badge">{tareasColumna.length}</span>
                                </div>

                                {tareasColumna.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "24px 8px", color: "var(--color-text-muted)", fontSize: "0.78rem" }}>
                                        Sin tareas
                                    </div>
                                ) : (
                                    tareasColumna.map((t) => (
                                        <div key={t.tarea_id} className="kanban-card">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                                <h4 className="kanban-card-title">{t.titulo}</h4>
                                                {renderBadgePrioridad(t.prioridad)}
                                            </div>

                                            {t.descripcion && <p className="kanban-card-desc">{t.descripcion}</p>}

                                            <div className="kanban-card-footer">
                                                <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.85 }}>
                                                    <User size={12} />
                                                    {t.responsable_nombre ? `${t.responsable_nombre}` : "Sin asignar"}
                                                </span>
                                                {t.fecha_limite && (
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.75 }}>
                                                        <Calendar size={12} />
                                                        {t.fecha_limite.split("T")[0]}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Botón de acción directo en la tarjeta */}
                                            {renderAcciones(t) && (
                                                <div style={{ marginTop: 4 }}>
                                                    {renderAcciones(t)}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* VISTA TABLA TRADICIONAL */
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Responsable</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Fecha límite</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tareas.map((t) => (
                                <tr key={t.tarea_id}>
                                    <td style={{ fontWeight: 600 }}>{t.titulo}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <User size={14} opacity={0.7} />
                                            <span>{t.responsable_nombre ? `${t.responsable_nombre} ${t.responsable_apellido || ""}` : "Sin asignar"}</span>
                                        </div>
                                    </td>
                                    <td>{renderBadgePrioridad(t.prioridad)}</td>
                                    <td>{renderBadgeEstado(t.estado)}</td>
                                    <td style={{ opacity: 0.85 }}>
                                        {t.fecha_limite ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                <Calendar size={12} /> {t.fecha_limite.split("T")[0]}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td>{renderAcciones(t)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Tareas;