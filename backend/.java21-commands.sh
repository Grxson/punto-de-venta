#!/bin/bash
# Comandos útiles para Java 21 - Punto de Venta Backend

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Java 21 LTS - Punto de Venta Backend Commands      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar versión de Java
echo -e "${GREEN}[1] Verificar versión de Java${NC}"
echo "    java -version"
echo ""

# Verificar Maven y Java
echo -e "${GREEN}[2] Verificar Maven y Java configurado${NC}"
echo "    ./mvnw --version"
echo ""

# Compilar proyecto
echo -e "${GREEN}[3] Compilar proyecto${NC}"
echo "    ./mvnw clean compile"
echo ""

# Ejecutar tests
echo -e "${GREEN}[4] Ejecutar tests${NC}"
echo "    ./mvnw test"
echo ""

# Crear package
echo -e "${GREEN}[5] Crear package (JAR)${NC}"
echo "    ./mvnw clean package"
echo "    ./mvnw clean package -DskipTests  # Sin ejecutar tests"
echo ""

# Ejecutar aplicación (desarrollo)
echo -e "${GREEN}[6] Ejecutar aplicación en modo desarrollo${NC}"
echo "    ./mvnw spring-boot:run"
echo "    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev"
echo ""

# Ejecutar JAR (producción)
echo -e "${GREEN}[7] Ejecutar JAR en producción${NC}"
echo "    java -jar target/backend-0.0.1-SNAPSHOT.jar"
echo "    java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod"
echo ""

# Ejecutar con optimizaciones Java 21
echo -e "${GREEN}[8] Ejecutar con optimizaciones Java 21 (ZGC + Virtual Threads)${NC}"
echo "    java -XX:+UseZGC -XX:+ZGenerational \\"
echo "         -Djdk.virtualThreadScheduler.parallelism=10 \\"
echo "         -Xms512m -Xmx2g \\"
echo "         -jar target/backend-0.0.1-SNAPSHOT.jar"
echo ""

# Habilitar características preview
echo -e "${GREEN}[9] Ejecutar con características preview habilitadas${NC}"
echo "    java --enable-preview -jar target/backend-0.0.1-SNAPSHOT.jar"
echo ""

# Ver información JVM
echo -e "${GREEN}[10] Ver información de la JVM${NC}"
echo "    java -XX:+PrintFlagsFinal -version | grep -i 'UseZGC\|VirtualThread'"
echo ""

# Limpiar proyecto
echo -e "${GREEN}[11] Limpiar proyecto${NC}"
echo "    ./mvnw clean"
echo ""

# Actualizar dependencias
echo -e "${GREEN}[12] Verificar actualizaciones de dependencias${NC}"
echo "    ./mvnw versions:display-dependency-updates"
echo "    ./mvnw versions:display-plugin-updates"
echo ""

# Generar documentación
echo -e "${GREEN}[13] Acceder a documentación Swagger${NC}"
echo "    Swagger UI: http://localhost:8080/swagger-ui.html"
echo "    OpenAPI JSON: http://localhost:8080/v3/api-docs"
echo ""

# Consola H2
echo -e "${GREEN}[14] Acceder a consola H2 (desarrollo)${NC}"
echo "    URL: http://localhost:8080/h2-console"
echo "    JDBC URL: jdbc:h2:mem:testdb"
echo "    Usuario: sa"
echo "    Contraseña: (vacío)"
echo ""

# Monitoreo con Actuator
echo -e "${GREEN}[15] Endpoints de Actuator${NC}"
echo "    Health: http://localhost:8080/actuator/health"
echo "    Info: http://localhost:8080/actuator/info"
echo "    Metrics: http://localhost:8080/actuator/metrics"
echo ""

# Docker (futuro)
echo -e "${YELLOW}[16] Comandos Docker (para implementación futura)${NC}"
echo "    docker build -t punto-venta-backend:java21 ."
echo "    docker run -p 8080:8080 punto-venta-backend:java21"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Para más información: backend/JAVA21-UPGRADE.md    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
