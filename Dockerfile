# Stage 1: Build the app
FROM node:18-alpine AS builder
WORKDIR /app

# Accept Vite API base URL as a build arg and expose it as an ENV so Vite picks it up during build
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
# Ensure the build sees VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:stable-alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing (optional)
# nginx.conf is available in the build context under ops/nginx/
COPY ops/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
