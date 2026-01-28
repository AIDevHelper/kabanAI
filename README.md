# 🤖 KabanAI - AI Task Automation Board

**KabanAI** is a beautiful Kanban-style project management board designed specifically for automating AI CLI workflows. Create projects, organize tasks across customizable lanes, and let AI tools execute them automatically - all through an intuitive web interface.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 🎯 What is KabanAI?

KabanAI transforms how you work with AI CLI tools. Instead of manually running commands one by one, you can:

1. **Organize AI Tasks** - Create a project and add tasks to different workflow stages
2. **Configure Once, Run Many** - Set up prompts, working directories, and execution order
3. **Execute Automatically** - Click "Run" and watch AI tools work in parallel or sequence
4. **Monitor in Real-Time** - See live status updates with color-coded visual feedback
5. **Review Results** - Click any task to view detailed output and logs

Perfect for developers who want to automate documentation generation, code reviews, testing, deployment scripts, and more using AI assistants like GitHub Copilot, Gemini, Aider, or Claude.

---

## ✨ Key Features

### 🎨 **Beautiful Interface**
- Modern, responsive web UI with dark/light mode
- Drag-free Kanban board with 5 workflow lanes
- Real-time status updates with smooth animations
- Color-coded task states (pending, running, success, error)

### 🤖 **AI CLI Integration**
Execute tasks using popular AI tools:
- **GitHub Copilot CLI** - Code generation and assistance
- **Gemini CLI** - Google's AI capabilities
- **Aider** - AI pair programming
- **Claude CLI** - Anthropic's assistant
- **ChatGPT CLI** - OpenAI integration
- **Custom Commands** - Any CLI tool you need

### ⚡ **Smart Execution**
- **Parallel Processing** - Run multiple tasks simultaneously
- **Execution Order** - Control task dependencies and sequence
- **Git Integration** - Auto-clone repositories or skip with "nogit"
- **Directory Browser** - Visual file system navigation
- **Remote Execution** - Run tasks on remote servers via SSH
- **Auto-Approve** - Non-interactive mode for full automation

### 📊 **Project Management**
- Create unlimited projects and tasks
- Organize across 5 lanes:
  - 🏗 **Architecture** - Planning and design
  - 📚 **Documentation** - Docs generation
  - 💻 **Coding** - Development tasks
  - 🧪 **Testing** - QA and validation
  - 🚀 **Deploy** - Deployment automation
- Edit, delete, and reorganize anytime
- Running state protection (prevents duplicate execution)

### 🎨 **User Experience**
- Secure login system
- Persistent dark/light theme toggle
- Quick directory paths (Documents, Desktop, Home)
- Detailed task output viewer
- Status colors: 💜 Pending → 💚 Running → 💙 Success / ❤️ Error

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/AIDevHelper/kabanAI.git
cd kabanAI
./docker-start.sh
```

Access at **http://localhost:5001**  
Login: **thomas** / **cb1312ef**

### Option 2: Python Virtual Environment

```bash
git clone https://github.com/AIDevHelper/kabanAI.git
cd kabanAI
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cd backend && python3 app.py
```

Access at **http://localhost:5001**  
Login: **thomas** / **cb1312ef**

---

## 📖 How It Works

### 1️⃣ Create a Project
Start by creating a project - for example, "Documentation Automation" or "Code Review Workflow"

### 2️⃣ Add Tasks to Lanes
Click the **+** button in any lane to add tasks:
- **Name**: What the task does (shown on the card)
- **Prompt**: The instruction for the AI
- **CLI Tool**: Select from dropdown (copilot, gemini, etc.)
- **Execution Order**: Tasks with same number run in parallel
- **Working Directory**: Where the command executes (use Browse button)
- **Git Repository**: Clone a repo or use "nogit" to skip

### 3️⃣ Set Execution Order
Organize tasks by assigning order numbers:
- Order **1** tasks run first
- Order **2** tasks run after 1 completes
- Tasks with the **same order** run in parallel

### 4️⃣ Run Your Project
Click the **"Run Project"** button and watch:
- Tasks turn 💚 green (running) with pulse animation
- AI tools execute your prompts automatically
- Status updates in real-time
- Completed tasks turn 💙 blue (success) or ❤️ red (error)

### 5️⃣ Review Results
Click any task card to see:
- Full command output
- Error messages (if any)
- Execution details
- All task configuration

---

## 🎯 Use Cases

### 📚 Documentation Generation
Create tasks to generate:
- README files
- API documentation
- User guides
- Code comments

### 🔍 Code Review Workflow
Automate:
- Code analysis
- Security checks
- Best practice reviews
- Refactoring suggestions

### 🧪 Testing Automation
Run:
- Unit test generation
- Integration tests
- Test case reviews
- Coverage reports

### 🚀 Deployment Pipeline
Execute:
- Build scripts
- Deployment commands
- Post-deploy validation
- Notification tasks

### 🏗 Architecture Planning
Generate:
- System designs
- Database schemas
- API specifications
- Architecture docs

---

## 🔧 Technology Stack

**Backend:**
- Python 3.11+ with Flask 3.0.0
- SQLite embedded database
- Multi-threading for parallel execution
- RESTful API design

**Frontend:**
- Vanilla JavaScript (no frameworks!)
- CSS Custom Properties for theming
- Local/Session Storage for state
- Real-time polling for updates

**Deployment:**
- Docker & Docker Compose ready
- Python virtual environment support
- Production & development configs
- Health checks and auto-restart

---

## 📂 Project Structure

```
kabanAI/
├── 🐳 Docker Files
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── docker-start.sh (Quick start!)
│   └── docker-stop.sh
│
├── 🔧 Backend (Python/Flask)
│   ├── app.py (API server)
│   └── requirements.txt
│
├── 🎨 Frontend
│   ├── index.html
│   └── static/
│       ├── css/styles.css (Theme support)
│       └── js/app.js (All logic)
│
├── 📚 Documentation
│   ├── README.md (This file)
│   ├── SUMMARY.md (Detailed overview)
│   ├── SESSION.md (Technical details)
│   ├── CLAUDE.md (AI dev guide)
│   ├── DOCKER.md (Docker deep dive)
│   ├── DOCKER_SUMMARY.md (Docker quick ref)
│   └── GETTING_STARTED.txt (Setup guide)
│
└── �� Scripts
    ├── start.sh (Python start)
    └── HOW_TO_START.sh
