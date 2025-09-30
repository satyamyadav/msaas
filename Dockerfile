# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
# Install dependencies first to leverage Docker layer caching.
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma requires a DATABASE_URL at build time for client generation.
ARG DATABASE_URL="postgresql://msaas:msaas@db:5432/msaas?schema=public"
ENV DATABASE_URL=${DATABASE_URL}
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
# The Prisma client is generated in node_modules during the build stage.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
