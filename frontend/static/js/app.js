const API_BASE = 'http://localhost:5001/api';
let currentProject = null;
let currentTaskId = null;
let pollInterval = null;
let projectRunningState = {};

// Login credentials
const VALID_USERNAME = 'thomas';
const VALID_PASSWORD = 'cb1312ef';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    
    document.getElementById('task-is-remote').addEventListener('change', (e) => {
        document.getElementById('remote-host-group').style.display = 
            e.target.checked ? 'block' : 'none';
    });
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
    const isDark = theme === 'dark';
    const icon = isDark ? '🌙' : '☀️';
    const label = isDark ? 'Dark mode' : 'Light mode';
    
    // Update all theme icons
    const themeIconMain = document.getElementById('theme-icon');
    const themeIconLogin = document.getElementById('theme-icon-login');
    const themeLabel = document.getElementById('theme-label');
    
    if (themeIconMain) themeIconMain.textContent = icon;
    if (themeIconLogin) themeIconLogin.textContent = icon;
    if (themeLabel) themeLabel.textContent = label;
}

// Authentication
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showView('projects-view');
        const username = sessionStorage.getItem('username');
        document.getElementById('logged-user').textContent = username.charAt(0).toUpperCase() + username.slice(1);
        loadProjects();
    } else {
        showView('login-view');
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        document.getElementById('login-form').reset();
        showView('projects-view');
        document.getElementById('logged-user').textContent = username.charAt(0).toUpperCase() + username.slice(1);
        loadProjects();
    } else {
        alert('Invalid credentials! Please try again.');
    }
}

function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    stopStatusPolling();
    showView('login-view');
    document.getElementById('login-form').reset();
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// Projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        const projects = await response.json();
        
        const container = document.getElementById('projects-list');
        container.innerHTML = '';
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--gray-500);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem;">
                        <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">No projects yet</h3>
                    <p>Create your first project to get started with AI automation!</p>
                </div>
            `;
            return;
        }
        
        // Get all running states
        for (const project of projects) {
            const taskResponse = await fetch(`${API_BASE}/projects/${project.id}`);
            const data = await taskResponse.json();
            const hasRunningTasks = data.tasks.some(t => t.status === 'running');
            projectRunningState[project.id] = hasRunningTasks;
        }
        
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.onclick = () => openProject(project.id);
            
            const isRunning = projectRunningState[project.id];
            const statusBadge = isRunning 
                ? '<span class="project-status running"><span class="status-dot"></span>Running</span>'
                : '<span class="project-status idle"><span class="status-dot"></span>Idle</span>';
            
            card.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description || 'No description provided'}</p>
                <div class="project-meta">
                    <span>📅 ${new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    ${statusBadge}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Failed to load projects');
    }
}

function showCreateProjectModal() {
    document.getElementById('project-form').reset();
    document.getElementById('project-modal').classList.add('active');
}

async function createProject(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('project-name-input').value,
        description: document.getElementById('project-description-input').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        closeModal('project-modal');
        loadProjects();
    } catch (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project');
    }
}

async function openProject(projectId) {
    currentProject = projectId;
    
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`);
        const data = await response.json();
        
        document.getElementById('project-name').textContent = data.project.name;
        
        // Clear all lanes
        ['Architecture', 'Documentation', 'Coding', 'Testing', 'Deploy'].forEach(lane => {
            document.getElementById(`lane-${lane}`).innerHTML = '';
        });
        
        // Populate tasks
        data.tasks.forEach(task => {
            addTaskToBoard(task);
        });
        
        // Switch views
        document.getElementById('projects-view').classList.remove('active');
        document.getElementById('board-view').classList.add('active');
        
        // Start polling for status updates
        startStatusPolling();
        
    } catch (error) {
        console.error('Error opening project:', error);
        alert('Failed to open project');
    }
}

function backToProjects() {
    stopStatusPolling();
    document.getElementById('board-view').classList.remove('active');
    document.getElementById('projects-view').classList.add('active');
    loadProjects();
}

async function deleteProject() {
    if (!confirm('Are you sure you want to delete this project and all its tasks?')) {
        return;
    }
    
    try {
        await fetch(`${API_BASE}/projects/${currentProject}`, {
            method: 'DELETE'
        });
        backToProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
    }
}

// Tasks
function showCreateTaskModal(lane) {
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-lane').value = lane;
    document.getElementById('task-modal-title').textContent = `Create Task - ${lane}`;
    document.getElementById('remote-host-group').style.display = 'none';
    
    // Set default values
    document.getElementById('task-git-repo').value = 'nogit';
    document.getElementById('task-working-dir').value = '';
    
    document.getElementById('task-modal').classList.add('active');
}

