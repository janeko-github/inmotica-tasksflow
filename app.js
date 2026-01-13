// app.js - Frontend Logic
const API_URL = 'http://localhost:5000/api';

// Estado global
let tasks = [];
let users = [];
let currentTaskId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadTasks();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Formulario de usuario
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createUser();
    });

    // Formulario de tarea
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createTask();
    });

    // Formulario de edición de tarea
    document.getElementById('editTaskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateTask();
    });

    // Calcular tiempo total automáticamente
    ['taskMonths', 'taskDays', 'taskMinutes'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateTotalMinutes);
    });

    // Calcular tiempo total en formulario de edición
    ['editTaskMonths', 'editTaskDays', 'editTaskMinutes'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateEditTotalMinutes);
    });
}

// Funciones de navegación
function showTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remover clase active de todos los tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar contenido seleccionado
    document.getElementById(tabName).classList.add('active');
    
    // Activar tab seleccionado
    event.target.classList.add('active');
}

// Calcular tiempo total en minutos
function calculateTotalMinutes() {
    const months = parseInt(document.getElementById('taskMonths').value) || 0;
    const days = parseInt(document.getElementById('taskDays').value) || 0;
    const minutes = parseInt(document.getElementById('taskMinutes').value) || 0;
    
    // Convertir a minutos (asumiendo 30 días por mes, 24 horas por día, 60 minutos por hora)
    const totalMinutes = (months * 30 * 24 * 60) + (days * 24 * 60) + minutes;
    
    document.getElementById('taskTotalMinutes').value = totalMinutes;
}

// ==================== USUARIOS ====================

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        users = await response.json();
        
        // Actualizar todos los filtros de usuarios
        updateUserFilters();
        
        // Mostrar lista de usuarios
        displayUsers();
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        alert('Error al cargar usuarios');
    }
}

function updateUserFilters() {
    // Actualizar filtro de tareas
    updateUserFilter('filterUser');
    
    // Actualizar filtros de informes
    updateUserFilter('reportTaskUser');
    updateUserFilter('reportDateUser');
    updateUserFilter('reportPendingUser');
}

function updateUserFilter(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Todos los usuarios</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        select.appendChild(option);
    });
    
    // Restaurar valor seleccionado si existe
    if (currentValue) {
        select.value = currentValue;
    }
}

function displayUsers() {
    const container = document.getElementById('usersList');
    const emptyState = document.getElementById('usersEmpty');
    
    if (users.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="task-header">
                <div>
                    <div class="task-name">${user.name}</div>
                    ${user.email ? `<div style="font-size: 0.9rem; color: rgba(255,255,255,0.6);">${user.email}</div>` : ''}
                </div>
                <div class="actions">
                    <button class="btn btn-danger btn-small" onclick="deleteUser(${user.id})">🗑️ Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function createUser() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        
        if (response.ok) {
            document.getElementById('userForm').reset();
            await loadUsers();
            alert('Usuario creado exitosamente');
        }
    } catch (error) {
        console.error('Error creando usuario:', error);
        alert('Error al crear usuario');
    }
}

async function deleteUser(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadUsers();
            alert('Usuario eliminado');
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        alert('Error al eliminar usuario');
    }
}

// ==================== TAREAS ====================

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        tasks = await response.json();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error cargando tareas:', error);
        alert('Error al cargar tareas');
    }
}

function applyFiltersAndSort() {
    let filteredTasks = [...tasks];
    
    // Aplicar filtro de usuario
    const filterUser = document.getElementById('filterUser');
    if (filterUser && filterUser.value) {
        filteredTasks = filteredTasks.filter(task => 
            task.user_id.toString() === filterUser.value
        );
    }
    
    // Aplicar ordenamiento dentro de cada estado
    const sortBy = document.getElementById('sortBy')?.value || 'number';
    const sortOrder = document.getElementById('sortOrder')?.value || 'asc';
    
    filteredTasks = sortTasks(filteredTasks, sortBy, sortOrder);
    
    displayTasks(filteredTasks);
}

