# Docker Containerization & Deployment

## Overview

StockEase Frontend uses **multi-stage Docker builds** to create optimized production containers. The build process compiles the React application and serves it via nginx, minimizing image size and improving startup time.

### Key Features

- **Multi-Stage Build**: Reduces final image size by excluding build artifacts
- **Alpine Linux**: Small base images for both Node.js and nginx
- **Build Argument**: Runtime API configuration
- **SPA Routing**: nginx configured for client-side routing
- **Security**: Non-root execution and minimal dependencies

---

## Dockerfile Architecture

### Multi-Stage Build Diagram

```mermaid
graph TB
    subgraph "Stage 1: Builder"
        Base1["node:18-alpine"]
        Deps["Install Dependencies<br/>npm ci"]
        Copy1["Copy Source Files<br/>src/, config files"]
        Build["Build App<br/>npm run build"]
        Dist["Output: dist/"]
    end
    
    subgraph "Stage 2: Production"
        Base2["nginx:stable-alpine"]
        Copy2["Copy dist/<br/>to nginx"]
        Config["Copy nginx.conf<br/>SPA routing"]
        Runtime["Runtime: nginx"]
    end
    
    Base1 -->|build| Deps
    Deps -->|install| Copy1
    Copy1 -->|source| Build
    Build -->|output| Dist
    
    Base2 -->|setup| Copy2
    Copy2 -->|config| Config
    Config -->|start| Runtime
    
    Dist -.->|copy| Copy2
    
    style Base1 fill:#e3f2fd
    style Base2 fill:#c8e6c9
    style Runtime fill:#fff9c4
```

---

## Build Stages

The Docker build uses two stages to optimize final image size:

### Stage 1: Builder

**Base Image**: `node:18-alpine` (~180MB)

**Purpose**: Compile TypeScript, bundle JavaScript, optimize assets

- Install dependencies
- Copy source files
- Run build process
- Output: optimized `dist/` directory

See [Build Stage Details](./build-stage.md) for complete information.

### Stage 2: Production (nginx)

**Base Image**: `nginx:stable-alpine` (~41MB)

**Purpose**: Serve built application via web server

- Copy optimized dist/ files
- Configure nginx for SPA routing
- Run production server
- **Final size**: ~45MB (no Node.js, no build tools)

See [Production Stage Details](./production-stage.md) for complete information.

---

## Key Components

### Build Arguments & Configuration

Environment variables can be passed at build time for different deployments:

| Variable | Purpose | Example |
|----------|---------|---------|
| VITE_API_BASE_URL | Production API endpoint | `https://api.stockease.com` |
| NODE_ENV | Build environment | production |

See [Build Configuration](./configuration.md) for detailed setup.

### nginx Configuration for SPA Routing

The nginx configuration enables client-side routing without 404 errors on non-root paths:

```
/assets/... (static files)  → Serve with cache headers
/admin, /user, etc.        → Serve index.html → React Router handles
```

See [SPA Routing Details](./configuration.md#spa-routing) for complete configuration.

### .dockerignore

Excludes unnecessary files from the Docker build context, improving build speed:

- Tests and coverage files
- Documentation
- Git files and IDE config
- Node modules (reinstalled)

See [Build Configuration](./configuration.md#dockerignore) for complete list.

---

## Deployment Workflow

```mermaid
graph TD
    SourceCode["Source Code<br/>GitHub Repository"]
    CI["GitHub Actions<br/>CI/CD Pipeline"]
    Test["Run Tests"]
    BuildApp["Build App"]
    BuildDocker["Docker Build<br/>(Multi-stage)"]
    Registry["Docker Registry"]
    Deploy["Deploy to<br/>Production"]
    Running["Running App<br/>Port 80"]
    
    SourceCode -->|Push| CI
    CI --> Test
    Test -->|Pass| BuildApp
    BuildApp --> BuildDocker
    BuildDocker -->|Push| Registry
    Registry -->|Pull| Deploy
    Deploy --> Running
```

---

## Quick Links

- 📦 [Build Stage Details](./build-stage.md) - Node.js builder configuration
- 🚀 [Production Stage Details](./production-stage.md) - nginx runtime configuration
- ⚙️ [Build Configuration](./configuration.md) - Build args, dockerignore, SPA routing
- 🔧 [Running Locally](./local-usage.md) - Docker commands and docker-compose
- 🛡️ [Security & Performance](./security-performance.md) - Optimization and best practices
- � [CI/CD Pipeline](./ci-cd.md) - GitHub Actions workflow and automation
- �🐛 [Troubleshooting](./troubleshooting.md) - Common issues and solutions

---

## Performance Summary

| Metric | Value |
|--------|-------|
| Final Image Size | ~45MB |
| Build Time | 1-2 minutes (fresh) / 30-40s (cached) |
| Container Startup | <2 seconds |
| Memory Usage | 50-100MB |
| Response Time | <100ms |
| Concurrent Connections | 1000+ |

---

## Architecture Comparison

### Development
- Vite dev server with hot reload
- Full source maps
- Slower build, faster iteration

### Production (Docker)
- Optimized bundle
- Minimal dependencies
- Fast startup, efficient serving

---

## Related Documentation

- [CI/CD Pipeline](../pipeline/overview.md)
- [Main Overview](../overview.md)
- [GitHub Actions CI/CD](../pipeline/overview.md)
- [Official Docker Docs](https://docs.docker.com/)

---

**Last Updated**: November 2025  
**Node Version**: 18 Alpine  
**nginx Version**: Stable Alpine  
**Final Image Size**: ~45MB

