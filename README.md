## crear entorno 
```
python3 -m venv .venv
```
- venv es el nombre del entorno
- .venv es el directorio donde va a guardar el entorno

## Activar entorno

Sistema Operativo,Comando de activación
Windows (PowerShell),.\.venv\Scripts\Activate.ps1
Windows (CMD),.\.venv\Scripts\activate.bat
macOS / Linux,source .venv/bin/activate

## Instalar requisitos
```
pip install -r requirements.txt
```
## Iniciar aplicación

- Si la base de datos no existe la crea. Se llama Inmotica-tasks.db, es del tipo sqlite.
- Si la base de datos existe usa su datos.
### Linux
```
chmod +x iniciar.sh
./iniciar.sh
```
### Windows
```
iniciar.bat
```
