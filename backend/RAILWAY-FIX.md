# ✅ Fix: Error "Unable to access jarfile target/backend-${VERSION}.jar"

## 🔴 Problema identificado

El despliegue en Railway estaba fallando con el error:
```
Error: Unable to access jarfile target/backend-${VERSION}.jar
```

### Causa raíz
El archivo `railway.json` tenía configuraciones inconsistentes:
1. **Builder incorrecto**: Usaba `NIXPACKS` en lugar de `DOCKERFILE`
2. **Variable no expandida**: El `startCommand` usaba `${VERSION}` que no se expandía
3. **Comando duplicado**: El Dockerfile ya define el `ENTRYPOINT`, no se necesita `startCommand`

## ✅ Solución aplicada

### 1. Corregido `railway.json`
**Antes:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "./mvnw clean package -DskipTests"
  },
  "deploy": {
    "startCommand": "java -Dspring.profiles.active=prod -jar target/backend-${VERSION}.jar",
    "healthcheckPath": "/actuator/health"
  }
}
```

**Después:**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/actuator/health/liveness",
    "healthcheckTimeout": 300
  }
}
```

### 2. Actualizado `Procfile`
**Antes:**
```
web: java -Dserver.port=$PORT -Dspring.profiles.active=prod -jar target/backend-*.jar
```

**Después:**
```
web: java -Dserver.port=$PORT -Dspring.profiles.active=railway -jar target/backend-*.jar
```

### 3. Configuración en Railway Dashboard

Si el error persiste después del deploy, verifica en Railway Dashboard:

1. Ve a tu servicio → **Settings** → **Deploy**
2. Busca **"Custom Start Command"**
3. Si hay algún comando ahí, **ELIMÍNALO** (debe estar vacío)
4. Railway debe usar el `ENTRYPOINT` del Dockerfile automáticamente

## 📋 Arquitectura de despliegue correcta

```
Railway Deploy Process:
├── 1. Build: Usa Dockerfile (multi-stage build)
│   ├── Stage 1: Compila con Maven (eclipse-temurin:21-jdk-alpine)
│   └── Stage 2: Runtime con JRE (eclipse-temurin:21-jre-alpine)
├── 2. Runtime: Ejecuta el ENTRYPOINT del Dockerfile
│   └── Comando: java $JAVA_OPTS -jar app.jar
└── 3. Health check: /actuator/health/liveness
```

## 🔍 Cómo verificar que funciona

1. **Deploy exitoso**: Railway debe mostrar "Deployed" sin errores
2. **Logs limpios**: No debe aparecer "Unable to access jarfile"
3. **Health check**: El endpoint `/actuator/health/liveness` debe responder 200 OK
4. **API funcionando**: Puedes acceder a `/swagger-ui.html` y `/api-docs`

## 🚀 Variables de entorno necesarias en Railway

Asegúrate de tener configuradas estas variables en Railway Dashboard:

```env
# Base de datos (provista automáticamente por Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Seguridad (temporal - cambiar en producción real)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password_seguro

# CORS (opcional - para apps móviles)
CORS_ALLOWED_ORIGINS=https://tudominio.com,capacitor://localhost

# Puerto (Railway lo asigna automáticamente)
PORT=8080
```

## ⚠️ Importante

- **NO uses `${VERSION}`** en comandos de Railway - esa variable no existe
- **NO definas `startCommand`** en `railway.json` si usas Dockerfile
- **USA el perfil `railway`** (no `prod`) para Railway deployments
- El Dockerfile ya tiene todo configurado correctamente

## 📚 Referencias

- Dockerfile: `backend/Dockerfile`
- Configuración Railway: `backend/railway.json` y `railway.toml`
- Perfil Spring Boot: `src/main/resources/application-railway.properties`
- Documentación oficial: [Railway Dockerfile deployment](https://docs.railway.app/guides/dockerfiles)

---
**Fecha de fix**: 22 de noviembre de 2025
**Versión del backend**: 1.0.0-SNAPSHOT
