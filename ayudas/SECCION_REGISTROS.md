# ⏱️ SECCIÓN DE GESTIÓN DE REGISTROS

## 🎯 Nueva Funcionalidad Implementada

Se ha añadido una **sección completa dedicada a la visualización y gestión de registros de tiempo**, accesible desde un botón en la navegación principal.

---

## ✨ Características Principales

### **Navegación:**
```
📋 Tareas  |  👥 Usuarios  |  ⏱️ REGISTROS (NUEVO)  |  📊 Informes
```

### **Página de Registros** (`registros.html`):
- Vista dedicada exclusivamente a registros de tiempo
- Diseño limpio y enfocado
- Filtros avanzados
- Visualización en tarjetas
- Exportación a Excel y PDF

---

## 🔍 Filtros Disponibles

### **1. Rango de Fechas** (Obligatorio)
```
📅 Desde Fecha: 2026-01-01
📅 Hasta Fecha: 2026-01-31
```
- Filtra por fecha de **inicio** del registro
- Ambas fechas son obligatorias
- Por defecto: últimos 7 días

### **2. Usuario** (Opcional)
```
👤 Usuario: [Todos los usuarios ▼]
```
- Ver registros de un usuario específico
- O de todos los usuarios

### **3. Estado de Fecha de Fin** (Opcional)
```
⏰ Fecha de Fin:
  • Todos
  • Con fecha fin (finalizados)
  • Sin fecha fin (en curso) ← Para detectar registros abiertos
```

### **4. Estado de Tarea** (Opcional)
```
🏷️ Estado de Tarea:
  • Todos los estados
  • Pendiente
  • En proceso
  • Estancado
  • Terminado
```

---

## 📊 Visualización de Registros

### **Tarjetas de Registro:**

Cada registro se muestra en una tarjeta con:

```
┌─────────────────────────────────────────────────────────────┐
│ #15                                          [En proceso]     │
│                                                               │
│ Tarea #5: Implementar sistema de login                       │
│                                                               │
│ ⏰ Inicio          ⏱️ Fin             ⏳ Duración            │
│ 15/01/26 09:00    15/01/26 11:30     150 min (2.50 h)       │
│                                                               │
│ 👤 Usuario                                                    │
│ Juan Pérez                                                    │
│                                                               │
│ 💬 Comentario                                                 │
│ Implementación del frontend con React y validación           │
└─────────────────────────────────────────────────────────────┘
```

### **Registros Sin Finalizar:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 BORDE ROJO - FONDO OSCURO                                 │
│                                                               │
│ #18                                          [En proceso]     │
│                                                               │
│ Tarea #7: Testing de componentes                             │
│                                                               │
│ ⏰ Inicio          ⏱️ Fin             ⏳ Duración            │
│ 15/01/26 14:00    15/01/26 20:00 *   360 min (6.00 h)       │
│                   ⬆️ ROJO + *                                 │
│                                                               │
│ 👤 Usuario                                                    │
│ María García                                                  │
└─────────────────────────────────────────────────────────────┘
```

**Características de registros sin fin:**
- ✅ Borde rojo en la tarjeta
- ✅ Fondo más oscuro
- ✅ Fecha fin en color rojo con asterisco (*)
- ✅ Duración calculada hasta las 20:00
- ✅ Fácilmente identificables

---

## 📈 Panel de Totales

Al final de la lista, se muestra un panel con:

```
┌─────────────────────────────────────────────────────────────┐
│  ⏱️ Duración Total:  1,450  minutos  (24.17 horas)          │
└─────────────────────────────────────────────────────────────┘
```

- Suma de todos los registros mostrados
- Incluye registros sin fin (calculados hasta 20:00)
- Conversión automática a horas

---

## 📥 Exportación

### **Botones Disponibles:**
```
🔄 Actualizar  |  📗 Exportar Excel  |  📕 Exportar PDF
```

### **Excel Generado:**
- Título y filtros aplicados
- Tabla con todos los registros
- Registros sin fin en ROJO con asterisco
- Total de duración al final
- Columnas: ID, Inicio, Fin, Duración, Tarea, Estado, Usuario, Comentario

### **PDF Generado:**
- Orientación horizontal (landscape)
- Misma información que Excel
- Formato profesional
- Nota al pie sobre el asterisco

### **Nombres de Archivo:**
```
registros_2026-01-01_a_2026-01-31.xlsx
registros_2026-01-01_a_2026-01-31_usuario3.xlsx
registros_2026-01-01_a_2026-01-31_sinFinalizar.xlsx
registros_2026-01-01_a_2026-01-31_estadoEnproceso.xlsx
```

---

## 🎯 Casos de Uso Principales

### **Caso 1: Control Diario**
```
Objetivo: Ver qué está sin cerrar al final del día
Filtros:
  - Desde/Hasta: Hoy
  - Usuario: Todos
  - Fecha Fin: Sin fecha fin
  
