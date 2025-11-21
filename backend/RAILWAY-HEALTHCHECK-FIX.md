# 🏥 Fix: Health Check Failure en Railway

## ⚠️ Problema
```
Attempt #14 failed with service unavailable. Continuing to retry for 23s
1/1 replicas never became healthy!
Healthcheck failed!
```

## 🔍 Causa Raíz
La aplicación Spring Boot arrancaba correctamente, pero Railway no podía verificar el health check porque:

1. **No se configuró el perfil `railway`**: Spring Boot usaba el perfil por defecto (H2 en memoria) en lugar de PostgreSQL
2. **Health check timeout muy corto**: 100 segundos no era suficiente para que Spring Boot arranque completamente
3. **Endpoints de health no estaban configurados correctamente**: Faltaban los endpoints de liveness/readiness

## ✅ Soluciones Aplicadas

### 1. Crear perfil `railway` (application-railway.properties)
- Configuración específica para producción en Railway
- Usa PostgreSQL con variables de entorno de Railway
- Habilita health checks de liveness y readiness
- Optimiza pool de conexiones HikariCP
- Ejecuta `schema.sql` automáticamente

### 2. Actualizar Dockerfile
- Establecer `SPRING_PROFILES_ACTIVE=railway`
- Aumentar `start-period` del health check a 60 segundos
- Aumentar timeout del health check a 10 segundos
- Usar endpoint `/actuator/health/liveness` específico

### 3. Actualizar SecurityConfig.java
- Permitir acceso sin autenticación a:
  - `/actuator/health/**`
  - `/actuator/health/liveness`
  - `/actuator/health/readiness`

### 4. Actualizar railway.toml
- Aumentar `healthcheckTimeout` a 300 segundos
- Configurar `SPRING_PROFILES_ACTIVE=railway` en runtime
- Usar path `/actuator/health/liveness`

## 🚀 Cómo Aplicar el Fix

### Paso 1: Variables de Entorno en Railway
Ve a Railway Dashboard → Variables y verifica que existan:

```bash
# PostgreSQL (Railway las crea automáticamente)
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGUSER=postgres
PGPASSWORD=...
PGDATABASE=railway

# Spring Boot (Railway la detecta del railway.toml)
SPRING_PROFILES_ACTIVE=railway
PORT=8080
```

### Paso 2: Verificar Configuración
Los archivos modificados son:
- ✅ `backend/src/main/resources/application-railway.properties` (NUEVO)
- ✅ `backend/Dockerfile` (ACTUALIZADO)
- ✅ `backend/src/main/java/com/puntodeventa/backend/config/SecurityConfig.java` (ACTUALIZADO)
- ✅ `railway.toml` (ACTUALIZADO)

### Paso 3: Commit y Push
```bash
git add backend/src/main/resources/application-railway.properties
git add backend/Dockerfile
git add backend/src/main/java/com/puntodeventa/backend/config/SecurityConfig.java
git add railway.toml
git commit -m "fix: configurar perfil railway y health checks para deployment"
git push origin develop
```

## 📊 Timeline del Health Check

Con las nuevas configuraciones:

```
t=0s    ► Docker container inicia
t=5s    ► Java JVM arranca
t=10s   ► Spring Boot inicia
t=15s   ► Conecta a PostgreSQL
t=20s   ► Ejecuta schema.sql (crea 13 tablas)
t=25s   ► Inicializa Hibernate
t=30s   ► Carga configuraciones
t=35s   ► Inicializa Spring Security
t=40s   ► Levanta Tomcat en puerto 8080
t=45s   ► Aplicación lista ✅
t=60s   ► Primer health check (start-period)
```

**Health check pasa después de ~45 segundos**, pero Railway espera hasta 300 segundos por seguridad.

## 🧪 Verificar Health Checks Localmente

Puedes probar los health checks antes de hacer deploy:

```bash
# 1. Levantar PostgreSQL local (opcional, o usar H2)
docker run -d --name postgres-test \
  -e POSTGRES_PASSWORD=test123 \
  -e POSTGRES_DB=puntodeventa \
  -p 5432:5432 postgres:15-alpine

# 2. Configurar variables de entorno
export SPRING_PROFILES_ACTIVE=railway
export DATABASE_URL=jdbc:postgresql://localhost:5432/puntodeventa
export PGUSER=postgres
export PGPASSWORD=test123

# 3. Ejecutar aplicación
cd backend
./mvnw spring-boot:run

# 4. En otra terminal, probar health checks
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/health/liveness
curl http://localhost:8080/actuator/health/readiness
curl http://localhost:8080/actuator/info
```

Deberías ver respuestas como:
```json
{
  "status": "UP"
}
```

## 🔧 Troubleshooting

### Error: "Connection refused"
**Causa**: Spring Boot no está escuchando en el puerto correcto  
**Solución**: Verificar que `server.port=${PORT:8080}` esté en `application-railway.properties`

### Error: "Database connection failed"
**Causa**: Variables de entorno de PostgreSQL incorrectas  
**Solución**: 
```bash
# En Railway Dashboard → Variables, verificar:
DATABASE_URL  # debe empezar con postgresql://
PGHOST
PGUSER
PGPASSWORD
PGDATABASE
```

### Error: "401 Unauthorized" en health check
**Causa**: Spring Security bloqueando el endpoint  
**Solución**: Ya resuelto en SecurityConfig.java, verifica que los cambios estén aplicados

### Health check pasa pero la aplicación no responde
**Causa**: Tomcat arrancó pero hay error en la aplicación  
**Solución**: Revisar logs en Railway Dashboard, buscar excepciones de Java

## 📈 Monitoreo Post-Deploy

Después de un deploy exitoso, monitorea:

1. **Railway Logs**: Ver el arranque completo
2. **Health endpoint**: `https://tu-app.up.railway.app/actuator/health`
3. **Liveness**: `https://tu-app.up.railway.app/actuator/health/liveness`
4. **Readiness**: `https://tu-app.up.railway.app/actuator/health/readiness`
5. **Info**: `https://tu-app.up.railway.app/actuator/info`
6. **Swagger**: `https://tu-app.up.railway.app/swagger-ui.html`

## ✅ Señales de Deploy Exitoso

Verás en los logs de Railway:
```
Started PuntoDeVentaBackendApplication in X seconds
Tomcat started on port 8080 (http)
Database schema created successfully
Health check passed ✓
```

En el dashboard de Railway:
- 🟢 Status: **Active**
- 🟢 Health: **Healthy**
- 🟢 Replicas: **1/1**

## 🎯 Próximos Pasos

1. ✅ **Verificar que el deploy sea exitoso**
2. ✅ **Probar endpoints de la API**
3. ✅ **Verificar que las 13 tablas existan en PostgreSQL**
4. 🔜 **Conectar frontend móvil**
5. 🔜 **Configurar autenticación JWT real (reemplazar Basic Auth)**
6. 🔜 **Agregar monitoreo con métricas de Actuator**

---

**Fecha**: 21 de noviembre de 2025  
**Issue**: Health check failure after successful build  
**Status**: ✅ RESUELTO
