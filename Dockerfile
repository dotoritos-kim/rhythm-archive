# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nestia.config.ts ./
COPY tsconfig*.json ./

# Install dependencies (including dev dependencies for build)
# Skip prepare scripts during installation to avoid ts-patch issues
RUN npm install --legacy-peer-deps --ignore-scripts || npm install --force --legacy-peer-deps --ignore-scripts
RUN npm cache clean --force

# Copy source code
COPY src/ ./src/

# Copy Prisma files
COPY prisma ./prisma/

# Create generated directory
RUN mkdir -p generated

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build:safe || npm run build

# Generate Swagger documentation
RUN npm run swagger:generate:safe || npm run swagger:generate || echo "Swagger generation failed, continuing..."

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production --legacy-peer-deps --ignore-scripts || npm install --only=production --force --legacy-peer-deps --ignore-scripts
RUN npm cache clean --force

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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["node", "dist/main"] 