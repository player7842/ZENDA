// =====================================================================
// ZENDA — Configuración central de variables de entorno
// =====================================================================
// Se importa al arrancar el servidor (y desde los módulos que necesitan
// configuración) para:
//   1. Cargar el .env correcto sin depender del directorio de trabajo.
//   2. Fallar de inmediato si falta un secreto obligatorio (H-02).
//   3. Exponer los valores ya normalizados al resto del código.
// =====================================================================

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Primero el .env del backend, luego el de la raíz (Docker Compose).
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const OBLIGATORIAS = ['JWT_SECRET'];

const faltantes = OBLIGATORIAS.filter((clave) => !process.env[clave]?.trim());
if (faltantes.length > 0) {
  console.error(
    `[config] Faltan variables de entorno obligatorias: ${faltantes.join(', ')}.`
  );
  console.error(
    '[config] Copia backend/.env.example a backend/.env y define un JWT_SECRET largo y aleatorio.'
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.trim().length < 32) {
  const mensaje =
    '[config] JWT_SECRET tiene menos de 32 caracteres. Usa un secreto largo y aleatorio.';
  if (process.env.NODE_ENV === 'production') {
    console.error(mensaje);
    process.exit(1);
  }
  console.warn(`[config] Advertencia: ${mensaje}`);
}

// FRONTEND_URL admite varios orígenes separados por coma (Vercel + local).
const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET.trim(),
  // La sesión actual dura 24 h. HU-004 (Semanas 3–6) la reducirá a 15 min
  // con refresh rotativo; hasta entonces esta variable documenta el valor real.
  jwtSessionExpires: process.env.JWT_SESSION_EXPIRES || '24h',
  frontendUrls,
  frontendUrl: frontendUrls[0],
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  codigoProgramaCoordinador: Number(process.env.CODIGO_PROGRAMA_COORDINADOR) || 2338,
};

export default env;
