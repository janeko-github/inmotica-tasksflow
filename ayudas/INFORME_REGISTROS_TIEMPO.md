# ⏱️ INFORME DE REGISTROS DE TIEMPO

## 🎯 Nueva Funcionalidad Implementada

Se ha añadido un nuevo tipo de informe centrado en los **registros de tiempo individuales**, en lugar de agrupar por tareas.

---

## ✨ Características del Informe

### **Datos Mostrados:**
1. **Fecha/Hora Inicio** - Cuándo empezó el registro
2. **Fecha/Hora Fin** - Cuándo terminó (con manejo especial si no tiene fin)
3. **Duración** - Minutos trabajados
4. **Tarea** - Título de la tarea (#número: nombre)
5. **Usuario** - Quién trabajó
6. **Comentario** - Descripción del trabajo realizado

### **Filtros Disponibles:**
- 📅 **Desde Fecha** (obligatorio)
- 📅 **Hasta Fecha** (obligatorio)
- 👤 **Usuario** (opcional)

### **Ordenamiento:**
- Los registros se ordenan por **fecha/hora de inicio** (ascendente)

### **Total:**
- Al final se suma la **duración total** de todos los registros

---

## 🔴 Manejo Especial de Registros sin Fin

### **Problema:**
Algunos registros no tienen fecha/hora de fin (están "en progreso").

### **Solución Implementada:**

**Para cálculos:**
- Se asume que el trabajo terminó a las **20:00** del mismo día
- Se calcula la duración desde inicio hasta las 20:00

**Visualización:**

**Excel:**
```
Fecha/Hora Fin: 2026-01-15 20:00:00 *
                ^^^^^^^^^^^^^^^^^^^^^^^^
                Fondo ROJO, texto BLANCO, con asterisco
```

**PDF:**
```
Fecha/Hora Fin: 2026-01-15 20:00:00 *
                ^^^^^^^^^^^^^^^^^^^^^^^^
                Fondo ROJO, texto BLANCO, con asterisco
```

**Nota al pie:**
```
* Registros sin hora de fin: se calcula duración hasta las 20:00 del mismo día
```

---

## 📊 Ejemplo de Informe

### **Parámetros:**
```
Desde: 2026-01-10
Hasta: 2026-01-15
Usuario: Juan Pérez
```

### **Resultado (Excel/PDF):**

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                        INFORME DE REGISTROS DE TIEMPO                                  ║
║                           Periodo: 2026-01-10 a 2026-01-15                             ║
╠═══════════════╦═══════════════╦══════════╦══════════════════╦═══════════╦═════════════╣
║ Inicio        ║ Fin           ║ Duración ║ Tarea            ║ Usuario   ║ Comentario  ║
╠═══════════════╬═══════════════╬══════════╬══════════════════╬═══════════╬═════════════╣
║ 10/01 09:00   ║ 10/01 11:30   ║ 150 min  ║ #5: Login        ║ Juan      ║ Frontend    ║
║ 10/01 14:00   ║ 10/01 16:00   ║ 120 min  ║ #5: Login        ║ Juan      ║ Backend API ║
║ 11/01 09:30   ║ 11/01 20:00 * ║ 630 min  ║ #7: Dashboard    ║ Juan      ║ Diseño UI   ║
║               ║   ⬆️ ROJO ⬆️   ║          ║                  ║           ║             ║
║ 12/01 10:00   ║ 12/01 13:00   ║ 180 min  ║ #8: Testing      ║ Juan      ║ Unit tests  ║
╠═══════════════╩═══════════════╬══════════╬══════════════════╩═══════════╩═════════════╣
║                     TOTAL:    ║ 1080 min ║                                             ║
╚═══════════════════════════════╩══════════╩═════════════════════════════════════════════╝

* Registros sin hora de fin: se calcula duración hasta las 20:00 del mismo día
```

---

## 🎨 Formato Visual

### **Excel:**
- **Título:** Grande, centrado, color naranja
- **Encabezados:** Fondo azul (#4F5D75), texto blanco
- **Datos:** Fondo beige, alineados al centro
- **Fin sin registrar:** Fondo ROJO, texto BLANCO, asterisco
- **Total:** Fondo amarillo (#FFD166), negrita

### **PDF:**
- **Orientación:** Horizontal (landscape) para más espacio
- **Tabla:** Bordes grises, bien espaciada
- **Colores:** Mismos que Excel
- **Nota al pie:** Explicación del asterisco

---

## 🔧 Detalles Técnicos

### **Query SQL:**
```sql
SELECT 
    te.id,
    te.start_time,
    te.end_time,
    te.duration_minutes,
    te.comment,
    t.name as task_name,
    t.task_number,
    u.name as user_name,
    t.user_id
FROM time_entries te
JOIN tasks t ON te.task_id = t.id
LEFT JOIN users u ON t.user_id = u.id
WHERE DATE(te.start_time) >= ? 
  AND DATE(te.start_time) <= ?
  AND t.user_id = ?  -- opcional
ORDER BY te.start_time
```

### **Cálculo de Duración Sin Fin:**
```python
from datetime import datetime

start_dt = datetime.fromisoformat(entry['start_time'])
end_of_day = start_dt.replace(hour=20, minute=0, second=0)
duration_minutes = int((end_of_day - start_dt).total_seconds() / 60)
```

### **Formato de Fecha/Hora Fin Sin Registrar:**
```python
end_of_day.strftime('%Y-%m-%d %H:%M:%S') + ' *'
```

---

## 📂 Archivos Generados

### **Nombres:**
```
informe_registros_2026-01-10_a_2026-01-15.xlsx
informe_registros_2026-01-10_a_2026-01-15_usuario3.xlsx
informe_registros_2026-01-10_a_2026-01-15.pdf
informe_registros_2026-01-10_a_2026-01-15_usuario3.pdf
```

### **Contenido:**
- Una única tabla con todos los registros
- Ordenados cronológicamente
- Con totales al final

---

## 🎯 Casos de Uso

### **Caso 1: Reporte Semanal Personal**
```
Usuario: Juan Pérez
Periodo: Lunes a Viernes
Resultado: Ver exactamente en qué trabajó Juan toda la semana
```

### **Caso 2: Auditoría de Horas**
```
Usuario: Todos
Periodo: Mes completo
Resultado: Listado completo de todos los registros del mes
```

### **Caso 3: Facturación por Horas**
```
Usuario: Todos
Periodo: Por cliente/proyecto
Resultado: Base para facturar horas trabajadas
```

### **Caso 4: Control de Productividad**
```
Usuario: Específico
Periodo: Últimos 7 días
Resultado: Revisar si hay registros sin cerrar (fondo rojo)
```

### **Caso 5: Timesheet para Nómina**
```
Usuario: Cada empleado
Periodo: Quincena/Mes
Resultado: Registro detallado para procesar nómina
```

---

## 🚀 Cómo Usar

### **1. Acceder al Informe:**
```
Aplicación → 📊 Informes → ⏱️ Informe de Registros de Tiempo
```

### **2. Configurar Filtros:**
```
Desde Fecha: 2026-01-01
Hasta Fecha: 2026-01-31
Usuario: (opcional) Juan Pérez
```

### **3. Generar:**
```
Clic en: 📗 Generar Excel  o  📕 Generar PDF
```

### **4. Revisar:**
- Abrir archivo descargado
- Verificar registros
- Revisar celdas rojas (sin fin)
- Confirmar total de minutos

---

## ⚠️ Notas Importantes

### **Registros Sin Fin:**
1. **Aparecen con fondo ROJO** para destacarlos
2. **Tienen un asterisco (*)** al final
3. **Duración calculada hasta 20:00** del mismo día
4. **Deberían cerrarse** para tener datos precisos

### **Filtro de Fechas:**
- Se filtra por la **fecha de inicio** del registro
- Si un registro empezó el 15/01 y terminó el 16/01, aparece en el 15/01
- Ambas fechas (desde/hasta) son **obligatorias**

### **Usuario Opcional:**
- Vacío = Todos los usuarios
- Seleccionado = Solo ese usuario

### **Totales:**
- Suma **solo** los registros que tienen duración
- Incluye los registros sin fin (calculados hasta 20:00)

---

## 📊 Diferencias con Otros Informes

| Aspecto | Informe de Tareas | Informe de Registros |
|---------|-------------------|----------------------|
| **Agrupación** | Por tarea | Por registro individual |
| **Ordenamiento** | Por número de tarea | Por fecha/hora cronológica |
| **Detalle** | Resumen por tarea | Línea por cada registro |
| **Comentarios** | Dentro de cada tarea | Columna visible siempre |
| **Uso** | Ver estado de tareas | Ver timeline de trabajo |

---

## 🎁 Ventajas

### **1. Visibilidad Total**
- ✅ Ver exactamente qué se hizo cada día
- ✅ Cada registro es una línea
- ✅ Comentarios visibles inmediatamente

### **2. Auditoría Fácil**
- ✅ Registros sin cerrar en ROJO
- ✅ Timeline cronológico claro
- ✅ Totales automáticos

### **3. Facturación**
- ✅ Base para cobrar por horas
- ✅ Desglose detallado del trabajo
- ✅ Comentarios de qué se hizo

### **4. Control de Calidad**
- ✅ Identificar registros incompletos
- ✅ Verificar que todo esté registrado
- ✅ Asegurar precisión de datos

---

## 🔄 Flujo de Trabajo Típico

### **Diario:**
1. Al final del día, generar informe del día
2. Revisar registros rojos (sin cerrar)
3. Cerrar los registros pendientes

### **Semanal:**
1. Viernes por la tarde
2. Generar informe de la semana
3. Revisar que todo esté completo
4. Enviar a supervisor/cliente

### **Mensual:**
1. Fin de mes
2. Generar informe mensual
3. Usar para facturación
4. Archivar para auditoría

---

## 📋 Checklist de Verificación

Después de actualizar:

- [ ] Reiniciar servidor FastAPI
- [ ] Recargar página web
- [ ] Ver nuevo formulario "⏱️ Informe de Registros de Tiempo"
- [ ] Selector de usuario aparece poblado
- [ ] Seleccionar rango de fechas
- [ ] Generar Excel → Descargar correctamente
- [ ] Abrir Excel → Verificar formato
- [ ] Ver registros ordenados por fecha
- [ ] Verificar que registros sin fin tienen fondo ROJO
- [ ] Verificar asterisco en registros sin fin
- [ ] Generar PDF → Descargar correctamente
- [ ] Abrir PDF → Verificar tabla horizontal
- [ ] Verificar nota al pie sobre asterisco
- [ ] Verificar total de minutos correcto

---

## 🆕 Archivos Actualizados

- ✅ **app.py** - 2 nuevos endpoints de informes
- ✅ **app.js** - Función generateTimeEntriesReport()
- ✅ **index.html** - Formulario de informe de registros

---

## 🚀 Actualización

### **1. Reemplaza los archivos:**
```bash
cp app.py /tu/proyecto/
cp app.js /tu/proyecto/
cp index.html /tu/proyecto/
```

### **2. Reinicia el servidor:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 5000
```

### **3. Recarga el navegador:**
```
Ctrl + Shift + R
```

### **4. Prueba:**
- Abre la sección de informes
- Verás el nuevo formulario al final
- Genera un informe de prueba

---

## ✨ Ejemplo Real de Uso

### **Escenario:**
Empresa de desarrollo necesita facturar al cliente por horas trabajadas en enero.

### **Proceso:**
1. **Generar informe:**
   - Desde: 2026-01-01
   - Hasta: 2026-01-31
   - Usuario: Todos

2. **Revisar Excel generado:**
   ```
   150 registros de tiempo
   Total: 12,450 minutos = 207.5 horas
   5 registros sin cerrar (rojos) → cerrar antes de facturar
   ```

3. **Cerrar registros pendientes:**
   - Revisar cuáles tienen fondo rojo
   - Actualizar en la aplicación con hora real de fin

4. **Regenerar informe:**
   - Ya sin registros rojos
   - Total preciso: 12,320 minutos = 205.3 horas

5. **Facturar:**
   - 205.3 horas × $50/hora = $10,265
   - Adjuntar Excel como respaldo

---

**¡Informe de Registros de Tiempo completamente implementado!** ⏱️✅
