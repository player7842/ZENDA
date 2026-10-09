/*
  Sección "Fichas" del panel de administración.
  UI/UX Avanzado: Iconografía lucide-react, buscador de aprendices por ficha,
  panel de vinculación de huérfanos estilizado, badges de rol y modales integrados.
*/

import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  Inbox,
  AlertTriangle,
  Link2,
  Calendar,
  BookOpen
} from "lucide-react";
import {
  createUser,
  updateUser,
  deleteUser,
  createFicha,
  updateFicha,
  deleteFicha,
  addAprendizAFicha,
} from "../../api";
import { UserFormModal, FichaFormModal, ConfirmPasswordModal } from "../../components/admin/Modals";

function Fichas({ users = [], fichas = [], programas = [], onDataChanged }) {
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busquedaAprendiz, setBusquedaAprendiz] = useState("");

  const [huerfanoSeleccionado, setHuerfanoSeleccionado] = useState("");

  const estudiantes = selectedFicha
    ? users.filter((u) => u.rol === "APRENDIZ" && u.ficha === selectedFicha.numero_ficha)
    : [];

  const estudiantesFiltrados = estudiantes.filter((u) => {
    const q = busquedaAprendiz.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.correo?.toLowerCase().includes(q) ||
      u.numero_documento?.includes(q)
    );
  });

  const huerfanos = users.filter((u) => u.rol === "APRENDIZ" && !u.ficha);

  const ok = () => {
    setError("");
    setModal(null);
    onDataChanged && onDataChanged();
  };

  const crearEstudiante = async (form) => {
    setCargando(true);
    setError("");
    try {
      const creado = await createUser({ ...form, rol: "APRENDIZ" });
      await addAprendizAFicha(selectedFicha.ficha_id, creado.user.usuario_id, form.password);
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  const vincularHuerfano = async (password) => {
    setCargando(true);
    setError("");
    try {
      await addAprendizAFicha(selectedFicha.ficha_id, Number(huerfanoSeleccionado), password);
      setHuerfanoSeleccionado("");
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  const editarEstudiante = async (form) => {
    setCargando(true);
    setError("");
    try {
      const { userPassword, ...datos } = form;
      await updateUser(modal.user.usuario_id, { ...datos, rol: "APRENDIZ" });
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  const eliminarEstudiante = async (password) => {
    setCargando(true);
    setError("");
    try {
      await deleteUser(modal.user.usuario_id, password);
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  const crearFicha = async (form) => {
    setCargando(true);
    setError("");
    try {
      await createFicha(form);
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  const editarFicha = async (form) => {
    setCargando(true);
    setError("");
    try {
      await updateFicha(modal.ficha.ficha_id, form);
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  const eliminarFicha = async (password) => {
    setCargando(true);
    setError("");
    try {
      await deleteFicha(modal.ficha.ficha_id, password);
      if (selectedFicha && selectedFicha.ficha_id === modal.ficha.ficha_id) setSelectedFicha(null);
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px" }}>Gestión de Fichas de Formación</h2>
        <p className="admin-count">Administración de cohortes, vinculación de aprendices y actualización de datos</p>
      </div>

      {error && (
        <div className="server-error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="panel-split">
        {/* Panel Izquierdo: Lista de Fichas */}
        <div className="panel-list">
          <div className="panel-list-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p className="panel-list-title" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              <ClipboardList size={16} /> Fichas ({fichas.length})
            </p>
            <button
              className="btn-rol btn-rol-mini"
              onClick={() => setModal({ tipo: "crear-ficha" })}
              title="Nueva ficha"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 8px" }}
            >
              <Plus size={14} />
            </button>
          </div>

          {fichas.length === 0 ? (
            <div className="list-vacia-container" style={{ padding: "20px 0" }}>
              <Inbox size={28} />
              <p className="list-vacia" style={{ padding: 0 }}>No hay fichas registradas.</p>
            </div>
          ) : (
            fichas.map((f) => (
              <button
                key={f.ficha_id}
                className={`panel-list-item ${selectedFicha?.ficha_id === f.ficha_id ? "active" : ""}`}
                onClick={() => {
                  setSelectedFicha(f);
                  setBusquedaAprendiz("");
                }}
              >
                <span className="panel-list-num" style={{ fontWeight: 600 }}>Ficha {f.numero_ficha}</span>
                <span className="ficha-badge">{f.cantidad_aprendices || 0} aprendices</span>
              </button>
            ))
          )}
        </div>

        {/* Panel Derecho: Detalle de la Ficha Seleccionada */}
        <div className="panel-detail">
          {!selectedFicha ? (
            <div className="fases-empty-state">
              <ClipboardList size={40} opacity={0.4} />
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Selecciona una ficha</h4>
                <p style={{ margin: 0, fontSize: "0.82rem" }}>
                  Elige una ficha de la lista lateral para visualizar sus aprendices matriculados y gestionar acciones.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header Contextual de la Ficha Refinado */}
              <div className="panel-detail-header" style={{ marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <h3 style={{ margin: 0 }}>Ficha {selectedFicha.numero_ficha}</h3>
                    <span className="ficha-badge" style={{ fontSize: "0.78rem", padding: "3px 10px" }}>
                      {selectedFicha.jornada}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 10, fontSize: "0.84rem", opacity: 0.9, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                      <BookOpen size={14} style={{ color: "var(--color-primary)" }} /> {selectedFicha.nombre_programa}
                    </span>

                    {/* CHIP CRONOLÓGICO DE FECHAS */}
                    <div className="ficha-dates-badge">
                      <Calendar size={13} />
                      <span>
                        <strong>
                          {selectedFicha.fecha_inicio ? new Date(selectedFicha.fecha_inicio).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </strong>
                        {" → "}
                        <strong>
                          {selectedFicha.fecha_fin ? new Date(selectedFicha.fecha_fin).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="acciones-cell" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="btn-rol"
                    onClick={() => setModal({ tipo: "crear-estudiante" })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <UserPlus size={14} /> Nuevo estudiante
                  </button>
                  <button
                    className="btn-accion"
                    onClick={() => setModal({ tipo: "editar-ficha", ficha: selectedFicha })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Edit3 size={14} /> Editar
                  </button>
                  <button
                    className="btn-accion btn-accion-danger"
                    onClick={() => setModal({ tipo: "eliminar-ficha", ficha: selectedFicha })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>

              {/* Bloque para vincular aprendices huérfanos */}
              {huerfanos.length > 0 && (
                <div className="bloque-separado" style={{ marginBottom: 20, background: "var(--surface, rgba(128,128,128,0.06))" }}>
                  <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Link2 size={16} /> Vincular estudiante registrado sin ficha
                  </p>
                  <p className="admin-count" style={{ marginBottom: 12 }}>
                    Hay {huerfanos.length} aprendiz(ces) en el sistema sin ficha asignada.
                  </p>
                  <div className="add-ficha" style={{ gap: 10 }}>
                    <select
                      className="modal-select"
                      style={{ flex: 1 }}
                      value={huerfanoSeleccionado}
                      onChange={(e) => setHuerfanoSeleccionado(e.target.value)}
                    >
                      <option value="">Seleccionar aprendiz...</option>
                      {huerfanos.map((u) => (
                        <option key={u.usuario_id} value={u.usuario_id}>
                          {u.nombre} {u.apellido} — {u.correo}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-rol"
                      disabled={!huerfanoSeleccionado}
                      onClick={() => setModal({ tipo: "vincular-huerfano" })}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <Link2 size={14} /> Vincular a Ficha
                    </button>
                  </div>
                </div>
              )}

              {/* Tabla de Aprendices Matriculados */}
              <div className="bloque-separado">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <p className="dash-section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <Users size={16} /> Aprendices Matriculados ({estudiantesFiltrados.length})
                  </p>

                  {/* Buscador de aprendices dentro de la ficha */}
                  {estudiantes.length > 0 && (
                    <div className="search-box-wrap" style={{ width: 220, margin: 0 }}>
                      <span className="search-box-icon">
                        <Search size={14} />
                      </span>
                      <input
                        className="modal-input"
                        placeholder="Buscar en esta ficha..."
                        value={busquedaAprendiz}
                        onChange={(e) => setBusquedaAprendiz(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {estudiantes.length === 0 ? (
                  <div className="fases-empty-state" style={{ padding: "30px 0" }}>
                    <Users size={36} opacity={0.4} />
                    <p style={{ margin: 0 }}>Esta ficha no tiene estudiantes asignados aún.</p>
                  </div>
                ) : estudiantesFiltrados.length === 0 ? (
                  <p className="list-vacia" style={{ textAlign: "center", padding: "16px 0" }}>
                    No se encontraron aprendices con ese criterio de búsqueda.
                  </p>
                ) : (
                  <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre y Apellido</th>
                          <th>Correo</th>
                          <th>Documento</th>
                          <th>Rol</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantesFiltrados.map((u) => (
                          <tr key={u.usuario_id}>
                            <td>{u.usuario_id}</td>
                            <td style={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</td>
                            <td style={{ opacity: 0.85 }}>{u.correo}</td>
                            <td style={{ opacity: 0.85 }}>{u.tipo_documento} {u.numero_documento}</td>
                            <td>
                              <span className={`badge-rol badge-${u.rol.toLowerCase()}`}>{u.rol}</span>
                            </td>
                            <td className="acciones-cell">
                              <button
                                className="btn-accion"
                                onClick={() => setModal({ tipo: "editar-estudiante", user: u })}
                                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <Edit3 size={12} /> Editar
                              </button>
                              <button
                                className="btn-accion btn-accion-danger"
                                onClick={() => setModal({ tipo: "eliminar-estudiante", user: u })}
                                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <Trash2 size={12} /> Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modales del Administrador */}
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
      {modal?.tipo === "vincular-huerfano" && (
        <ConfirmPasswordModal
          titulo="Vincular estudiante existente"
          mensaje={`Vas a vincular a ${huerfanos.find((u) => u.usuario_id === Number(huerfanoSeleccionado))?.nombre || "este aprendiz"} a la Ficha ${selectedFicha.numero_ficha}. Confirma con tu contraseña.`}
          textoBoton="Sí, vincular"
          cargando={cargando}
          onConfirmar={vincularHuerfano}
          onCerrar={() => setModal(null)}
        />
      )}
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