function sortTasks(tasksList, sortBy, sortOrder) {
    return tasksList.sort((a, b) => {
        let compareValue = 0;
        
        switch(sortBy) {
            case 'number':
                compareValue = a.task_number - b.task_number;
                break;
            case 'name':
                compareValue = a.name.localeCompare(b.name);
                break;
            case 'date':
                // Tareas sin fecha van al final
                if (!a.max_date && !b.max_date) return 0;
                if (!a.max_date) return 1;
                if (!b.max_date) return -1;
                compareValue = new Date(a.max_date) - new Date(b.max_date);
                break;
        }
        
        return sortOrder === 'asc' ? compareValue : -compareValue;
    });
}

function displayTasks(filteredTasks = tasks) {
    const container = document.getElementById('tasksList');
    const emptyState = document.getElementById('tasksEmpty');
    
    if (filteredTasks.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        
        // Actualizar mensaje si hay tareas pero están filtradas
        if (tasks.length > 0) {
            emptyState.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <p>No se encontraron tareas con los filtros aplicados</p>
                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">Intenta cambiar los filtros de búsqueda</p>
            `;
        } else {
            emptyState.innerHTML = `
                <div class="empty-state-icon">📭</div>
                <p>No hay tareas creadas aún</p>
                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">Haz clic en "➕ Nueva Tarea" para comenzar</p>
            `;
        }
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    
    // Agrupar tareas por estado
    const tasksByStatus = {
        'En proceso': [],
        'Pendiente': [],
        'Estancado': [],
        'Terminado': []
    };
    
    filteredTasks.forEach(task => {
        const status = task.status || 'Pendiente';
        if (tasksByStatus[status]) {
            tasksByStatus[status].push(task);
        }
    });
    
    // Función para obtener clase de badge según estado
    const getStatusBadgeClass = (status) => {
        const classes = {
            'Pendiente': 'badge-pendiente',
            'En proceso': 'badge-en-proceso',
            'Estancado': 'badge-estancado',
            'Terminado': 'badge-terminado'
        };
        return classes[status] || 'badge-pendiente';
    };
    
    // Función para obtener emoji según estado
    const getStatusEmoji = (status) => {
        const emojis = {
            'Pendiente': '⏳',
            'En proceso': '🔄',
            'Estancado': '⚠️',
            'Terminado': '✅'
        };
        return emojis[status] || '⏳';
    };
    
    // Renderizar tareas agrupadas por estado
    let html = '';
    
    ['En proceso', 'Pendiente', 'Estancado', 'Terminado'].forEach(status => {
        const statusTasks = tasksByStatus[status];
        if (statusTasks.length > 0) {
            html += `
                <div class="status-section">
                    <div class="status-section-title">
                        ${getStatusEmoji(status)} ${status}
                        <span class="status-count">${statusTasks.length}</span>
                    </div>
                    <div style="display: grid; gap: 15px;">
            `;
            
            statusTasks.forEach(task => {
                const user = users.find(u => u.id === task.user_id);
                html += `
                    <div class="task-item">
                        <div class="task-header">
                            <div style="flex: 1;">
                                <span class="task-number">#${task.task_number}</span>
                                <div class="task-name">${task.name}</div>
                                ${task.description ? `<div style="margin-top: 10px; font-size: 0.9rem; color: rgba(255,255,255,0.7);">${task.description}</div>` : ''}
                                <div class="task-meta">
                                    <span class="badge badge-status ${getStatusBadgeClass(task.status)}">${getStatusEmoji(task.status)} ${task.status}</span>
                                    ${user ? `<span class="badge badge-user">👤 ${user.name}</span>` : ''}
                                    ${task.max_time_minutes > 0 ? `<span class="badge badge-time">⏱️ ${task.max_time_minutes} min</span>` : ''}
                                    ${task.max_date ? `<span class="badge badge-date">📅 ${formatDate(task.max_date)}</span>` : ''}
                                </div>
                            </div>
                            <div class="actions">
                                <button class="btn btn-secondary btn-small" onclick="editTask(${task.id})">✏️ Editar</button>
                                <button class="btn btn-primary btn-small" onclick="openTaskDetails(${task.id})">👁️ Ver</button>
                                <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

function openCreateTaskModal() {
    // Llenar select de usuarios
    const select = document.getElementById('taskUser');
    select.innerHTML = '<option value="">Seleccionar usuario...</option>';
    users.forEach(user => {
        select.innerHTML += `<option value="${user.id}">${user.name}</option>`;
    });
    
    // Resetear formulario
    document.getElementById('taskForm').reset();
    document.getElementById('taskTotalMinutes').value = 0;
    document.getElementById('taskStatus').value = 'Pendiente';
    
    // Mostrar modal
    document.getElementById('createTaskModal').classList.add('active');
}

async function createTask() {
    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const userId = document.getElementById('taskUser').value;
    const maxTimeMinutes = parseInt(document.getElementById('taskTotalMinutes').value) || 0;
    const maxDate = document.getElementById('taskMaxDate').value;
    const status = document.getElementById('taskStatus').value;
    
    if (!userId) {
        alert('Por favor selecciona un usuario');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description,
                user_id: parseInt(userId),
                max_time_minutes: maxTimeMinutes,
                max_date: maxDate || null,
                status
            })
        });
        
        if (response.ok) {
            closeModal('createTaskModal');
            await loadTasks();
            alert('Tarea creada exitosamente');
        }
    } catch (error) {
        console.error('Error creando tarea:', error);
        alert('Error al crear tarea');
    }
}

