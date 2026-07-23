FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY . ./
RUN mvn clean package -DskipTests -q

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/backend-*.jar app.jar
ENV PORT=8080
EXPOSE 8080
CMD ["java", "-Dserver.port=${PORT}", "-Dspring.profiles.active=railway", "-jar", "app.jar"]
