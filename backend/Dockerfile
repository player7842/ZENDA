# =====================================================================
# ZENDA — Backend (Express + PostgreSQL)
# Node 22 LTS, pnpm con lockfile congelado y puerto 4000.
# El contexto de build es la raíz del repositorio para poder incluir la
# migración idempotente que Render ejecuta antes de desplegar.
# =====================================================================
FROM node:22-alpine

RUN corepack enable
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /app

# Copiamos primero solo las dependencias para aprovechar la caché de capas
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# El código de la aplicación y la migración de Semana 2
COPY backend/ ./
COPY Database/migrations/002_semana2.sql ./Database/migrations/002_semana2.sql
COPY Database/migrations/003_cierre.sql ./Database/migrations/003_cierre.sql

ENV NODE_ENV=production
EXPOSE 4000

# El contenedor no necesita escribir en el sistema de archivos.
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

CMD ["node", "server.js"]
