/*
  Pestaña "Resumen" del panel de admin.
  UI/UX Avanzado: Métricas agregativas, Donut de usuarios por rol,
  Distribución de fichas por jornada, salud de cuentas y desglose ejecutivo.
*/

import {
    Users,
    CheckCircle2,
    XCircle,
    ClipboardList,
    PieChart,
    BarChart3,
    Building2,
    Inbox,
    Sun,
    ShieldCheck,
    Layers
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import ChartDonut from "../../components/ui/ChartDonut";
import ChartBar from "../../components/ui/ChartBar";
import ProgressBar from "../../components/ui/ProgressBar";

const COLORES_ROL = {
    ADMINISTRADOR: "#1a6b0a",
    INSTRUCTOR: "#f59e0b",
    COORDINADOR: "#a855f7",
    APRENDIZ: "#3b82f6",
};

const COLORES_JORNADA = {
    Mañana: "#f59e0b",
    Tarde: "#0984e3",
    Noche: "#6c5ce7",
    Mixta: "#00b894",
};

function Resumen({ users = [], fichas = [], programas = [] }) {
    // Conteo de usuarios por rol
    const usuariosPorRol = ["ADMINISTRADOR", "INSTRUCTOR", "COORDINADOR", "APRENDIZ"].map((rol) => ({
        nombre: rol.charAt(0) + rol.slice(1).toLowerCase(),
        cantidad: users.filter((u) => u.rol === rol).length,
    }));

    // Conteo de fichas por programa
    const fichasPorPrograma = programas.map((p) => ({
        nombre: p.nombre_programa,
        cantidad: fichas.filter((f) => f.programa_id === p.programa_id).length,
    }));

    // Conteo de fichas por jornada
    const fichasPorJornada = Object.entries(
        fichas.reduce((acc, f) => {
            const jornada = f.jornada || "No asignada";
            acc[jornada] = (acc[jornada] || 0) + 1;
            return acc;
        }, {})
    ).map(([nombre, cantidad]) => ({ nombre, cantidad }));

    const activos = users.filter((u) => u.estado === "Activo").length;
    const inactivos = users.length - activos;

    const porcentajeActivos = users.length > 0
        ? Math.round((activos / users.length) * 100)
        : 0;

    return (
        <div>
            {/* Header General con Status Pill */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ margin: "0 0 4px" }}>Resumen general del sistema</h2>
                    <p className="admin-count">Métricas generales de usuarios, fichas y programas de formación</p>
                </div>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(0, 184, 148, 0.12)", border: "1px solid rgba(0, 184, 148, 0.3)", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700, color: "#00b894" }}>
                    <ShieldCheck size={14} /> Sistema Operativo
                </div>
            </div>

            {/* Grid de StatCards principales */}
            <div className="dash-section">
                <div className="dash-grid">
                    <StatCard
                        label="Usuarios totales"
                        value={users.length}
                        icon={<Users size={24} />}
                        tono="azul"
                    />
                    <StatCard
                        label="Usuarios activos"
                        value={activos}
                        icon={<CheckCircle2 size={24} />}
                        tono="verde"
                    />
                    <StatCard
                        label="Usuarios inactivos"
                        value={inactivos}
                        icon={<XCircle size={24} />}
                        tono={inactivos > 0 ? "rojo" : "neutro"}
                    />
                    <StatCard
                        label="Fichas registradas"
                        value={fichas.length}
                        icon={<ClipboardList size={24} />}
                        tono="morado"
                    />
                </div>
            </div>

            {/* Grid de Gráficas Estadísticas */}
            <div className="dash-grid-2" style={{ marginBottom: 24 }}>
                {/* Gráfica Donut: Usuarios por Rol */}
                <div className="dash-card">
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PieChart size={16} /> Distribución de usuarios por rol
                    </p>
                    {users.length > 0 ? (
                        <ChartDonut
                            data={usuariosPorRol}
                            dataKey="cantidad"
                            nameKey="nombre"
                            colores={usuariosPorRol.map((u) => COLORES_ROL[u.nombre.toUpperCase()] || "#95a5a6")}
                            alto={220}
                        />
                    ) : (
                        <div className="list-vacia-container">
                            <Inbox size={28} />
                            <p className="list-vacia" style={{ padding: 0 }}>No hay usuarios registrados.</p>
                        </div>
                    )}
                </div>

                {/* Gráfica Bar: Fichas por Programa */}
                <div className="dash-card">
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BarChart3 size={16} /> Fichas activas por programa
                    </p>
                    {programas.length > 0 ? (
                        <ChartBar
                            data={fichasPorPrograma}
                            dataKey="cantidad"
                            nameKey="nombre"
                            color="#1a6b0a"
                            alto={220}
                        />
                    ) : (
                        <div className="list-vacia-container">
                            <Inbox size={28} />
                            <p className="list-vacia" style={{ padding: 0 }}>No hay programas registrados.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bloque Secundario: Fichas por Jornada y Cobertura */}
            <div className="dash-grid-2" style={{ marginBottom: 24 }}>
                <div className="dash-card">
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Sun size={16} /> Fichas por jornada de formación
                    </p>
                    {fichasPorJornada.length > 0 ? (
                        <ChartDonut
                            data={fichasPorJornada}
                            dataKey="cantidad"
                            nameKey="nombre"
                            colores={fichasPorJornada.map((j) => COLORES_JORNADA[j.nombre] || "#95a5a6")}
                            alto={180}
                        />
                    ) : (
                        <div className="list-vacia-container">
                            <Inbox size={24} />
                            <p className="list-vacia" style={{ padding: 0 }}>Sin fichas para categorizar.</p>
                        </div>
                    )}
                </div>

                <div className="dash-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p className="dash-section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <Building2 size={16} /> Salud de accesos al sistema
                    </p>
                    <ProgressBar
                        porcentaje={porcentajeActivos}
                        etiqueta={`${activos} de ${users.length} usuarios con acceso activo (${porcentajeActivos}%)`}
                        tono={porcentajeActivos >= 80 ? "verde" : "rojo"}
                    />
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(128,128,128,0.12)", display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                        <span>Programas habilitados: <strong>{programas.length}</strong></span>
                        <span>Jornadas activas: <strong>{fichasPorJornada.length}</strong></span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Resumen;