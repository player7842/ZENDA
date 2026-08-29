/*
  Panel Instructores
   A la IZQUIERDA un listado de todos los instructores; al hacer clic en uno,
   a la DERECHA se ven las FICHAS a las que está vinculado.
   Esas fichas son MODIFICABLES: se agregan, se quitan y al dar "Guardar
   cambios" piden la contraseña del admin y se sincronizan en la BD.
   También se puede agregar, editar y eliminar instructores desde aquí.
*/

import { useState } from "react";
import { createUser, updateUser, deleteUser, setInstructorFichas } from "../../api";
import { UserFormModal, ConfirmPasswordModal } from "../../components/admin/Modals";

function Instructores({ users, onDataChanged }) {
  const [selectedId, setSelectedId] = useState(null);
  // modal: null | { tipo:'crear' } | { tipo:'editar', user } | { tipo:'eliminar', user } | { tipo:'fichas', user }
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const instructores = users.filter((u) => u.rol === "INSTRUCTOR");
  const seleccionado = instructores.find((u) => u.usuario_id === selectedId) || null;

  // Copia local de las fichas del instructor seleccionado (antes de guardar)
  const [fichasEdit, setFichasEdit] = useState([]);
  const [nuevaFicha, setNuevaFicha] = useState("");

  const ok = () => {
    setError("");
    setModal(null);
    onDataChanged && onDataChanged();
  };

  const seleccionar = (user) => {
    setSelectedId(user.usuario_id);
    setFichasEdit(user.fichas || []);
    setNuevaFicha("");
  };

  // Agregar instructor (sin ficha fija: las fichas se vinculan después)
  const crear = async (form) => {
    setCargando(true);
    setError("");
    try {
      await createUser({ ...form, rol: "INSTRUCTOR", fichas: [] });
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const editar = async (form) => {
    setCargando(true);
    setError("");
    try {
      const { userPassword, ...datos } = form;
      // Se conservan los vínculos actuales de fichas
      await updateUser(modal.user.usuario_id, { ...datos, fichas: modal.user.fichas || [] });
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const eliminar = async (password) => {
    setCargando(true);
    setError("");
    try {
      await deleteUser(modal.user.usuario_id, password);
      if (selectedId === modal.user.usuario_id) setSelectedId(null);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  // Guardar las fichas vinculadas (con contraseña)
  const guardarFichas = async (password) => {
    setCargando(true);
    setError("");
    try {
      await setInstructorFichas(selectedId, fichasEdit, password);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const agregarFicha = () => {
    const f = nuevaFicha.trim();
    if (!f) return;
    if (!fichasEdit.includes(f)) setFichasEdit((prev) => [...prev, f].sort());
    setNuevaFicha("");
  };

  const quitarFicha = (f) => setFichasEdit((prev) => prev.filter((x) => x !== f));

  return (
    <div>
      <h2>Instructores</h2>
      <p className="admin-hint">Selecciona un instructor para ver y modificar las fichas a las que está vinculado.</p>

      <div className="panel-split">
        {/* Listado de instructores */}
        <div className="panel-list">
          <div className="panel-list-head">
            <h3 className="panel-list-title">Instructores</h3>
            <button className="btn-rol btn-rol-mini" onClick={() => setModal({ tipo: "crear" })} title="Agregar instructor">+</button>
          </div>
          {instructores.length === 0 ? (
            <p className="list-vacia">No hay instructores.</p>
          ) : (
            instructores.map((u) => (
              <button
                key={u.usuario_id}
                className={`panel-list-item ${selectedId === u.usuario_id ? "active" : ""}`}
                onClick={() => seleccionar(u)}
              >
                <span className="panel-list-num">{u.nombre} {u.apellido}</span>
                <span className="panel-list-count">{(u.fichas || []).length}</span>
              </button>
            ))
          )}
        </div>

        {/* Detalle: fichas vinculadas al instructor seleccionado */}
        <div className="panel-detail">
          {!seleccionado ? (
            <div className="panel-empty">Selecciona un instructor del listado para ver sus fichas vinculadas.</div>
          ) : (
            <>
              <div className="panel-detail-header">
                <div>
                  <h3>{seleccionado.nombre} {seleccionado.apellido}</h3>
                  <p className="admin-count">{seleccionado.correo}</p>
                </div>
                <div className="acciones-cell">
                  <button className="btn-accion" onClick={() => setModal({ tipo: "editar", user: seleccionado })}>Editar</button>
                  <button className="btn-accion btn-accion-danger" onClick={() => setModal({ tipo: "eliminar", user: seleccionado })}>Eliminar</button>
                </div>
              </div>

              <div className="instructor-fichas">
                <h4>Fichas vinculadas</h4>

                {fichasEdit.length === 0 ? (
                  <p className="list-vacia">Este instructor no tiene fichas vinculadas todavía.</p>
                ) : (
                  <div className="chips-wrap">
                    {fichasEdit.map((f) => (
                      <span key={f} className="chip-ficha chip-ficha-quitable">
                        Ficha {f}
                        <button className="chip-quitar" onClick={() => quitarFicha(f)} title="Quitar ficha">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="add-ficha">
                  <input
                    type="text"
                    className="add-ficha-input"
                    placeholder="Ej: 2724285"
                    value={nuevaFicha}
                    onChange={(e) => setNuevaFicha(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarFicha(); } }}
                  />
                  <button className="btn-accion" onClick={agregarFicha}>Agregar ficha</button>
                </div>

                <div className="instructor-fichas-actions">
                  <button className="btn-rol" onClick={() => setModal({ tipo: "fichas" })}>
                    Guardar cambios
                  </button>
                  <span className="admin-count">Pide tu contraseña para guardar</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <div className="server-error" style={{ marginTop: "16px" }}>{error}</div>}

      {modal?.tipo === "crear" && (
        <UserFormModal
          titulo="Agregar instructor"
          rolFijo="INSTRUCTOR"
          cargando={cargando}
          onConfirmar={crear}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar" && (
        <UserFormModal
          titulo={`Editar a ${modal.user.nombre} ${modal.user.apellido}`}
          initial={modal.user}
          rolFijo="INSTRUCTOR"
          cargando={cargando}
          onConfirmar={editar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "eliminar" && (
        <ConfirmPasswordModal
          titulo="Eliminar instructor"
          mensaje={`¿Seguro que quieres eliminar a ${modal.user.nombre} ${modal.user.apellido}? Esta acción no se puede deshacer.`}
          textoBoton="Sí, eliminar"
          cargando={cargando}
          onConfirmar={eliminar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "fichas" && (
        <ConfirmPasswordModal
          titulo="Guardar fichas vinculadas"
          mensaje={`Vas a guardar ${fichasEdit.length} ficha(s) para ${seleccionado.nombre} ${seleccionado.apellido}. Confirma con tu contraseña.`}
          textoBoton="Guardar fichas"
          cargando={cargando}
          onConfirmar={guardarFichas}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Instructores;