async function deleteTask(id) {
    if (!confirm('¿Estás seguro de eliminar esta tarea y todos sus datos asociados?')) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadTasks();
            alert('Tarea eliminada');
        }
    } catch (error) {
        console.error('Error eliminando tarea:', error);
        alert('Error al eliminar tarea');
    }
}

async function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Llenar el formulario con los datos de la tarea
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskNumber').value = task.task_number;
    document.getElementById('editTaskName').value = task.name;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskUser').value = task.user_id;
    document.getElementById('editTaskStatus').value = task.status || 'Pendiente';
    
    // Calcular y llenar los campos de tiempo
    const totalMinutes = task.max_time_minutes || 0;
    const months = Math.floor(totalMinutes / (30 * 24 * 60));
    const remainingAfterMonths = totalMinutes % (30 * 24 * 60);
    const days = Math.floor(remainingAfterMonths / (24 * 60));
    const minutes = remainingAfterMonths % (24 * 60);
    
    document.getElementById('editTaskMonths').value = months;
    document.getElementById('editTaskDays').value = days;
    document.getElementById('editTaskMinutes').value = minutes;
    document.getElementById('editTaskTotalMinutes').value = totalMinutes;
    
    // Fecha máxima
    document.getElementById('editTaskMaxDate').value = task.max_date || '';
    
    // Llenar select de usuarios
    const select = document.getElementById('editTaskUser');
    select.innerHTML = '<option value="">Seleccionar usuario...</option>';
    users.forEach(user => {
        select.innerHTML += `<option value="${user.id}">${user.name}</option>`;
    });
    document.getElementById('editTaskUser').value = task.user_id;
    
    // Mostrar modal
    document.getElementById('editTaskModal').classList.add('active');
}

async function updateTask() {
    const taskId = document.getElementById('editTaskId').value;
    const name = document.getElementById('editTaskName').value;
    const description = document.getElementById('editTaskDescription').value;
    const userId = document.getElementById('editTaskUser').value;
    const maxTimeMinutes = parseInt(document.getElementById('editTaskTotalMinutes').value) || 0;
    const maxDate = document.getElementById('editTaskMaxDate').value;
    const status = document.getElementById('editTaskStatus').value;
    
    if (!userId) {
        alert('Por favor selecciona un usuario');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description,
                user_id: parseInt(userId),
                max_time_minutes: maxTimeMinutes,
                max_date: maxDate || null,
                status
            })
        });
        
        if (response.ok) {
            closeModal('editTaskModal');
            await loadTasks();
            alert('Tarea actualizada exitosamente');
        } else {
            alert('Error al actualizar tarea');
        }
    } catch (error) {
        console.error('Error actualizando tarea:', error);
        alert('Error al actualizar tarea');
    }
}

