/*
  Panel Usuarios
   - Mini menú para filtrar por rol: Estudiantes (por defecto), Instructores,
     Coordinadores y Administradores.
   - el botón EDITAR USUARIO, que permite
     cambiar TODOS los datos (nombre, correo, ficha, documento y rol)
     no lo toquen que es super delicado.
   - También se pueden agregar y eliminar usuarios desde aquí.
   Toda acción delicada pide la contraseña del admin para confirmar.
*/

import { useState } from "react";
import { createUser, updateUser, deleteUser } from "../../api";
import { UserFormModal, ConfirmPasswordModal } from "../../components/admin/Modals";

// Las pestañas del mini menú: etiqueta visible => rol en la BD
const GRUPOS = [
  { id: "estudiantes", etiqueta: "Estudiantes", rol: "aprendiz" },
  { id: "instructores", etiqueta: "Instructores", rol: "instructor" },
  { id: "coordinadores", etiqueta: "Coordinadores", rol: "coordinador" },
  { id: "administradores", etiqueta: "Administradores", rol: "admin" },
];

function Usuarios({ users, onDataChanged }) {
  const [grupo, setGrupo] = useState("estudiantes");
  // modal: null | { tipo:'crear' } | { tipo:'editar', user } | { tipo:'eliminar', user }
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const grupoActivo = GRUPOS.find((g) => g.id === grupo);

  // Los usuarios del grupo activo
  const usuariosDeGrupo = users.filter((u) => u.rol === grupoActivo.rol);

  const ok = () => {
    setError("");
    setModal(null);
    onDataChanged && onDataChanged();
  };

  const crear = async (form) => {
    setCargando(true);
    setError("");
    try {
      // userPassword es la contraseña del nuevo; password la del admin
      await createUser({ ...form, rol: grupoActivo.rol });
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const editar = async (form) => {
    setCargando(true);
    setError("");
    try {
      const { userPassword, ...datos } = form; // userPassword no aplica al editar
      // Si editamos un instructor, mandamos sus fichas para no perder los vínculos
      await updateUser(modal.user.id, { ...datos, fichas: modal.user.fichas || [] });
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const eliminar = async (password) => {
    setCargando(true);
    setError("");
    try {
      await deleteUser(modal.user.id, password);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  return (
    <div>
      <h2>Usuarios</h2>
      <p className="admin-hint">Filtra por rol y usa "Editar usuario" para cambiar todos sus datos. La contraseña del admin confirma cada cambio.</p>

      {/* Mini menú por rol */}
      <div className="roles-tabs">
        {GRUPOS.map((g) => {
          const cantidad = users.filter((u) => u.rol === g.rol).length;
          return (
            <button
              key={g.id}
              className={`roles-tab ${grupo === g.id ? "active" : ""}`}
              onClick={() => setGrupo(g.id)}
            >
              {g.etiqueta} <span className="roles-tab-count">{cantidad}</span>
            </button>
          );
        })}
      </div>

      <div className="panel-detail-header">
        <h3>{grupoActivo.etiqueta}</h3>
        <button className="btn-rol" onClick={() => setModal({ tipo: "crear" })}>
          + Agregar {grupoActivo.etiqueta.toLowerCase()}
        </button>
      </div>

      {usuariosDeGrupo.length === 0 ? (
        <div className="panel-empty">No hay usuarios en este grupo. Agrega el primero.</div>
      ) : (
        <div className="ficha-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Ficha</th>
                {grupoActivo.rol === "instructor" && <th>Fichas vinculadas</th>}
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosDeGrupo.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.ficha || "—"}</td>
                  {grupoActivo.rol === "instructor" && (
                    <td>
                      {(u.fichas && u.fichas.length) ? (
                        <div className="chips-wrap">
                          {u.fichas.map((f) => <span key={f} className="chip-ficha">Ficha {f}</span>)}
                        </div>
                      ) : "—"}
                    </td>
                  )}
                  <td><span className={`badge-rol badge-${u.rol}`}>{u.rol}</span></td>
                  <td className="acciones-cell">
                    <button className="btn-accion" onClick={() => setModal({ tipo: "editar", user: u })}>Editar usuario</button>
                    <button className="btn-accion btn-accion-danger" onClick={() => setModal({ tipo: "eliminar", user: u })}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <div className="server-error" style={{ marginTop: "16px" }}>{error}</div>}

      {modal?.tipo === "crear" && (
        <UserFormModal
          titulo={`Agregar ${grupoActivo.etiqueta.toLowerCase()}`}
          cargando={cargando}
          onConfirmar={crear}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar" && (
        <UserFormModal
          titulo={`Editar a ${modal.user.nombre} ${modal.user.apellido}`}
          initial={modal.user}
          cargando={cargando}
          onConfirmar={editar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "eliminar" && (
        <ConfirmPasswordModal
          titulo="Eliminar usuario"
          mensaje={`¿Seguro que quieres eliminar a ${modal.user.nombre} ${modal.user.apellido}? Esta acción no se puede deshacer.`}
          textoBoton="Sí, eliminar"
          cargando={cargando}
          onConfirmar={eliminar}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Usuarios;