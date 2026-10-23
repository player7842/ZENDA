// Solo se renderizan como enlace las URL http(s). Cualquier otro esquema
// (javascript:, data:, file:) se muestra como texto plano para evitar XSS.
export function esUrlSegura(valor) {
  if (typeof valor !== "string") return false;
  const url = valor.trim();
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default esUrlSegura;
