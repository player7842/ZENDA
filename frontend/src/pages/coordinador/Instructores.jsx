/*
  Vista "Instructores" del panel de Coordinación · ADSO.
  UI/UX Avanzado: Buscador en vivo de instructores, validación estricta de fichas dentro del ámbito ADSO,
  chips de fichas interactivos, Skeleton loading y confirmación de seguridad con contraseña.
*/

import { useState, useEffect } from "react";
import {
    UserCheck,
    Search,
    Plus,
    X,
    Save,
    Layers,
    Mail,
    Inbox,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2
} from "lucide-react";
import {
    getFichasCoordinador,
    getInstructoresCoordinador,
    setFichasInstructorCoordinador
} from "../../api";
import { ConfirmPasswordModal } from "../../components/admin/Modals";

function Instructores() {
    const [fichas, setFichas] = useState([]);
    const [instructores, setInstructores] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedId, setSelectedId] = useState(null);
    const [fichasEdit, setFichasEdit] = useState([]);
    const [nuevaFicha, setNuevaFicha] = useState("");
    const [modalFichas, setModalFichas] = useState(false);
    const [cargando, setCargando] = useState(false);

    const fetchTodo = async () => {
        setLoading(true);
        setError("");
        try {
            const [f, i] = await Promise.all([
                getFichasCoordinador(),
                getInstructoresCoordinador()
            ]);
            setFichas(f || []);
            setInstructores(i || []);
        } catch (err) {
            setError(err?.message || "Error al cargar la lista de instructores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodo();
    }, []);

    const instructoresFiltrados = instructores.filter((u) => {
        const q = busqueda.toLowerCase();
        return (
            u.nombre?.toLowerCase().includes(q) ||
            u.apellido?.toLowerCase().includes(q) ||
            u.correo?.toLowerCase().includes(q)
        );
    });

    const seleccionado = instructores.find((u) => u.usuario_id === selectedId) || null;

    const seleccionar = (u) => {
        setSelectedId(u.usuario_id);
        setFichasEdit(u.fichas || []);
        setNuevaFicha("");
        setError("");
    };

    const agregarFicha = () => {
        const f = nuevaFicha.trim();
        if (!f) return;

        // Validación de pertenencia a ADSO
        const existeEnADSO = fichas.some((fi) => String(fi.numero_ficha) === f);
        if (!existeEnADSO) {
            setError(`La ficha ${f} no pertenece al programa ADSO bajo tu coordinación.`);
            return;
        }

        setError("");
        if (!fichasEdit.includes(f)) {
            setFichasEdit((prev) => [...prev, f].sort());
        }
        setNuevaFicha("");
    };

    const quitarFicha = (f) => setFichasEdit((prev) => prev.filter((x) => x !== f));

    const guardarFichas = async (password) => {
        setCargando(true);
        setError("");
        try {
            await setFichasInstructorCoordinador(selectedId, fichasEdit, password);
            setModalFichas(false);
            await fetchTodo();
        } catch (e) {
            setError(e?.message || "Error al actualizar la asignación de fichas");
            setModalFichas(false);
        } finally {
            setCargando(false);
        }
    };

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
                <h2 style={{ margin: "0 0 4px" }}>Instructores de Coordinación · ADSO</h2>
                <p className="admin-count">Supervisión y asignación de fichas técnicas docentes del programa</p>
            </div>

            {error && (
                <div className="server-error" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <div className="panel-split">
                {/* Panel Izquierdo: Lista de Instructores con Buscador */}
                <div className="panel-list">
                    <div className="panel-list-head" style={{ marginBottom: 10 }}>
                        <p className="panel-list-title" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                            <UserCheck size={16} /> Instructores ({instructoresFiltrados.length})
                        </p>
                    </div>

                    <div className="search-box-wrap" style={{ marginBottom: 12 }}>
                        <span className="search-box-icon">
                            <Search size={14} />
                        </span>
                        <input
                            className="modal-input"
                            placeholder="Buscar por nombre o correo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {instructores.length === 0 ? (
                        <div className="list-vacia-container" style={{ padding: "20px 0" }}>
                            <Inbox size={28} />
                            <p className="list-vacia" style={{ padding: 0 }}>No hay instructores registrados.</p>
                        </div>
                    ) : instructoresFiltrados.length === 0 ? (
                        <p className="list-vacia" style={{ textAlign: "center", padding: "16px 0" }}>
                            Sin resultados de búsqueda.
                        </p>
                    ) : (
                        instructoresFiltrados.map((u) => (
                            <button
                                key={u.usuario_id}
                                className={`panel-list-item ${selectedId === u.usuario_id ? "active" : ""}`}
                                onClick={() => seleccionar(u)}
                            >
                                <span className="panel-list-num" style={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</span>
                                <span className="ficha-badge">{(u.fichas || []).length} fichas</span>
                            </button>
                        ))
                    )}
                </div>

                {/* Panel Derecho: Detalle de Fichas Vinculadas */}
                <div className="panel-detail">
                    {!seleccionado ? (
                        <div className="fases-empty-state">
                            <UserCheck size={40} opacity={0.4} />
                            <div>
                                <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Selecciona un instructor</h4>
                                <p style={{ margin: 0, fontSize: "0.82rem" }}>
                                    Elige un instructor del listado lateral para administrar sus fichas ADSO asociadas.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header Contextual del Instructor */}
                            <div className="panel-detail-header" style={{ marginBottom: 20 }}>
                                <div>
                                    <h3 style={{ margin: "0 0 4px" }}>{seleccionado.nombre} {seleccionado.apellido}</h3>
                                    <p className="admin-count" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <Mail size={13} /> {seleccionado.correo}
                                    </p>
                                </div>
                            </div>

                            {/* Bloque de Fichas ADSO */}
                            <div className="bloque-separado">
                                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                    <Layers size={16} /> Fichas ADSO vinculadas ({fichasEdit.length})
                                </p>

                                {fichasEdit.length === 0 ? (
                                    <div className="fases-empty-state" style={{ padding: "20px 0", marginBottom: 16 }}>
                                        <Layers size={32} opacity={0.3} />
                                        <p style={{ margin: 0, fontSize: "0.82rem" }}>Este instructor no tiene fichas ADSO vinculadas actualmente.</p>
                                    </div>
                                ) : (
                                    <div className="chips-wrap" style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {fichasEdit.map((f) => (
                                            <span
                                                key={f}
                                                className="chip-ficha chip-ficha-quitable"
                                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(9, 132, 227, 0.12)", color: "var(--color-primary)", fontWeight: 600, fontSize: "0.82rem", border: "1px solid rgba(9, 132, 227, 0.25)" }}
                                            >
                                                Ficha {f}
                                                <button
                                                    className="chip-quitar"
                                                    onClick={() => quitarFicha(f)}
                                                    title="Quitar ficha"
                                                    style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", color: "inherit", padding: 0 }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Input Agregar Ficha */}
                                <div className="add-ficha" style={{ gap: 10, marginBottom: 16 }}>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="Número de ficha ADSO (Ej: 2724285)"
                                        value={nuevaFicha}
                                        onChange={(e) => setNuevaFicha(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                agregarFicha();
                                            }
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        className="btn-accion"
                                        onClick={agregarFicha}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38 }}
                                    >
                                        <Plus size={14} /> Vincular
                                    </button>
                                </div>

                                {/* Footer de Acciones con Contraseña */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(128,128,128,0.12)", flexWrap: "wrap", gap: 10 }}>
                                    <span className="admin-count" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        <ShieldCheck size={13} /> Pide tu contraseña para confirmar
                                    </span>
                                    <button
                                        className="btn-rol"
                                        onClick={() => setModalFichas(true)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                    >
                                        <Save size={14} /> Guardar cambios
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal de Confirmación */}
            {modalFichas && seleccionado && (
                <ConfirmPasswordModal
                    titulo="Guardar fichas vinculadas"
                    mensaje={`Vas a actualizar ${fichasEdit.length} ficha(s) ADSO asignada(s) a ${seleccionado.nombre} ${seleccionado.apellido}. Confirma con tu contraseña.`}
                    textoBoton="Guardar fichas"
                    cargando={cargando}
                    onConfirmar={guardarFichas}
                    onCerrar={() => setModalFichas(false)}
                />
            )}
        </div>
    );
}

export default Instructores;