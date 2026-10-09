/*
  Sección "Instructores" del panel de administración.
  UI/UX Avanzado: Buscador en vivo de instructores, asignación de fichas mediante chips interactivos,
  iconografía lucide-react y confirmación de seguridad con contraseña.
*/

import { useState } from "react";
import { 
  UserCheck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  X, 
  Save, 
  Inbox, 
  AlertTriangle, 
  Mail,
  ShieldCheck
} from "lucide-react";
import { createUser, updateUser, deleteUser, setInstructorFichas } from "../../api";
import { UserFormModal, ConfirmPasswordModal } from "../../components/admin/Modals";

function Instructores({ users = [], onDataChanged }) {
  const [selectedId, setSelectedId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const instructores = users.filter((u) => u.rol === "INSTRUCTOR");
  const instructoresFiltrados = instructores.filter((u) => {
    const q = busqueda.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.correo?.toLowerCase().includes(q)
    );
  });

  const seleccionado = instructores.find((u) => u.usuario_id === selectedId) || null;

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

  const crear = async (form) => {
    setCargando(true);
    setError("");
    try {
      await createUser({ ...form, rol: "INSTRUCTOR", fichas: [] });
      ok();
    } catch (e) { 
      setError(e.message); 
      setModal(null); 
    } finally { 
      setCargando(false); 
    }
  };

  const editar = async (form) => {
    setCargando(true);
    setError("");
    try {
      const { userPassword, ...datos } = form;
      await updateUser(modal.user.usuario_id, { ...datos, fichas: modal.user.fichas || [] });
      ok();
    } catch (e) { 
      setError(e.message); 
      setModal(null); 
    } finally { 
      setCargando(false); 
    }
  };

  const eliminar = async (password) => {
    setCargando(true);
    setError("");
    try {
      await deleteUser(modal.user.usuario_id, password);
      if (selectedId === modal.user.usuario_id) setSelectedId(null);
      ok();
    } catch (e) { 
      setError(e.message); 
      setModal(null); 
    } finally { 
      setCargando(false); 
    }
  };

  const guardarFichas = async (password) => {
    setCargando(true);
    setError("");
    try {
      await setInstructorFichas(selectedId, fichasEdit, password);
      ok();
    } catch (e) { 
      setError(e.message); 
      setModal(null); 
    } finally { 
      setCargando(false); 
    }
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
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px" }}>Gestión de Instructores</h2>
        <p className="admin-count">Asignación de fichas técnicas y administración de cuentas docentes</p>
      </div>

      {error && (
        <div className="server-error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="panel-split">
        {/* Panel Izquierdo: Lista de Instructores con Buscador */}
        <div className="panel-list">
          <div className="panel-list-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p className="panel-list-title" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              <UserCheck size={16} /> Instructores ({instructoresFiltrados.length})
            </p>
            <button 
              className="btn-rol btn-rol-mini" 
              onClick={() => setModal({ tipo: "crear" })} 
              title="Agregar instructor"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 8px" }}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Buscador de Instructores */}
          <div className="search-box-wrap" style={{ marginBottom: 12 }}>
            <span className="search-box-icon">
              <Search size={14} />
            </span>
            <input
              className="modal-input"
              placeholder="Buscar instructor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {instructores.length === 0 ? (
            <div className="list-vacia-container" style={{ padding: "20px 0" }}>
              <Inbox size={28} />
              <p className="list-vacia" style={{ padding: 0 }}>No hay instructores registrados.</p>
            </div>
          ) : instructoresFiltrados.length === 0 ? (
            <p className="list-vacia" style={{ textAlign: "center", padding: "16px 0" }}>
              Sin resultados para la búsqueda.
            </p>
          ) : (
            instructoresFiltrados.map((u) => (
              <button
                key={u.usuario_id}
                className={`panel-list-item ${selectedId === u.usuario_id ? "active" : ""}`}
                onClick={() => seleccionar(u)}
              >
                <span className="panel-list-num" style={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</span>
                <span className="ficha-badge">{(u.fichas || []).length} fichas</span>
              </button>
            ))
          )}
        </div>

        {/* Panel Derecho: Detalle de Fichas del Instructor */}
        <div className="panel-detail">
          {!seleccionado ? (
            <div className="fases-empty-state">
              <UserCheck size={40} opacity={0.4} />
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Selecciona un instructor</h4>
                <p style={{ margin: 0, fontSize: "0.82rem" }}>
                  Elige un instructor del listado lateral para visualizar y modificar sus fichas asignadas.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header Contextual del Instructor */}
              <div className="panel-detail-header" style={{ marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{seleccionado.nombre} {seleccionado.apellido}</h3>
                  <p className="admin-count" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Mail size={13} /> {seleccionado.correo}
                  </p>
                </div>
                <div className="acciones-cell" style={{ display: "flex", gap: 8 }}>
                  <button 
                    className="btn-accion" 
                    onClick={() => setModal({ tipo: "editar", user: seleccionado })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Edit3 size={14} /> Editar
                  </button>
                  <button 
                    className="btn-accion btn-accion-danger" 
                    onClick={() => setModal({ tipo: "eliminar", user: seleccionado })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>

              {/* Contenedor de Fichas Vinculadas */}
              <div className="bloque-separado">
                <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Layers size={16} /> Fichas técnicas vinculadas ({fichasEdit.length})
                </p>

                {fichasEdit.length === 0 ? (
                  <div className="fases-empty-state" style={{ padding: "20px 0", marginBottom: 16 }}>
                    <Layers size={32} opacity={0.3} />
                    <p style={{ margin: 0, fontSize: "0.82rem" }}>Este instructor no tiene fichas asignadas actualmente.</p>
                  </div>
                ) : (
                  <div className="chips-wrap" style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {fichasEdit.map((f) => (
                      <span 
                        key={f} 
                        className="chip-ficha chip-ficha-quitable"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(9, 132, 227, 0.12)", color: "var(--color-primary)", fontWeight: 600, fontSize: "0.82rem", border: "1px solid rgba(9, 132, 227, 0.25)" }}
                      >
                        Ficha {f}
                        <button 
                          className="chip-quitar" 
                          onClick={() => quitarFicha(f)} 
                          title="Quitar ficha"
                          style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", color: "inherit", padding: 0 }}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Agregar nueva ficha */}
                <div className="add-ficha" style={{ gap: 10, marginBottom: 16 }}>
                  <input
                    type="text"
                    className="add-ficha-input modal-input"
                    placeholder="Número de ficha (ej: 2724290)"
                    value={nuevaFicha}
                    onChange={(e) => setNuevaFicha(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === "Enter") { 
                        e.preventDefault(); 
                        agregarFicha(); 
                      } 
                    }}
                    style={{ flex: 1 }}
                  />
                  <button 
                    className="btn-accion" 
                    onClick={agregarFicha}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38 }}
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>

                {/* Acciones de guardado */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(128,128,128,0.12)" }}>
                  <span className="admin-count" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={13} /> Se solicitará tu contraseña de administrador
                  </span>
                  <button 
                    className="btn-rol" 
                    onClick={() => setModal({ tipo: "fichas" })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Save size={14} /> Guardar cambios
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modales */}
      {modal?.tipo === "crear" && (
        <UserFormModal
          titulo="Agregar nuevo instructor"
          rolFijo="INSTRUCTOR"
          cargando={cargando}
          onConfirmar={crear}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar" && (
        <UserFormModal
          titulo={`Editar instructor: ${modal.user.nombre} ${modal.user.apellido}`}
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
          mensaje={`¿Seguro que quieres eliminar la cuenta de ${modal.user.nombre} ${modal.user.apellido}? Esta acción no se puede deshacer.`}
          textoBoton="Sí, eliminar"
          cargando={cargando}
          onConfirmar={eliminar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "fichas" && (
        <ConfirmPasswordModal
          titulo="Guardar fichas vinculadas"
          mensaje={`Vas a actualizar a ${fichasEdit.length} ficha(s) vinculada(s) para ${seleccionado.nombre} ${seleccionado.apellido}. Ingresa tu contraseña.`}
          textoBoton="Guardar cambios"
          cargando={cargando}
          onConfirmar={guardarFichas}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Instructores;