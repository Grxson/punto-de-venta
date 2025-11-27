# Dockerfile optimizado para Railway con Java 21 y cache de Maven
# Usa multi-stage build para reducir el tamaño de la imagen final
# IMPORTANTE: Railway ejecuta este Dockerfile con Root Directory = "backend"
# Railway config: Root Directory = "backend", dockerfilePath = "Dockerfile"

# ====================================
# Stage 1: Build con cache de Maven
# ====================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar solo archivos de configuración Maven primero (mejor cache)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dar permisos de ejecución al wrapper de Maven
RUN chmod +x mvnw

# Descargar dependencias (se cachea si pom.xml no cambia)
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente
COPY src src

# Compilar la aplicación con configuración de memoria para Railway
RUN MAVEN_OPTS="-Xmx2048m" ./mvnw clean package -DskipTests -B

# ====================================
# Stage 2: Runtime optimizado
# ====================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar el JAR compilado desde el stage anterior
COPY --from=builder /app/target/*.jar app.jar

# Variables de entorno para Railway / producción
# Nota: El perfil ya no se fija en JAVA_OPTS; se usa SPRING_PROFILES_ACTIVE para permitir override desde Railway.
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENV SERVER_PORT=8080
ENV SPRING_PROFILES_ACTIVE=railway

# Exponer puerto
EXPOSE 8080

# Health check - usar liveness endpoint específico de Spring Boot
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health/liveness || exit 1

# Ejecutar la aplicación con perfil y puerto explícitos (prioriza variables inyectadas por Railway)
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=$SERVER_PORT -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -jar app.jar"]
