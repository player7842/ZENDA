/*
  Módulo de Gestión de Programas de Formación.
  UI/UX Avanzado: Panel split, buscador en vivo, resumen de fichas asociadas
  y modales de creación/edición con confirmación segura.
*/

import { useState } from "react";
import {
    BookOpen,
    Plus,
    Search,
    Edit3,
    Trash2,
    Inbox,
    AlertTriangle,
    ClipboardList,
    Layers
} from "lucide-react";
import { createPrograma, updatePrograma, deletePrograma } from "../../api";
import ProgramFormModal from "../../components/admin/ProgramFormModal";
import { ConfirmPasswordModal } from "../../components/admin/Modals";

function Programas({ programas = [], fichas = [], onDataChanged }) {
    const [selectedId, setSelectedId] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [modal, setModal] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const programasFiltrados = programas.filter((p) => {
        const q = busqueda.toLowerCase();
        return (
            p.nombre_programa?.toLowerCase().includes(q) ||
            (p.codigo_programa && String(p.codigo_programa).includes(q))
        );
    });

    const seleccionado = programas.find((p) => p.programa_id === selectedId) || null;

    // Fichas asociadas al programa seleccionado
    const fichasDelPrograma = seleccionado
        ? fichas.filter((f) => f.programa_id === seleccionado.programa_id)
        : [];

    const ok = () => {
        setError("");
        setModal(null);
        onDataChanged && onDataChanged();
    };

    const crear = async (form) => {
        setCargando(true);
        setError("");
        try {
            await createPrograma(form);
            ok();
        } catch (e) {
            setError(e.message);
            setModal(null);
        } finally {
            setCargando(false);
        }
    };

    const editar = async (form) => {
        setCargando(true);
        setError("");
        try {
            await updatePrograma(modal.programa.programa_id, form);
            ok();
        } catch (e) {
            setError(e.message);
            setModal(null);
        } finally {
            setCargando(false);
        }
    };

    const eliminar = async (password) => {
        setCargando(true);
        setError("");
        try {
            await deletePrograma(modal.programa.programa_id, password);
            if (selectedId === modal.programa.programa_id) setSelectedId(null);
            ok();
        } catch (e) {
            setError(e.message);
            setModal(null);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 4px" }}>Programas de Formación</h2>
                <p className="admin-count">Administración de la oferta académica del centro de formación SENA</p>
            </div>

            {error && (
                <div className="server-error" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <div className="panel-split">
                {/* Lista de Programas con Buscador */}
                <div className="panel-list">
                    <div className="panel-list-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <p className="panel-list-title" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                            <BookOpen size={16} /> Programas ({programasFiltrados.length})
                        </p>
                        <button
                            className="btn-rol btn-rol-mini"
                            onClick={() => setModal({ tipo: "crear" })}
                            title="Nuevo programa"
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 8px" }}
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="search-box-wrap" style={{ marginBottom: 12 }}>
                        <span className="search-box-icon">
                            <Search size={14} />
                        </span>
                        <input
                            className="modal-input"
                            placeholder="Buscar programa..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {programas.length === 0 ? (
                        <div className="list-vacia-container" style={{ padding: "20px 0" }}>
                            <Inbox size={28} />
                            <p className="list-vacia" style={{ padding: 0 }}>No hay programas creados.</p>
                        </div>
                    ) : programasFiltrados.length === 0 ? (
                        <p className="list-vacia" style={{ textAlign: "center", padding: "16px 0" }}>
                            Sin resultados para la búsqueda.
                        </p>
                    ) : (
                        programasFiltrados.map((p) => {
                            const cantFichas = fichas.filter((f) => f.programa_id === p.programa_id).length;
                            return (
                                <button
                                    key={p.programa_id}
                                    className={`panel-list-item ${selectedId === p.programa_id ? "active" : ""}`}
                                    onClick={() => setSelectedId(p.programa_id)}
                                >
                                    <span className="panel-list-num" style={{ fontWeight: 600 }}>{p.nombre_programa}</span>
                                    <span className="ficha-badge">
                                        {cantFichas} {cantFichas === 1 ? "ficha" : "fichas"}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Detalle del Programa */}
                <div className="panel-detail">
                    {!seleccionado ? (
                        <div className="fases-empty-state">
                            <BookOpen size={40} opacity={0.4} />
                            <div>
                                <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Selecciona un programa</h4>
                                <p style={{ margin: 0, fontSize: "0.82rem" }}>
                                    Elige un programa de la lista lateral para ver sus detalles y fichas asociadas.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="panel-detail-header" style={{ marginBottom: 20 }}>
                                <div>
                                    <h3 style={{ margin: "0 0 4px" }}>{seleccionado.nombre_programa}</h3>
                                    <div style={{ display: "flex", gap: 10, fontSize: "0.82rem", opacity: 0.85 }}>
                                        <span className="proyecto-header-badge">Código: {seleccionado.codigo_programa || "N/A"}</span>
                                        <span className="ficha-badge">{seleccionado.nivel_formacion || "Tecnólogo"}</span>
                                    </div>
                                </div>

                                <div className="acciones-cell" style={{ display: "flex", gap: 8 }}>
                                    <button
                                        className="btn-accion"
                                        onClick={() => setModal({ tipo: "editar", programa: seleccionado })}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                                    >
                                        <Edit3 size={14} /> Editar
                                    </button>
                                    <button
                                        className="btn-accion btn-accion-danger"
                                        onClick={() => setModal({ tipo: "eliminar", programa: seleccionado })}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>

                            {/* Fichas Asociadas al Programa */}
                            <div className="bloque-separado">
                                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                    <ClipboardList size={16} /> Fichas asociadas ({fichasDelPrograma.length})
                                </p>

                                {fichasDelPrograma.length === 0 ? (
                                    <p className="list-vacia" style={{ padding: 0 }}>No hay fichas creadas bajo este programa de formación.</p>
                                ) : (
                                    <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Ficha</th>
                                                    <th>Jornada</th>
                                                    <th>Aprendices</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fichasDelPrograma.map((f) => (
                                                    <tr key={f.ficha_id}>
                                                        <td style={{ fontWeight: 600 }}>Ficha {f.numero_ficha}</td>
                                                        <td>{f.jornada}</td>
                                                        <td>{f.cantidad_aprendices || 0} matriculados</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modales */}
            {modal?.tipo === "crear" && (
                <ProgramFormModal
                    titulo="Crear nuevo programa"
                    cargando={cargando}
                    onConfirmar={crear}
                    onCerrar={() => setModal(null)}
                />
            )}
            {modal?.tipo === "editar" && (
                <ProgramFormModal
                    titulo={`Editar programa: ${modal.programa.nombre_programa}`}
                    initial={modal.programa}
                    cargando={cargando}
                    onConfirmar={editar}
                    onCerrar={() => setModal(null)}
                />
            )}
            {modal?.tipo === "eliminar" && (
                <ConfirmPasswordModal
                    titulo="Eliminar programa de formación"
                    mensaje={`¿Seguro que quieres eliminar el programa "${modal.programa.nombre_programa}"? Confirma con tu contraseña.`}
                    textoBoton="Sí, eliminar programa"
                    cargando={cargando}
                    onConfirmar={eliminar}
                    onCerrar={() => setModal(null)}
                />
            )}
        </div>
    );
}

export default Programas;