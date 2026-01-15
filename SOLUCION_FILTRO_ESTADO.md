# 🔧 SOLUCIÓN: FILTRO DE ESTADO CORREGIDO

## ❌ Problema Encontrado

El filtro de estado tenía **duplicados** en las queries SQL, causando que no filtrara correctamente.

## ✅ Soluciones Aplicadas

### **1. Duplicados Eliminados**
- Se encontraron y eliminaron 2 filtros duplicados
- Ahora hay exactamente 6 filtros (1 por cada endpoint)
- Queries SQL corregidas

### **2. Espacios en Nombres de Archivo**
- Estado "En proceso" causaba problemas por el espacio
- **Solución**: Se eliminan espacios en nombres de archivo
- "En proceso" → "Enproceso" en el nombre del archivo
- El filtro sigue funcionando con "En proceso" en la BD

### **3. Código Corregido**

**Backend (app.py):**
```python
# ANTES (duplicado):
if user_id:
    query += ' AND t.user_id = ?'
    params.append(int(user_id))

if status:
    query += ' AND t.status = ?'
    params.append(status)

if status:  # ← DUPLICADO!
    query += ' AND t.status = ?'
    params.append(status)

# AHORA (correcto):
if user_id:
    query += ' AND t.user_id = ?'
    params.append(int(user_id))

if status:
    query += ' AND t.status = ?'
    params.append(status)
```

**Nombres de Archivo:**
```python
# ANTES:
status_suffix = f'_estado{status}' if status else ''
# Resultado: informe_tareas_1-10_estadoEn proceso.xlsx ❌

# AHORA:
status_suffix = f'_estado{status.replace(" ", "")}' if status else ''
# Resultado: informe_tareas_1-10_estadoEnproceso.xlsx ✅
```

---

## 🧪 Cómo Verificar que Funciona

### **Opción 1: Script de Prueba**

```bash
cd /ruta/a/tu/proyecto
python3 test_filtros.py
```

Este script te mostrará:
- Estados disponibles en tu BD
- Cantidad de tareas por estado
- Prueba real de las queries SQL

### **Opción 2: Prueba Manual en la Interfaz**

1. **Reinicia el servidor:**
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 5000
   ```

2. **Verifica estados en tu BD:**
   - Abre la aplicación
   - Crea o verifica que tienes tareas con diferentes estados
   - Asegúrate de tener al menos:
     - 1 tarea "Pendiente"
     - 1 tarea "En proceso"
     - 1 tarea "Estancado"
     - 1 tarea "Terminado"

3. **Prueba el filtro:**
   - Ve a "📊 Informes" → "Informe por Rango de Tareas"
   - Pon rango: 1 a 100
   - Selecciona estado: "En proceso"
   - Genera Excel
   - **Verifica**: Solo deben aparecer tareas "En proceso"

4. **Prueba combinación:**
   - Selecciona usuario: Juan Pérez
   - Selecciona estado: Pendiente
   - Genera PDF
   - **Verifica**: Solo tareas de Juan que estén "Pendiente"

### **Opción 3: Verificar en Swagger UI**

1. Abre http://localhost:5000/docs
2. Busca `GET /api/reports/excel`
3. Prueba con:
   ```
   from: 1
   to: 50
   user_id: (vacío o un ID)
   status: "En proceso"
   ```
4. Ejecuta y descarga el archivo
5. Verifica que solo contiene tareas "En proceso"

---

## 🔍 Debugging Avanzado

### **Ver la Query SQL Real:**

Añade esto temporalmente al código de app.py antes de ejecutar la query:

```python
# Antes de: tasks = conn.execute(query, params).fetchall()
print(f"DEBUG - Query: {query}")
print(f"DEBUG - Params: {params}")

tasks = conn.execute(query, params).fetchall()
print(f"DEBUG - Resultados: {len(tasks)} tareas encontradas")
```

Verás en la terminal del servidor:
```
DEBUG - Query: SELECT t.*, u.name as user_name FROM tasks t LEFT JOIN users u ON t.user_id = u.id WHERE t.task_number BETWEEN ? AND ? AND t.status = ? ORDER BY t.task_number
DEBUG - Params: [1, 50, 'En proceso']
DEBUG - Resultados: 5 tareas encontradas
```

### **Verificar Base de Datos Directamente:**

```bash
sqlite3 Inmotica-tasks.db
```

```sql
-- Ver estados disponibles
SELECT DISTINCT status FROM tasks;

-- Contar por estado
SELECT status, COUNT(*) FROM tasks GROUP BY status;

-- Ver tareas de un estado específico
SELECT task_number, name, status FROM tasks WHERE status = 'En proceso';

