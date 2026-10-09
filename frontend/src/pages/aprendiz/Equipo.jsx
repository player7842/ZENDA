/*
  Módulo "Equipo" del panel de aprendiz.
  Muestra los integrantes del equipo de trabajo con tarjetas de perfil,
  badges de rol Scrum e información de contacto institucional.
*/
import { Users, Crown, UserCheck, Code2, Mail, Hash } from "lucide-react";

function Equipo({ integrantes, grupo }) {
    const renderBadgeScrum = (rol) => {
        switch (rol) {
            case "Scrum Master":
                return (
                    <span className="badge-scrum badge-scrum-sm">
                        <Crown size={12} />
                        {rol}
                    </span>
                );
            case "Product Owner":
                return (
                    <span className="badge-scrum badge-scrum-po">
                        <UserCheck size={12} />
                        {rol}
                    </span>
                );
            default:
                return (
                    <span className="badge-scrum badge-scrum-dev">
                        <Code2 size={12} />
                        {rol || "Developer"}
                    </span>
                );
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                    <h2 style={{ margin: 0 }}>Equipo de Trabajo</h2>
                    <span className="proyecto-header-badge">
                        <Hash size={14} />
                        Grupo: {grupo.codigo_grupo}
                    </span>
                </div>
                <p className="admin-count">Integrantes activos asignados a este proyecto</p>
            </div>

            <div className="dash-grid-2" style={{ marginBottom: 24 }}>
                {integrantes.map((i, idx) => (
                    <div key={idx} className="bloque-separado" style={{ margin: 0 }}>
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
                            {renderBadgeScrum(i.rol_scrum)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Equipo;