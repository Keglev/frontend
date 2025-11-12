# ============================================================================
# Stage 1: Build React TypeScript Application
# ============================================================================
# Build a production-optimized bundle using Node.js 18 Alpine image
# (minimal, lightweight image for faster builds and deployments)
FROM node:18-alpine AS builder

WORKDIR /app

# Build-time arguments for environment configuration
# VITE_API_BASE_URL: Backend API endpoint (e.g., https://api.example.com)
# Pass via: docker build --build-arg VITE_API_BASE_URL="https://api.example.com"
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Install dependencies efficiently
# npm ci (clean install) is preferred over npm install in Docker for reproducible builds
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source files for build
# Unnecessary files are excluded via .dockerignore (docs, tests, git files, etc.)
COPY src/ src/
COPY public/ public/
COPY index.html index.html
COPY vite.config.ts vite.config.ts
COPY tsconfig.json tsconfig.json
COPY tsconfig.app.json tsconfig.app.json
COPY tsconfig.node.json tsconfig.node.json
COPY tailwind.config.js tailwind.config.js
COPY postcss.config.cjs postcss.config.cjs

# Build production bundle
# VITE_API_BASE_URL environment variable is automatically used by Vite
RUN npm run build

# ============================================================================
# Stage 2: Production Server with Nginx
# ============================================================================
# Serve static files using minimal Nginx Alpine image
# Multi-stage build keeps production image size small (~100MB vs ~500MB without multi-stage)
FROM nginx:stable-alpine

# Remove default nginx content to prevent confusion
RUN rm -rf /usr/share/nginx/html/*

# Copy optimized production bundle from builder stage
# dist/ contains minified and optimized React build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration for SPA routing
# Handles React Router: routes to index.html for all non-static routes (try_files fallback)
# Includes gzip compression and security headers
COPY ops/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx in foreground mode (required for Docker containers)
# Keeps container running and allows logs to be captured
CMD ["nginx", "-g", "daemon off;"]
