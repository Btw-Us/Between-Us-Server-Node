# Build stage for the Node.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Install dependencies for PocketBase
RUN apk add --no-cache \
    ca-certificates \
    wget \
    unzip \
    supervisor

# Set PocketBase version
ARG POCKETBASE_VERSION=0.25.6

# Download and install PocketBase
RUN wget -O /tmp/pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" \
    && unzip /tmp/pocketbase.zip -d /usr/local/bin/ \
    && rm /tmp/pocketbase.zip \
    && chmod +x /usr/local/bin/pocketbase

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create directories for PocketBase data
RUN mkdir -p /pb/pb_data /pb/pb_migrations

# Copy startup scripts
COPY scripts/start-pocketbase.sh /usr/local/bin/start-pocketbase.sh
RUN chmod +x /usr/local/bin/start-pocketbase.sh

# Environment variables
# PocketBase configuration (should be overridden at runtime)
ENV POCKETBASE_URL=http://127.0.0.1:8090
ENV POCKETBASE_PORT=8090
ENV POCKETBASE_ADMIN_EMAIL=admin@example.com
ENV POCKETBASE_ADMIN_PASSWORD=securepassword123

# Node.js server configuration
ENV PORT=3000
ENV NODE_ENV=production

# Supervisor configuration to run both PocketBase and Node.js
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports (defaults - actual ports are determined by environment variables at runtime)
# 3000 - Node.js Express server (configurable via PORT env var)
# 8090 - PocketBase Admin UI and API (configurable via POCKETBASE_PORT env var)
EXPOSE 3000 8090

# Health check (wget is installed via apk above)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

# Start supervisor which manages both processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
