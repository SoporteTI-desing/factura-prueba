@echo off
cd /d %~dp0
if not exist venv (
  python -m venv venv
)
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy /Y .env.example .env >nul 2>&1
echo.
echo Backend listo. Edita backend\.env con rutas de tu CSD/PFX.
echo Luego ejecuta: venv\Scripts\python server.py
echo.
pause
