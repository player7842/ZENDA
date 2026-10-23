/*
  Aplica la migración incremental de Semana 2 antes de desplegar en Render.

  Se ejecuta con `node scripts/migrar.js` desde /app (imagen Docker) o desde
  backend/ (repositorio local). La migración es idempotente y se puede
  ejecutar varias veces; el script falla con código distinto de cero si la
  base rechaza el SQL, para que Render no arranque una versión a medias.
*/

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

const candidatos = [
  resolve(__dirname, '../Database/migrations/002_semana2.sql'), // imagen Docker
  resolve(__dirname, '../../Database/migrations/002_semana2.sql'), // repo local
];
const rutaMigracion = candidatos.find((ruta) => existsSync(ruta));

if (!rutaMigracion) {
  console.error('[migrar] No se encontró Database/migrations/002_semana2.sql');
  process.exit(1);
}

const sslRechazaCertificadosInvalidos =
  process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: sslRechazaCertificadosInvalidos },
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: sslRechazaCertificadosInvalidos }
          : false,
    };

const client = new pg.Client(config);

try {
  await client.connect();
  const sql = readFileSync(rutaMigracion, 'utf8');
  await client.query(sql);
  console.info('[migrar] Migración 002_semana2.sql aplicada correctamente');
} catch (error) {
  console.error('[migrar] Error al aplicar la migración:', error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
