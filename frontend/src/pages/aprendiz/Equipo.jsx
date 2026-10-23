/*
  Módulo "Equipo" del panel de aprendiz.
  Muestra los integrantes del equipo de trabajo con tarjeta de perfil.
  El liderazgo se identifica por grupos.lider_id (es_lider). Ya no hay
  sub-roles Scrum.
*/
import { Users, Crown, Mail, Hash } from "lucide-react";

function Equipo({ integrantes, grupo }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
          <h2 style={{ margin: 0 }}>Equipo de Trabajo</h2>
          <span className="proyecto-header-badge">
            <Hash size={14} />
            Grupo: {grupo.codigo_grupo}
          </span>
          {grupo.cupo_maximo !== undefined && (
            <span className="proyecto-header-badge">
              Cupo: {grupo.total_integrantes || integrantes.length} / {grupo.cupo_maximo}
            </span>
          )}
        </div>
        <p className="admin-count">Integrantes activos asignados a este proyecto</p>
      </div>

      <div className="dash-grid-2" style={{ marginBottom: 24 }}>
        {integrantes.map((i, idx) => (
          <div key={i.usuario_id || idx} className="bloque-separado" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                  {i.nombre} {i.apellido}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                  <Mail size={14} />
                  <span>{i.correo}</span>
                </div>
              </div>
              {i.es_lider && (
                <span className="badge-scrum badge-scrum-sm">
                  <Crown size={12} />
                  Líder
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Equipo;