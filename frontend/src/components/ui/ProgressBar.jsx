/*
  Barra de progreso reutilizable con etiqueta opcional.
  Uso: <ProgressBar porcentaje={68} etiqueta="Progreso general" tono="verde" />
*/
function ProgressBar({ porcentaje, etiqueta, tono = "morado" }) {
    const valor = Math.max(0, Math.min(100, porcentaje || 0));
    return (
        <div className="progress-widget">
            {etiqueta && (
                <div className="progress-widget-head">
                    <span>{etiqueta}</span>
                    <strong>{valor}%</strong>
                </div>
            )}
            <div className="progress-widget-track">
                <div className={`progress-widget-fill progress-widget-${tono}`} style={{ width: `${valor}%` }} />
            </div>
        </div>
    );
}

export default ProgressBar;