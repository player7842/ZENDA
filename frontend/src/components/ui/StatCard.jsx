/*
  Tarjeta de estadística reutilizable para cualquier dashboard.
  Uso: <StatCard label="Fichas" value={12} icon="📋" tono="azul" />
*/
function StatCard({ label, value, icon, tono = "neutro" }) {
    return (
        <div className={`stat-card stat-card-${tono}`}>
            {icon && <span className="stat-card-icon">{icon}</span>}
            <div className="stat-card-body">
                <span className="stat-card-value">{value}</span>
                <span className="stat-card-label">{label}</span>
            </div>
        </div>
    );
}

export default StatCard;