# --- 1. Build Stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Install required dependencies
COPY package*.json ./
RUN npm install

# Copy full app code
COPY . .

# Generate Prisma Client **WITH binaries** matching the Docker runtime
RUN npx prisma generate

# Build Next.js app (standalone)
RUN npm run build

# --- 2. Production Runner ---
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Add bash (needed by wait-for-it.sh)
RUN apt-get update && apt-get install -y bash

# Copy wait-for-it and make executable
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

# Copy necessary build artefacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static .next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/language ./language

# 🔔 Prisma engines
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Use wait-for-it to delay start until DB ready, then run Next standalone server
CMD ["/app/wait-for-it.sh", "database:5432", "--", "node", "server.js"]