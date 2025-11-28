# Configuración Railway - Frontend Web

## Variables de Entorno

Las siguientes variables deben estar configuradas en Railway para el servicio `frontend-web`:

### Build-time Variables (Vite)
```env
VITE_API_URL_PROD=https://punto-de-venta-production-d424.up.railway.app/api
VITE_API_URL_STAGING=https://punto-de-venta-staging.up.railway.app/api
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=3
VITE_APP_ENV=production
```

### Runtime Variables
```env
PORT=8080
NODE_ENV=production
```

## URL del Backend en Railway

- **Backend Production**: `https://punto-de-venta-production-d424.up.railway.app`
- **API Base**: `https://punto-de-venta-production-d424.up.railway.app/api`

## Configuración en Railway

1. Ir a servicio `frontend-web`
2. Tab **Variables**
3. Añadir las variables listadas arriba
4. Guardar → Railway reconstruirá automáticamente

## Healthcheck

- Endpoint: `GET /health`
- Response: `200 OK`
- Usado por Railway para verificar que el servicio está listo

## Build

- Builder: Dockerfile
- Dockerfile path: `Dockerfile`
- Root directory: `frontend-web`
- Build command: `npm ci && npm run build`
- Start command: nginx sirve desde `dist/` en puerto 8080

Última actualización: 28/11/2025
