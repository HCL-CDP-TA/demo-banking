# 1. Use the official Node.js image
FROM node:20-alpine AS builder

# 2. Set the working directory
WORKDIR /app

# 3. Copy dependencies
COPY package*.json ./
COPY . .

# 4. Install dependencies and build
RUN npm install
RUN npm run build

# 5. Production image
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/language ./language  
COPY --from=builder /app/data ./data          

# Start the app
EXPOSE 3000
CMD ["node", "server.js"]