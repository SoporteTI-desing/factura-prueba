
# facturador-innvi

## Backend de firmado/timbrado (nuevo)

Para generar **NoCertificado / Certificado / Sello** y (opcionalmente) timbrar con un PAC, se agregó un backend en `backend/`.

### Windows (rápido)
1) Ejecuta `backend\setup_backend_windows.bat`
2) Edita `backend\.env` y coloca rutas de tu CSD `.cer` y tu `.pfx` (y su password)
3) Ejecuta:

```bat
cd backend
venv\Scripts\python server.py
