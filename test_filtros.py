#!/usr/bin/env python3
"""
Script de prueba para verificar filtros de estado en informes
"""

import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect('Inmotica-tasks.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("=" * 60)
print("VERIFICACIÓN DE FILTROS DE ESTADO")
print("=" * 60)

# 1. Ver todos los estados disponibles
print("\n1. Estados disponibles en la base de datos:")
print("-" * 60)
states = cursor.execute("SELECT DISTINCT status FROM tasks ORDER BY status").fetchall()
for state in states:
    count = cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = ?", (state['status'],)).fetchone()[0]
    print(f"   • {state['status']}: {count} tareas")

# 2. Probar query de rango con filtro de estado
print("\n2. Prueba de query por rango de tareas CON filtro de estado:")
print("-" * 60)
from_task = 1
to_task = 100
test_status = "En proceso"

query = '''
    SELECT t.task_number, t.name, t.status, u.name as user_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.task_number BETWEEN ? AND ?
'''
params = [from_task, to_task]

if test_status:
    query += ' AND t.status = ?'
    params.append(test_status)

query += ' ORDER BY t.task_number LIMIT 5'

print(f"Query: {query}")
print(f"Params: {params}")
print(f"\nResultados:")

results = cursor.execute(query, params).fetchall()
if results:
    for task in results:
        print(f"   • Tarea #{task['task_number']}: {task['name']} - Estado: {task['status']} - Usuario: {task['user_name']}")
else:
    print(f"   ⚠️  No se encontraron tareas con estado '{test_status}'")

# 3. Verificar cada estado
print("\n3. Conteo por estado (rango 1-100):")
print("-" * 60)
for state in states:
    query = '''
        SELECT COUNT(*) as count
        FROM tasks t
        WHERE t.task_number BETWEEN ? AND ?
        AND t.status = ?
    '''
    result = cursor.execute(query, (1, 100, state['status'])).fetchone()
    print(f"   • {state['status']}: {result['count']} tareas en el rango")

# 4. Probar query de pendientes
print("\n4. Prueba de query de tareas NO terminadas:")
print("-" * 60)
query = '''
    SELECT t.task_number, t.name, t.status
    FROM tasks t
    WHERE 1=1
'''
params = []

# Sin filtro de estado (comportamiento por defecto)
query_default = query + " AND t.status != 'Terminado'"
results = cursor.execute(query_default + " LIMIT 5", params).fetchall()
print(f"Sin filtro (excluye terminadas): {len(cursor.execute(query_default, params).fetchall())} tareas")
if results:
    for task in results[:3]:
        print(f"   • Tarea #{task['task_number']}: {task['status']}")

# Con filtro de estado específico
test_status = "Pendiente"
query_filtered = query + " AND t.status = ?"
results = cursor.execute(query_filtered, [test_status]).fetchall()
print(f"\nCon filtro '{test_status}': {len(results)} tareas")
if results:
    for task in results[:3]:
        print(f"   • Tarea #{task['task_number']}: {task['status']}")

conn.close()

print("\n" + "=" * 60)
print("✅ VERIFICACIÓN COMPLETADA")
print("=" * 60)
print("\nSi ves tareas en los resultados, el filtro está funcionando correctamente.")
print("Si no ves tareas, puede que no haya tareas con esos estados en tu BD.")
