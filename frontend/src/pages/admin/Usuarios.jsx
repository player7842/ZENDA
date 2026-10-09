/*
  Panel Usuarios
   - Filtro por rol: Aprendices (por defecto), Instructores, Coordinadores y Administradores.
   - Refactor UI/UX: Cambio de 'Estudiantes' a 'Aprendices', columna Ficha visible únicamente
     para Aprendices, asistente de carga masiva y buscador inteligente.
   - LÓGICA DE EDICIÓN CONSERVADA INTACTA.
*/

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Inbox, 
  AlertTriangle, 
  FileSpreadsheet
} from "lucide-react";
import { createUser, updateUser, deleteUser, importUsersBulk } from "../../api";
import { UserFormModal, ConfirmPasswordModal } from "../../components/admin/Modals";
import BulkImportModal from "../../components/admin/BulkImportModal";

const GRUPOS = [
  { id: "aprendices", etiqueta: "Aprendices", rol: "APRENDIZ" },
  { id: "instructores", etiqueta: "Instructores", rol: "INSTRUCTOR" },
  { id: "coordinadores", etiqueta: "Coordinadores", rol: "COORDINADOR" },
  { id: "administradores", etiqueta: "Administradores", rol: "ADMINISTRADOR" },
];

function Usuarios({ users = [], onDataChanged }) {
  const [grupo, setGrupo] = useState("aprendices");
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const grupoActivo = GRUPOS.find((g) => g.id === grupo) || GRUPOS[0];

  // Filtrado por grupo y buscador global
  const usuariosDeGrupo = users.filter((u) => u.rol === grupoActivo.rol);
  
  const usuariosFiltrados = usuariosDeGrupo.filter((u) => {
    const q = busqueda.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.correo?.toLowerCase().includes(q) ||
      (u.ficha && String(u.ficha).includes(q)) ||
      (u.numero_documento && String(u.numero_documento).includes(q))
    );
  });

  const ok = () => {
    setError("");
    setModal(null);
    onDataChanged && onDataChanged();
  };

  const crear = async (form) => {
    setCargando(true);
    setError("");
    try {
      await createUser({ ...form, rol: grupoActivo.rol });
      ok();
    } catch (e) { 
      setError(e.message); 
      setModal(null); 
    } finally { 
      setCargando(false); 
    }
  };

  const importarMasivo = async (lista, password) => {
    setCargando(true);
    setError("");
    try {
      await importUsersBulk(lista, password);
      ok();
    } catch (e) {
      setError(e.message);
      setModal(null);
    } finally {
      setCargando(false);
    }
  };

  // HANDLER DE EDICIÓN DELICADO (CONSERVADO INTACTO)
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
      ok();
    } catch (e) { 
      setError(e.message); 
      setModal(null); 
    } finally { 
      setCargando(false); 
    }
  };

  const esGrupoAprendices = grupoActivo.rol === "APRENDIZ";

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px" }}>Administración de Usuarios</h2>
        <p className="admin-count">Gestión global de cuentas, asignación de roles y control de credenciales</p>
      </div>

      {error && (
        <div className="server-error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Mini menú por rol */}
      <div className="roles-tabs" style={{ marginBottom: 20 }}>
        {GRUPOS.map((g) => {
          const cantidad = users.filter((u) => u.rol === g.rol).length;
          return (
            <button
              key={g.id}
              className={`roles-tab ${grupo === g.id ? "active" : ""}`}
              onClick={() => {
                setGrupo(g.id);
                setBusqueda("");
              }}
            >
              <span>{g.etiqueta}</span>
              <span className="roles-tab-count">{cantidad}</span>
            </button>
          );
        })}
      </div>

      {/* Header Contextual + Buscador + Botones de Acción */}
      <div className="panel-detail-header" style={{ marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
          <h3 style={{ margin: 0 }}>{grupoActivo.etiqueta}</h3>
          
          {/* Buscador Integrado */}
          <div className="search-box-wrap" style={{ flex: 1, maxWidth: 320, margin: 0 }}>
            <span className="search-box-icon">
              <Search size={14} />
            </span>
            <input
              className="modal-input"
              placeholder={`Buscar en ${grupoActivo.etiqueta.toLowerCase()}...`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {esGrupoAprendices && (
            <button 
              className="btn-accion"
              onClick={() => setModal({ tipo: "masivo" })}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38 }}
            >
              <FileSpreadsheet size={15} /> Carga masiva (CSV)
            </button>
          )}
          
          <button 
            className="btn-rol" 
            onClick={() => setModal({ tipo: "crear" })}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38 }}
          >
            <UserPlus size={15} /> Agregar {grupoActivo.etiqueta.slice(0, -1).toLowerCase()}
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      {usuariosDeGrupo.length === 0 ? (
        <div className="fases-empty-state" style={{ padding: "40px 0" }}>
          <Users size={40} opacity={0.4} />
          <p style={{ margin: 0 }}>No hay {grupoActivo.etiqueta.toLowerCase()} registrados actualmente.</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="list-vacia-container" style={{ padding: "30px 0" }}>
          <Inbox size={28} />
          <p className="list-vacia" style={{ padding: 0 }}>No se encontraron coincidencias para "{busqueda}".</p>
        </div>
      ) : (
        <div className="bloque-separado" style={{ padding: 0, overflow: "hidden" }}>
          <div className="admin-table-wrap" style={{ background: "transparent", padding: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre y Apellido</th>
                  <th>Correo Institucional</th>
                  {/* Columna visible ÚNICAMENTE para Aprendices */}
                  {esGrupoAprendices && <th>Ficha Principal</th>}
                  {grupoActivo.rol === "INSTRUCTOR" && <th>Fichas vinculadas</th>}
                  <th>Estado / Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.usuario_id}>
                    <td>{u.usuario_id}</td>
                    <td style={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</td>
                    <td style={{ opacity: 0.85 }}>{u.correo}</td>
                    
                    {/* Celda de Ficha solo para Aprendices */}
                    {esGrupoAprendices && (
                      <td>
                        {u.ficha ? (
                          <span className="ficha-badge" style={{ fontSize: "0.75rem" }}>
                            Ficha {u.ficha}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.5 }}>Sin ficha</span>
                        )}
                      </td>
                    )}

                    {grupoActivo.rol === "INSTRUCTOR" && (
                      <td>
                        {u.fichas && u.fichas.length > 0 ? (
                          <div className="chips-wrap" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {u.fichas.map((f) => (
                              <span 
                                key={f} 
                                className="chip-ficha"
                                style={{ padding: "2px 8px", fontSize: "0.72rem", background: "rgba(9, 132, 227, 0.12)", color: "var(--color-primary)", borderRadius: 6, border: "1px solid rgba(9, 132, 227, 0.25)" }}
                              >
                                Ficha {f}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ opacity: 0.5 }}>Sin asignaciones</span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className={`badge-rol badge-${u.rol.toLowerCase()}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="acciones-cell">
                      {/* BOTÓN EDITAR PRESERVADO INTACTO */}
                      <button 
                        className="btn-accion" 
                        onClick={() => setModal({ tipo: "editar", user: u })}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Edit3 size={12} /> Editar usuario
                      </button>
                      <button 
                        className="btn-accion btn-accion-danger" 
                        onClick={() => setModal({ tipo: "eliminar", user: u })}
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
        </div>
      )}

      {/* Modales */}
      {modal?.tipo === "crear" && (
        <UserFormModal
          titulo={`Agregar nuevo ${grupoActivo.etiqueta.slice(0, -1).toLowerCase()}`}
          rolFijo={grupoActivo.rol}
          cargando={cargando}
          onConfirmar={crear}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "masivo" && (
        <BulkImportModal
          cargando={cargando}
          onConfirmar={importarMasivo}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar" && (
        <UserFormModal
          titulo={`Editar usuario: ${modal.user.nombre} ${modal.user.apellido}`}
          initial={modal.user}
          cargando={cargando}
          onConfirmar={editar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "eliminar" && (
        <ConfirmPasswordModal
          titulo="Eliminar cuenta de usuario"
          mensaje={`¿Seguro que quieres eliminar a ${modal.user.nombre} ${modal.user.apellido}? Esta acción eliminará permanentemente sus accesos.`}
          textoBoton="Sí, eliminar usuario"
          cargando={cargando}
          onConfirmar={eliminar}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Usuarios;