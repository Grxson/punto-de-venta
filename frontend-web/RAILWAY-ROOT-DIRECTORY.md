# ⚠️ IMPORTANTE: Configuración de Root Directory en Railway

## Problema Detectado

Railway está detectando el proyecto como si fuera el backend cuando debería detectar el frontend-web.

## Solución

### Para el servicio del Frontend en Railway:

1. **Ve a Railway Dashboard** → Tu servicio del frontend
2. **Settings** → **Root Directory**
3. **Configura el Root Directory como**: `frontend-web`
4. **Guarda los cambios**

### Verificación

Después de configurar el Root Directory correctamente, Railway debería:
- ✅ Detectar `frontend-web/nixpacks.toml`
- ✅ Usar Node.js 22.21.1
- ✅ Ejecutar `npm ci` y `npm run build`
- ✅ Servir con Caddy desde `dist/`

### Si Railway sigue detectando el backend:

1. Verifica que el servicio del frontend tenga:
   - **Root Directory**: `frontend-web`
   - **Build Command**: (dejar vacío, usar nixpacks.toml)
   - **Start Command**: (dejar vacío, usar nixpacks.toml)

2. Si el problema persiste:
   - Elimina el servicio del frontend
   - Crea uno nuevo desde GitHub
   - **Asegúrate de seleccionar la carpeta `frontend-web` al crear el servicio**

## Variables de Entorno Necesarias

```bash
VITE_API_URL_PROD=https://tu-backend.up.railway.app/api
VITE_APP_ENV=production
```

## Nota

El error que viste (`root directory set as 'backend'`) indica que Railway está usando la configuración del backend en lugar del frontend. Esto se corrige configurando el Root Directory correctamente en Railway Dashboard.

