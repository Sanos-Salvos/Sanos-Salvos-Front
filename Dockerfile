# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias de build
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo necesario para ejecutar la aplicación
COPY package.json package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/src ./src

RUN npm ci --production

EXPOSE 3000
CMD ["npm", "start"]
