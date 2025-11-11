# CI/CD Pipeline & Deployment Workflow

## Overview

StockEase Frontend uses **GitHub Actions** for continuous integration and deployment. The pipeline automates testing, building, and deploying the application to production, ensuring code quality and fast deployment cycles.

### Pipeline Goals

- **Automated Testing**: Run tests on every commit/PR
- **Code Quality**: Lint and format checks
- **Production Build**: Optimize for deployment
- **Docker Containerization**: Build production container images
- **Fast Deployment**: Automated pushes to production

---

## CI/CD Architecture

```mermaid
graph TB
    Commit["Developer Commits<br/>Push to GitHub"]
    Trigger["GitHub Actions<br/>Trigger"]
    
    subgraph "Pipeline: Test & Build & Deploy"
        Stage1["STAGE 1: Test<br/>(All commits/PRs)"]
        Stage2["STAGE 2: Build & Deploy<br/>(Only main/master)"]
    end
    
    subgraph "Test Stage"
        Lint["Lint Code"]
        Test["Run Tests<br/>(478+ tests)"]
        Coverage["Generate Coverage<br/>(optional)"]
    end
    
    subgraph "Build & Deploy Stage"
        BuildApp["Build App<br/>(npm run build)"]
        Docker["Build Docker Image"]
        Registry["Push to<br/>Docker Registry"]
        Deploy["Deploy to<br/>Production"]
    end
    
    subgraph "Production Environment"
        Nginx["nginx Server<br/>Port 80"]
        App["React SPA"]
    end
    
    Commit --> Trigger
    Trigger -->|All PRs/Commits| Stage1
    Stage1 --> Lint
    Stage1 --> Test
    Test --> Coverage
    
    Trigger -->|Only main/master<br/>push (not PRs)| Stage2
    Stage2 --> BuildApp
    BuildApp --> Docker
    Docker --> Registry
    Registry --> Deploy
    Deploy --> Nginx
    Nginx --> App
```

---

## Pipeline Structure

The CI/CD pipeline is organized into two main stages:

### Stage 1: Testing
**Runs on**: All commits and pull requests
**Duration**: 30-40 seconds
**Files**: [Testing Details](./testing.md)

Tests all code changes to ensure quality and catch issues early.

### Stage 2: Build & Deploy
**Runs on**: Push to main/master only (not on PRs)
**Duration**: 2-5 minutes
**Files**: [Build & Deployment](./build-deploy.md)

Builds production bundle and Docker image, then deploys to production.

---

## Key Concepts

### Triggers

| Event | Action | Documentation |
|-------|--------|-----------------|
| **Push to master/main** | Run tests → Build → Deploy | [Build & Deployment](./build-deploy.md) |
| **PR to master/main** | Run tests → Report results | [Testing Details](./testing.md) |
| **Push to other branches** | No action | - |

### Environment Variables

All sensitive configuration uses GitHub Secrets:

| Secret | Purpose | Details |
|--------|---------|---------|
| **FRONTEND_API_BASE_URL** | Production API endpoint | [Secrets Configuration](./secrets.md) |
| **DOCKER_USERNAME** | Docker registry login | [Secrets Configuration](./secrets.md) |
| **DOCKER_PASSWORD** | Docker registry token | [Secrets Configuration](./secrets.md) |

See [Secrets Configuration](./secrets.md) for complete setup guide.

---

## Quick Links

- 📋 [Testing Stage Details](./testing.md) - Lint, tests, coverage
- 🔨 [Build & Deployment](./build-deploy.md) - Build bundle, Docker, deploy
- 🔐 [Secrets Configuration](./secrets.md) - Environment variables setup
- 🛠️ [Troubleshooting](./troubleshooting.md) - Common issues & solutions
- 📚 [Related Documentation](#related-documentation)

---

## Status Indicators

### Success Indicators

✓ All 478 tests passing  
✓ No linting errors  
✓ Build completes successfully  
✓ Docker image builds without errors  
✓ Deployment to production completes

### Failure Scenarios

| Failure | Impact | Action |
|---------|--------|--------|
| **Test failures** | Blocks PR and deployment | Fix test, re-push |
| **Lint errors** | Blocks PR and deployment | Fix linting, re-push |
| **Build errors** | Blocks deployment | Debug TypeScript/config errors |
| **Docker build fails** | Blocks deployment | Check Dockerfile, dependencies |
| **Deployment fails** | Manual intervention needed | Rollback, check server logs |

---

## Related Documentation

- [Docker & Containerization](../src/dockerstructure.md)
- [Testing Strategy](../src/tests.md)
- [Main Overview](../overview.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: November 2025  
**Pipeline**: deploy-frontend.yml  
**Test Suite**: 478+ tests  
**Deployment**: Automated to production  
**Status**: Production Ready

