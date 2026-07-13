# syntax=docker/dockerfile:1

# ---------- Etape 1 : dependances + build ----------
FROM node:20-slim AS builder

# Prisma a besoin d'OpenSSL pour generer son moteur de requetes
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---------- Etape 2 : image de production ----------
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9090

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm install --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

# Repertoire pour la persistance du fichier SQLite
RUN mkdir -p /app/data

EXPOSE 9090

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