function calculateEditTotalMinutes() {
    const months = parseInt(document.getElementById('editTaskMonths').value) || 0;
    const days = parseInt(document.getElementById('editTaskDays').value) || 0;
    const minutes = parseInt(document.getElementById('editTaskMinutes').value) || 0;
    
    const totalMinutes = (months * 30 * 24 * 60) + (days * 24 * 60) + minutes;
    
    document.getElementById('editTaskTotalMinutes').value = totalMinutes;
}

// ==================== DETALLES DE TAREA ====================

async function openTaskDetails(taskId) {
    currentTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    const user = users.find(u => u.id === task.user_id);
    
    // Cargar datos adicionales
    const [annotations, timeEntries] = await Promise.all([
        fetch(`${API_URL}/tasks/${taskId}/annotations`).then(r => r.json()),
        fetch(`${API_URL}/tasks/${taskId}/times`).then(r => r.json())
    ]);
    
    const modalTitle = document.getElementById('modalTaskTitle');
    modalTitle.textContent = `Tarea #${task.task_number}: ${task.name}`;
    
    const content = document.getElementById('modalTaskContent');
    content.innerHTML = `
        <div style="margin-bottom: 30px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div>
                    <strong>Asignado a:</strong><br>
                    <span class="badge badge-user">${user ? user.name : 'Sin asignar'}</span>
                </div>
                ${task.max_time_minutes > 0 ? `
                <div>
                    <strong>Tiempo máximo:</strong><br>
                    <span class="badge badge-time">${task.max_time_minutes} minutos</span>
                </div>` : ''}
                ${task.max_date ? `
                <div>
                    <strong>Fecha límite:</strong><br>
                    <span class="badge badge-date">${formatDate(task.max_date)}</span>
                </div>` : ''}
            </div>
            ${task.description ? `
                <div style="background: rgba(26, 27, 38, 0.6); padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <strong>Descripción:</strong><br>
                    ${task.description}
                </div>
            ` : ''}
        </div>

        <!-- REGISTROS DE TIEMPO -->
        <div style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: var(--accent-light); font-size: 1.2rem; margin: 0;">⏱️ Registros de Tiempo</h3>
                <button class="btn btn-success btn-small" id="toggleTimeFormBtn" onclick="toggleTimeForm()">
                    ➕ Nuevo Registro
                </button>
            </div>
            
            <div id="timeFormContainer" style="display: none; background: rgba(26, 27, 38, 0.6); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div>
                        <label>Fecha/Hora Inicio</label>
                        <input type="datetime-local" id="timeStart" value="${getCurrentDateTime()}">
                    </div>
                    <div>
                        <label>Fecha/Hora Fin (opcional)</label>
                        <input type="datetime-local" id="timeEnd">
                    </div>
                    <div>
                        <label>💬 Comentario (opcional)</label>
                        <input type="text" id="timeComment" placeholder="Ej: Frontend login, Bug #123..." maxlength="200" style="width: 100%;">
                        <small style="display: block; margin-top: 5px; color: rgba(255,255,255,0.6); font-size: 0.85rem;">
                            Indica brevemente en qué parte de la tarea trabajaste
                        </small>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-success" onclick="addTimeEntry()">💾 Guardar Registro</button>
                    <button class="btn btn-secondary" onclick="toggleTimeForm()">✖ Cancelar</button>
                </div>
            </div>

            <div id="timeEntriesList">
                ${timeEntries.length === 0 ? '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No hay registros de tiempo</p>' : ''}
                ${timeEntries.map(entry => {
                    const escapedComment = (entry.comment || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    return `
                    <div class="time-entry" id="time-entry-${entry.id}">
                        <div class="time-info">
                            <div>
                                <strong>Inicio:</strong><br>
                                <span id="start-display-${entry.id}">${formatDateTime(entry.start_time)}</span>
                                <input type="datetime-local" id="start-edit-${entry.id}" value="${entry.start_time}" style="display: none;">
                            </div>
                            ${entry.end_time ? `
                                <div>
                                    <strong>Fin:</strong><br>
                                    <span id="end-display-${entry.id}">${formatDateTime(entry.end_time)}</span>
                                    <input type="datetime-local" id="end-edit-${entry.id}" value="${entry.end_time}" style="display: none;">
                                </div>
                                <div>
                                    <strong>Duración:</strong><br>
                                    <span class="badge badge-time" id="duration-${entry.id}">${entry.duration_minutes} min</span>
                                </div>
                            ` : `
                                <div>
                                    <span class="badge badge-warning" style="background: var(--warning); color: var(--text-dark);">En progreso</span>
                                    <input type="datetime-local" id="end-edit-${entry.id}" style="display: none;">
                                </div>
                            `}
                        </div>
                        ${entry.comment ? `
                            <div class="time-comment" id="comment-display-${entry.id}">
                                <strong>💬</strong> ${entry.comment}
                            </div>
                        ` : `
                            <div id="comment-display-${entry.id}" style="display: none;"></div>
                        `}
                        <input type="text" id="comment-edit-${entry.id}" value="${escapedComment}" 
                               placeholder="Comentario (opcional)" maxlength="200" 
                               style="display: none; width: 100%; margin: 10px 0; padding: 8px; background: rgba(26, 27, 38, 0.6); border: 2px solid var(--secondary); border-radius: 8px; color: var(--text-light);">
                        <div class="actions">
                            <button class="btn btn-secondary btn-small" id="edit-btn-${entry.id}" onclick="editTimeEntry(${entry.id}, '${entry.start_time}', '${entry.end_time || ''}', '${escapedComment}')">✏️ Editar</button>
                            <button class="btn btn-success btn-small" id="save-btn-${entry.id}" onclick="saveTimeEntry(${entry.id})" style="display: none;">💾 Guardar</button>
                            <button class="btn btn-secondary btn-small" id="cancel-btn-${entry.id}" onclick="cancelEditTimeEntry(${entry.id}, '${entry.start_time}', '${entry.end_time || ''}', '${escapedComment}')" style="display: none;">✖ Cancelar</button>
                            <button class="btn btn-danger btn-small" id="delete-btn-${entry.id}" onclick="deleteTimeEntry(${entry.id})">🗑️</button>
                        </div>
                    </div>
                `}).join('')}
            </div>
        </div>

        <!-- ANOTACIONES -->
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: var(--accent-light); font-size: 1.2rem; margin: 0;">📝 Anotaciones</h3>
                <button class="btn btn-success btn-small" id="toggleAnnotationFormBtn" onclick="toggleAnnotationForm()">
                    ➕ Nueva Anotación
                </button>
            </div>
            
            <div id="annotationFormContainer" style="display: none; background: rgba(26, 27, 38, 0.6); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <textarea id="newAnnotation" placeholder="Escribe una anotación..." style="width: 100%; margin-bottom: 10px; min-height: 100px;"></textarea>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="addAnnotation()">💾 Guardar Anotación</button>
                    <button class="btn btn-secondary" onclick="toggleAnnotationForm()">✖ Cancelar</button>
                </div>
            </div>

            <div id="annotationsList">
                ${annotations.length === 0 ? '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No hay anotaciones</p>' : ''}
                ${annotations.map(annotation => `
                    <div class="annotation-item" id="annotation-${annotation.id}">
                        <div class="annotation-text" id="annotation-text-${annotation.id}">${annotation.text}</div>
                        <textarea id="annotation-edit-${annotation.id}" style="width: 100%; display: none; margin-bottom: 10px;">${annotation.text}</textarea>
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <div class="annotation-date">${formatDateTime(annotation.created_at)}</div>
                            <div class="actions">
                                <button class="btn btn-secondary btn-small" id="edit-annotation-btn-${annotation.id}" onclick="editAnnotation(${annotation.id})">✏️ Editar</button>
                                <button class="btn btn-success btn-small" id="save-annotation-btn-${annotation.id}" onclick="saveAnnotation(${annotation.id})" style="display: none;">💾 Guardar</button>
                                <button class="btn btn-secondary btn-small" id="cancel-annotation-btn-${annotation.id}" onclick="cancelEditAnnotation(${annotation.id})" style="display: none;">✖ Cancelar</button>
                                <button class="btn btn-danger btn-small" id="delete-annotation-btn-${annotation.id}" onclick="deleteAnnotation(${annotation.id})">🗑️</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('taskModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    currentTaskId = null;
}

// ==================== FORMULARIOS COLAPSABLES ====================

function toggleTimeForm() {
    const container = document.getElementById('timeFormContainer');
    const btn = document.getElementById('toggleTimeFormBtn');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.style.display = 'none';
        // Actualizar fecha/hora al abrir
        document.getElementById('timeStart').value = getCurrentDateTime();
    } else {
        container.style.display = 'none';
        btn.style.display = 'inline-flex';
        // Limpiar campos
        document.getElementById('timeStart').value = '';
        document.getElementById('timeEnd').value = '';
        document.getElementById('timeComment').value = '';
    }
}

