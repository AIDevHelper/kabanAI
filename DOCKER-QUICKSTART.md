# 🐳 Quick Docker Reference for KabanAI

## Fastest Way to Start

```bash
cd /Users/admin/Documents/Thomas-SRC/KabanAI/ai-board
./docker-start.sh
```

Open: http://localhost:5001  
Login: thomas / cb1312ef

## Common Commands

| Action | Command |
|--------|---------|
| Start (prod) | `./docker-start.sh` or `docker-compose up -d` |
| Start (dev) | `./docker-start.sh dev` |
| Stop | `./docker-stop.sh` or `docker-compose down` |
| Restart | `docker-compose restart` |
| Logs | `docker-compose logs -f` |
| Shell | `docker-compose exec kabanai bash` |
| Rebuild | `docker-compose up -d --build` |
| Status | `docker-compose ps` |

## Files

- `Dockerfile` - Image definition
- `docker-compose.yml` - Main config
- `docker-compose.dev.yml` - Dev mode
- `docker-compose.prod.yml` - Prod mode  
- `DOCKER.md` - Full documentation
- `docker-start.sh` - Start script
- `docker-stop.sh` - Stop script

## Volumes

Data persists in `./data/`:
- `aiboard.db` - Database
- `workdirs/` - Task execution

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs kabanai
```

**Port in use:**
```bash
lsof -i :5001
# Kill process or edit docker-compose.yml
```

**Rebuild from scratch:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Reset everything:**
```bash
docker-compose down -v  # Warning: deletes data!
docker-compose up -d
```

For complete guide, see **DOCKER.md**
