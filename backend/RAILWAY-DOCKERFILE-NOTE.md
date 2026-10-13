# ⚠️ Railway + Dockerfile: Configuración Correcta

## 🔴 Error Encontrado
```
Error: Unable to access jarfile target/backend-${VERSION}.jar
```

## 🔍 Causa Raíz
Cuando Railway usa `builder = "DOCKERFILE"` en `railway.toml` y **también** especificas un `startCommand`, Railway **ignora** el `ENTRYPOINT` del Dockerfile y ejecuta tu `startCommand` en su lugar.

### ❌ Configuración INCORRECTA
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "java -jar app.jar"  # ❌ Railway ejecuta esto en lugar del ENTRYPOINT
```

**Problema**: Railway ejecuta `java -jar app.jar` en el **directorio raíz del contenedor**, pero el Dockerfile establece `WORKDIR /app` y copia el JAR allí. El path es incorrecto.

### ✅ Configuración CORRECTA
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
# NO incluir startCommand cuando usas Dockerfile
healthcheckPath = "/actuator/health/liveness"
healthcheckTimeout = 300
```

**Solución**: Railway usa el `ENTRYPOINT` del Dockerfile:
```dockerfile
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## 📋 Regla General

| Builder | startCommand en railway.toml | Resultado |
|---------|------------------------------|-----------|
| `DOCKERFILE` | ❌ NO incluir | Railway usa ENTRYPOINT/CMD del Dockerfile |
| `NIXPACKS` o `PAKETO` | ✅ SI incluir | Railway necesita saber qué comando ejecutar |

## 🎯 Cuándo Usar Cada Opción

### Opción 1: Dockerfile (RECOMENDADO para Java 21)
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
# Sin startCommand - usa ENTRYPOINT del Dockerfile
healthcheckPath = "/actuator/health/liveness"
```

**Ventajas**:
- Control total sobre el build
- Cache de dependencias Maven optimizado
- Multi-stage builds para imágenes ligeras
- Configuración reproducible

### Opción 2: Buildpacks (Automático)
```toml
# No incluir [build]

[deploy]
startCommand = "java -jar target/*.jar"  # Necesario con buildpacks
```

**Ventajas**:
- Simple, Railway detecta Java automáticamente
- No necesitas mantener un Dockerfile

**Desventajas**:
- Sin control sobre optimizaciones
- Build más lento
- Puede fallar con Java 21

## 🚀 Nuestra Configuración Final

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
healthcheckPath = "/actuator/health/liveness"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5

[build.env]
MAVEN_OPTS = "-Xmx2048m -Dmaven.artifact.threads=5"
JAVA_TOOL_OPTIONS = "-Xmx2048m"

[deploy.env]
SPRING_PROFILES_ACTIVE = "railway"
JAVA_OPTS = "-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
```

## 📝 Notas Importantes

1. **Variables de entorno**: Se pasan correctamente tanto con Dockerfile como con startCommand
2. **JAVA_OPTS**: Se define en `[deploy.env]` y se usa en el Dockerfile con `$JAVA_OPTS`
3. **Health checks**: Railway los ejecuta independientemente del builder usado
4. **Working directory**: Con Dockerfile controlas el WORKDIR; sin él, Railway decide

## ✅ Verificación

Después del deploy, verifica en los logs de Railway:
```
✓ Starting Container
✓ java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dspring.profiles.active=railway -jar app.jar
✓ Started PuntoDeVentaBackendApplication
```

**NO** deberías ver:
```
❌ Error: Unable to access jarfile
❌ No such file or directory
```

---

**Lección aprendida**: Cuando uses `builder = "DOCKERFILE"`, **NO** incluyas `startCommand` en `railway.toml`. Deja que el Dockerfile maneje la ejecución.
