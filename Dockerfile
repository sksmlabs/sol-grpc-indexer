# ---- Builder ----
    FROM node:20-alpine AS builder
    RUN apk add --no-cache openssl libc6-compat
    WORKDIR /app
    
    # Allow passing app path
    ARG APP_PATH
    
    # Copy package manifests and install deps
    COPY ${APP_PATH}/package*.json ./
    RUN npm ci
    
    # Copy Prisma schema from repo root (adjust if lives elsewhere)
    COPY prisma ./prisma
    
    # Generate Prisma client (outputs to node_modules/.prisma + @prisma/client)
    RUN npx prisma generate
    
    # Copy app sources
    COPY ${APP_PATH}/tsconfig.json ./
    COPY ${APP_PATH}/src ./src
    COPY ${APP_PATH}/scripts ./scripts
    
    # Compile TypeScript -> dist
    RUN npm run build
    
    # ---- Runner ----
    FROM node:20-alpine AS runner
    RUN apk add --no-cache openssl libc6-compat
    WORKDIR /app
    
    ARG APP_PATH
    COPY ${APP_PATH}/package*.json ./
    RUN npm ci --omit=dev
    
    # Copy build output + Prisma client from builder
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
    
    ENV NODE_ENV=production
    EXPOSE 3000
    
    # Adjust entrypoint to your actual build output
    CMD ["node", "dist/src/index.js"]
    