function toggleAnnotationForm() {
    const container = document.getElementById('annotationFormContainer');
    const btn = document.getElementById('toggleAnnotationFormBtn');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.style.display = 'none';
        // Enfocar textarea
        setTimeout(() => document.getElementById('newAnnotation').focus(), 100);
    } else {
        container.style.display = 'none';
        btn.style.display = 'inline-flex';
        // Limpiar campo
        document.getElementById('newAnnotation').value = '';
    }
}

// ==================== ANOTACIONES ====================

async function addAnnotation() {
    const text = document.getElementById('newAnnotation').value.trim();
    if (!text) {
        alert('Por favor escribe una anotación');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${currentTaskId}/annotations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            document.getElementById('newAnnotation').value = '';
            toggleAnnotationForm(); // Cerrar formulario
            await openTaskDetails(currentTaskId);
        }
    } catch (error) {
        console.error('Error agregando anotación:', error);
        alert('Error al agregar anotación');
    }
}

async function deleteAnnotation(id) {
    if (!confirm('¿Eliminar esta anotación?')) return;
    
    try {
        const response = await fetch(`${API_URL}/annotations/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await openTaskDetails(currentTaskId);
        }
    } catch (error) {
        console.error('Error eliminando anotación:', error);
        alert('Error al eliminar anotación');
    }
}

function editAnnotation(id) {
    // Ocultar texto y mostrar textarea
    document.getElementById(`annotation-text-${id}`).style.display = 'none';
    document.getElementById(`annotation-edit-${id}`).style.display = 'block';
    
    // Cambiar botones
    document.getElementById(`edit-annotation-btn-${id}`).style.display = 'none';
    document.getElementById(`save-annotation-btn-${id}`).style.display = 'inline-flex';
    document.getElementById(`cancel-annotation-btn-${id}`).style.display = 'inline-flex';
    document.getElementById(`delete-annotation-btn-${id}`).style.display = 'none';
}

function cancelEditAnnotation(id) {
    // Restaurar texto original
    const originalText = document.getElementById(`annotation-text-${id}`).textContent;
    document.getElementById(`annotation-edit-${id}`).value = originalText;
    
    // Mostrar texto y ocultar textarea
    document.getElementById(`annotation-text-${id}`).style.display = 'block';
    document.getElementById(`annotation-edit-${id}`).style.display = 'none';
    
    // Cambiar botones
    document.getElementById(`edit-annotation-btn-${id}`).style.display = 'inline-flex';
    document.getElementById(`save-annotation-btn-${id}`).style.display = 'none';
    document.getElementById(`cancel-annotation-btn-${id}`).style.display = 'none';
    document.getElementById(`delete-annotation-btn-${id}`).style.display = 'inline-flex';
}

async function saveAnnotation(id) {
    const text = document.getElementById(`annotation-edit-${id}`).value.trim();
    
    if (!text) {
        alert('La anotación no puede estar vacía');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/annotations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            await openTaskDetails(currentTaskId);
            alert('Anotación actualizada correctamente');
        } else {
            alert('Error al actualizar la anotación');
        }
    } catch (error) {
        console.error('Error actualizando anotación:', error);
        alert('Error al actualizar anotación');
    }
}

// ==================== REGISTROS DE TIEMPO ====================

async function addTimeEntry() {
    const startTime = document.getElementById('timeStart').value;
    const endTime = document.getElementById('timeEnd').value;
    const comment = document.getElementById('timeComment').value;  // NUEVO
    
    if (!startTime) {
        alert('Por favor ingresa la fecha/hora de inicio');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${currentTaskId}/times`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start_time: startTime,
                end_time: endTime || null,
                comment: comment || null  // NUEVO
            })
        });
        
        if (response.ok) {
            document.getElementById('timeStart').value = getCurrentDateTime();
            document.getElementById('timeEnd').value = '';
            document.getElementById('timeComment').value = '';  // LIMPIAR
            toggleTimeForm(); // Cerrar formulario
            await openTaskDetails(currentTaskId);
        }
    } catch (error) {
        console.error('Error agregando registro:', error);
        alert('Error al agregar registro de tiempo');
    }
}

