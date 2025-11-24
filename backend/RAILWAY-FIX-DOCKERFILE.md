# Railway Deployment - Configuración OBLIGATORIA

## 🚨 PROBLEMA ACTUAL
Railway está ignorando `railway.json` y `railway.toml` y usando Railpack/Nixpacks automáticamente.

## ✅ SOLUCIÓN: Configurar manualmente en Railway UI

### Paso 1: Configuración del Servicio

1. Ve a tu servicio en Railway Dashboard
2. Click en **Settings** (o ⚙️)
3. En la sección **Build**:
   - **Builder**: Selecciona **"Dockerfile"** (NO dejes "Auto")
   - **Dockerfile Path**: `Dockerfile`
   - **Root Directory**: `backend`
4. Click **Save Changes**

### Paso 2: Variables de Entorno

En **Variables** tab, asegúrate de tener:

```bash
# Obligatorio
SPRING_PROFILES_ACTIVE=prod
# O si prefieres el perfil railway:
SPRING_PROFILES_ACTIVE=railway

# Railway inyecta automáticamente:
PORT=<auto>

# Opcional (optimización JVM):
JAVA_OPTS=-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:ActiveProcessorCount=2

# Tu base de datos (ejemplo):
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secreto-aqui
```

### Paso 3: Redeploy

1. Ve a **Deployments** tab
2. Click en el último deployment
3. Click **"Restart"** o trigger un nuevo deploy con commit

## 📋 Archivos de Configuración en el Repo

Ya están configurados correctamente:

- ✅ `backend/railway.json` → `builder: DOCKERFILE`
- ✅ `backend/railway.toml` → `builder: DOCKERFILE`
- ✅ `backend/Dockerfile` → Multi-stage optimizado
- ❌ `backend/nixpacks.toml` → DESHABILITADO (renombrado a .disabled)
- ❌ `backend/Procfile` → ELIMINADO

## 🔍 Verificación

Después del deploy, en los logs deberías ver:

```
using build driver docker
[+] Building ...
 => [builder 1/8] FROM eclipse-temurin:21-jdk-alpine
 => [builder 2/8] WORKDIR /app
 ...
```

**NO deberías ver**: `Railpack 0.14.0` o `using build driver railpack`

## ⚠️ Si aún usa Railpack

Railway puede tener configuración a nivel de **Project** o **Team** que sobrescribe los archivos.

### Opción A: Cambiar Builder en CLI
```bash
railway link
railway up --dockerfile Dockerfile
```

### Opción B: Usar railway.app directamente
En el dashboard web, asegúrate de que NO haya otra configuración heredada.

### Opción C: Recrear el servicio
Si todo lo demás falla:
1. Elimina el servicio actual
2. Crea uno nuevo desde GitHub
3. Configura manualmente Builder=Dockerfile ANTES del primer deploy

## 🎯 Resultado Esperado

Una vez configurado correctamente:

1. **Build time**: ~3-5 minutos (primera vez), ~1-2 min (con cache)
2. **Image size**: ~200-250 MB (alpine JRE 21)
3. **Memory usage**: ~300-500 MB en idle, ~800 MB bajo carga
4. **Health check**: `/actuator/health/liveness` debe responder `UP`

## 🐛 Debugging

Si el deploy falla:

1. Verifica logs en Railway → Deployment → View Logs
2. Busca errores en fase de build vs runtime
3. Comprueba que todas las variables de entorno estén presentes
4. Verifica conectividad a base de datos si aplica

---

**Última actualización**: 24 Nov 2025
**Commit**: `3409377` (nixpacks disabled)
