# =====================================================================
# ZENDA — Frontend (React + Vite servido con Nginx)
# Node 22 LTS en la etapa de build y Nginx en la imagen final.
# =====================================================================
FROM node:22-alpine AS build

RUN corepack enable
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# La URL del API se fija en tiempo de compilación porque Vite la incrusta
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
