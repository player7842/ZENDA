/*
  Vista "Fichas" del panel de Coordinación · ADSO.
  UI/UX Avanzado: Layout panel-split, buscador en vivo, chip cronológico de fechas,
  tarjetas de resumen de aprendices e instructores asignados y Skeleton loader.
*/

import { useState, useEffect } from "react";
import {
    ClipboardList,
    Search,
    Users,
    UserCheck,
    Calendar,
    Inbox,
    AlertTriangle,
    BookOpen,
    Layers
} from "lucide-react";
import { getFichasCoordinador } from "../../api";

function Fichas() {
    const [fichas, setFichas] = useState([]);
    const [selectedFicha, setSelectedFicha] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getFichasCoordinador()
            .then((data) => {
                setFichas(data || []);
                if (data && data.length > 0) {
                    setSelectedFicha(data[0]);
                }
            })
            .catch((err) => setError(err?.message || "Error al obtener las fichas de coordinación"))
            .finally(() => setLoading(false));
    }, []);

    const fichasFiltradas = fichas.filter((f) => {
        const q = busqueda.toLowerCase();
        return (
            String(f.numero_ficha).includes(q) ||
            f.jornada?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="skeleton-box" style={{ height: 32, width: 220 }} />
                <div className="panel-split">
                    <div className="skeleton-box" style={{ height: 340, flex: "0 0 280px" }} />
                    <div className="skeleton-box" style={{ height: 340, flex: 1 }} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 4px" }}>Fichas de Formación · ADSO</h2>
                <p className="admin-count">Supervisión y control de cohortes académicas registradas en el programa</p>
            </div>

            {error && (
                <div className="server-error" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <div className="panel-split">
                {/* Panel Izquierdo: Lista de Fichas con Buscador */}
                <div className="panel-list">
                    <div className="panel-list-head" style={{ marginBottom: 10 }}>
                        <p className="panel-list-title" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                            <ClipboardList size={16} /> Cohortes ({fichasFiltradas.length})
                        </p>
                    </div>

                    <div className="search-box-wrap" style={{ marginBottom: 12 }}>
                        <span className="search-box-icon">
                            <Search size={14} />
                        </span>
                        <input
                            className="modal-input"
                            placeholder="Buscar por ficha o jornada..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {fichas.length === 0 ? (
                        <div className="list-vacia-container" style={{ padding: "20px 0" }}>
                            <Inbox size={28} />
                            <p className="list-vacia" style={{ padding: 0 }}>No hay fichas registradas.</p>
                        </div>
                    ) : fichasFiltradas.length === 0 ? (
                        <p className="list-vacia" style={{ textAlign: "center", padding: "16px 0" }}>
                            Sin coincidencias de búsqueda.
                        </p>
                    ) : (
                        fichasFiltradas.map((f) => (
                            <button
                                key={f.ficha_id}
                                className={`panel-list-item ${selectedFicha?.ficha_id === f.ficha_id ? "active" : ""}`}
                                onClick={() => setSelectedFicha(f)}
                            >
                                <span className="panel-list-num" style={{ fontWeight: 600 }}>Ficha {f.numero_ficha}</span>
                                <span className="ficha-badge">{f.jornada || "Diurna"}</span>
                            </button>
                        ))
                    )}
                </div>

                {/* Panel Derecho: Detalle Ejecutivo de la Ficha */}
                <div className="panel-detail">
                    {!selectedFicha ? (
                        <div className="fases-empty-state">
                            <ClipboardList size={40} opacity={0.4} />
                            <div>
                                <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Selecciona una ficha</h4>
                                <p style={{ margin: 0, fontSize: "0.82rem" }}>
                                    Elige una ficha del listado lateral para visualizar su desglose ejecutivo.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header Contextual de la Ficha */}
                            <div className="panel-detail-header" style={{ marginBottom: 20 }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                                        <h3 style={{ margin: 0 }}>Ficha {selectedFicha.numero_ficha}</h3>
                                        <span className="ficha-badge" style={{ fontSize: "0.78rem", padding: "3px 10px" }}>
                                            Jornada {selectedFicha.jornada}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", gap: 10, fontSize: "0.84rem", opacity: 0.9, flexWrap: "wrap", alignItems: "center" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                                            <BookOpen size={14} style={{ color: "var(--color-primary)" }} /> Análisis y Desarrollo de Software
                                        </span>

                                        {/* Chip Cronológico de Fechas */}
                                        <div className="ficha-dates-badge">
                                            <Calendar size={13} />
                                            <span>
                                                <strong>
                                                    {selectedFicha.fecha_inicio ? new Date(selectedFicha.fecha_inicio).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                                                </strong>
                                                {" → "}
                                                <strong>
                                                    {selectedFicha.fecha_fin ? new Date(selectedFicha.fecha_fin).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grid de Cobertura */}
                            <div className="dash-grid-2" style={{ marginBottom: 20 }}>
                                <div className="dash-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(9, 132, 227, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                                        <Users size={22} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "0.76rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Aprendices Matriculados</span>
                                        <h4 style={{ margin: "2px 0 0", fontSize: "1.1rem" }}>{selectedFicha.cantidad_aprendices || 0} estudiantes</h4>
                                    </div>
                                </div>

                                <div className="dash-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                                        <UserCheck size={22} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "0.76rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Equipo de Instructores</span>
                                        <h4 style={{ margin: "2px 0 0", fontSize: "1.1rem" }}>{selectedFicha.cantidad_instructores || 0} asignados</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla Resumen */}
                            <div className="bloque-separado">
                                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                    <Layers size={16} /> Resumen de la cohorte
                                </p>
                                <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Número de Ficha</th>
                                                <th>Jornada</th>
                                                <th>Fecha Inicio</th>
                                                <th>Fecha Fin</th>
                                                <th>Aprendices</th>
                                                <th>Instructores</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ fontWeight: 600 }}>{selectedFicha.numero_ficha}</td>
                                                <td>{selectedFicha.jornada}</td>
                                                <td>{selectedFicha.fecha_inicio}</td>
                                                <td>{selectedFicha.fecha_fin}</td>
                                                <td><span className="badge-rol badge-aprendiz">{selectedFicha.cantidad_aprendices}</span></td>
                                                <td><span className="badge-rol badge-instructor">{selectedFicha.cantidad_instructores}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Fichas;