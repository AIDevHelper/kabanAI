from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import json
import subprocess
import threading
import os
import shutil
from datetime import datetime
import uuid
from pathlib import Path

# Use absolute paths
BASE_DIR = Path(__file__).parent.parent.resolve()
DB_PATH = str(BASE_DIR / 'data' / 'aiboard.db')
WORKDIR_BASE = str(BASE_DIR / 'data' / 'workdirs')

app = Flask(__name__, static_folder=str(BASE_DIR / 'frontend'))
CORS(app)

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    os.makedirs(WORKDIR_BASE, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        name TEXT NOT NULL,
        prompt TEXT NOT NULL,
        lane TEXT NOT NULL,
        cli_tool TEXT NOT NULL,
        is_remote INTEGER DEFAULT 0,
        remote_host TEXT,
        working_directory TEXT,
        git_repo TEXT,
        execution_order INTEGER DEFAULT 1,
        status TEXT DEFAULT 'pending',
        output TEXT,
        error TEXT,
        created_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )''')
    
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Projects
@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = get_db()
    projects = conn.execute('SELECT * FROM projects ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(p) for p in projects])

@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.json
    project_id = str(uuid.uuid4())
    
    conn = get_db()
    conn.execute(
        'INSERT INTO projects (id, name, description, created_at) VALUES (?, ?, ?, ?)',
        (project_id, data['name'], data.get('description', ''), datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    return jsonify({'id': project_id, 'name': data['name']})

@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    conn = get_db()
    project = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    tasks = conn.execute('SELECT * FROM tasks WHERE project_id = ? ORDER BY execution_order, created_at', (project_id,)).fetchall()
    conn.close()
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    return jsonify({
        'project': dict(project),
        'tasks': [dict(t) for t in tasks]
    })

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db()
    conn.execute('DELETE FROM tasks WHERE project_id = ?', (project_id,))
    conn.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()
    
    # Clean up workdir
    workdir = os.path.join(WORKDIR_BASE, project_id)
    if os.path.exists(workdir):
        shutil.rmtree(workdir)
    
    return jsonify({'success': True})

# Tasks
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    task_id = str(uuid.uuid4())
    
    conn = get_db()
    conn.execute(
        '''INSERT INTO tasks (id, project_id, name, prompt, lane, cli_tool, is_remote, 
           remote_host, working_directory, git_repo, execution_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (task_id, data['project_id'], data['name'], data['prompt'], data['lane'],
         data['cli_tool'], data.get('is_remote', 0), data.get('remote_host', ''),
         data.get('working_directory', ''), data.get('git_repo', ''),
         data.get('execution_order', 1), datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    return jsonify({'id': task_id})

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    
    conn = get_db()
    conn.execute(
        '''UPDATE tasks SET name = ?, prompt = ?, lane = ?, cli_tool = ?, is_remote = ?,
           remote_host = ?, working_directory = ?, git_repo = ?, execution_order = ?
           WHERE id = ?''',
        (data['name'], data['prompt'], data['lane'], data['cli_tool'],
         data.get('is_remote', 0), data.get('remote_host', ''),
         data.get('working_directory', ''), data.get('git_repo', ''),
         data.get('execution_order', 1), task_id)
    )
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db()
    conn.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/tasks/<task_id>/status', methods=['GET'])
def get_task_status(task_id):
    conn = get_db()
    task = conn.execute('SELECT status, output, error FROM tasks WHERE id = ?', (task_id,)).fetchone()
    conn.close()
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify(dict(task))

# Execution
def execute_task(task_id, task_data):
    project_id = task_data['project_id']
    workdir = os.path.join(WORKDIR_BASE, project_id, task_id)
    
    # Clean workdir if it exists
    if os.path.exists(workdir):
        shutil.rmtree(workdir)
    os.makedirs(workdir, exist_ok=True)
    
    original_dir = os.getcwd()
    
    try:
        conn = get_db()
        conn.execute('UPDATE tasks SET status = ?, output = ? WHERE id = ?', 
                    ('running', '', task_id))
        conn.commit()
        conn.close()
        
        output_lines = []
        
        # Change to working directory
        target_dir = workdir
        if task_data.get('working_directory'):
            target_dir = task_data['working_directory']
            if not os.path.isabs(target_dir):
                target_dir = os.path.join(workdir, target_dir)
            os.makedirs(target_dir, exist_ok=True)
        
        os.chdir(target_dir)
        
        # Clone git repo if specified (skip if "nogit" is in the repo field)
        if task_data.get('git_repo'):
            git_repo = task_data['git_repo'].strip()
            
            if git_repo.lower() == 'nogit':
                output_lines.append(f"Skipping git clone (nogit specified)")
                output_lines.append(f"Using existing directory: {target_dir}")
            else:
                output_lines.append(f"Cloning repository: {git_repo}")
                output_lines.append(f"Into directory: {target_dir}")
                result = subprocess.run(
                    ['git', 'clone', git_repo, '.'],
                    capture_output=True, text=True, timeout=300
                )
                output_lines.append(result.stdout)
                if result.stderr:
                    output_lines.append(result.stderr)
                
                if result.returncode != 0:
                    raise Exception(f"Git clone failed: {result.stderr}")
        
        # Execute CLI command
        cli_tool = task_data['cli_tool']
        prompt = task_data['prompt']
        
        # Build the command based on CLI tool
        if cli_tool in ['copilot', 'gh']:
            # GitHub Copilot CLI uses -p flag with --allow-all-tools for non-interactive mode
            cmd = f"{cli_tool} --allow-all-tools -p \"{prompt}\""
        elif cli_tool == 'gemini':
            # Gemini CLI format (adjust based on actual CLI)
            cmd = f"{cli_tool} \"{prompt}\""
        elif cli_tool == 'aider':
            # Aider uses --yes flag for auto-approve
            cmd = f"{cli_tool} --yes --message \"{prompt}\""
        else:
            # Default format for custom CLIs
            cmd = f"{cli_tool} \"{prompt}\""
        
        output_lines.append(f"\nExecuting command:")
        output_lines.append(f"{cmd}")
        output_lines.append("-" * 50)
        
        if task_data.get('is_remote') and task_data.get('remote_host'):
            # Remote execution via SSH
            ssh_cmd = f"ssh {task_data['remote_host']} 'cd {target_dir} && {cmd}'"
            result = subprocess.run(
                ssh_cmd, shell=True, capture_output=True, text=True, timeout=600
            )
        else:
            # Local execution with shell
            result = subprocess.run(
                cmd,
                shell=True, capture_output=True, text=True, timeout=600
            )
        
        output_lines.append(result.stdout)
        
        os.chdir(original_dir)
        
        if result.returncode == 0:
            conn = get_db()
            conn.execute(
                'UPDATE tasks SET status = ?, output = ?, error = ? WHERE id = ?',
                ('success', '\n'.join(output_lines), '', task_id)
            )
            conn.commit()
            conn.close()
        else:
            error_msg = result.stderr or 'Command failed'
            output_lines.append(f"\nERROR: {error_msg}")
            conn = get_db()
            conn.execute(
                'UPDATE tasks SET status = ?, output = ?, error = ? WHERE id = ?',
                ('error', '\n'.join(output_lines), error_msg, task_id)
            )
            conn.commit()
            conn.close()
            
    except Exception as e:
        os.chdir(original_dir)
        error_msg = str(e)
        conn = get_db()
        conn.execute(
            'UPDATE tasks SET status = ?, output = ?, error = ? WHERE id = ?',
            ('error', '\n'.join(output_lines) if output_lines else '', error_msg, task_id)
        )
        conn.commit()
        conn.close()

@app.route('/api/projects/<project_id>/run', methods=['POST'])
def run_project(project_id):
    conn = get_db()
    tasks = conn.execute(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY execution_order, created_at',
        (project_id,)
    ).fetchall()
    conn.close()
    
    if not tasks:
        return jsonify({'error': 'No tasks found'}), 404
    
    # Reset all tasks to pending
    conn = get_db()
    for task in tasks:
        conn.execute('UPDATE tasks SET status = ?, output = ?, error = ? WHERE id = ?',
                    ('pending', '', '', task['id']))
    conn.commit()
    conn.close()
    
    # Group tasks by execution order
    execution_groups = {}
    for task in tasks:
        order = task['execution_order']
        if order not in execution_groups:
            execution_groups[order] = []
        execution_groups[order].append(task)
    
    # Execute tasks in order
    def run_all():
        for order in sorted(execution_groups.keys()):
            threads = []
            for task in execution_groups[order]:
                thread = threading.Thread(
                    target=execute_task,
                    args=(task['id'], dict(task))
                )
                thread.start()
                threads.append(thread)
            
            # Wait for all tasks in this order to complete
            for thread in threads:
                thread.join()
    
    threading.Thread(target=run_all, daemon=True).start()
    
    return jsonify({'success': True, 'message': 'Execution started'})

@app.route('/api/browse-directory', methods=['POST'])
def browse_directory():
    """List directories for browsing"""
    data = request.json
    current_path = data.get('path', os.path.expanduser('~'))
    
    try:
        # Expand user path
        current_path = os.path.expanduser(current_path)
        
        # Get absolute path
        if not os.path.isabs(current_path):
            current_path = os.path.abspath(current_path)
        
        # Check if path exists
        if not os.path.exists(current_path):
            return jsonify({'error': 'Path does not exist'}), 400
        
        # If it's a file, get its directory
        if os.path.isfile(current_path):
            current_path = os.path.dirname(current_path)
        
        # Get parent directory
        parent = os.path.dirname(current_path) if current_path != '/' else None
        
        # List directories and files
        items = []
        try:
            for item in sorted(os.listdir(current_path)):
                item_path = os.path.join(current_path, item)
                try:
                    is_dir = os.path.isdir(item_path)
                    # Skip hidden files (starting with .)
                    if not item.startswith('.'):
                        items.append({
                            'name': item,
                            'path': item_path,
                            'is_dir': is_dir
                        })
                except PermissionError:
                    continue
        except PermissionError:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Sort: directories first, then files
        items.sort(key=lambda x: (not x['is_dir'], x['name'].lower()))
        
        return jsonify({
            'current_path': current_path,
            'parent': parent,
            'items': items
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return send_from_directory(str(BASE_DIR / 'frontend'), 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(str(BASE_DIR / 'frontend'), path)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001, host='0.0.0.0')
