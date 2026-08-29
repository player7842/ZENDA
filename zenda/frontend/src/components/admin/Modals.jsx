/*
  Los modales de "seguridad" del panel admin.
  Cualquier acción delicada (crear, editar, borrar) exige la contraseña del admin
  logueado. Aquí están las piezas reutilizables:
   - UserFormModal: formulario para crear o editar un usuario (+password de confirmación)
   - FichaFormModal: formulario para crear o editar una ficha (+password de confirmación)
   - ConfirmPasswordModal: solo pide la contraseña para confirmar (ej. eliminar)

  MR_ZENDA: los roles son ENUM en MAYÚSCULAS y el correo se llama `correo`.
*/

import { useState } from "react";

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
  rolFijo,        // rol obligatorio (panel de instructores) o null
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
    rol: initial?.rol || rolFijo || "APRENDIZ",
    userPassword: "", // solo para crear
    password: "",     // contraseña del admin siempre
  }));
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.correo || !form.numero_documento) {
      return setError("Completa todos los campos del usuario, perezoso.");
    }
    if (!form.password) {
      return setError("Escribe tu contraseña de admin para confirmar la acción.");
    }
    if (!initial && !form.userPassword) {
      return setError("Pon la contraseña del nuevo usuario.");
    }
    onConfirmar(form);
  };

  return (
    <div className="modal-overlay" onClick={cargando ? undefined : onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <form onSubmit={manejarSubmit}>
          <div className="modal-grid">
            <div>
              <label className="modal-label">Nombre</label>
              <input name="nombre" value={form.nombre} onChange={cambiar} className="modal-input" placeholder="Nombre" />
            </div>
            <div>
              <label className="modal-label">Apellido</label>
              <input name="apellido" value={form.apellido} onChange={cambiar} className="modal-input" placeholder="Apellido" />
            </div>
          </div>

          <label className="modal-label">Correo</label>
          <input name="correo" type="email" value={form.correo} onChange={cambiar} className="modal-input" placeholder="usuario@dominio.edu.co" />

          <div className="modal-grid">
            <div>
              <label className="modal-label">Tipo doc.</label>
              <select name="tipo_documento" value={form.tipo_documento} onChange={cambiar} className="modal-input">
                {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Nro. documento</label>
              <input name="numero_documento" value={form.numero_documento} onChange={cambiar} className="modal-input" placeholder="Número" />
            </div>
          </div>

          {!rolFijo && (
            <>
              <label className="modal-label">Rol</label>
              <select name="rol" value={form.rol} onChange={cambiar} className="modal-input">
                {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.label}</option>)}
              </select>
            </>
          )}

          {!initial && (
            <>
              <label className="modal-label">Contraseña del nuevo usuario</label>
              <input name="userPassword" type="password" value={form.userPassword} onChange={cambiar} className="modal-input" placeholder="Mínimo 8 caracteres" />
            </>
          )}

          <label className="modal-label">Tu contraseña de admin (para confirmar)</label>
          <input name="password" type="password" value={form.password} onChange={cambiar} className="modal-input" placeholder="Tu contraseña" autoFocus />

          {error && <div className="server-error">{error}</div>}

          <div className="modal-actions">
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

// Modal del formulario de ficha (crear o editar según `initial`).
// Si `initial` trae código_programa, en edición NO se puede cambiar el
// programa (eso no se edita, es la identidad del programa).
export function FichaFormModal({
  titulo,
  initial,        // si viene, es EDITAR; si no, CREAR
  programas,      // [{programa_id, codigo_programa, nombre_programa}]
  cargando,
  onConfirmar,    // recibe el form (con password del admin)
  onCerrar,
}) {
  const [form, setForm] = useState(() => ({
    codigo_programa: initial?.codigo_programa || "",
    numero_ficha: initial?.numero_ficha || "",
    fecha_inicio: initial?.fecha_inicio || "",
    fecha_fin: initial?.fecha_fin || "",
    jornada: initial?.jornada || "Diurna",
    password: "", // contraseña del admin siempre
  }));
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!form.codigo_programa || !form.numero_ficha || !form.fecha_inicio || !form.fecha_fin || !form.jornada) {
      return setError("Completa todos los campos de la ficha, perezoso.");
    }
    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) {
      return setError("La fecha de fin debe ser después de la de inicio.");
    }
    if (!form.password) {
      return setError("Escribe tu contraseña de admin para confirmar la acción.");
    }
    onConfirmar(form);
  };

  return (
    <div className="modal-overlay" onClick={cargando ? undefined : onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <form onSubmit={manejarSubmit}>
          <label className="modal-label">Programa de formación</label>
          <select name="codigo_programa" value={form.codigo_programa} onChange={cambiar} className="modal-input" disabled={!!initial}>
            <option value="">Selecciona un programa</option>
            {programas.map((p) => (
              <option key={p.programa_id} value={p.codigo_programa}>
                {p.codigo_programa} - {p.nombre_programa}
              </option>
            ))}
          </select>

          <label className="modal-label">Número de ficha</label>
          <input name="numero_ficha" value={form.numero_ficha} onChange={cambiar} className="modal-input" placeholder="Ej: 2724285" />

          <div className="modal-grid">
            <div>
              <label className="modal-label">Fecha de inicio</label>
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={cambiar} className="modal-input" />
            </div>
            <div>
              <label className="modal-label">Fecha de fin</label>
              <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={cambiar} className="modal-input" />
            </div>
          </div>

          <label className="modal-label">Jornada</label>
          <select name="jornada" value={form.jornada} onChange={cambiar} className="modal-input">
            {JORNADAS.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>

          <label className="modal-label">Tu contraseña de admin (para confirmar)</label>
          <input name="password" type="password" value={form.password} onChange={cambiar} className="modal-input" placeholder="Tu contraseña" autoFocus />

          {error && <div className="server-error">{error}</div>}

          <div className="modal-actions">
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

// Modal de confirmación: solo pide la contraseña del admin (ej. eliminar)
export function ConfirmPasswordModal({
  titulo,
  mensaje,
  textoBoton = "Confirmar",
  cargando,
  onConfirmar, // recibe el password
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <p className="modal-sub">{mensaje}</p>
        <form onSubmit={manejarSubmit}>
          <label className="modal-label">Tu contraseña de admin</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
            placeholder="Confirmar con tu contraseña"
            autoFocus
          />
          {error && <div className="server-error">{error}</div>}
          <div className="modal-actions">
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