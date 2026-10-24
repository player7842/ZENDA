/*
  Sección "Mi proyecto" del panel de aprendiz.
  UI/UX Avanzado: Timeline/Gantt simplificado, chips de tecnologías,
  secciones estructuradas del README y Exportador a PDF del Reporte Oficial.
*/
import { useEffect, useState } from 'react';
import { FileText, Target, AlertCircle, Compass, Cpu, Hash, Printer, Users } from 'lucide-react';
import TimelineGantt from '../../components/ui/TimelineGantt';
import { actualizarCupoAprendiz } from '../../api';

function MiProyecto({ datos, esLider = false, onCupoActualizado }) {
  const { proyecto, grupo, integrantes = [] } = datos;
  const [cupo, setCupo] = useState(grupo.cupo_maximo);
  const [guardandoCupo, setGuardandoCupo] = useState(false);
  const [errorCupo, setErrorCupo] = useState('');

  // Mantiene el input sincronizado cuando el padre recarga el proyecto.
  useEffect(() => {
    setCupo(grupo.cupo_maximo);
  }, [grupo.cupo_maximo]);

  const listaTecnologias = proyecto.tecnologias
    ? proyecto.tecnologias
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const guardarCupo = async () => {
    setErrorCupo('');
    setGuardandoCupo(true);
    try {
      await actualizarCupoAprendiz(Number(cupo));
      if (onCupoActualizado) await onCupoActualizado();
    } catch (err) {
      setErrorCupo(err?.message || 'No se pudo actualizar el cupo');
    } finally {
      setGuardandoCupo(false);
    }
  };

  const handleExportarPDF = () => {
    window.print();
  };

  return (
    <div>
      {/* Banner Superior de Exportación a PDF */}
      <div className="export-pdf-banner">
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: '0.95rem' }}>Reporte Oficial del Proyecto</h3>
          <p className="admin-count" style={{ margin: 0 }}>
            Genera un documento PDF imprimible con la ficha técnica y cronograma actual.
          </p>
        </div>
        <button
          className="btn-rol"
          onClick={handleExportarPDF}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}
        >
          <Printer size={16} /> Exportar PDF
        </button>
      </div>

      {/* Header con Nombre y Código de Grupo */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 6,
          }}
        >
          <h2 style={{ margin: 0 }}>{proyecto.nombre_proyecto}</h2>
          <span className="proyecto-header-badge">
            <Hash size={14} />
            Grupo: {grupo.codigo_grupo}
          </span>
        </div>
      </div>

      {/* Cupo del grupo (RN-009): el líder puede ajustarlo sin bajar del total actual */}
      <div className="bloque-separado" style={{ margin: '0 0 20px' }}>
        <p className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} /> Equipo y cupo
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.86rem' }}>
            {integrantes.length} de {grupo.cupo_maximo} integrantes
          </span>
          {esLider && (
            <>
              <input
                type="number"
                min={Math.max(1, integrantes.length)}
                max={50}
                value={cupo}
                onChange={(e) => setCupo(e.target.value)}
                style={{ width: 84, padding: '6px 8px', borderRadius: 8 }}
                aria-label="Cupo máximo del grupo"
              />
              <button
                className="btn-rol"
                onClick={guardarCupo}
                disabled={guardandoCupo}
                style={{ padding: '6px 12px' }}
              >
                {guardandoCupo ? 'Guardando...' : 'Actualizar cupo'}
              </button>
            </>
          )}
        </div>
        {errorCupo && (
          <p style={{ margin: '8px 0 0', color: '#ef4444', fontSize: '0.8rem' }}>{errorCupo}</p>
        )}
      </div>

      {/* COMPONENTE GANTT / TIMELINE SIMPLIFICADO */}
      <TimelineGantt fechaInicio={proyecto.fecha_inicio} fechaFin={proyecto.fecha_fin_estimada} />

      {/* Grid de Secciones del README */}
      <div className="dash-grid-2" style={{ marginBottom: 24 }}>
        <div className="bloque-separado" style={{ margin: 0 }}>
          <p
            className="dash-section-title"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <FileText size={16} /> Descripción
          </p>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.9 }}>
            {proyecto.descripcion}
          </p>
        </div>

        <div className="bloque-separado" style={{ margin: 0 }}>
          <p
            className="dash-section-title"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <AlertCircle size={16} /> Problema
          </p>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.9 }}>
            {proyecto.problema}
          </p>
        </div>

        <div className="bloque-separado" style={{ margin: 0 }}>
          <p
            className="dash-section-title"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Target size={16} /> Objetivo
          </p>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.9 }}>
            {proyecto.objetivo}
          </p>
        </div>

        <div className="bloque-separado" style={{ margin: 0 }}>
          <p
            className="dash-section-title"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Compass size={16} /> Alcance
          </p>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.9 }}>
            {proyecto.alcance}
          </p>
        </div>
      </div>

      {/* Sección Tecnologías */}
      {listaTecnologias.length > 0 && (
        <div className="bloque-separado">
          <p
            className="dash-section-title"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Cpu size={16} /> Tecnologías Utilizadas
          </p>
          <div className="tech-chips-wrap">
            {listaTecnologias.map((tech, idx) => (
              <span key={idx} className="tech-chip">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MiProyecto;