async function saveTask(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const data = {
        project_id: currentProject,
        name: document.getElementById('task-name').value,
        prompt: document.getElementById('task-prompt').value,
        lane: document.getElementById('task-lane').value,
        cli_tool: document.getElementById('task-cli-tool').value,
        is_remote: document.getElementById('task-is-remote').checked ? 1 : 0,
        remote_host: document.getElementById('task-remote-host').value,
        working_directory: document.getElementById('task-working-dir').value,
        git_repo: document.getElementById('task-git-repo').value,
        execution_order: parseInt(document.getElementById('task-execution-order').value)
    };
    
    try {
        if (taskId) {
            // Update existing task
            await fetch(`${API_BASE}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new task
            await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        closeModal('task-modal');
        openProject(currentProject);
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Failed to save task');
    }
}

function addTaskToBoard(task) {
    const container = document.getElementById(`lane-${task.lane}`);
    
    const taskBox = document.createElement('div');
    taskBox.className = `task-box ${task.status}`;
    taskBox.dataset.taskId = task.id;
    taskBox.onclick = () => showTaskDetails(task.id);
    
    taskBox.innerHTML = `
        <h4>${task.name}</h4>
        <div class="task-meta">
            <span class="task-badge">Order: ${task.execution_order}</span>
            <span class="task-badge">${task.cli_tool}</span>
            ${task.is_remote ? '<span class="task-badge">Remote</span>' : ''}
        </div>
    `;
    
    container.appendChild(taskBox);
}

async function showTaskDetails(taskId) {
    currentTaskId = taskId;
    
    try {
        const [projectResponse, statusResponse] = await Promise.all([
            fetch(`${API_BASE}/projects/${currentProject}`),
            fetch(`${API_BASE}/tasks/${taskId}/status`)
        ]);
        
        const projectData = await projectResponse.json();
        const statusData = await statusResponse.json();
        
        const task = projectData.tasks.find(t => t.id === taskId);
        
        document.getElementById('task-details-name').textContent = task.name;
        document.getElementById('task-details-status').textContent = task.status.toUpperCase();
        document.getElementById('task-details-status').style.color = getStatusColor(task.status);
        document.getElementById('task-details-lane').textContent = task.lane;
        document.getElementById('task-details-order').textContent = task.execution_order;
        document.getElementById('task-details-cli').textContent = task.cli_tool;
        document.getElementById('task-details-prompt').textContent = task.prompt;
        document.getElementById('task-details-workdir').textContent = task.working_directory || 'Default';
        document.getElementById('task-details-git').textContent = task.git_repo || 'None';
        document.getElementById('task-details-output').textContent = statusData.output || 'No output yet';
        
        if (statusData.error) {
            document.getElementById('error-section').style.display = 'block';
            document.getElementById('task-details-error').textContent = statusData.error;
        } else {
            document.getElementById('error-section').style.display = 'none';
        }
        
        document.getElementById('task-details-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading task details:', error);
        alert('Failed to load task details');
    }
}

function editTaskFromDetails() {
    closeModal('task-details-modal');
    
    fetch(`${API_BASE}/projects/${currentProject}`)
        .then(res => res.json())
        .then(data => {
            const task = data.tasks.find(t => t.id === currentTaskId);
            
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-lane').value = task.lane;
            document.getElementById('task-name').value = task.name;
            document.getElementById('task-prompt').value = task.prompt;
            document.getElementById('task-cli-tool').value = task.cli_tool;
            document.getElementById('task-is-remote').checked = task.is_remote === 1;
            document.getElementById('task-remote-host').value = task.remote_host || '';
            document.getElementById('task-working-dir').value = task.working_directory || '';
            document.getElementById('task-git-repo').value = task.git_repo || '';
            document.getElementById('task-execution-order').value = task.execution_order;
            
            document.getElementById('remote-host-group').style.display = 
                task.is_remote === 1 ? 'block' : 'none';
            
            document.getElementById('task-modal-title').textContent = 'Edit Task';
            document.getElementById('task-modal').classList.add('active');
        });
}

async function deleteTaskFromDetails() {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await fetch(`${API_BASE}/tasks/${currentTaskId}`, {
            method: 'DELETE'
        });
        closeModal('task-details-modal');
        openProject(currentProject);
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

// Execution
async function runProject() {
    if (!confirm('Start executing all tasks in order?')) {
        return;
    }
    
    // Check if project is already running
    if (projectRunningState[currentProject]) {
        alert('Project is already running! Please wait for it to complete.');
        return;
    }
    
    try {
        await fetch(`${API_BASE}/projects/${currentProject}/run`, {
            method: 'POST'
        });
        
        // Disable run button
        const runBtn = document.getElementById('run-project-btn');
        runBtn.disabled = true;
        runBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="spinning">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25"/>
                <path d="M10 2a8 8 0 018 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
            Running...
        `;
        
        projectRunningState[currentProject] = true;
        
        alert('Execution started! Tasks will run in order.');
    } catch (error) {
        console.error('Error running project:', error);
        alert('Failed to start execution');
    }
}

function startStatusPolling() {
    stopStatusPolling();
    
    pollInterval = setInterval(async () => {
        if (!currentProject) return;
        
        try {
            const response = await fetch(`${API_BASE}/projects/${currentProject}`);
            const data = await response.json();
            
            let hasRunningTasks = false;
            data.tasks.forEach(task => {
                const taskBox = document.querySelector(`[data-task-id="${task.id}"]`);
                if (taskBox) {
                    taskBox.className = `task-box ${task.status}`;
                }
                if (task.status === 'running') {
                    hasRunningTasks = true;
                }
            });
            
            // Update running state
            projectRunningState[currentProject] = hasRunningTasks;
            
            // Re-enable run button if no tasks are running
            const runBtn = document.getElementById('run-project-btn');
            if (!hasRunningTasks && runBtn.disabled) {
                runBtn.disabled = false;
                runBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6 4L15 10L6 16V4Z" fill="currentColor"/>
                    </svg>
                    Run Project
                `;
            }
        } catch (error) {
            console.error('Error polling status:', error);
        }
    }, 2000);
}

function stopStatusPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Utilities
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function browseDirectory() {
    // Get current value or use home directory as default
    const currentPath = document.getElementById('task-working-dir').value || 
                       '/Users/admin';
    
    // Create file browser modal
    showFileBrowser(currentPath);
}

async function showFileBrowser(initialPath) {
    let currentPath = initialPath;
    
    async function loadDirectory(path) {
        try {
            const response = await fetch(`${API_BASE}/browse-directory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path })
            });
            
            if (!response.ok) {
                const error = await response.json();
                alert('Error: ' + (error.error || 'Failed to load directory'));
                return;
            }
            
            const data = await response.json();
            currentPath = data.current_path;
            
            renderFileBrowser(data);
        } catch (error) {
            console.error('Error loading directory:', error);
            alert('Failed to load directory');
        }
    }
    
    function renderFileBrowser(data) {
        const existingModal = document.getElementById('file-browser-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'file-browser-modal';
        
        const itemsHtml = data.items.map(item => {
            const icon = item.is_dir ? '📁' : '📄';
            const itemClass = item.is_dir ? 'browser-dir' : 'browser-file';
            const clickAction = item.is_dir 
                ? `onclick="window.loadDirectoryFromBrowser('${item.path.replace(/'/g, "\\'").replace(/\\/g, '\\\\')}')"` 
                : '';
            
            return `
                <div class="browser-item ${itemClass}" ${clickAction}>
                    <span class="browser-icon">${icon}</span>
                    <span class="browser-name">${item.name}</span>
                </div>
            `;
        }).join('');
        
        const parentPath = data.parent ? data.parent.replace(/'/g, "\\'").replace(/\\/g, '\\\\') : '';
        const homePath = '/Users/admin';
        
        modal.innerHTML = `
            <div class="modal-overlay" onclick="window.closeFileBrowser()"></div>
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>📂 Select Directory</h2>
                    <button class="modal-close" onclick="window.closeFileBrowser()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                
                <div class="browser-toolbar">
                    ${data.parent ? `
                        <button class="btn btn-secondary btn-sm" onclick="window.loadDirectoryFromBrowser('${parentPath}')">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Up
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="window.loadDirectoryFromBrowser('${homePath}')">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 6L8 2L14 6V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V6Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        </svg>
                        Home
                    </button>
                </div>
                
                <div class="browser-path">
                    <strong>Current Path:</strong>
                    <code>${currentPath}</code>
                </div>
                
                <div class="browser-list">
                    ${itemsHtml || '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No items to display</p>'}
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="window.closeFileBrowser()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.selectCurrentDirectory('${currentPath.replace(/'/g, "\\'").replace(/\\/g, '\\\\')}')">
                        Select This Directory
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Expose functions to window for onclick handlers
    window.loadDirectoryFromBrowser = loadDirectory;
    
    // Initial load
    await loadDirectory(currentPath);
}

function selectCurrentDirectory(path) {
    document.getElementById('task-working-dir').value = path;
    closeFileBrowser();
}

function closeFileBrowser() {
    const modal = document.getElementById('file-browser-modal');
    if (modal) {
        modal.remove();
    }
    // Clean up window functions
    delete window.loadDirectoryFromBrowser;
    delete window.closeFileBrowser;
    delete window.selectCurrentDirectory;
}

// Expose functions to window
window.closeFileBrowser = closeFileBrowser;
window.selectCurrentDirectory = selectCurrentDirectory;

function getStatusColor(status) {
    const colors = {
        pending: '#a78bfa',
        running: '#10b981',
        success: '#3b82f6',
        error: '#ef4444'
    };
    return colors[status] || '#666';
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
