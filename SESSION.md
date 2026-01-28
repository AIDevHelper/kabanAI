# KabanAI - AI Task Board Project

## Project Overview
A sophisticated web-based AI task board application that automates AI CLI workflows through a beautiful Kanban-style interface.

## Current Session (2026-01-28)

### What We Built Today

#### 1. **Core Application**
- Flask backend (Python) with SQLite database
- Modern web frontend with vanilla JavaScript
- RESTful API for project and task management
- Real-time task execution with status updates

#### 2. **Features Implemented**
- ✅ User authentication (thomas / cb1312ef)
- ✅ Project management (CRUD operations)
- ✅ Kanban board with 5 lanes:
  - 🏗 Architecture
  - 📚 Documentation
  - 💻 Coding
  - 🧪 Testing
  - 🚀 Deploy
- ✅ Task execution with AI CLI tools (copilot, gh, gemini, aider, etc.)
- ✅ Parallel task execution (same order number)
- ✅ Git repository integration with "nogit" option
- ✅ Remote SSH execution support
- ✅ Working directory browser with quick paths
- ✅ Dark/Light mode toggle (persisted in localStorage)
- ✅ Running state prevention (can't run project twice)
- ✅ Real-time status updates with color coding

#### 3. **Design System**
- Custom CSS with modern design
- Dark mode with full theme support
- Gradient accents and smooth animations
- Card-based UI with hover effects
- Inter font family for clean typography

### Key Files

```
ai-board/
├── backend/
│   ├── app.py (Flask API server)
│   └── requirements.txt (Flask, flask-cors)
├── frontend/
│   ├── index.html (Main HTML)
│   └── static/
│       ├── css/
│       │   └── styles.css (Theme-aware styles)
│       └── js/
│           └── app.js (Frontend logic)
├── data/
│   ├── aiboard.db (SQLite database)
│   └── workdirs/ (Task execution directories)
└── venv/ (Python virtual environment)
```

### Database Schema

**Projects Table:**
- id (TEXT PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- created_at (TEXT)

**Tasks Table:**
- id (TEXT PRIMARY KEY)
- project_id (TEXT)
- name (TEXT)
- prompt (TEXT)
- lane (TEXT)
- cli_tool (TEXT)
- is_remote (INTEGER)
- remote_host (TEXT)
- working_directory (TEXT)
- git_repo (TEXT)
- execution_order (INTEGER)
- status (TEXT: pending/running/success/error)
- output (TEXT)
- error (TEXT)
- created_at (TEXT)

### API Endpoints

```
GET    /api/projects              - List all projects
POST   /api/projects              - Create project
GET    /api/projects/:id          - Get project with tasks
DELETE /api/projects/:id          - Delete project
POST   /api/tasks                 - Create task
PUT    /api/tasks/:id             - Update task
DELETE /api/tasks/:id             - Delete task
GET    /api/tasks/:id/status      - Get task status
POST   /api/projects/:id/run      - Execute project tasks
POST   /api/browse-directory      - Directory browser helper
```

### Task Execution Flow

1. User clicks "Run Project"
2. Backend groups tasks by execution_order
3. Tasks execute in order groups (parallel within same order)
4. For each task:
   - Create isolated workdir
   - Change to working directory (or custom dir)
   - Clone git repo if specified (skip if "nogit")
   - Execute CLI command with --allow-all-tools flag
   - Capture output and errors
   - Update task status in database
5. Frontend polls every 2s for status updates
6. UI updates task cards with color-coded status

### CLI Command Formatting

- **copilot/gh**: `copilot --allow-all-tools -p "prompt"`
- **aider**: `aider --yes --message "prompt"`
- **gemini**: `gemini "prompt"`
- **custom**: `tool "prompt"`

### Theme System

The app supports light and dark modes:
- Toggle available on login screen and all authenticated pages
- Preference saved to localStorage
- CSS custom properties for dynamic theming
- Smooth transitions between modes

### Important Notes

1. **Git Repository Field**: Defaults to "nogit" to skip cloning
2. **Working Directory**: Can use Browse button for quick path selection
3. **Execution Order**: Tasks with same number run in parallel
4. **Running State**: Button disabled when project is executing
5. **Auto-Approve**: All CLI commands auto-accept prompts

### Next Steps / Future Enhancements

- [ ] Task dependencies visualization
- [ ] Export/import project configurations
- [ ] Task templates library
- [ ] Execution history and logs viewer
- [ ] WebSocket for real-time updates (replace polling)
- [ ] Multi-user support with roles
- [ ] Task scheduling/cron jobs
- [ ] Notifications (email/slack)
- [ ] Metrics and analytics dashboard
- [ ] Docker containerization
- [ ] Cloud deployment (AWS/GCP/Azure)

### Running the Application

```bash
# Navigate to project
cd /Users/admin/Documents/Thomas-SRC/KabanAI/ai-board

# Activate virtual environment
source venv/bin/activate

# Start server
cd backend
python3 app.py

# Access at: http://localhost:5001
# Login: thomas / cb1312ef
```

### Dependencies

**Backend:**
- Python 3.7+
- Flask 3.0.0
- flask-cors 4.0.0

**Frontend:**
- Vanilla JavaScript (ES6+)
- CSS Custom Properties
- Inter font (Google Fonts)

**AI CLI Tools (Optional):**
- GitHub Copilot CLI
- Gemini CLI
- Aider
- Others as needed

### Security Considerations

- Login credentials stored in frontend (for demo)
- Use environment variables for production
- Implement proper authentication (JWT, OAuth)
- Sanitize user inputs
- Validate file paths
- Limit execution permissions
- Add HTTPS in production

### Performance Optimizations

- SQLite connection pooling
- Task execution in background threads
- Frontend polling optimization
- Lazy loading for large projects
- Database indexing on frequently queried fields

---

**Project Status**: ✅ Fully Functional
**Last Updated**: 2026-01-28
**Developer**: Thomas

## 🐳 Docker Configuration

### Docker Files Created

1. **Dockerfile**
   - Multi-stage build
   - Python 3.11 slim base
   - Non-root user (kabanai)
   - Health checks included
   - Git and SSH client installed

2. **docker-compose.yml**
   - Production-ready configuration
   - Volume mounts for data persistence
   - Network isolation
   - Health checks
   - Restart policies

3. **docker-compose.dev.yml**
   - Development overrides
   - Source code mounting
   - Debug mode enabled
   - Live reload

4. **docker-compose.prod.yml**
   - Production settings
   - Resource limits (1 CPU, 512MB RAM)
   - Log rotation
   - Always restart policy

5. **docker-start.sh**
   - Automated startup script
   - Environment detection
   - Health check verification
   - Browser auto-open (macOS)

6. **docker-stop.sh**
   - Clean shutdown script

7. **.dockerignore**
   - Optimized build context
   - Excludes venv, cache, etc.

8. **DOCKER.md**
   - Complete Docker documentation
   - Troubleshooting guide
   - Production deployment tips
   - Commands reference

### Docker Architecture

```
┌─────────────────────────────────────┐
│         Docker Container            │
│  ┌──────────────────────────────┐  │
│  │   Python 3.11 Application    │  │
│  │   - Flask Server (port 5001) │  │
│  │   - SQLite Database          │  │
│  │   - Task Executors           │  │
│  └──────────────────────────────┘  │
│                                     │
│  Volumes:                           │
│  - /app/data (persistent)           │
│  - /mnt/documents (read-only)       │
│  - /mnt/desktop (read-only)         │
└─────────────────────────────────────┘
         ↓
    Port 5001 → Host
```

### Running with Docker

**Quick Start:**
```bash
./docker-start.sh
```

**Development Mode:**
```bash
./docker-start.sh dev
```

**Production Mode:**
```bash
./docker-start.sh prod
```

**Manual Docker Compose:**
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

### Docker Features

✅ **Included:**
- Automatic container builds
- Data persistence via volumes
- Health monitoring
- Resource limits (production)
- Log rotation
- Non-root user execution
- Git and SSH support
- Auto-restart on failure

✅ **Benefits:**
- Consistent environment
- Easy deployment
- Isolated execution
- Simple updates
- Portable across systems
- No Python venv needed

### Volume Mounts

**Default Mounts:**
- `./data` → `/app/data` (read-write, database & workdirs)
- `~/Documents` → `/mnt/documents` (read-only)
- `~/Desktop` → `/mnt/desktop` (read-only)

**Custom Mounts:**
Edit `docker-compose.yml`:
```yaml
volumes:
  - /your/path:/mnt/custom:ro
```

### Environment Variables

Set in `docker-compose.yml` or `.env` file:
```yaml
environment:
  - FLASK_ENV=production
  - PYTHONUNBUFFERED=1
  - CUSTOM_VAR=value
```

### Security

- Runs as non-root user (uid 1000)
- Read-only mounts for safety
- Isolated network
- No privileged mode
- Health checks for monitoring

### Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or use start script
./docker-start.sh
```

### Troubleshooting

See **DOCKER.md** for complete troubleshooting guide.

**Common Issues:**
- Port 5001 in use: Change in docker-compose.yml
- Permission errors: Check data/ ownership
- Container won't start: Check logs with `docker-compose logs`
- Database locked: Stop container, remove lock files

### Production Deployment

For production, use:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Or:
```bash
./docker-start.sh prod
```

Includes:
- Resource limits
- Log rotation
- Always restart
- Production Flask mode

