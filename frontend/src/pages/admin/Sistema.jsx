import { Database, Download } from 'lucide-react';

function Sistema({ users = [], fichas = [], programas = [] }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 20px' }}>Estado del Sistema y Mantenimiento</h2>

      <div className="dash-grid-2">
        <div className="dash-card">
          <h3 className="dash-section-title">
            <Database size={16} /> Diagnóstico del sistema
          </h3>
          <p className="admin-count">El diagnóstico del sistema aún no está disponible.</p>
        </div>

        <div className="dash-card">
          <h3 className="dash-section-title">
            <Download size={16} /> Copia de seguridad
          </h3>
          <p className="admin-count">La descarga de copias de seguridad aún no está disponible.</p>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 20 }}>
        <h3 className="dash-section-title">Resumen de datos cargados</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cuentas de usuario</span>
            <strong>{users.length}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Fichas académicas</span>
            <strong>{fichas.length}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Programas de formación</span>
            <strong>{programas.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sistema;
