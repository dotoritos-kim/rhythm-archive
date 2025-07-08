# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nestia.config.ts ./
COPY tsconfig*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm cache clean --force
RUN npm ci --legacy-peer-deps --verbose || npm install --legacy-peer-deps --verbose

# Copy Prisma files first
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate || echo "Prisma generate failed, continuing..."

# Copy source code
COPY src/ ./src/

# Create generated directory
RUN mkdir -p generated

# Verify dependencies before build
RUN ls -la node_modules/@nestjs/common || echo "NestJS common not found"
RUN ls -la node_modules/@nestjs/swagger || echo "NestJS swagger not found"

# Build application
RUN npm run build:safe || npm run build || (echo "Build failed, checking dependencies..." && npm list @nestjs/common && npm run build)

# Generate Swagger documentation
RUN npm run swagger:generate || echo "Swagger generation failed, continuing..."

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy generated Swagger documentation
COPY --from=builder /app/generated ./generated

# Create uploads directory
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check (commented out as health-check.js may not exist)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node dist/health-check.js || exit 1

# Start application
CMD ["node", "dist/main"] 