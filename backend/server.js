// Archivo principal del servidor backend:
// valida la configuración, configura Express y arranca el servidor.

import env from './src/config/env.js';
import app from './src/app.js';
import { testConnection } from './src/config/db.js';

app.listen(env.port, async () => {
  console.info(`Servidor corriendo en el puerto ${env.port}`);
  await testConnection();
});
