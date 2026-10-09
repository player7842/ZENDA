/*
  Modal Asistente de Carga Masiva (CSV).
  UI/UX Avanzado: Parser de CSV nativo, validación defensiva en vivo,
  resumen de registros procesados y confirmación segura con contraseña.
*/

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2, X, Lock } from "lucide-react";

function BulkImportModal({ fichas = [], cargando, onConfirmar, onCerrar }) {
    const [paso, setPaso] = useState(1); // 1: Carga, 2: Vista previa, 3: Password
    const [datosPrevia, setDatosPrevia] = useState([]);
    const [errorArchivo, setErrorArchivo] = useState("");
    const [passwordAdmin, setPasswordAdmin] = useState("");

    // Parser simple de CSV (Formato: nombre,apellido,correo,documento,tipo_documento,numero_ficha,rol)
    const procesarCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            setErrorArchivo("Por favor selecciona un archivo con formato .csv");
            return;
        }

        setErrorArchivo("");
        const reader = new FileReader();
        reader.onload = (evt) => {
            const texto = evt.target.result;
            const lineas = texto.split(/\r\n|\n/).filter((l) => l.trim() !== "");

            if (lineas.length <= 1) {
                setErrorArchivo("El archivo CSV está vacío o solo contiene encabezados.");
                return;
            }

            const filas = [];
            // Omitir fila 0 (encabezados)
            for (let i = 1; i < lineas.length; i++) {
                const cols = lineas[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
                if (cols.length >= 3) {
                    filas.push({
                        nombre: cols[0] || "",
                        apellido: cols[1] || "",
                        correo: cols[2] || "",
                        numero_documento: cols[3] || "",
                        tipo_documento: cols[4] || "CC",
                        numero_ficha: cols[5] || "",
                        rol: (cols[6] || "APRENDIZ").toUpperCase(),
                    });
                }
            }

            setDatosPrevia(filas);
            setPaso(2);
        };
        reader.readAsText(file);
    };

    const handleFinalizar = (e) => {
        e.preventDefault();
        onConfirmar(datosPrevia, passwordAdmin);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content-lg" style={{ maxWidth: 620 }}>
                {/* Header del Modal */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <FileSpreadsheet size={22} style={{ color: "var(--color-primary)" }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Carga Masiva de Usuarios</h3>
                            <span className="admin-count" style={{ fontSize: "0.78rem" }}>
                                Paso {paso} de 3: {paso === 1 ? "Seleccionar archivo" : paso === 2 ? "Vista previa" : "Confirmación"}
                            </span>
                        </div>
                    </div>
                    <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                        <X size={20} />
                    </button>
                </div>

                {/* PASO 1: DRAG & DROP Y SELECCIÓN */}
                {paso === 1 && (
                    <div>
                        <label className="dropzone-container" style={{ display: "block" }}>
                            <input type="file" accept=".csv" onChange={procesarCSV} style={{ display: "none" }} />
                            <UploadCloud size={42} style={{ color: "var(--color-primary)", marginBottom: 8 }} />
                            <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem" }}>Haz clic o arrastra tu archivo CSV aquí</h4>
                            <p className="admin-count" style={{ margin: 0 }}>
                                Estructura requerida: <code>nombre, apellido, correo, documento, tipo_doc, ficha, rol</code>
                            </p>
                        </label>

                        {errorArchivo && (
                            <div className="server-error" style={{ marginTop: 14 }}>
                                <AlertTriangle size={16} /> {errorArchivo}
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 2: VISTA PREVIA Y VALIDACIÓN */}
                {paso === 2 && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                Registros detectados: <strong>{datosPrevia.length}</strong>
                            </span>
                            <button
                                className="btn-accion"
                                onClick={() => setPaso(1)}
                                style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                            >
                                Cambiar archivo
                            </button>
                        </div>

                        <div className="import-preview-table-wrap">
                            <table className="admin-table" style={{ fontSize: "0.78rem" }}>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Ficha</th>
                                        <th>Rol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosPrevia.map((u, idx) => (
                                        <tr key={idx}>
                                            <td>{u.nombre} {u.apellido}</td>
                                            <td>{u.correo}</td>
                                            <td>{u.numero_ficha || "—"}</td>
                                            <td>
                                                <span className={`badge-rol badge-${u.rol.toLowerCase()}`}>{u.rol}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-actions" style={{ marginTop: 16 }}>
                            <button className="btn-cancelar" onClick={onCerrar}>Cancelar</button>
                            <button className="btn-rol" onClick={() => setPaso(3)}>
                                Siguiente ({datosPrevia.length} usuarios)
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 3: CONFIRMACIÓN DE SEGURIDAD */}
                {paso === 3 && (
                    <form onSubmit={handleFinalizar}>
                        <div style={{ textAlign: "center", padding: "10px 0" }}>
                            <Lock size={36} style={{ color: "var(--color-primary)", marginBottom: 8 }} />
                            <h4 style={{ margin: "0 0 6px" }}>Confirmación de Administrador</h4>
                            <p className="admin-count" style={{ marginBottom: 16 }}>
                                Estás a punto de registrar <strong>{datosPrevia.length} usuarios</strong> en el sistema. Ingresa tu contraseña para autorizar la importación.
                            </p>
                        </div>

                        <input
                            type="password"
                            className="modal-input"
                            required
                            placeholder="Tu contraseña de Administrador"
                            value={passwordAdmin}
                            onChange={(e) => setPasswordAdmin(e.target.value)}
                            style={{ marginBottom: 16 }}
                        />

                        <div className="modal-actions">
                            <button type="button" className="btn-cancelar" onClick={() => setPaso(2)} disabled={cargando}>
                                Atrás
                            </button>
                            <button type="submit" className="btn-rol" disabled={cargando || !passwordAdmin}>
                                {cargando ? "Importando registros..." : "Confirmar e Importar"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default BulkImportModal;