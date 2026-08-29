/*
  Los modales de "seguridad" del panel admin.
  Cualquier acción delicada (crear, editar, borrar) exige la contraseña del admin
  logueado. Aquí están las dos piezas reutilizables:
   - UserFormModal: formulario para crear o editar un usuario (+password de confirmación)
   - ConfirmPasswordModal: solo pide la contraseña para confirmar (ej. eliminar)
*/

import { useState } from "react";

const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PEP"];
const ROLES = ["aprendiz", "instructor", "coordinador", "admin"];

// Modal con el formulario de usuario (crear o editar según `initial`)
export function UserFormModal({
  titulo,
  initial,        // si viene, es EDITAR (prellenado); si no, CREAR
  fichaFija,      // ficha obligatoria (panel de fichas) o null
  rolFijo,        // rol obligatorio (panel de instructores) o null
  cargando,
  onConfirmar,    // recibe el form (con password del admin)
  onCerrar,
}) {
  const [form, setForm] = useState(() => ({
    nombre: initial?.nombre || "",
    apellido: initial?.apellido || "",
    email: initial?.email || "",
    ficha: initial?.ficha || fichaFija || "",
    tipo_documento: initial?.tipo_documento || "CC",
    numero_documento: initial?.numero_documento || "",
    rol: initial?.rol || rolFijo || "aprendiz",
    userPassword: "", // solo para crear
    password: "",     // contraseña del admin siempre
  }));
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.email || !form.numero_documento) {
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
          <input name="email" type="email" value={form.email} onChange={cambiar} className="modal-input" placeholder="usuario@dominio.edu.co" />

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

          {!fichaFija && (
            <>
              <label className="modal-label">Ficha</label>
              <input name="ficha" value={form.ficha} onChange={cambiar} className="modal-input" placeholder="Ej: 2724285" />
            </>
          )}

          {!rolFijo && (
            <>
              <label className="modal-label">Rol</label>
              <select name="rol" value={form.rol} onChange={cambiar} className="modal-input">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
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