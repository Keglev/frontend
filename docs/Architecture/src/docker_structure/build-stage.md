# Build Stage (Stage 1: Builder)

## Overview

The builder stage compiles the React application using Node.js. After the build completes, this entire stage is discarded, keeping only the optimized `dist/` directory in the final image.

---

## Stage 1 Configuration

### Base Image

```dockerfile
FROM node:18-alpine AS builder
```

**Why Alpine?**
- Minimal size (~180MB vs 900MB+ for full Node.js)
- Contains Node.js and npm
- Security updates regularly

### Build Arguments

```dockerfile
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
```

Allows API endpoint configuration at build time:
```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com .
```

---

## Build Steps

### 1. Install Dependencies

```dockerfile
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
```

- `npm ci` (clean install) - Uses package-lock.json for reproducibility
- `--silent` - Reduces log noise
- Dependencies: ~200-300MB of node_modules

### 2. Copy Source Files

```dockerfile
COPY tsconfig*.json vite.config.ts ./
COPY src ./src
COPY public ./public
COPY index.html ./
```

**Copied**:
- TypeScript configuration
- Vite configuration
- Source code
- Public assets
- Entry point HTML

**Not copied** (via .dockerignore):
- Tests and test configuration
- Documentation
- Coverage reports
- Node modules (already installed)

### 3. Build Application

```dockerfile
RUN npm run build
```

**Build Output**:
- Compiles TypeScript → JavaScript
- Bundles and minifies code
- Optimizes assets
- Generates `dist/` directory (~2-5MB)

**Output Structure**:
```
dist/
├── index.html (entry point)
├── assets/
│   ├── index-ABC123.js (app code, minified)
│   ├── vendor-DEF456.js (React, dependencies)
│   └── index-XYZ789.css (styles)
└── public/
    └── (static assets)
```

---

## Performance Details

### Build Time Breakdown

```
npm ci: 20-30 seconds (installing dependencies)
TypeScript compilation: 20-30 seconds
Asset bundling: 10-20 seconds
Total: ~50-80 seconds (fresh build)
With cache: ~10-20 seconds
```

### Stage Output Size

```
Builder stage: ~400MB (includes Node.js + dependencies)
Output artifact (dist/): ~2-5MB
Ratio: ~100:1 reduction in size!
```

This is why multi-stage builds are so powerful—the entire builder stage is discarded after building, and only the tiny `dist/` folder is copied to production.

---

## Environment Variables

### Available at Build Time

- `NODE_ENV` - Set to production
- `VITE_API_BASE_URL` - API endpoint (from build arg)
- Any variable starting with `VITE_` - Vite exposes these

### Build-Time Replacement

Vite processes `import.meta.env.VITE_*` variables at build time:

```typescript
// In source code
const apiUrl = import.meta.env.VITE_API_BASE_URL;
// Build-time replacement:
// const apiUrl = "https://api.example.com";
```

The actual value is baked into the compiled bundle—not configurable at runtime!

---

## Optimization Techniques

### 1. Layer Caching

```dockerfile
# This layer is cached if package*.json hasn't changed
COPY package*.json ./
RUN npm ci --silent

# This layer rebuilds if src/ has changed
COPY src ./src
RUN npm run build
```

**Strategy**: Dependencies before source code = faster rebuilds when only code changes.

### 2. npm ci vs npm install

```dockerfile
RUN npm ci  # ← Correct for Docker
# NOT: npm install (may update package versions!)
```

`npm ci` is deterministic—uses exact versions from package-lock.json.

### 3. .dockerignore

```
__tests__
*.test.ts
*.test.tsx
docs
coverage
```

Excludes unnecessary files from Docker context → faster builds.

---

## Related Documentation

- [Docker Overview](./overview.md)
- [Production Stage](./production-stage.md)
- [Build Configuration](./configuration.md)
- [Local Usage](./local-usage.md)

---

**Last Updated**: November 2025

