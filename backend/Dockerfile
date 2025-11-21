# Dockerfile optimizado para Railway con Java 21 y cache de Maven
# Usa multi-stage build para reducir el tamaño de la imagen final

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

# Compilar la aplicación (sin tests para ahorrar tiempo)
RUN ./mvnw clean package -DskipTests -B

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

# Variables de entorno para Railway
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENV SERVER_PORT=8080

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Ejecutar la aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
