/*
  Los modales de "seguridad" del panel admin.
  Refactor UI/UX: Inclusión del campo Ficha en el formulario de usuario cuando el rol es APRENDIZ,
  estilos pulidos, avisos defensivos e iconografía.
*/

import { useState } from "react";
import { User, ShieldCheck, X, AlertCircle, Key, FileText } from "lucide-react";

const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PEP"];
const ROLES = [
  { valor: "APRENDIZ", label: "Aprendiz" },
  { valor: "INSTRUCTOR", label: "Instructor" },
  { valor: "COORDINADOR", label: "Coordinador" },
  { valor: "ADMINISTRADOR", label: "Administrador" },
];
const JORNADAS = ["Diurna", "Nocturna", "Mixsta"];

// Modal con el formulario de usuario (crear o editar según `initial`)
export function UserFormModal({
  titulo,
  initial,        // si viene, es EDITAR (prellenado); si no, CREAR
  rolFijo,        // rol obligatorio o null
  cargando,
  onConfirmar,    // recibe el form (con password del admin)
  onCerrar,
}) {
  const [form, setForm] = useState(() => ({
    nombre: initial?.nombre || "",
    apellido: initial?.apellido || "",
    correo: initial?.correo || "",
    tipo_documento: initial?.tipo_documento || "CC",
    numero_documento: initial?.numero_documento || "",
    ficha: initial?.ficha || "", // Campo de ficha asignada
    rol: initial?.rol || rolFijo || "APRENDIZ",
    userPassword: "", // solo para crear
    password: "",     // contraseña del admin siempre
  }));
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.correo || !form.numero_documento) {
      return setError("Por favor completa los campos obligatorios del usuario.");
    }
    if (!form.password) {
      return setError("Ingresa tu contraseña de Administrador para autorizar los cambios.");
    }
    if (!initial && !form.userPassword) {
      return setError("Ingresa la contraseña para la nueva cuenta.");
    }
    onConfirmar(form);
  };

  const esAprendiz = form.rol === "APRENDIZ";

  return (
    <div className="modal-overlay" onClick={cargando ? undefined : onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <User size={20} style={{ color: "var(--color-primary)" }} />
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{titulo}</h3>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="modal-grid" style={{ marginBottom: 10 }}>
            <div>
              <label className="modal-label">Nombre</label>
              <input name="nombre" value={form.nombre} onChange={cambiar} className="modal-input" placeholder="Nombre" />
            </div>
            <div>
              <label className="modal-label">Apellido</label>
              <input name="apellido" value={form.apellido} onChange={cambiar} className="modal-input" placeholder="Apellido" />
            </div>
          </div>

          <label className="modal-label">Correo Institucional</label>
          <input name="correo" type="email" value={form.correo} onChange={cambiar} className="modal-input" placeholder="usuario@soy.sena.edu.co" style={{ marginBottom: 10 }} />

          <div className="modal-grid" style={{ marginBottom: 10 }}>
            <div>
              <label className="modal-label">Tipo Doc.</label>
              <select name="tipo_documento" value={form.tipo_documento} onChange={cambiar} className="modal-input">
                {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Nro. Documento</label>
              <input name="numero_documento" value={form.numero_documento} onChange={cambiar} className="modal-input" placeholder="Número de Identificación" />
            </div>
          </div>

          {!rolFijo && (
            <div style={{ marginBottom: 10 }}>
              <label className="modal-label">Rol en el Sistema</label>
              <select name="rol" value={form.rol} onChange={cambiar} className="modal-input">
                {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.label}</option>)}
              </select>
            </div>
          )}

          {/* Campo de Ficha visible únicamente si es Aprendiz */}
          {esAprendiz && (
            <div style={{ marginBottom: 10 }}>
              <label className="modal-label">Ficha de Formación (Número)</label>
              <input name="ficha" value={form.ficha} onChange={cambiar} className="modal-input" placeholder="Ej: 2724290" />
            </div>
          )}

          {!initial && (
            <div style={{ marginBottom: 10 }}>
              <label className="modal-label">Contraseña de la nueva cuenta</label>
              <input name="userPassword" type="password" value={form.userPassword} onChange={cambiar} className="modal-input" placeholder="Mínimo 8 caracteres" />
            </div>
          )}

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(128,128,128,0.15)" }}>
            <label className="modal-label" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary)" }}>
              <ShieldCheck size={14} /> Tu contraseña de Administrador (para confirmar)
            </label>
            <input name="password" type="password" value={form.password} onChange={cambiar} className="modal-input" placeholder="Confirma con tu contraseña" autoFocus />
          </div>

          {error && (
            <div className="server-error" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={cargando}>Cancelar</button>
            <button type="submit" className="btn-rol" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal del formulario de ficha
export function FichaFormModal({
  titulo,
  initial,        
  programas,      
  cargando,
  onConfirmar,    
  onCerrar,
}) {
  const [form, setForm] = useState(() => ({
    codigo_programa: initial?.codigo_programa || "",
    numero_ficha: initial?.numero_ficha || "",
    fecha_inicio: initial?.fecha_inicio || "",
    fecha_fin: initial?.fecha_fin || "",
    jornada: initial?.jornada || "Diurna",
    password: "", 
  }));
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!form.codigo_programa || !form.numero_ficha || !form.fecha_inicio || !form.fecha_fin || !form.jornada) {
      return setError("Completa todos los campos obligatorios de la ficha.");
    }
    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) {
      return setError("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
    if (!form.password) {
      return setError("Escribe tu contraseña de admin para confirmar la acción.");
    }
    onConfirmar(form);
  };

  return (
    <div className="modal-overlay" onClick={cargando ? undefined : onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={20} style={{ color: "var(--color-primary)" }} />
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{titulo}</h3>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <label className="modal-label">Programa de Formación</label>
          <select name="codigo_programa" value={form.codigo_programa} onChange={cambiar} className="modal-input" disabled={!!initial} style={{ marginBottom: 10 }}>
            <option value="">Selecciona un programa</option>
            {programas.map((p) => (
              <option key={p.programa_id} value={p.codigo_programa}>
                {p.codigo_programa} - {p.nombre_programa}
              </option>
            ))}
          </select>

          <label className="modal-label">Número de Ficha</label>
          <input name="numero_ficha" value={form.numero_ficha} onChange={cambiar} className="modal-input" placeholder="Ej: 2724290" style={{ marginBottom: 10 }} />

          <div className="modal-grid" style={{ marginBottom: 10 }}>
            <div>
              <label className="modal-label">Fecha de Inicio</label>
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={cambiar} className="modal-input" />
            </div>
            <div>
              <label className="modal-label">Fecha de Fin</label>
              <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={cambiar} className="modal-input" />
            </div>
          </div>

          <label className="modal-label">Jornada</label>
          <select name="jornada" value={form.jornada} onChange={cambiar} className="modal-input" style={{ marginBottom: 12 }}>
            {JORNADAS.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>

          <div style={{ paddingTop: 12, borderTop: "1px solid rgba(128,128,128,0.15)" }}>
            <label className="modal-label" style={{ color: "var(--color-primary)" }}>Tu contraseña de admin (para confirmar)</label>
            <input name="password" type="password" value={form.password} onChange={cambiar} className="modal-input" placeholder="Tu contraseña" autoFocus />
          </div>

          {error && (
            <div className="server-error" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={cargando}>Cancelar</button>
            <button type="submit" className="btn-rol" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de confirmación: pide la contraseña del admin
export function ConfirmPasswordModal({
  titulo,
  mensaje,
  textoBoton = "Confirmar",
  cargando,
  onConfirmar,
  onCerrar,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!password) return setError("Escribe tu contraseña para confirmar.");
    onConfirmar(password);
  };

  return (
    <div className="modal-overlay" onClick={cargando ? undefined : onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{titulo}</h3>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <p className="admin-count" style={{ marginBottom: 14 }}>{mensaje}</p>
        
        <form onSubmit={manejarSubmit}>
          <label className="modal-label" style={{ color: "var(--color-primary)" }}>Tu contraseña de Administrador</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
            placeholder="Confirma con tu contraseña"
            autoFocus
          />
          {error && (
            <div className="server-error" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={cargando}>Cancelar</button>
            <button type="submit" className="btn-rol" disabled={cargando}>
              {cargando ? "Procesando..." : textoBoton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}