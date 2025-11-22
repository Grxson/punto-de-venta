# ✅ Fix: Error "Unable to access jarfile" y "Dockerfile does not exist"

## 🔴 Problemas identificados

### 1. Error: `Unable to access jarfile target/backend-${VERSION}.jar`
El despliegue en Railway estaba fallando con el error:
```
Error: Unable to access jarfile target/backend-${VERSION}.jar
```

### 2. Error: `Dockerfile 'Dockerfile' does not exist`
Railway no podía encontrar el Dockerfile porque:
- La configuración apuntaba a rutas relativas incorrectas
- El contexto de build no estaba correctamente configurado

### Causa raíz
1. **Builder incorrecto**: Usaba `NIXPACKS` en lugar de `DOCKERFILE`
2. **Variable no expandida**: El `startCommand` usaba `${VERSION}` que no se expandía
3. **Ruta incorrecta**: El Dockerfile estaba en `backend/Dockerfile` pero la config apuntaba a `Dockerfile`
4. **Contexto de build**: El Dockerfile usaba paths relativos desde `backend/` en lugar de desde la raíz

## ✅ Solución aplicada

### 1. Estructura de archivos corregida

```
punto-de-venta/
├── railway.json          ← Configuración principal (NUEVA)
├── railway.toml          ← Configuración alternativa
└── backend/
    ├── Dockerfile        ← Actualizado para build desde raíz
    ├── railway.json      ← Configuración local actualizada
    ├── Procfile          ← Actualizado
    └── src/
```

### 2. Corregido `railway.json` (RAÍZ del proyecto)

**Nuevo archivo en `/railway.json`:**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile",
    "watchPatterns": ["backend/**"]
  },
  "deploy": {
    "healthcheckPath": "/actuator/health/liveness",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### 3. Actualizado `Dockerfile`

El Dockerfile ahora usa paths relativos desde la **RAÍZ** del proyecto:

```dockerfile
# Build desde la RAÍZ del proyecto
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .
COPY backend/src src
```

### 4. Actualizado `backend/railway.json`

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"  ← Path desde raíz
  }
}
```

### 5. Actualizado `backend/Procfile`

```
web: java -Dserver.port=$PORT -Dspring.profiles.active=railway -jar target/backend-*.jar
```

## 🚀 Configuración en Railway Dashboard

### ⚠️ CONFIGURACIÓN CRÍTICA - Root Directory

**IMPORTANTE**: Railway debe usar `backend` como Root Directory

1. Ve a tu servicio en Railway
2. Settings → General
3. **Root Directory**: `backend` (ESTO ES CRÍTICO)
4. Save changes

### Paso 1: Verificar Build Settings
1. Settings → Build
2. **Builder**: DOCKERFILE
3. **Dockerfile Path**: `Dockerfile` (relativo a backend/)
4. Railway usará el contexto desde backend/

### Paso 2: Eliminar Custom Start Command
1. Settings → Deploy
2. **Custom Start Command**: Debe estar **VACÍO**
3. Railway usará el `ENTRYPOINT` del Dockerfile automáticamente

### Paso 3: Variables de entorno
Asegúrate de tener configuradas:
```env
DATABASE_URL=postgresql://...  (Railway lo provee automáticamente)
SPRING_PROFILES_ACTIVE=railway
PORT=8080  (Railway lo asigna automáticamente)
```

## 📋 Arquitectura correcta de despliegue

```
Railway Deploy Process:
├── 1. Root Directory: backend/
├── 2. Build: Dockerfile en backend/Dockerfile
│   ├── Context: Carpeta backend/
│   ├── Stage 1: Maven build (compila JAR)
│   └── Stage 2: Runtime JRE (ejecuta app.jar)
├── 3. Runtime: ENTRYPOINT del Dockerfile
│   └── java $JAVA_OPTS -jar app.jar
└── 4. Health check: /actuator/health/liveness
```

### Estructura de archivos:

```
punto-de-venta/
├── railway.json          ✅ Config (dockerfilePath: "Dockerfile")
├── railway.toml          ✅ Config (dockerfilePath: "Dockerfile")
└── backend/              ← Root Directory en Railway
    ├── Dockerfile        ✅ Paths relativos desde backend/
    ├── railway.json      ✅ Config local
    ├── mvnw              ✅ Se copia como './mvnw'
    ├── pom.xml           ✅ Se copia como './pom.xml'
    └── src/              ✅ Se copia como './src'
```

## 🔍 Cómo verificar que funciona

1. **Build exitoso**: Railway debe mostrar "Building..." y luego "Deployed"
2. **Logs de build**: Deberían mostrar:
   ```
   Building with Dockerfile backend/Dockerfile
   [+] Building...
   => [stage-0 1/7] FROM eclipse-temurin:21-jdk-alpine
   ```
3. **Logs de runtime**: Deberían mostrar:
   ```
   Started PuntoDeVentaBackendApplication in X.XXX seconds
   ```
4. **Health check**: `/actuator/health/liveness` debe responder 200 OK
5. **API funcionando**: `/swagger-ui.html` accesible

## 🧪 Probar localmente (opcional)

Para probar el Dockerfile localmente desde la raíz:

```bash
cd /ruta/a/punto-de-venta
docker build -f backend/Dockerfile -t punto-venta-backend .
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev punto-venta-backend
```

## ⚠️ Checklist antes de deployar

- [ ] **Root Directory** en Railway = `backend` (CRÍTICO)
- [ ] **Dockerfile Path** en Railway = `Dockerfile` (relativo)
- [ ] Dockerfile usa paths sin prefijo `backend/` (mvnw, .mvn, pom.xml, src)
- [ ] Custom Start Command está **vacío**
- [ ] Variables de entorno configuradas en Railway
- [ ] Perfil Spring Boot es `railway` (no `prod`)

## 📚 Archivos modificados

1. ✅ `/railway.json` - dockerfilePath: "Dockerfile"
2. ✅ `/railway.toml` - dockerfilePath: "Dockerfile"  
3. ✅ `/backend/Dockerfile` - Paths relativos desde backend/
4. ✅ `/backend/railway.json` - dockerfilePath: "Dockerfile"
5. ✅ `/backend/Procfile` - Perfil railway

## 🎯 Resultado esperado

Después de este fix:
- ✅ Railway encuentra el Dockerfile correctamente
- ✅ El build se ejecuta desde la raíz del proyecto
- ✅ No más errores de "Unable to access jarfile"
- ✅ Health checks pasan correctamente
- ✅ La aplicación inicia sin problemas

---
**Fecha de fix**: 22 de noviembre de 2025  
**Versión del backend**: 1.0.0-SNAPSHOT  
**Java**: 21 LTS  
**Spring Boot**: 3.5.7
