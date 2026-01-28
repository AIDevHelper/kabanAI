# 🐳 Docker Deployment Guide for KabanAI

Complete guide for running KabanAI in Docker containers.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Building and Running](#building-and-running)
- [Configuration](#configuration)
- [Volume Management](#volume-management)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## 🚀 Quick Start

```bash
# Navigate to project directory
cd /Users/admin/Documents/Thomas-SRC/KabanAI/ai-board

# Build and start with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:5001
```

**Login:** thomas / cb1312ef

That's it! 🎉

## 📦 Prerequisites

### Required

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Installation

**macOS:**
```bash
# Install Docker Desktop (includes Docker Compose)
brew install --cask docker

# Or download from: https://www.docker.com/products/docker-desktop
```

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Verify Installation:**
```bash
docker --version
docker-compose --version
```

## 🏗 Building and Running

### Option 1: Docker Compose (Recommended)

**Start the application:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop the application:**
```bash
docker-compose down
```

**Rebuild and restart:**
```bash
docker-compose up -d --build
```

### Option 2: Docker CLI

**Build the image:**
```bash
docker build -t kabanai:latest .
```

**Run the container:**
```bash
docker run -d \
  --name kabanai-app \
  -p 5001:5001 \
  -v $(pwd)/data:/app/data \
  kabanai:latest
```

**Stop the container:**
```bash
docker stop kabanai-app
docker rm kabanai-app
```

## ⚙️ Configuration

### Docker Compose Configuration

The `docker-compose.yml` file includes:

```yaml
services:
  kabanai:
    build: .
    ports:
      - "5001:5001"
    volumes:
      - ./data:/app/data
      - ${HOME}/Documents:/mnt/documents:ro
      - ${HOME}/Desktop:/mnt/desktop:ro
    environment:
      - FLASK_ENV=production
    restart: unless-stopped
```

### Customizing Ports

To use a different port, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:5001"  # Access at http://localhost:8080
```

Or use environment variable:
```bash
export KABANAI_PORT=8080
docker-compose up -d
```

### Customizing Volumes

Mount additional directories for task execution:

```yaml
volumes:
  - ./data:/app/data
  - /path/to/your/projects:/mnt/projects:ro
  - /path/to/your/workspace:/mnt/workspace
```

## 💾 Volume Management

### Data Persistence

The application data is stored in volumes:

```
./data/
├── aiboard.db        # SQLite database
└── workdirs/         # Task execution directories
```

### Backup Data

```bash
# Backup database
docker-compose exec kabanai cp /app/data/aiboard.db /app/data/aiboard.db.backup

# Or copy from host
cp data/aiboard.db data/aiboard.db.backup
```

### Restore Data

```bash
# Stop the application
docker-compose down

# Restore database
cp data/aiboard.db.backup data/aiboard.db

# Start the application
docker-compose up -d
```

### Clean Up Volumes

```bash
# Remove all data (WARNING: This deletes everything!)
docker-compose down -v

# Remove specific volume
docker volume rm kabanai_kabanai-data
```

## 🔧 Environment Variables

### Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_ENV` | `production` | Flask environment mode |
| `PYTHONUNBUFFERED` | `1` | Python unbuffered output |
| `DATABASE_PATH` | `/app/data/aiboard.db` | SQLite database location |

### Setting Variables

**In docker-compose.yml:**
```yaml
environment:
  - FLASK_ENV=development
  - CUSTOM_VAR=value
```

**Using .env file:**

Create `.env` file:
```bash
FLASK_ENV=production
KABANAI_PORT=5001
```

Docker Compose will automatically load it.

## 🐛 Troubleshooting

### Container won't start

```bash
# Check container logs
docker-compose logs kabanai

# Check container status
docker-compose ps

# Restart container
docker-compose restart kabanai
```

### Port already in use

```bash
# Check what's using port 5001
lsof -i :5001

# Kill the process or change port in docker-compose.yml
```

### Permission issues

```bash
# Fix data directory permissions
sudo chown -R $(whoami):$(whoami) data/

# Rebuild without cache
docker-compose build --no-cache
```

### Database locked error

```bash
# Stop all containers
docker-compose down

# Remove lock file
rm data/aiboard.db-shm data/aiboard.db-wal

# Restart
docker-compose up -d
```

### Container keeps restarting

```bash
# Check health status
docker inspect kabanai-app | grep -A 10 Health

# View recent logs
docker-compose logs --tail=50 kabanai

# Disable auto-restart temporarily
docker update --restart=no kabanai-app
```

## 🔍 Useful Docker Commands

### Logs and Monitoring

```bash
# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View logs for specific time
docker-compose logs --since 30m
```

### Container Management

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec kabanai bash

# View resource usage
docker stats kabanai-app

# Inspect container
docker inspect kabanai-app
```

### Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove everything (use with caution!)
docker system prune -a
```

## 🚀 Production Deployment

### Security Considerations

1. **Change default credentials** in the application
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** with reverse proxy (nginx/traefik)
4. **Limit container resources**:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

### Using with Reverse Proxy (Nginx)

**docker-compose.yml:**
```yaml
services:
  kabanai:
    # ... existing config ...
    networks:
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kabanai.rule=Host(`kabanai.yourdomain.com`)"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - kabanai
    networks:
      - web
```

### Environment-Specific Configs

**Development:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Production:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Health Checks

The container includes health checks:

```bash
# Check health status
docker inspect kabanai-app | grep -A 5 Health

# Manual health check
curl http://localhost:5001/api/projects
```

### Monitoring

**Container logs to file:**
```bash
docker-compose logs -f > kabanai.log 2>&1 &
```

**Resource monitoring:**
```bash
docker stats kabanai-app
```

## 📊 Multi-Container Setup

For advanced setups with separate services:

```yaml
version: '3.8'

services:
  kabanai-web:
    build: .
    ports:
      - "5001:5001"
    depends_on:
      - kabanai-db
    environment:
      - DATABASE_URL=postgresql://user:pass@kabanai-db:5432/kabanai

  kabanai-db:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=kabanai
      - POSTGRES_PASSWORD=your-secure-password
      - POSTGRES_DB=kabanai

volumes:
  postgres-data:
```

## 🔄 Update and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Backup Before Update

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec kabanai tar czf /app/data/backup_${DATE}.tar.gz /app/data/aiboard.db
```

### Rolling Back

```bash
# Stop current version
docker-compose down

# Restore previous database
cp data/backups/aiboard.db.backup data/aiboard.db

# Start with previous image
docker-compose up -d
```

## 📝 Docker Compose Commands Cheat Sheet

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Rebuild
docker-compose build

# View logs
docker-compose logs -f

# Execute command
docker-compose exec kabanai bash

# Scale services (not applicable for single service)
docker-compose up -d --scale kabanai=3

# Pull latest images
docker-compose pull

# Validate config
docker-compose config
```

## 🌐 Access Points

Once running, access:

- **Application**: http://localhost:5001
- **API**: http://localhost:5001/api/projects
- **Health Check**: http://localhost:5001/api/projects (returns 200 if healthy)

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify config: `docker-compose config`
3. Check volumes: `docker volume ls`
4. Review permissions: `ls -la data/`
5. Restart: `docker-compose restart`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Docker Setup**: ✅ Complete  
**Last Updated**: 2026-01-28  
**Maintained By**: Thomas

For development details, see **SESSION.md** and **CLAUDE.md**
