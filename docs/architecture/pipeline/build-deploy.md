# Stage 2: Build & Deployment

## Overview

The build and deployment stage runs **only after tests pass** and **only on push to master/main**. It is skipped for pull requests.

**Duration**: 2-5 minutes  
**Runs on**: Push to master/main only (after tests pass)

---

## Deployment Flow

```mermaid
graph TD
    A["Depends on: test job passed"]
    B["Check: Only on push<br/>to master/main"]
    C{"Passed?"}
    D["Setup Node.js 20"]
    E["Install dependencies"]
    F["Build app<br/>npm run build"]
    G["Verify build"]
    H["Build Docker image"]
    I["Push to registry"]
    J["Deploy to production"]
    K["Verify deployment"]
    
    A --> B
    B --> C
    C -->|No (PR)| L["Skip deployment"]
    C -->|Yes| D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> M["Done"]
    
    style M fill:#c8e6c9
    style L fill:#ffccbc
```

---

## Build Job Steps

### 1. Checkout Repository

Clones repository and sets up git context.

### 2. Setup Node.js & Cache

Uses Node.js v20 with npm caching.

### 3. Install Dependencies

```yaml
- run: npm ci
```

Clean install from package-lock.json.

### 4. Build Production Bundle

```yaml
- name: Build production bundle
  run: |
    if [ -n "${{ secrets.FRONTEND_API_BASE_URL }}" ]; then
      export VITE_API_BASE_URL="${{ secrets.FRONTEND_API_BASE_URL }}"
    fi
    npm run build
```

**Build Process**:
- TypeScript compilation
- Bundling and minification
- Asset optimization
- Tree shaking
- Code splitting

**Output**: `dist/` directory

### 5. Verify Production Build

```yaml
- name: Verify production build
  run: bash scripts/verify-production-build.sh
```

**Verification Checks**:
- ✓ dist/ directory exists
- ✓ No test files (*.test.*)
- ✓ No source maps in production
- ✓ No docs/ directory
- ✓ index.html is present
- ✓ No console.logs or debuggers

### 6. Build Docker Image

```yaml
- name: Build Docker image
  run: docker build \
    --build-arg VITE_API_BASE_URL="${{ secrets.FRONTEND_API_BASE_URL }}" \
    -t stockease-frontend:latest .
```

**Multi-stage Build**:
1. Stage 1: Builder - Node.js 18 Alpine
   - Install dependencies
   - Copy source files
   - Run build
   - Output: dist/

2. Stage 2: Production - nginx Alpine
   - Copy dist/ from builder
   - Configure nginx
   - Expose port 80
   - Final image: ~45MB

### 7. Additional Steps

- Push to Docker Registry
- Deploy to cloud platform
- Run smoke tests
- Notify deployment status

---

## Build Output

### Artifact Structure

```
dist/
├── index.html                          # Entry point
├── assets/
│   ├── index-ABC123DEF456.js           # Bundled JavaScript (minified)
│   ├── index-XYZ789UVW012.css          # Compiled CSS (minified)
│   ├── vendor-ABC123DEF456.js          # Vendor code (React, etc.)
│   └── images/                         # Optimized images
└── public/
    └── (copied public assets)
```

### Build Statistics

```
Metrics:
├─ Bundle Size: ~250KB gzipped
├─ JavaScript: ~180KB gzipped
├─ CSS: ~40KB gzipped
├─ Images: ~30KB gzipped
├─ Build Time: 30-60 seconds
└─ Chunk Count: 3-5 optimal chunks
```

---

## Docker Build Process

### Build Command

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.stockease.com/api \
  -t stockease-frontend:latest .
```

### Dockerfile Multi-Stage Build

**Stage 1: Builder** (Node.js 18 Alpine)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**Stage 2: Production** (nginx Alpine)
```dockerfile
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ops/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Image Verification

```bash
# List image layers
docker history stockease-frontend:latest

# Check image size
docker images stockease-frontend

# Run and test
docker run -p 8080:80 stockease-frontend:latest
curl http://localhost:8080
```

---

## Deployment Strategy

### Zero-Downtime Deployment

```yaml
version: '3'
services:
  frontend:
    image: stockease-frontend:${BUILD_TAG}
    ports:
      - "80:80"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/index.html"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: always
```

**Health Checks**:
- Verify container starts
- Check HTTP 200 on index.html
- Automatic restart on failure
- Graceful rollback if unhealthy

### Deployment Process

```
Build Docker image
         ↓
Push to registry
         ↓
Pull on production server
         ↓
Stop old container
         ↓
Start new container
         ↓
Health checks
         ↓
Success → Done
Failure → Rollback to old version
```

---

## Local Testing

### Build Locally

```bash
# Build production bundle
npm run build

# Verify dist directory
ls -la dist/

# Check for test files (should be empty)
find dist -name "*.test.*" 
```

### Test Docker Locally

```bash
# Build Docker image
docker build -f Dockerfile -t stockease:test .

# Run container
docker run -p 8080:80 stockease:test

# Test in browser
curl http://localhost:8080
```

---

## Environment Configuration

Build uses environment variables from GitHub Secrets:

| Secret | Usage |
|--------|-------|
| FRONTEND_API_BASE_URL | Injected as VITE_API_BASE_URL |
| DOCKER_USERNAME | Docker registry authentication |
| DOCKER_PASSWORD | Docker registry token |

See [Secrets Configuration](./secrets.md) for setup details.

---

## Conditional Deployment

Deployment only runs if:
- ✓ Event is push (not pull_request)
- ✓ Branch is master or main
- ✓ Previous tests passed
- ✓ Build completed successfully

```yaml
if: github.event_name == 'push' && (github.ref == 'refs/heads/master' || github.ref == 'refs/heads/main')
```

---

## Related Documentation

- [Main Pipeline Overview](./overview.md)
- [Testing Stage](./testing.md)
- [Secrets Configuration](./secrets.md)
- [Troubleshooting](./troubleshooting.md)
- [Docker & Containerization](../src/dockerstructure.md)

---

**Last Updated**: November 2025  
**Build Tool**: Vite 6.0.5  
**Docker Base**: nginx Alpine  
**Image Size**: ~45MB

