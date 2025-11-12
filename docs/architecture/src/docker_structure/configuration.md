# Build Configuration & SPA Routing

## Build Arguments

### VITE_API_BASE_URL

Pass the API endpoint at build time:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.staging.com \
  -t stockease-frontend:staging .

docker build \
  --build-arg VITE_API_BASE_URL=https://api.production.com \
  -t stockease-frontend:production .
```

**In Dockerfile**:
```dockerfile
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
```

**In Code** (Vite replaces at build time):
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
// Becomes:
const apiUrl = "https://api.production.com";
```

---

## .dockerignore

Excludes files from Docker build context, improving build speed.

```
# Version Control
.git
.gitignore
.github

# Dependencies (reinstalled)
node_modules
.pnp

# Build Artifacts
dist
coverage
typedoc-output
architecture-html

# Tests (not needed)
__tests__
*.test.ts
*.test.tsx
*.test.js
vitest.config.ts
jest.config.js

# Documentation
docs
README.md
CHANGELOG.md
*.md

# IDE & Tools
.vscode
.idea
.DS_Store
*.swp
*.swo
Thumbs.db

# Development Files
.env.local
.env.development
.env.test
```

### Performance Impact

```
With .dockerignore:
  Build context: ~50MB
  Build time: 10-15s

Without .dockerignore:
  Build context: 200MB+
  Build time: 30-40s
```

---

## SPA Routing Configuration

### Problem

Regular web servers return 404 for non-root routes:
```
GET /admin     → 404 (file not found)
GET /user      → 404 (file not found)
```

But these routes should serve `index.html` so React Router can handle them client-side.

### Solution: nginx Configuration

```nginx
location ~ ^/assets/ {
  # Static assets: serve with long cache headers
  expires 1y;
  add_header Cache-Control "public, immutable";
  try_files $uri =404;
}

location / {
  # Everything else: serve index.html for SPA routing
  try_files $uri /index.html;
}
```

### Request Flow

```
GET /assets/index.js
  ↓
Match: location ~ ^/assets/
  ↓
Serve: /usr/share/nginx/html/assets/index.js
  ↓
Cache-Control: 1 year

GET /admin
  ↓
No match: doesn't start with /assets/
  ↓
Fall through to: location /
  ↓
try_files $uri /index.html
  ↓
Serve: /usr/share/nginx/html/index.html
  ↓
React Router: renders /admin page
```

### Complete Configuration Example

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Static assets with long caching
  location ~ \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # API requests: pass through
  location /api/ {
    proxy_pass $VITE_API_BASE_URL;
  }

  # SPA routing: serve index.html
  location / {
    try_files $uri /index.html =404;
  }

  # Health check
  location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }
}
```

---

## Development vs Production

### Development (Vite)

```bash
npm run dev
# Vite server running on http://localhost:5173
# Hot reload on file changes
# Full source maps
# No optimizations
```

### Production (Docker)

```bash
docker build -t app:latest .
docker run -p 80:80 app:latest
# nginx serving static files
# Optimized bundle
# Long-lived cache
# No source maps
```

---

## Build Optimization Strategies

### Layer Caching

Order Dockerfile to cache dependencies before source:

```dockerfile
# This layer caches if package*.json unchanged
COPY package*.json ./
RUN npm ci

# This layer rebuilds if src/ changed (common case)
COPY src ./src
RUN npm run build
```

**Benefit**: Only rebuild app code when necessary, reuse npm dependencies.

### BuildKit

Enable Docker BuildKit for faster builds:

```bash
DOCKER_BUILDKIT=1 docker build -t app:latest .
```

Benefits:
- Parallel layer building
- Better caching
- Smaller context uploads
- More efficient builds

---

## Verification

### Check Build Arguments Were Used

```bash
# Build with API URL
docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t app .

# Check nginx config inside container
docker run app cat /etc/nginx/conf.d/default.conf

# Verify SPA routing works
docker run -p 8080:80 app &
sleep 2
curl http://localhost:8080/admin/  # Should return index.html content
```

---

## Related Documentation

- [Docker Overview](./overview.md)
- [Build Stage](./build-stage.md)
- [Production Stage](./production-stage.md)
- [Local Usage](./local-usage.md)

---

**Last Updated**: November 2025

