/*
  Panel Fichas
   A la IZQUIERDA el listado de TODAS las fichas (con su programa y cuántos
   aprendices tienen); al hacer clic en una, a la DERECHA se ven sus estudiantes.
   Desde aquí se puede:
     - Crear, editar y eliminar fichas (formulario con programa/numero/jornada)
     - Agregar estudiantes a la ficha (crea el aprendiz y lo vincula por grupos)
     - Editar y eliminar estudiantes
   Toda acción delicada pide la contraseña del admin (confirmación).
   MR_ZENDA: las fichas vienen desde /api/fichas y los usuarios de /api/users.
*/

import { useState } from "react";
import {
  createUser, updateUser, deleteUser,
  createFicha, updateFicha, deleteFicha, addAprendizAFicha,
} from "../../api";
import { UserFormModal, FichaFormModal, ConfirmPasswordModal } from "../../components/admin/Modals";

function Fichas({ users, fichas, programas, onDataChanged }) {
  const [selectedFicha, setSelectedFicha] = useState(null);
  // modal: null | { tipo:'crear-estudiante' } | { tipo:'editar-estudiante', user }
  //      | { tipo:'eliminar-estudiante', user } | { tipo:'crear-ficha' }
  //      | { tipo:'editar-ficha', ficha } | { tipo:'eliminar-ficha', ficha }
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Estudiantes de la ficha seleccionada (usuarios = snapshot de /api/users)
  const estudiantes = selectedFicha
    ? users.filter((u) => u.rol === "APRENDIZ" && u.ficha === selectedFicha.numero_ficha)
    : [];

  const ok = (msg) => {
    setError("");
    setModal(null);
    onDataChanged && onDataChanged();
  };

  // Agregar estudiante: primero se crea el aprendiz y luego se vincula a la ficha
  const crearEstudiante = async (form) => {
    setCargando(true);
    setError("");
    try {
      const creado = await createUser({ ...form, rol: "APRENDIZ" });
      await addAprendizAFicha(selectedFicha.ficha_id, creado.user.usuario_id, form.password);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const editarEstudiante = async (form) => {
    setCargando(true);
    setError("");
    try {
      const { userPassword, ...datos } = form; // userPassword no aplica al editar
      await updateUser(modal.user.usuario_id, { ...datos, rol: "APRENDIZ" });
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const eliminarEstudiante = async (password) => {
    setCargando(true);
    setError("");
    try {
      await deleteUser(modal.user.usuario_id, password);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const crearFicha = async (form) => {
    setCargando(true);
    setError("");
    try {
      await createFicha(form);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const editarFicha = async (form) => {
    setCargando(true);
    setError("");
    try {
      await updateFicha(modal.ficha.ficha_id, form);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const eliminarFicha = async (password) => {
    setCargando(true);
    setError("");
    try {
      await deleteFicha(modal.ficha.ficha_id, password);
      if (selectedFicha && selectedFicha.ficha_id === modal.ficha.ficha_id) setSelectedFicha(null);
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  return (
    <div>
      <h2>Fichas</h2>
      <p className="admin-hint">Selecciona una ficha para ver y gestionar a sus estudiantes. También puedes crear, editar o eliminar fichas.</p>

      <div className="panel-split">
        {/* Listado de fichas */}
        <div className="panel-list">
          <div className="panel-list-head">
            <h3 className="panel-list-title">Todas las fichas</h3>
            <button className="btn-rol btn-rol-mini" onClick={() => setModal({ tipo: "crear-ficha" })} title="Nueva ficha">+</button>
          </div>
          {fichas.length === 0 ? (
            <p className="list-vacia">No hay fichas registradas.</p>
          ) : (
            fichas.map((f) => (
              <button
                key={f.ficha_id}
                className={`panel-list-item ${selectedFicha?.ficha_id === f.ficha_id ? "active" : ""}`}
                onClick={() => setSelectedFicha(f)}
              >
                <span className="panel-list-num">Ficha {f.numero_ficha}</span>
                <span className="panel-list-count">{f.cantidad_aprendices}</span>
              </button>
            ))
          )}
        </div>

        {/* Detalle: estudiantes de la ficha seleccionada */}
        <div className="panel-detail">
          {!selectedFicha ? (
            <div className="panel-empty">Selecciona una ficha del listado para ver sus estudiantes.</div>
          ) : (
            <>
              <div className="panel-detail-header">
                <div>
                  <h3>Ficha {selectedFicha.numero_ficha}</h3>
                  <p className="admin-count">
                    {selectedFicha.nombre_programa} · {selectedFicha.jornada}
                    {" · "}{selectedFicha.fecha_inicio} → {selectedFicha.fecha_fin}
                    {" · "}{estudiantes.length} estudiante(s)
                  </p>
                </div>
                <div className="acciones-cell">
                  <button className="btn-rol" onClick={() => setModal({ tipo: "crear-estudiante" })}>
                    + Agregar estudiante
                  </button>
                  <button className="btn-accion" onClick={() => setModal({ tipo: "editar-ficha", ficha: selectedFicha })}>Editar ficha</button>
                  <button className="btn-accion btn-accion-danger" onClick={() => setModal({ tipo: "eliminar-ficha", ficha: selectedFicha })}>Eliminar ficha</button>
                </div>
              </div>

              {estudiantes.length === 0 ? (
                <div className="panel-empty">Esta ficha no tiene estudiantes. Agrega el primero.</div>
              ) : (
                <div className="ficha-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Documento</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((u) => (
                        <tr key={u.usuario_id}>
                          <td>{u.usuario_id}</td>
                          <td>{u.nombre} {u.apellido}</td>
                          <td>{u.correo}</td>
                          <td>{u.tipo_documento} {u.numero_documento}</td>
                          <td><span className={`badge-rol badge-${u.rol.toLowerCase()}`}>{u.rol}</span></td>
                          <td className="acciones-cell">
                            <button className="btn-accion" onClick={() => setModal({ tipo: "editar-estudiante", user: u })}>Editar</button>
                            <button className="btn-accion btn-accion-danger" onClick={() => setModal({ tipo: "eliminar-estudiante", user: u })}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && <div className="server-error" style={{ marginTop: "16px" }}>{error}</div>}

      {/* Modales de estudiantes */}
      {modal?.tipo === "crear-estudiante" && (
        <UserFormModal
          titulo={`Agregar estudiante a la Ficha ${selectedFicha.numero_ficha}`}
          rolFijo="APRENDIZ"
          cargando={cargando}
          onConfirmar={crearEstudiante}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar-estudiante" && (
        <UserFormModal
          titulo={`Editar a ${modal.user.nombre} ${modal.user.apellido}`}
          initial={modal.user}
          rolFijo="APRENDIZ"
          cargando={cargando}
          onConfirmar={editarEstudiante}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "eliminar-estudiante" && (
        <ConfirmPasswordModal
          titulo="Eliminar usuario"
          mensaje={`¿Seguro que quieres eliminar a ${modal.user.nombre} ${modal.user.apellido}? Esta acción no se puede deshacer.`}
          textoBoton="Sí, eliminar"
          cargando={cargando}
          onConfirmar={eliminarEstudiante}
          onCerrar={() => setModal(null)}
        />
      )}

      {/* Modales de fichas */}
      {modal?.tipo === "crear-ficha" && (
        <FichaFormModal
          titulo="Nueva ficha"
          programas={programas}
          cargando={cargando}
          onConfirmar={crearFicha}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar-ficha" && (
        <FichaFormModal
          titulo={`Editar la Ficha ${modal.ficha.numero_ficha}`}
          initial={modal.ficha}
          programas={programas}
          cargando={cargando}
          onConfirmar={editarFicha}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "eliminar-ficha" && (
        <ConfirmPasswordModal
          titulo="Eliminar ficha"
          mensaje={`¿Seguro que quieres eliminar la Ficha ${modal.ficha.numero_ficha}? Se desvinculan sus estudiantes e instructores. Esta acción no se puede deshacer.`}
          textoBoton="Sí, eliminar"
          cargando={cargando}
          onConfirmar={eliminarFicha}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Fichas;