```

---

## 🎨 Screenshots & Features

### Task Status Colors
- 💜 **Purple** - Task is pending, not yet started
- 💚 **Green** - Task is currently running (pulsing animation)
- 💙 **Blue** - Task completed successfully
- ❤️ **Red** - Task failed with errors

### Theme Support
Toggle between light and dark modes - your preference is saved and persists across all screens.

### File Browser
Click the **Browse** button to navigate your file system visually and select directories - no more typing paths!

---

## 🐳 Docker Deployment

### Quick Commands

```bash
# Start production mode
./docker-start.sh

# Start development mode
./docker-start.sh dev

# Stop application
./docker-stop.sh

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build
```

### What's Included
✅ Containerized application  
✅ Data persistence via volumes  
✅ Health monitoring  
✅ Auto-restart on failure  
✅ Resource limits (production)  
✅ Dev/Prod configurations  

See **DOCKER.md** for complete documentation.

---

## 📝 Configuration

### Default Login
- **Username:** thomas
- **Password:** cb1312ef

⚠️ **Change these credentials for production use!**

### Git Repository Field
- Defaults to **"nogit"** - skips cloning
- Change to actual repo URL to enable cloning
- Fresh clone happens each execution

### Working Directory
- Use **Browse** button for visual selection
- Quick paths available:
  - 📁 Documents
  - 🤖 KabanAI
  - 🖥 Desktop
  - 🏠 Home

### Execution Order
- Sequential: 1, 2, 3, etc.
- Parallel: Multiple tasks with same number
- Example: Setup=1, Build=2, Test=2, Deploy=3

---

## 🔒 Security Notes

**Current Setup:**
- Demo authentication (frontend only)
- SQLite database (local file)
- Single user system

**For Production:**
- Implement JWT authentication
- Use environment variables for secrets
- Add HTTPS with reverse proxy
- Validate all inputs
- Implement rate limiting
- Use strong passwords
- Consider multi-user support

---

## 🐛 Troubleshooting

### Docker Issues
```bash
docker-compose logs -f kabanai    # Check logs
docker-compose restart             # Restart
docker-compose up -d --build       # Rebuild
```

### Python Issues
```bash
lsof -i :5001                      # Check port
source venv/bin/activate           # Activate venv
pip install -r backend/requirements.txt  # Reinstall
```

### UI Issues
- Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+F5** (Windows)
- Check browser console (F12)
- Clear localStorage if needed

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **README.md** | Main overview (you are here) |
| **SUMMARY.md** | Complete project summary |
| **SESSION.md** | Session details & architecture |
| **CLAUDE.md** | AI assistant continuation guide |
| **DOCKER.md** | Complete Docker documentation |
| **DOCKER_SUMMARY.md** | Docker quick reference |
| **GETTING_STARTED.txt** | Visual setup guide |

---

## 🚀 Future Enhancements

Ideas for future development:
- [ ] WebSocket for real-time updates (replace polling)
- [ ] Task dependencies visualization (DAG)
- [ ] Export/import project configurations
- [ ] Execution history and audit logs
- [ ] Multi-user support with roles
- [ ] Email/Slack notifications
- [ ] Metrics and analytics dashboard
- [ ] Kubernetes deployment
- [ ] Plugin system for custom CLI tools
- [ ] Task templates library

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - feel free to use and modify for your needs.

---

## 🙏 Credits

Built with ❤️ using:
- Flask and Python
- Vanilla JavaScript
- Docker
- SQLite
- Inter font from Google Fonts

---

## 📞 Support

**Repository:** https://github.com/AIDevHelper/kabanAI.git

For detailed setup and development information:
- **Quick Start:** See GETTING_STARTED.txt
- **Docker Guide:** See DOCKER.md
- **Development:** See CLAUDE.md
- **Technical Details:** See SESSION.md

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** January 2026  
**Platform:** Web (Cross-platform)  
**Deployment:** Docker + Python

---

🚀 **Ready to automate your AI workflows?**

```bash
git clone https://github.com/AIDevHelper/kabanAI.git
cd kabanAI
./docker-start.sh
```

Open http://localhost:5001 and start building! 🎉
