# =====================================================================
# ZENDA — Backend (Express + PostgreSQL)
# Node 22 LTS, pnpm con lockfile congelado y puerto 4000.
# =====================================================================
FROM node:22-alpine

# pnpm viene incluido en Node a través de Corepack
RUN corepack enable

WORKDIR /app

# Copiamos primero solo las dependencias para aprovechar la caché de capas
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# El código de la aplicación
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]
