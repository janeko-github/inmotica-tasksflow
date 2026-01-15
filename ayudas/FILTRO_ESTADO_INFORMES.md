# 🏷️ FILTRO POR ESTADO EN INFORMES

## ✅ Funcionalidad Implementada

Ahora todos los informes permiten filtrar **por estado** además del filtro por usuario existente.

---

## 🎯 Cambios Realizados

### **Backend (app.py)**
- ✅ Parámetro `status` añadido a los 6 endpoints de informes
- ✅ Lógica de filtrado implementada en todas las queries SQL
- ✅ Nombres de archivo actualizados para incluir sufijo de estado

### **Frontend (app.js)**
- ✅ Lectura del selector de estado en las 3 funciones de generación
- ✅ Parámetro `status` enviado en las URLs
- ✅ Nombres de descarga con sufijo de estado

### **Interfaz (index.html)**
- ✅ Selectores de estado añadidos en los 3 formularios de informes
- ✅ Opciones claras para cada estado disponible

---

## 📊 Filtros Disponibles

### **1. Informe por Rango de Tareas**

**Filtros:**
- Desde Tarea Nº
- Hasta Tarea Nº  
- 🔍 Filtrar por Usuario
- 🏷️ **Filtrar por Estado** (NUEVO)

**Estados disponibles:**
- Todos los estados (sin filtro)
- Pendiente
- En proceso
- Estancado
- Terminado

**Ejemplo de uso:**
```
Rango: Tareas 1 a 50
Usuario: Juan Pérez
Estado: En proceso
→ Solo tareas 1-50 de Juan que estén "En proceso"
```

---

### **2. Informe por Rango de Fechas**

**Filtros:**
- Desde Fecha
- Hasta Fecha
- 🔍 Filtrar por Usuario
- 🏷️ **Filtrar por Estado** (NUEVO)

**Estados disponibles:**
- Todos los estados (sin filtro)
- Pendiente
- En proceso
- Estancado
- Terminado

**Ejemplo de uso:**
```
Fechas: 01/01/2026 a 31/01/2026
Usuario: Todos
Estado: Terminado
→ Todas las tareas terminadas en enero 2026
```

---

### **3. Informe de Tareas No Terminadas**

**Filtros:**
- 🔍 Filtrar por Usuario
- 🏷️ **Filtrar por Estado** (NUEVO)

**Estados disponibles:**
- **Todos excepto Terminadas** (por defecto) ← Comportamiento original
- Solo Pendiente
- Solo En proceso
- Solo Estancado
- Solo Terminado

**Ejemplo de uso:**
```
Usuario: Todos
Estado: Estancado
→ Solo tareas estancadas de todos los usuarios
```

**Nota:** Si no seleccionas estado, se mantiene el comportamiento original (excluye terminadas).

---

## 🔧 Detalles Técnicos

### **Queries SQL Actualizadas:**

#### Antes:
```sql
SELECT t.*, u.name as user_name
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
WHERE t.task_number BETWEEN ? AND ?
  AND t.user_id = ? -- opcional
ORDER BY t.task_number
```

#### Ahora:
```sql
SELECT t.*, u.name as user_name
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
WHERE t.task_number BETWEEN ? AND ?
  AND t.user_id = ? -- opcional
  AND t.status = ?  -- opcional, NUEVO
ORDER BY t.task_number
```

---

### **Nombres de Archivo Actualizados:**

#### Sin filtros:
```
informe_tareas_1-10.xlsx
```

#### Con filtro de usuario:
```
informe_tareas_1-10_usuario2.xlsx
```

#### Con filtro de estado:
```
informe_tareas_1-10_estadoEnproceso.xlsx
```

#### Con ambos filtros:
```
informe_tareas_1-10_usuario2_estadoPendiente.xlsx
```

---

## 🎨 Interfaz

### **Selectores Añadidos:**

Cada formulario de informe ahora tiene un selector adicional:

```html
<div class="form-group">
    <label>🏷️ Filtrar por Estado</label>
    <select id="reportTaskStatus">
        <option value="">Todos los estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="En proceso">En proceso</option>
        <option value="Estancado">Estancado</option>
        <option value="Terminado">Terminado</option>
    </select>
</div>
```

---

## 📋 Casos de Uso

### **Caso 1: Análisis de Productividad**
```
Informe: Por rango de fechas
Fechas: Último mes
Usuario: Todos
Estado: Terminado
→ Ver cuántas tareas se completaron el mes pasado
```

### **Caso 2: Identificar Cuellos de Botella**
```
Informe: Por rango de tareas
Rango: Tareas 1 a 100
Usuario: Todos
Estado: Estancado
→ Identificar qué tareas están bloqueadas
```

### **Caso 3: Carga de Trabajo Actual**
```
Informe: Pendientes
Usuario: Juan Pérez
Estado: En proceso
→ Ver en qué está trabajando Juan actualmente
```

### **Caso 4: Seguimiento de Sprint**
```
Informe: Por fechas
Fechas: Inicio y fin del sprint
Usuario: Todos
Estado: Todos
→ Informe completo del sprint
```

