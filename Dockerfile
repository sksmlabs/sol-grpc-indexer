# ---- Builder ----
    FROM node:20-alpine AS builder
    RUN apk add --no-cache openssl libc6-compat
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    # Generate Prisma client in build stage
    COPY prisma ./prisma
    RUN npx prisma generate
    
    COPY tsconfig.json ./
    COPY src ./src
    COPY scripts ./scripts
    
    # Compile TS -> dist
    RUN npm run build
    
    # ---- Runner ----
    FROM node:20-alpine AS runner
    RUN apk add --no-cache openssl libc6-compat
    WORKDIR /app
    
    # Install only prod deps
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    # Bring compiled code and generated Prisma client from builder
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
    
    # If you read files from ./prisma at runtime (usually not), copy it too:
    # COPY --from=builder /app/prisma ./prisma
    
    ENV NODE_ENV=production
    EXPOSE 3000
    CMD ["node", "dist/src/index.js"]
    