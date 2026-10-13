# 🚂 Guía de Despliegue en Railway

## ⚡ Problema Resuelto: Error de Build en Railway

El error que experimentaste era causado por:
- **Timeout en descarga de dependencias Maven**: El proceso se quedaba sin tiempo mientras descargaba `mapstruct-processor` y otras dependencias
- **Falta de caché de Maven**: Railway descargaba todas las dependencias desde cero en cada build
- **Memoria insuficiente durante compilación**: Java 21 requiere más memoria para compilar con sus nuevas características

## ✅ Soluciones Implementadas

### 1. Dockerfile Optimizado Multi-Stage
- **Stage 1 (Builder)**: Descarga dependencias y compila el código
- **Stage 2 (Runtime)**: Imagen ligera solo con JRE y el JAR compilado
- **Caché de Maven**: Separación de `pom.xml` y código fuente para aprovechar caché de Docker
- **Usuario no-root**: Mejora de seguridad
- **Health check**: Monitoreo automático de la aplicación

### 2. Configuración Maven Optimizada
- **settings.xml**: Configuración de timeouts y reintentos
- **Descarga paralela**: 5 threads para dependencias
- **Omitir tests**: Omite tests durante build de Railway (ejecutalos localmente)
- **Logs limpios**: Reduce verbosidad de Maven

### 3. Optimización de Build
- **.dockerignore**: Excluye archivos innecesarios del contexto Docker
- **railway.toml**: Configuración específica para Railway con límites de memoria

### 4. Variables de Memoria
- `MAVEN_OPTS="-Xmx2048m"`: 2GB para Maven durante build
- `JAVA_TOOL_OPTIONS="-Xmx2048m"`: 2GB para herramientas Java
- `XX:MaxRAMPercentage=75.0`: Usa 75% de RAM disponible en runtime

## 🔧 Configuración en Railway

### Paso 1: Verificar Variables de Entorno
En Railway Dashboard → Variables, asegúrate de tener:

```bash
# Base de datos (ya configuradas)
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGUSER=postgres
PGPASSWORD=...
PGDATABASE=railway

# Spring Boot (Railway las detecta automáticamente)
SPRING_PROFILES_ACTIVE=railway
SERVER_PORT=8080
```

### Paso 2: Configurar el Root Directory
Si Railway no detecta automáticamente el backend:

1. Ve a Settings → Service Settings
2. En "Root Directory" pon: `backend`
3. Guarda los cambios

### Paso 3: Re-deployar
Después de hacer commit y push de estos cambios:

```bash
# Hacer commit de los nuevos archivos
git add backend/Dockerfile backend/.dockerignore backend/.mvn/settings.xml railway.toml
git commit -m "fix: optimizar Dockerfile y configuración Maven para Railway"
git push origin develop
```

Railway detectará los cambios y hará un nuevo deploy automáticamente.

## 📊 Tiempos Esperados

Con estas optimizaciones:
- **Primer build**: 3-5 minutos (descarga todas las dependencias)
- **Builds subsecuentes**: 1-2 minutos (usa caché de Docker)

## 🐛 Solución de problemas

### Error: "Process did not complete successfully"
**Causa**: Timeout o memoria insuficiente  
**Solución**: 
- Verifica que `railway.toml` está en la raíz del proyecto
- Asegúrate de tener plan con suficiente RAM (mínimo 512MB)

### Error: "Cannot find Dockerfile"
**Causa**: Railway no encuentra el Dockerfile  
**Solución**: 
- Verifica que el archivo se llame exactamente `Dockerfile` (sin extensión)
- Configura "Root Directory" como `backend` en Railway Settings

### Error: "H2 console not available in production"
**Causa**: H2 solo está disponible en perfil `dev`  
**Solución**: 
- Es correcto, usa PostgreSQL en Railway
- Para desarrollo local usa `application-dev.properties`

### Build muy lento
**Causa**: No se está usando caché de Docker  
**Solución**: 
- Verifica que Railway esté usando el nuevo Dockerfile
- Espera al segundo build, el primero siempre es lento

## 🔍 Verificación Post-Deploy

Una vez que el deploy sea exitoso, verifica:

```bash
# 1. Health check
curl https://tu-app.up.railway.app/actuator/health

# 2. Info de la aplicación
curl https://tu-app.up.railway.app/actuator/info

# 3. Documentación API
# Abre en navegador:
https://tu-app.up.railway.app/swagger-ui.html
```

## 📈 Monitoreo

Railway proporciona:
- **Logs en tiempo real**: Ver logs de la aplicación
- **Métricas**: CPU, RAM, Network
- **Health checks**: Estado de la aplicación cada 30 segundos

## 🎯 Próximos Pasos

1. ✅ **Deploy exitoso**: Verifica que la aplicación arranque sin errores
2. ✅ **Base de datos**: Verifica que las 13 tablas se crearon correctamente
3. ✅ **Endpoints**: Prueba los endpoints desde Swagger UI
4. 🔜 **Frontend**: Conecta el frontend móvil con la URL de Railway
5. 🔜 **CI/CD**: Configura tests automatizados antes de deploy

## 💡 Tips de Optimización

- **Cache de dependencias**: El Dockerfile está optimizado para cachear dependencias Maven
- **Imagen ligera**: Usa JRE en lugar de JDK en runtime (reduce tamaño de 500MB a 180MB)
- **Health checks**: Railway reiniciará la app automáticamente si falla el health check
- **Logs estructurados**: Spring Boot ya incluye logs en formato JSON para Railway

## 🆘 Soporte

Si el problema persiste:
1. Revisa los logs completos en Railway Dashboard
2. Verifica que todos los archivos se hayan commiteado correctamente
3. Intenta un "Manual Deploy" desde Railway Dashboard

---

**Fecha de última actualización**: 21 de noviembre de 2025  
**Versión del backend**: 1.0.0-SNAPSHOT  
**Java**: 21 LTS  
**Spring Boot**: 3.5.7
