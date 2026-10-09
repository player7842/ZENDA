/*
  Gráfico de barras simple con Recharts, ya estilizado con las
  variables de color del tema. Uso genérico para cualquier dashboard:

  <ChartBar
    data={[{ nombre: "Aprobada", cantidad: 4 }, { nombre: "Desaprobada", cantidad: 1 }]}
    dataKey="cantidad"
    nameKey="nombre"
    color="#6C5CE7"
  />
*/
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function ChartBar({ data, dataKey, nameKey, color = "#6C5CE7", alto = 220 }) {
    if (!data || data.length === 0) {
        return <p className="list-vacia">No hay datos suficientes para graficar todavía.</p>;
    }
    return (
        <div style={{ width: "100%", height: alto }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: 8, border: "none", fontSize: 13 }}
                    />
                    <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ChartBar;