Resultado: Lista de registros abiertos que deben cerrarse
```

### **Caso 2: Reporte Semanal Personal**
```
Objetivo: Ver mi trabajo de la semana
Filtros:
  - Desde/Hasta: Lun-Vie
  - Usuario: Mi usuario
  - Fecha Fin: Todos
  
Resultado: Timeline completo de la semana
```

### **Caso 3: Auditoría de Proyecto**
```
Objetivo: Ver todo el trabajo en tareas en proceso
Filtros:
  - Desde/Hasta: Mes completo
  - Usuario: Todos
  - Estado Tarea: En proceso
  
Resultado: Todos los registros de tareas activas
```

### **Caso 4: Identificar Problemas**
```
Objetivo: Encontrar registros que no se cerraron
Filtros:
  - Desde/Hasta: Última semana
  - Usuario: Todos
  - Fecha Fin: Sin fecha fin
  
Resultado: Registros pendientes de cerrar (en rojo)
```

### **Caso 5: Facturación Mensual**
```
Objetivo: Base para cobrar horas del mes
Filtros:
  - Desde/Hasta: Mes completo
  - Usuario: Todos
  - Fecha Fin: Con fecha fin (solo finalizados)
  
Resultado: Registros completados para facturar
Acción: Exportar a Excel
```

---

## 🎨 Diseño Visual

### **Colores por Estado:**
- **Pendiente:** 🟠 Naranja
- **En proceso:** 🔵 Azul verdoso
- **Estancado:** 🔴 Rojo
- **Terminado:** 🟢 Verde

### **Indicadores Visuales:**
- Registros sin fin: Borde rojo + fondo oscuro
- Duración: Badge amarillo (#FFD166)
- Comentarios: Panel con borde amarillo
- Panel de totales: Fondo azul con borde amarillo

### **Responsive:**
- Desktop: Grid de múltiples columnas
- Tablet/Mobile: Una columna, fácil lectura

---

## 🔧 Detalles Técnicos

### **Backend - Endpoints Nuevos:**

#### 1. Listar Registros
```
GET /api/timeentries/list?from_date=2026-01-01&to_date=2026-01-31
                          &user_id=3
                          &has_end=no
                          &status=En proceso
```

#### 2. Exportar Excel
```
GET /api/timeentries/export/excel?[mismos parámetros]
```

#### 3. Exportar PDF
```
GET /api/timeentries/export/pdf?[mismos parámetros]
```

### **Frontend - Archivos:**

1. **registros.html** - Estructura de la página
2. **registros.js** - Lógica y funcionalidad
3. **styles.css** - Estilos (compartido con index.html)

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
    t.status as task_status,
    u.name as user_name
FROM time_entries te
JOIN tasks t ON te.task_id = t.id
LEFT JOIN users u ON t.user_id = u.id
WHERE DATE(te.start_time) >= ?
  AND DATE(te.start_time) <= ?
  AND t.user_id = ?              -- opcional
  AND te.end_time IS NULL        -- has_end=no
  AND t.status = ?               -- opcional
ORDER BY te.start_time DESC
```

---

## 🚀 Flujo de Trabajo Recomendado

### **Inicio del Día:**
1. Abrir sección Registros
2. Filtro: Ayer, Sin fecha fin
3. Cerrar registros que quedaron abiertos

### **Durante el Día:**
- Trabajar normalmente en sección Tareas
- Registrar tiempo como siempre

### **Fin del Día:**
1. Abrir sección Registros
2. Filtro: Hoy, Sin fecha fin
3. Revisar y cerrar registros del día
4. Verificar que no queden rojos

### **Fin de Semana:**
1. Filtro: Esta semana, Mi usuario
2. Revisar timeline completo
3. Exportar a PDF para reporte
4. Enviar a supervisor

### **Fin de Mes:**
1. Filtro: Mes completo, Con fecha fin
2. Exportar a Excel
3. Usar para facturación/nómina
4. Archivar como respaldo

---

## ⚠️ Alertas y Notificaciones

### **Registros Sin Cerrar:**
- Aparecen claramente en ROJO
- Fáciles de identificar visualmente
- Indican que necesitan atención

### **Antes de las 20:00:**
Si un registro no se cierra antes de las 20:00:
- Se calcula duración hasta 20:00
- Aparece marcado en rojo
- Debería cerrarse con hora real

