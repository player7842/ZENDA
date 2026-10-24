/*
  Sección "Fases" del panel de aprendiz.
  UI/UX Avanzado: Historial de evidencias, badges de versión/re-entrega,
  alertas contextuales y soporte multilink de evidencias.
*/

import { useState } from 'react';
import {
  FolderPlus,
  UploadCloud,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Folder,
  FileText,
  Layers,
  Plus,
  X,
  History,
  RefreshCw,
} from 'lucide-react';
import { getCarpetasDeFaseAprendiz, crearCarpetaAprendiz, subirEvidenciaAprendiz } from '../../api';
import { esUrlSegura } from '../../utils/urlSegura';

function Fases({ fases }) {
  const [faseSeleccionada, setFaseSeleccionada] = useState(null);
  const [carpetas, setCarpetas] = useState([]);
  const [infoFase, setInfoFase] = useState(null);
  const [cargandoCarpetas, setCargandoCarpetas] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [nombreCarpeta, setNombreCarpeta] = useState('');
  const [carpetaEvidencia, setCarpetaEvidencia] = useState(null);
  const [formEvidencia, setFormEvidencia] = useState({
    nombre_evidencia: '',
    tipo_evidencia: 'Documento',
    ubicacion: '',
  });

  const seleccionarFase = async (fase) => {
    setFaseSeleccionada(fase);
    setError('');
    setExito('');
    setCarpetaEvidencia(null);
    setCargandoCarpetas(true);
    try {
      const data = await getCarpetasDeFaseAprendiz(fase.fase_id);
      setInfoFase(data);
      setCarpetas(data?.carpetas || []);
    } catch (err) {
      setError(err?.message || 'Error al cargar carpetas');
      setInfoFase(null);
      setCarpetas([]);
    } finally {
      setCargandoCarpetas(false);
    }
  };

  const refrescarCarpetas = async () => {
    if (!faseSeleccionada) return;
    const data = await getCarpetasDeFaseAprendiz(faseSeleccionada.fase_id);
    setInfoFase(data);
    setCarpetas(data?.carpetas || []);
  };

  const handleCrearCarpeta = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    if (!nombreCarpeta.trim()) {
      setError('El nombre de la carpeta es obligatorio');
      return;
    }
    try {
      await crearCarpetaAprendiz(faseSeleccionada.fase_id, nombreCarpeta);
      setNombreCarpeta('');
      setExito('Carpeta creada correctamente');
      await refrescarCarpetas();
    } catch (err) {
      setError(err?.message || 'Error al crear carpeta');
    }
  };

  const handleSubirEvidencia = async (e) => {
    e.preventDefault();
    if (!formEvidencia.nombre_evidencia || !formEvidencia.ubicacion) return;
    if (!esUrlSegura(formEvidencia.ubicacion)) {
      setError('La ubicación debe ser una URL http(s) válida');
      return;
    }
    setError('');
    setExito('');
    try {
      await subirEvidenciaAprendiz(carpetaEvidencia, formEvidencia);
      setFormEvidencia({ nombre_evidencia: '', tipo_evidencia: 'Documento', ubicacion: '' });
      setCarpetaEvidencia(null);
      setExito('Evidencia o re-entrega subida correctamente');
      await refrescarCarpetas();
    } catch (err) {
      setError(err?.message || 'Error al subir evidencia');
    }
  };

  const renderBadgeFase = (estado) => {
    switch (estado) {
      case 'Aprobada':
        return <span className="badge-fase aprobada">{estado}</span>;
      case 'Desaprobada':
        return <span className="badge-fase desaprobada">{estado}</span>;
      case 'En revisión':
        return <span className="badge-fase badge-fase-revision">{estado}</span>;
      default:
        return <span className="badge-fase">{estado}</span>;
    }
  };

  const renderBadgeResultado = (resultado) => {
    if (resultado === 'APROBADO') {
      return (
        <span
          className="badge-evidencia entregado"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <CheckCircle2 size={12} /> APROBADO
        </span>
      );
    }
    if (resultado === 'REPROBADO') {
      return (
        <span
          className="badge-evidencia reprobado"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <XCircle size={12} /> REPROBADO
        </span>
      );
    }
    return (
      <span
        className="badge-evidencia pendiente"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <Clock size={12} /> Sin evaluar
      </span>
    );
  };

  return (
    <div>
      {error && (
        <div className="server-error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {exito && (
        <div className="server-exito" style={{ marginBottom: 16 }}>
          <CheckCircle2 size={18} /> {exito}
        </div>
      )}

      <div className="panel-split">
        {/* Lista de fases */}
        <div className="panel-list">
          <p className="panel-list-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} /> Fases del proyecto
          </p>
          {fases.map((f) => (
            <button
              key={f.fase_id}
              className={`panel-list-item ${faseSeleccionada?.fase_id === f.fase_id ? 'active' : ''}`}
              onClick={() => seleccionarFase(f)}
            >
              <span style={{ fontWeight: 600 }}>{f.nombre_fase}</span>
              {renderBadgeFase(f.estado_fase)}
            </button>
          ))}
        </div>

        {/* Detalle de fase */}
        <div className="panel-detail">
          {!faseSeleccionada ? (
            <div className="fases-empty-state">
              <Layers size={40} opacity={0.4} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>Selecciona una fase</h4>
                <p style={{ margin: 0, fontSize: '0.82rem' }}>
                  Haz clic en cualquiera de las fases para consultar sus carpetas, evidencias e
                  historial de entregas.
                </p>
              </div>
            </div>
          ) : cargandoCarpetas ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="skeleton-box" style={{ height: 40, width: '40%' }} />
              <div className="skeleton-box" style={{ height: 140 }} />
            </div>
          ) : (
            <>
              <div className="panel-detail-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0 }}>{faseSeleccionada.nombre_fase}</h3>
                  {renderBadgeFase(infoFase?.estado_fase || faseSeleccionada.estado_fase)}
                </div>
              </div>

              {/* HU-025: porcentaje de evidencias y carpetas aprobadas */}
              {infoFase?.progreso && (
                <div style={{ margin: '8px 0 14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontSize: '0.78rem',
                      marginBottom: 5,
                      opacity: 0.9,
                    }}
                  >
                    <span>
                      {infoFase.progreso.aprobadas} de {infoFase.progreso.total} evidencias
                      aprobadas
                    </span>
                    <span>
                      {infoFase.progreso.carpetas_aprobadas} de {infoFase.progreso.carpetas_total}{' '}
                      carpetas aprobadas
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: 'rgba(148,163,184,0.25)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${infoFase.progreso.porcentaje}%`,
                        height: '100%',
                        background: 'var(--color-primary, #1e7e22)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>
                    Avance de la fase: {infoFase.progreso.porcentaje}%
                  </span>
                </div>
              )}

              {/* Banner contextual de Re-entrega si la fase fue desaprobada */}
              {(infoFase?.estado_fase || faseSeleccionada.estado_fase) === 'Desaprobada' && (
                <div className="fase-alert-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Hay evidencias desaprobadas. Cualquier integrante puede subir una re-entrega
                      en la carpeta correspondiente.
                    </span>
                  </div>
                </div>
              )}

              {/* Formulario Crear Carpeta */}
              <div className="bloque-separado">
                <p
                  className="dash-section-title"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}
                >
                  <FolderPlus size={16} /> Crear nueva carpeta
                </p>
                <form onSubmit={handleCrearCarpeta} className="add-ficha">
                  <input
                    className="add-ficha-input"
                    placeholder="Ej. Entregables Fase Analisis"
                    value={nombreCarpeta}
                    maxLength={150}
                    onChange={(e) => setNombreCarpeta(e.target.value)}
                  />
                  <button
                    className="btn-rol"
                    type="submit"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={14} /> Crear carpeta
                  </button>
                </form>
              </div>

              {carpetas.length === 0 && (
                <div className="fases-empty-state">
                  <Folder size={36} opacity={0.4} />
                  <p className="list-vacia" style={{ margin: 0, padding: 0 }}>
                    Esta fase aún no tiene carpetas asignadas.
                  </p>
                </div>
              )}

              {/* Listado de Carpetas con Versiones de Evidencias */}
              {carpetas.map((c) => {
                const tieneReprobadas = c.evidencias.some((e) => e.resultado === 'REPROBADO');

                return (
                  <div key={c.carpeta_id} className="bloque-separado">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Folder size={18} style={{ color: 'var(--color-primary)' }} />
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{c.nombre_carpeta}</h4>
                      </div>
                      <span className="admin-count" style={{ fontSize: '0.78rem' }}>
                        {c.evidencias.length}{' '}
                        {c.evidencias.length === 1 ? 'evidencia' : 'evidencias'}
                      </span>
                    </div>

                    <div
                      className="admin-table-wrap"
                      style={{ background: 'transparent', padding: 0 }}
                    >
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Versión</th>
                            <th>Evidencia / Recurso</th>
                            <th>Tipo</th>
                            <th>Resultado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.evidencias.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="list-vacia"
                                style={{ textAlign: 'center', padding: '16px 0' }}
                              >
                                Sin evidencias en esta carpeta.
                              </td>
                            </tr>
                          ) : (
                            c.evidencias.map((e, idx) => {
                              const esReentrega = idx > 0;

                              return (
                                <tr key={e.evidencia_id}>
                                  <td>
                                    <span
                                      className={`badge-version ${esReentrega ? 'reentrega' : ''}`}
                                    >
                                      {esReentrega ? (
                                        <RefreshCw size={10} />
                                      ) : (
                                        <History size={10} />
                                      )}
                                      v{idx + 1}
                                    </span>
                                  </td>
                                  <td>
                                    {esUrlSegura(e.ubicacion) ? (
                                      <a
                                        href={e.ubicacion}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="evidencia-link"
                                      >
                                        <FileText size={14} />
                                        <span>{e.nombre_evidencia}</span>
                                        <ExternalLink size={12} opacity={0.7} />
                                      </a>
                                    ) : (
                                      <span className="evidencia-link" style={{ opacity: 0.75 }}>
                                        <FileText size={14} />
                                        <span>{e.nombre_evidencia} (enlace no válido)</span>
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ opacity: 0.85 }}>{e.tipo_evidencia}</td>
                                  <td>{renderBadgeResultado(e.resultado)}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Subir Evidencia o Re-entrega */}
                    {carpetaEvidencia === c.carpeta_id ? (
                      <form
                        onSubmit={handleSubirEvidencia}
                        className="bloque-separado"
                        style={{
                          marginTop: 14,
                          background: 'var(--surface, rgba(128,128,128,0.08))',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12,
                          }}
                        >
                          <p
                            className="dash-section-title"
                            style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <UploadCloud size={16} />
                            {tieneReprobadas
                              ? `Subir re-entrega (v${c.evidencias.length + 1})`
                              : `Subir nueva evidencia`}
                          </p>
                          <button
                            type="button"
                            onClick={() => setCarpetaEvidencia(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <label className="modal-label">Nombre de la evidencia</label>
                        <input
                          className="modal-input"
                          placeholder="Ej. Documento de Arquitectura v2.0"
                          value={formEvidencia.nombre_evidencia}
                          onChange={(e) =>
                            setFormEvidencia({ ...formEvidencia, nombre_evidencia: e.target.value })
                          }
                        />

                        <label className="modal-label">Tipo de archivo/recurso</label>
                        <select
                          className="modal-select"
                          value={formEvidencia.tipo_evidencia}
                          onChange={(e) =>
                            setFormEvidencia({ ...formEvidencia, tipo_evidencia: e.target.value })
                          }
                        >
                          <option value="Documento">Documento (PDF, Word, etc.)</option>
                          <option value="Imagen">Imagen / Diagrama</option>
                          <option value="Video">Video sustentación</option>
                          <option value="Enlace">Enlace / Repositorio</option>
                        </select>

                        <label className="modal-label">
                          Link del recurso (Google Drive, GitHub, etc.)
                        </label>
                        <input
                          className="modal-input"
                          placeholder="https://..."
                          value={formEvidencia.ubicacion}
                          onChange={(e) =>
                            setFormEvidencia({ ...formEvidencia, ubicacion: e.target.value })
                          }
                        />

                        <div className="modal-actions">
                          <button
                            type="button"
                            className="btn-cancelar"
                            onClick={() => setCarpetaEvidencia(null)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="btn-rol"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <UploadCloud size={14} /> Subir versión
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className="btn-accion"
                        style={{
                          marginTop: 14,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        onClick={() => setCarpetaEvidencia(c.carpeta_id)}
                      >
                        {tieneReprobadas ? <RefreshCw size={14} /> : <Plus size={14} />}
                        {tieneReprobadas
                          ? `Subir re-entrega (v${c.evidencias.length + 1})`
                          : 'Subir evidencia'}
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Fases;
