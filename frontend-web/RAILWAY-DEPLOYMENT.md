# Guía de Despliegue del Frontend en Railway

Esta guía explica cómo desplegar el frontend web en Railway y configurar Electron para consumirlo.

## 📋 Requisitos Previos

1. Cuenta en [Railway](https://railway.app)
2. Git configurado
3. Node.js 20+ instalado localmente
4. Backend ya desplegado en Railway (para obtener la URL de la API)

## 🚀 Paso 1: Desplegar Frontend en Railway

### 1.1. Crear un nuevo proyecto en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio y selecciona la carpeta `frontend-web`

### 1.2. Configurar Variables de Entorno

En Railway, ve a tu servicio del frontend y configura las siguientes variables de entorno:

```bash
# URL del backend API (ajusta según tu URL de Railway)
VITE_API_URL_PROD=https://tu-backend.up.railway.app/api

# Ambiente de producción
VITE_APP_ENV=production

# URL del frontend (se configurará automáticamente después del primer deploy)
# Obtén esta URL después del primer deploy exitoso
RAILWAY_FRONTEND_URL=https://tu-frontend.up.railway.app
```

### 1.3. Configurar el Build

Railway detectará automáticamente el archivo `nixpacks.toml` y usará la configuración definida.

El proceso de build:
1. Instala Node.js 20.x
2. Ejecuta `npm ci` para instalar dependencias
3. Ejecuta `npm run build` para compilar el proyecto
4. Inicia el servidor con `vite preview` en el puerto asignado por Railway

### 1.4. Verificar el Deploy

Una vez completado el deploy:
1. Railway te proporcionará una URL pública (ej: `https://punto-de-venta-frontend.up.railway.app`)
2. Visita la URL en tu navegador para verificar que funciona
3. Actualiza la variable `RAILWAY_FRONTEND_URL` con esta URL

## 🖥️ Paso 2: Configurar Electron para Producción

### 2.1. Variables de Entorno para Electron

Antes de construir la aplicación Electron, configura las variables de entorno:

**Linux/macOS:**
```bash
export RAILWAY_FRONTEND_URL=https://tu-frontend.up.railway.app
export VITE_API_URL_PROD=https://tu-backend.up.railway.app/api
```

**Windows (PowerShell):**
```powershell
$env:RAILWAY_FRONTEND_URL="https://tu-frontend.up.railway.app"
$env:VITE_API_URL_PROD="https://tu-backend.up.railway.app/api"
```

### 2.2. Construir la Aplicación Electron

```bash
# Construir para Windows
npm run build:electron:prod

# Construir para Linux
npm run dist:linux

# Construir para todas las plataformas
npm run dist:all
```

Los ejecutables se generarán en la carpeta `release/`.

### 2.3. Cómo Funciona Electron en Producción

1. **En desarrollo**: Electron carga desde `http://localhost:5173` (Vite dev server)
2. **En producción**: Electron carga desde la URL de Railway configurada en `RAILWAY_FRONTEND_URL`
3. **Fallback**: Si Railway no está disponible, intenta cargar desde archivos locales (`dist/index.html`)

## 🔧 Configuración Avanzada

### Variables de Entorno Disponibles

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_URL_DEV` | URL del backend en desarrollo | `http://localhost:8080/api` |
| `VITE_API_URL_STAGING` | URL del backend en staging | `https://punto-de-venta-staging.up.railway.app/api` |
| `VITE_API_URL_PROD` | URL del backend en producción | `https://punto-de-venta-production.up.railway.app/api` |
| `VITE_APP_ENV` | Ambiente de la aplicación | `development` |
| `RAILWAY_FRONTEND_URL` | URL del frontend en Railway | `https://punto-de-venta-frontend.up.railway.app` |

### Configuración de CORS

Asegúrate de que tu backend en Railway tenga configurado CORS para permitir peticiones desde:
- El dominio de Railway del frontend
- `localhost` (para desarrollo local)

### Actualizar Electron después de cambios

Cada vez que actualices el frontend en Railway:

1. El frontend se actualiza automáticamente en Railway
2. Los usuarios de Electron verán los cambios automáticamente (no necesitan reinstalar)
3. Si cambias la URL de Railway, reconstruye Electron con la nueva URL

## 🐛 Solución de Problemas

### El frontend no carga en Railway

1. Verifica los logs en Railway Dashboard
2. Asegúrate de que `npm run build` se ejecuta correctamente
3. Verifica que el puerto `$PORT` está configurado correctamente

### Electron no puede conectarse a Railway

1. Verifica que `RAILWAY_FRONTEND_URL` está configurada correctamente
2. Verifica la conexión a internet
3. Revisa los logs de Electron (en desarrollo con DevTools)

### CORS errors

1. Verifica que el backend tiene configurado CORS para el dominio del frontend
2. Revisa la configuración en `CorsConfig.java` del backend

## 📝 Notas Importantes

- El frontend en Railway se actualiza automáticamente con cada push a la rama configurada
- Electron siempre carga la última versión del frontend desde Railway
- No es necesario reconstruir Electron para actualizaciones del frontend
- Solo reconstruye Electron si cambias la URL de Railway o la configuración de Electron

## 🔗 Enlaces Útiles

- [Railway Documentation](https://docs.railway.app)
- [Vite Preview Mode](https://vitejs.dev/guide/static-deploy.html#previewing-locally)
- [Electron Builder](https://www.electron.build/)

