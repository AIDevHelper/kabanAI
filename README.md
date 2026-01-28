
## 🐳 Docker Deployment

### Quick Docker Start

```bash
# Option 1: Using the start script
./docker-start.sh

# Option 2: Using Docker Compose directly
docker-compose up -d
```

**Access**: http://localhost:5001  
**Login**: thomas / cb1312ef

### Docker Commands

```bash
# Start in development mode
./docker-start.sh dev

# Start in production mode
./docker-start.sh prod

# Stop the application
./docker-stop.sh

# View logs
docker-compose logs -f

# Access container shell
docker-compose exec kabanai bash
```

### Docker Files

- `Dockerfile` - Container image definition
- `docker-compose.yml` - Main compose configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.prod.yml` - Production settings
- `DOCKER.md` - Complete Docker documentation
- `docker-start.sh` - Automated start script
- `docker-stop.sh` - Stop script

See **DOCKER.md** for complete documentation.