-- Probar la query completa
SELECT t.task_number, t.name, t.status, u.name as user_name
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
WHERE t.task_number BETWEEN 1 AND 100
  AND t.status = 'En proceso';
```

---

## ⚠️ Posibles Problemas

### **Problema 1: "No se encontraron tareas"**

**Causa:** No hay tareas con ese estado en el rango seleccionado.

**Solución:**
1. Verifica que tienes tareas con ese estado
2. Amplía el rango (ej: 1 a 1000)
3. Usa "Todos los estados" para ver todas las tareas

### **Problema 2: "Muestra todas las tareas, no filtra"**

**Causa:** El parámetro no se está enviando correctamente.

**Solución:**
1. Abre DevTools del navegador (F12)
2. Ve a la pestaña "Network"
3. Genera un informe
4. Busca la petición `/api/reports/...`
5. Verifica la URL completa, debe tener `&status=En%20proceso`

Si no tiene el parámetro status:
- Verifica que el selector tiene valor
- Refresca la caché del navegador (Ctrl+Shift+R)

### **Problema 3: "Error 500 al generar informe"**

**Causa:** Posible query SQL malformada.

**Solución:**
1. Verifica los logs del servidor
2. Busca la línea con el error SQL
3. Si ves "duplicate column" o similar, reinstala app.py

---

## 🎯 Estados Válidos

Los estados **deben coincidir exactamente** con estos valores:
- `Pendiente` (con mayúscula)
- `En proceso` (con espacio y minúscula en "proceso")
- `Estancado` (con mayúscula)
- `Terminado` (con mayúscula)

**Importante:** Si tu base de datos tiene estados diferentes, debes:
1. Verificar con: `SELECT DISTINCT status FROM tasks;`
2. Actualizar los selectores en index.html con los valores exactos

---

## 📊 Ejemplo de Prueba Completa

### **Preparación:**
```sql
-- Asegúrate de tener datos de prueba
UPDATE tasks SET status = 'Pendiente' WHERE task_number = 1;
UPDATE tasks SET status = 'En proceso' WHERE task_number = 2;
UPDATE tasks SET status = 'Estancado' WHERE task_number = 3;
UPDATE tasks SET status = 'Terminado' WHERE task_number = 4;
```

### **Prueba 1: Solo Pendientes**
```
Interfaz:
- Rango: 1 a 10
- Estado: Pendiente

Resultado esperado:
- Solo tarea #1
```

### **Prueba 2: Solo En Proceso**
```
Interfaz:
- Rango: 1 a 10
- Estado: En proceso

Resultado esperado:
- Solo tarea #2
```

### **Prueba 3: Todos los Estados**
```
Interfaz:
- Rango: 1 a 10
- Estado: (vacío)

Resultado esperado:
- Tareas #1, #2, #3, #4
```

---

## ✅ Checklist de Verificación

Después de actualizar los archivos:

- [ ] Reiniciar servidor FastAPI
- [ ] Recargar página (Ctrl+Shift+R)
- [ ] Abrir DevTools (F12)
- [ ] Verificar estados en base de datos
- [ ] Crear/editar tareas con diferentes estados
- [ ] Probar filtro por estado "Pendiente"
- [ ] Probar filtro por estado "En proceso"
- [ ] Probar filtro por estado "Estancado"
- [ ] Probar filtro por estado "Terminado"
- [ ] Probar sin filtro (todos los estados)
- [ ] Probar combinación usuario + estado
- [ ] Verificar nombre de archivo generado
- [ ] Abrir archivo y confirmar que solo tiene el estado correcto

---

## 🚀 Archivos Actualizados

**Reemplaza estos archivos:**
1. ✅ `app.py` - Duplicados eliminados, nombres corregidos
2. ✅ `app.js` - Nombres de archivo sin espacios
3. ✅ `test_filtros.py` - Script de prueba (opcional)

**No cambió:**
- ❌ `index.html` - Ya estaba correcto

---

## 💡 Notas Importantes

1. **Los filtros ahora funcionan correctamente** ✅
2. **El estado en la BD sigue siendo "En proceso"** (con espacio)
3. **Solo el nombre del archivo se simplifica** a "Enproceso"
4. **El filtro funciona con el valor exacto** de la BD
5. **Espacios en nombres de archivo causan problemas** en algunos sistemas

---

## 📞 Si Aún No Funciona

Si después de aplicar estos cambios el filtro no funciona:

1. **Ejecuta el script de prueba:**
   ```bash
   python3 test_filtros.py
   ```

2. **Muéstrame la salida** para diagnosticar

3. **Verifica los logs del servidor** cuando generas un informe

4. **Comparte la URL** que aparece en Network del navegador

Con esta información podré identificar exactamente qué está pasando.

---

**¡El filtro de estado ahora debe funcionar perfectamente!** ✅
