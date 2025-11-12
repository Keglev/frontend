# Production Stage (Stage 2: nginx)

## Overview

The production stage serves the built application via nginx. It contains only the compiled assets (~2-5MB), making the final image lightweight (~45MB total with nginx).

---

## Stage 2 Configuration

### Base Image

```dockerfile
FROM nginx:stable-alpine
```

**Why nginx?**
- Lightweight web server (~41MB)
- Optimized for static file serving
- Excellent SPA routing support
- High performance and reliability

---

## Stage 2 Steps

### 1. Remove Default Content

```dockerfile
RUN rm -rf /usr/share/nginx/html/*
```

Removes nginx's default welcome page to prepare for application files.

### 2. Copy Built Files

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

Copies only the optimized `dist/` directory from the builder stage:
- ~2-5MB of compiled assets
- No Node.js, no build tools, no source code
- No tests, no documentation

### 3. Copy nginx Configuration

```dockerfile
COPY ops/nginx/nginx.conf /etc/nginx/conf.d/default.conf
```

Configures nginx for:
- SPA routing (serves `index.html` for non-static requests)
- Cache headers (long-lived caching for static assets)
- GZIP compression
- Security headers

See [Configuration](./configuration.md#spa-routing) for details.

### 4. Expose Port

```dockerfile
EXPOSE 80
```

Opens port 80 for HTTP traffic. Container will listen on this port.

### 5. Start nginx

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

**Why `daemon off;`?**
- Runs nginx in foreground mode
- Essential for Docker container lifecycle
- Container stays running while nginx runs
- Container stops when nginx stops

---

## Final Image Content

```
Image size: ~45MB total
├── nginx binary: ~40MB
├── Compiled assets: ~2-5MB
│   ├── index.html
│   ├── assets/index.js (bundled app code)
│   ├── assets/vendor.js (React, dependencies)
│   └── assets/index.css (styles)
└── nginx configuration
```

**NOT included**:
- Node.js runtime
- npm or build tools
- Source code
- Tests
- Documentation
- Development dependencies

---

## Health Checks

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/index.html || exit 1
```

Automatically checks if container is healthy:
- Every 30 seconds
- 5 second timeout
- Start checking after 5 seconds
- Mark unhealthy after 3 failures

### Kubernetes Probes

```yaml
startupProbe:
  httpGet:
    path: /index.html
    port: 80
  failureThreshold: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /index.html
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 10

livenessProbe:
  httpGet:
    path: /index.html
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 30
```

---

## Runtime Performance

```
Startup time: <2 seconds
Memory usage: 50-100MB
Response time: <100ms (static assets from memory cache)
Concurrent connections: 1000+ (via nginx)
Typical load: Can handle thousands of concurrent users
```

---

## Security Features

### Security Defaults

- Runs as non-root user (nginx user)
- Alpine Linux minimizes attack surface
- No unnecessary packages or build tools
- Read-only filesystem option available

### Security Headers

nginx configuration includes:
- `X-Frame-Options: SAMEORIGIN` (clickjacking protection)
- `X-Content-Type-Options: nosniff` (MIME sniffing protection)
- `Content-Security-Policy` (script injection protection)
- `Strict-Transport-Security` (HTTPS enforcement)

---

## Customization Options

### Add Custom nginx Config

```dockerfile
RUN echo 'server { ... }' > /etc/nginx/conf.d/custom.conf
```

### Mount Custom Configuration

```bash
docker run -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf ...
```

### Environment Variable Substitution

```dockerfile
RUN envsubst < /app/nginx.conf.template > /etc/nginx/conf.d/default.conf
```

---

## Related Documentation

- [Docker Overview](./overview.md)
- [Build Stage](./build-stage.md)
- [Configuration](./configuration.md)
- [Local Usage](./local-usage.md)
- [nginx Official Docs](https://nginx.org/en/docs/)

---

**Last Updated**: November 2025  
**nginx Version**: Stable Alpine  
**Final Image Size**: ~45MB

