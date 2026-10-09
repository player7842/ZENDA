import { useState } from "react";
import { X, BookOpen, Plus, Save } from "lucide-react";

function ProgramFormModal({ titulo, initial = null, cargando, onConfirmar, onCerrar }) {
    const [form, setForm] = useState({
        nombre_programa: initial?.nombre_programa || "",
        nivel_formacion: initial?.nivel_formacion || "Tecnólogo",
        codigo_programa: initial?.codigo_programa || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirmar(form);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content-lg" style={{ maxWidth: 480 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BookOpen size={20} style={{ color: "var(--color-primary)" }} />
                        <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{titulo}</h3>
                    </div>
                    <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="modal-label">Nombre del Programa</label>
                    <input
                        className="modal-input"
                        required
                        placeholder="Ej: Análisis y Desarrollo de Software"
                        value={form.nombre_programa}
                        onChange={(e) => setForm({ ...form, nombre_programa: e.target.value })}
                        style={{ marginBottom: 12 }}
                    />

                    <div className="modal-grid" style={{ marginBottom: 16 }}>
                        <div>
                            <label className="modal-label">Código del Programa</label>
                            <input
                                className="modal-input"
                                required
                                placeholder="Ej: 228106"
                                value={form.codigo_programa}
                                onChange={(e) => setForm({ ...form, codigo_programa: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="modal-label">Nivel de Formación</label>
                            <select
                                className="modal-select"
                                value={form.nivel_formacion}
                                onChange={(e) => setForm({ ...form, nivel_formacion: e.target.value })}
                            >
                                <option value="Tecnólogo">Tecnólogo</option>
                                <option value="Técnico">Técnico</option>
                                <option value="Especialización">Especialización</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={cargando}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-rol" disabled={cargando} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {initial ? <Save size={14} /> : <Plus size={14} />}
                            {cargando ? "Guardando..." : initial ? "Guardar cambios" : "Crear programa"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProgramFormModal;