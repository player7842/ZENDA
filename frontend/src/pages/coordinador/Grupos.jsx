/*
  Vista "Grupos" del panel de Coordinación · ADSO.
  UI/UX Avanzado: Buscador en tiempo real por grupo, ficha, Scrum Master o proyecto,
  filtro por estado del proyecto, badges cromáticos, Skeleton loading y empty states interactivos.
*/

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    FolderKanban,
    Shield,
    Inbox,
    AlertTriangle,
    Crown,
    Hash,
    CheckCircle2,
    Clock,
    XCircle,
    PauseCircle
} from "lucide-react";
import { getGruposCoordinador } from "../../api";

const BADGE_ESTADO = {
    Activo: { icono: <CheckCircle2 size={12} />, clase: "badge-activo" },
    Finalizado: { icono: <CheckCircle2 size={12} />, clase: "badge-finalizado" },
    Pausado: { icono: <PauseCircle size={12} />, clase: "badge-pausado" },
    Cancelado: { icono: <XCircle size={12} />, clase: "badge-cancelado" },
};

function Grupos() {
    const [grupos, setGrupos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getGruposCoordinador()
            .then((data) => setGrupos(data || []))
            .catch((err) => setError(err?.message || "Error al cargar los grupos de proyecto"))
            .finally(() => setLoading(false));
    }, []);

    const gruposFiltrados = grupos.filter((g) => {
        const q = busqueda.toLowerCase();
        const coincideTexto = (
            g.nombre_grupo?.toLowerCase().includes(q) ||
            g.codigo_grupo?.toLowerCase().includes(q) ||
            String(g.numero_ficha).includes(q) ||
            (g.lider_nombre && `${g.lider_nombre} ${g.lider_apellido}`.toLowerCase().includes(q)) ||
            g.nombre_proyecto?.toLowerCase().includes(q)
        );

        const coincideEstado =
            filtroEstado === "TODOS" ||
            (filtroEstado === "SIN_PROYECTO" && !g.nombre_proyecto) ||
            g.estado_proyecto === filtroEstado;

        return coincideTexto && coincideEstado;
    });

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="skeleton-box" style={{ height: 32, width: 260 }} />
                <div className="skeleton-box" style={{ height: 48, width: "100%" }} />
                <div className="skeleton-box" style={{ height: 320, width: "100%" }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 4px" }}>Grupos de Proyecto · ADSO</h2>
                <p className="admin-count">Supervisión pedagógica de células de desarrollo e integrantes asignados</p>
            </div>

            {error && (
                <div className="server-error" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* Bar de Controles: Buscador + Filtros de Estado */}
            <div className="panel-detail-header" style={{ marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
                    {/* Buscador */}
                    <div className="search-box-wrap" style={{ flex: 1, maxWidth: 360, margin: 0 }}>
                        <span className="search-box-icon">
                            <Search size={14} />
                        </span>
                        <input
                            className="modal-input"
                            placeholder="Buscar por grupo, ficha, líder o proyecto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filtro por Estado */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Estado:</span>
                    <select
                        className="modal-select"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        style={{ width: 160, height: 38 }}
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="Activo">Activos</option>
                        <option value="Finalizado">Finalizados</option>
                        <option value="Pausado">Pausados</option>
                        <option value="SIN_PROYECTO">Sin Proyecto</option>
                    </select>
                </div>
            </div>

            {/* Tabla de Grupos */}
            {grupos.length === 0 ? (
                <div className="fases-empty-state" style={{ padding: "40px 0" }}>
                    <FolderKanban size={40} opacity={0.4} />
                    <p style={{ margin: 0 }}>No hay grupos de proyecto registrados en el programa ADSO.</p>
                </div>
            ) : gruposFiltrados.length === 0 ? (
                <div className="list-vacia-container" style={{ padding: "30px 0" }}>
                    <Inbox size={28} />
                    <p className="list-vacia" style={{ padding: 0 }}>No se encontraron grupos que coincidan con el filtro.</p>
                </div>
            ) : (
                <div className="bloque-separado" style={{ padding: 0, overflow: "hidden" }}>
                    <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Grupo & Código</th>
                                    <th>Ficha</th>
                                    <th>Scrum Master (Líder)</th>
                                    <th>Integrantes</th>
                                    <th>Proyecto Vinculado</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gruposFiltrados.map((g) => {
                                    const estadoInfo = BADGE_ESTADO[g.estado_proyecto] || null;
                                    return (
                                        <tr key={g.grupo_id}>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontWeight: 600 }}>{g.nombre_grupo}</span>
                                                    <span className="admin-count" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.74rem" }}>
                                                        <Hash size={11} /> {g.codigo_grupo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ficha-badge" style={{ fontSize: "0.75rem" }}>
                                                    Ficha {g.numero_ficha}
                                                </span>
                                            </td>
                                            <td>
                                                {g.lider_nombre ? (
                                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                                                        <Crown size={13} style={{ color: "#f59e0b" }} />
                                                        <span>{g.lider_nombre} {g.lider_apellido}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ opacity: 0.5 }}>Sin Scrum Master</span>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: "0.84rem" }}>
                                                    <Users size={13} style={{ color: "var(--color-primary)" }} /> {g.cantidad_integrantes || 1} integrante(s)
                                                </span>
                                            </td>
                                            <td>
                                                {g.nombre_proyecto ? (
                                                    <span style={{ fontWeight: 600, color: "var(--color-text-main)" }}>
                                                        {g.nombre_proyecto}
                                                    </span>
                                                ) : (
                                                    <span className="list-vacia" style={{ padding: 0, fontSize: "0.78rem" }}>
                                                        Sin proyecto asignado
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {g.estado_proyecto ? (
                                                    <span className={`badge-rol ${estadoInfo?.clase || "badge-aprendiz"}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                        {estadoInfo?.icono} {g.estado_proyecto}
                                                    </span>
                                                ) : (
                                                    <span style={{ opacity: 0.5 }}>—</span>
                                                )}
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

export default Grupos;