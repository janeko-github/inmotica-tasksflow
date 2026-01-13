#!/bin/bash

echo "========================================"
echo "   Inmotica TaskFlow v2.0"
echo "   Sistema de Gestión de Tareas"
echo "   FastAPI + SQLite"
echo "========================================"
echo ""

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 no está instalado"
    echo "Por favor instala Python 3.8 o superior"
    exit 1
fi

echo "[1/4] Verificando dependencias..."
if ! python3 -c "import fastapi" &> /dev/null; then
    echo "Instalando dependencias de FastAPI..."
    pip3 install -r requirements.txt
fi

echo "[2/4] Iniciando servidor backend (FastAPI)..."
python3 -m uvicorn app:app --host 0.0.0.0 --port 5000 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "[3/4] Esperando que el backend se inicie..."
sleep 3

echo "[4/4] Iniciando servidor frontend..."
echo ""
echo "✓ Aplicación: http://localhost:8000/index.html"
echo "✓ API REST: http://localhost:5000"
echo "✓ Swagger UI: http://localhost:5000/docs"
echo "✓ ReDoc: http://localhost:5000/redoc"
echo ""
echo "Para detener, presiona Ctrl+C"
echo ""

# Función de limpieza al salir
cleanup() {
    echo ""
    echo "Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Abrir navegador (opcional)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8000/index.html &> /dev/null
elif command -v open &> /dev/null; then
    open http://localhost:8000/index.html &> /dev/null
fi

# Iniciar servidor HTTP
python3 -m http.server 8000
