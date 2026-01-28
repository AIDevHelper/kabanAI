# KabanAI Development - Claude Continuation Guide

## Quick Context

This is an AI-powered task board application built with Flask + vanilla JavaScript that executes AI CLI commands through a Kanban interface.

## System Architecture

```
┌─────────────┐     HTTP/REST    ┌──────────────┐
│   Browser   │ ◄──────────────► │ Flask Server │
│  (Frontend) │                  │  (Backend)   │
└─────────────┘                  └──────────────┘
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │   SQLite DB  │
                                 │   + Files    │
                                 └──────────────┘
```

## Tech Stack

**Backend:**
- Flask 3.0.0 (Python REST API)
- SQLite (embedded database)
- Threading for parallel task execution

**Frontend:**
- Vanilla JavaScript (no framework)
- CSS Custom Properties for theming
- Local/Session Storage for state

## Core Concepts

### 1. Projects
- Container for related tasks
- Has name, description, created_at
- Can be running (has active tasks) or idle

### 2. Tasks
- Belong to a project and lane
- Have execution_order (same number = parallel)
- Execute AI CLI commands (copilot, gemini, etc.)
- Status: pending → running → success/error

### 3. Execution Flow
```
User clicks "Run" → Group by order → Execute groups sequentially
                                   → Tasks in group run in parallel
                                   → Update status in real-time
```

### 4. Theme System
- Light/Dark mode toggle
- Saved to localStorage
- CSS custom properties for colors
- Applied to <html data-theme="light|dark">

## Key Files to Know

### `/backend/app.py`
- Flask routes and API endpoints
- Task execution logic in `execute_task()`
- Database operations with SQLite
- **Important**: Uses absolute paths (BASE_DIR)

### `/frontend/index.html`
- Three main views: login, projects, board
- Modals for create/edit operations
- Theme toggle in nav bar

### `/frontend/static/js/app.js`
- All frontend logic
- Key functions:
  - `initTheme()` - Load saved theme
  - `toggleTheme()` - Switch light/dark
  - `runProject()` - Execute tasks
  - `startStatusPolling()` - Real-time updates

### `/frontend/static/css/styles.css`
- Theme variables in :root and [data-theme="dark"]
- Component-based organization
- Animations and transitions

## Common Tasks

### Adding a New Feature

1. **Backend API** (`app.py`):
   ```python
   @app.route('/api/your-endpoint', methods=['POST'])
   def your_function():
       data = request.json
       # ... logic
       return jsonify(result)
   ```

2. **Frontend Function** (`app.js`):
   ```javascript
   async function yourFunction() {
       const response = await fetch(`${API_BASE}/your-endpoint`);
       const data = await response.json();
       // ... update UI
   }
   ```

3. **UI Component** (`index.html` + `styles.css`):
   - Add HTML structure
   - Style with theme-aware CSS variables

### Debugging

**Backend Issues:**
```bash
# Check logs in terminal where server runs
# Look for Python errors and stack traces
```

**Frontend Issues:**
```javascript
// Browser console (F12)
console.log('Debug:', variable);
```

**Database Issues:**
```bash
sqlite3 data/aiboard.db
# .schema - view tables
# SELECT * FROM tasks; - query data
```

## Important Patterns

### 1. Theme-Aware Styling
```css
/* Always use variables, never hardcode colors */
color: var(--text-primary);  /* ✅ Good */
color: #111827;              /* ❌ Bad */
```

### 2. API Calls
```javascript
// Always use API_BASE constant
const response = await fetch(`${API_BASE}/endpoint`);
```

### 3. Modal Management
```javascript
// Show modal
document.getElementById('modal-id').classList.add('active');

// Hide modal
closeModal('modal-id');
```

### 4. Database Connections
```python
# Always close connections
conn = get_db()
try:
    # ... operations
finally:
    conn.close()
```

## Current State

✅ **Working:**
- Login system (thomas / cb1312ef)
- Project CRUD
- Task CRUD with all fields
- Task execution with parallel support
- Git cloning (with "nogit" option)
- Dark/Light mode toggle
- Directory browser with quick paths
- Running state prevention
- Real-time status updates

⚠️ **Known Limitations:**
- No WebSocket (uses polling)
- Single user system
- Frontend authentication (not secure)
- No task dependencies
- No execution history

## Quick Commands

```bash
# Start server
cd ai-board && source venv/bin/activate && cd backend && python3 app.py

# Install dependencies
pip3 install -r backend/requirements.txt

# Reset database
rm data/aiboard.db
# Restart server (auto-creates tables)

# Check running processes
ps aux | grep python3

# Kill server
pkill -f "python3 app.py"
```

## If Something Breaks

### Server won't start
1. Check port 5001 is free: `lsof -i :5001`
2. Activate venv: `source venv/bin/activate`
3. Check Python version: `python3 --version` (need 3.7+)

### Tasks won't execute
1. Check CLI tool is installed: `which copilot`
2. Verify working directory exists
3. Check task status in database
4. Look at server logs for errors

### UI not updating
1. Check browser console for errors
2. Verify API_BASE is correct (localhost:5001)
3. Check if polling is running
4. Hard refresh browser (Cmd+Shift+R)

### Theme not persisting
1. Check localStorage in browser DevTools
2. Verify `initTheme()` is called on load
3. Check `toggleTheme()` saves to localStorage

## Extension Points

Want to add:
- **New CLI tool**: Update task form dropdown and execute_task() command building
- **New lane**: Add to HTML board, update CSS if needed
- **New field**: Add to database schema, update forms, API
- **Export feature**: Add endpoint + download button
- **Email notifications**: Integrate email service in execute_task()

## Environment

- **OS**: macOS
- **Python**: 3.14.2
- **Port**: 5001 (backend)
- **Data**: `/ai-board/data/`
- **Logs**: Terminal output (Flask debug mode)

## Resources

- Flask Docs: https://flask.palletsprojects.com/
- SQLite: https://www.sqlite.org/docs.html
- CSS Variables: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

---

**Remember**: This is a working prototype. For production:
1. Add proper authentication (JWT)
2. Use environment variables
3. Add input validation
4. Implement rate limiting
5. Use WebSockets for real-time
6. Add comprehensive error handling
7. Write tests
8. Deploy with WSGI server (not Flask dev server)

Good luck! The codebase is well-structured and easy to extend. 🚀
