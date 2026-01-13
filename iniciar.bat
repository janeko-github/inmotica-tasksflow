@echo off
echo ========================================
echo    Inmotica TaskFlow v2.0
echo    Sistema de Gestion de Tareas
echo    FastAPI + SQLite
echo ========================================
echo.

REM Verificar si Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado o no esta en el PATH
    echo Por favor instala Python 3.8 o superior desde python.org
    pause
    exit /b 1
)

echo [1/4] Verificando dependencias...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias de FastAPI...
    pip install -r requirements.txt
)

echo [2/4] Iniciando servidor backend (FastAPI)...
echo.
echo  API REST: http://localhost:5000
echo  Documentacion Swagger: http://localhost:5000/docs
echo  Documentacion ReDoc: http://localhost:5000/redoc
echo.

start /B python -m uvicorn app:app --host 0.0.0.0 --port 5000

echo [3/4] Esperando que el backend se inicie...
timeout /t 3 /nobreak >nul

echo [4/4] Abriendo aplicacion...
start http://localhost:8000/index.html

echo.
echo Iniciando servidor HTTP para frontend...
python -m http.server 8000

echo.
echo Para detener, presiona Ctrl+C
pause