async function deleteTimeEntry(id) {
    if (!confirm('¿Eliminar este registro de tiempo?')) return;
    
    try {
        const response = await fetch(`${API_URL}/times/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await openTaskDetails(currentTaskId);
        }
    } catch (error) {
        console.error('Error eliminando registro:', error);
        alert('Error al eliminar registro');
    }
}

// ==================== EDICIÓN DE REGISTROS DE TIEMPO ====================

function editTimeEntry(id, startTime, endTime, comment) {  // AÑADIR PARÁMETRO comment
    // Si la fecha de inicio está vacía, poner la actual
    if (!startTime) {
        document.getElementById(`start-edit-${id}`).value = getCurrentDateTime();
    }
    
    // SIEMPRE poner la fecha/hora actual en el campo de fin por defecto
    document.getElementById(`end-edit-${id}`).value = getCurrentDateTime();
    
    // NUEVO: Cargar comentario
    if (document.getElementById(`comment-edit-${id}`)) {
        document.getElementById(`comment-edit-${id}`).value = comment || '';
    }
    
    // Ocultar displays y mostrar inputs
    document.getElementById(`start-display-${id}`).style.display = 'none';
    document.getElementById(`start-edit-${id}`).style.display = 'block';
    
    if (endTime) {
        document.getElementById(`end-display-${id}`).style.display = 'none';
    }
    document.getElementById(`end-edit-${id}`).style.display = 'block';
    
    // NUEVO: Mostrar campo de comentario
    if (document.getElementById(`comment-display-${id}`)) {
        document.getElementById(`comment-display-${id}`).style.display = 'none';
    }
    if (document.getElementById(`comment-edit-${id}`)) {
        document.getElementById(`comment-edit-${id}`).style.display = 'block';
    }
    
    // Cambiar botones
    document.getElementById(`edit-btn-${id}`).style.display = 'none';
    document.getElementById(`save-btn-${id}`).style.display = 'inline-flex';
    document.getElementById(`cancel-btn-${id}`).style.display = 'inline-flex';
    document.getElementById(`delete-btn-${id}`).style.display = 'none';
}

function cancelEditTimeEntry(id, startTime, endTime, comment) {  // AÑADIR PARÁMETRO comment
    // Restaurar valores originales
    document.getElementById(`start-edit-${id}`).value = startTime;
    if (endTime) {
        document.getElementById(`end-edit-${id}`).value = endTime;
    }
    if (document.getElementById(`comment-edit-${id}`)) {
        document.getElementById(`comment-edit-${id}`).value = comment || '';
    }
    
    // Ocultar inputs y mostrar displays
    document.getElementById(`start-display-${id}`).style.display = 'inline';
    document.getElementById(`start-edit-${id}`).style.display = 'none';
    
    if (endTime) {
        document.getElementById(`end-display-${id}`).style.display = 'inline';
    }
    document.getElementById(`end-edit-${id}`).style.display = 'none';
    
    // NUEVO: Ocultar campo de comentario
    if (document.getElementById(`comment-display-${id}`)) {
        document.getElementById(`comment-display-${id}`).style.display = 'inline';
    }
    if (document.getElementById(`comment-edit-${id}`)) {
        document.getElementById(`comment-edit-${id}`).style.display = 'none';
    }
    
    // Cambiar botones
    document.getElementById(`edit-btn-${id}`).style.display = 'inline-flex';
    document.getElementById(`save-btn-${id}`).style.display = 'none';
    document.getElementById(`cancel-btn-${id}`).style.display = 'none';
    document.getElementById(`delete-btn-${id}`).style.display = 'inline-flex';
}

async function saveTimeEntry(id) {
    const startTime = document.getElementById(`start-edit-${id}`).value;
    const endTime = document.getElementById(`end-edit-${id}`).value;
    const comment = document.getElementById(`comment-edit-${id}`) ? 
                    document.getElementById(`comment-edit-${id}`).value : null;  // NUEVO
    
    if (!startTime) {
        alert('La fecha/hora de inicio es obligatoria');
        return;
    }
    
    // Validar que la fecha de fin sea posterior a la de inicio
    if (endTime && new Date(endTime) <= new Date(startTime)) {
        alert('La fecha/hora de fin debe ser posterior a la de inicio');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/times/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start_time: startTime,
                end_time: endTime || null,
                comment: comment || null  // NUEVO
            })
        });
        
        if (response.ok) {
            await openTaskDetails(currentTaskId);
            alert('Registro actualizado correctamente');
        } else {
            alert('Error al actualizar el registro');
        }
    } catch (error) {
        console.error('Error actualizando registro:', error);
        alert('Error al actualizar registro');
    }
}

// ==================== INFORMES ====================

async function generateReport(format) {
    const fromTask = document.getElementById('reportFromTask').value;
    const toTask = document.getElementById('reportToTask').value;
    const userId = document.getElementById('reportTaskUser').value;
    
    if (!fromTask || !toTask) {
        alert('Por favor ingresa el rango de tareas (desde/hasta)');
        return;
    }
    
    if (parseInt(fromTask) > parseInt(toTask)) {
        alert('El número de tarea inicial debe ser menor o igual al final');
        return;
    }
    
    const loading = document.getElementById('reportLoading');
    loading.style.display = 'block';
    
    try {
        let url = `${API_URL}/reports/${format}?from=${fromTask}&to=${toTask}`;
        if (userId) {
            url += `&user_id=${userId}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const userSuffix = userId ? `_usuario${userId}` : '';
            a.download = `informe_tareas_${fromTask}-${toTask}${userSuffix}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('Informe generado exitosamente');
        } else {
            alert('Error al generar informe');
        }
    } catch (error) {
        console.error('Error generando informe:', error);
        alert('Error al generar informe');
    } finally {
        loading.style.display = 'none';
    }
}

async function generateDateReport(format) {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    const userId = document.getElementById('reportDateUser').value;
    
    if (!fromDate || !toDate) {
        alert('Por favor ingresa el rango de fechas (desde/hasta)');
        return;
    }
    
    if (new Date(fromDate) > new Date(toDate)) {
        alert('La fecha inicial debe ser anterior o igual a la fecha final');
        return;
    }
    
    const loading = document.getElementById('dateReportLoading');
    loading.style.display = 'block';
    
    try {
        let url = `${API_URL}/reports/date/${format}?from=${fromDate}&to=${toDate}`;
        if (userId) {
            url += `&user_id=${userId}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const userSuffix = userId ? `_usuario${userId}` : '';
            a.download = `informe_fechas_${fromDate}_${toDate}${userSuffix}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('Informe por fechas generado exitosamente');
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al generar informe');
        }
    } catch (error) {
        console.error('Error generando informe por fechas:', error);
        alert('Error al generar informe por fechas');
    } finally {
        loading.style.display = 'none';
    }
}

async function generatePendingReport(format) {
    const userId = document.getElementById('reportPendingUser').value;
    
    const loading = document.getElementById('pendingReportLoading');
    loading.style.display = 'block';
    
    try {
        let url = `${API_URL}/reports/pending/${format}`;
        if (userId) {
            url += `?user_id=${userId}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '');
            const userSuffix = userId ? `_usuario${userId}` : '';
            a.download = `informe_tareas_pendientes_${timestamp}${userSuffix}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('Informe de tareas pendientes generado exitosamente');
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al generar informe');
        }
    } catch (error) {
        console.error('Error generando informe de pendientes:', error);
        alert('Error al generar informe de pendientes');
    } finally {
        loading.style.display = 'none';
    }
}

// ==================== UTILIDADES ====================

function getCurrentDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        currentTaskId = null;
    }
}