### **Caso 5: Tareas Atrasadas**
```
Informe: Pendientes
Usuario: Todos
Estado: Pendiente
→ Ver qué tareas aún no se han iniciado
```

---

## 🔄 Comportamiento Especial del Informe de Pendientes

### **Sin filtro de estado:**
```
WHERE t.status != 'Terminado'
```
Resultado: Pendiente + En proceso + Estancado

### **Con filtro de estado:**
```
WHERE t.status = 'Pendiente'  (o el estado seleccionado)
```
Resultado: Solo el estado específico

### **Lógica implementada:**
```python
if status:
    query += ' AND t.status = ?'
    params.append(status)
else:
    query += " AND t.status != 'Terminado'"
```

Esto permite:
- **Mantener el comportamiento original** si no seleccionas nada
- **Filtrar por estado específico** si lo necesitas (incluso "Terminado")

---

## 🎯 Endpoints de API

### **Parámetros Añadidos:**

Todos los endpoints ahora aceptan `status` como parámetro opcional:

```
GET /api/reports/excel?from=1&to=10&user_id=2&status=En proceso
GET /api/reports/pdf?from=1&to=10&status=Pendiente
GET /api/reports/date/excel?from=2026-01-01&to=2026-01-31&user_id=3&status=Terminado
GET /api/reports/date/pdf?from=2026-01-01&to=2026-01-31&status=Estancado
GET /api/reports/pending/excel?user_id=2&status=Pendiente
GET /api/reports/pending/pdf?status=En proceso
```

---

## ✅ Verificación

### **Probar en Swagger UI:**
1. Abre http://localhost:5000/docs
2. Busca cualquier endpoint de informes
3. Verás el nuevo parámetro `status` (string, optional)
4. Prueba con diferentes valores

### **Probar en la Aplicación:**
1. Abre http://localhost:8000/index.html
2. Ve a la sección "📊 Informes"
3. En cada formulario verás el selector "🏷️ Filtrar por Estado"
4. Prueba diferentes combinaciones:
   - Solo usuario
   - Solo estado
   - Ambos filtros
   - Sin filtros

---

## 📊 Ejemplos de Salida

### **Ejemplo 1: Tareas En Proceso de un Usuario**
```
Archivo: informe_tareas_1-50_usuario3_estadoEnproceso.xlsx

Contenido:
- Tarea #5: Implementar login (En proceso)
- Tarea #12: Diseñar dashboard (En proceso)
- Tarea #28: Testing unitario (En proceso)
```

### **Ejemplo 2: Tareas Terminadas del Mes**
```
Archivo: informe_fechas_2026-01-01_2026-01-31_estadoTerminado.pdf

Contenido:
- 45 tareas completadas en enero
- Desglose por usuario
- Registros de tiempo de cada una
```

### **Ejemplo 3: Tareas Estancadas**
```
Archivo: informe_tareas_pendientes_2026-01-15_estadoEstancado.xlsx

Contenido:
- Tarea #8: Bug crítico (Estancado)
- Tarea #15: Integración API (Estancado)
- Tarea #23: Optimización BD (Estancado)
```

---

## 🎁 Beneficios

### **1. Mayor Flexibilidad**
- ✅ Combina usuario + estado + rango/fechas
- ✅ Análisis más específicos
- ✅ Informes personalizados

### **2. Mejor Análisis**
- ✅ Identificar cuellos de botella
- ✅ Medir productividad por estado
- ✅ Detectar tareas atrasadas

### **3. Reportes Ejecutivos**
- ✅ Solo tareas completadas para reportes de éxito
- ✅ Solo tareas pendientes para planificación
- ✅ Solo estancadas para resolver bloqueos

### **4. Toma de Decisiones**
- ✅ Datos más específicos
- ✅ Información relevante
- ✅ Insights accionables

---

## 🚀 Actualización

Para usar esta funcionalidad:

1. **Reemplaza los archivos:**
   - `app.py` (backend con filtros de estado)
   - `app.js` (frontend con parámetros de estado)
   - `index.html` (interfaz con selectores)

2. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl+C)
   uvicorn app:app --reload --host 0.0.0.0 --port 5000
   ```

3. **Recarga la página:**
   ```
   Ctrl+F5 / Cmd+Shift+R
   ```

4. **¡Listo!** Los filtros de estado ya están disponibles

---

## 📝 Notas Importantes

1. **Retrocompatibilidad:** Los informes sin filtro de estado funcionan igual que antes
2. **Validación:** Los estados deben coincidir exactamente: "Pendiente", "En proceso", "Estancado", "Terminado"
3. **URL Encoding:** Los espacios en "En proceso" se codifican automáticamente
4. **Nombres de Archivo:** Los espacios en estados se eliminan del nombre del archivo

---

## ✨ Resultado Final

Ahora tienes un sistema de informes completo con:
- ✅ Filtro por rango de tareas/fechas
- ✅ Filtro por usuario
- ✅ **Filtro por estado** (NUEVO)
- ✅ Combinación de todos los filtros
- ✅ Nombres de archivo descriptivos
- ✅ Formatos Excel y PDF
- ✅ Documentación automática

**¡Informes ultra flexibles y potentes!** 🎊
