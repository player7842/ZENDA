/*
  Gráfico de dona con Recharts. Ideal para "fases por estado",
  "evidencias por resultado", etc.

  <ChartDonut
    data={[{ nombre: "Aprobado", cantidad: 8 }, { nombre: "Reprobado", cantidad: 2 }]}
    dataKey="cantidad"
    nameKey="nombre"
    colores={["#00b894", "#e74c3c"]}
  />
*/
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PALETA_DEFAULT = ["#6C5CE7", "#00b894", "#0984e3", "#fdcb6e", "#e74c3c", "#b8860b"];

function ChartDonut({ data, dataKey, nameKey, colores = PALETA_DEFAULT, alto = 220 }) {
    if (!data || data.length === 0) {
        return <p className="list-vacia">No hay datos suficientes para graficar todavía.</p>;
    }
    return (
        <div style={{ width: "100%", height: alto }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                    >
                        {data.map((_, idx) => (
                            <Cell key={idx} fill={colores[idx % colores.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "none", fontSize: 13 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ChartDonut;