# 🚀 Despliegue Rápido en Railway

## Pasos Rápidos

### 1. Desplegar en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Clic en "New Project" → "Deploy from GitHub repo"
3. Selecciona el repositorio y la carpeta `frontend-web`
4. Railway detectará automáticamente `nixpacks.toml`

### 2. Configurar Variables de Entorno

En Railway, agrega estas variables:

```bash
VITE_API_URL_PROD=https://tu-backend.up.railway.app/api
VITE_APP_ENV=production
```

### 3. Obtener URL del Frontend

Después del primer deploy, Railway te dará una URL como:
```
https://punto-de-venta-frontend.up.railway.app
```

Guarda esta URL para configurar Electron.

### 4. Construir Electron

```bash
# Configurar la URL de Railway
export RAILWAY_FRONTEND_URL=https://tu-frontend.up.railway.app

# Construir Electron
npm run build:electron:prod
```

## ✅ Verificación

1. Visita la URL de Railway en tu navegador
2. Deberías ver la aplicación funcionando
3. Electron cargará automáticamente desde Railway

## 📚 Documentación Completa

Ver `RAILWAY-DEPLOYMENT.md` para detalles completos.