### **Buenas Prácticas:**
1. ✅ Cerrar registros al terminar
2. ✅ Revisar diariamente registros rojos
3. ✅ No dejar registros abiertos por días
4. ✅ Usar comentarios descriptivos
5. ✅ Exportar semanalmente para respaldo

---

## 📋 Checklist de Verificación

Después de actualizar:

- [ ] Reiniciar servidor FastAPI
- [ ] Verificar que aparece botón "Registros" en navegación
- [ ] Clic en "Registros" → Abre nueva página
- [ ] Página muestra filtros correctamente
- [ ] Selector de usuario poblado
- [ ] Fechas por defecto: últimos 7 días
- [ ] Botón "Actualizar" carga registros
- [ ] Registros se muestran en tarjetas
- [ ] Registros sin fin aparecen en ROJO
- [ ] Panel de totales muestra suma correcta
- [ ] Exportar Excel → Descarga correctamente
- [ ] Abrir Excel → Formato correcto
- [ ] Exportar PDF → Descarga correctamente
- [ ] Abrir PDF → Formato horizontal correcto
- [ ] Filtro "Sin fecha fin" → Solo registros rojos
- [ ] Filtro por estado → Funciona correctamente

---

## 🆕 Archivos Nuevos

### **Backend:**
- ✅ `app.py` - 3 nuevos endpoints añadidos al final

### **Frontend:**
- ✅ `registros.html` - Página completa nueva
- ✅ `registros.js` - JavaScript dedicado
- ✅ `index.html` - Botón "Registros" añadido

### **Sin cambios:**
- ❌ `styles.css` - Se reutiliza el existente
- ❌ `app.js` - No necesita cambios

---

## 🔗 Integración con Sistema Existente

### **Desde Tareas → Registros:**
1. Ver una tarea
2. Ver sus registros de tiempo
3. Notar uno sin cerrar
4. Ir a sección Registros
5. Filtrar por esa tarea
6. Cerrar el registro

### **Desde Registros → Tareas:**
1. Ver un registro problemático
2. Anotar el #número de tarea
3. Volver a sección Tareas
4. Abrir esa tarea
5. Corregir el registro

### **Complemento con Informes:**
- **Informes:** Para análisis agregado
- **Registros:** Para control detallado diario

---

## 💡 Ventajas de Esta Sección

### **1. Control Diario Mejorado**
- ✅ Vista rápida de registros abiertos
- ✅ Identificación visual inmediata
- ✅ Fácil de revisar al final del día

### **2. Gestión Proactiva**
- ✅ Detectar problemas antes de que crezcan
- ✅ Cerrar registros a tiempo
- ✅ Mantener datos precisos

### **3. Flexibilidad**
- ✅ Múltiples filtros combinables
- ✅ Vista personalizada según necesidad
- ✅ Exportación lista para usar

### **4. Productividad**
- ✅ No navegar entre tareas para ver registros
- ✅ Vista consolidada de todo el trabajo
- ✅ Rápido para reportes

---

## 📊 Diferencias: Registros vs Informes

| Aspecto | Sección Registros | Informes de Registros |
|---------|-------------------|----------------------|
| **Propósito** | Ver en pantalla, gestión diaria | Generar archivo para archivar |
| **Interacción** | Filtros en vivo, actualización | Una vez generado, estático |
| **Frecuencia** | Uso diario/constante | Uso esporádico (fin de semana/mes) |
| **Formato** | Tarjetas visuales | Tabla en Excel/PDF |
| **Control** | Identificar problemas activos | Documentar trabajo completado |

**Ambos se complementan:**
- Registros: Control operativo diario
- Informes: Documentación y archivo

---

## ✨ Resultado Final

Ahora tienes un sistema completo de gestión de tiempo con:

1. **Sección Tareas** - Crear y gestionar tareas
2. **Sección Usuarios** - Administrar equipo
3. **Sección Registros** (NUEVO) - Control detallado de tiempo
4. **Sección Informes** - Análisis y documentación

**¡Sistema de gestión de tiempo completo y profesional!** ⏱️✅

---

## 🚀 Actualización

### **Pasos:**

1. **Reemplazar archivos:**
   ```bash
   cp app.py /proyecto/
   cp registros.html /proyecto/
   cp registros.js /proyecto/
   cp index.html /proyecto/
   ```

2. **Reiniciar servidor:**
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 5000
   ```

3. **Iniciar frontend:**
   ```bash
   python -m http.server 8000
   ```

4. **Probar:**
   - Abrir http://localhost:8000/index.html
   - Clic en "Registros"
   - Revisar filtros y visualización
   - Probar exportaciones

---

**¡Sección de Registros completamente implementada y lista para usar!** 🎉
