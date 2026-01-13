# CAMBIOS EN APP.JS PARA COMENTARIOS

## Agregar estas funciones/modificaciones:

### 1. Modificar createTimeEntry para incluir comentario

```javascript
async function createTimeEntry(taskId) {
    const startTime = document.getElementById('newStartTime').value;
    const endTime = document.getElementById('newEndTime').value;
    const comment = document.getElementById('newTimeComment').value;  // NUEVO
    
    if (!startTime) {
        alert('La fecha de inicio es obligatoria');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/times`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start_time: startTime,
                end_time: endTime || null,
                comment: comment || null  // INCLUIR COMENTARIO
            })
        });
        
        if (response.ok) {
            document.getElementById('newStartTime').value = '';
            document.getElementById('newEndTime').value = '';
            document.getElementById('newTimeComment').value = '';  // LIMPIAR
            await loadTimeEntries(taskId);
            alert('Registro de tiempo creado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear registro');
    }
}
```

### 2. Modificar editTimeEntry para incluir comentario

```javascript
function editTimeEntry(id, startTime, endTime, comment) {  // AÑADIR PARÁMETRO comment
    // Ocultar vista normal y mostrar edit
    document.getElementById(`time-display-${id}`).style.display = 'none';
    document.getElementById(`time-edit-${id}`).style.display = 'block';
    
    // Llenar campos
    document.getElementById(`start-edit-${id}`).value = startTime || '';
    
    // Auto-llenar end time con hora actual
    if (!endTime) {
        document.getElementById(`end-edit-${id}`).value = getCurrentDateTime();
    } else {
        document.getElementById(`end-edit-${id}`).value = endTime;
    }
    
    // NUEVO: Llenar comentario
    document.getElementById(`comment-edit-${id}`).value = comment || '';
}
```

### 3. Modificar saveTimeEntry para guardar comentario

```javascript
async function saveTimeEntry(id, taskId) {
    const startTime = document.getElementById(`start-edit-${id}`).value;
    const endTime = document.getElementById(`end-edit-${id}`).value;
    const comment = document.getElementById(`comment-edit-${id}`).value;  // NUEVO
    
    if (!startTime) {
        alert('La fecha de inicio es obligatoria');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/times/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start_time: startTime,
                end_time: endTime || null,
                comment: comment || null  // INCLUIR COMENTARIO
            })
        });
        
        if (response.ok) {
            document.getElementById(`time-display-${id}`).style.display = 'block';
            document.getElementById(`time-edit-${id}`).style.display = 'none';
            await loadTimeEntries(taskId);
            alert('Registro actualizado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar registro');
    }
}
```

### 4. Modificar displayTimeEntries para mostrar comentarios

```javascript
function displayTimeEntries(times, taskId) {
    const container = document.getElementById('timeEntriesList');
    
    if (times.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No hay registros de tiempo aún</p>';
        return;
    }
    
    let html = '';
    
    times.forEach(time => {
        const duration = time.duration_minutes ? 
            `${time.duration_minutes} minutos` : 
            '<span style="color: #FFD166;">En progreso</span>';
        
        // NUEVO: HTML para comentario si existe
        const commentHTML = time.comment ? 
            `<div class="time-comment">
                <strong>💬</strong> ${escapeHtml(time.comment)}
            </div>` : '';
        
        html += `
            <div class="time-entry-item">
                <div id="time-display-${time.id}" class="time-display">
                    <div class="time-info">
                        <div><strong>Inicio:</strong> ${formatDateTime(time.start_time)}</div>
                        <div><strong>Fin:</strong> ${time.end_time ? formatDateTime(time.end_time) : '<span style="color: #FFD166;">En progreso</span>'}</div>
                        <div><strong>Duración:</strong> ${duration}</div>
                        ${commentHTML}  <!-- MOSTRAR COMENTARIO -->
                    </div>
                    <div class="actions">
                        <button onclick="editTimeEntry(${time.id}, '${time.start_time}', '${time.end_time || ''}', '${escapeQuotes(time.comment || '')}')" 
                                class="btn btn-secondary btn-small">✏️ Editar</button>
                        <button onclick="deleteTimeEntry(${time.id}, ${taskId})" 
                                class="btn btn-danger btn-small">🗑️ Eliminar</button>
                    </div>
                </div>
                
                <div id="time-edit-${time.id}" class="time-edit" style="display: none;">
                    <div class="form-group">
                        <label>Inicio</label>
                        <input type="datetime-local" id="start-edit-${time.id}">
                    </div>
                    <div class="form-group">
                        <label>Fin</label>
                        <input type="datetime-local" id="end-edit-${time.id}">
                    </div>
                    <div class="form-group">
                        <label>💬 Comentario</label>
                        <input type="text" id="comment-edit-${time.id}" 
                               placeholder="Ej: Frontend login, Bug #123..." 
                               maxlength="200">
                    </div>
                    <div class="actions">
                        <button onclick="saveTimeEntry(${time.id}, ${taskId})" 
                                class="btn btn-success btn-small">💾 Guardar</button>
                        <button onclick="cancelEditTimeEntry(${time.id})" 
                                class="btn btn-secondary btn-small">✖ Cancelar</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función auxiliar para escapar comillas en atributos
function escapeQuotes(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
```

### 5. Modificar la sección de agregar tiempo en openTaskDetails

Buscar la parte donde se muestra el formulario de agregar tiempo y añadir el campo de comentario:

```javascript
async function openTaskDetails(taskId) {
    // ... código existente ...
    
    modalContent.innerHTML = `
        <!-- ... contenido existente ... -->
        
        <div class="detail-section">
            <h3 style="color: var(--accent-light); margin-bottom: 15px;">⏱️ Agregar Registro de Tiempo</h3>
            <div class="time-form">
                <div class="form-group">
                    <label>Fecha/Hora Inicio *</label>
                    <input type="datetime-local" id="newStartTime">
                </div>
                <div class="form-group">
                    <label>Fecha/Hora Fin</label>
                    <input type="datetime-local" id="newEndTime">
                </div>
                
                <!-- NUEVO CAMPO DE COMENTARIO -->
                <div class="form-group">
                    <label>💬 Comentario (opcional)</label>
                    <input type="text" id="newTimeComment" 
                           placeholder="Ej: Frontend login, Bug #123, Documentación..." 
                           maxlength="200">
                    <small style="display: block; margin-top: 5px; color: rgba(255,255,255,0.6); font-size: 0.85rem;">
                        Indica brevemente en qué parte de la tarea trabajaste
                    </small>
                </div>
                
                <button onclick="createTimeEntry(${taskId})" class="btn btn-success">
                    ✓ Agregar Registro
                </button>
            </div>
        </div>
        
        <!-- ... resto del contenido ... -->
    `;
    
    // ... resto del código ...
}
```

## RESUMEN DE CAMBIOS

### Funciones Nuevas:
- `escapeHtml()` - Para evitar XSS en comentarios
- `escapeQuotes()` - Para escapar comillas en atributos HTML

### Funciones Modificadas:
- `createTimeEntry()` - Ahora incluye comentario
- `editTimeEntry()` - Recibe y muestra comentario
- `saveTimeEntry()` - Guarda comentario
- `displayTimeEntries()` - Muestra comentarios
- `openTaskDetails()` - Añade campo de comentario en el formulario

### Nuevos Elementos HTML (via JavaScript):
- `#newTimeComment` - Input para comentario al crear
- `#comment-edit-{id}` - Input para comentario al editar
- `.time-comment` - Div para mostrar comentario

## CSS ADICIONAL RECOMENDADO

Añadir al final del archivo index.html:

```css
.time-comment {
    margin-top: 10px;
    padding: 10px 15px;
    background: rgba(255, 209, 102, 0.15);
    border-left: 4px solid #FFD166;
    border-radius: 6px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.4;
}

.time-comment strong {
    color: #FFD166;
    margin-right: 5px;
}

.time-entry-item {
    margin-bottom: 15px;
    padding: 15px;
    background: rgba(47, 54, 64, 0.4);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.time-display {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.time-info {
    flex: 1;
}

.time-info > div {
    margin-bottom: 8px;
}

.time-edit .form-group {
    margin-bottom: 15px;
}

.time-edit label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
}

.time-edit input[type="text"] {
    width: 100%;
    padding: 10px;
    background: rgba(26, 27, 38, 0.6);
    border: 2px solid var(--secondary);
    border-radius: 8px;
    color: var(--text-light);
    font-size: 0.9rem;
}

.time-edit input[type="text"]::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.time-edit small {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
}
```
