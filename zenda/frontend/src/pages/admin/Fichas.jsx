/*
  Panel Fichas a la izquierda un listado de TODAS las fichas; al hacer clic
  en una, a la derecha se muestran los estudiantes de esa ficha.
  Desde ahí se puede VER, AGREGAR, EDITAR y ELIMINAR estudiantes.
  Toda acción delicada pide la contraseña del admin (confirmación).
*/

import { useState } from "react";
import { createUser, updateUser, deleteUser } from "../../api";
import { UserFormModal, ConfirmPasswordModal } from "../../components/admin/Modals";

function Fichas({ users, onDataChanged }) {
  const [selectedFicha, setSelectedFicha] = useState(null);
  // modal: null | { tipo:'crear' } | { tipo:'editar', user } | { tipo:'eliminar', user }
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Todas las fichas únicas ordenadas
  const fichas = [...new Set(users.map((u) => u.ficha).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  // Estudiantes de la ficha seleccionada
  const estudiantes = selectedFicha ? users.filter((u) => u.ficha === selectedFicha) : [];

  // Al éxito de cualquier operación avisamos al Admin para recargar la lista
  const ok = (msg) => {
    setError("");
    setModal(null);
    onDataChanged && onDataChanged();
  };

  const crear = async (form) => {
    setCargando(true);
    setError("");
    try {
      await createUser({ ...form, ficha: selectedFicha });
      ok();
    } catch (e) { setError(e.message); setModal(null); } finally { setCargando(false); }
  };

  const editar = async (form) => {
    setCargando(true);
    setError("");
    try {
      const { userPassword, ...datos } = form; // userPassword no aplica al editar
      await updateUser(modal.user.id, datos);
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
      <h2>Fichas</h2>
      <p className="admin-hint">Selecciona una ficha del listado para ver y gestionar a sus estudiantes (agregar, editar, eliminar).</p>

      <div className="panel-split">
        {/* Listado de fichas */}
        <div className="panel-list">
          <h3 className="panel-list-title">Todas las fichas</h3>
          {fichas.length === 0 ? (
            <p className="list-vacia">No hay fichas registradas.</p>
          ) : (
            fichas.map((f) => {
              const cantidad = users.filter((u) => u.ficha === f).length;
              return (
                <button
                  key={f}
                  className={`panel-list-item ${selectedFicha === f ? "active" : ""}`}
                  onClick={() => setSelectedFicha(f)}
                >
                  <span className="panel-list-num">Ficha {f}</span>
                  <span className="panel-list-count">{cantidad}</span>
                </button>
              );
            })
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
                  <h3>Estudiantes de la Ficha {selectedFicha}</h3>
                  <p className="admin-count">{estudiantes.length} usuario(s) en esta ficha</p>
                </div>
                <button className="btn-rol" onClick={() => setModal({ tipo: "crear" })}>
                  + Agregar estudiante
                </button>
              </div>

              {estudiantes.length === 0 ? (
                <div className="panel-empty">Esta ficha no tiene usuarios. Agrega el primero.</div>
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
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.nombre} {u.apellido}</td>
                          <td>{u.email}</td>
                          <td>{u.tipo_documento} {u.numero_documento}</td>
                          <td><span className={`badge-rol badge-${u.rol}`}>{u.rol}</span></td>
                          <td className="acciones-cell">
                            <button className="btn-accion" onClick={() => setModal({ tipo: "editar", user: u })}>Editar</button>
                            <button className="btn-accion btn-accion-danger" onClick={() => setModal({ tipo: "eliminar", user: u })}>Eliminar</button>
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

      {/* Modales de crear / editar / eliminar */}
      {modal?.tipo === "crear" && (
        <UserFormModal
          titulo={`Agregar estudiante a la Ficha ${selectedFicha}`}
          fichaFija={selectedFicha}
          cargando={cargando}
          onConfirmar={crear}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar" && (
        <UserFormModal
          titulo={`Editar a ${modal.user.nombre} ${modal.user.apellido}`}
          initial={modal.user}
          fichaFija={selectedFicha}
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

export default Fichas;