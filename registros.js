// registros.js - Gestión de visualización de registros de tiempo

const API_URL = 'http://localhost:5000/api';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Establecer fechas por defecto (últimos 7 días)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    document.getElementById('filterToDate').valueAsDate = today;
    document.getElementById('filterFromDate').valueAsDate = weekAgo;
    
    loadUsers();
    loadTimeEntries();
});

// ==================== CARGAR USUARIOS ====================

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        
        const select = document.getElementById('filterUser');
        select.innerHTML = '<option value="">Todos los usuarios</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

// ==================== CARGAR REGISTROS ====================

async function loadTimeEntries() {
    const fromDate = document.getElementById('filterFromDate').value;
    const toDate = document.getElementById('filterToDate').value;
    
    if (!fromDate || !toDate) {
        alert('Por favor selecciona el rango de fechas');
        return;
    }
    
    if (new Date(fromDate) > new Date(toDate)) {
        alert('La fecha inicial debe ser anterior o igual a la fecha final');
        return;
    }
    
    const userId = document.getElementById('filterUser').value;
    const hasEnd = document.getElementById('filterHasEnd').value;
    const status = document.getElementById('filterTaskStatus').value;
    
    const loading = document.getElementById('loadingEntries');
    const container = document.getElementById('entriesContainer');
    const totalSection = document.getElementById('totalSection');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    totalSection.style.display = 'none';
    
    try {
        let url = `${API_URL}/timeentries/list?from_date=${fromDate}&to_date=${toDate}`;
        if (userId) url += `&user_id=${userId}`;
        if (hasEnd !== 'all') url += `&has_end=${hasEnd}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al cargar registros');
        }
        
        const entries = await response.json();
        
        document.getElementById('entriesCount').textContent = `${entries.length} registro${entries.length !== 1 ? 's' : ''}`;
        
        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">No se encontraron registros</div>
                    <div class="empty-state-hint">Intenta ajustar los filtros de búsqueda</div>
                </div>
            `;
        } else {
            let totalMinutes = 0;
            
            entries.forEach(entry => {
                const entryCard = createEntryCard(entry);
                container.appendChild(entryCard);
                
                // Calcular duración
                let duration = entry.duration_minutes;
                if (!duration && entry.start_time) {
                    const startDt = new Date(entry.start_time);
                    const endOfDay = new Date(startDt);
                    endOfDay.setHours(20, 0, 0, 0);
                    duration = Math.floor((endOfDay - startDt) / 60000);
                }
                if (duration) {
                    totalMinutes += duration;
                }
            });
            
            // Mostrar totales
            document.getElementById('totalMinutes').textContent = totalMinutes;
            document.getElementById('totalHours').textContent = (totalMinutes / 60).toFixed(2);
            totalSection.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error cargando registros:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-text">Error al cargar registros</div>
                <div class="empty-state-hint">${error.message}</div>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// ==================== CREAR TARJETA DE REGISTRO ====================

function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    
    // Marcar registros sin fin
    if (!entry.end_time) {
        card.classList.add('no-end');
    }
    
    // Calcular fecha/hora de fin
    let endTimeDisplay = '';
    let duration = entry.duration_minutes;
    
    if (entry.end_time) {
        endTimeDisplay = formatDateTime(entry.end_time);
    } else {
        const startDt = new Date(entry.start_time);
        const endOfDay = new Date(startDt);
        endOfDay.setHours(20, 0, 0, 0);
        endTimeDisplay = formatDateTime(endOfDay.toISOString());
        duration = Math.floor((endOfDay - startDt) / 60000);
    }
    
    // Estado de la tarea
    const statusClass = entry.task_status.toLowerCase().replace(' ', '');
    
    card.innerHTML = `
        <div class="entry-header">
            <span class="entry-id">#${entry.id}</span>
            <span class="status-badge ${statusClass}">${entry.task_status}</span>
        </div>
        
        <div class="entry-task">
            Tarea #${entry.task_number}: ${escapeHtml(entry.task_name)}
        </div>
        
        <div class="entry-details">
            <div class="entry-detail">
                <span class="entry-detail-label">⏰ Inicio</span>
                <span class="entry-detail-value">${formatDateTime(entry.start_time)}</span>
            </div>
            
            <div class="entry-detail">
                <span class="entry-detail-label">⏱️ Fin</span>
                <span class="entry-detail-value ${!entry.end_time ? 'no-end' : ''}">${endTimeDisplay}</span>
            </div>
            
            <div class="entry-detail">
                <span class="entry-detail-label">⏳ Duración</span>
                <span class="entry-detail-value">
                    <span class="duration-badge">
                        ${duration || 0} min (${((duration || 0) / 60).toFixed(2)} h)
                    </span>
                </span>
            </div>
            
            <div class="entry-detail">
                <span class="entry-detail-label">👤 Usuario</span>
                <span class="entry-detail-value">${escapeHtml(entry.user_name || 'N/A')}</span>
            </div>
        </div>
        
        ${entry.comment ? `
            <div class="entry-comment">
                <div class="entry-comment-label">💬 Comentario</div>
                <div class="entry-comment-text">${escapeHtml(entry.comment)}</div>
            </div>
        ` : ''}
    `;
    
    return card;
}

// ==================== EXPORTAR ====================

async function exportToExcel() {
    const fromDate = document.getElementById('filterFromDate').value;
    const toDate = document.getElementById('filterToDate').value;
    
    if (!fromDate || !toDate) {
        alert('Por favor selecciona el rango de fechas');
        return;
    }
    
    const userId = document.getElementById('filterUser').value;
    const hasEnd = document.getElementById('filterHasEnd').value;
    const status = document.getElementById('filterTaskStatus').value;
    
    try {
        let url = `${API_URL}/timeentries/export/excel?from_date=${fromDate}&to_date=${toDate}`;
        if (userId) url += `&user_id=${userId}`;
        if (hasEnd !== 'all') url += `&has_end=${hasEnd}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            // Nombre de archivo
            let filename = `registros_${fromDate}_a_${toDate}`;
            if (userId) filename += `_usuario${userId}`;
            if (hasEnd === 'yes') filename += '_finalizados';
            if (hasEnd === 'no') filename += '_sinFinalizar';
            if (status) filename += `_estado${status.replace(' ', '')}`;
            filename += '.xlsx';
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            
            alert('Archivo Excel generado exitosamente');
        } else {
            const errorData = await response.json();
            alert(errorData.detail || 'Error al generar Excel');
        }
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        alert('Error al exportar a Excel');
    }
}

async function exportToPDF() {
    const fromDate = document.getElementById('filterFromDate').value;
    const toDate = document.getElementById('filterToDate').value;
    
    if (!fromDate || !toDate) {
        alert('Por favor selecciona el rango de fechas');
        return;
    }
    
    const userId = document.getElementById('filterUser').value;
    const hasEnd = document.getElementById('filterHasEnd').value;
    const status = document.getElementById('filterTaskStatus').value;
    
    try {
        let url = `${API_URL}/timeentries/export/pdf?from_date=${fromDate}&to_date=${toDate}`;
        if (userId) url += `&user_id=${userId}`;
        if (hasEnd !== 'all') url += `&has_end=${hasEnd}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            // Nombre de archivo
            let filename = `registros_${fromDate}_a_${toDate}`;
            if (userId) filename += `_usuario${userId}`;
            if (hasEnd === 'yes') filename += '_finalizados';
            if (hasEnd === 'no') filename += '_sinFinalizar';
            if (status) filename += `_estado${status.replace(' ', '')}`;
            filename += '.pdf';
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            
            alert('Archivo PDF generado exitosamente');
        } else {
            const errorData = await response.json();
            alert(errorData.detail || 'Error al generar PDF');
        }
    } catch (error) {
        console.error('Error exportando a PDF:', error);
        alert('Error al exportar a PDF');
    }
}

// ==================== UTILIDADES ====================

function formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
