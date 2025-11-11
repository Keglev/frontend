# Local Development & Testing

## Building Locally

### Basic Build

```bash
docker build -t stockease-frontend:latest .
```

### Build with Custom API URL

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8081/api \
  -t stockease-frontend:dev .
```

### Build with Specific Version

```bash
docker build -t stockease-frontend:v1.0.0 .
```

### Build with BuildKit (Faster)

```bash
DOCKER_BUILDKIT=1 docker build -t stockease-frontend:latest .
```

---

## Running Containers

### Basic Run

```bash
docker run -p 8080:80 stockease-frontend:latest
```

Opens app at `http://localhost:8080`

### Run in Background

```bash
docker run -d -p 8080:80 --name stockease stockease-frontend:latest
```

- `-d` - Detached mode (background)
- `--name stockease` - Container name for easy reference

### View Logs

```bash
# Real-time logs
docker logs -f stockease

# Last 50 lines
docker logs --tail 50 stockease

# Logs with timestamps
docker logs -f --timestamps stockease
```

### Stop Container

```bash
docker stop stockease
docker rm stockease
```

---

## Testing the Container

### Test HTTP Response

```bash
# Health check
curl http://localhost:8080

# Specific page
curl http://localhost:8080/admin/

# Static asset
curl -i http://localhost:8080/assets/index.js
```

### Check Cache Headers

```bash
curl -i http://localhost:8080/assets/index.js | grep Cache-Control
# Should show: Cache-Control: public, immutable
```

### Test SPA Routing

```bash
# These should all return index.html (not 404)
curl -I http://localhost:8080/admin
curl -I http://localhost:8080/user
curl -I http://localhost:8080/search-product

# Check Content-Type is text/html
curl -I http://localhost:8080/user | grep Content-Type
```

---

## Docker Compose

### Multi-Service Setup

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        VITE_API_BASE_URL: http://backend:8081/api
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - NODE_ENV=production

  backend:
    build: ../backend
    ports:
      - "8081:8081"
    environment:
      - DB_HOST=postgres
      - API_PORT=8081

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=stockease
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v

# Rebuild images
docker-compose build

# Restart specific service
docker-compose restart frontend
```

---

## Image Inspection

### View Image History

```bash
docker history stockease-frontend:latest
```

Shows all layers and their sizes.

### Check Image Size

```bash
docker images | grep stockease
```

Example output:
```
stockease-frontend    latest    abc123def456    45MB
```

### Inspect Full Image Details

```bash
docker inspect stockease-frontend:latest | jq '.[0] | keys'
```

---

## Interactive Shell

### Access Container Shell

```bash
docker run -it stockease-frontend:latest /bin/sh
```

- `-i` - Interactive
- `-t` - Terminal

### Common Commands Inside Container

```bash
# View nginx config
cat /etc/nginx/conf.d/default.conf

# Check nginx is running
ps aux | grep nginx

# List served files
ls -la /usr/share/nginx/html

# Test connectivity
curl http://localhost/

# Exit
exit
```

---

## Debugging

### Enable Debug Mode

```bash
# Run with verbose logging
docker run --env NGINX_DEBUG=1 stockease-frontend:latest
```

### Check Container Logs

```bash
docker logs stockease-frontend
```

### Inspect Running Container

```bash
# Show processes
docker top stockease

# Show resource usage
docker stats stockease

# Show port bindings
docker port stockease
```

### Test Without Cache

```bash
docker build --no-cache -t stockease:test .
```

---

## Cleanup

### Remove Container

```bash
docker rm stockease
```

### Remove Image

```bash
docker rmi stockease-frontend:latest
```

### Remove All Unused Images

```bash
docker image prune
```

### Remove Everything (careful!)

```bash
docker system prune -a
```

---

## Common Development Workflow

```bash
# 1. Make code changes
# 2. Build new image
docker build -t stockease:dev .

# 3. Stop old container
docker stop stockease || true

# 4. Remove old container
docker rm stockease || true

# 5. Run new container
docker run -p 8080:80 --name stockease stockease:dev

# 6. View logs
docker logs -f stockease

# 7. Test in browser
open http://localhost:8080
```

---

## Performance Testing

### Load Test with ab

```bash
# Install Apache Bench
brew install httpd  # macOS
apt-get install apache2-utils  # Linux

# Run load test
ab -n 1000 -c 10 http://localhost:8080/
```

- `-n 1000` - 1000 requests
- `-c 10` - 10 concurrent

### Monitor Resource Usage

```bash
docker stats --no-stream stockease
```

---

## Related Documentation

- [Docker Overview](./overview.md)
- [Build Stage](./build-stage.md)
- [Production Stage](./production-stage.md)
- [Configuration](./configuration.md)
- [Troubleshooting](./troubleshooting.md)

---

**Last Updated**: November 2025

