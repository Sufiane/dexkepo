# syntax=docker/dockerfile:1.7
# Build context: repo root (so workspaces + shared/ are reachable)
# Build from repo root:   docker build -f api/Dockerfile -t dexkepo-api .

############################
# Stage 1 — install deps
############################
FROM node:20-slim AS deps
WORKDIR /app

# OpenSSL needed by Prisma engine on debian-slim
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy manifests first for layer caching
COPY package.json package-lock.json ./
COPY api/package.json ./api/
COPY shared/package.json ./shared/
COPY web/package.json ./web/

# Install all workspaces (npm ci needs the same shape as the lockfile).
# Frontend deps add some weight; if image size matters later, prune via
# --omit=optional or two-phase install.
RUN npm ci

############################
# Stage 2 — build api + shared
############################
FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY shared ./shared
COPY api ./api

WORKDIR /app/api
RUN npx prisma generate
RUN npm run build

############################
# Stage 3 — runtime
############################
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Hoisted node_modules cover api + shared + prisma client
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared ./shared
COPY --from=build /app/api/package.json ./api/package.json
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/prisma ./api/prisma
COPY --from=build /app/api/data ./api/data

WORKDIR /app/api
ENV PORT=8080
EXPOSE 8080

# Apply pending migrations on boot, then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
