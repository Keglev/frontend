# Docker Troubleshooting & Security

## Common Issues

### App Not Loading on SPA Routes

**Symptom**: `/admin` or `/user` returns 404

**Cause**: nginx not configured for SPA routing

**Solution**:
1. Check nginx config has `try_files $uri /index.html`
2. Verify `ops/nginx/nginx.conf` is being copied
3. Restart container

```bash
docker logs stockease-frontend | grep nginx
```

### API Calls Failing

**Symptom**: Frontend loads but API calls return 404/CORS errors

**Cause**: `VITE_API_BASE_URL` build argument not set correctly

**Solution**:

```bash
# Check what URL was baked into the app
docker run --rm stockease-frontend:latest \
  cat /usr/share/nginx/html/assets/*.js | grep -i "api" | head -5

# Rebuild with correct URL
docker build \
  --build-arg VITE_API_BASE_URL=https://api.correct.com \
  -t stockease-frontend:latest .
```

### 404 on Static Assets

**Symptom**: CSS/JS files return 404

**Cause**: Files not in dist/ directory, or nginx path issue

**Solution**:

```bash
# Check what files are in container
docker run --rm stockease-frontend:latest \
  ls -la /usr/share/nginx/html/assets/

# Check nginx config
docker run --rm stockease-frontend:latest \
  cat /etc/nginx/conf.d/default.conf | grep location
```

### Large Image Size

**Symptom**: Image is 100MB+ instead of ~45MB

**Cause**: Node.js still included, or large build artifacts

**Solution**:

```bash
# Check image layers
docker history stockease-frontend:latest

# Verify .dockerignore excludes build artifacts
cat .dockerignore | grep -E "node_modules|dist|coverage"

# Rebuild
docker build --no-cache -t stockease:test .
```

### Slow Docker Builds

**Symptom**: Building takes 2-3 minutes

**Cause**: npm dependencies or no caching

**Solution**:

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t stockease:latest .

# Check .dockerignore is optimized
wc -l .dockerignore  # Should have ~30 lines

# Verify layer caching working
docker build --no-cache -t stockease:test .  # Slow - no cache
docker build -t stockease:test .              # Fast - uses cache
```

### Port Already in Use

**Symptom**: `docker run` fails with "port 80 already in use"

**Cause**: Another container or service using port 80

**Solution**:

```bash
# Check what's using port 80
docker ps | grep ":80"
lsof -i :80  # Show process using port

# Use different port
docker run -p 8080:80 stockease-frontend:latest

# Or stop conflicting container
docker stop <container-id>
```

### Container Exits Immediately

**Symptom**: Container starts then stops

**Cause**: nginx crashed or failed to start

**Solution**:

```bash
# Check logs
docker logs stockease-frontend

# Test nginx config
docker run --rm stockease-frontend:latest \
  nginx -t

# Run interactively to see error
docker run -it stockease-frontend:latest /bin/sh
# Then type: nginx -t
```

---

## Performance Optimization

### Build Time Optimization

```yaml
# Optimal layer order (fastest builds)
1. FROM node:18-alpine
2. COPY package*.json
3. RUN npm ci
4. COPY tsconfig*.json vite.config.ts
5. COPY src ./src
6. RUN npm run build
7. FROM nginx:alpine
8. COPY --from=builder dist
```

**Why this order?**
- Dependencies layer (COPY package.json + RUN npm ci) changes rarely
- Source code layer (COPY src) changes frequently
- When only code changes, Docker reuses dependencies layer

### Runtime Performance

```
Metrics:
├─ Startup: <2 seconds
├─ Memory: 50-100MB
├─ Response time: <100ms
└─ Concurrent users: 1000+
```

Nginx is already highly optimized. Most performance comes from:
- CDN (for static assets)
- Browser caching (via Cache-Control headers)
- Asset optimization (minification, gzip)

---

## Security Best Practices

### ✅ Implement These

**1. Security Headers**
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000" always;
```

**2. Non-Root User**
```dockerfile
# Alpine nginx runs as non-root by default
# Verify: docker run --user 0 --rm app id
# Should show: uid=101(nginx) gid=101(nginx)
```

**3. HTTPS Only**
```yaml
# Behind a reverse proxy or load balancer
# Force HTTPS redirect
if ($scheme != "https") {
  return 301 https://$server_name$request_uri;
}
```

**4. Minimal Base Image**
- Alpine Linux (minimal attack surface)
- No unnecessary packages
- Regular security updates

**5. No Hardcoded Secrets**
- Use environment variables/secrets
- Don't include credentials in Dockerfile
- Use `--build-arg` for sensitive values

### Vulnerability Scanning

```bash
# Scan image with Snyk
docker scan stockease-frontend:latest

# Scan with Trivy
trivy image stockease-frontend:latest

# Fix vulnerabilities
docker pull nginx:latest  # Update base image
docker build --no-cache -t stockease:latest .
```

---

## Health Checks

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/index.html || exit 1
```

### Monitor Health

```bash
# Run with health check
docker run --health-interval=10s stockease-frontend:latest

# Check status
docker ps | grep stockease
docker inspect --format='{{json .State.Health}}' stockease-frontend
```

---

## Debugging Techniques

### Inspect Image Layers

```bash
docker history stockease-frontend:latest
```

Shows:
- What each layer contains
- Layer size
- Commands that created each layer

### Run Shell Inside Container

```bash
docker run -it stockease-frontend:latest /bin/sh
```

**Common debugging commands**:
```bash
# Test nginx config
nginx -t

# List served files
ls -la /usr/share/nginx/html/

# Check if nginx is running
ps aux | grep nginx

# Test local request
curl http://localhost/
```

### View Real-Time Logs

```bash
docker logs -f --timestamps stockease-frontend
```

---

## Production Considerations

### Use Specific Base Image Versions

```dockerfile
# ❌ Don't
FROM node:18-alpine
FROM nginx:latest

# ✅ Do
FROM node:18.17.1-alpine3.18
FROM nginx:1.25.3-alpine3.18
```

Pinning versions ensures reproducible builds.

### Image Registry

```bash
# Tag for registry
docker tag stockease-frontend:latest myregistry.azurecr.io/stockease:v1.0.0

# Push to registry
docker push myregistry.azurecr.io/stockease:v1.0.0

# Pull from registry
docker pull myregistry.azurecr.io/stockease:v1.0.0
```

### Automated Scanning in CI

```yaml
# GitHub Actions
- name: Scan image
  run: docker scan stockease-frontend:latest
```

---

## Related Documentation

- [Docker Overview](./overview.md)
- [Configuration](./configuration.md)
- [Local Usage](./local-usage.md)
- [Build Stage](./build-stage.md)
- [Production Stage](./production-stage.md)

---

**Last Updated**: November 2025  
**Status**: Production Ready  
**Maintenance**: Security patches monthly

